"""工序费率 API 路由.

提供工序费率的查询接口，用于工艺路线管理和成本计算。

设计规范: docs/DATABASE_DESIGN.md
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.process_rate import ProcessRate

router = APIRouter()


def _model_to_response(rate: ProcessRate) -> dict:
    """将工艺费率模型转换为响应字典."""
    return {
        "id": rate.id,
        "process_code": rate.process_code,
        "process_name": rate.process_name,
        "equipment": rate.equipment,
        "work_center": rate.work_center,
        "std_mhr_var": float(rate.std_mhr_var) if rate.std_mhr_var else None,
        "std_mhr_fix": float(rate.std_mhr_fix) if rate.std_mhr_fix else None,
        "vave_mhr_var": float(rate.vave_mhr_var) if rate.vave_mhr_var else None,
        "vave_mhr_fix": float(rate.vave_mhr_fix) if rate.vave_mhr_fix else None,
        "std_hourly_rate": float(rate.std_hourly_rate) if rate.std_hourly_rate else None,
        "vave_hourly_rate": float(rate.vave_hourly_rate) if rate.vave_hourly_rate else None,
        "efficiency_factor": float(rate.efficiency_factor),
        "remarks": rate.remarks,
    }


@router.get("")
async def list_process_rates(
    db: AsyncSession = Depends(get_db),
):
    """获取工序费率列表.

    Returns:
        工序费率列表
    """
    result = await db.execute(
        select(ProcessRate).order_by(ProcessRate.process_code)
    )
    rates = result.scalars().all()

    return JSONResponse(
        content=[_model_to_response(r) for r in rates]
    )


@router.get("/{process_code}")
async def get_process_rate(
    process_code: str,
    db: AsyncSession = Depends(get_db),
):
    """根据工序编码获取费率.

    Args:
        process_code: 工序编码
        db: 数据库会话

    Returns:
        工序费率详情
    """
    result = await db.execute(
        select(ProcessRate).where(ProcessRate.process_code == process_code)
    )
    rate = result.scalar_one_or_none()

    if not rate:
        return JSONResponse(
            content={"error": "Process rate not found"},
            status_code=404
        )

    return JSONResponse(content=_model_to_response(rate))
