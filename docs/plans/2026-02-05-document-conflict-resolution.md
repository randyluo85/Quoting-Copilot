# 文档逻辑冲突检查报告与修复计划

| 版本号 | 创建时间 | 文档主题 | 创建人 |
|--------|----------|----------|--------|
| v1.0   | 2026-02-05 | 文档一致性检查与修复计划 | Claude |

---

## 📊 执行摘要

**检查范围：** docs/ 目录下 19 个文档
**检查时间：** 2026-02-05
**发现问题：** 🔴 严重冲突 9 个 | 🟡 潜在冲突 7 个 | 🟢 版本差异 5 个

---

## 🔴 严重冲突清单

### 1. PROJECT_CONTEXT.md 版本内部不一致

| 位置 | 当前值 | 应为 |
|------|--------|------|
| 头部表格 | v2.3 (2026-02-05) | ✅ 正确 |
| 文档内部状态 | v2.2 (最后更新: 2026-02-03) | v2.3 (2026-02-05) |

**影响：** 文档版本信息混乱

---

### 2. 状态流转描述不一致

| 文档 | 状态流转定义 |
|------|-------------|
| **PROJECT_CONTEXT.md** | `draft → parsing → (waiting_price \| waiting_ie) → waiting_mhr → calculated → sales_input → completed` |
| **PRD.md 状态图** | 使用 M_Auto/P_Auto/M_Wait 等不同状态名 |
| **API_REFERENCE.md** | 仍保留 "Sales 审核 → Controlling 审核" 流程 |

**冲突点：** PRD.md 和 API_REFERENCE.md 未同步 v2.0 流程变更（移除 Controlling 审核）

---

### 3. SK 成本计算公式不一致

| 文档 | SK 公式定义 |
|------|------------|
| **DATABASE_DESIGN.md v1.5** | `SK = HK III + S&A + 物流包装 + 其他制造费用` |
| **BUSINESS_CASE_LOGIC.md** | `SK_n = HK_III_n + Recovery_Tool + Recovery_R&D + (Net_Sales_n × S&A_Ratio)` |

**冲突点：** 缺少物流包装费和其他制造费用的计算公式

---

### 4. 工序费率字段命名不一致

| 文档 | MHR 字段定义 |
|------|---------------|
| **DATABASE_DESIGN.md v1.3** | `std_mhr_var` + `std_mhr_fix` + `vave_mhr_var` + `vave_mhr_fix` |
| **PROJECT_CONTEXT.md** | 仍使用 `std_mhr` 和 `vave_mhr`（旧字段名） |

**冲突点：** 业务逻辑文档使用已废弃的字段名

---

### 5. 摊销模式枚举值不一致

| 文档 | 支持的模式 |
|------|------------|
| **DATABASE_DESIGN.md** | `total_volume_based` / `fixed_3_years` |
| **BUSINESS_CASE_LOGIC.md** | `TOTAL_VOLUME` / `FIXED_3_YEARS` / `FIXED_5_YEARS` |

**冲突点：** 多了一个 `FIXED_5_YEARS` 选项

---

### 6. PricePair 模型字段缺失

| 位置 | 定义 | 问题 |
|------|------|------|
| **CLAUDE.md** | PricePair 只有 `std`, `vave`, `savings` | 缺少 `savings_rate` 字段 |
| **DATABASE_DESIGN.md** | 需要 `savings_rate` | 数据库需要此字段 |

---

### 7. API_REFERENCE.md 保留已废弃流程

**问题：** API_REFERENCE.md 第 288 行仍描述 "Sales 审核 → Controlling 审核" 流程

**应为：** Sales 完成计算后直接导出，无需 Controlling 审核

---

### 8. 工艺成本计算公式不一致

| 文档 | 公式 |
|------|------|
| **PRD.md** | `Cost = (Material × Qty) + (MHR × CycleTime / 3600)` |
| **DATABASE_DESIGN.md** | `std_cost = (cycle_time_std / 3600) × (std_mhr_var + std_mhr_fix + personnel_std × labor_rate)` |

**冲突点：** PRD.md 公式缺少人工费率和 MHR 拆分

---

### 9. CHANGELOG.md 缺失关键变更记录

**缺失记录：**
- 2026-02-05 的 v2.0 流程变更
- 2026-02-05 的 DATABASE_DESIGN.md v1.5 变更
- PRD.md v1.6 → v1.7 的更新

---

## 🟡 潜在冲突清单

### 1. 工厂关联字段未体现

- DATABASE_DESIGN.md v1.5 新增 `projects.factory_id`
- PROJECT_CONTEXT.md 核心实体映射中未体现

---

### 2. VAVE 计算公式不明确

- PROJECT_CONTEXT.md: `CycleTime_opt` 默认为 `CycleTime * 0.9`
- PRD.md: 未明确 VAVE 工时的计算方式

---

### 3. 业务逻辑文档未体现 v2.0 变更

- PROCESS_COST_LOGIC.md (v1.2, 2026-02-04) 未更新
- BUSINESS_CASE_LOGIC.md (v1.1, 2026-02-03) 未更新
- NRE_INVESTMENT_LOGIC.md (v1.1, 2026-02-03) 未更新

---

### 4. 数据模型字段命名不统一

- CLAUDE.md: `status_light`
- API_REFERENCE.md: `status`
- DATABASE_DESIGN.md: `status`

---

### 5. 折旧处理逻辑冲突

- PAYBACK_LOGIC.md: 现金流 = 净利 + 折旧
- BUSINESS_CASE_LOGIC.md: 摊销已包含利息，未明确是否包含折旧

---

### 6. S&A Rate 定义不清晰

- 两个文档都定义为 2.1%，但未说明包含哪些具体费用
- 未明确物流包装费率和其他制造费用的计算依据

---

### 7. 投资项标准库未在 API 中完整体现

- DATABASE_DESIGN.md 新增 `std_investment_costs` 表
- CLAUDE.md API 端点存在但响应模型未完整定义

---

## 🟢 版本差异清单

| 文档 | 当前版本 | 问题 |
|------|----------|------|
| PROJECT_CONTEXT.md | v2.3 | 内部状态显示 v2.2 |
| CLAUDE.md | v1.4 | 响应模型未完全更新 |
| PRD.md | v1.7 | 正确 |
| DATABASE_DESIGN.md | v1.5 | 正确 |
| PROCESS_COST_LOGIC.md | v1.2 | 未包含 v2.0 变更 |
| BUSINESS_CASE_LOGIC.md | v1.1 | 未包含 v2.0 变更 |
| PAYBACK_LOGIC.md | v1.2 | 未包含 v2.0 变更 |
| NRE_INVESTMENT_LOGIC.md | v1.1 | 未包含 v2.0 变更 |
| GLOSSARY.md | v1.1 | 未更新 MHR 费率结构 |
| API_REFERENCE.md | v1.1 | 保留已废弃流程 |

---

## 📋 修复计划

### P0 - 立即修复（阻塞开发）

| 序号 | 修复项 | 涉及文档 | 操作 |
|------|--------|----------|------|
| 1 | 修复 PROJECT_CONTEXT.md 内部版本信息 | PROJECT_CONTEXT.md | 更新内部状态 v2.2 → v2.3 |
| 2 | 移除 API_REFERENCE.md 中的废弃流程 | API_REFERENCE.md | 删除 Controlling 审核相关描述 |
| 3 | 更新 PROJECT_CONTEXT.md 中的 MHR 字段引用 | PROJECT_CONTEXT.md | 更新为 var/fix 拆分格式 |
| 4 | 补充 PricePair 模型的 savings_rate 字段 | CLAUDE.md | 添加 savings_rate 定义 |
| 5 | 统一 PRD.md 中的工艺成本计算公式 | PRD.md | 更新为包含人工费率和 MHR 拆分的版本 |

### P1 - 高优先级（影响理解）

| 序号 | 修复项 | 涉及文档 | 操作 |
|------|--------|----------|------|
| 6 | 统一 SK 计算公式 | BUSINESS_CASE_LOGIC.md | 添加物流包装费和其他制造费用 |
| 7 | 统一摊销模式枚举值 | DATABASE_DESIGN.md 或 BUSINESS_CASE_LOGIC.md | 统一为 2 种或 3 种模式 |
| 8 | 更新 PROCESS_COST_LOGIC.md 以反映 v2.0 变更 | PROCESS_COST_LOGIC.md | 更新版本号和内容 |
| 9 | 更新状态流转描述 | 所有文档 | 统一使用 PROJECT_CONTEXT.md 的状态定义 |
| 10 | 更新数据模型字段命名 | 所有文档 | 统一使用 `status` 而非 `status_light` |

### P2 - 中优先级（完善文档）

| 序号 | 修复项 | 涉及文档 | 操作 |
|------|--------|----------|------|
| 11 | 更新 GLOSSARY.md | GLOSSARY.md | 更新 MHR 费率结构定义 |
| 12 | 完善 CHANGELOG.md | CHANGELOG.md | 补充 2026-02-05 变更记录 |
| 13 | 明确 VAVE 计算公式 | PROJECT_CONTEXT.md 或 PRD.md | 添加详细说明 |
| 14 | 补充工厂关联说明 | PROJECT_CONTEXT.md | 在核心实体映射中添加 factory_id |
| 15 | 更新其他业务逻辑文档 | BUSINESS_CASE_LOGIC.md, PAYBACK_LOGIC.md, NRE_INVESTMENT_LOGIC.md | 同步到 v2.0 变更 |

---

## 🎯 修复执行顺序建议

1. **第一阶段**（30分钟）：修复 P0-1, P0-2, P0-3 - 版本信息和流程描述
2. **第二阶段**（60分钟）：修复 P0-4, P0-5, P1-6, P1-7 - 数据模型和计算公式
3. **第三阶段**（90分钟）：修复 P1-8, P1-9, P1-10 - 流程和术语同步
4. **第四阶段**（按需）：修复 P2 所有项 - 文档完善

---

**报告结束**
