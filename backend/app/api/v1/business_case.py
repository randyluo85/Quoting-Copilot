# backend/app/api/v1/business_case.py
"""Business Case 计算相关 API."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.business_case_service import BusinessCaseService
from app.schemas.business_case import (
    BusinessCaseParamsCreate,
    BusinessCaseParamsUpdate,
    BusinessCaseParamsResponse,
    FinancialYearDataCreate,
    FinancialYearData,
    BusinessCaseResponse,
    BusinessCaseCalculationRequest,
)


router = APIRouter(prefix="/business-case", tags=["Business Case"])


# ============ BC 参数管理 ============

@router.post("/params", response_model=BusinessCaseParamsResponse, status_code=status.HTTP_201_CREATED)
async def create_bc_params(
    data: BusinessCaseParamsCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建 BC 参数."""
    service = BusinessCaseService(db)
    return await service.create_params(data)


@router.get("/params/{project_id}", response_model=BusinessCaseParamsResponse)
async def get_bc_params(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取项目 BC 参数."""
    service = BusinessCaseService(db)
    params = await service.get_params(project_id)
    if not params:
        raise HTTPException(status_code=404, detail="BC params not found")
    return params


@router.put("/params/{project_id}", response_model=BusinessCaseParamsResponse)
async def update_bc_params(
    project_id: str,
    data: BusinessCaseParamsUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新 BC 参数."""
    service = BusinessCaseService(db)
    params = await service.update_params(project_id, data)
    if not params:
        raise HTTPException(status_code=404, detail="BC params not found")
    return params


# ============ 年度数据管理 ============

@router.post("/years", response_model=FinancialYearData, status_code=status.HTTP_201_CREATED)
async def create_year_data(
    data: FinancialYearDataCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建年度数据."""
    service = BusinessCaseService(db)
    year_data = await service.create_year_data(data)
    return FinancialYearData(
        year=year_data.year,
        volume=year_data.volume,
        reduction_rate=year_data.reduction_rate,
        gross_sales=year_data.gross_sales,
        net_sales=year_data.net_sales,
        net_price=year_data.net_price,
        hk_3_cost=year_data.hk_3_cost,
        recovery_tooling=year_data.recovery_tooling,
        recovery_rnd=year_data.recovery_rnd,
        overhead_sa=year_data.overhead_sa,
        sk_cost=year_data.sk_cost,
        db_1=year_data.db_1,
        db_4=year_data.db_4,
    )


@router.get("/years/{project_id}", response_model=list[FinancialYearData])
async def get_year_data(
    project_id: str,
    year: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    """获取项目年度数据."""
    service = BusinessCaseService(db)
    years = await service.get_year_data(project_id, year)
    return [
        FinancialYearData(
            year=y.year,
            volume=y.volume,
            reduction_rate=y.reduction_rate,
            gross_sales=y.gross_sales,
            net_sales=y.net_sales,
            net_price=y.net_price,
            hk_3_cost=y.hk_3_cost,
            recovery_tooling=y.recovery_tooling,
            recovery_rnd=y.recovery_rnd,
            overhead_sa=y.overhead_sa,
            sk_cost=y.sk_cost,
            db_1=y.db_1,
            db_4=y.db_4,
        )
        for y in years
    ]


@router.put("/years/{project_id}/{year}", response_model=FinancialYearData)
async def update_year_data(
    project_id: str,
    year: int,
    data: FinancialYearDataCreate,
    db: AsyncSession = Depends(get_db),
):
    """更新年度数据."""
    service = BusinessCaseService(db)
    year_data = await service.update_year_data(project_id, year, data)
    if not year_data:
        raise HTTPException(status_code=404, detail="Year data not found")
    return FinancialYearData(
        year=year_data.year,
        volume=year_data.volume,
        reduction_rate=year_data.reduction_rate,
        gross_sales=year_data.gross_sales,
        net_sales=year_data.net_sales,
        net_price=year_data.net_price,
        hk_3_cost=year_data.hk_3_cost,
        recovery_tooling=year_data.recovery_tooling,
        recovery_rnd=year_data.recovery_rnd,
        overhead_sa=year_data.overhead_sa,
        sk_cost=year_data.sk_cost,
        db_1=year_data.db_1,
        db_4=year_data.db_4,
    )


@router.delete("/years/{project_id}/{year}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_year_data(
    project_id: str,
    year: int,
    db: AsyncSession = Depends(get_db),
):
    """删除年度数据."""
    service = BusinessCaseService(db)
    success = await service.delete_year_data(project_id, year)
    if not success:
        raise HTTPException(status_code=404, detail="Year data not found")


# ============ Business Case 计算 ============

@router.post("/calculate", response_model=BusinessCaseResponse)
async def calculate_business_case(
    data: BusinessCaseCalculationRequest,
    db: AsyncSession = Depends(get_db),
):
    """计算完整的 Business Case.

    会保存参数和年度数据到数据库，并返回计算结果。
    """
    service = BusinessCaseService(db)
    return await service.calculate_business_case(
        project_id=data.project_id,
        params=data,
        years=data.years,
    )


@router.get("/{project_id}", response_model=BusinessCaseResponse)
async def get_business_case(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取项目完整的 Business Case."""
    service = BusinessCaseService(db)
    try:
        return await service.get_business_case(project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
