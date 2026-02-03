# backend/app/tests/test_models/test_investment_item.py
"""InvestmentItem 模型测试."""
from __future__ import annotations

import pytest
import uuid
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.investment_item import InvestmentItem, InvestmentType
from app.models.project import Project, ProjectStatus


@pytest.mark.asyncio
class TestInvestmentItem:
    """InvestmentItem 模型测试."""

    async def test_create_mold_investment(self, clean_db: AsyncSession):
        """测试创建模具投资."""
        # 创建关联项目
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

        # 创建模具投资项
        item = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.MOLD,
            name="Housing 注塑模具",
            unit_cost_est=Decimal("170000.00"),
            currency="CNY",
            quantity=1,
            asset_lifecycle=300000,
            is_shared=False,
            status="DRAFT"
        )
        clean_db.add(item)
        await clean_db.commit()
        await clean_db.refresh(item)

        assert item.item_type == InvestmentType.MOLD
        assert item.unit_cost_est == Decimal("170000.00")
        assert item.asset_lifecycle == 300000
        assert item.is_shared is False

    async def test_investment_type_enum(self, clean_db: AsyncSession):
        """测试投资类型枚举."""
        assert InvestmentType.MOLD == "MOLD"
        assert InvestmentType.GAUGE == "GAUGE"
        assert InvestmentType.JIG == "JIG"
        assert InvestmentType.FIXTURE == "FIXTURE"

    async def test_all_investment_types(self, clean_db: AsyncSession):
        """测试所有投资类型."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE investment_items"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建关联项目
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

        # 创建所有类型的投资项
        mold = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.MOLD,
            name="模具",
            unit_cost_est=Decimal("100000.00"),
        )
        gauge = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.GAUGE,
            name="检具",
            unit_cost_est=Decimal("20000.00"),
        )
        jig = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.JIG,
            name="夹具",
            unit_cost_est=Decimal("5000.00"),
        )
        fixture = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.FIXTURE,
            name="工装",
            unit_cost_est=Decimal("3000.00"),
        )

        clean_db.add_all([mold, gauge, jig, fixture])
        await clean_db.commit()

        # 验证所有类型都已创建
        assert mold.item_type == "MOLD"
        assert gauge.item_type == "GAUGE"
        assert jig.item_type == "JIG"
        assert fixture.item_type == "FIXTURE"

    async def test_shared_asset_reference(self, clean_db: AsyncSession):
        """测试共享资产引用."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE investment_items"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建关联项目
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

        # 创建原始共享资产
        source_id = str(uuid.uuid4())
        item1 = InvestmentItem(
            id=source_id,
            project_id=project.id,
            item_type=InvestmentType.JIG,
            name="焊接夹具（原始）",
            unit_cost_est=Decimal("5000.00"),
            quantity=2,
            is_shared=True,
        )
        clean_db.add(item1)
        await clean_db.commit()

        # 创建引用共享资产的项目
        item2 = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.JIG,
            name="焊接夹具（共享）",
            unit_cost_est=Decimal("0.00"),  # 共享资产不重复计费
            quantity=0,
            is_shared=True,
            shared_source_id=source_id,
        )
        clean_db.add(item2)
        await clean_db.commit()
        await clean_db.refresh(item2)

        assert item2.is_shared is True
        assert item2.shared_source_id == source_id

    async def test_default_values(self, clean_db: AsyncSession):
        """测试默认值."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE investment_items"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建关联项目
        project = Project(
            id=str(uuid.uuid4()),
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

        # 创建投资项（不指定可选字段）
        item = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.MOLD,
            name="测试模具",
        )
        clean_db.add(item)
        await clean_db.commit()
        await clean_db.refresh(item)

        # 验证默认值
        assert item.currency == "CNY"
        assert item.quantity == 1
        assert item.is_shared is False
        assert item.status == "DRAFT"

    async def test_foreign_key_to_project(self, clean_db: AsyncSession):
        """测试项目外键约束."""
        # 清理表
        await clean_db.execute(text("TRUNCATE TABLE investment_items"))
        await clean_db.execute(text("TRUNCATE TABLE projects"))
        await clean_db.commit()

        # 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-005",
            customer_number="CUST-005",
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

        # 创建关联的投资项
        item = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project.id,
            item_type=InvestmentType.MOLD,
            name="测试模具",
        )
        clean_db.add(item)
        await clean_db.commit()
        await clean_db.refresh(item)

        assert item.project_id == project.id
