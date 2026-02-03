"""工艺路线 API 路由.

提供工艺路线模板的 CRUD 操作和审批流程。

设计规范: docs/DATABASE_DESIGN.md
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.schemas.process_route import (
    ProcessRouteStatus,
    ProcessRouteCreate,
    ProcessRouteUpdate,
    ProcessRouteResponse,
    ProcessRouteList,
    ProcessRouteItemCreate,
    ProcessRouteItemUpdate,
    ProcessRouteItemResponse,
    ProcessRouteSubmitRequest,
    ProcessRouteApprovalRequest,
    ProcessRouteApprovalResponse,
)
from app.models.process_route import ProcessRoute, ProcessRouteItem
from app.models.process_rate import ProcessRate

router = APIRouter()


def _generate_route_id() -> str:
    """生成工艺路线编码.

    格式: PR-YYYYMMDD-XXXX
    """
    return f"PR-{datetime.now().strftime('%Y%m%d')}-{datetime.now().strftime('%H%M%S')}"


def _calculate_route_summary(items: list[ProcessRouteItem]) -> dict:
    """计算工艺路线成本汇总.

    Args:
        items: 工序明细列表

    Returns:
        包含 total_std_cost, total_vave_cost, total_savings, savings_rate 的字典
    """
    total_std = sum(item.std_cost for item in items)
    total_vave = sum(item.vave_cost for item in items)
    total_savings = total_std - total_vave
    savings_rate = float(total_savings / total_std * 100) if total_std > 0 else 0.0

    return {
        "total_std_cost": total_std,
        "total_vave_cost": total_vave,
        "total_savings": total_savings,
        "savings_rate": savings_rate,
    }


def _item_to_response(item: ProcessRouteItem) -> ProcessRouteItemResponse:
    """将工序模型转换为响应对象."""
    return ProcessRouteItemResponse(
        id=item.id,
        route_id=item.route_id,
        operation_no=item.operation_no,
        process_code=item.process_code,
        process_name=None,  # 需要关联查询
        equipment=item.equipment,
        sequence=item.sequence,
        cycle_time_std=item.cycle_time_std,
        cycle_time_vave=item.cycle_time_vave,
        personnel_std=item.personnel_std,
        personnel_vave=item.personnel_vave,
        std_mhr_var=item.std_mhr_var,
        std_mhr_fix=item.std_mhr_fix,
        vave_mhr_var=item.vave_mhr_var,
        vave_mhr_fix=item.vave_mhr_fix,
        efficiency_factor=item.efficiency_factor,
        remarks=item.remarks,
        std_cost=item.std_cost,
        vave_cost=item.vave_cost,
        created_at=item.created_at,
    )


def _route_to_response(route: ProcessRoute) -> ProcessRouteResponse:
    """将工艺路线模型转换为响应对象."""
    items = list(route.items) if route.items else []
    summary = _calculate_route_summary(items)

    return ProcessRouteResponse(
        id=route.id,
        name=route.name,
        product_id=route.product_id,
        version=route.version,
        status=route.status,
        created_by=route.created_by,
        approved_by=route.approved_by,
        approved_at=route.approved_at,
        remarks=route.remarks,
        created_at=route.created_at,
        updated_at=route.updated_at,
        items=[_item_to_response(item) for item in items],
        item_count=len(items),
        **summary,
    )


def _route_to_list_item(route: ProcessRoute) -> ProcessRouteList:
    """将工艺路线模型转换为列表项."""
    items = list(route.items) if route.items else []
    summary = _calculate_route_summary(items)

    return ProcessRouteList(
        id=route.id,
        name=route.name,
        status=route.status,
        version=route.version,
        item_count=len(items),
        total_std_cost=summary["total_std_cost"],
        total_vave_cost=summary["total_vave_cost"],
        updated_at=route.updated_at,
    )


# ==================== CRUD 端点 ====================


@router.get("")
async def list_process_routes(
    status_filter: Optional[ProcessRouteStatus] = Query(None, alias="status"),
    keyword: Optional[str] = Query(None, description="关键词搜索（名称或编码）"),
    product_id: Optional[str] = Query(None, alias="product_id"),
    page: int = Query(1, ge=1, alias="page"),
    page_size: int = Query(20, ge=1, le=100, alias="pageSize"),
    db: AsyncSession = Depends(get_db),
):
    """获取工艺路线列表.

    Args:
        status_filter: 状态筛选
        keyword: 关键词搜索
        product_id: 产品ID筛选
        page: 页码
        page_size: 每页数量
        db: 数据库会话

    Returns:
        工艺路线列表
    """
    query = select(ProcessRoute).options(selectinload(ProcessRoute.items))

    # 应用筛选条件
    if status_filter:
        query = query.where(ProcessRoute.status == status_filter)
    if keyword:
        query = query.where(
            or_(
                ProcessRoute.id.contains(keyword),
                ProcessRoute.name.contains(keyword),
            )
        )
    if product_id:
        query = query.where(ProcessRoute.product_id == product_id)

    # 排序和分页
    query = query.order_by(ProcessRoute.updated_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    routes = result.scalars().all()

    return JSONResponse(
        content=[_route_to_list_item(r).model_dump(by_alias=True, mode='json') for r in routes]
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_process_route(
    data: ProcessRouteCreate,
    created_by: Optional[str] = Query(None, description="创建人"),
    db: AsyncSession = Depends(get_db),
):
    """创建新工艺路线（草稿状态）.

    Args:
        data: 工艺路线创建数据
        created_by: 创建人
        db: 数据库会话

    Returns:
        创建的工艺路线
    """
    # 生成工艺路线编码
    route_id = _generate_route_id()

    # 创建工艺路线
    route = ProcessRoute(
        id=route_id,
        name=data.name,
        product_id=data.product_id,
        status=ProcessRouteStatus.DRAFT,
        created_by=created_by or "system",
        remarks=data.remarks,
    )

    db.add(route)
    await db.flush()

    # 创建工序明细
    for item_data in data.items:
        # 查询工序费率获取快照数据
        process_result = await db.execute(
            select(ProcessRate).where(ProcessRate.process_code == item_data.process_code)
        )
        process_rate = process_result.scalar_one_or_none()

        item = ProcessRouteItem(
            route_id=route.id,
            operation_no=item_data.operation_no,
            process_code=item_data.process_code,
            sequence=item_data.sequence,
            cycle_time_std=item_data.cycle_time_std,
            cycle_time_vave=item_data.cycle_time_vave,
            personnel_std=item_data.personnel_std,
            personnel_vave=item_data.personnel_vave or item_data.personnel_std,
            efficiency_factor=item_data.efficiency_factor,
            # 从 process_rate 快照数据
            std_mhr_var=process_rate.std_mhr_var if process_rate else None,
            std_mhr_fix=process_rate.std_mhr_fix if process_rate else None,
            vave_mhr_var=process_rate.vave_mhr_var if process_rate else None,
            vave_mhr_fix=process_rate.vave_mhr_fix if process_rate else None,
            equipment=process_rate.equipment if process_rate else None,
            remarks=item_data.remarks,
        )
        db.add(item)

    await db.commit()

    # 重新查询以获取完整数据
    result = await db.execute(
        select(ProcessRoute)
        .options(selectinload(ProcessRoute.items))
        .where(ProcessRoute.id == route_id)
    )
    route = result.scalar_one_or_none()

    response = _route_to_response(route)
    return JSONResponse(content=response.model_dump(by_alias=True), status_code=201)


@router.get("/{route_id}")
async def get_process_route(
    route_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取工艺路线详情.

    Args:
        route_id: 工艺路线编码
        db: 数据库会话

    Returns:
        工艺路线详情
    """
    result = await db.execute(
        select(ProcessRoute)
        .options(selectinload(ProcessRoute.items))
        .where(ProcessRoute.id == route_id)
    )
    route = result.scalar_one_or_none()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Process route not found"
        )

    return JSONResponse(content=_route_to_response(route).model_dump(by_alias=True))


@router.get("/by-code/{code}")
async def get_process_route_by_code(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    """根据工艺路线编码查询（用于 BOM 解析匹配）.

    Args:
        code: 工艺路线编码
        db: 数据库会话

    Returns:
        工艺路线详情（仅生效状态）
    """
    result = await db.execute(
        select(ProcessRoute).where(
            ProcessRoute.id == code,
            ProcessRoute.status == ProcessRouteStatus.ACTIVE
        )
    )
    route = result.scalar_one_or_none()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Active process route not found"
        )

    return JSONResponse(content=_route_to_response(route).model_dump(by_alias=True))


@router.put("/{route_id}")
async def update_process_route(
    route_id: str,
    data: ProcessRouteUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新工艺路线.

    Args:
        route_id: 工艺路线编码
        data: 更新数据
        db: 数据库会话

    Returns:
        更新后的工艺路线
    """
    result = await db.execute(
        select(ProcessRoute).options(selectinload(ProcessRoute.items)).where(ProcessRoute.id == route_id)
    )
    route = result.scalar_one_or_none()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Process route not found"
        )

    # 检查是否可编辑
    if not route.is_editable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update route with status {route.status}",
        )

    # 更新基本信息
    if data.name is not None:
        route.name = data.name
    if data.product_id is not None:
        route.product_id = data.product_id
    if data.remarks is not None:
        route.remarks = data.remarks
    route.updated_at = datetime.utcnow()

    # 更新工序明细
    if data.items is not None:
        # 删除现有工序
        await db.execute(
            select(ProcessRouteItem).where(ProcessRouteItem.route_id == route_id)
        )
        # 重新创建工序
        for item_data in data.items:
            process_result = await db.execute(
                select(ProcessRate).where(ProcessRate.process_code == item_data.process_code)
            )
            process_rate = process_result.scalar_one_or_none()

            item = ProcessRouteItem(
                route_id=route.id,
                operation_no=item_data.operation_no or "",
                process_code=item_data.process_code or "",
                sequence=item_data.sequence or 0,
                cycle_time_std=item_data.cycle_time_std,
                cycle_time_vave=item_data.cycle_time_vave,
                personnel_std=item_data.personnel_std or Decimal("1.0"),
                personnel_vave=item_data.personnel_vave,
                efficiency_factor=item_data.efficiency_factor or Decimal("1.0"),
                std_mhr_var=process_rate.std_mhr_var if process_rate else None,
                std_mhr_fix=process_rate.std_mhr_fix if process_rate else None,
                vave_mhr_var=process_rate.vave_mhr_var if process_rate else None,
                vave_mhr_fix=process_rate.vave_mhr_fix if process_rate else None,
                equipment=process_rate.equipment if process_rate else None,
                remarks=item_data.remarks,
            )
            db.add(item)

    await db.commit()

    # 重新查询以获取更新后的完整数据
    result = await db.execute(
        select(ProcessRoute)
        .options(selectinload(ProcessRoute.items))
        .where(ProcessRoute.id == route_id)
    )
    updated_route = result.scalar_one_or_none()

    return JSONResponse(content=_route_to_response(updated_route).model_dump(by_alias=True))


@router.delete("/{route_id}")
async def delete_process_route(
    route_id: str,
    db: AsyncSession = Depends(get_db),
):
    """删除工艺路线（仅草稿状态）.

    Args:
        route_id: 工艺路线编码
        db: 数据库会话

    Returns:
        成功消息
    """
    result = await db.execute(
        select(ProcessRoute).options(selectinload(ProcessRoute.items)).where(ProcessRoute.id == route_id)
    )
    route = result.scalar_one_or_none()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Process route not found"
        )

    # 仅允许删除草稿状态
    if route.status != ProcessRouteStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete routes with draft status",
        )

    await db.delete(route)
    await db.commit()

    return JSONResponse(content={"message": "Process route deleted successfully"})


# ==================== 审批端点 ====================


@router.post("/{route_id}/submit")
async def submit_process_route(
    route_id: str,
    data: ProcessRouteSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """提交审批.

    Args:
        route_id: 工艺路线编码
        data: 提交说明
        db: 数据库会话

    Returns:
        更新后的工艺路线
    """
    result = await db.execute(
        select(ProcessRoute).options(selectinload(ProcessRoute.items)).where(ProcessRoute.id == route_id)
    )
    route = result.scalar_one_or_none()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Process route not found"
        )

    if route.status != ProcessRouteStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only submit routes with draft status",
        )

    # 检查是否有工序
    if not route.items or len(list(route.items)) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit route without process items",
        )

    route.status = ProcessRouteStatus.PENDING
    if data.remarks:
        route.remarks = (route.remarks or "") + f"\n[Submit] {data.remarks}"
    route.updated_at = datetime.utcnow()

    await db.commit()

    # 重新查询以获取完整数据
    result = await db.execute(
        select(ProcessRoute)
        .options(selectinload(ProcessRoute.items))
        .where(ProcessRoute.id == route_id)
    )
    route = result.scalar_one_or_none()

    return JSONResponse(content=_route_to_response(route).model_dump(by_alias=True))


@router.post("/{route_id}/approve")
async def approve_process_route(
    route_id: str,
    data: ProcessRouteApprovalRequest,
    approved_by: Optional[str] = Query(None, description="审批人"),
    db: AsyncSession = Depends(get_db),
):
    """审批或拒绝工艺路线.

    Args:
        route_id: 工艺路线编码
        data: 审批数据
        approved_by: 审批人
        db: 数据库会话

    Returns:
        审批结果
    """
    result = await db.execute(
        select(ProcessRoute).options(selectinload(ProcessRoute.items)).where(ProcessRoute.id == route_id)
    )
    route = result.scalar_one_or_none()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Process route not found"
        )

    if route.status != ProcessRouteStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only approve routes with pending status",
        )

    if data.approved:
        # 审批通过
        route.status = ProcessRouteStatus.ACTIVE
        route.approved_by = approved_by or "admin"
        route.approved_at = datetime.utcnow()
    else:
        # 审批拒绝，回到草稿状态
        route.status = ProcessRouteStatus.DRAFT

    if data.remarks:
        route.remarks = (route.remarks or "") + f"\n[Approval] {data.remarks}"
    route.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(route)

    response = ProcessRouteApprovalResponse(
        id=route.id,
        status=route.status,
        approved_by=route.approved_by,
        approved_at=route.approved_at,
    )
    return JSONResponse(content=response.model_dump(by_alias=True))
