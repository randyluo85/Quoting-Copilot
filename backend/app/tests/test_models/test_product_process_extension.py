"""ProductProcess 扩展字段测试."""
from __future__ import annotations

import pytest
import uuid
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product_process import ProductProcess
from app.models.process_rate import ProcessRate
from app.models.project import Project, ProjectStatus
from app.models.project_product import ProjectProduct


@pytest.mark.asyncio
class TestProductProcessExtension:
    """ProductProcess 扩展字段测试."""

    async def test_cycle_time_std_and_vave(self, clean_db: AsyncSession):
        """测试标准工时和 VAVE 工时."""
        # 清理 product_processes 表
        await clean_db.execute(text("TRUNCATE TABLE product_processes"))
        await clean_db.commit()

        # 创建工序费率（外键依赖）
        rate = ProcessRate(
            process_code="PROC-001",
            process_name="测试工序001",
            std_mhr_var=Decimal("100.00"),
            std_mhr_fix=Decimal("50.00"),
            vave_mhr_var=Decimal("90.00"),
            vave_mhr_fix=Decimal("45.00"),
            efficiency_factor=Decimal("1.0"),
            work_center="测试车间",
            std_hourly_rate=Decimal("150.00"),
            vave_hourly_rate=Decimal("135.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-001",
            customer_number="CUST-001",
            product_version="V1.0",
            customer_version="V1.0",
            client_name="测试客户",
            project_name="测试项目",
            annual_volume=100000,
            status=ProjectStatus.DRAFT,
            products={},
            owners={},
        )
        clean_db.add(project)
        await clean_db.commit()

        # 创建产品
        product = ProjectProduct(
            id=str(uuid.uuid4()),
            project_id=project.id,
            product_name="测试零件",
        )
        clean_db.add(product)
        await clean_db.commit()

        # 创建工艺路线
        process = ProductProcess(
            project_product_id=product.id,
            process_code="PROC-001",
            sequence_order=1,
            cycle_time_std=120,  # 秒
            cycle_time_vave=108,  # 秒 (优化后)
            personnel_std=Decimal("1.0"),
            personnel_vave=Decimal("0.8"),
        )
        clean_db.add(process)
        await clean_db.commit()
        await clean_db.refresh(process)

        assert process.cycle_time_std == 120
        assert process.cycle_time_vave == 108
        assert process.personnel_std == Decimal("1.0")
        assert process.personnel_vave == Decimal("0.8")

    async def test_extended_cost_calculation(self, clean_db: AsyncSession):
        """测试扩展成本计算公式.

        std_cost = (cycle_time_std / 3600) × (std_mhr_var + std_mhr_fix + personnel_std × labor_rate)
        假设 labor_rate = 50, std_mhr_var = 100, std_mhr_fix = 50
        cycle_time_std = 120 秒 = 0.0333 小时
        std_cost = 0.0333 × (100 + 50 + 1.0 × 50) = 0.0333 × 200 = 6.66
        """
        # 清理 product_processes 表
        await clean_db.execute(text("TRUNCATE TABLE product_processes"))
        await clean_db.commit()

        # 创建工序费率（外键依赖）
        rate = ProcessRate(
            process_code="PROC-002",
            process_name="测试工序002",
            std_mhr_var=Decimal("100.00"),
            std_mhr_fix=Decimal("50.00"),
            vave_mhr_var=Decimal("90.00"),
            vave_mhr_fix=Decimal("45.00"),
            efficiency_factor=Decimal("1.0"),
            work_center="测试车间",
            std_hourly_rate=Decimal("150.00"),
            vave_hourly_rate=Decimal("135.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-002",
            customer_number="CUST-002",
            product_version="V1.0",
            customer_version="V1.0",
            client_name="测试客户",
            project_name="测试项目2",
            annual_volume=100000,
            status=ProjectStatus.DRAFT,
            products={},
            owners={},
        )
        clean_db.add(project)
        await clean_db.commit()

        # 创建产品
        product = ProjectProduct(
            id=str(uuid.uuid4()),
            project_id=project.id,
            product_name="测试零件2",
        )
        clean_db.add(product)
        await clean_db.commit()

        # 创建工艺路线
        process = ProductProcess(
            project_product_id=product.id,
            process_code="PROC-002",
            sequence_order=1,
            cycle_time_std=120,
            std_mhr=Decimal("200.00"),  # 模拟计算后的总费率
        )
        clean_db.add(process)
        await clean_db.commit()

        # cost = (120 / 3600) × 200 = 6.6667
        # 需要四舍五入到 2 位小数
        expected_cost = Decimal("6.67")
        # 由于 std_cost 在模型中是 float，需要做类型转换
        actual_cost = Decimal(str(process.std_cost)).quantize(Decimal("0.01"))
        assert actual_cost == expected_cost

    async def test_vave_fields_defaults(self, clean_db: AsyncSession):
        """测试 VAVE 字段的默认值."""
        # 清理 product_processes 表
        await clean_db.execute(text("TRUNCATE TABLE product_processes"))
        await clean_db.commit()

        # 创建工序费率（外键依赖）
        rate = ProcessRate(
            process_code="PROC-003",
            process_name="测试工序003",
            std_mhr_var=Decimal("100.00"),
            std_mhr_fix=Decimal("50.00"),
            vave_mhr_var=Decimal("90.00"),
            vave_mhr_fix=Decimal("45.00"),
            efficiency_factor=Decimal("1.0"),
            work_center="测试车间",
            std_hourly_rate=Decimal("150.00"),
            vave_hourly_rate=Decimal("135.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-003",
            customer_number="CUST-003",
            product_version="V1.0",
            customer_version="V1.0",
            client_name="测试客户",
            project_name="测试项目3",
            annual_volume=100000,
            status=ProjectStatus.DRAFT,
            products={},
            owners={},
        )
        clean_db.add(project)
        await clean_db.commit()

        # 创建产品
        product = ProjectProduct(
            id=str(uuid.uuid4()),
            project_id=project.id,
            product_name="测试零件3",
        )
        clean_db.add(product)
        await clean_db.commit()

        # 创建工艺路线（只设置 std 字段）
        process = ProductProcess(
            project_product_id=product.id,
            process_code="PROC-003",
            sequence_order=1,
            cycle_time_std=90,
        )
        clean_db.add(process)
        await clean_db.commit()
        await clean_db.refresh(process)

        # 验证默认值
        assert process.cycle_time_std == 90
        assert process.cycle_time_vave is None
        # personnel_std 有默认值 1.0
        assert process.personnel_std == Decimal("1.0")
        assert process.personnel_vave is None
