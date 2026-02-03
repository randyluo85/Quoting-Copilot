"""QuoteSummary Business Case 扩展字段测试."""
from __future__ import annotations

import pytest
import uuid
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quote_summary import QuoteSummary
from app.models.project import Project, ProjectStatus


@pytest.mark.asyncio
class TestQuoteSummaryExtension:
    """QuoteSummary Business Case 扩展字段测试."""

    async def test_hk_3_cost_field(self, clean_db: AsyncSession):
        """测试 HK III 制造成本字段."""
        # 清理 quote_summaries 表
        await clean_db.execute(text("TRUNCATE TABLE quote_summaries"))
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

        # 创建报价汇总（含 Business Case 字段）
        summary = QuoteSummary(
            project_id=project.id,
            total_std_cost=Decimal("500.00"),
            total_vave_cost=Decimal("450.00"),
            total_savings=Decimal("50.00"),
            savings_rate=10.0,
            quoted_price=Decimal("550.00"),
            actual_margin=10.0,
            # Business Case 扩展字段
            hk_3_cost=Decimal("300.00"),
            sk_cost=Decimal("480.00"),
            db_1=Decimal("70.00"),
            db_4=Decimal("50.00"),
        )
        clean_db.add(summary)
        await clean_db.commit()
        await clean_db.refresh(summary)

        # 验证 Business Case 字段
        assert summary.hk_3_cost == Decimal("300.00")
        assert summary.sk_cost == Decimal("480.00")
        assert summary.db_1 == Decimal("70.00")
        assert summary.db_4 == Decimal("50.00")

    async def test_business_case_fields_nullable(self, clean_db: AsyncSession):
        """测试 Business Case 字段可为空."""
        # 清理 quote_summaries 表
        await clean_db.execute(text("TRUNCATE TABLE quote_summaries"))
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

        # 创建报价汇总（不含 Business Case 字段）
        summary = QuoteSummary(
            project_id=project.id,
            total_std_cost=Decimal("500.00"),
            total_vave_cost=Decimal("450.00"),
        )
        clean_db.add(summary)
        await clean_db.commit()
        await clean_db.refresh(summary)

        # 验证 Business Case 字段默认为 None
        assert summary.hk_3_cost is None
        assert summary.sk_cost is None
        assert summary.db_1 is None
        assert summary.db_4 is None

    async def test_business_case_calculation(self, clean_db: AsyncSession):
        """测试 Business Case 计算逻辑.

        验证字段间的计算关系:
        - HK3 = Material Cost + Process Cost
        - SK = HK3 + Tooling Recovery + R&D Recovery + SA Overhead
        - DB1 = Net Sales - SK
        - DB4 = DB1 - Other Costs
        """
        # 清理 quote_summaries 表
        await clean_db.execute(text("TRUNCATE TABLE quote_summaries"))
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

        # 场景：某产品 Business Case 计算
        # - HK3 (制造成本) = 300.00
        # - 工装分摊 = 10.00
        # - 研发分摊 = 5.00
        # - SA 费用 = 5.00
        # - SK (完全成本) = 300 + 10 + 5 + 5 = 320.00
        # - 净售价 = 400.00
        # - DB1 (边际贡献 I) = 400 - 320 = 80.00
        # - 其他成本 = 30.00
        # - DB4 (净利润) = 80 - 30 = 50.00

        summary = QuoteSummary(
            project_id=project.id,
            quoted_price=Decimal("400.00"),
            hk_3_cost=Decimal("300.00"),
            sk_cost=Decimal("320.00"),
            db_1=Decimal("80.00"),
            db_4=Decimal("50.00"),
        )
        clean_db.add(summary)
        await clean_db.commit()
        await clean_db.refresh(summary)

        # 验证存储值
        assert summary.hk_3_cost == Decimal("300.00")
        assert summary.sk_cost == Decimal("320.00")
        assert summary.db_1 == Decimal("80.00")
        assert summary.db_4 == Decimal("50.00")

        # 验证计算逻辑（应用层）
        # DB1 = QuotePrice - SK
        expected_db_1 = Decimal("400.00") - Decimal("320.00")
        assert summary.db_1 == expected_db_1

        # 验证 DB4 < DB1（净利润小于边际贡献）
        assert summary.db_4 < summary.db_1

    async def test_business_case_precision(self, clean_db: AsyncSession):
        """测试 Business Case 字段精度（4 位小数）."""
        # 清理 quote_summaries 表
        await clean_db.execute(text("TRUNCATE TABLE quote_summaries"))
        await clean_db.commit()

        # 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            asac_number="AS-TEST-004",
            customer_number="CUST-004",
            product_version="V1.0",
            customer_version="V1.0",
            client_name="测试客户",
            project_name="测试项目4",
            annual_volume=100000,
            status=ProjectStatus.DRAFT,
            products={},
            owners={},
        )
        clean_db.add(project)
        await clean_db.commit()

        # 测试精度（4 位小数）
        summary = QuoteSummary(
            project_id=project.id,
            hk_3_cost=Decimal("300.1234"),
            sk_cost=Decimal("320.5678"),
            db_1=Decimal("80.9012"),
            db_4=Decimal("50.3456"),
        )
        clean_db.add(summary)
        await clean_db.commit()
        await clean_db.refresh(summary)

        # 验证精度保持
        assert summary.hk_3_cost == Decimal("300.1234")
        assert summary.sk_cost == Decimal("320.5678")
        assert summary.db_1 == Decimal("80.9012")
        assert summary.db_4 == Decimal("50.3456")
