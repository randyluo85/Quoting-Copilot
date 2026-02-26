# Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot) - v2.1

> **产品名称:** Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot)
> **项目代号:** SmartQuote MVP
> **核心理念:** 文档驱动 | 精确核算 | 人机协同

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.5   | 2026-02-02 | 2026-02-25 | Dr.aiVOSS 智能快速报价助手项目说明 | Randy Luo |

---

**版本变更记录：**
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.5 | 2026-02-25 | 🔴 **重大更新**：管理层决策支持（价格瀑布、混合分摊、年降绝对值）；去汽车化术语泛化；支持通用制造行业（储能、数据中心等） |
| v1.4 | 2026-02-05 | 🆕 新增向量数据库相关文档链接；移除 VAVE 相关内容 |
| v1.3 | 2026-02-04 | 初始版本 |

---

## 1. 项目简介 (Vision)

**Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot)** 是一个专为制造业成本工程师和销售经理设计的 AI 智能报价系统。旨在通过简单的 Excel BOM 拖拽，自动化处理复杂的成本核算任务。

**核心差异化：** 本系统采用 **"精确成本核算"** 机制，基于物料主数据和工艺费率库，自动计算标准成本，为报价决策提供可靠依据。

## 2. 核心功能 (Features)

- **标准知识库:** 维护物料主数据和工艺费率表，支持标准成本录入。
- **AI 智能解析:** 基于 LLM 提取 BOM 中 `Comments` 列的非结构化特征（如："折弯：32次"）。
- **向量语义匹配:** 当物料号无法精确匹配时，使用向量搜索找到相似历史物料。
- **红绿灯审核:**
  - 🟢 **Green:** 完全匹配，价格有效。
  - 🟡 **Yellow:** AI 估算或模糊匹配，需人工确认。
  - 🔴 **Red:** 缺数，需人工询价。

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
npm run dev      # 开发模式: http://localhost:3001
npm run build    # 生产构建
```

### 后端 (Server)

```bash
# 安装 uv（如果尚未安装）
curl -LsSf https://astral.sh/uv/install.sh | sh
# 或使用 pip: pip install uv

cd backend
# 使用 uv 运行（自动管理虚拟环境）
uv run uvicorn app.main:app --reload --port 8000
# API 文档: http://localhost:8000/docs
```

## 5. 核心业务逻辑公式

系统后端标准成本计算公式：

**Standard Cost (标准成本):**
$$ Cost_{std} = \sum (Qty \times P_{std}) + \sum (CycleTime \times (MHR_{std} + Labor_{std})) $$

## 6. 🚀 快速找到你要的文档

| 我想... | 查看文档 |
|---------|----------|
| 了解项目全貌 | [README.md](README.md) ← 当前文档 |
| 理解业务逻辑 | [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) |
| 开始开发 | [CLAUDE.md](CLAUDE.md) |
| 理解产品需求 | [docs/PRD.md](docs/PRD.md) |
| 查看数据库设计 | [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) |
| 查找术语定义 | [docs/GLOSSARY.md](docs/GLOSSARY.md) |
| 向量化架构设计 | [docs/VECTOR_DESIGN.md](docs/VECTOR_DESIGN.md) 🆕 |
| 部署系统 | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| 测试指南 | [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) |
| API 参考 | [docs/API_REFERENCE.md](docs/API_REFERENCE.md) |
| 文档变更记录 | [docs/CHANGELOG.md](docs/CHANGELOG.md) |

### 完整文档索引

| 文档 | 用途 | 目标读者 |
|------|------|---------|
| [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | 数据库结构唯一真理源 | 后端开发、DBA |
| [docs/VECTOR_DESIGN.md](docs/VECTOR_DESIGN.md) | 向量化数据架构设计 🆕 | 后端开发、算法工程师 |
| [docs/PAYBACK_LOGIC.md](docs/PAYBACK_LOGIC.md) | 投资回收期计算逻辑与 BOM 映射 | 全体开发者 |
| [docs/BUSINESS_CASE_LOGIC.md](docs/BUSINESS_CASE_LOGIC.md) | Business Case 计算逻辑 (HK/SK/DB) | 全体开发者 |
| [docs/QUOTATION_SUMMARY_LOGIC.md](docs/QUOTATION_SUMMARY_LOGIC.md) | Quotation Summary 报价汇总逻辑 | 全体开发者 |
| [docs/NRE_INVESTMENT_LOGIC.md](docs/NRE_INVESTMENT_LOGIC.md) | NRE 投资成本计算逻辑 (模具/检具/夹具) | IE、后端开发 |
| [docs/PROCESS_COST_LOGIC.md](docs/PROCESS_COST_LOGIC.md) | 工艺成本计算逻辑 (MHR) | IE、后端开发 |
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
