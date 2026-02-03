# backend/app/services/investment_service.py
"""NRE 投资服务."""
from __future__ import annotations

import uuid
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.investment_item import InvestmentItem, InvestmentType
from app.models.amortization_strategy import AmortizationStrategy, AmortizationMode
from app.schemas.investment import (
    InvestmentItemCreate,
    InvestmentItemUpdate,
    InvestmentItemResponse,
    AmortizationStrategyCreate,
    AmortizationStrategyResponse,
    AmortizationCalculationRequest,
    AmortizationCalculationResponse,
)


class InvestmentService:
    """NRE 投资服务."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_investment(self, data: InvestmentItemCreate) -> InvestmentItemResponse:
        """创建投资项."""
        item = InvestmentItem(
            id=str(uuid.uuid4()),
            **data.model_dump()
        )
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return InvestmentItemResponse.model_validate(item)

    async def list_investments(
        self, project_id: str | None = None, item_type: InvestmentType | None = None
    ) -> list[InvestmentItemResponse]:
        """获取投资项列表."""
        query = select(InvestmentItem)

        if project_id:
            query = query.where(InvestmentItem.project_id == project_id)
        if item_type:
            query = query.where(InvestmentItem.item_type == item_type)

        result = await self.db.execute(query.order_by(InvestmentItem.created_at))
        items = result.scalars().all()
        return [InvestmentItemResponse.model_validate(item) for item in items]

    async def get_investment(self, item_id: str) -> InvestmentItemResponse | None:
        """获取单个投资项."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.id == item_id)
        )
        item = result.scalar_one_or_none()
        return InvestmentItemResponse.model_validate(item) if item else None

    async def update_investment(
        self, item_id: str, data: InvestmentItemUpdate
    ) -> InvestmentItemResponse | None:
        """更新投资项."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.id == item_id)
        )
        item = result.scalar_one_or_none()
        if not item:
            return None

        # 更新非空字段
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(item, key) and value is not None:
                setattr(item, key, value)

        await self.db.commit()
        await self.db.refresh(item)
        return InvestmentItemResponse.model_validate(item)

    async def delete_investment(self, item_id: str) -> bool:
        """删除投资项."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.id == item_id)
        )
        item = result.scalar_one_or_none()
        if not item:
            return False

        await self.db.delete(item)
        await self.db.commit()
        return True

    def calculate_amortization(
        self,
        total_investment: Decimal,
        mode: AmortizationMode,
        amortization_volume: int | None,
        duration_years: int,
        interest_rate: Decimal,
    ) -> AmortizationCalculationResponse:
        """计算单件分摊额.

        公式: UnitAmort = I × (1 + R × Y) / V

        Args:
            total_investment: 总投资
            mode: 分摊模式
            amortization_volume: 分摊基数销量
            duration_years: 分摊年限
            interest_rate: 年利率

        Returns:
            单件分摊额
        """
        if mode == AmortizationMode.UPFRONT:
            unit_amort = Decimal("0")
        else:
            if not amortization_volume or amortization_volume <= 0:
                unit_amort = Decimal("0")
            else:
                interest_factor = Decimal("1") + interest_rate * duration_years
                unit_amort = (total_investment * interest_factor / amortization_volume).quantize(Decimal("0.01"))

        total_with_interest = total_investment * (Decimal("1") + interest_rate * duration_years)

        return AmortizationCalculationResponse(
            unit_amortization=unit_amort,
            total_with_interest=total_with_interest.quantize(Decimal("0.01")),
        )

    async def create_amortization_strategy(
        self, data: AmortizationStrategyCreate
    ) -> AmortizationStrategyResponse:
        """创建分摊策略."""
        strategy = AmortizationStrategy(
            id=str(uuid.uuid4()),
            **data.model_dump()
        )
        self.db.add(strategy)
        await self.db.commit()
        await self.db.refresh(strategy)
        return AmortizationStrategyResponse.model_validate(strategy)

    async def get_amortization_strategy(
        self, project_id: str
    ) -> AmortizationStrategyResponse | None:
        """获取项目分摊策略."""
        result = await self.db.execute(
            select(AmortizationStrategy).where(AmortizationStrategy.project_id == project_id)
        )
        strategy = result.scalar_one_or_none()
        return AmortizationStrategyResponse.model_validate(strategy) if strategy else None

    async def update_amortization_strategy(
        self, project_id: str, data: AmortizationStrategyCreate
    ) -> AmortizationStrategyResponse | None:
        """更新分摊策略."""
        result = await self.db.execute(
            select(AmortizationStrategy).where(AmortizationStrategy.project_id == project_id)
        )
        strategy = result.scalar_one_or_none()
        if not strategy:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(strategy, key):
                setattr(strategy, key, value)

        await self.db.commit()
        await self.db.refresh(strategy)
        return AmortizationStrategyResponse.model_validate(strategy)

    async def get_project_total_investment(self, project_id: str) -> Decimal:
        """获取项目总投资."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.project_id == project_id)
        )
        items = result.scalars().all()

        total = Decimal("0")
        for item in items:
            if item.unit_cost_est and not item.is_shared:
                total += item.unit_cost_est * item.quantity

        return total.quantize(Decimal("0.01"))
