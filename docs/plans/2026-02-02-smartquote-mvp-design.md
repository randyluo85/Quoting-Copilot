# SmartQuote MVP 开发设计文档

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-02 | 2026-02-02 | SmartQuote MVP 开发计划 | Randy Luo |

---

## 1. 决策汇总

| 决策维度 | 选择方案 | 核心要点 |
|----------|----------|----------|
| **MVP 范围** | B - 完整闭环 | DB + AI 解析 + 计算引擎，简单管理界面 |
| **AI 实现** | C - 混合模式 | 正则解析 + 向量检索，LLM 后续迭代 |
| **前端形态** | C - 渐进式 | 单页表格起步，预留扩展接口 |
| **数据库** | C - 混合模式 | Docker Compose 开发 + 外部 DB 支持 |
| **开发顺序** | C - 垂直切片 | 每个功能端到端完成 |

---

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  Next.js (App Router) + ShadcnUI + TanStack Query          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/JSON
┌───────────────────────────┴─────────────────────────────────┐
│                        Backend                              │
│  FastAPI + SQLAlchemy + Pydantic                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ BOMParserService│  │CalculationService│  │MaterialService│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└───────────┬───────────────────────┬────────────────────────┘
            │                       │
┌───────────┴───────────┐ ┌─────────┴────────────────────────┐
│      MySQL            │ │      PostgreSQL (pgvector)       │
│  - materials          │ │  - 历史报价向量                  │
│  - process_rates      │ │  - 语义匹配                      │
└───────────────────────┘ └──────────────────────────────────┘
```

### 2.2 目录结构

```
smartquote/
├── backend/
│   ├── app/
│   │   ├── api/              # 路由 (/materials, /bom, /process-rates)
│   │   ├── core/             # 配置、异常、工具
│   │   ├── models/           # SQLAlchemy ORM
│   │   ├── schemas/          # Pydantic API 契约
│   │   │   └── value_objects.py  # PricePair, ExtractedFeature
│   │   ├── services/         # 业务逻辑
│   │   │   ├── pattern_engine.py   # 正则解析引擎
│   │   │   ├── calculator.py        # 双轨计算器
│   │   │   ├── material_service.py  # 物料查询
│   │   │   └── bom_parser.py        # BOM 解析
│   │   └── main.py           # FastAPI 入口
│   ├── tests/
│   ├── alembic/              # 数据库迁移
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   └── dashboard/        # 主工作区
│   ├── components/           # ShadcnUI 组件
│   ├── lib/                  # API 客户端
│   └── public/
├── docs/
│   └── plans/
├── docker-compose.yml
└── README.md
```

---

## 3. 垂直切片里程碑

### 切片 1：物料库管理（基础数据层）

**目标**: 建立 MySQL 物料表，支持 CRUD 和 Excel 批量导入

**后端**
- `POST /api/materials/import` — Excel 批量导入
- `GET /api/materials` — 分页查询
- `GET /api/materials/{item_code}` — 单个查询
- `PUT /api/materials/{item_code}` — 更新
- `DELETE /api/materials/{item_code}` — 删除

**前端**
- 物料列表表格（分页、搜索）
- 上传按钮（拖拽区域）
- 编辑对话框

**数据库**
```sql
CREATE TABLE materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    spec VARCHAR(255),
    std_price DECIMAL(10, 4),
    vave_price DECIMAL(10, 4),
    supplier_tier VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**验收标准**
- 上传 `materials.xlsx` 后能通过 API 查询到 `std_price` 和 `vave_price`

---

### 切片 2：工艺费率配置

**目标**: 建立费率表，支持 CRUD 和默认种子数据

**后端**
- `GET /api/process-rates` — 列表
- `POST /api/process-rates` — 创建
- `PUT /api/process-rates/{id}` — 更新
- `DELETE /api/process-rates/{id}` — 删除

**前端**
- 可编辑表格（ShadcnUI Table + Inline Edit）
- 增删改按钮

**数据库**
```sql
CREATE TABLE process_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    process_name VARCHAR(100),
    std_mhr DECIMAL(10, 2),
    std_labor DECIMAL(10, 2),
    vave_mhr DECIMAL(10, 2),
    vave_labor DECIMAL(10, 2),
    efficiency_factor DECIMAL(4,2) DEFAULT 1.0
);
```

**验收标准**
- 前端修改费率后，计算时能读取最新值

---

### 切片 3：BOM 解析与特征提取

**目标**: 解析 Excel，提取 Comments 中的工艺特征

**后端**
- `POST /api/bom/parse` — 上传并解析，返回结构化数据

**核心逻辑: PatternEngine**
```python
PATTERNS = {
    "bending": [r"折弯[：:]\s*(\d+)", r"bending[：:]\s*(\d+)"],
    "cutting": [r"切割[：:]\s*(\d+)", r"cut[：:]\s*(\d+)"],
    "marking": [r"划线[：:]\s*(\d+)", r"marking[：:]\s*(\d+)"],
    "welding": [r"焊接[：:]\s*(\d+)", r"welding[：:]\s*(\d+)"],
    "surface": [r"表面[处理]?[：:]\s*(\w+)", r"surface[：:]\s*(\w+)"],
}
```

**前端**
- 拖拽上传区域
- 解析结果预览表格

**验收标准**
- 上传 BOM 后返回 `features` 字段，包含提取的工艺和数量

---

### 切片 4：双轨计算引擎

**目标**: 实现双轨公式计算，返回 PricePair 结果

**后端**
- `POST /api/bom/calculate` — 接收解析后的 BOM，返回计算结果

**核心公式**
```
Standard Cost  = Σ(Qty × MaterialPrice_std) + Σ(CycleTime × (MHR_std + Labor_std))
VAVE Cost      = Σ(Qty × MaterialPrice_vave) + Σ(CycleTime × 0.9 × (MHR_vave + Labor_vave))
Savings        = Standard - VAVE
Savings Rate   = Savings / Standard × 100%
```

**红绿灯逻辑**
| match_type | status_light | confidence | 说明 |
|------------|--------------|------------|------|
| exact | green | 100 | 物料号完全匹配 |
| semantic | yellow | 70-85 | 向量语义匹配 |
| none | red | 0 | 无数据 |

**前端**
- 计算结果表格（Std / VAVE / Gap 三列）
- Gap > 20% 高亮显示

**验收标准**
- 计算结果与手工核算一致

---

### 切片 5：审核工作台（集成）

**目标**: 整合以上功能，端到端完成报价流程

**前端**
- 主工作区布局
- 左侧：BOM 表格（红绿灯状态）
- 右侧：详情面板（可编辑）
- 导出按钮（生成 QS Excel）

**验收标准**
- 端到端完成一次报价：上传 BOM → 解析 → 计算 → 审核 → 导出

---

## 4. 核心数据模型

### 4.1 Pydantic API 契约

```python
# core/value_objects.py
from pydantic import BaseModel
from decimal import Decimal

class PricePair(BaseModel):
    """双轨价格封装 - 不可变值对象"""
    std: Decimal
    vave: Decimal
    savings: Decimal
    savings_rate: float

class ExtractedFeature(BaseModel):
    """AI 提取的工艺特征"""
    process: str
    count: int
    unit: str = "次"

# api/schemas/bom.py
from typing import Literal

class BOMLineItemResponse(BaseModel):
    line_index: int
    part_number: str | None
    part_name: str
    material: str | None = None
    comments_raw: str | None = None

    # AI 提取结果
    features: list[ExtractedFeature]

    # 匹配状态
    match_type: Literal["exact", "semantic", "none"]
    confidence: float

    # 双轨成本
    total_cost: PricePair

    # 红绿灯状态
    status_light: Literal["green", "yellow", "red"]
    ai_suggestion: str | None = None
```

---

## 5. 错误处理与边界情况

### 5.1 异常类型

```python
class SmartQuoteException(Exception):
    code: str = "UNKNOWN_ERROR"
    message: str = "系统错误"
    status_code: int = 500

class BOMParseException(SmartQuoteException):
    code = "BOM_PARSE_FAILED"
    status_code = 400

class MaterialNotFoundException(SmartQuoteException):
    code = "MATERIAL_NOT_FOUND"
    status_code = 404
```

### 5.2 边界情况处理

| 场景 | 处理方式 |
|------|----------|
| 非Excel文件 | 返回 400，提示支持的格式 |
| 缺少必需列 | 该行标记为 red，其他行继续 |
| 物料编码部分匹配 | semantic，confidence=70 |
| 费率缺失 | 使用默认费率，提示完善 |
| 数量为负/零 | 跳过，AI建议说明 |
| VAVE > Std | 负收益，警告状态 |

---

## 6. 测试策略

### 6.1 极端测试用例

**数据边界**
- 零数量、负数数量、超大数量
- 标准价为0但VAVE有值
- VAVE高于标准价（配置错误检测）

**Excel格式攻击**
- 空文件、缺少列、列顺序错乱
- 重复物料号
- Comments含脚本注入、Unicode、Emoji
- 超长Comments（>5000字符）
- 数字格式混用

**并发与竞态**
- 10用户同时上传
- 计算过程中物料库更新
- 费率修改影响正在计算
- 1000+行BOM超时

**数据一致性**
- 有Std无VAVE回退
- VAVE为0视为未配置
- 工艺引用费率不存在
- 数据源冲突

**性能基准**
- 1000行解析 < 5s
- 100行计算 < 1s
- 物料查询 < 100ms
- 20并发 < 3s

**安全**
- SQL注入
- 路径穿越
- 超大文件上传
- Excel恶意宏

---

## 7. Docker配置

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: smartquote
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: smartquote_vector
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    depends_on:
      - mysql
      - postgres
    environment:
      DATABASE_URL: mysql://...
      VECTOR_DB_URL: postgresql://...

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

---

## 8. 开发命令

```bash
# 启动开发环境
docker-compose up -d

# 后端开发
cd backend && uvicorn app.main:app --reload

# 前端开发
cd frontend && npm run dev

# 数据库迁移
cd backend && alembic upgrade head

# 测试
cd backend && pytest
```

---

**文档状态**: ✅ 已完成设计，等待实现阶段
