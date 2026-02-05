# Dr.aiVOSS 文档变更日志

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.6   | 2026-02-03 | 2026-02-05 | Dr.aiVOSS 文档变更日志 | Randy Luo |

---

## 📋 变更记录

| 日期 | 文档 | 版本 | 变更内容 | 影响范围 | 责任人 |
|------|------|------|----------|----------|------|
| 2026-02-05 | docs/PAYBACK_LOGIC.md | v1.4 → **v1.5** | ✅ **重写逻辑**：从 VAVE 增量回收期改为项目静态回收期；新公式：Payback = 项目总投资 / 项目月度净利 | 业务逻辑 | Randy Luo |
| 2026-02-05 | docs/PRD.md | v1.8 → **v1.9** | ✅ **同步更新**：Payback 功能重写为静态回收期；更新推荐等级定义 | 产品需求 | Randy Luo |
| 2026-02-05 | PROJECT_CONTEXT.md | v2.3 → **v2.4** | 🔴 **架构调整**：移除双轨计价功能，简化为单一标准成本计算 | 业务流程 | Randy Luo |
| 2026-02-05 | docs/PRD.md | v1.7 → **v1.8** | 🔴 **架构调整**：移除双轨计价功能，简化为单一标准成本计算 | 产品需求 | Randy Luo |
| 2026-02-05 | docs/DATABASE_DESIGN.md | v1.5 → **v1.6** | 🔴 **破坏性变更**：移除所有 VAVE 相关字段，简化双轨价格为单轨标准成本 | 数据库设计 | Randy Luo |
| 2026-02-05 | CLAUDE.md | v1.4 → **v1.5** | 🔴 **架构调整**：移除双轨计价功能；PricePair 模型简化 | API 契约 | Randy Luo |
| 2026-02-05 | docs/PROCESS_COST_LOGIC.md | v1.3 → **v1.4** | 🔴 **架构调整**：移除双轨计价逻辑，仅保留 Standard Cost 计算 | 业务逻辑 | Randy Luo |
| 2026-02-05 | docs/API_REFERENCE.md | v1.1 → **v1.2** | 🔴 **架构调整**：移除 VAVE 相关字段；PricePair 模型简化；响应模型更新 | API 契约 | Randy Luo |
| 2026-02-05 | docs/API_REFERENCE.md | v1.1 → **v1.2** | 🔴 **架构调整**：移除 VAVE 相关字段；PricePair 模型简化；响应模型更新 | API 契约 | Randy Luo |
| 2026-02-05 | docs/GLOSSARY.md | v1.2 → **v1.3** | 🔴 **架构调整**：移除 VAVE 相关术语（双轨计价、VAVE价、节省空间、节省率） | 术语表 | Randy Luo |
| 2026-02-05 | docs/BUSINESS_CASE_LOGIC.md | v1.2 → **v1.3** | 同步 v2.0 流程变更；移除 VAVE 相关引用 | 业务逻辑 | Randy Luo |
| 2026-02-05 | docs/NRE_INVESTMENT_LOGIC.md | v1.2 → **v1.3** | 同步 v2.0 流程变更；移除 VAVE 相关引用 | 业务逻辑 | Randy Luo |
| 2026-02-05 | docs/DATABASE_DESIGN.md | v1.4 → **v1.5** | 新增 factories 表；新增 std_investment_costs 表（投资项标准库）；projects 表新增 factory_id 字段；quote_summaries 表新增 version_number 字段；business_case_params 新增 logistics_rate 和 other_mfg_rate | 数据库设计 | Randy Luo |
| 2026-02-05 | CLAUDE.md | v1.3 → **v1.4** | 新增多版本报价 API 端点；新增投资标准库 API 端点；新增工厂管理 API 端点；PricePair 模型新增 savings_rate 字段；新增采购询价邮件化 API `/procurement/import-quote` | API 契约 | Randy Luo |
| 2026-02-05 | docs/PROCESS_COST_LOGIC.md | v1.2 → **v1.3** | 同步 v2.0 流程变更；MHR 费率拆分为 var/fix | 业务逻辑 | Randy Luo |
| 2026-02-05 | docs/BUSINESS_CASE_LOGIC.md | - | 统一 SK 计算公式，添加物流包装费和其他制造费用；统一摊销模式枚举值（移除 FIXED_5_YEARS） | 业务逻辑 | Randy Luo |
| 2026-02-05 | docs/GLOSSARY.md | v1.1 → **v1.2** | 更新 MHR 定义：拆分为变动费率(var)和固定费率(fix)；新增摊销模式术语 | 术语表 | Randy Luo |
| 2026-02-03 | docs/DATABASE_DESIGN.md | v1.2 → **v1.3** | 🔴 **破坏性变更**：新增5张表（cost_centers, investment_items, amortization_strategies, business_case_params, business_case_years）；process_rates 表 MHR 拆分为 var/fix；扩展 quote_summaries、product_processes 表字段 | 数据库设计 | Randy Luo |
| 2026-02-03 | 全部文档 | - | 统一产品名称为 Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot) | 全部 | Randy Luo |
| 2026-02-03 | PROJECT_CONTEXT.md | v2.0 → v2.2 | 修复前端技术栈描述：Next.js → Vite + React；更新产品名称 | 前端开发 | Randy Luo |
| 2026-02-03 | 全部业务逻辑文档 | v1.0 → v1.1 | 统一版本号，同步更新时间戳 | 全部 | Randy Luo |
| 2026-02-03 | docs/CHANGELOG.md | v1.0 → v1.1 | 新增：文档变更日志 | 全部 | Randy Luo |
| 2026-02-03 | docs/GLOSSARY.md | v1.0 → v1.1 | 新增：项目术语表 | 全部 | Randy Luo |
| 2026-02-03 | docs/TESTING_STRATEGY.md | v1.0 → v1.1 | 新增：测试策略指南 | 测试团队 | Randy Luo |
| 2026-02-03 | docs/DEPLOYMENT.md | v1.0 → v1.1 | 新增：部署运维指南 | DevOps | Randy Luo |
| 2026-02-03 | docs/API_REFERENCE.md | v1.0 → v1.1 | 新增：API 完整参考 | 后端开发 | Randy Luo |
| 2026-02-03 | docs/PRD.md | v1.4 → v1.5 | 精简业务概念章节：移除计算公式（改为引用逻辑文档），明确文档职责分离 | 全部 | Randy Luo |
| 2026-02-03 | docs/PRD.md | v1.5 → v1.6 | 应用 SPEC 原则完善功能规范：添加具体的性能指标、验收标准和完整定义 | 全部 | Randy Luo |

---

## 🔢 版本号规范

| 版本类型 | 格式 | 说明 | 示例 |
|----------|------|------|------|
| 小修订 | v{MAJOR}.{MINOR}.{PATCH} | 错别字、格式修正 | v1.1.1 |
| 功能新增 | v{MAJOR}.{MINOR+1} | 新增功能或章节 | v1.2 |
| 破坏性变更 | v{MAJOR+1} | 结构变更、移除内容 | v2.0 |

---

## 📋 文档更新触发机制

| 触发条件 | 更新文档 | 责任人 |
|----------|----------|--------|
| PRD 需求变更 | PRD.md, PROJECT_CONTEXT.md | 产品经理 |
| 数据库结构变更 | DATABASE_DESIGN.md | 后端负责人 |
| API 接口变更 | API_REFERENCE.md, CLAUDE.md | 后端负责人 |
| 新增计算逻辑 | 对应 LOGIC 文档 | 业务分析师 |
| 部署方式变更 | DEPLOYMENT.md | DevOps |

---

**文档结束**
