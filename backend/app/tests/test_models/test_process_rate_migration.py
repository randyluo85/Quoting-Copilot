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

    async def test_production_line_fk_constraint(self, clean_db: AsyncSession):
        """测试产线外键约束."""
        # 首先创建产线
        from app.models.production_line import ProductionLine
        line = ProductionLine(id="PL001", name="测试产线", net_production_hours=4000)
        clean_db.add(line)
        await clean_db.commit()

        # 然后创建关联的工序费率
        rate = ProcessRate(
            process_code="PROC-002",
            process_name="测试工序2",
            production_line_id="PL001",
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        assert rate.production_line_id == "PL001"

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

    async def test_v24_mhr_calculation_fields(self, clean_db: AsyncSession):
        """测试 v2.4 新增的 MHR 计算字段."""
        rate = ProcessRate(
            process_code="PROC-006",
            process_name="测试工序6",
            # v1.8 MHR 计算参数
            equipment_origin_value=Decimal("500000"),
            floor_area=Decimal("50"),
            rated_power=Decimal("30"),
            planned_hours=Decimal("4000"),
            load_factor=Decimal("0.78"),
            # v2.4 VOSS 标准规则参数
            machine_count=2,
            setup_hours=Decimal("100"),
            tools_cost=Decimal("5000"),
            supplies_cost=Decimal("2000"),
            maintenance_cost=Decimal("3000"),
            other_variable_cost=Decimal("1000"),
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        # 验证 v2.4 新字段
        assert rate.machine_count == 2
        assert rate.setup_hours == Decimal("100")
        assert rate.tools_cost == Decimal("5000")
        assert rate.supplies_cost == Decimal("2000")
        assert rate.maintenance_cost == Decimal("3000")
        assert rate.other_variable_cost == Decimal("1000")

    async def test_load_factor_default_value(self, clean_db: AsyncSession):
        """测试负载系数默认值（v2.4 固定为 0.78）."""
        rate = ProcessRate(
            process_code="PROC-007",
            process_name="测试工序7",
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        # load_factor 默认值应为 0.78（VOSS 标准）
        assert rate.load_factor == Decimal("0.78")

    async def test_machine_count_default_value(self, clean_db: AsyncSession):
        """测试机器数默认值（v2.4 默认为 1）."""
        rate = ProcessRate(
            process_code="PROC-008",
            process_name="测试工序8",
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        # machine_count 默认值应为 1
        assert rate.machine_count == 1
