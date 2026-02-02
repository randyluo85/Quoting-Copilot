# 物料库管理实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现物料主数据 CRUD 和 Excel 批量导入功能

**Architecture:** RESTful API + SQLAlchemy ORM + Pydantic 验证

**Tech Stack:** FastAPI, openpyxl, Alembic

---

## Task 1: 创建 Materials 数据库模型

**Files:**
- Create: `backend/app/models/material.py`
- Modify: `backend/app/models/__init__.py`
- Create: `backend/alembic/versions/001_create_materials_table.py`

**Step 1: 编写测试**

```python
# tests/unit/models/test_material.py
import pytest
from decimal import Decimal
from app.models.material import Material


def test_material_model_attributes():
    """验证 Material 模型包含所有必需字段"""
    # Arrange
    material_data = {
        "item_code": "TEST-001",
        "name": "测试物料",
        "spec": "规格说明",
        "std_price": Decimal("100.50"),
        "vave_price": Decimal("85.00"),
        "supplier_tier": "A",
    }

    # Act
    material = Material(**material_data)

    # Assert
    assert material.item_code == "TEST-001"
    assert material.name == "测试物料"
    assert material.std_price == Decimal("100.50")
    assert material.vave_price == Decimal("85.00")
    assert material.supplier_tier == "A"


def test_material_string_representation():
    """验证 Material 的字符串表示"""
    material = Material(
        item_code="TEST-001",
        name="测试物料",
        std_price=Decimal("100.50")
    )
    assert str(material) == "TEST-001 - 测试物料"
```

**Step 2: 运行测试验证失败**

Run: `cd backend && pytest tests/unit/models/test_material.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'app.models.material'"

**Step 3: 实现 Material 模型**

```python
# backend/app/models/material.py
from sqlalchemy import Column, String, Numeric, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from decimal import Decimal


class Base(DeclarativeBase):
    """所有模型的基类"""
    pass


class Material(Base):
    """物料主数据表"""
    __tablename__ = "materials"

    id = Column(String(50), primary_key=True, autoincrement=False)  # 使用 item_code 作为主键
    name = Column(String(100), nullable=False)
    spec = Column(String(255), nullable=True)
    std_price = Column(Numeric(10, 4), nullable=False, default=Decimal("0"))
    vave_price = Column(Numeric(10, 4), nullable=True)
    supplier_tier = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"{self.id} - {self.name}"
```

**Step 4: 更新 models/__init__.py**

```python
# backend/app/models/__init__.py
from app.models.material import Base, Material

__all__ = ["Base", "Material"]
```

**Step 5: 运行测试验证通过**

Run: `cd backend && pytest tests/unit/models/test_material.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add backend/app/models/ tests/unit/models/
git commit -m "feat: add Material model"
```

---

## Task 2: 创建 Materials 数据库迁移

**Files:**
- Create: `backend/alembic/versions/001_create_materials_table.py`

**Step 1: 生成迁移文件**

```bash
cd backend && alembic revision -m "create materials table"
```

**Step 2: 编写迁移脚本**

```python
# backend/alembic/versions/001_create_materials_table.py
"""create materials table

Revision ID: 001
Revises:
Create Date: 2026-02-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'materials',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('spec', sa.String(255), nullable=True),
        sa.Column('std_price', sa.Numeric(10, 4), nullable=False, server_default='0'),
        sa.Column('vave_price', sa.Numeric(10, 4), nullable=True),
        sa.Column('supplier_tier', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )


def downgrade() -> None:
    op.drop_table('materials')
```

**Step 3: 执行迁移**

```bash
cd backend && alembic upgrade head
```

Expected: `Running upgrade -> 001`

**Step 4: 验证表创建**

```bash
docker exec smartquote-mysql mysql -usmartquote -psmartpassword smartquote -e "DESCRIBE materials"
```

Expected: 显示 materials 表结构

**Step 5: Commit**

```bash
git add backend/alembic/versions/
git commit -m "feat: create materials table migration"
```

---

## Task 3: 创建 Material Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/material.py`
- Create: `backend/app/core/value_objects.py`

**Step 1: 编写测试**

```python
# tests/unit/schemas/test_material.py
import pytest
from decimal import Decimal
from app.schemas.material import MaterialCreate, MaterialResponse, MaterialListResponse


def test_material_create_schema():
    """验证 MaterialCreate schema"""
    data = {
        "id": "TEST-001",
        "name": "测试物料",
        "spec": "规格",
        "std_price": "100.50",
        "vave_price": "85.00",
        "supplier_tier": "A"
    }
    schema = MaterialCreate(**data)
    assert schema.id == "TEST-001"
    assert schema.std_price == Decimal("100.50")


def test_material_response_schema():
    """验证 MaterialResponse schema"""
    data = {
        "id": "TEST-001",
        "name": "测试物料",
        "spec": "规格",
        "std_price": "100.50",
        "vave_price": "85.00",
        "supplier_tier": "A"
    }
    schema = MaterialResponse(**data)
    assert schema.id == "TEST-001"
```

**Step 2: 运行测试验证失败**

Run: `cd backend && pytest tests/unit/schemas/test_material.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: 实现基础值对象**

```python
# backend/app/core/value_objects.py
from pydantic import BaseModel, Field
from decimal import Decimal


class PricePair(BaseModel):
    """双轨价格封装"""
    std: Decimal = Field(..., description="标准成本")
    vave: Decimal = Field(..., description="VAVE 目标成本")
    savings: Decimal = Field(..., description="价差 = std - vave")
    savings_rate: float = Field(..., description="价差比例 = savings / std * 100")

    @classmethod
    def from_prices(cls, std: Decimal, vave: Decimal | None = None) -> "PricePair":
        """从标准价和可选 VAVE 价创建"""
        if vave is None:
            vave = std
        savings = std - vave
        savings_rate = float(savings / std * 100) if std > 0 else 0.0
        return cls(std=std, vave=vave, savings=savings, savings_rate=savings_rate)


class ExtractedFeature(BaseModel):
    """AI 提取的工艺特征"""
    process: str = Field(..., description="工艺名称")
    count: int = Field(..., description="数量", ge=0)
    unit: str = Field(default="次", description="单位")
```

**Step 4: 实现 Material Schemas**

```python
# backend/app/schemas/material.py
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional


class MaterialBase(BaseModel):
    """物料基础字段"""
    name: str = Field(..., min_length=1, max_length=100, description="物料名称")
    spec: Optional[str] = Field(None, max_length=255, description="规格说明")
    std_price: Decimal = Field(..., ge=0, description="标准单价")
    vave_price: Optional[Decimal] = Field(None, ge=0, description="VAVE 单价")
    supplier_tier: Optional[str] = Field(None, max_length=20, description="供应商等级")


class MaterialCreate(MaterialBase):
    """创建物料"""
    id: str = Field(..., min_length=1, max_length=50, description="物料编码")


class MaterialUpdate(MaterialBase):
    """更新物料"""
    pass  # id 不在更新字段中


class MaterialResponse(MaterialBase):
    """物料响应"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MaterialListResponse(BaseModel):
    """物料列表响应"""
    total: int
    items: list[MaterialResponse]
    page: int
    page_size: int


class MaterialImportResult(BaseModel):
    """物料导入结果"""
    success_count: int
    failed_count: int
    failed_rows: list[dict]  # {row: int, reason: str, data: dict}
```

**Step 5: 更新 schemas/__init__.py**

```python
# backend/app/schemas/__init__.py
from app.schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
    MaterialListResponse,
    MaterialImportResult,
)

__all__ = [
    "MaterialCreate",
    "MaterialUpdate",
    "MaterialResponse",
    "MaterialListResponse",
    "MaterialImportResult",
]
```

**Step 6: 运行测试验证通过**

Run: `cd backend && pytest tests/unit/schemas/test_material.py -v`
Expected: PASS

**Step 7: Commit**

```bash
git add backend/app/schemas/ backend/app/core/value_objects.py tests/unit/schemas/
git commit -m "feat: add material schemas and value objects"
```

---

## Task 4: 创建 Material Service

**Files:**
- Create: `backend/app/services/material_service.py`
- Create: `backend/app/core/database.py`

**Step 1: 编写测试**

```python
# tests/unit/services/test_material_service.py
import pytest
from decimal import Decimal
from app.services.material_service import MaterialService
from app.schemas.material import MaterialCreate


@pytest.mark.asyncio
async def test_create_material(mock_db_session):
    """验证创建物料"""
    service = MaterialService(mock_db_session)
    data = MaterialCreate(
        id="TEST-001",
        name="测试物料",
        std_price=Decimal("100.50"),
        vave_price=Decimal("85.00")
    )

    result = await service.create(data)

    assert result.id == "TEST-001"
    assert result.name == "测试物料"
    assert result.std_price == Decimal("100.50")


@pytest.mark.asyncio
async def test_get_material_by_id(mock_db_session):
    """验证通过 ID 获取物料"""
    service = MaterialService(mock_db_session)
    # 先创建
    data = MaterialCreate(
        id="TEST-001",
        name="测试物料",
        std_price=Decimal("100.50")
    )
    await service.create(data)

    # 查询
    result = await service.get_by_id("TEST-001")

    assert result is not None
    assert result.id == "TEST-001"
```

**Step 2: 运行测试验证失败**

Run: `cd backend && pytest tests/unit/services/test_material_service.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: 实现数据库连接管理**

```python
# backend/app/core/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """获取数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

**Step 4: 实现 Material Service**

```python
# backend/app/services/material_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from decimal import Decimal

from app.models.material import Material
from app.schemas.material import MaterialCreate, MaterialUpdate, MaterialResponse, MaterialListResponse
from app.core.database import get_db


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
```

**Step 5: 添加测试 fixture**

```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.models.material import Base


@pytest.fixture
async def mock_db_session():
    """Mock 数据库会话"""
    # 使用内存 SQLite 测试
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        yield session
```

**Step 6: 运行测试验证通过**

Run: `cd backend && pytest tests/unit/services/test_material_service.py -v`
Expected: PASS

**Step 7: Commit**

```bash
git add backend/app/services/ backend/app/core/database.py tests/ tests/conftest.py
git commit -m "feat: add material service"
```

---

## Task 5: 创建 Materials API 路由

**Files:**
- Create: `backend/app/api/v1/materials.py`
- Modify: `backend/app/main.py`

**Step 1: 编写 API 集成测试**

```python
# tests/integration/api/test_materials.py
import pytest
from decimal import Decimal
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_material(async_client: AsyncClient):
    """验证创建物料 API"""
    response = await async_client.post(
        "/api/v1/materials",
        json={
            "id": "TEST-001",
            "name": "测试物料",
            "std_price": "100.50",
            "vave_price": "85.00"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "TEST-001"
    assert data["name"] == "测试物料"


@pytest.mark.asyncio
async def test_get_material(async_client: AsyncClient):
    """验证获取物料 API"""
    # 先创建
    await async_client.post(
        "/api/v1/materials",
        json={"id": "TEST-002", "name": "测试", "std_price": "100"}
    )

    response = await async_client.get("/api/v1/materials/TEST-002")
    assert response.status_code == 200
    assert response.json()["id"] == "TEST-002"


@pytest.mark.asyncio
async def test_list_materials(async_client: AsyncClient):
    """验证列表查询 API"""
    response = await async_client.get("/api/v1/materials?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
```

**Step 2: 运行测试验证失败**

Run: `cd backend && pytest tests/integration/api/test_materials.py -v`
Expected: FAIL with "404 Not Found"

**Step 3: 实现 API 路由**

```python
# backend/app/api/v1/materials.py
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
    MaterialListResponse,
    MaterialImportResult,
)
from app.services.material_service import MaterialService
from app.core.database import get_db

router = APIRouter(prefix="/materials", tags=["materials"])


@router.post("", response_model=MaterialResponse)
async def create_material(
    data: MaterialCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建物料"""
    service = MaterialService(db)
    return await service.create(data)


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(
    material_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取物料详情"""
    service = MaterialService(db)
    result = await service.get_by_id(material_id)
    if not result:
        raise HTTPException(status_code=404, detail="物料不存在")
    return result


@router.put("/{material_id}", response_model=MaterialResponse)
async def update_material(
    material_id: str,
    data: MaterialUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新物料"""
    service = MaterialService(db)
    result = await service.update(material_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="物料不存在")
    return result


@router.delete("/{material_id}")
async def delete_material(
    material_id: str,
    db: AsyncSession = Depends(get_db),
):
    """删除物料"""
    service = MaterialService(db)
    success = await service.delete(material_id)
    if not success:
        raise HTTPException(status_code=404, detail="物料不存在")
    return {"message": "删除成功"}


@router.get("", response_model=MaterialListResponse)
async def list_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """分页查询物料"""
    service = MaterialService(db)
    return await service.list(page, page_size, search)


@router.post("/import", response_model=MaterialImportResult)
async def import_materials(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Excel 批量导入物料"""
    from openpyxl import load_workbook

    service = MaterialService(db)

    # 读取 Excel
    contents = await file.read()
    workbook = load_workbook(filename=BytesIO(contents))
    sheet = workbook.active

    items = []
    errors = []

    # 从第 2 行开始（第 1 行是表头）
    for idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        try:
            # 假设 Excel 列顺序: id, name, spec, std_price, vave_price, supplier_tier
            item = MaterialCreate(
                id=str(row[0]),
                name=str(row[1]),
                spec=str(row[2]) if row[2] else None,
                std_price=Decimal(str(row[3])),
                vave_price=Decimal(str(row[4])) if row[4] else None,
                supplier_tier=str(row[5]) if row[5] else None,
            )
            items.append(item)
        except Exception as e:
            errors.append({"row": idx, "reason": str(e), "data": row})

    success_count, failed_count, failed_rows = await service.bulk_import(items)

    return MaterialImportResult(
        success_count=success_count,
        failed_count=failed_count + len(errors),
        failed_rows=failed_rows + errors,
    )
```

**Step 4: 注册路由**

```python
# backend/app/main.py (修改)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="SmartQuote API",
    description="AI 智能报价系统 - 双轨核算",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "SmartQuote API v2.0", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "healthy", "database": "connected"}


# 导入路由
from app.api.v1.materials import router as materials_router

app.include_router(materials_router, prefix=settings.api_v1_prefix)
```

**Step 5: 添加导入**

```python
# 在 materials.py 顶部添加
from io import BytesIO
```

**Step 6: 运行测试验证通过**

Run: `cd backend && pytest tests/integration/api/test_materials.py -v`
Expected: PASS

**Step 7: Commit**

```bash
git add backend/app/api/
git commit -m "feat: add materials API routes"
```

---

## Task 6: 前端物料库页面（基础版）

**Files:**
- Create: `frontend/lib/api/materials.ts`
- Create: `frontend/app/dashboard/materials/page.tsx`
- Create: `frontend/components/materials-table.tsx`

**Step 1: 创建 API 客户端**

```typescript
// frontend/lib/api/client.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`)
  }
  return res.json()
}
```

```typescript
// frontend/lib/api/materials.ts
import { fetcher } from './api/client'

export interface Material {
  id: string
  name: string
  spec?: string
  std_price: string
  vave_price?: string
  supplier_tier?: string
  created_at: string
  updated_at: string
}

export interface MaterialListResponse {
  total: number
  items: Material[]
  page: number
  page_size: number
}

export async function getMaterials(page = 1, pageSize = 20, search?: string) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })
  if (search) params.set('search', search)

  return fetcher(`/api/v1/materials?${params}`) as Promise<MaterialListResponse>
}

export async function getMaterial(id: string) {
  return fetcher(`/api/v1/materials/${id}`) as Promise<Material>
}

export async function createMaterial(data: Partial<Material>) {
  return fetcher('/api/v1/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<Material>
}

export async function updateMaterial(id: string, data: Partial<Material>) {
  return fetcher(`/api/v1/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }) as Promise<Material>
}

export async function deleteMaterial(id: string) {
  return fetcher(`/api/v1/materials/${id}`, { method: 'DELETE' })
}

export async function importMaterials(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/materials/import`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Import failed')
  return res.json()
}
```

**Step 2: 创建物料表格组件**

```typescript
// frontend/components/materials-table.tsx
'use client'

import { useState } from 'react'
import { Material, getMaterials, deleteMaterial } from '@/lib/api/materials'

export function MaterialsTable() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const data = await getMaterials(page, 20)
      setMaterials(data.items)
    } catch (error) {
      console.error('Failed to load materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此物料？')) return
    try {
      await deleteMaterial(id)
      loadMaterials()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">物料库</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          新增物料
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">物料编码</th>
              <th className="border p-2 text-left">名称</th>
              <th className="border p-2 text-left">规格</th>
              <th className="border p-2 text-right">标准价</th>
              <th className="border p-2 text-right">VAVE价</th>
              <th className="border p-2 text-left">供应商等级</th>
              <th className="border p-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="border p-2">{m.id}</td>
                <td className="border p-2">{m.name}</td>
                <td className="border p-2">{m.spec || '-'}</td>
                <td className="border p-2 text-right">¥{m.std_price}</td>
                <td className="border p-2 text-right">¥{m.vave_price || '-'}</td>
                <td className="border p-2">{m.supplier_tier || '-'}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

**Step 3: 创建物料库页面**

```typescript
// frontend/app/dashboard/materials/page.tsx
import { MaterialsTable } from '@/components/materials-table'

export default function MaterialsPage() {
  return <MaterialsTable />
}
```

**Step 4: 更新导航**

```typescript
// frontend/app/layout.tsx (添加)
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <nav className="border-b p-4 flex gap-4">
          <Link href="/">首页</Link>
          <Link href="/dashboard/materials">物料库</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

**Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: add materials library page"
```

---

## ✅ 完成标准

- [ ] Materials 数据表创建完成
- [ ] CRUD API 全部可用
- [ ] Excel 导入接口可用
- [ ] 前端列表页可正常显示
- [ ] 测试覆盖率 > 80%

**下一步:** 执行 `02-process-rates.md`（工艺费率配置）
