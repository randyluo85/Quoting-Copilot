"""双轨计价算法测试."""

import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.services.calculation import DualTrackCalculator
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.db.session import Base


# 测试数据库配置
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def engine():
    """创建测试数据库引擎."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def db_session(engine):
    """创建测试会话."""
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest.mark.asyncio
class TestDualTrackCalculation:
    """双轨计价算法测试."""

    async def test_zero_price_pair(self, db_session):
        """测试零价格对."""
        calc = DualTrackCalculator(db_session)
        result = await calc.calculate_material_cost(None, 10)

        assert result.std == Decimal("0.00")
        assert result.vave == Decimal("0.00")
        assert result.savings == Decimal("0.00")
        assert result.savings_rate == 0.0

    async def test_material_cost_calculation(self, db_session):
        """测试物料成本计算."""
        # 创建测试物料
        material = Material(
            item_code="TEST-001",
            name="测试物料",
            std_price=Decimal("100.00"),
            vave_price=Decimal("85.00"),
            supplier_tier="A",
        )
        db_session.add(material)
        await db_session.commit()

        calc = DualTrackCalculator(db_session)
        result = await calc.calculate_material_cost("TEST-001", 10)

        assert result.std == Decimal("1000.00")  # 100 * 10
        assert result.vave == Decimal("850.00")  # 85 * 10
        assert result.savings == Decimal("150.00")
        assert result.savings_rate == 0.15

    async def test_process_cost_calculation(self, db_session):
        """测试工艺成本计算."""
        # 创建测试工艺费率
        rate = ProcessRate(
            process_name="重力铸造",
            std_mhr=Decimal("45.00"),
            std_labor=Decimal("30.00"),
            vave_mhr=Decimal("42.00"),
            vave_labor=Decimal("28.00"),
            efficiency_factor=Decimal("0.95"),
        )
        db_session.add(rate)
        await db_session.commit()

        calc = DualTrackCalculator(db_session)
        result = await calc.calculate_process_cost("重力铸造", 2.5)

        # 标准成本 = 2.5 * (45 + 30) = 2.5 * 75 = 187.5
        # VAVE成本 = 2.5 * (42 + 28) * 0.95 = 2.5 * 70 * 0.95 = 166.25
        assert result.std == Decimal("187.50")
        assert result.vave == Decimal("166.25")
        assert result.savings == Decimal("21.25")

    def test_savings_calculation(self):
        """测试节省率计算."""
        std = Decimal("100.00")
        vave = Decimal("85.00")
        savings = std - vave
        savings_rate = float(savings / std) * 100

        assert savings == Decimal("15.00")
        assert savings_rate == 15.0
