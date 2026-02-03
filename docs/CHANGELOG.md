# Dr.aiVOSS 文档变更日志

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.1   | 2026-02-03 | 2026-02-03 | Dr.aiVOSS 文档变更日志 | Randy Luo |

---

## 📋 变更记录

| 日期 | 文档 | 版本 | 变更内容 | 影响范围 | 责任人 |
|------|------|------|----------|----------|--------|
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
