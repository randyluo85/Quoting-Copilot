# 双轨计算器实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现双轨成本计算：Standard Cost 和 VAVE Cost 并行计算

**Architecture:** BOMLineItem → 物料匹配 → 费率查询 → 双轨公式 → PricePair

**Tech Stack:** SQLAlchemy, Pydantic, Decimal 精确计算

---

## Task 1: 创建 CalculationService 核心算法

**Files:**
- Create: `backend/app/services/calculation_service.py`

**Step 1: 编写测试**

```python
# tests/unit/services/test_calculation.py
import pytest
from decimal import Decimal
from app.services.calculation_service import CalculationService
from app.schemas.bom import BOMLineItemCreate
from app.schemas.material import MaterialResponse
from app.schemas.process_rate import ProcessRateResponse


@pytest.mark.asyncio
async def test_calculate_with_material_only(mock_db_session):
    """测试纯物料成本计算"""
    service = CalculationService(mock_db_session)

    item = BOMLineItemCreate(
        line_index=1,
        part_number="M001",
        part_name="测试件",
        quantity=10,
    )

    # Mock 物料数据
    material = MaterialResponse(
        id="M001",
        name="测试件",
        spec="",
        std_price=Decimal("100"),
        vave_price=Decimal("80"),
        supplier_tier="A",
        created_at="2026-01-01T00:00:00",
        updated_at="2026-01-01T00:00:00",
    )

    result = await service.calculate_line_item(item, material, None)

    assert result.total_cost is not None
    assert result.total_cost.std == Decimal("1000")  # 10 * 100
    assert result.total_cost.vave == Decimal("800")   # 10 * 80
    assert result.total_cost.savings == Decimal("200")
    assert result.total_cost.savings_rate == 20.0


@pytest.mark.asyncio
async def test_calculate_with_features(mock_db_session):
    """测试含工艺特征的计算"""
    service = CalculationService(mock_db_session)

    item = BOMLineItemCreate(
        line_index=1,
        part_number="M001",
        part_name="测试件",
        quantity=1,
    )
    # 手动添加 features
    from app.core.value_objects import ExtractedFeature
    item.features = [ExtractedFeature(process="bending", count=32)]

    material = MaterialResponse(
        id="M001",
        name="测试件",
        spec="",
        std_price=Decimal("50"),
        vave_price=Decimal("50"),
        supplier_tier="A",
        created_at="2026-01-01T00:00:00",
        updated_at="2026-01-01T00:00:00",
    )

    rate = ProcessRateResponse(
        id=1,
        process_name="bending",
        std_mhr=Decimal("10"),
        std_labor=Decimal("5"),
        vave_mhr=Decimal("8"),
        vave_labor=Decimal("4"),
        efficiency_factor=Decimal("1.0"),
        created_at="2026-01-01T00:00:00",
        updated_at="2026-01-01T00:00:00",
    )

    result = await service.calculate_line_item(item, material, rate)

    # Std = 50 + 32*(10+5) = 50 + 480 = 530
    # VAVE = 50 + 32*0.9*(8+4) = 50 + 345.6 = 395.6
    assert result.total_cost.std == Decimal("530")
    assert round(result.total_cost.vave, 1) == Decimal("395.6")


@pytest.mark.asyncio
async def test_calculate_missing_material(mock_db_session):
    """测试物料缺失场景"""
    service = CalculationService(mock_db_session)

    item = BOMLineItemCreate(
        line_index=1,
        part_number="UNKNOWN",
        part_name="未知件",
        quantity=10,
    )

    result = await service.calculate_line_item(item, None, None)

    assert result.match_type == "none"
    assert result.status_light == "red"
    assert result.confidence == 0


@pytest.mark.asyncio
async def test_vave_higher_than_std(mock_db_session):
    """测试 VAVE 高于标准价（配置错误）"""
    service = CalculationService(mock_db_session)

    item = BOMLineItemCreate(
        line_index=1,
        part_number="M001",
        part_name="测试件",
        quantity=1,
    )

    material = MaterialResponse(
        id="M001",
        name="测试件",
        spec="",
        std_price=Decimal("100"),
        vave_price=Decimal("120"),  # VAVE 更高！
        supplier_tier="A",
        created_at="2026-01-01T00:00:00",
        updated_at="2026-01-01T00:00:00",
    )

    result = await service.calculate_line_item(item, material, None)

    # savings 应该是负数
    assert result.total_cost.savings < 0
    assert result.total_cost.savings_rate < 0
    # 应该有警告建议
    assert result.ai_suggestion is not None
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/services/test_calculation.py -v`
Expected: FAIL

**Step 3: 实现 CalculationService**

```python
# backend/app/services/calculation_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal
from typing import Optional

from app.schemas.bom import BOMLineItemCreate, BOMLineItemResponse
from app.schemas.material import MaterialResponse
from app.schemas.process_rate import ProcessRateResponse
from app.services.material_service import MaterialService
from app.services.process_rate_service import ProcessRateService
from app.core.value_objects import PricePair, ExtractedFeature


class CalculationService:
    """双轨成本计算服务

    公式:
    - Standard Cost = Σ(Qty × MaterialPrice_std) + Σ(CycleTime × (MHR_std + Labor_std))
    - VAVE Cost = Σ(Qty × MaterialPrice_vave) + Σ(CycleTime × 0.9 × (MHR_vave + Labor_vave))
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.material_service = MaterialService(db)
        self.rate_service = ProcessRateService(db)

    async def calculate_line_item(
        self,
        item: BOMLineItemCreate,
        material: Optional[MaterialResponse] = None,
        rate: Optional[ProcessRateResponse] = None,
    ) -> BOMLineItemResponse:
        """计算单行 BOM 的双轨成本

        Args:
            item: BOM 行数据
            material: 物料数据（如果已查询）
            rate: 工艺费率（如果已查询）

        Returns:
            BOMLineItemResponse，包含计算后的成本
        """
        # 1. 查询物料（如果未传入）
        if material is None and item.part_number:
            material = await self.material_service.get_by_id(item.part_number)

        # 2. 确定匹配类型和置信度
        if material:
            match_type = "exact"
            confidence = 100.0
            status_light = "green"
        else:
            match_type = "none"
            confidence = 0.0
            status_light = "red"

        # 3. 计算成本
        qty = Decimal(str(item.quantity))
        features = getattr(item, 'features', [])

        total_cost = await self._calculate_price_pair(
            qty=qty,
            material=material,
            features=features,
            rate=rate,
        )

        # 4. 生成 AI 建议
        ai_suggestion = self._generate_suggestions(total_cost, material)

        return BOMLineItemResponse(
            line_index=item.line_index,
            part_number=item.part_number,
            part_name=item.part_name,
            material=item.material,
            comments_raw=getattr(item, 'comments_raw', None),
            quantity=item.quantity,
            features=features,
            match_type=match_type,
            confidence=confidence,
            total_cost=total_cost,
            status_light=status_light,
            ai_suggestion=ai_suggestion,
        )

    async def _calculate_price_pair(
        self,
        qty: Decimal,
        material: Optional[MaterialResponse],
        features: list[ExtractedFeature],
        rate: Optional[ProcessRateResponse],
    ) -> PricePair:
        """计算 PricePair

        Returns:
            PricePair
        """
        # 1. 材料成本
        if material:
            mat_std = qty * material.std_price
            mat_vave = qty * (material.vave_price or material.std_price)
        else:
            mat_std = mat_vave = Decimal("0")

        # 2. 工艺成本
        proc_std = proc_vave = Decimal("0")

        if rate and features:
            for feature in features:
                cycle = Decimal(str(feature.count))
                # VAVE 假设效率提升 10%
                cycle_opt = cycle * Decimal("0.9")

                # 标准成本
                std_rate = (rate.std_mhr or Decimal("0")) + (rate.std_labor or Decimal("0"))
                proc_std += cycle * std_rate

                # VAVE 成本
                vave_rate = (rate.vave_mhr or rate.std_mhr or Decimal("0")) + \
                           (rate.vave_labor or rate.std_labor or Decimal("0"))
                proc_vave += cycle_opt * vave_rate

        # 3. 总成本
        std_total = mat_std + proc_std
        vave_total = mat_vave + proc_vave

        return PricePair.from_prices(std_total, vave_total)

    def _generate_suggestions(
        self,
        cost: PricePair,
        material: Optional[MaterialResponse],
    ) -> Optional[str]:
        """生成 AI 建议"""
        suggestions = []

        # VAVE 高于标准价
        if cost.vave > cost.std:
            suggestions.append("⚠️ VAVE 价格高于标准价，请检查配置")

        # 降本空间 > 20%
        if cost.savings_rate > 20:
            suggestions.append(f"💰 存在 {cost.savings_rate:.1f}% 降本空间")

        # 物料缺失
        if not material:
            suggestions.append("🔴 物料库中无数据，需要人工询价")

        return "; ".join(suggestions) if suggestions else None

    async def calculate_batch(
        self,
        items: list[BOMLineItemCreate],
    ) -> list[BOMLineItemResponse]:
        """批量计算 BOM 行

        Args:
            items: BOM 行列表

        Returns:
            计算结果列表
        """
        results = []

        for item in items:
            result = await self.calculate_line_item(item)
            results.append(result)

        return results

    async def calculate_total(
        self,
        items: list[BOMLineItemResponse],
    ) -> dict:
        """计算汇总

        Returns:
            {
                "total_std_cost": Decimal,
                "total_vave_cost": Decimal,
                "total_savings": Decimal,
                "total_savings_rate": float,
            }
        """
        total_std = sum(i.total_cost.std for i in items if i.total_cost)
        total_vave = sum(i.total_cost.vave for i in items if i.total_cost)
        total_savings = total_std - total_vave
        total_savings_rate = float(total_savings / total_std * 100) if total_std > 0 else 0.0

        return {
            "total_std_cost": total_std,
            "total_vave_cost": total_vave,
            "total_savings": total_savings,
            "total_savings_rate": total_savings_rate,
        }
```

**Step 4: 更新 BOMLineItemCreate（添加 features 字段）**

```python
# backend/app/schemas/bom.py (修改)
from app.core.value_objects import ExtractedFeature


class BOMLineItemCreate(BaseModel):
    """创建 BOM 行"""
    line_index: int = Field(..., ge=1)
    part_number: Optional[str] = None
    part_name: str
    material: Optional[str] = None
    comments_raw: Optional[str] = None
    quantity: int = Field(..., ge=0)
    features: list[ExtractedFeature] = Field(default_factory=list)
```

**Step 5: 运行测试验证通过**

Run: `pytest tests/unit/services/test_calculation.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add backend/app/services/calculation_service.py tests/unit/services/test_calculation.py backend/app/schemas/bom.py
git commit -m "feat: add dual-track calculation service"
```

---

## Task 2: 创建计算 API

**Files:**
- Modify: `backend/app/api/v1/bom.py`

**Step 1: 添加计算路由**

```python
# backend/app/api/v1/bom.py (添加)
from fastapi import APIRouter, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.bom_parser_service import BOMParserService
from app.services.calculation_service import CalculationService
from app.services.pattern_engine import get_pattern_engine
from app.schemas.bom import (
    BOMParseResponse,
    BOMCalculateRequest,
    BOMCalculateResponse,
)
from app.core.database import get_db

router = APIRouter(prefix="/bom", tags=["bom"])


@router.post("/parse", response_model=BOMParseResponse)
async def parse_bom(
    file: UploadFile = File(...),
    skip_first_row: bool = Form(True),
):
    """解析 BOM Excel 文件"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="不支持的文件格式")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="文件过大")

    pattern_engine = get_pattern_engine()
    parser = BOMParserService(pattern_engine)
    return await parser.parse_excel(content, skip_first_row)


@router.post("/calculate", response_model=BOMCalculateResponse)
async def calculate_bom(
    request: BOMCalculateRequest,
    db: AsyncSession = Depends(get_db),
):
    """计算 BOM 双轨成本

    输入解析后的 BOM 数据，返回计算结果
    """
    calc_service = CalculationService(db)

    # 批量计算
    results = await calc_service.calculate_batch(request.items)

    # 汇总
    totals = await calc_service.calculate_total(results)

    return BOMCalculateResponse(
        total_std_cost=float(totals["total_std_cost"]),
        total_vave_cost=float(totals["total_vave_cost"]),
        total_savings=float(totals["total_savings"]),
        items=results,
    )
```

**Step 2: 测试 API**

```bash
curl -X POST "http://localhost:8000/api/v1/bom/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "line_index": 1,
        "part_number": "TEST-001",
        "part_name": "测试件",
        "quantity": 10,
        "features": [{"process": "bending", "count": 32}]
      }
    ]
  }'
```

**Step 3: Commit**

```bash
git add backend/app/api/v1/bom.py
git commit -m "feat: add BOM calculate API endpoint"
```

---

## Task 3: 创建端到端解析+计算 API

**Files:**
- Modify: `backend/app/api/v1/bom.py`

**Step 1: 添加合并路由**

```python
# backend/app/api/v1/bom.py (添加)
@router.post("/upload-and-calculate", response_model=BOMCalculateResponse)
async def upload_and_calculate(
    file: UploadFile = File(...),
    skip_first_row: bool = Form(True),
    db: AsyncSession = Depends(get_db),
):
    """上传 BOM 并直接返回计算结果（一步到位）"""
    # 1. 解析
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="不支持的文件格式")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="文件过大")

    pattern_engine = get_pattern_engine()
    parser = BOMParserService(pattern_engine)
    parse_result = await parser.parse_excel(content, skip_first_row)

    # 2. 转换为计算请求
    from app.schemas.bom import BOMLineItemCreate
    calc_items = [
        BOMLineItemCreate(
            line_index=item.line_index,
            part_number=item.part_number,
            part_name=item.part_name,
            material=item.material,
            comments_raw=item.comments_raw,
            quantity=1,  # 默认为 1，前端可修改
            features=item.features,
        )
        for item in parse_result.items
    ]

    # 3. 计算
    calc_service = CalculationService(db)
    results = await calc_service.calculate_batch(calc_items)
    totals = await calc_service.calculate_total(results)

    return BOMCalculateResponse(
        total_std_cost=float(totals["total_std_cost"]),
        total_vave_cost=float(totals["total_vave_cost"]),
        total_savings=float(totals["total_savings"]),
        items=results,
    )
```

**Step 2: Commit**

```bash
git add backend/app/api/v1/bom.py
git commit -m "feat: add upload and calculate combined endpoint"
```

---

## Task 4: 前端计算结果展示

**Files:**
- Create: `frontend/components/bom-results-table.tsx`
- Modify: `frontend/components/bom-uploader.tsx`

**Step 1: 创建结果表格组件**

```typescript
// frontend/components/bom-results-table.tsx
'use client'

import { BOMLineItem } from '@/lib/api/bom'

interface PricePair {
  std: number
  vave: number
  savings: number
  savings_rate: number
}

interface BOMLineItemWithCost extends BOMLineItem {
  total_cost: PricePair
}

interface Props {
  items: BOMLineItemWithCost[]
  totalStd: number
  totalVave: number
  totalSavings: number
}

export function BOMResultsTable({ items, totalStd, totalVave, totalSavings }: Props) {
  const getSavingsColor = (rate: number) => {
    if (rate > 20) return 'text-green-600 font-bold'
    if (rate > 0) return 'text-green-500'
    if (rate < 0) return 'text-red-500'
    return ''
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'green':
        return '🟢'
      case 'yellow':
        return '🟡'
      case 'red':
        return '🔴'
      default:
        return '⚪'
    }
  }

  return (
    <div className="mt-6">
      {/* 汇总卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">标准成本</div>
          <div className="text-2xl font-bold">¥{totalStd.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">VAVE 成本</div>
          <div className="text-2xl font-bold">¥{totalVave.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">节省金额</div>
          <div className="text-2xl font-bold text-green-600">¥{totalSavings.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">降本比例</div>
          <div className="text-2xl font-bold">
            {((totalSavings / totalStd) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 结果表格 */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">状态</th>
            <th className="border p-2 text-left">物料编码</th>
            <th className="border p-2 text-left">名称</th>
            <th className="border p-2 text-left">特征</th>
            <th className="border p-2 text-right">标准成本</th>
            <th className="border p-2 text-right">VAVE 成本</th>
            <th className="border p-2 text-right">节省</th>
            <th className="border p-2 text-left">建议</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.line_index} className="hover:bg-gray-50">
              <td className="border p-2 text-center">
                {getStatusBadge(item.status_light)}
              </td>
              <td className="border p-2">{item.part_number || '-'}</td>
              <td className="border p-2">{item.part_name}</td>
              <td className="border p-2 text-sm">
                {item.features.length > 0 ? (
                  item.features.map((f, i) => (
                    <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1">
                      {f.process}: {f.count}
                    </span>
                  ))
                ) : '-'}
              </td>
              <td className="border p-2 text-right">
                ¥{item.total_cost?.std.toFixed(2) || '-'}
              </td>
              <td className="border p-2 text-right">
                ¥{item.total_cost?.vave.toFixed(2) || '-'}
              </td>
              <td className="border p-2 text-right">
                {item.total_cost ? (
                  <span className={getSavingsColor(item.total_cost.savings_rate)}>
                    ¥{item.total_cost.savings.toFixed(2)}
                    ({item.total_cost.savings_rate.toFixed(1)}%)
                  </span>
                ) : '-'}
              </td>
              <td className="border p-2 text-sm text-gray-500">
                {item.ai_suggestion || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Step 2: 更新上传组件（添加计算功能）**

```typescript
// frontend/components/bom-uploader.tsx (修改)
'use client'

import { useState, useCallback } from 'react'
import { BOMParseResponse, parseBOM, uploadAndCalculate } from '@/lib/api/bom'
import { BOMResultsTable } from './bom-results-table'

export function BOMUploader() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<BOMParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calcResult, setCalcResult] = useState<any>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)
    setCalcResult(null)

    try {
      // 直接调用解析+计算接口
      const data = await uploadAndCalculate(file)
      setCalcResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }, [])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">BOM 智能报价</h1>

      {/* 上传区域 */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center mb-6">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {uploading ? '解析计算中...' : '选择 BOM Excel 文件'}
        </label>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">{error}</div>
      )}

      {/* 计算结果 */}
      {calcResult && (
        <BOMResultsTable
          items={calcResult.items}
          totalStd={calcResult.total_std_cost}
          totalVave={calcResult.total_vave_cost}
          totalSavings={calcResult.total_savings}
        />
      )}
    </div>
  )
}
```

**Step 3: 添加 API 函数**

```typescript
// frontend/lib/api/bom.ts (添加)
export interface BOMCalculateResponse {
  total_std_cost: number
  total_vave_cost: number
  total_savings: number
  items: BOMLineItemWithCost[]
}

export async function uploadAndCalculate(file: File): Promise<BOMCalculateResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skip_first_row', 'true')

  const res = await fetch(`${API_URL}/api/v1/bom/upload-and-calculate`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || '计算失败')
  }

  return res.json()
}
```

**Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: add BOM calculation results display"
```

---

## ✅ 完成标准

- [ ] CalculationService 正确实现双轨公式
- [ ] 物料匹配逻辑正确（exact → green，none → red）
- [ ] VAVE > Std 时有警告提示
- [ ] 降本空间 > 20% 高亮显示
- [ ] 前端正确展示计算结果
- [ ] 测试覆盖率 > 80%

---

## 🎉 MVP 核心功能完成！

完成此切片后，SmartQuote MVP 的核心功能已实现：
- ✅ 物料库管理
- ✅ 工艺费率配置
- ✅ BOM 解析引擎
- ✅ 双轨计算器

**下一步选项:**
1. 实现切片 5（审核工作台集成）
2. 添加更多测试用例
3. 部署到测试环境
