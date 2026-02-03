# SmartQuote MVP (Dual-Price Edition) - v2.0

> **项目代号:** SmartQuote MVP
> **核心理念:** 文档驱动 | 双轨核算 | 人机协同

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.1   | 2026-02-02 | 2026-02-03 | SmartQuote MVP 项目说明 | Randy Luo |

## 1. 项目简介 (Vision)

SmartQuote 是一个专为制造业成本工程师和销售经理设计的 AI 智能报价系统。旨在通过简单的 Excel BOM 拖拽，自动化处理复杂的成本核算任务。

**核心差异化：** 本系统采用 **"双轨核算 (Dual-Track Calculation)"** 机制，不仅计算"当前标准成本 (Standard Cost)"，还同时计算基于最佳实践的"VAVE 目标成本 (VAVE Target Cost)"，直接量化降本潜力。

## 2. 核心功能 (Features)

- **双轨知识库:** 维护物料主数据和工艺费率表，支持双价格（标准价 vs 目标价）录入。
- **AI 智能解析:** 基于 LLM 提取 BOM 中 `Comments` 列的非结构化特征（如："折弯：32次"）。
- **红绿灯审核:**
  - 🟢 **Green:** 完全匹配，价格有效。
  - 🟡 **Yellow:** AI 估算或模糊匹配，需人工确认。
  - 🔴 **Red:** 缺数，需人工询价。
- **价值分析:** 自动计算 Gap (价差)，高亮显示降本空间 >20% 的条目。

## 3. 技术栈 (Tech Stack)

* **Frontend:** Vite 6 + React 18 + TypeScript, TailwindCSS, ShadcnUI (Radix UI primitives)
* **Backend:** Python FastAPI (AI Native)
* **Database:**
    * **MySQL:** 结构化主数据 (物料、费率)
    * **PostgreSQL (pgvector):** 非结构化历史报价 & 向量检索 (RAG)
* **AI:** 通义千问 Qwen-Plus (阿里云 DashScope)

## 4. 环境搭建 (Setup)

### 前端 (Client)

```bash
cd frontend
npm install
npm run dev      # 开发模式: http://localhost:5173
npm run build    # 生产构建
```

### 后端 (Server)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# API 文档: http://localhost:8000/docs
```

## 5. 核心业务逻辑公式

系统后端必须始终运行两套公式：

**Standard Cost (当前成本):**
$$ \sum (Qty \times P_{std}) + \sum (CycleTime_{std} \times (MHR_{std} + Labor_{std})) $$

**VAVE Cost (目标成本):**
$$ \sum (Qty \times P_{vave}) + \sum (CycleTime_{opt} \times (MHR_{vave} + Labor_{vave})) $$

## 6. 设计文档

| 文档 | 用途 | 目标读者 |
|------|------|---------|
| [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | 数据库结构唯一真理源 | 后端开发、DBA |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | 业务逻辑与 API 契约 | 全体开发者 |
| [CLAUDE.md](CLAUDE.md) | AI 编码协作指南 | AI 助手、开发者 |
| [README.md](README.md) | 项目概览与入门 | 新成员 |

> 💡 **规则：** 当数据库结构需要变更时，仅更新 `docs/DATABASE_DESIGN.md`，其他文档引用即可。

## 7. 目录结构

```
smartquote/
├── backend/
│   ├── app/
│   │   ├── api/          # 路由
│   │   ├── core/         # 配置 & 工具
│   │   ├── models/       # Pydantic & SQLAlchemy Models
│   │   ├── services/     # 业务逻辑 (Calculator, Parser)
│   │   └── main.py
│   └── tests/
├── frontend/
│   ├── src/              # Vite 源码目录
│   │   ├── components/   # 业务组件
│   │   │   ├── ui/       # ShadcnUI 基础组件
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BOMManagement.tsx
│   │   │   ├── CostCalculation.tsx
│   │   │   ├── QuoteSummary.tsx
│   │   │   └── ...       # 其他业务组件
│   │   ├── App.tsx       # 应用入口（含类型定义）
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── CLAUDE.md             # AI 协作指南
├── PROJECT_CONTEXT.md    # 业务逻辑唯一真理源
└── README.md             # 本文件
```

## 8. 前端组件说明

| 组件 | 功能 | 对应视图 |
|------|------|---------|
| Dashboard | 项目列表仪表板 | dashboard |
| NewProject | 创建新项目 | - |
| ProjectCreationSuccess | 项目创建成功页 | project-success |
| BOMManagement | BOM 管理（物料/工艺清单） | bom |
| ProcessAssessment | 新工艺评估（条件触发） | process |
| CostCalculation | 成本核算 | cost-calc |
| QuoteSummary | QS/BC 报价摘要 | quotation |
| InvestmentRecovery | Payback 投资回收 | investment |
| QuotationOutput | 报价输出 | output |
| AppSidebar | 侧边栏流程导航 | - |
| QualityAssessment | 质量评估 | - |
| InvestmentAnalysis | 投资分析 | - |
| WorkflowGuide | 工作流指南 | - |
| QuotationGeneration | 报价生成 | - |

**视图流程顺序：**
```
dashboard → project-success → bom → process → cost-calc → quotation → investment → output
```

**分支流程（条件触发）：**
- `process` - 当识别到新工艺路线时触发，需 IE 工程师评估
- 采购询价 - 当物料无历史数据时触发
