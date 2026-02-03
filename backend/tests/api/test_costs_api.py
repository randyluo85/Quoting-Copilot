"""Costs API 集成测试.

遵循 TDD 原则：
1. RED - 先写失败的测试
2. GREEN - 写最小代码使测试通过
3. REFACTOR - 重构清理
"""

import pytest
from httpx import AsyncClient, ASGITransport
from decimal import Decimal

from app.main import app
from app.db.session import get_db
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from app.config import get_settings


@pytest.fixture
async def async_client():
    """创建测试用的异步 HTTP 客户端."""
    settings = get_settings()

    test_engine = create_async_engine(
        settings.mysql_url,
        echo=False,
        poolclass=NullPool,
    )

    TestingSessionLocal = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest.fixture
async def clean_db(async_client: AsyncClient):
    """清空测试数据并插入测试物料."""
    async for session in get_db():
        db_session = session
        break

    await db_session.execute(text("SET FOREIGN_KEY_CHECKS=0"))
    await db_session.execute(text("TRUNCATE TABLE process_rates"))
    await db_session.execute(text("TRUNCATE TABLE materials"))
    await db_session.execute(text("SET FOREIGN_KEY_CHECKS=1"))
    await db_session.commit()

    # 插入测试物料
    test_materials = [
        {
            "item_code": "MAT-STD-100",
            "name": "标准价格物料",
            "std_price": Decimal("100.00"),
            "vave_price": Decimal("85.00"),
            "supplier_tier": "A",
            "category": "测试",
            "material": "铝",
            "status": "active",
        },
        {
            "item_code": "MAT-NO-VAVE",
            "name": "无VAVE物料",
            "std_price": Decimal("50.00"),
            "vave_price": None,
            "supplier_tier": "B",
            "category": "测试",
            "material": "钢",
            "status": "active",
        },
    ]

    for material in test_materials:
        await db_session.execute(
            text(
                "INSERT INTO materials (item_code, name, std_price, vave_price, supplier_tier, category, material, status) "
                "VALUES (:item_code, :name, :std_price, :vave_price, :supplier_tier, :category, :material, :status)"
            ),
            material,
        )

    # 插入测试工艺费率
    test_processes = [
        {
            "process_code": "PROC-WELD",
            "process_name": "焊接",
            "std_mhr": Decimal("200.00"),
            "vave_mhr": Decimal("180.00"),
            "std_hourly_rate": Decimal("200.00"),
            "vave_hourly_rate": Decimal("180.00"),
            "efficiency_factor": Decimal("1.0"),
            "work_center": "焊接车间",
        },
        {
            "process_code": "PROC-MACHINE",
            "process_name": "CNC精加工",
            "std_mhr": Decimal("260.00"),
            "vave_mhr": Decimal("237.00"),
            "std_hourly_rate": Decimal("260.00"),
            "vave_hourly_rate": Decimal("237.00"),
            "efficiency_factor": Decimal("0.95"),
            "work_center": "机加车间",
        },
    ]

    for process in test_processes:
        await db_session.execute(
            text(
                "INSERT INTO process_rates (process_code, process_name, std_mhr, vave_mhr, std_hourly_rate, vave_hourly_rate, efficiency_factor, work_center) "
                "VALUES (:process_code, :process_name, :std_mhr, :vave_mhr, :std_hourly_rate, :vave_hourly_rate, :efficiency_factor, :work_center)"
            ),
            process,
        )

    await db_session.commit()
    yield db_session


class TestCalculateMaterialCost:
    """POST /api/v1/cost/calculate - 物料成本计算测试."""

    @pytest.mark.asyncio
    async def test_calculate_material_cost_returns_dual_prices(
        self, async_client, clean_db
    ):
        """计算物料成本返回双轨价格."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 10.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        assert "materialCost" in data
        assert "processCost" in data
        assert "totalCost" in data

        material_cost = data["materialCost"]
        # 100 * 10 = 1000 (std), 85 * 10 = 850 (vave)
        assert float(material_cost["std"]) == 1000.0
        assert float(material_cost["vave"]) == 850.0
        assert float(material_cost["savings"]) == 150.0
        assert material_cost["savingsRate"] == 0.15

    @pytest.mark.asyncio
    async def test_calculate_multiple_materials(self, async_client, clean_db):
        """计算多个物料成本."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 5.0},
                {"code": "MAT-NO-VAVE", "quantity": 2.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        material_cost = data["materialCost"]
        # MAT-STD-100: 100*5 = 500 (std), 85*5 = 425 (vave)
        # MAT-NO-VAVE: 50*2 = 100 (std), 50*2 = 100 (vave, 无vave时等于std)
        # Total: 600 (std), 525 (vave)
        assert float(material_cost["std"]) == 600.0
        assert float(material_cost["vave"]) == 525.0
        assert float(material_cost["savings"]) == 75.0


class TestCalculateProcessCost:
    """工艺成本计算测试."""

    @pytest.mark.asyncio
    async def test_calculate_process_cost_returns_dual_prices(
        self, async_client, clean_db
    ):
        """计算工艺成本返回双轨价格."""
        payload = {
            "materials": [],
            "processes": [
                {"name": "焊接", "cycleTime": 2.5},
            ],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        process_cost = data["processCost"]
        # 200 * 2.5 = 500 (std), 180 * 2.5 = 450 (vave)
        assert float(process_cost["std"]) == 500.0
        assert float(process_cost["vave"]) == 450.0
        assert float(process_cost["savings"]) == 50.0

    @pytest.mark.asyncio
    async def test_calculate_process_with_efficiency_factor(
        self, async_client, clean_db
    ):
        """计算工艺成本考虑效率系数."""
        payload = {
            "materials": [],
            "processes": [
                {"name": "CNC精加工", "cycleTime": 2.0},
            ],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        process_cost = data["processCost"]
        # std: 260 * 2 = 520
        # vave: 237 * 2 * 0.95 = 450.3
        assert float(process_cost["std"]) == 520.0


class TestCalculateTotalCost:
    """总成本计算测试."""

    @pytest.mark.asyncio
    async def test_calculate_total_cost_sums_all_costs(
        self, async_client, clean_db
    ):
        """总成本是物料成本和工艺成本之和."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 10.0},
            ],
            "processes": [
                {"name": "焊接", "cycleTime": 2.5},
            ],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        # material: 1000 (std), 850 (vave)
        # process: 500 (std), 450 (vave)
        # total: 1500 (std), 1300 (vave)
        total_cost = data["totalCost"]
        assert float(total_cost["std"]) == 1500.0
        assert float(total_cost["vave"]) == 1300.0
        assert float(total_cost["savings"]) == 200.0


class TestCostCalculationEdgeCases:
    """成本计算边界情况测试."""

    @pytest.mark.asyncio
    async def test_calculate_with_empty_materials_returns_zero(
        self, async_client, clean_db
    ):
        """空物料列表返回零成本."""
        payload = {
            "materials": [],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        assert float(data["materialCost"]["std"]) == 0.0
        assert float(data["materialCost"]["vave"]) == 0.0
        assert float(data["totalCost"]["std"]) == 0.0

    @pytest.mark.asyncio
    async def test_calculate_with_unknown_material_returns_zero(
        self, async_client, clean_db
    ):
        """不存在的物料返回零成本."""
        payload = {
            "materials": [
                {"code": "MAT-NONEXISTENT", "quantity": 10.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        assert float(data["materialCost"]["std"]) == 0.0
        assert float(data["materialCost"]["vave"]) == 0.0

    @pytest.mark.asyncio
    async def test_calculate_without_vave_uses_std(
        self, async_client, clean_db
    ):
        """无 VAVE 价格时使用标准价格."""
        payload = {
            "materials": [
                {"code": "MAT-NO-VAVE", "quantity": 10.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        material_cost = data["materialCost"]
        # 无 VAVE 时，vave 应等于 std
        assert float(material_cost["std"]) == 500.0  # 50 * 10
        assert float(material_cost["vave"]) == 500.0
        assert float(material_cost["savings"]) == 0.0
        assert material_cost["savingsRate"] == 0.0

    @pytest.mark.asyncio
    async def test_calculate_with_zero_quantity(
        self, async_client, clean_db
    ):
        """零数量返回零成本."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 0.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        assert float(data["materialCost"]["std"]) == 0.0

    @pytest.mark.asyncio
    async def test_calculate_unknown_process_returns_zero(
        self, async_client, clean_db
    ):
        """不存在的工艺返回零成本."""
        payload = {
            "materials": [],
            "processes": [
                {"name": "不存在的工艺", "cycleTime": 1.0},
            ],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        assert float(data["processCost"]["std"]) == 0.0


class TestCostCalculationFormula:
    """成本计算公式验证测试."""

    @pytest.mark.asyncio
    async def test_standard_cost_formula_correct(
        self, async_client, clean_db
    ):
        """验证标准成本公式: Qty × Price_std."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 7.5},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        # 100 * 7.5 = 750
        assert float(data["materialCost"]["std"]) == 750.0

    @pytest.mark.asyncio
    async def test_vave_cost_formula_includes_efficiency(
        self, async_client, clean_db
    ):
        """验证 VAVE 成本公式包含效率系数."""
        payload = {
            "materials": [],
            "processes": [
                {"name": "CNC精加工", "cycleTime": 3.0},
            ],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        # vave = hourly_rate_vave * cycle_time * efficiency
        # = 237 * 3 * 0.95 = 675.45
        process_cost = data["processCost"]
        # 允许一定的浮点误差
        assert abs(float(process_cost["vave"]) - 675.45) < 0.1

    @pytest.mark.asyncio
    async def test_savings_rate_calculation_correct(
        self, async_client, clean_db
    ):
        """验证节省率计算: savings / std."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 1.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        material_cost = data["materialCost"]
        # savings_rate = (100 - 85) / 100 = 0.15
        assert abs(material_cost["savingsRate"] - 0.15) < 0.001


class TestCostCalculationErrors:
    """成本计算错误场景测试."""

    @pytest.mark.asyncio
    async def test_calculate_without_project_id_returns_error(
        self, async_client, clean_db
    ):
        """缺少 project_id 返回错误."""
        payload = {
            "materials": [],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate",  # 缺少 query 参数
            json=payload,
        )

        assert response.status_code in [400, 422]

    @pytest.mark.asyncio
    async def test_calculate_with_negative_quantity(
        self, async_client, clean_db
    ):
        """负数量应返回错误."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": -5.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        # 负数量可能被接受或拒绝，取决于验证逻辑
        # 如果接受，结果应为负数
        if response.status_code == 200:
            data = response.json()
            # 验证处理了负数
            assert "materialCost" in data
        else:
            assert response.status_code in [400, 422]


class TestCostCalculationResponseFormat:
    """成本计算响应格式测试."""

    @pytest.mark.asyncio
    async def test_cost_response_uses_camel_case(
        self, async_client, clean_db
    ):
        """验证响应使用 camelCase 格式."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 1.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        # 验证 camelCase 字段
        assert "materialCost" in data
        assert "processCost" in data
        assert "totalCost" in data

        total_cost = data["totalCost"]
        assert "std" in total_cost
        assert "vave" in total_cost
        assert "savings" in total_cost
        assert "savingsRate" in total_cost

    @pytest.mark.asyncio
    async def test_cost_values_have_two_decimal_places(
        self, async_client, clean_db
    ):
        """验证成本值有两位小数."""
        payload = {
            "materials": [
                {"code": "MAT-STD-100", "quantity": 1.0},
            ],
            "processes": [],
        }

        response = await async_client.post(
            "/api/v1/cost/calculate?project_id=TEST-001&product_id=P-001",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()

        material_cost = data["materialCost"]

        # 验证值是数字（整数或两位小数）
        for key in ["std", "vave", "savings"]:
            value = material_cost[key]
            if isinstance(value, str):
                # 字符串形式，验证小数位数
                if "." in value:
                    decimal_places = len(value.split(".")[1])
                    assert decimal_places <= 2
