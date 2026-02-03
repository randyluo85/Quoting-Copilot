# backend/app/schemas/business_case.py
"""Business Case Pydantic Schemas."""
from __future__ import annotations

from decimal import Decimal
from typing import List

from pydantic import BaseModel, Field


class BusinessCaseParamsCreate(BaseModel):
    """创建 BC 参数."""

    project_id: str
    tooling_invest: Decimal
    rnd_invest: Decimal
    base_price: Decimal
    exchange_rate: Decimal
    amortization_mode: str = "total_volume_based"
    sa_rate: Decimal = Field(default=Decimal("0.021"))


class BusinessCaseParamsUpdate(BaseModel):
    """更新 BC 参数."""

    tooling_invest: Decimal | None = None
    rnd_invest: Decimal | None = None
    base_price: Decimal | None = None
    exchange_rate: Decimal | None = None
    amortization_mode: str | None = None
    sa_rate: Decimal | None = None


class BusinessCaseParamsResponse(BaseModel):
    """BC 参数响应."""

    id: str
    project_id: str
    tooling_invest: Decimal | None
    rnd_invest: Decimal | None
    base_price: Decimal | None
    exchange_rate: Decimal | None
    amortization_mode: str | None
    sa_rate: Decimal | None

    class Config:
        from_attributes = True


class FinancialYearData(BaseModel):
    """单年度财务数据."""

    year: int
    volume: int | None
    reduction_rate: Decimal | None
    gross_sales: Decimal | None
    net_sales: Decimal | None
    net_price: Decimal | None
    hk_3_cost: Decimal | None
    recovery_tooling: Decimal | None
    recovery_rnd: Decimal | None
    overhead_sa: Decimal | None
    sk_cost: Decimal | None
    db_1: Decimal | None
    db_4: Decimal | None


class FinancialYearDataCreate(BaseModel):
    """创建单年度财务数据."""

    project_id: str
    year: int
    volume: int | None = None
    reduction_rate: Decimal | None = None
    gross_sales: Decimal | None = None
    net_sales: Decimal | None = None
    net_price: Decimal | None = None
    hk_3_cost: Decimal | None = None
    recovery_tooling: Decimal | None = None
    recovery_rnd: Decimal | None = None
    overhead_sa: Decimal | None = None
    sk_cost: Decimal | None = None
    db_1: Decimal | None = None
    db_4: Decimal | None = None


class BusinessCaseResponse(BaseModel):
    """Business Case 完整响应."""

    project_id: str
    params: BusinessCaseParamsResponse | None
    years: List[FinancialYearData]
    total_lifetime_volume: int | None
    total_db_4: Decimal | None
    break_even_year: int | None


class BusinessCaseCalculationRequest(BaseModel):
    """Business Case 计算请求."""

    project_id: str
    tooling_invest: Decimal
    rnd_invest: Decimal
    base_price: Decimal
    exchange_rate: Decimal
    amortization_mode: str = "total_volume_based"
    sa_rate: Decimal = Field(default=Decimal("0.021"))
    years: List[FinancialYearDataCreate]
