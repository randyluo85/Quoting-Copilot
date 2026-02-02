# BOM 解析引擎实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现 Excel BOM 文件解析和 Comments 列工艺特征提取

**Architecture:** 文件上传 → openpyxl 解析 → 正则模式引擎 → 结构化输出

**Tech Stack:** openpyxl, Python re, FastAPI UploadFile

---

## Task 1: 创建 PatternEngine（正则模式引擎）

**Files:**
- Create: `backend/app/services/pattern_engine.py`

**Step 1: 编写测试**

```python
# tests/unit/services/test_pattern_engine.py
import pytest
from app.services.pattern_engine import PatternEngine, ExtractedFeature


@pytest.mark.parametrize("comments,expected", [
    ("折弯：32", [ExtractedFeature(process="bending", count=32)]),
    ("Black；折弯：32；划线：6处", [
        ExtractedFeature(process="bending", count=32),
        ExtractedFeature(process="marking", count=6),
    ]),
    ("bending:10", [ExtractedFeature(process="bending", count=10)]),
    ("切割5次", [ExtractedFeature(process="cutting", count=5)]),
    ("焊接：", []),  # 无数字，应返回空
    ("", []),  # 空字符串
    (None, []),  # None
])
def test_pattern_parsing(comments, expected):
    """测试正则解析引擎"""
    engine = PatternEngine()
    result = engine.parse(comments)
    assert len(result) == len(expected)
    for r, e in zip(result, expected):
        assert r.process == e.process
        assert r.count == e.count


def test_pattern_case_insensitive():
    """测试大小写不敏感"""
    engine = PatternEngine()
    result = engine.parse("BENDING:10")
    assert len(result) == 1
    assert result[0].process == "bending"


def test_pattern_chinese_colon():
    """测试中文冒号"""
    engine = PatternEngine()
    result = engine.parse("折弯：10")
    assert len(result) == 1
    assert result[0].count == 10


def test_pattern_multiple_separators():
    """测试多种分隔符"""
    engine = PatternEngine()
    result = engine.parse("折弯：10；切割5，焊接20")
    assert len(result) == 3
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/services/test_pattern_engine.py -v`
Expected: FAIL

**Step 3: 实现 PatternEngine**

```python
# backend/app/services/pattern_engine.py
import re
from typing import List
from app.core.value_objects import ExtractedFeature


class PatternEngine:
    """Comments 正则解析引擎"""

    # 工艺模式库：(工艺名称, 正则列表)
    PATTERNS = {
        "bending": [
            r"折弯\s*[:：]\s*(\d+)",
            r"弯\s*[:：]\s*(\d+)",
            r"bending\s*[:：]\s*(\d+)",
            r"bend\s*[:：]\s*(\d+)",
        ],
        "cutting": [
            r"切割\s*[:：]\s*(\d+)",
            r"cut\s*[:：]\s*(\d+)",
            r"cutting\s*[:：]\s*(\d+)",
            r"laser\s*[:：]\s*(\d+)",
            r"激光\s*[:：]\s*(\d+)",
        ],
        "marking": [
            r"划线\s*[:：]\s*(\d+)",
            r"marking\s*[:：]\s*(\d+)",
            r"mark\s*[:：]\s*(\d+)",
        ],
        "welding": [
            r"焊接\s*[:：]\s*(\d+)",
            r"焊\s*[:：]\s*(\d+)",
            r"welding\s*[:：]\s*(\d+)",
            r"weld\s*[:：]\s*(\d+)",
        ],
        "surface": [
            r"表面\s*[:：]\s*(\w+)",
            r"表面处理\s*[:：]\s*(\w+)",
            r"surface\s*[:：]\s*(\w+)",
        ],
        "drilling": [
            r"钻孔\s*[:：]\s*(\d+)",
            r"drill\s*[:：]\s*(\d+)",
            r"drilling\s*[:：]\s*(\d+)",
        ],
        "assembly": [
            r"装配\s*[:：]\s*(\d+)",
            r"组装\s*[:：]\s*(\d+)",
            r"assembly\s*[:：]\s*(\d+)",
        ],
    }

    def __init__(self):
        # 预编译正则
        self._compiled_patterns = {
            process: [re.compile(p, re.IGNORECASE) for p in patterns]
            for process, patterns in self.PATTERNS.items()
        }

    def parse(self, comments: str | None) -> List[ExtractedFeature]:
        """解析 Comments 字符串，提取工艺特征

        Args:
            comments: 原始 Comments 字符串

        Returns:
            ExtractedFeature 列表
        """
        if not comments or not isinstance(comments, str):
            return []

        features = []
        seen_processes = set()

        # 预处理：统一分隔符
        text = comments.replace("；", ";").replace("，", ",").replace("。", ";")

        for process_name, patterns in self._compiled_patterns.items():
            if process_name in seen_processes:
                continue

            for pattern in patterns:
                match = pattern.search(text)
                if match:
                    value = match.group(1)
                    # 尝试转为数字
                    try:
                        count = int(value)
                    except ValueError:
                        count = 1  # 非数字类型（如表面处理）

                    features.append(ExtractedFeature(
                        process=process_name,
                        count=count,
                        unit="次" if count > 1 else "次",
                    ))
                    seen_processes.add(process_name)
                    break  # 每种工艺只匹配一次

        return features


# 单例
_pattern_engine = None


def get_pattern_engine() -> PatternEngine:
    """获取 PatternEngine 单例"""
    global _pattern_engine
    if _pattern_engine is None:
        _pattern_engine = PatternEngine()
    return _pattern_engine
```

**Step 4: 更新 value_objects.py（确保 ExtractedFeature 可导入）**

```python
# backend/app/core/value_objects.py
from pydantic import BaseModel, Field
from decimal import Decimal


class PricePair(BaseModel):
    """双轨价格封装"""
    std: Decimal = Field(..., description="标准成本")
    vave: Decimal = Field(..., description="VAVE 目标成本")
    savings: Decimal = Field(..., description="价差 = std - vave")
    savings_rate: float = Field(..., description="价差比例")

    @classmethod
    def from_prices(cls, std: Decimal, vave: Decimal | None = None) -> "PricePair":
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

**Step 5: 运行测试验证通过**

Run: `pytest tests/unit/services/test_pattern_engine.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add backend/app/services/pattern_engine.py tests/unit/services/test_pattern_engine.py
git commit -m "feat: add pattern engine for BOM comments parsing"
```

---

## Task 2: 创建 BOM Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/bom.py`

**Step 1: 实现 Schemas**

```python
# backend/app/schemas/bom.py
from pydantic import BaseModel, Field
from typing import Optional
from app.core.value_objects import ExtractedFeature, PricePair


class BOMLineItemBase(BaseModel):
    """BOM 行基础字段"""
    line_index: int = Field(..., ge=1, description="行号")
    part_number: Optional[str] = Field(None, description="物料编码")
    part_name: str = Field(..., min_length=1, description="物料名称")
    material: Optional[str] = Field(None, description="材质")
    comments_raw: Optional[str] = Field(None, description="原始备注")


class BOMLineItemCreate(BOMLineItemBase):
    """创建 BOM 行"""
    quantity: int = Field(..., ge=0, description="数量")


class BOMLineItemResponse(BOMLineItemBase):
    """BOM 行响应（解析后）"""
    quantity: int
    features: list[ExtractedFeature] = Field(default_factory=list, description="提取的工艺特征")

    # 匹配状态
    match_type: Optional[str] = Field(None, description="匹配类型: exact/semantic/none")
    confidence: float = Field(0, ge=0, le=100, description="匹配置信度")

    # 成本（计算后填充）
    total_cost: Optional[PricePair] = Field(None, description="双轨成本")

    # 状态
    status_light: Optional[str] = Field(None, description="状态灯: green/yellow/red")
    ai_suggestion: Optional[str] = Field(None, description="AI 建议")


class BOMParseRequest(BaseModel):
    """BOM 解析请求"""
    skip_first_row: bool = Field(True, description="跳过首行（表头）")


class BOMParseResponse(BaseModel):
    """BOM 解析响应"""
    total_rows: int = Field(..., description="总行数")
    parsed_rows: int = Field(..., description="成功解析行数")
    failed_rows: int = Field(..., description="失败行数")
    items: list[BOMLineItemResponse] = Field(..., description="解析结果")
    errors: list[dict] = Field(default_factory=list, description="错误列表")


class BOMCalculateRequest(BaseModel):
    """BOM 计算请求"""
    items: list[BOMLineItemCreate] = Field(..., description="BOM 行数据")


class BOMCalculateResponse(BaseModel):
    """BOM 计算响应"""
    total_std_cost: float = Field(..., description="总标准成本")
    total_vave_cost: float = Field(..., description="总VAVE成本")
    total_savings: float = Field(..., description="总节省")
    items: list[BOMLineItemResponse] = Field(..., description="计算结果")
```

**Step 2: 更新 schemas/__init__.py**

```python
# backend/app/schemas/__init__.py (添加)
from app.schemas.bom import (
    BOMLineItemCreate,
    BOMLineItemResponse,
    BOMParseRequest,
    BOMParseResponse,
    BOMCalculateRequest,
    BOMCalculateResponse,
)

__all__ = [
    # ... existing imports
    "BOMLineItemCreate",
    "BOMLineItemResponse",
    "BOMParseRequest",
    "BOMParseResponse",
    "BOMCalculateRequest",
    "BOMCalculateResponse",
]
```

**Step 3: Commit**

```bash
git add backend/app/schemas/
git commit -m "feat: add BOM Pydantic schemas"
```

---

## Task 3: 创建 BOMParserService

**Files:**
- Create: `backend/app/services/bom_parser_service.py`

**Step 1: 编写测试**

```python
# tests/unit/services/test_bom_parser.py
import pytest
from openpyxl import Workbook
from io import BytesIO
from app.services.bom_parser_service import BOMParserService


@pytest.fixture
def sample_excel():
    """创建测试用的 Excel 文件"""
    wb = Workbook()
    ws = wb.active

    # 表头
    ws.append(["序号", "Item", "PartNumber", "PartName", "Material", "", "", "", "", "", "", "", "Comments"])

    # 数据行
    ws.append([1, "", "P001", "测试件1", "SUS304", "", "", "", "", "", "", "", "折弯：32"])
    ws.append([2, "", "P002", "测试件2", "Q235", "", "", "", "", "", "", "", "切割：5；焊接：10"])
    ws.append([3, "", "P003", "测试件3", "AL6061", "", "", "", "", "", "", "", ""])  # 空 comments

    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return output.read()


@pytest.mark.asyncio
async def test_parse_excel(sample_excel):
    """测试 Excel 解析"""
    from app.services.pattern_engine import get_pattern_engine

    service = BOMParserService(get_pattern_engine())
    result = await service.parse_excel(sample_excel, skip_first_row=True)

    assert result.total_rows == 3
    assert result.parsed_rows == 3
    assert result.failed_rows == 0

    # 检查第一行
    item1 = next(i for i in result.items if i.part_number == "P001")
    assert item1.part_name == "测试件1"
    assert len(item1.features) == 1
    assert item1.features[0].process == "bending"
    assert item1.features[0].count == 32

    # 检查第二行（多工艺）
    item2 = next(i for i in result.items if i.part_number == "P002")
    assert len(item2.features) == 2

    # 检查第三行（空 comments）
    item3 = next(i for i in result.items if i.part_number == "P003")
    assert len(item3.features) == 0
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/services/test_bom_parser.py -v`
Expected: FAIL

**Step 3: 实现 BOMParserService**

```python
# backend/app/services/bom_parser_service.py
from openpyxl import load_workbook
from io import BytesIO
from typing import Optional
from app.services.pattern_engine import PatternEngine
from app.schemas.bom import (
    BOMLineItemCreate,
    BOMLineItemResponse,
    BOMParseResponse,
)


class BOMParserService:
    """BOM Excel 解析服务

    Excel 列定义（参考 PRD）：
    - Col 0: 序号
    - Col 1: Item
    - Col 2: PartNumber
    - Col 3: PartName
    - Col 4: Material
    - ...
    - Col 12: Comments (关键列)
    """

    # 关键列索引
    COL_PART_NUMBER = 2  # Col C
    COL_PART_NAME = 3    # Col D
    COL_MATERIAL = 4     # Col E
    COL_COMMENTS = 12    # Col M

    def __init__(self, pattern_engine: PatternEngine):
        self.pattern_engine = pattern_engine

    async def parse_excel(
        self,
        file_content: bytes,
        skip_first_row: bool = True,
    ) -> BOMParseResponse:
        """解析 Excel 文件

        Args:
            file_content: Excel 文件内容
            skip_first_row: 是否跳过首行（表头）

        Returns:
            BOMParseResponse
        """
        workbook = load_workbook(filename=BytesIO(file_content), read_only=True)
        sheet = workbook.active

        items = []
        errors = []
        start_row = 2 if skip_first_row else 1

        for row_idx, row in enumerate(sheet.iter_rows(min_row=start_row, values_only=True), start=start_row):
            try:
                # 跳过空行
                if not any(row):
                    continue

                # 提取数据
                part_number = self._get_cell_value(row, self.COL_PART_NUMBER)
                part_name = self._get_cell_value(row, self.COL_PART_NAME)
                material = self._get_cell_value(row, self.COL_MATERIAL)
                comments = self._get_cell_value(row, self.COL_COMMENTS)

                # 验证必填字段
                if not part_name:
                    errors.append({
                        "row": row_idx,
                        "reason": "PartName 为空",
                    })
                    continue

                # 解析特征
                features = self.pattern_engine.parse(comments)

                items.append(BOMLineItemResponse(
                    line_index=row_idx - start_row + 1,
                    part_number=part_number,
                    part_name=part_name,
                    material=material,
                    comments_raw=comments,
                    features=features,
                    match_type=None,
                    confidence=0,
                    status_light=None,
                ))

            except Exception as e:
                errors.append({
                    "row": row_idx,
                    "reason": str(e),
                })

        workbook.close()

        return BOMParseResponse(
            total_rows=len(items) + len(errors),
            parsed_rows=len(items),
            failed_rows=len(errors),
            items=items,
            errors=errors,
        )

    def _get_cell_value(self, row: tuple, col_index: int) -> Optional[str]:
        """安全获取单元格值"""
        if col_index < len(row):
            value = row[col_index]
            if value is not None:
                return str(value).strip()
        return None
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/services/test_bom_parser.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/bom_parser_service.py tests/unit/services/test_bom_parser.py
git commit -m "feat: add BOM parser service"
```

---

## Task 4: 创建 BOM 解析 API

**Files:**
- Create: `backend/app/api/v1/bom.py`

**Step 1: 实现 API 路由**

```python
# backend/app/api/v1/bom.py
from fastapi import APIRouter, UploadFile, File, Form
from app.services.bom_parser_service import BOMParserService
from app.services.pattern_engine import get_pattern_engine
from app.schemas.bom import BOMParseResponse

router = APIRouter(prefix="/bom", tags=["bom"])


@router.post("/parse", response_model=BOMParseResponse)
async def parse_bom(
    file: UploadFile = File(..., description="Excel 文件"),
    skip_first_row: bool = Form(True, description="跳过首行"),
):
    """解析 BOM Excel 文件

    支持的格式: .xlsx, .xls
    """
    # 验证文件类型
    if not file.filename.endswith(('.xlsx', '.xls')):
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="不支持的文件格式，请上传 .xlsx 或 .xls 文件"
        )

    # 读取文件内容
    content = await file.read()

    # 限制文件大小（10MB）
    if len(content) > 10 * 1024 * 1024:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="文件过大，请小于 10MB")

    # 解析
    pattern_engine = get_pattern_engine()
    parser = BOMParserService(pattern_engine)
    return await parser.parse_excel(content, skip_first_row)
```

**Step 2: 注册路由**

```python
# backend/app/main.py (添加)
from app.api.v1.bom import router as bom_router

app.include_router(bom_router, prefix=settings.api_v1_prefix)
```

**Step 3: 测试 API**

```bash
# 创建测试文件后测试
curl -X POST "http://localhost:8000/api/v1/bom/parse" \
  -F "file=@test_bom.xlsx" \
  -F "skip_first_row=true"
```

**Step 4: Commit**

```bash
git add backend/app/api/
git commit -m "feat: add BOM parse API endpoint"
```

---

## Task 5: 前端 BOM 上传页面

**Files:**
- Create: `frontend/components/bom-uploader.tsx`
- Create: `frontend/app/dashboard/bom/page.tsx`

**Step 1: 创建上传组件**

```typescript
// frontend/components/bom-uploader.tsx
'use client'

import { useState, useCallback } from 'react'
import { BOMParseResponse, parseBOM } from '@/lib/api/bom'

export function BOMUploader() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<BOMParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('请上传 Excel 文件 (.xlsx 或 .xls)')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const data = await parseBOM(file)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }, [])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">BOM 解析</h1>

      {/* 上传区域 */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? '解析中...' : '选择 Excel 文件'}
        </label>
        <p className="mt-2 text-sm text-gray-500">支持 .xlsx, .xls 格式，最大 10MB</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* 解析结果 */}
      {result && (
        <div className="mt-6">
          <div className="flex gap-4 mb-4">
            <div className="px-4 py-2 bg-blue-50 rounded">
              <span className="font-semibold">总行数:</span> {result.total_rows}
            </div>
            <div className="px-4 py-2 bg-green-50 rounded">
              <span className="font-semibold">成功:</span> {result.parsed_rows}
            </div>
            <div className="px-4 py-2 bg-red-50 rounded">
              <span className="font-semibold">失败:</span> {result.failed_rows}
            </div>
          </div>

          {/* 结果表格 */}
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">行号</th>
                <th className="border p-2">物料编码</th>
                <th className="border p-2">名称</th>
                <th className="border p-2">材质</th>
                <th className="border p-2">备注</th>
                <th className="border p-2">提取特征</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.line_index} className="hover:bg-gray-50">
                  <td className="border p-2">{item.line_index}</td>
                  <td className="border p-2">{item.part_number || '-'}</td>
                  <td className="border p-2">{item.part_name}</td>
                  <td className="border p-2">{item.material || '-'}</td>
                  <td className="border p-2">{item.comments_raw || '-'}</td>
                  <td className="border p-2">
                    {item.features.length > 0 ? (
                      <ul className="text-sm">
                        {item.features.map((f, i) => (
                          <li key={i}>
                            {f.process}: {f.count}{f.unit}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">无</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

**Step 2: 添加 API 函数**

```typescript
// frontend/lib/api/bom.ts
import { API_URL } from './api/client'

export interface ExtractedFeature {
  process: string
  count: number
  unit: string
}

export interface BOMLineItem {
  line_index: number
  part_number: string | null
  part_name: string
  material: string | null
  comments_raw: string | null
  features: ExtractedFeature[]
  match_type: string | null
  confidence: number
  status_light: string | null
}

export interface BOMParseResponse {
  total_rows: number
  parsed_rows: number
  failed_rows: number
  items: BOMLineItem[]
  errors: Array<{ row: number; reason: string }>
}

export async function parseBOM(file: File): Promise<BOMParseResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skip_first_row', 'true')

  const res = await fetch(`${API_URL}/api/v1/bom/parse`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || '解析失败')
  }

  return res.json()
}
```

**Step 3: 创建页面**

```typescript
// frontend/app/dashboard/bom/page.tsx
import { BOMUploader } from '@/components/bom-uploader'

export default function BOMPage() {
  return <BOMUploader />
}
```

**Step 4: 更新导航**

```typescript
// frontend/app/layout.tsx (添加)
<Link href="/dashboard/bom">BOM解析</Link>
```

**Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: add BOM upload and parse page"
```

---

## ✅ 完成标准

- [ ] PatternEngine 支持 7 种工艺模式
- [ ] BOM Excel 解析正确处理 Col 12 (Comments)
- [ ] API 支持文件上传和解析
- [ ] 前端可上传文件并显示解析结果
- [ ] 测试覆盖率 > 80%

**下一步:** 执行 `04-dual-calculator.md`（双轨计算器）
