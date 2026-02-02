# CLAUDE.md - SmartQuote 协作指南

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-02 | 2026-02-02 | SmartQuote AI 协作指南 | Randy Luo |

## 🧠 Memory Bank (核心记忆)
**Project:** SmartQuote MVP (Dual-Price Edition) v2.0
**Context:** 这是一个 AI 辅助的制造业报价系统，核心逻辑是"双轨计价"（标准价 vs VAVE 优化价）。

- **👉 CRITICAL RULE:** Before writing any code or answering logic questions, you MUST read `PROJECT_CONTEXT.md`. It is the "Single Source of Truth" for business logic and database schema.
  *(翻译：关键规则——在写任何代码或回答逻辑问题前，你必须阅读 PROJECT_CONTEXT.md。它是业务逻辑和数据库结构的唯一真理。)*

- **📄 Documentation Relationship:**
  | 文档 | 角色 | 说明 |
  |------|------|------|
  | `PROJECT_CONTEXT.md` | **The Constitution** | WHAT to build（业务逻辑的唯一真理源） |
  | `CLAUDE.md` | **The Guidelines** | HOW to build（编码规范与技术栈指南） |
  | `README.md` | **General Overview** | 项目概览与环境搭建（面向新人） |

## 🛠 Tech Stack & Style
- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, **ShadcnUI**.
  - *Rule:* 保持 B 端界面极简，优先使用 Shadcn 组件。
- **Backend:** Python 3.10+, **FastAPI**, SQLAlchemy, Pydantic.
  - *Rule:* 所有 API 输入输出必须严格遵循 Pydantic Schema。
- **DB:** MySQL (Primary), PostgreSQL (Vector).

## ⚙️ Build & Run Commands
- **Frontend:** `npm run dev`
- **Backend:** `uvicorn app.main:app --reload`
- **Test:** `pytest`
- **Install:** `pip install -r requirements.txt` / `npm install`

## 📜 Database Schema (不可变契约)

**MySQL Schema (请复用此结构):**

```sql
-- 1. 物料表 (带双价格)
CREATE TABLE materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    spec VARCHAR(255),
    std_price DECIMAL(10, 4),    -- 标准单价
    vave_price DECIMAL(10, 4),   -- VAVE单价
    supplier_tier VARCHAR(20),   -- 供应商等级
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 工艺费率表 (带双费率)
CREATE TABLE process_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    process_name VARCHAR(100),
    std_mhr DECIMAL(10, 2),      -- 标准机时费
    std_labor DECIMAL(10, 2),    -- 标准人工费
    vave_mhr DECIMAL(10, 2),     -- 优化机时费
    vave_labor DECIMAL(10, 2),   -- 优化人工费
    efficiency_factor DECIMAL(4,2) DEFAULT 1.0
);
```

## 📝 API Data Models (Pydantic)

Backend 必须使用以下模型作为 API 契约:

```python
class PricePair(BaseModel):
    """双轨价格封装"""
    std: Decimal
    vave: Decimal
    savings: Decimal  # calculated as: std - vave

class BOMLineItem(BaseModel):
    line_index: int
    part_number: Optional[str]
    part_name: str
    comments_extracted: dict  # e.g., {"process": "bending", "count": 32}

    # 核心：双轨总成本
    total_cost: PricePair

    # 状态红绿灯
    confidence: float  # 0-100
    status: str        # 'verified' (Green), 'warning' (Yellow), 'missing' (Red)
    ai_suggestion: Optional[str]
```

## 🚨 Coding Rules (重要原则)

1. **双轨计算原则:** 任何涉及金额计算的逻辑，必须同时返回 Standard 和 VAVE 两个数值。严禁只返回单一价格。

2. **AI 特征提取:** 解析 Excel 时，重点关注 Comments (Col 13)。提取格式统一为 JSON 字典。

3. **状态标记逻辑:**
   - 如果 `item_code` 在库中完全匹配且有效期内 → **Green**
   - 如果使用 AI 语义匹配或 AI 估算参数 → **Yellow**
   - 如果库中无数据 → **Red**

4. **Value Highlight:** 前端展示时，如果 `savings` (Gap) 超过 Std Cost 的 20%，必须高亮显示。

5. **不确定的逻辑:** 如果遇到 PRD 未定义的逻辑，优先询问用户，不要自行假设。

## 🧪 Testing Focus

测试重点在于 **BOM 解析的准确性** 和 **双轨公式计算的一致性**。

必须编写 Unit Test 来验证 Standard Cost 和 VAVE Cost 的计算结果差异。
