# backend/app/api/v1/investments.py
"""NRE 投资相关 API."""
from __future__ import annotations

from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.investment_service import InvestmentService
from app.schemas.investment import (
    InvestmentItemCreate,
    InvestmentItemUpdate,
    InvestmentItemResponse,
    AmortizationStrategyCreate,
    AmortizationStrategyResponse,
    AmortizationCalculationRequest,
    AmortizationCalculationResponse,
)
from app.models.investment_item import InvestmentType


router = APIRouter(prefix="/investments", tags=["NRE Investment"])


# ============ 投资项 CRUD ============

@router.post("/items", response_model=InvestmentItemResponse, status_code=status.HTTP_201_CREATED)
async def create_investment(
    data: InvestmentItemCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建投资项."""
    service = InvestmentService(db)
    return await service.create_investment(data)


@router.get("/items", response_model=List[InvestmentItemResponse])
async def list_investments(
    project_id: str | None = None,
    item_type: InvestmentType | None = None,
    db: AsyncSession = Depends(get_db),
):
    """获取投资项列表."""
    service = InvestmentService(db)
    return await service.list_investments(project_id, item_type)


@router.get("/items/{item_id}", response_model=InvestmentItemResponse)
async def get_investment(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取单个投资项."""
    service = InvestmentService(db)
    item = await service.get_investment(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Investment item not found")
    return item


@router.put("/items/{item_id}", response_model=InvestmentItemResponse)
async def update_investment(
    item_id: str,
    data: InvestmentItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新投资项."""
    service = InvestmentService(db)
    item = await service.update_investment(item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Investment item not found")
    return item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investment(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    """删除投资项."""
    service = InvestmentService(db)
    success = await service.delete_investment(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Investment item not found")


# ============ 分摊策略 ============

@router.post("/amortization", response_model=AmortizationStrategyResponse, status_code=status.HTTP_201_CREATED)
async def create_amortization_strategy(
    data: AmortizationStrategyCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建或更新分摊策略."""
    service = InvestmentService(db)

    # 检查是否已存在
    existing = await service.get_amortization_strategy(data.project_id)
    if existing:
        # 更新现有策略
        return await service.update_amortization_strategy(data.project_id, data)

    # 创建新策略
    return await service.create_amortization_strategy(data)


@router.get("/amortization/{project_id}", response_model=AmortizationStrategyResponse)
async def get_amortization_strategy(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取项目分摊策略."""
    service = InvestmentService(db)
    strategy = await service.get_amortization_strategy(project_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Amortization strategy not found")
    return strategy


@router.put("/amortization/{project_id}", response_model=AmortizationStrategyResponse)
async def update_amortization_strategy(
    project_id: str,
    data: AmortizationStrategyCreate,
    db: AsyncSession = Depends(get_db),
):
    """更新分摊策略."""
    service = InvestmentService(db)
    strategy = await service.update_amortization_strategy(project_id, data)
    if not strategy:
        raise HTTPException(status_code=404, detail="Amortization strategy not found")
    return strategy


# ============ 分摊计算 ============

@router.post("/calculate-amort", response_model=AmortizationCalculationResponse)
async def calculate_amortization(
    data: AmortizationCalculationRequest,
    db: AsyncSession = Depends(get_db),
):
    """计算分摊策略（不保存）."""
    service = InvestmentService(db)
    return service.calculate_amortization(
        total_investment=data.total_investment,
        mode=data.mode,
        amortization_volume=data.amortization_volume,
        duration_years=data.duration_years,
        interest_rate=data.interest_rate,
    )


@router.get("/total/{project_id}")
async def get_project_total_investment(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取项目总投资."""
    service = InvestmentService(db)
    total = await service.get_project_total_investment(project_id)
    return {"project_id": project_id, "total_investment": str(total)}
