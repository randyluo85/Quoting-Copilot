# backend/app/tests/test_models/test_production_line.py
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.production_line import ProductionLine


@pytest.mark.asyncio
class TestProductionLineModel:
    """ProductionLine 模型测试."""

    async def test_create_production_line(self, clean_db: AsyncSession):
        """测试创建产线."""
        line = ProductionLine(
            id="PL001",
            name="铸造产线",
            net_production_hours=4000.00,
            efficiency_rate=0.85,
            plan_fx_rate=7.83,
            avg_wages_per_hour=45.00,
            useful_life_years=8,
            status="ACTIVE"
        )
        clean_db.add(line)
        await clean_db.commit()
        await clean_db.refresh(line)

        assert line.id == "PL001"
        assert line.name == "铸造产线"
        assert line.efficiency_rate == Decimal("0.85")

    async def test_production_line_unique_id(self, clean_db: AsyncSession):
        """测试 ID 唯一约束."""
        line1 = ProductionLine(
            id="PL002", name="产线1", net_production_hours=4000,
            efficiency_rate=0.85, status="ACTIVE"
        )
        line2 = ProductionLine(
            id="PL002", name="产线2", net_production_hours=4000,
            efficiency_rate=0.85, status="ACTIVE"
        )
        clean_db.add(line1)
        clean_db.add(line2)

        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()

    async def test_production_line_default_values(self, clean_db: AsyncSession):
        """测试默认值."""
        line = ProductionLine(
            id="PL003", name="焊接产线", net_production_hours=3000
        )
        clean_db.add(line)
        await clean_db.commit()
        await clean_db.refresh(line)

        assert line.useful_life_years == 8
        assert line.status == "TEMPORARY"
