# 工艺费率配置实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现工艺费率表 CRUD 和默认种子数据功能

**Architecture:** RESTful API + SQLAlchemy ORM，与物料库类似但更简单

**Tech Stack:** FastAPI, Alembic

---

## Task 1: 创建 ProcessRate 数据库模型

**Files:**
- Create: `backend/app/models/process_rate.py`
- Modify: `backend/app/models/__init__.py`

**Step 1: 编写测试**

```python
# tests/unit/models/test_process_rate.py
import pytest
from decimal import Decimal
from app.models.process_rate import ProcessRate


def test_process_rate_model():
    """验证 ProcessRate 模型"""
    rate = ProcessRate(
        id=1,
        process_name="激光切割",
        std_mhr=Decimal("50.00"),
        std_labor=Decimal("30.00"),
        vave_mhr=Decimal("45.00"),
        vave_labor=Decimal("25.00"),
        efficiency_factor=Decimal("1.0"),
    )
    assert rate.process_name == "激光切割"
    assert rate.std_mhr == Decimal("50.00")
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/models/test_process_rate.py -v`
Expected: FAIL

**Step 3: 实现 ProcessRate 模型**

```python
# backend/app/models/process_rate.py
from sqlalchemy import Column, Integer, String, Numeric, func
from app.models.material import Base


class ProcessRate(Base):
    """工艺费率表"""
    __tablename__ = "process_rates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    process_name = Column(String(100), nullable=False, unique=True)
    std_mhr = Column(Numeric(10, 2), nullable=False, default=0)  # 标准机时费
    std_labor = Column(Numeric(10, 2), nullable=False, default=0)  # 标准人工费
    vave_mhr = Column(Numeric(10, 2), nullable=True)  # 优化机时费
    vave_labor = Column(Numeric(10, 2), nullable=True)  # 优化人工费
    efficiency_factor = Column(Numeric(4, 2), nullable=False, default=1.0)
    created_at = Column(Integer, server_default=func.now())
    updated_at = Column(Integer, server_default=func.now(), onupdate=func.now())
```

**Step 4: 更新 __init__.py**

```python
# backend/app/models/__init__.py
from app.models.material import Base, Material
from app.models.process_rate import ProcessRate

__all__ = ["Base", "Material", "ProcessRate"]
```

**Step 5: 运行测试验证通过**

Run: `pytest tests/unit/models/test_process_rate.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add backend/app/models/ tests/unit/models/
git commit -m "feat: add ProcessRate model"
```

---

## Task 2: 创建 ProcessRate 迁移和种子数据

**Files:**
- Create: `backend/alembic/versions/002_create_process_rates_table.py`

**Step 1: 生成迁移**

```bash
cd backend && alembic revision -m "create process_rates table"
```

**Step 2: 编写迁移（含种子数据）**

```python
# backend/alembic/versions/002_create_process_rates_table.py
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'process_rates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('process_name', sa.String(100), nullable=False),
        sa.Column('std_mhr', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('std_labor', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('vave_mhr', sa.Numeric(10, 2), nullable=True),
        sa.Column('vave_labor', sa.Numeric(10, 2), nullable=True),
        sa.Column('efficiency_factor', sa.Numeric(4, 2), nullable=False, server_default='1.0'),
        sa.Column('created_at', sa.Integer(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.Integer(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('process_name')
    )

    # 插入种子数据
    op.bulk_insert(
        sa.table(
            'process_rates',
            sa.column('id', sa.Integer),
            sa.column('process_name', sa.String),
            sa.column('std_mhr', sa.Numeric),
            sa.column('std_labor', sa.Numeric),
            sa.column('vave_mhr', sa.Numeric),
            sa.column('vave_labor', sa.Numeric),
            sa.column('efficiency_factor', sa.Numeric),
        ),
        [
            {
                'id': 1,
                'process_name': '激光切割',
                'std_mhr': '50.00',
                'std_labor': '30.00',
                'vave_mhr': '45.00',
                'vave_labor': '25.00',
                'efficiency_factor': '1.0',
            },
            {
                'id': 2,
                'process_name': '折弯',
                'std_mhr': '40.00',
                'std_labor': '25.00',
                'vave_mhr': '35.00',
                'vave_labor': '20.00',
                'efficiency_factor': '1.0',
            },
            {
                'id': 3,
                'process_name': '焊接',
                'std_mhr': '60.00',
                'std_labor': '40.00',
                'vave_mhr': '50.00',
                'vave_labor': '35.00',
                'efficiency_factor': '1.0',
            },
            {
                'id': 4,
                'process_name': '表面处理',
                'std_mhr': '20.00',
                'std_labor': '15.00',
                'vave_mhr': '18.00',
                'vave_labor': '12.00',
                'efficiency_factor': '1.0',
            },
            {
                'id': 5,
                'process_name': '划线',
                'std_mhr': '10.00',
                'std_labor': '10.00',
                'vave_mhr': '8.00',
                'vave_labor': '8.00',
                'efficiency_factor': '1.0',
            },
        ]
    )


def downgrade() -> None:
    op.drop_table('process_rates')
```

**Step 3: 执行迁移**

```bash
cd backend && alembic upgrade head
```

**Step 4: 验证种子数据**

```bash
docker exec smartquote-mysql mysql -usmartquote -psmartpassword smartquote -e "SELECT * FROM process_rates"
```

Expected: 显示 5 条种子数据

**Step 5: Commit**

```bash
git add backend/alembic/versions/
git commit -m "feat: create process_rates table with seed data"
```

---

## Task 3: 创建 ProcessRate Schemas 和 Service

**Files:**
- Create: `backend/app/schemas/process_rate.py`
- Create: `backend/app/services/process_rate_service.py`

**Step 1: 实现 Schemas**

```python
# backend/app/schemas/process_rate.py
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime


class ProcessRateBase(BaseModel):
    """工艺费率基础字段"""
    process_name: str = Field(..., min_length=1, max_length=100)
    std_mhr: Decimal = Field(..., ge=0, description="标准机时费")
    std_labor: Decimal = Field(..., ge=0, description="标准人工费")
    vave_mhr: Decimal | None = Field(None, ge=0, description="优化机时费")
    vave_labor: Decimal | None = Field(None, ge=0, description="优化人工费")
    efficiency_factor: Decimal = Field(default=Decimal("1.0"), ge=0, le=2, description="效率系数")


class ProcessRateCreate(ProcessRateBase):
    """创建工艺费率"""
    pass


class ProcessRateUpdate(ProcessRateBase):
    """更新工艺费率"""
    pass


class ProcessRateResponse(ProcessRateBase):
    """工艺费率响应"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProcessRateListResponse(BaseModel):
    """工艺费率列表响应"""
    total: int
    items: list[ProcessRateResponse]
```

**Step 2: 实现 Service**

```python
# backend/app/services/process_rate_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from decimal import Decimal

from app.models.process_rate import ProcessRate
from app.schemas.process_rate import ProcessRateCreate, ProcessRateUpdate, ProcessRateResponse, ProcessRateListResponse


class ProcessRateService:
    """工艺费率服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: ProcessRateCreate) -> ProcessRateResponse:
        """创建工艺费率"""
        rate = ProcessRate(**data.model_dump())
        self.db.add(rate)
        await self.db.flush()
        await self.db.refresh(rate)
        return ProcessRateResponse.model_validate(rate)

    async def get_by_id(self, rate_id: int) -> ProcessRateResponse | None:
        """通过 ID 获取"""
        result = await self.db.execute(select(ProcessRate).where(ProcessRate.id == rate_id))
        rate = result.scalar_one_or_none()
        return ProcessRateResponse.model_validate(rate) if rate else None

    async def get_by_name(self, process_name: str) -> ProcessRateResponse | None:
        """通过工艺名称获取"""
        result = await self.db.execute(
            select(ProcessRate).where(ProcessRate.process_name == process_name)
        )
        rate = result.scalar_one_or_none()
        return ProcessRateResponse.model_validate(rate) if rate else None

    async def list(self) -> ProcessRateListResponse:
        """获取所有工艺费率"""
        result = await self.db.execute(select(ProcessRate))
        rates = result.scalars().all()
        return ProcessRateListResponse(
            total=len(rates),
            items=[ProcessRateResponse.model_validate(r) for r in rates],
        )

    async def update(self, rate_id: int, data: ProcessRateUpdate) -> ProcessRateResponse | None:
        """更新工艺费率"""
        result = await self.db.execute(select(ProcessRate).where(ProcessRate.id == rate_id))
        rate = result.scalar_one_or_none()
        if not rate:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(rate, field, value)

        await self.db.flush()
        await self.db.refresh(rate)
        return ProcessRateResponse.model_validate(rate)

    async def delete(self, rate_id: int) -> bool:
        """删除工艺费率"""
        result = await self.db.execute(select(ProcessRate).where(ProcessRate.id == rate_id))
        rate = result.scalar_one_or_none()
        if not rate:
            return False
        await self.db.delete(rate)
        return True
```

**Step 3: Commit**

```bash
git add backend/app/schemas/ backend/app/services/
git commit -m "feat: add process rate schemas and service"
```

---

## Task 4: 创建 ProcessRate API

**Files:**
- Create: `backend/app/api/v1/process_rates.py`

**Step 1: 实现 API 路由**

```python
# backend/app/api/v1/process_rates.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.process_rate import (
    ProcessRateCreate,
    ProcessRateUpdate,
    ProcessRateResponse,
    ProcessRateListResponse,
)
from app.services.process_rate_service import ProcessRateService
from app.core.database import get_db

router = APIRouter(prefix="/process-rates", tags=["process-rates"])


@router.post("", response_model=ProcessRateResponse)
async def create_process_rate(
    data: ProcessRateCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建工艺费率"""
    service = ProcessRateService(db)
    return await service.create(data)


@router.get("", response_model=ProcessRateListResponse)
async def list_process_rates(db: AsyncSession = Depends(get_db)):
    """获取所有工艺费率"""
    service = ProcessRateService(db)
    return await service.list()


@router.get("/{rate_id}", response_model=ProcessRateResponse)
async def get_process_rate(
    rate_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取工艺费率详情"""
    service = ProcessRateService(db)
    result = await service.get_by_id(rate_id)
    if not result:
        raise HTTPException(status_code=404, detail="工艺费率不存在")
    return result


@router.put("/{rate_id}", response_model=ProcessRateResponse)
async def update_process_rate(
    rate_id: int,
    data: ProcessRateUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新工艺费率"""
    service = ProcessRateService(db)
    result = await service.update(rate_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="工艺费率不存在")
    return result


@router.delete("/{rate_id}")
async def delete_process_rate(
    rate_id: int,
    db: AsyncSession = Depends(get_db),
):
    """删除工艺费率"""
    service = ProcessRateService(db)
    success = await service.delete(rate_id)
    if not success:
        raise HTTPException(status_code=404, detail="工艺费率不存在")
    return {"message": "删除成功"}
```

**Step 2: 注册路由**

```python
# backend/app/main.py (添加)
from app.api.v1.process_rates import router as process_rates_router

app.include_router(process_rates_router, prefix=settings.api_v1_prefix)
```

**Step 3: 测试 API**

```bash
# 获取所有费率
curl http://localhost:8000/api/v1/process-rates

# 预期返回 5 条种子数据
```

**Step 4: Commit**

```bash
git add backend/app/api/
git commit -m "feat: add process rates API routes"
```

---

## ✅ 完成标准

- [ ] process_rates 数据表创建完成
- [ ] 5 条种子数据插入成功
- [ ] CRUD API 全部可用
- [ ] 测试覆盖率 > 80%

**下一步:** 执行 `03-bom-parser.md`（BOM 解析引擎）
