"""Materials API 路由.

实现双轨价格功能的 CRUD 操作。
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from decimal import Decimal

from app.db.session import get_db
from app.schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
    ProcessRateCreate,
    ProcessRateUpdate,
    ProcessRateResponse,
)
from app.models.material import Material
from app.models.process_rate import ProcessRate


router = APIRouter()


# ==================== Materials ====================

@router.get("")
async def list_materials(
    status_filter: Optional[str] = Query(None, description="按状态筛选"),
    material_type: Optional[str] = Query(None, alias="materialType", description="按物料类型筛选"),
    db: AsyncSession = Depends(get_db),
):
    """获取物料列表."""
    query = select(Material)
    if status_filter:
        query = query.where(Material.status == status_filter)
    if material_type:
        query = query.where(Material.material_type == material_type)

    result = await db.execute(query.order_by(Material.created_at.desc()))
    materials = result.scalars().all()

    responses = [
        MaterialResponse(
            id=m.id,
            itemCode=m.item_code,
            name=m.name,
            spec=m.spec,
            version=m.version,
            materialType=m.material_type,
            status=m.status,
            material=m.material,
            supplier=m.supplier,
            remarks=m.remarks,
            stdPrice=m.std_price,
            vavePrice=m.vave_price,
            savings=_calculate_savings(m.std_price, m.vave_price),
            supplierTier=m.supplier_tier,
            category=m.category,
            createdAt=m.created_at.isoformat(),
            updatedAt=m.updated_at.isoformat(),
        )
        for m in materials
    ]
    return JSONResponse(content=[r.model_dump(by_alias=True) for r in responses])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_material(
    data: MaterialCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建新物料."""
    # 检查 item_code 是否已存在
    existing = await db.execute(
        select(Material).where(Material.item_code == data.itemCode)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Item code already exists")

    material = Material(
        item_code=data.itemCode,
        name=data.name,
        spec=data.spec,
        version=data.version,
        material_type=data.materialType,
        status=data.status or "active",
        material=data.material,
        supplier=data.supplier,
        remarks=data.remarks,
        std_price=data.stdPrice,
        vave_price=data.vavePrice,
        supplier_tier=data.supplierTier,
        category=data.category,
    )

    db.add(material)
    await db.commit()
    await db.refresh(material)

    response = MaterialResponse(
        id=material.id,
        itemCode=material.item_code,
        name=material.name,
        spec=material.spec,
        version=material.version,
        materialType=material.material_type,
        status=material.status,
        material=material.material,
        supplier=material.supplier,
        remarks=material.remarks,
        stdPrice=material.std_price,
        vavePrice=material.vave_price,
        savings=_calculate_savings(material.std_price, material.vave_price),
        supplierTier=material.supplier_tier,
        category=material.category,
        createdAt=material.created_at.isoformat(),
        updatedAt=material.updated_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True), status_code=201)


@router.get("/{item_code}")
async def get_material(
    item_code: str,
    db: AsyncSession = Depends(get_db),
):
    """通过物料编码获取物料."""
    result = await db.execute(
        select(Material).where(Material.item_code == item_code)
    )
    material = result.scalar_one_or_none()

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    response = MaterialResponse(
        id=material.id,
        itemCode=material.item_code,
        name=material.name,
        spec=material.spec,
        version=material.version,
        materialType=material.material_type,
        status=material.status,
        material=material.material,
        supplier=material.supplier,
        remarks=material.remarks,
        stdPrice=material.std_price,
        vavePrice=material.vave_price,
        savings=_calculate_savings(material.std_price, material.vave_price),
        supplierTier=material.supplier_tier,
        category=material.category,
        createdAt=material.created_at.isoformat(),
        updatedAt=material.updated_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True))


@router.put("/{item_code}")
async def update_material(
    item_code: str,
    data: MaterialUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新物料."""
    result = await db.execute(
        select(Material).where(Material.item_code == item_code)
    )
    material = result.scalar_one_or_none()

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # 更新非空字段
    if data.name is not None:
        material.name = data.name
    if data.spec is not None:
        material.spec = data.spec
    if data.version is not None:
        material.version = data.version
    if data.materialType is not None:
        material.material_type = data.materialType
    if data.status is not None:
        material.status = data.status
    if data.material is not None:
        material.material = data.material
    if data.supplier is not None:
        material.supplier = data.supplier
    if data.remarks is not None:
        material.remarks = data.remarks
    if data.stdPrice is not None:
        material.std_price = data.stdPrice
    if data.vavePrice is not None:
        material.vave_price = data.vavePrice
    if data.supplierTier is not None:
        material.supplier_tier = data.supplierTier
    if data.category is not None:
        material.category = data.category

    await db.commit()
    await db.refresh(material)

    response = MaterialResponse(
        id=material.id,
        itemCode=material.item_code,
        name=material.name,
        spec=material.spec,
        version=material.version,
        materialType=material.material_type,
        status=material.status,
        material=material.material,
        supplier=material.supplier,
        remarks=material.remarks,
        stdPrice=material.std_price,
        vavePrice=material.vave_price,
        savings=_calculate_savings(material.std_price, material.vave_price),
        supplierTier=material.supplier_tier,
        category=material.category,
        createdAt=material.created_at.isoformat(),
        updatedAt=material.updated_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True))


@router.delete("/{item_code}")
async def delete_material(
    item_code: str,
    db: AsyncSession = Depends(get_db),
):
    """删除物料."""
    result = await db.execute(
        select(Material).where(Material.item_code == item_code)
    )
    material = result.scalar_one_or_none()

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    await db.delete(material)
    await db.commit()

    return JSONResponse(content={"message": "Material deleted successfully"})


# ==================== Process Rates ====================

@router.get("/process-rates", tags=["process-rates"])
async def list_process_rates(
    db: AsyncSession = Depends(get_db),
):
    """获取工序费率列表."""
    result = await db.execute(
        select(ProcessRate).order_by(ProcessRate.process_code)
    )
    rates = result.scalars().all()

    responses = [
        ProcessRateResponse(
            id=r.id,
            processCode=r.process_code,
            processName=r.process_name,
            equipment=r.equipment,
            stdMhr=r.std_mhr,
            vaveMhr=r.vave_mhr,
            savings=_calculate_savings(r.std_mhr, r.vave_mhr),
            efficiencyFactor=r.efficiency_factor,
            remarks=r.remarks,
            createdAt=r.created_at.isoformat(),
            updatedAt=r.updated_at.isoformat(),
        )
        for r in rates
    ]
    return JSONResponse(content=[r.model_dump(by_alias=True) for r in responses])


@router.post("/process-rates", status_code=status.HTTP_201_CREATED, tags=["process-rates"])
async def create_process_rate(
    data: ProcessRateCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建新工序费率."""
    # 检查 process_code 是否已存在
    existing = await db.execute(
        select(ProcessRate).where(ProcessRate.process_code == data.processCode)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Process code already exists")

    rate = ProcessRate(
        process_code=data.processCode,
        process_name=data.processName,
        equipment=data.equipment,
        std_mhr=data.stdMhr,
        vave_mhr=data.vaveMhr,
        efficiency_factor=data.efficiencyFactor,
        remarks=data.remarks,
    )

    db.add(rate)
    await db.commit()
    await db.refresh(rate)

    response = ProcessRateResponse(
        id=rate.id,
        processCode=rate.process_code,
        processName=rate.process_name,
        equipment=rate.equipment,
        stdMhr=rate.std_mhr,
        vaveMhr=rate.vave_mhr,
        savings=_calculate_savings(rate.std_mhr, rate.vave_mhr),
        efficiencyFactor=rate.efficiency_factor,
        remarks=rate.remarks,
        createdAt=rate.created_at.isoformat(),
        updatedAt=rate.updated_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True), status_code=201)


# ==================== Helper Functions ====================

def _calculate_savings(std_val: Optional[Decimal], vave_val: Optional[Decimal]) -> Optional[Decimal]:
    """计算节省金额 (std - vave)."""
    if std_val is not None and vave_val is not None:
        return std_val - vave_val
    return None
