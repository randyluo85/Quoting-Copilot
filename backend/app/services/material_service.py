# backend/app/services/material_service.py
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from decimal import Decimal

from app.models.material import Material
from app.schemas.material import MaterialCreate, MaterialUpdate, MaterialResponse, MaterialListResponse


class MaterialService:
    """物料服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: MaterialCreate) -> MaterialResponse:
        """创建物料"""
        material = Material(
            id=data.id,
            name=data.name,
            spec=data.spec,
            std_price=data.std_price,
            vave_price=data.vave_price,
            supplier_tier=data.supplier_tier,
        )
        self.db.add(material)
        await self.db.flush()
        await self.db.refresh(material)
        return MaterialResponse.model_validate(material)

    async def get_by_id(self, material_id: str) -> Optional[MaterialResponse]:
        """通过 ID 获取物料"""
        result = await self.db.execute(select(Material).where(Material.id == material_id))
        material = result.scalar_one_or_none()
        if material:
            return MaterialResponse.model_validate(material)
        return None

    async def update(self, material_id: str, data: MaterialUpdate) -> Optional[MaterialResponse]:
        """更新物料"""
        result = await self.db.execute(select(Material).where(Material.id == material_id))
        material = result.scalar_one_or_none()
        if not material:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(material, field, value)

        await self.db.flush()
        await self.db.refresh(material)
        return MaterialResponse.model_validate(material)

    async def delete(self, material_id: str) -> bool:
        """删除物料"""
        result = await self.db.execute(select(Material).where(Material.id == material_id))
        material = result.scalar_one_or_none()
        if not material:
            return False

        await self.db.delete(material)
        return True

    async def list(
        self, page: int = 1, page_size: int = 20, search: Optional[str] = None
    ) -> MaterialListResponse:
        """分页查询物料"""
        query = select(Material)

        if search:
            query = query.where(
                (Material.id.like(f"%{search}%")) |
                (Material.name.like(f"%{search}%"))
            )

        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页查询
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        materials = result.scalars().all()

        return MaterialListResponse(
            total=total,
            items=[MaterialResponse.model_validate(m) for m in materials],
            page=page,
            page_size=page_size,
        )

    async def bulk_import(self, items: list[MaterialCreate]) -> tuple[int, int, list[dict]]:
        """批量导入物料

        Returns:
            (success_count, failed_count, failed_rows)
        """
        success_count = 0
        failed_rows = []

        for idx, item in enumerate(items, start=2):  # Excel 从第 2 行开始
            try:
                # 检查是否已存在
                existing = await self.get_by_id(item.id)
                if existing:
                    # 更新
                    await self.update(item.id, MaterialUpdate(**item.model_dump()))
                else:
                    # 创建
                    await self.create(item)
                success_count += 1
            except Exception as e:
                failed_rows.append({
                    "row": idx,
                    "reason": str(e),
                    "data": item.model_dump()
                })

        return success_count, len(failed_rows), failed_rows
