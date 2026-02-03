# backend/app/tests/test_models/test_process_rate_migration.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.process_rate import ProcessRate


@pytest.mark.asyncio
class TestProcessRateMHRSplit:
    """ProcessRate MHR 拆分测试."""

    async def test_mhr_var_and_fix_fields_exist(self, clean_db: AsyncSession):
        """测试新字段存在."""
        rate = ProcessRate(
            process_code="PROC-001",
            process_name="测试工序",
            std_mhr_var=Decimal("100.00"),
            std_mhr_fix=Decimal("50.00"),
            vave_mhr_var=Decimal("90.00"),
            vave_mhr_fix=Decimal("45.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        assert rate.std_mhr_var == Decimal("100.00")
        assert rate.std_mhr_fix == Decimal("50.00")
        assert rate.vave_mhr_var == Decimal("90.00")
        assert rate.vave_mhr_fix == Decimal("45.00")

    async def test_cost_center_fk_constraint(self, clean_db: AsyncSession):
        """测试成本中心外键约束."""
        # 首先创建成本中心
        from app.models.cost_center import CostCenter
        center = CostCenter(id="CC001", name="测试车间", net_production_hours=4000)
        clean_db.add(center)
        await clean_db.commit()

        # 然后创建关联的工序费率
        rate = ProcessRate(
            process_code="PROC-002",
            process_name="测试工序2",
            cost_center_id="CC001",
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        assert rate.cost_center_id == "CC001"

    async def test_total_mhr_property(self, clean_db: AsyncSession):
        """测试总 MHR 计算属性."""
        rate = ProcessRate(
            process_code="PROC-003",
            process_name="测试工序3",
            std_mhr_var=Decimal("100.00"),
            std_mhr_fix=Decimal("50.00"),
            vave_mhr_var=Decimal("90.00"),
            vave_mhr_fix=Decimal("45.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # std_total = var + fix = 150
        # vave_total = var + fix = 135
        assert rate.std_mhr_total == Decimal("150.00")
        assert rate.vave_mhr_total == Decimal("135.00")

    async def test_backward_compatibility_std_mhr(self, clean_db: AsyncSession):
        """测试向后兼容: 读取 std_mhr 返回总和."""
        rate = ProcessRate(
            process_code="PROC-004",
            process_name="测试工序4",
            std_mhr_var=Decimal("80.00"),
            std_mhr_fix=Decimal("40.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # std_mhr (legacy) 应该返回 var + fix
        assert rate.std_mhr == Decimal("120.00")

    async def test_backward_compatibility_vave_mhr(self, clean_db: AsyncSession):
        """测试向后兼容: 读取 vave_mhr 返回总和."""
        rate = ProcessRate(
            process_code="PROC-005",
            process_name="测试工序5",
            vave_mhr_var=Decimal("70.00"),
            vave_mhr_fix=Decimal("35.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # vave_mhr (legacy) 应该返回 var + fix
        assert rate.vave_mhr == Decimal("105.00")
