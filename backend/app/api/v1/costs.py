"""成本计算 API 路由."""

from decimal import Decimal
from fastapi import APIRouter, Depends, Body
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.services.calculation import DualTrackCalculator
from app.schemas.cost import CostCalculationResponse
from app.schemas.common import PricePair

router = APIRouter()


class MaterialInput(BaseModel):
    """物料输入."""
    code: str = Field(..., description="物料编码")
    quantity: float = Field(..., description="数量")


class ProcessInput(BaseModel):
    """工艺输入."""
    name: str = Field(..., description="工艺名称")
    cycle_time: float = Field(..., description="循环时间（小时）")


class CostCalculationRequest(BaseModel):
    """成本计算请求."""
    materials: list[MaterialInput] = Field(default=[], description="物料列表")
    processes: list[ProcessInput] = Field(default=[], description="工艺列表")


@router.post("/calculate")
async def calculate_cost(
    project_id: str,
    product_id: str,
    request: CostCalculationRequest = Body(default=None),
    db: AsyncSession = Depends(get_db),
):
    """执行双轨成本计算.

    核心公式：
    - Standard Cost = ∑(Qty × MaterialPrice_std) + ∑(CycleTime × HourlyRate_std)
    - VAVE Cost = ∑(Qty × MaterialPrice_vave) + ∑(CycleTime × HourlyRate_vave × Efficiency)

    Args:
        project_id: 项目 ID
        product_id: 产品 ID
        request: 计算请求（物料和工艺列表）
        db: 数据库会话

    Returns:
        双轨成本计算结果
    """
    calculator = DualTrackCalculator(db)

    # 计算物料成本
    material_std = Decimal("0")
    material_vave = Decimal("0")

    if request:
        for mat in request.materials:
            cost_pair = await calculator.calculate_material_cost(mat.code, mat.quantity)
            material_std += cost_pair.std
            material_vave += cost_pair.vave

    # 计算工艺成本
    process_std = Decimal("0")
    process_vave = Decimal("0")

    if request:
        for proc in request.processes:
            cost_pair = await calculator.calculate_process_cost(proc.name, proc.cycle_time)
            process_std += cost_pair.std
            process_vave += cost_pair.vave

    # 计算总成本
    total_std = material_std + process_std
    total_vave = material_vave + process_vave

    result = CostCalculationResponse(
        product_id=product_id,
        material_cost=_create_price_pair(material_std, material_vave),
        process_cost=_create_price_pair(process_std, process_vave),
        total_cost=_create_price_pair(total_std, total_vave),
    )
    return JSONResponse(content=result.model_dump(mode="json", by_alias=True))


def _create_price_pair(std: Decimal, vave: Decimal) -> PricePair:
    """创建 PricePair，自动计算节省."""
    savings = std - vave
    savings_rate = float(savings / std) if std > 0 else 0.0

    return PricePair(
        std=std.quantize(Decimal("0.01")),
        vave=vave.quantize(Decimal("0.01")),
        savings=savings.quantize(Decimal("0.01")),
        savings_rate=round(savings_rate, 4),
    )
