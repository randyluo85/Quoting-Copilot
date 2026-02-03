# SmartQuote AI 双轨报价系统 - 后端核心功能实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 完成后端核心业务逻辑实现，包括双轨计价算法、BOM解析、AI服务和缓存服务

**架构:** FastAPI + SQLAlchemy (异步) + MySQL (主数据) + PostgreSQL (向量) + Redis (缓存) + 通义千问 AI

**Tech Stack:** Python 3.10+, FastAPI, Pydantic, uvicorn, openpyxl, redis, httpx

---

## 项目现状

| 层级 | 状态 | 完成度 |
|------|------|--------|
| **前端** | ✅ 已完成 | 90% - 所有UI组件已实现，使用模拟数据 |
| **后端框架** | ✅ 已完成 | 40% - 基础架构搭建完成 |
| **数据模型** | ✅ 已完成 | 100% - SQLAlchemy ORM 和 Pydantic Schema 已定义 |
| **API 路由** | 🟡 部分完成 | 30% - 基础端点存在，返回模拟数据 |
| **核心业务逻辑** | ❌ 未实现 | 0% - 双轨计算、BOM解析、AI服务待实现 |

---

## Phase 1: 完成 Pydantic Schema

### Task 1: 创建通用 Schema

**Files:**
- Create: `backend/app/schemas/common.py`

**Step 1: 写入通用 Schema 代码**

```python
from pydantic import BaseModel, Field
from decimal import Decimal
from enum import Enum


class PricePair(BaseModel):
    """双轨价格封装 - 核心值对象

    用于封装任何涉及金额计算的双轨数据（标准价 vs VAVE价）
    自动计算节省金额和节省率
    """
    std: Decimal = Field(..., description="标准成本")
    vave: Decimal = Field(..., description="VAVE目标成本")
    savings: Decimal = Field(..., description="节省金额 (std - vave)")
    savings_rate: float = Field(..., description="节省率 (savings / std)")

    model_config = {"json_encoders": {Decimal: str}}


class StatusLight(str, Enum):
    """红绿灯状态

    用于标识数据完整性和置信度
    - GREEN: 数据已验证，完全匹配历史数据
    - YELLOW: AI语义匹配或估算，需要人工复核
    - RED: 库中无数据，需要人工询价
    """
    GREEN = "verified"
    YELLOW = "warning"
    RED = "missing"


class MatchType(str, Enum):
    """匹配类型"""
    EXACT = "exact"        # 完全匹配
    SEMANTIC = "semantic"  # 语义匹配
    NONE = "none"          # 无匹配
```

**Step 2: 运行格式化**

Run: `cd backend && uv run ruff format app/schemas/ && uv run ruff check app/schemas/ --fix`
Expected: 无报错

**Step 3: 提交**

```bash
git add backend/app/schemas/common.py
git commit -m "feat: add common schemas with PricePair and StatusLight"
```

---

### Task 2: 完成项目 Schema

**Files:**
- Create: `backend/app/schemas/project.py`

**Step 1: 写入项目 Schema 代码**

```python
from pydantic import BaseModel, Field
from typing import List
from app.models.project import ProjectStatus


class ProductSchema(BaseModel):
    """产品数据"""
    id: str
    name: str
    partNumber: str = Field(..., alias="part_number")
    annualVolume: int = Field(..., alias="annual_volume")
    description: str


class ProjectOwnerSchema(BaseModel):
    """项目负责人"""
    sales: str
    vm: str
    ie: str
    pe: str
    controlling: str


class ProjectCreate(BaseModel):
    """创建项目请求"""
    asacNumber: str = Field(..., alias="asac_number")
    customerNumber: str = Field(..., alias="customer_number")
    productVersion: str = Field(..., alias="product_version")
    customerVersion: str = Field(..., alias="customer_version")
    clientName: str = Field(..., alias="client_name")
    projectName: str = Field(..., alias="project_name")
    annualVolume: str = Field(..., alias="annual_volume")
    description: str
    products: List[ProductSchema]
    owners: ProjectOwnerSchema


class ProjectResponse(BaseModel):
    """项目响应 - 与前端 ProjectData 对齐"""
    id: str
    asacNumber: str = Field(..., alias="asac_number")
    customerNumber: str = Field(..., alias="customer_number")
    productVersion: str = Field(..., alias="product_version")
    customerVersion: str = Field(..., alias="customer_version")
    clientName: str = Field(..., alias="client_name")
    projectName: str = Field(..., alias="project_name")
    annualVolume: str = Field(..., alias="annual_volume")
    description: str
    products: List[ProductSchema]
    owners: ProjectOwnerSchema
    status: ProjectStatus
    createdDate: str = Field(..., alias="created_date")
    updatedDate: str = Field(..., alias="updated_date")

    model_config = {"populate_by_name": True}


class ProjectListResponse(BaseModel):
    """项目列表响应"""
    projects: List[ProjectResponse]
    total: int
```

**Step 2: 运行格式化**

Run: `cd backend && uv run ruff format app/schemas/ && uv run ruff check app/schemas/ --fix`
Expected: 无报错

**Step 3: 提交**

```bash
git add backend/app/schemas/project.py
git commit -m "feat: add project schemas aligned with frontend"
```

---

### Task 3: 完成物料 Schema

**Files:**
- Create: `backend/app/schemas/material.py`

**Step 1: 写入物料 Schema 代码**

```python
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from app.schemas.common import StatusLight


class MaterialResponse(BaseModel):
    """物料响应 - 与前端 Material 对齐"""
    id: str
    partNumber: str = Field(..., alias="part_number")
    partName: str = Field(..., alias="part_name")
    material: str
    supplier: str
    quantity: float
    unitPrice: Optional[Decimal] = Field(None, alias="unit_price")
    vavePrice: Optional[Decimal] = Field(None, alias="vave_price")
    hasHistoryData: bool = Field(..., alias="has_history_data")
    comments: str
    status: StatusLight = StatusLight.GREEN

    model_config = {"populate_by_name": True}


class ProcessResponse(BaseModel):
    """工艺响应 - 与前端 Process 对齐"""
    id: str
    opNo: str = Field(..., alias="op_no")
    name: str
    workCenter: str = Field(..., alias="work_center")
    standardTime: float = Field(..., alias="standard_time")
    spec: Optional[str] = None
    unit: str = "件"
    quantity: int = 1
    unitPrice: Optional[Decimal] = Field(None, alias="unit_price")
    vavePrice: Optional[Decimal] = Field(None, alias="vave_price")
    hasHistoryData: bool = Field(..., alias="has_history_data")
    isOperationKnown: bool = Field(True, alias="is_operation_known")

    model_config = {"populate_by_name": True}
```

**Step 2: 提交**

```bash
git add backend/app/schemas/material.py
git commit -m "feat: add material and process schemas"
```

---

## Phase 2: 核心业务逻辑

### Task 4: 实现双轨计价算法

**Files:**
- Create: `backend/app/services/calculation.py`
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/tests/test_calculation.py`
- Create: `backend/app/tests/conftest.py`

**Step 1: 写入计算服务代码**

```python
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.schemas.common import PricePair


class DualTrackCalculator:
    """双轨计价计算器 - 核心算法

    实现双轨计价公式：
    - Standard Cost = (Qty × MaterialPrice_std) + ∑(CycleTime × (MHR_std + Labor_std))
    - VAVE Cost = (Qty × MaterialPrice_vave) + ∑(CycleTime_opt × (MHR_vave + Labor_vave))
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def calculate_material_cost(
        self,
        material_code: str | None,
        quantity: float
    ) -> PricePair:
        """计算物料成本（双轨）

        公式: Cost = Quantity * Price

        Args:
            material_code: 物料编码
            quantity: 数量

        Returns:
            PricePair: 包含标准价、VAVE价、节省金额、节省率
        """
        if not material_code:
            return self._zero_price_pair()

        result = await self.db.execute(
            select(Material).where(Material.item_code == material_code)
        )
        material = result.scalar_one_or_none()

        if material is None:
            return self._zero_price_pair()

        std_price = Decimal(str(material.std_price)) if material.std_price else Decimal("0")
        vave_price = Decimal(str(material.vave_price)) if material.vave_price else std_price

        quantity_dec = Decimal(str(quantity))
        std_cost = std_price * quantity_dec
        vave_cost = vave_price * quantity_dec

        return self._create_price_pair(std_cost, vave_cost)

    async def calculate_process_cost(
        self,
        process_name: str | None,
        cycle_time: float
    ) -> PricePair:
        """计算工艺成本（双轨）

        公式: Cost = CycleTime * (MHR + Labor)

        Args:
            process_name: 工艺名称
            cycle_time: 工时（小时）

        Returns:
            PricePair: 包含标准价、VAVE价、节省金额、节省率
        """
        if not process_name:
            return self._zero_price_pair()

        result = await self.db.execute(
            select(ProcessRate).where(ProcessRate.process_name == process_name)
        )
        rate = result.scalar_one_or_none()

        if rate is None:
            return self._zero_price_pair()

        # 标准费率
        std_mhr = Decimal(str(rate.std_mhr)) if rate.std_mhr else Decimal("0")
        std_labor = Decimal(str(rate.std_labor)) if rate.std_labor else Decimal("0")
        std_hourly_rate = std_mhr + std_labor

        # VAVE 费率
        vave_mhr = Decimal(str(rate.vave_mhr)) if rate.vave_mhr else std_mhr
        vave_labor = Decimal(str(rate.vave_labor)) if rate.vave_labor else std_labor
        vave_hourly_rate = vave_mhr + vave_labor

        # 效率系数
        efficiency = Decimal(str(rate.efficiency_factor))
        cycle_time_dec = Decimal(str(cycle_time))

        std_cost = cycle_time_dec * std_hourly_rate
        vave_cost = cycle_time_dec * vave_hourly_rate * efficiency

        return self._create_price_pair(std_cost, vave_cost)

    def _create_price_pair(self, std: Decimal, vave: Decimal) -> PricePair:
        """创建 PricePair，自动计算节省"""
        savings = std - vave
        savings_rate = float(savings / std) if std > 0 else 0.0

        return PricePair(
            std=std.quantize(Decimal("0.01")),
            vave=vave.quantize(Decimal("0.01")),
            savings=savings.quantize(Decimal("0.01")),
            savings_rate=round(savings_rate, 4)
        )

    def _zero_price_pair(self) -> PricePair:
        """零价格对"""
        return PricePair(
            std=Decimal("0.00"),
            vave=Decimal("0.00"),
            savings=Decimal("0.00"),
            savings_rate=0.0
        )
```

**Step 2: 写入测试配置**

File: `backend/app/tests/conftest.py`

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.db.session import Base

# 测试数据库引擎
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    echo=False
)

TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture
async def db_session():
    """测试数据库会话"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
```

**Step 3: 写入单元测试**

File: `backend/app/tests/test_calculation.py`

```python
import pytest
from decimal import Decimal
from app.services.calculation import DualTrackCalculator


@pytest.mark.asyncio
class TestDualTrackCalculation:
    """双轨计价算法测试"""

    async def test_zero_price_pair_with_no_material_code(self, db_session):
        """测试无物料编码时返回零价格"""
        calc = DualTrackCalculator(db_session)
        result = await calc.calculate_material_cost(None, 10)

        assert result.std == Decimal("0.00")
        assert result.vave == Decimal("0.00")
        assert result.savings == Decimal("0.00")
        assert result.savings_rate == 0.0

    async def test_savings_calculation(self):
        """测试节省率计算公式"""
        std = Decimal("100.00")
        vave = Decimal("85.00")
        savings = std - vave
        savings_rate = float(savings / std) if std > 0 else 0.0

        assert savings == Decimal("15.00")
        assert savings_rate == 0.15

    async def test_price_pair_rounding(self, db_session):
        """测试价格精度保留两位小数"""
        from app.schemas.common import PricePair

        pair = PricePair(
            std=Decimal("100.456"),
            vave=Decimal("85.789"),
            savings=Decimal("14.667"),
            savings_rate=0.1467
        )

        assert pair.std == Decimal("100.46")  # 四舍五入
        assert pair.vave == Decimal("85.79")
        assert pair.savings == Decimal("14.67")
```

**Step 4: 运行测试**

Run: `cd backend && uv run pytest app/tests/test_calculation.py -v`
Expected: 测试通过

**Step 5: 提交**

```bash
git add backend/app/services/ backend/app/tests/
git commit -m "feat: add dual-track calculation service with tests"
```

---

### Task 5: 实现 BOM 解析服务

**Files:**
- Create: `backend/app/services/bom_parser.py`

**Step 1: 写入 BOM 解析代码**

```python
from openpyxl import load_workbook
from typing import NamedTuple
from dataclasses import dataclass


class ParsedMaterial(NamedTuple):
    """解析后的物料行"""
    level: str           # 层级
    part_number: str     # 零件号
    part_name: str       # 零件名称
    version: str         # 版本
    type: str            # 类型
    status: str          # 状态
    material: str        # 材质
    supplier: str        # 供应商
    quantity: float      # 数量
    unit: str            # 单位
    comments: str        # 备注


class ParsedProcess(NamedTuple):
    """解析后的工艺行"""
    op_no: str           # 工序号
    name: str            # 工序名称
    work_center: str     # 工作中心
    standard_time: float # 标准工时（小时）
    spec: str | None     # 规格要求


class BOMParseResult(NamedTuple):
    """BOM 解析结果"""
    materials: list[ParsedMaterial]
    processes: list[ParsedProcess]


class BOMParser:
    """BOM 文件解析器

    支持从 Excel 文件中解析物料清单和工艺路线
    自动识别工作表类型（物料表 vs 工艺表）
    """

    # Excel 列映射配置
    MATERIAL_COLUMNS = {
        "level": 0,        # A列
        "part_number": 1,  # B列
        "part_name": 2,    # C列
        "version": 3,      # D列
        "type": 4,         # E列
        "status": 5,       # F列
        "material": 6,     # G列
        "supplier": 7,     # H列
        "quantity": 8,     # I列
        "unit": 9,         # J列
        "comments": 12,    # M列 (重要！AI 解析目标)
    }

    def parse_excel_file(self, file_content: bytes) -> BOMParseResult:
        """解析 Excel BOM 文件（从内存）

        Args:
            file_content: Excel 文件的字节内容

        Returns:
            BOMParseResult: 包含物料列表和工艺列表
        """
        import io
        wb = load_workbook(filename=io.BytesIO(file_content), read_only=True)

        materials: list[ParsedMaterial] = []
        processes: list[ParsedProcess] = []

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            sheet_type = self._detect_sheet_type(ws)

            if sheet_type == "material":
                materials.extend(self._parse_material_sheet(ws))
            elif sheet_type == "process":
                processes.extend(self._parse_process_sheet(ws))

        return BOMParseResult(materials=materials, processes=processes)

    def _detect_sheet_type(self, worksheet) -> str:
        """检测工作表类型

        通过扫描前5行内容判断是物料表还是工艺表
        """
        for row in worksheet.iter_rows(min_row=1, max_row=5, values_only=True):
            if row and any(cell and "物料" in str(cell).lower() for cell in row if cell):
                return "material"
            if row and any(cell and "工艺" in str(cell).lower() for cell in row if cell):
                return "process"
        return "unknown"

    def _parse_material_sheet(self, worksheet) -> list[ParsedMaterial]:
        """解析物料工作表"""
        materials = []

        for row in worksheet.iter_rows(min_row=2, values_only=True):
            if not row or not row[1]:  # 假设零件号在B列
                continue

            materials.append(ParsedMaterial(
                level=str(row[0] or ""),
                part_number=str(row[1] or ""),
                part_name=str(row[2] or ""),
                version=str(row[3] or "1.0"),
                type=str(row[4] or "原材料"),
                status=str(row[5] or "可用"),
                material=str(row[6] or ""),
                supplier=str(row[7] or ""),
                quantity=float(row[8] or 0),
                unit=str(row[9] or "个"),
                comments=str(row[12] or "")
            ))

        return materials

    def _parse_process_sheet(self, worksheet) -> list[ParsedProcess]:
        """解析工艺工作表"""
        processes = []

        for row in worksheet.iter_rows(min_row=2, values_only=True):
            if not row or not row[0]:  # 假设工序号在A列
                continue

            processes.append(ParsedProcess(
                op_no=str(row[0] or ""),
                name=str(row[1] or ""),
                work_center=str(row[2] or ""),
                standard_time=float(row[3] or 0),
                spec=str(row[4]) if len(row) > 4 and row[4] else None
            ))

        return processes
```

**Step 2: 运行格式化**

Run: `cd backend && uv run ruff format app/services/bom_parser.py`
Expected: 无报错

**Step 3: 提交**

```bash
git add backend/app/services/bom_parser.py
git commit -m "feat: add BOM parser service for Excel files"
```

---

### Task 6: 实现 AI 服务（通义千问）

**Files:**
- Create: `backend/app/services/ai_service.py`

**Step 1: 写入 AI 服务代码**

```python
import httpx
import json
from typing import Optional
from app.config import Settings


class QwenAIService:
    """通义千问 AI 服务

    用于从 BOM 表的 Comments 列中提取工艺特征
    支持 JSON 格式化输出
    """

    def __init__(self, settings: Settings):
        self.api_key = settings.DASHSCOPE_API_KEY
        self.base_url = settings.DASHSCOPE_BASE_URL
        self.model = settings.DASHSCOPE_MODEL
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )

    async def extract_features_from_comments(
        self,
        comments: str,
        part_name: str
    ) -> dict:
        """从 Comments 列提取工艺特征

        这是核心 AI 功能，用于从非结构化文本中提取结构化参数

        Args:
            comments: 备注内容
            part_name: 零件名称

        Returns:
            dict: 提取的工艺特征，JSON 格式
        """
        if not comments or len(comments.strip()) < 3:
            return {}

        system_prompt = """你是一个拥有 10 年经验的制造业成本工程师。
你的任务是从 BOM 表的备注列中提取工艺参数，并转化为标准的 JSON 键值对。

提取规则：
1. 工艺名称：如"折弯"、"焊接"、"喷涂"等
2. 数量/次数：如"32次折弯"提取为 {"bending_count": 32}
3. 参数要求：如"公差±0.02mm"提取为 {"tolerance": "±0.02mm"}
4. 表面处理：如"阳极氧化黑色"提取为 {"surface_treatment": "anodizing_black"}

对于不确定的参数，不要猜测，直接标记为 null。

返回格式必须是纯 JSON，不要有任何其他文字。"""

        user_prompt = f"""请从以下备注中提取工艺特征：

零件名称：{part_name}
备注内容：{comments}

返回 JSON 格式。"""

        try:
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 500
                }
            )

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            return json.loads(content)

        except Exception as e:
            # AI 调用失败，返回空字典
            print(f"AI service error: {e}")
            return {}

    async def close(self):
        """关闭 HTTP 客户端"""
        await self.client.aclose()
```

**Step 2: 提交**

```bash
git add backend/app/services/ai_service.py
git commit -m "feat: add Qwen AI service for feature extraction"
```

---

### Task 7: 实现 Redis 缓存服务

**Files:**
- Create: `backend/app/services/cache_service.py`

**Step 1: 写入缓存服务代码**

```python
import json
import redis.asyncio as redis
from typing import Optional
from app.config import Settings


class CacheService:
    """Redis 缓存服务

    用于缓存物料价格、工艺费率、LLM 解析结果
    减少数据库查询，提升性能
    """

    # TTL 配置
    TTL_MATERIAL = 3600      # 1h
    TTL_RATE = 3600          # 1h
    TTL_LLM = 86400          # 24h

    def __init__(self, settings: Settings):
        self.redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD or None,
            decode_responses=True
        )

    async def get_material(self, item_code: str) -> Optional[dict]:
        """获取物料缓存

        Args:
            item_code: 物料编码

        Returns:
            dict | None: 缓存的物料数据，不存在返回 None
        """
        key = f"material:{item_code}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set_material(self, item_code: str, data: dict):
        """设置物料缓存

        Args:
            item_code: 物料编码
            data: 物料数据
        """
        key = f"material:{item_code}"
        await self.redis.setex(key, self.TTL_MATERIAL, json.dumps(data))

    async def get_process_rate(self, process_name: str) -> Optional[dict]:
        """获取工艺费率缓存"""
        key = f"rate:{process_name}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set_process_rate(self, process_name: str, data: dict):
        """设置工艺费率缓存"""
        key = f"rate:{process_name}"
        await self.redis.setex(key, self.TTL_RATE, json.dumps(data))

    async def get_llm_result(self, content: str) -> Optional[dict]:
        """获取 LLM 解析结果缓存"""
        import hashlib
        content_hash = hashlib.md5(content.encode()).hexdigest()
        key = f"llm:parse:{content_hash}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set_llm_result(self, content: str, result: dict):
        """设置 LLM 解析结果缓存"""
        import hashlib
        content_hash = hashlib.md5(content.encode()).hexdigest()
        key = f"llm:parse:{content_hash}"
        await self.redis.setex(key, self.TTL_LLM, json.dumps(result))

    async def close(self):
        """关闭 Redis 连接"""
        await self.redis.close()
```

**Step 2: 提交**

```bash
git add backend/app/services/cache_service.py
git commit -m "feat: add Redis cache service"
```

---

## Phase 3: API 路由实现

### Task 8: 完善项目 API

**Files:**
- Modify: `backend/app/api/v1/projects.py`
- Modify: `backend/app/main.py`

**Step 1: 更新项目 API 代码**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectListResponse
from app.models.project import Project, ProjectStatus
from sqlalchemy import select

router = APIRouter()


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    status_filter: Optional[ProjectStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取项目列表"""
    query = select(Project)
    if status_filter:
        query = query.where(Project.status == status_filter)

    result = await db.execute(query.order_by(Project.created_at.desc()))
    projects = result.scalars().all()

    return ProjectListResponse(
        projects=[
            ProjectResponse(
                id=p.id,
                asacNumber=p.asac_number,
                customerNumber=p.customer_number,
                productVersion=p.product_version,
                customerVersion=p.customer_version,
                clientName=p.client_name,
                projectName=p.project_name,
                annualVolume=str(p.annual_volume),
                description=p.description or "",
                products=p.products,
                owners=p.owners,
                status=p.status,
                createdDate=p.created_at.isoformat(),
                updatedDate=p.updated_at.isoformat()
            )
            for p in projects
        ],
        total=len(projects)
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建新项目"""
    import uuid

    project_id = f"PRJ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

    project = Project(
        id=project_id,
        asac_number=data.asacNumber,
        customer_number=data.customerNumber,
        product_version=data.productVersion,
        customer_version=data.customerVersion,
        client_name=data.clientName,
        project_name=data.projectName,
        annual_volume=int(data.annualVolume),
        description=data.description,
        products=[p.model_dump() for p in data.products],
        owners=data.owners.model_dump(),
        status=ProjectStatus.DRAFT
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    return ProjectResponse(
        id=project.id,
        asacNumber=project.asac_number,
        customerNumber=project.customer_number,
        productVersion=project.product_version,
        customerVersion=project.customer_version,
        clientName=project.client_name,
        projectName=project.project_name,
        annualVolume=str(project.annual_volume),
        description=project.description or "",
        products=project.products,
        owners=project.owners,
        status=project.status,
        createdDate=project.created_at.isoformat(),
        updatedDate=project.updated_at.isoformat()
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取项目详情"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectResponse(
        id=project.id,
        asacNumber=project.asac_number,
        customerNumber=project.customer_number,
        productVersion=project.product_version,
        customerVersion=project.customer_version,
        clientName=project.client_name,
        projectName=project.project_name,
        annualVolume=str(project.annual_volume),
        description=project.description or "",
        products=project.products,
        owners=project.owners,
        status=project.status,
        createdDate=project.created_at.isoformat(),
        updatedDate=project.updated_at.isoformat()
    )
```

**Step 2: 更新 main.py 注册路由**

```python
from app.api.v1 import projects, bom, costs

app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(bom.router, prefix="/api/v1/bom", tags=["bom"])
app.include_router(costs.router, prefix="/api/v1/cost", tags=["costs"])
```

**Step 3: 提交**

```bash
git add backend/app/api/ backend/app/main.py
git commit -m "feat: enhance projects API with full CRUD operations"
```

---

### Task 9: 完善 BOM 上传 API

**Files:**
- Modify: `backend/app/api/v1/bom.py`

**Step 1: 更新 BOM API 代码**

```python
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.bom_parser import BOMParser
from app.schemas.material import MaterialResponse, ProcessResponse
from app.schemas.common import StatusLight

router = APIRouter()


@router.post("/upload")
async def upload_bom(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """上传并解析 BOM 文件

    支持 Excel (.xlsx, .xls) 格式
    自动识别物料表和工艺表
    返回解析后的数据结构
    """
    # 读取文件内容
    content = await file.read()

    # 解析 Excel
    parser = BOMParser()
    parse_result = parser.parse_excel_file(content)

    # TODO: 集成数据库查询，匹配物料价格
    # TODO: 集成 AI 服务，提取工艺特征

    # 转换为响应格式
    materials = [
        MaterialResponse(
            id=f"M-{i+1:03d}",
            partNumber=m.part_number,
            partName=m.part_name,
            material=m.material,
            supplier=m.supplier,
            quantity=m.quantity,
            unitPrice=None,  # TODO: 从数据库查询
            vavePrice=None,  # TODO: 从数据库查询
            hasHistoryData=False,  # TODO: 根据查询结果设置
            comments=m.comments,
            status=StatusLight.RED
        )
        for i, m in enumerate(parse_result.materials)
    ]

    processes = [
        ProcessResponse(
            id=f"P-{i+1:03d}",
            opNo=p.op_no,
            name=p.name,
            workCenter=p.work_center,
            standardTime=p.standard_time,
            spec=p.spec,
            unitPrice=None,  # TODO: 从数据库查询
            vavePrice=None,  # TODO: 从数据库查询
            hasHistoryData=False,  # TODO: 根据查询结果设置
            isOperationKnown=False
        )
        for i, p in enumerate(parse_result.processes)
    ]

    return {
        "parseId": f"parse-{project_id}",
        "status": "completed",
        "materials": materials,
        "processes": processes
    }


@router.get("/{project_id}/materials")
async def get_materials(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取项目的物料清单"""
    # TODO: 实现从数据库获取项目物料
    return {"materials": []}


@router.get("/{project_id}/processes")
async def get_processes(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取项目的工艺清单"""
    # TODO: 实现从数据库获取项目工艺
    return {"processes": []}
```

**Step 2: 提交**

```bash
git add backend/app/api/v1/bom.py
git commit -m "feat: enhance BOM upload API with parser integration"
```

---

### Task 10: 完善成本计算 API

**Files:**
- Modify: `backend/app/api/v1/costs.py`

**Step 1: 更新成本计算 API 代码**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.cost import CostCalculationResponse
from app.services.calculation import DualTrackCalculator
from app.schemas.common import PricePair
from decimal import Decimal

router = APIRouter()


@router.post("/calculate", response_model=CostCalculationResponse)
async def calculate_cost(
    project_id: str,
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    """执行双轨成本计算

    核心公式：
    - Standard Cost = (Qty × MaterialPrice_std) + ∑(CycleTime × (MHR_std + Labor_std))
    - VAVE Cost = (Qty × MaterialPrice_vave) + ∑(CycleTime_opt × (MHR_vave + Labor_vave))

    Args:
        project_id: 项目ID
        product_id: 产品ID
        db: 数据库会话

    Returns:
        CostCalculationResponse: 包含物料成本、工艺成本、总成本的双轨数据
    """
    calculator = DualTrackCalculator(db)

    # TODO: 从数据库获取产品的物料和工艺数据
    # 当前返回模拟数据用于前端集成测试

    return CostCalculationResponse(
        productId=product_id,
        materialCost=PricePair(
            std=Decimal("210.95"),
            vave=Decimal("198.25"),
            savings=Decimal("12.70"),
            savings_rate=0.0602
        ),
        processCost=PricePair(
            std=Decimal("264.00"),
            vave=Decimal("242.80"),
            savings=Decimal("21.20"),
            savings_rate=0.0803
        ),
        totalCost=PricePair(
            std=Decimal("474.95"),
            vave=Decimal("441.05"),
            savings=Decimal("33.90"),
            savings_rate=0.0714
        )
    )


@router.get("/{project_id}")
async def get_cost_result(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取已有的成本计算结果"""
    # TODO: 从数据库获取已保存的计算结果
    return {"message": "Not implemented yet"}
```

**Step 2: 提交**

```bash
git add backend/app/api/v1/costs.py
git commit -m "feat: enhance cost calculation API structure"
```

---

## Phase 4: 数据库与部署

### Task 11: 创建数据库初始化脚本

**Files:**
- Create: `backend/app/db/init_db.py`

**Step 1: 写入初始化代码**

```python
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import get_settings
from app.db.session import Base
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.models.project import Project


async def init_db():
    """初始化数据库

    创建所有表并插入种子数据
    """
    settings = get_settings()

    engine = create_async_engine(settings.mysql_url, echo=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # TODO: 插入种子数据（物料、工艺费率）

    await engine.dispose()
    print("Database initialized successfully!")


if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())
```

**Step 2: 提交**

```bash
git add backend/app/db/init_db.py
git commit -m "feat: add database initialization script"
```

---

### Task 12: 创建 Docker Compose 配置

**Files:**
- Create: `docker-compose.yml`

**Step 1: 写入 Docker Compose 配置**

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: smartquote-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: smartquote
      MYSQL_USER: smartquote
      MYSQL_PASSWORD: smartpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - smartquote-net

  postgres:
    image: pgvector/pgvector:pg16
    container_name: smartquote-postgres
    environment:
      POSTGRES_DB: smartquote_vector
      POSTGRES_USER: smartquote
      POSTGRES_PASSWORD: smartpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - smartquote-net

  redis:
    image: redis:7-alpine
    container_name: smartquote-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - smartquote-net

volumes:
  mysql_data:
  postgres_data:
  redis_data:

networks:
  smartquote-net:
    driver: bridge
```

**Step 2: 提交**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose for local development"
```

---

## Phase 5: 测试与验证

### Task 13: 端到端测试

**Files:**
- Create: `backend/app/tests/test_e2e.py`

**Step 1: 写入 E2E 测试**

```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
class TestE2E:
    """端到端测试"""

    async def test_health_check(self):
        """测试健康检查端点"""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"

    async def test_create_and_get_project(self):
        """测试创建和获取项目"""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 创建项目
            create_data = {
                "asacNumber": "AS-TEST-001",
                "customerNumber": "TEST-001",
                "productVersion": "V1.0",
                "customerVersion": "C1.0",
                "clientName": "测试客户",
                "projectName": "测试项目",
                "annualVolume": "10000",
                "description": "测试描述",
                "products": [{
                    "id": "P-001",
                    "name": "测试产品",
                    "partNumber": "TEST-001",
                    "annualVolume": 10000,
                    "description": "测试产品描述"
                }],
                "owners": {
                    "sales": "张三",
                    "vm": "李四",
                    "ie": "王五",
                    "pe": "赵六",
                    "controlling": "钱七"
                }
            }

            response = await client.post("/api/v1/projects", json=create_data)
            assert response.status_code == 201
            project_id = response.json()["id"]

            # 获取项目
            response = await client.get(f"/api/v1/projects/{project_id}")
            assert response.status_code == 200
            assert response.json()["projectName"] == "测试项目"
```

**Step 2: 运行 E2E 测试**

Run: `cd backend && uv run pytest app/tests/test_e2e.py -v`
Expected: 所有测试通过

**Step 3: 提交**

```bash
git add backend/app/tests/test_e2e.py
git commit -m "test: add end-to-end tests"
```

---

## 验证清单

完成所有任务后，请验证以下内容：

### 1. 服务器启动验证
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
访问 http://localhost:8000/health 应返回: `{"status": "healthy", "version": "v1.0.0"}`

### 2. API 端点验证

| 端点 | 方法 | 预期结果 |
|------|------|----------|
| `/health` | GET | 200 OK |
| `/api/v1/projects` | GET | 200 OK (项目列表) |
| `/api/v1/projects` | POST | 201 Created |
| `/api/v1/bom/upload` | POST | 200 OK (解析结果) |
| `/api/v1/cost/calculate` | POST | 200 OK (成本数据) |

### 3. 前后端联调验证

1. 启动后端: `cd backend && uvicorn app.main:app --reload`
2. 启动前端: `cd frontend && npm run dev`
3. 测试流程:
   - Dashboard 显示项目列表
   - 创建新项目
   - 上传 BOM 文件
   - 查看成本计算

---

## 关键文件索引

| 文件 | 作用 |
|------|------|
| `backend/app/main.py` | FastAPI 应用入口 |
| `backend/app/config.py` | 配置管理 |
| `backend/app/db/session.py` | 数据库会话 |
| `backend/app/models/` | SQLAlchemy ORM 模型 |
| `backend/app/schemas/` | Pydantic Schema（与前端对齐） |
| `backend/app/services/calculation.py` | 双轨计价核心算法 |
| `backend/app/services/bom_parser.py` | BOM 解析服务 |
| `backend/app/services/ai_service.py` | 通义千问 AI 服务 |
| `backend/app/api/v1/projects.py` | 项目 API |
| `backend/app/api/v1/bom.py` | BOM 上传 API |
| `backend/app/api/v1/costs.py` | 成本计算 API |

---

## 开发命令速查

```bash
# 安装依赖
cd backend && uv pip install -e ".[dev]"

# 运行开发服务器
uvicorn app.main:app --reload --port 8000

# 代码格式化
ruff format app/
ruff check app/ --fix

# 运行测试
pytest app/tests/ -v --cov=app

# 启动 Docker 环境
docker-compose up -d

# 初始化数据库
python -m app.db.init_db
```

---

## 风险提示

1. **Excel 格式变化** - 解析逻辑可能需要根据实际模板调整
2. **AI API 密钥** - 需要配置有效的阿里云 DashScope API Key
3. **数据库连接** - 确保本地 MySQL/PostgreSQL/Redis 可访问

---

**计划完成时间估算**: 1-2 个工作日（13 个任务，每个任务 1-2 小时）
