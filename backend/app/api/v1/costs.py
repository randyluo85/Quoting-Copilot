"""成本计算 API 路由."""

from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.cost import CostCalculationResponse
from app.schemas.common import PricePair

router = APIRouter()


@router.post("/calculate", response_model=CostCalculationResponse)
async def calculate_cost(
    project_id: str,
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    """执行双轨成本计算.

    核心公式：
    - Standard Cost = (Qty × MaterialPrice_std) + ∑(CycleTime × (MHR_std + Labor_std))
    - VAVE Cost = (Qty × MaterialPrice_vave) + ∑(CycleTime_opt × (MHR_vave + Labor_vave))

    Args:
        project_id: 项目 ID
        product_id: 产品 ID
        db: 数据库会话

    Returns:
        双轨成本计算结果
    """
    # TODO: 实际计算逻辑
    # 这里暂时返回模拟数据，后续需要：
    # 1. 根据 product_id 获取 BOM 数据
    # 2. 调用 DualTrackCalculator 计算物料成本
    # 3. 调用 DualTrackCalculator 计算工艺成本
    # 4. 汇总返回

    return CostCalculationResponse(
        productId=product_id,
        materialCost=PricePair(
            std=Decimal("210.95"),
            vave=Decimal("198.25"),
            savings=Decimal("12.70"),
            savingsRate=0.0602,
        ),
        processCost=PricePair(
            std=Decimal("264.00"),
            vave=Decimal("242.80"),
            savings=Decimal("21.20"),
            savingsRate=0.0803,
        ),
        totalCost=PricePair(
            std=Decimal("474.95"),
            vave=Decimal("441.05"),
            savings=Decimal("33.90"),
            savingsRate=0.0714,
        ),
    )
