# backend/app/tests/test_models/test_business_case.py
"""BusinessCase 模型测试."""
from __future__ import annotations

import pytest
import uuid
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business_case import BusinessCaseParams, BusinessCaseYears
from app.models.project import Project, ProjectStatus


@pytest.mark.asyncio
class TestBusinessCaseModels:
    """Business Case 模型测试."""

    async def test_create_bc_params(self, clean_db: AsyncSession):
        """测试创建 Business Case 参数."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE business_case_params"))
        await clean_db.execute(text("TRUNCATE TABLE business_case_years"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
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

        # 创建 BC 参数
        params = BusinessCaseParams(
            id=str(uuid.uuid4()),
            project_id=project.id,
            tooling_invest=Decimal("49468.00"),
            rnd_invest=Decimal("48079.00"),
            base_price=Decimal("21.76"),
            exchange_rate=Decimal("7.83"),
            amortization_mode="total_volume_based",
            sa_rate=Decimal("0.0210"),
        )
        clean_db.add(params)
        await clean_db.commit()
        await clean_db.refresh(params)

        assert params.tooling_invest == Decimal("49468.00")
        assert params.sa_rate == Decimal("0.0210")

    async def test_bc_params_default_sa_rate(self, clean_db: AsyncSession):
        """测试 BC 参数默认 SA 费用率."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE business_case_params"))
        await clean_db.execute(text("TRUNCATE TABLE business_case_years"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-002",
            customer_number="CUST-002",
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

        # 创建 BC 参数（不指定 sa_rate）
        params = BusinessCaseParams(
            id=str(uuid.uuid4()),
            project_id=project.id,
            tooling_invest=Decimal("50000.00"),
            rnd_invest=Decimal("30000.00"),
            base_price=Decimal("20.00"),
            exchange_rate=Decimal("7.50"),
        )
        clean_db.add(params)
        await clean_db.commit()
        await clean_db.refresh(params)

        # 验证默认值 2.1%
        assert params.sa_rate == Decimal("0.0210")

    async def test_create_bc_years(self, clean_db: AsyncSession):
        """测试创建 Business Case 年度数据."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE business_case_params"))
        await clean_db.execute(text("TRUNCATE TABLE business_case_years"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-003",
            customer_number="CUST-003",
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

        # 创建年度数据
        year_data = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project.id,
            year=2026,
            volume=15750,
            reduction_rate=Decimal("0.00"),
            gross_sales=Decimal("342658.00"),
            net_sales=Decimal("342658.00"),
            net_price=Decimal("21.76"),
            hk_3_cost=Decimal("316470.00"),
            recovery_tooling=Decimal("20369.00"),
            recovery_rnd=Decimal("19797.00"),
            overhead_sa=Decimal("7196.00"),
            sk_cost=Decimal("364023.00"),
            db_1=Decimal("26188.00"),
            db_4=Decimal("-21365.00"),
        )
        clean_db.add(year_data)
        await clean_db.commit()
        await clean_db.refresh(year_data)

        assert year_data.year == 2026
        assert year_data.db_4 == Decimal("-21365.00")

    async def test_year_unique_constraint_per_project(self, clean_db: AsyncSession):
        """测试同一项目同年份唯一约束."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE business_case_params"))
        await clean_db.execute(text("TRUNCATE TABLE business_case_years"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建项目
        project_id = str(uuid.uuid4())
        project = Project(
            id=project_id,
            asac_number="AS-TEST-004",
            customer_number="CUST-004",
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

        # 创建第一年数据
        year1 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project_id,
            year=2026,
            volume=10000,
        )
        clean_db.add(year1)
        await clean_db.commit()

        # 尝试创建同年份数据（应该失败）
        year2 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project_id,
            year=2026,  # 同一项目同一年份
            volume=15000,
        )
        clean_db.add(year2)

        # 应该抛出异常
        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()

    async def test_different_projects_same_year(self, clean_db: AsyncSession):
        """测试不同项目可以有同一年份."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE business_case_params"))
        await clean_db.execute(text("TRUNCATE TABLE business_case_years"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建两个项目
        project1 = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-005",
            customer_number="CUST-005",
            product_version="V1.0",
            customer_version="V1.0",
            client_name="测试客户",
            project_name="测试项目1",
            annual_volume=100000,
            status=ProjectStatus.DRAFT,
            products={},
            owners={},
        )
        clean_db.add(project1)

        project2 = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-006",
            customer_number="CUST-006",
            product_version="V1.0",
            customer_version="V1.0",
            client_name="测试客户",
            project_name="测试项目2",
            annual_volume=100000,
            status=ProjectStatus.DRAFT,
            products={},
            owners={},
        )
        clean_db.add(project2)
        await clean_db.commit()

        # 两个项目都可以有 2026 年数据
        year1 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project1.id,
            year=2026,
            volume=10000,
        )
        clean_db.add(year1)

        year2 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project2.id,  # 不同项目
            year=2026,
            volume=15000,
        )
        clean_db.add(year2)

        # 应该成功
        await clean_db.commit()

    async def test_bc_params_unique_constraint(self, clean_db: AsyncSession):
        """测试项目 BC 参数唯一约束（一个项目只能有一组参数）."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE business_case_params"))
        await clean_db.execute(text("TRUNCATE TABLE business_case_years"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建项目
        project_id = str(uuid.uuid4())
        project = Project(
            id=project_id,
            asac_number="AS-TEST-007",
            customer_number="CUST-007",
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

        # 创建第一组参数
        params1 = BusinessCaseParams(
            id=str(uuid.uuid4()),
            project_id=project_id,
            tooling_invest=Decimal("50000.00"),
            rnd_invest=Decimal("30000.00"),
            base_price=Decimal("20.00"),
            exchange_rate=Decimal("7.50"),
        )
        clean_db.add(params1)
        await clean_db.commit()

        # 尝试创建第二组参数（应该失败）
        params2 = BusinessCaseParams(
            id=str(uuid.uuid4()),
            project_id=project_id,  # 同一项目
            tooling_invest=Decimal("60000.00"),
            rnd_invest=Decimal("40000.00"),
            base_price=Decimal("25.00"),
            exchange_rate=Decimal("7.80"),
        )
        clean_db.add(params2)

        # 应该抛出异常
        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()
