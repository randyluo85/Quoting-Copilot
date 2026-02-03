# SmartQuote 文档一致性检查报告

> **检查日期:** 2026-02-03
> **检查范围:** 项目所有文档
> **检查方法:** 交叉对比关键术语、数据结构、API定义、业务逻辑

---

## 一、检查结果摘要

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 技术栈描述 | ✅ 通过 | 已修复 PROJECT_CONTEXT.md 中的 Next.js 问题 |
| 版本号管理 | ✅ 通过 | 所有文档已同步到统一版本 |
| 数据结构字段 | ✅ 通过 | std_price, vave_price, std_cost, vave_cost 一致 |
| 计算公式 | ✅ 通过 | 节省率公式一致 |
| 状态流转 | ⚠️ 发现差异 | 见下文详细说明 |
| 术语定义 | ✅ 通过 | 术语表已创建并保持一致 |

---

## 二、发现的差异（非冲突，需确认）

### 2.1 状态流转描述差异

| 文档 | 状态流转定义 | 说明 |
|------|-------------|------|
| PROJECT_CONTEXT.md:65 | `draft → parsing → (waiting_price \[alt;waiting_ie) → waiting_mhr → calculated → sales_review → controlling_review → approved` | 简化版 |
| DATABASE_DESIGN.md:179 | `draft → parsing → (waiting_price \[alt;waiting_ie) → (waiting_mhr) → calculated → sales_review → controlling_review → approved` | 同上 |
| docs/PRD.md:324-350 | 使用状态图展示更细粒度的状态（Draft, Parsed, M_Auto, P_Auto, Calc, Sales, Ctrl, Done 等） | 详细版 |

**分析:** 这不是冲突，而是**不同层次的抽象**：
- PROJECT_CONTEXT.md 和 DATABASE_DESIGN.md 给出的是数据库存储的状态值
- PRD.md 中的状态图是业务流程的展示，包含中间状态

**建议:** 保持现状，但可以考虑在 PROJECT_CONTEXT.md 中添加注释说明 PRD.md 有更详细的状态图。

---

### 2.2 前端类型定义与数据库字段命名差异

| 位置 | 字段命名风格 | 说明 |
|------|-------------|------|
| CLAUDE.md (前端) | camelCase: `asacNumber`, `customerNumber`, `clientName`, `annualVolume` | TypeScript/JavaScript 惯例 |
| DATABASE_DESIGN.md (数据库) | snake_case: `project_code`, `customer_code`, `customer_name`, `annual_volume` | SQL 惯例 |

**分析:** 这是**命名风格的正常差异**，前端和后端各自遵循其语言惯例。

**建议:** 保持现状，确保 API 层做正确的转换（后端应该自动转换 snake_case 到 camelCase）。

---

### 2.3 Pydantic 模型定义分散

**现状:** PricePair 模型在多个文档中有定义：

| 文档 | 行号 | 内容 |
|------|------|------|
| PROJECT_CONTEXT.md | 39-46 | JSON 格式的值对象定义 |
| CLAUDE.md | 55-60 | Python Pydantic 类定义 |
| docs/TESTING_STRATEGY.md | 65-72 | Python 测试用例中的定义 |
| docs/API_REFERENCE.md | 345-349 | TypeScript 接口定义 |

**分析:** 同一模型在不同文档中以不同语言重复定义是**正常的**，因为每个文档面向不同的读者。

**建议:** 保持现状，但确保：
1. 单一语言内的定义保持一致（如 Python 内部）
2. 字段名称和类型在各语言中对应正确

---

## 三、已修复的问题

### 3.1 技术栈不一致 ✅

**问题:** PROJECT_CONTEXT.md:113 写的是 "Next.js (App Router)"
**修复:** 已改为 "Vite 6 + React 18"
**影响:** 消除了开发者困惑

### 3.2 版本号不一致 ✅

**问题:** 文档版本号不统一（v1.0, v1.1, v2.0 混用）
**修复:**
- PROJECT_CONTEXT.md: v2.0 → v2.1
- 所有业务逻辑文档: v1.0 → v1.1
- 创建 docs/CHANGELOG.md 记录变更

---

## 四、术语一致性验证

### 4.1 核心术语对照

| 中文 | 英文 | 缩写 | 数据库字段 | 一致性 |
|------|------|------|-----------|--------|
| 标准价 | Standard Price | Std | std_price, std_cost | ✅ |
| VAVE价 | VAVE Price | VAVE | vave_price, vave_cost | ✅ |
| 节省空间 | Savings | - | savings | ✅ |
| 节省率 | Savings Rate | - | savings_rate | ✅ |
| 机时费率 | Machine Hour Rate | MHR | std_mhr, vave_mhr | ✅ |
| 物料清单 | Bill of Materials | BOM | product_materials | ✅ |
| 报价摘要 | Quote Summary | QS | quote_summaries | ✅ |
| 成本分解 | Breakdown | BC | (通过计算得出) | ✅ |

---

## 五、API 端点一致性验证

### 5.1 API 前缀

| 文档 | 定义的 Base URL | 一致性 |
|------|----------------|--------|
| CLAUDE.md | `http://localhost:8000/api/v1` | ✅ |
| API_REFERENCE.md | `http://localhost:8000/api/v1` | ✅ |
| DEPLOYMENT.md | `http://localhost:8000` (主服务) | ✅ |

### 5.2 核心端点验证

| 端点 | CLAUDE.md | API_REFERENCE.md | 一致性 |
|------|----------|------------------|--------|
| 获取项目列表 | GET `/projects` | GET `/projects` | ✅ |
| 创建项目 | POST `/projects` | POST `/projects` | ✅ |
| BOM 上传 | POST `/bom/upload` | POST `/bom/upload` | ✅ |
| 成本计算 | POST `/cost/calculate` | POST `/cost/calculate` | ✅ |
| 获取报价 | GET `/quotation/{projectId}` | GET `/quotation/{projectId}` | ✅ |

---

## 六、建议的改进

### 6.1 短期改进

1. **在 PROJECT_CONTEXT.md 中添加状态流转注释**
   ```markdown
   **状态流转（projects.status）：**
   ```
   draft → parsing → (waiting_price | waiting_ie) → waiting_mhr →
   calculated → sales_review → controlling_review → approved
   ```
   > 详细的状态转换图请参考 [docs/PRD.md §6.2](docs/PRD.md#62-状态流转)
   ```

2. **在 CLAUDE.md 中添加 API 转换说明**
   ```markdown
   **命名约定:**
   - 数据库字段使用 snake_case
   - API 响应自动转换为 camelCase (前端)
   - Pydantic 模型使用 Python 约定 (snake_case)
   ```

### 6.2 长期维护

1. **每次 API 变更时同步更新:**
   - CLAUDE.md
   - API_REFERENCE.md
   - DEPLOYMENT.md (如涉及环境变量)

2. **每次数据结构变更时同步更新:**
   - DATABASE_DESIGN.md
   - PROJECT_CONTEXT.md
   - 所有相关 LOGIC 文档

3. **定期运行文档一致性检查**
   - 建议每月一次
   - 使用 grep 模式检查关键字段一致性

---

## 七、检查命令清单

```bash
# 1. 检查技术栈一致性
grep -r "Next.js\|Vite\|React" --include="*.md" .

# 2. 检查双轨价格字段
grep -r "std_price\|vave_price\|std_cost\|vave_cost" --include="*.md" .

# 3. 检查状态流转
grep -r "draft\|parsing\|waiting_\|calculated\|sales_review\|approved" --include="*.md" .

# 4. 检查 MHR 费率字段
grep -r "std_mhr\|vave_mhr" --include="*.md" .

# 5. 检查 API 端点
grep -r "/projects\|/bom/\|/cost/\|/quotation/" --include="*.md" docs/
```

---

## 八、结论

**整体评估:** ✅ **文档一致性良好**

- 所有核心术语和数据结构定义保持一致
- API 端点定义统一
- 计算公式在各文档中一致
- 已修复的技术栈问题消除了主要困惑源
- 发现的差异主要是合理的抽象层次和语言习惯差异

**无关键冲突需要修复。**

---

**报告结束**
