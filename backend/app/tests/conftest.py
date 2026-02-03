"""测试配置和 fixtures."""

import pytest
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from io import BytesIO
from openpyxl import Workbook

from app.config import get_settings
from app.main import app
from app.db.session import get_db
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.schemas.common import PricePair


@pytest.fixture
async def test_client():
    """创建测试用的 HTTP 客户端.

    使用 NullPool 避免连接池与事件循环的冲突问题.
    """
    settings = get_settings()

    # 创建测试专用引擎（使用 NullPool）
    test_engine = create_async_engine(
        settings.mysql_url,
        echo=False,
        poolclass=NullPool,  # 不使用连接池，避免事件循环冲突
    )

    # 创建会话工厂
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

    # 清理
    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest.fixture
async def db_session(test_client):
    """获取数据库会话用于测试."""
    from app.db.session import get_db

    async for session in get_db():
        yield session
        break


@pytest.fixture
async def clean_db(db_session: AsyncSession):
    """清空所有测试数据后的数据库会话."""
    # 清理所有表数据（按依赖关系排序）
    await db_session.execute(text("SET FOREIGN_KEY_CHECKS=0"))
    # Business Case 相关
    await db_session.execute(text("TRUNCATE TABLE business_case_years"))
    await db_session.execute(text("TRUNCATE TABLE business_case_params"))
    # 投资相关
    await db_session.execute(text("TRUNCATE TABLE amortization_strategies"))
    await db_session.execute(text("TRUNCATE TABLE investment_items"))
    # 报价相关
    await db_session.execute(text("TRUNCATE TABLE quote_summaries"))
    await db_session.execute(text("TRUNCATE TABLE product_processes"))
    await db_session.execute(text("TRUNCATE TABLE product_materials"))
    await db_session.execute(text("TRUNCATE TABLE project_products"))
    # 项目和主数据
    await db_session.execute(text("TRUNCATE TABLE projects"))
    await db_session.execute(text("TRUNCATE TABLE process_rates"))
    await db_session.execute(text("TRUNCATE TABLE materials"))
    await db_session.execute(text("TRUNCATE TABLE cost_centers"))
    await db_session.execute(text("SET FOREIGN_KEY_CHECKS=1"))
    await db_session.commit()
    yield db_session


@pytest.fixture
def price_pair_factory():
    """PricePair 工厂函数."""

    def _create(
        std: float = 100.0, vave: float | None = None
    ) -> PricePair:
        """创建 PricePair 实例.

        Args:
            std: 标准价格
            vave: VAVE 价格，如果为 None 则等于 std
        """
        if vave is None:
            vave = std
        std_decimal = Decimal(str(std))
        vave_decimal = Decimal(str(vave))
        savings = std_decimal - vave_decimal
        savings_rate = float(savings / std_decimal) if std_decimal > 0 else 0.0

        return PricePair(
            std=std_decimal.quantize(Decimal("0.01")),
            vave=vave_decimal.quantize(Decimal("0.01")),
            savings=savings.quantize(Decimal("0.01")),
            savings_rate=round(savings_rate, 4),
        )

    return _create


@pytest.fixture
async def material_with_dual_price(clean_db: AsyncSession):
    """带双轨价格的测试物料 (std=100, vave=85)."""
    material = Material(
        item_code="MAT-TEST-DUAL",
        name="双轨价格测试物料",
        std_price=Decimal("100.00"),
        vave_price=Decimal("85.00"),
        supplier_tier="A",
        category="测试",
        material="铝合金",
        status="active",
    )
    clean_db.add(material)
    await clean_db.commit()
    await clean_db.refresh(material)
    return material


@pytest.fixture
async def material_without_vave(clean_db: AsyncSession):
    """无 VAVE 价格的测试物料."""
    material = Material(
        item_code="MAT-TEST-NO-VAVE",
        name="无 VAVE 价格物料",
        std_price=Decimal("100.00"),
        vave_price=None,
        supplier_tier="B",
        category="测试",
        material="不锈钢",
        status="active",
    )
    clean_db.add(material)
    await clean_db.commit()
    await clean_db.refresh(material)
    return material


@pytest.fixture
async def material_zero_price(clean_db: AsyncSession):
    """零价格物料（用于测试边界情况）."""
    material = Material(
        item_code="MAT-TEST-ZERO",
        name="零价格物料",
        std_price=Decimal("0.00"),
        vave_price=Decimal("0.00"),
        supplier_tier="C",
        category="测试",
        material="未知",
        status="active",
    )
    clean_db.add(material)
    await clean_db.commit()
    await clean_db.refresh(material)
    return material


@pytest.fixture
async def process_rate_with_dual_rate(clean_db: AsyncSession):
    """带双轨费率的测试工序."""
    rate = ProcessRate(
        process_code="PROC-TEST-DUAL",
        process_name="双轨费率测试工序",
        std_mhr_var=Decimal("200.00"),
        std_mhr_fix=Decimal("60.00"),  # std_mhr_total = 260.00
        vave_mhr_var=Decimal("180.00"),
        vave_mhr_fix=Decimal("57.00"),  # vave_mhr_total = 237.00
        efficiency_factor=Decimal("1.0"),
        work_center="测试车间",
        std_hourly_rate=Decimal("260.00"),
        vave_hourly_rate=Decimal("237.00"),
    )
    clean_db.add(rate)
    await clean_db.commit()
    await clean_db.refresh(rate)
    return rate


@pytest.fixture
async def process_rate_without_vave(clean_db: AsyncSession):
    """无 VAVE 费率的测试工序."""
    rate = ProcessRate(
        process_code="PROC-TEST-NO-VAVE",
        process_name="无 VAVE 费率工序",
        std_mhr_var=Decimal("150.00"),
        std_mhr_fix=Decimal("50.00"),  # std_mhr_total = 200.00
        vave_mhr_var=None,
        vave_mhr_fix=None,
        efficiency_factor=Decimal("1.0"),
        work_center="测试车间",
        std_hourly_rate=Decimal("200.00"),
        vave_hourly_rate=None,
    )
    clean_db.add(rate)
    await clean_db.commit()
    await clean_db.refresh(rate)
    return rate


@pytest.fixture
def sample_bom_file():
    """生成测试用 BOM Excel 文件."""
    wb = Workbook()
    ws = wb.active
    ws.title = "BOM"

    # 表头
    headers = [
        "Level",
        "Item",
        "Part Number",
        "Part Name",
        "Version",
        "Type",
        "Status",
        "Material",
        "Supplier",
        "Qty",
        "Unit",
        "Comments",
    ]
    ws.append(headers)

    # 测试数据行 - 有历史价格的物料
    ws.append(
        [
            "1",
            "100",
            "MAT-TEST-DUAL",
            "双轨价格测试物料",
            "V1.0",
            "I",
            "N",
            "铝合金",
            "供应商A",
            2.5,
            "kg",
            "铸造级材料，需要折弯",
        ]
    )

    # 测试数据行 - 无历史价格的物料
    ws.append(
        [
            "2",
            "200",
            "MAT-NEW-ITEM",
            "新物料无历史",
            "V1.0",
            "I",
            "N",
            "不锈钢",
            "供应商B",
            1.0,
            "kg",
            "需要焊接和表面处理",
        ]
    )

    # 测试数据行 - 工艺关键词测试
    ws.append(
        [
            "3",
            "300",
            "MAT-WELD-TEST",
            "焊接测试件",
            "V1.0",
            "I",
            "N",
            "碳钢",
            "供应商C",
            5.0,
            "kg",
            "需要焊接、弯曲和阳极氧化",
        ]
    )

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return output


@pytest.fixture
def empty_bom_file():
    """生成空的 BOM Excel 文件（只有表头）."""
    wb = Workbook()
    ws = wb.active
    ws.title = "BOM"

    # 只有表头
    headers = [
        "Level",
        "Item",
        "Part Number",
        "Part Name",
        "Version",
        "Type",
        "Status",
        "Material",
        "Supplier",
        "Qty",
        "Unit",
        "Comments",
    ]
    ws.append(headers)

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return output


@pytest.fixture
def invalid_file():
    """生成非 Excel 文件（文本文件）."""
    return BytesIO(b"This is not an Excel file")
