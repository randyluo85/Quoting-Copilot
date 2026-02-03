# backend/app/tests/test_models/test_amortization_strategy.py
"""AmortizationStrategy 模型测试."""
from __future__ import annotations

import pytest
import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.amortization_strategy import AmortizationStrategy, AmortizationMode
from app.models.project import Project, ProjectStatus


@pytest.mark.asyncio
class TestAmortizationStrategy:
    """AmortizationStrategy 模型测试."""

    async def test_create_amortized_strategy(self, clean_db: AsyncSession):
        """测试创建分摊策略."""
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

        # 创建分摊策略
        strategy = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project.id,
            mode=AmortizationMode.AMORTIZED,
            amortization_volume=29750,
            duration_years=2,
            interest_rate=Decimal("0.0600"),
            calculated_unit_add=Decimal("6.40"),
        )
        clean_db.add(strategy)
        await clean_db.commit()
        await clean_db.refresh(strategy)

        assert strategy.mode == AmortizationMode.AMORTIZED
        assert strategy.duration_years == 2
        assert strategy.interest_rate == Decimal("0.0600")
        assert strategy.amortization_volume == 29750
        assert strategy.calculated_unit_add == Decimal("6.40")

    async def test_upfront_mode_zero_amortization(self, clean_db: AsyncSession):
        """测试一次性支付模式不计算分摊."""
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

        # 创建一次性支付策略
        strategy = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project.id,
            mode=AmortizationMode.UPFRONT,
            calculated_unit_add=Decimal("0.00"),  # 一次性支付不分摊
        )
        clean_db.add(strategy)
        await clean_db.commit()
        await clean_db.refresh(strategy)

        assert strategy.mode == AmortizationMode.UPFRONT
        assert strategy.calculated_unit_add == Decimal("0.00")

    async def test_amortization_mode_enum(self, clean_db: AsyncSession):
        """测试分摊模式枚举."""
        assert AmortizationMode.UPFRONT == "UPFRONT"
        assert AmortizationMode.AMORTIZED == "AMORTIZED"

    async def test_default_values(self, clean_db: AsyncSession):
        """测试默认值."""
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

        # 创建策略（不指定可选字段）
        strategy = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project.id,
            mode=AmortizationMode.AMORTIZED,
        )
        clean_db.add(strategy)
        await clean_db.commit()
        await clean_db.refresh(strategy)

        # 验证默认值
        assert strategy.duration_years == 2
        assert strategy.interest_rate == Decimal("0.0600")

    async def test_project_unique_constraint(self, clean_db: AsyncSession):
        """测试项目唯一约束（一个项目只能有一个分摊策略）."""
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

        # 创建第一个策略
        strategy1 = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project_id,
            mode=AmortizationMode.AMORTIZED,
        )
        clean_db.add(strategy1)
        await clean_db.commit()

        # 尝试创建第二个策略（同一项目）
        strategy2 = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project_id,  # 同一项目
            mode=AmortizationMode.UPFRONT,
        )
        clean_db.add(strategy2)

        # 应该抛出异常（唯一约束）
        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()

    async def test_foreign_key_to_project(self, clean_db: AsyncSession):
        """测试项目外键约束."""
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

        # 创建关联的分摊策略
        strategy = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project.id,
            mode=AmortizationMode.AMORTIZED,
        )
        clean_db.add(strategy)
        await clean_db.commit()
        await clean_db.refresh(strategy)

        assert strategy.project_id == project.id
