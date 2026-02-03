# backend/app/schemas/investment.py
"""NRE 投资相关 Pydantic Schemas."""
from __future__ import annotations

from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field


class InvestmentType(str, Enum):
    """投资类型."""

    MOLD = "MOLD"
    GAUGE = "GAUGE"
    JIG = "JIG"
    FIXTURE = "FIXTURE"


class InvestmentItemCreate(BaseModel):
    """创建投资项."""

    project_id: str
    product_id: str | None = None
    item_type: InvestmentType
    name: str
    unit_cost_est: Decimal | None = None
    currency: str = "CNY"
    quantity: int = 1
    asset_lifecycle: int | None = None
    is_shared: bool = False
    shared_source_id: str | None = None


class InvestmentItemUpdate(BaseModel):
    """更新投资项."""

    name: str | None = None
    unit_cost_est: Decimal | None = None
    currency: str | None = None
    quantity: int | None = None
    asset_lifecycle: int | None = None
    is_shared: bool | None = None
    shared_source_id: str | None = None
    status: str | None = None


class InvestmentItemResponse(BaseModel):
    """投资项响应."""

    id: str
    project_id: str
    product_id: str | None
    item_type: str
    name: str
    unit_cost_est: Decimal | None
    currency: str
    quantity: int
    asset_lifecycle: int | None
    is_shared: bool
    shared_source_id: str | None
    status: str

    class Config:
        from_attributes = True


class AmortizationMode(str, Enum):
    """分摊模式."""

    UPFRONT = "UPFRONT"  # 一次性支付
    AMORTIZED = "AMORTIZED"  # 分摊进单价


class AmortizationStrategyCreate(BaseModel):
    """创建分摊策略."""

    project_id: str
    mode: AmortizationMode
    amortization_volume: int | None = None
    duration_years: int = 2
    interest_rate: Decimal = Field(default=Decimal("0.06"))


class AmortizationStrategyResponse(BaseModel):
    """分摊策略响应."""

    id: str
    project_id: str
    mode: str
    amortization_volume: int | None
    duration_years: int
    interest_rate: Decimal | None
    calculated_unit_add: Decimal | None

    class Config:
        from_attributes = True


class AmortizationCalculationRequest(BaseModel):
    """分摊计算请求."""

    total_investment: Decimal
    mode: AmortizationMode
    amortization_volume: int | None = None
    duration_years: int = 2
    interest_rate: Decimal = Field(default=Decimal("0.06"))


class AmortizationCalculationResponse(BaseModel):
    """分摊计算响应."""

    unit_amortization: Decimal
    total_with_interest: Decimal
