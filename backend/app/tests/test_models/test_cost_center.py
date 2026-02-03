# backend/app/tests/test_models/test_cost_center.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cost_center import CostCenter


@pytest.mark.asyncio
class TestCostCenterModel:
    """CostCenter 模型测试."""

    async def test_create_cost_center(self, clean_db: AsyncSession):
        """测试创建成本中心."""
        center = CostCenter(
            id="CC001",
            name="铸造车间",
            net_production_hours=4000.00,
            efficiency_rate=0.85,
            plan_fx_rate=7.83,
            avg_wages_per_hour=45.00,
            useful_life_years=8,
            status="ACTIVE"
        )
        clean_db.add(center)
        await clean_db.commit()
        await clean_db.refresh(center)

        assert center.id == "CC001"
        assert center.name == "铸造车间"
        assert center.efficiency_rate == Decimal("0.85")

    async def test_cost_center_unique_id(self, clean_db: AsyncSession):
        """测试 ID 唯一约束."""
        center1 = CostCenter(
            id="CC002", name="车间1", net_production_hours=4000,
            efficiency_rate=0.85, status="ACTIVE"
        )
        center2 = CostCenter(
            id="CC002", name="车间2", net_production_hours=4000,
            efficiency_rate=0.85, status="ACTIVE"
        )
        clean_db.add(center1)
        clean_db.add(center2)

        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()

    async def test_cost_center_default_values(self, clean_db: AsyncSession):
        """测试默认值."""
        center = CostCenter(
            id="CC003", name="焊接车间", net_production_hours=3000
        )
        clean_db.add(center)
        await clean_db.commit()
        await clean_db.refresh(center)

        assert center.useful_life_years == 8
        assert center.status == "ACTIVE"
