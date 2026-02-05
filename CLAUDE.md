# CLAUDE.md - Dr.aiVOSS 协作指南

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.6   | 2026-02-02 | 2026-02-05 | Dr.aiVOSS AI 协作指南 | Randy Luo |

---

**版本变更记录：**
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.6 | 2026-02-05 | ✅ Payback 重写：从 VAVE 增量回收期改为项目静态回收期 |
| v1.5 | 2026-02-05 | 🔴 架构调整：移除双轨计价功能，简化为单一标准成本计算 |
| v1.4 | 2026-02-05 | v1.5 API 扩展：新增工厂、投资标准库、多版本报价相关端点；v2.1 新增报价单导入端点 |
| v1.3 | 2026-02-03 | 初始版本 |

## 🧠 Memory Bank (核心记忆)
**Project:** Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot) v2.0
**Context:** 这是一个 AI 辅助的制造业报价系统，核心逻辑是"精确成本核算"。

- **👉 CRITICAL RULE:** Before writing any code or answering logic questions, you MUST read `PROJECT_CONTEXT.md`. It is the "Single Source of Truth" for business logic and database schema.
  *(翻译：关键规则——在写任何代码或回答逻辑问题前，你必须阅读 PROJECT_CONTEXT.md。它是业务逻辑和数据库结构的唯一真理。)*

- **📄 Documentation Relationship:**
  | 文档 | 角色 | 说明 |
  |------|------|------|
  | `PROJECT_CONTEXT.md` | **The Constitution** | WHAT to build（业务逻辑的唯一真理源） |
  | `CLAUDE.md` | **The Guidelines** | HOW to build（编码规范与技术栈指南） |
  | `README.md` | **General Overview** | 项目概览与环境搭建（面向新人） |

## 🛠 Tech Stack & Style
- **Frontend:** Vite 6 + React 18 + TypeScript, TailwindCSS, **ShadcnUI** (Radix UI primitives).
  - *Rule:* 保持 B 端界面极简，优先使用 Shadcn 组件。
- **Backend:** Python 3.10+, **FastAPI**, SQLAlchemy, Pydantic.
  - *Rule:* 所有 API 输入输出必须严格遵循 Pydantic Schema。
- **DB:** MySQL (Primary), PostgreSQL (Vector), **Redis** (Cache).
- **AI:** 通义千问 Qwen-Plus (阿里云 DashScope), 兼容 OpenAI API 格式.

## ⚙️ Build & Run Commands
- **Frontend:** `npm run dev`
- **Backend:** `uvicorn app.main:app --reload`
- **Test:** `pytest`
- **Install:** `pip install -r requirements.txt` / `npm install`
- **Redis:** `docker run -d -p 6379:6379 redis:7-alpine`

## 📜 数据库快速索引

| 表名 | 用途 | 详细定义 |
|------|------|---------|
| `materials` | 物料主数据 | [DATABASE_DESIGN.md §3.1](docs/DATABASE_DESIGN.md#master-data) |
| `process_rates` | 工序费率 | [DATABASE_DESIGN.md §3.1](docs/DATABASE_DESIGN.md#master-data) |
| `factories` | 工厂主数据 | [DATABASE_DESIGN.md §3.3](docs/DATABASE_DESIGN.md#master-data-extension) 🔴 v1.5 |
| `std_investment_costs` | 投资项标准库 | [DATABASE_DESIGN.md §3.4](docs/DATABASE_DESIGN.md#investment-standards) 🔴 v1.5 |
| `projects` | 项目表 | [DATABASE_DESIGN.md §3.2](docs/DATABASE_DESIGN.md#transaction-data) |
| `project_products` | 项目-产品 | [DATABASE_DESIGN.md §3.2](docs/DATABASE_DESIGN.md#transaction-data) |
| `product_materials` | BOM 行 | [DATABASE_DESIGN.md §3.2](docs/DATABASE_DESIGN.md#transaction-data) |
| `product_processes` | 工艺路线 | [DATABASE_DESIGN.md §3.2](docs/DATABASE_DESIGN.md#transaction-data) |
| `quote_summaries` | 报价汇总（多版本） | [DATABASE_DESIGN.md §3.2](docs/DATABASE_DESIGN.md#transaction-data) |

> 完整设计文档：[docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md)

## 📝 API Data Models (Pydantic)

Backend 必须使用以下模型作为 API 契约:

```python
class PricePair(BaseModel):
    """价格封装"""
    std: Decimal

class BOMLineItem(BaseModel):
    line_index: int
    part_number: Optional[str]
    part_name: str
    comments_extracted: dict  # e.g., {"process": "bending", "count": 32}

    # 核心：总成本
    total_cost: PricePair

    # 状态红绿灯
    confidence: float  # 0-100
    status: str        # 'verified' (Green), 'warning' (Yellow), 'missing' (Red)
    ai_suggestion: Optional[str]
```

## 🎨 Frontend Types & State (前端类型定义)

前端核心类型定义位于 `frontend/src/App.tsx:24-55`，后端 API 必须与之对齐：

```typescript
// 项目数据
interface ProjectData {
  id: string;              // 项目编号，如 "PRJ-2024-001"
  asacNumber: string;      // ASAC 编号
  customerNumber: string;  // 客户编号
  productVersion: string;  // 产品版本
  customerVersion: string; // 客户版本
  clientName: string;      // 客户名称
  projectName: string;     // 项目名称
  annualVolume: string;    // 年量
  description: string;     // 描述
  products: Product[];     // 产品列表
  owners: ProjectOwner;    // 负责人
  status: 'draft' | 'in-progress' | 'completed';
  createdDate: string;
  updatedDate: string;
}

// 产品
interface Product {
  id: string;
  name: string;
  partNumber: string;      // 零件号
  annualVolume: number;
  description: string;
}

// 负责人
interface ProjectOwner {
  sales: string;       // 销售
  vm: string;          // 项目经理
  ie: string;          // 工艺工程师
  controlling: string; // 财务控制
}

// 视图类型
type View =
  | 'dashboard'
  | 'project-success'
  | 'bom'
  | 'process'
  | 'cost-calc'
  | 'quotation'
  | 'investment'
  | 'output';
```

**状态管理规范：**
- 当前使用 React `useState` 在 `App.tsx` 层级管理全局状态
- `currentView`: 当前活动视图
- `selectedProject`: 当前选中的项目
- `projects`: 项目列表
- **注意：** 未来如需状态管理库，推荐 Zustand（轻量）或 Redux Toolkit（复杂场景）

**BOM 相关类型（BOMManagement.tsx 中定义）：**
```typescript
interface Material {
  id: string;
  partNumber: string;
  partName: string;
  material: string;           // 材质类型
  supplier: string;
  quantity: number;
  unitPrice?: number;         // 单价
  hasHistoryData: boolean;
  comments: string;
}

interface Process {
  id: string;
  opNo: string;               // 工序号
  name: string;               // 工序名称
  workCenter: string;         // 工作中心
  standardTime: number;       // 标准工时
  unitPrice?: number;
  hasHistoryData: boolean;
}
```

## 🔌 API 契约定义（供后端开发参考）

> 后端开发请参考以下接口规范，确保前端组件能正常调用。

### 基础配置
- Base URL: `http://localhost:8000/api/v1`
- 认证: Bearer Token (待实现)
- 响应格式: JSON

### API 端点清单

| 方法 | 端点 | 功能 | 对应前端组件 |
|------|------|------|-------------|
| GET | `/projects` | 获取项目列表 | Dashboard |
| POST | `/projects/sync` | 从 PM 软件同步项目 | Dashboard |
| GET | `/projects/{id}` | 获取项目详情 | 所有组件 |
| POST | `/projects` | 创建新项目 | NewProject |
| PUT | `/projects/{id}` | 更新项目 | - |
| POST | `/bom/upload` | 上传并解析 BOM 文件 | BOMManagement |
| GET | `/bom/{projectId}/materials` | 获取物料清单 | BOMManagement |
| GET | `/bom/{projectId}/processes` | 获取工艺清单 | BOMManagement |
| **POST** | **`/procurement/summary/{projectId}`** | **🔴 v1.5：生成项目级采购询价汇总** | BOMManagement |
| **POST** | **`/procurement/send-request`** | **🔴 v1.5：发送询价邮件** | BOMManagement |
| **POST** | **`/procurement/import-quote`** | **🔴 v2.1：导入采购报价单并识别价格** | BOMManagement |
| POST | `/cost/calculate` | 执行成本核算 | CostCalculation |
| GET | `/cost/{projectId}` | 获取成本结果 | CostCalculation |
| **GET** | **`/quotations/{projectId}`** | **🔴 v1.5：获取项目所有版本报价** | QuoteSummary |
| **GET** | **`/quotations/{projectId}/{version}`** | **🔴 v1.5：获取指定版本报价** | QuoteSummary |
| **POST** | **`/quotations/{projectId}`** | **🔴 v1.5：Sales 输入商业参数并计算 QS/BC/Payback** | QuoteSummary |
| **PUT** | **`/quotations/{id}/submit`** | **🔴 v1.5：提交报价版本** | QuoteSummary |
| POST | `/quotation/generate` | 生成报价单 | QuotationOutput |
| **GET** | **`/factories`** | **🔴 v1.5：获取工厂列表** | - |
| **POST** | **`/factories`** | **🔴 v1.5：创建工厂** | - |
| **GET** | **`/std-investment-costs`** | **🔴 v1.5：获取投资项标准库** | - |
| **POST** | **`/std-investment-costs`** | **🔴 v1.5：创建投资项标准** | - |

### 核心响应模型

**ProjectResponse（项目响应）v1.5**
```json
{
  "id": "PRJ-2024-001",
  "asacNumber": "AS-2024-001",
  "customerNumber": "BOSCH-2024-Q1",
  "clientName": "博世汽车部件（苏州）有限公司",
  "projectName": "发动机缸体零部件报价",
  "annualVolume": "120000",
  "factoryId": "F001",
  "factoryName": "苏州工厂",
  "status": "sales_input",
  "products": [...],
  "owners": {...}
}
```

**MaterialResponse（物料响应）**
```json
{
  "id": "M-001",
  "partNumber": "A356-T6",
  "partName": "铝合金",
  "unitPrice": 28.50,
  "hasHistoryData": true,
  "status": "verified"
}
```

**CostCalculationResponse（成本核算响应）**
```json
{
  "productId": "P-001",
  "materialCost": 210.95,
  "processCost": 264.00,
  "totalCost": 474.95
}
```

**QuoteSummaryResponse（报价摘要响应）v1.5**
```json
{
  "id": "QS-001",
  "projectId": "PRJ-2024-001",
  "versionNumber": 1.0,
  "status": "draft",
  "totalCost": 474.95,
  "hk3Cost": 474.95,
  "skCost": 490.50,
  "db1": 50.00,
  "db4": 35.50,
  "quotedPrice": 580.00,
  "actualMargin": 15.5,
  "businessParams": {
    "exchangeRate": 6.8,
    "annualReductionRate": 3.0,
    "logisticsRate": 0.015,
    "otherMfgRate": 0.02
  },
  "createdAt": "2026-02-05T10:00:00Z"
}
```

**ProcurementSummaryResponse（采购询价汇总响应）🔴 v1.5**
```json
{
  "projectId": "PRJ-2024-001",
  "materialsToQuote": [
    {
      "materialCode": "A356-T6",
      "materialName": "铝合金",
      "totalQuantity": 350.5,
      "unit": "kg",
      "products": ["产品A", "产品B"],
      "suppliers": ["供应商1", "供应商2"]
    }
  ],
  "totalUniqueMaterials": 5,
  "emailRecipients": ["procurement@company.com"],
  "estimatedQuoteDate": "2026-02-10"
}
```

**StdInvestmentCostResponse（投资项标准响应）🔴 v1.5**
```json
{
  "id": "STD-001",
  "itemType": "MOLD",
  "materialType": "P20",
  "tonnage": 500,
  "complexity": "MEDIUM",
  "stdCostMin": 150000,
  "stdCostMax": 200000,
  "currency": "CNY",
  "status": "ACTIVE"
}
```

### BOM 上传解析 API

**POST** `/api/v1/bom/upload`

请求：
- Content-Type: `multipart/form-data`
- Body: `file` (Excel/CSV 文件)
- Query: `projectId` (项目 ID)

响应：
```json
{
  "parseId": "parse-123",
  "status": "completed",
  "materials": [
    {
      "partNumber": "A356-T6",
      "partName": "铝合金",
      "quantity": 3.5,
      "unit": "kg",
      "stdPrice": 28.50,
      "vavePrice": 26.80,
      "hasHistoryData": true,
      "status": "verified",
      "comments": "铸造级，符合GB/T 1173标准"
    }
  ],
  "processes": [
    {
      "opNo": "010",
      "name": "重力铸造",
      "workCenter": "铸造车间",
      "standardTime": 2.5,
      "stdPrice": 45.00,
      "vavePrice": 42.00,
      "hasHistoryData": true
    }
  ]
}
```

## 🚨 Coding Rules (重要原则)

1. **AI 特征提取:** 解析 Excel 时，重点关注 Comments (Col 13)。提取格式统一为 JSON 字典。

2. **状态标记逻辑:**
   - 如果 `item_code` 在库中完全匹配且有效期内 → **Green**
   - 如果使用 AI 语义匹配或 AI 估算参数 → **Yellow**
   - 如果库中无数据 → **Red**

3. **不确定的逻辑:** 如果遇到 PRD 未定义的逻辑，优先询问用户，不要自行假设。

## 🧪 Testing Focus

测试重点在于 **BOM 解析的准确性** 和 **标准成本计算的一致性**。

必须编写 Unit Test 来验证以下计算结果：
- 物料成本计算：`SUM(std_price × quantity)`
- 工艺成本计算：`SUM((cycle_time / 3600) × (mhr_var + mhr_fix + personnel × labor_rate))`
- Payback 回收期计算：`项目总投资 / 项目月度净利`
