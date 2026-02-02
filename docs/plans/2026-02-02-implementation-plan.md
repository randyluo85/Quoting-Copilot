# SmartQuote MVP 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建 SmartQuote MVP 核心功能：物料库管理、工艺费率配置、BOM 解析引擎、双轨计算器

**Architecture:** 前后端分离，FastAPI 后端 + Next.js 前端，MySQL 存储主数据，Docker Compose 编排

**Tech Stack:**
- Backend: Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Alembic
- Frontend: Next.js (App Router), TypeScript, TailwindCSS, ShadcnUI
- Database: MySQL 8.0, PostgreSQL (pgvector)
- Infra: Docker Compose, uv, ruff

---

## 📋 计划索引

| 文件 | 对应切片 | 状态 |
|------|----------|------|
| `00-project-setup.md` | 项目初始化 | 待开始 |
| `01-material-library.md` | 切片1: 物料库管理 | 待开始 |
| `02-process-rates.md` | 切片2: 工艺费率配置 | 待开始 |
| `03-bom-parser.md` | 切片3: BOM 解析引擎 | 待开始 |
| `04-dual-calculator.md` | 切片4: 双轨计算器 | 待开始 |

---

## 🚀 快速开始

```bash
# 1. 从项目初始化开始
cat docs/plans/2026-02-02-implementation-plan-00-project-setup.md

# 2. 按顺序执行每个切片计划
# 每个计划文件包含详细的 TDD 步骤
```

---

## 📁 项目结构预览

```
smartquote/
├── backend/
│   ├── app/
│   │   ├── api/              # 路由
│   │   ├── core/             # 配置、异常
│   │   ├── models/           # ORM
│   │   ├── schemas/          # Pydantic
│   │   └── services/         # 业务逻辑
│   ├── tests/
│   └── alembic/
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
├── docker-compose.yml
└── docs/plans/
```

---

**执行方式选择：**

1. **Subagent-Driven (this session)** - 我在此会话逐任务执行，每个任务后进行代码审查
2. **Parallel Session (separate)** - 在新会话中使用 executing-plans 技能批量执行

请确认执行方式后，我将开始创建详细的切片计划文件。
