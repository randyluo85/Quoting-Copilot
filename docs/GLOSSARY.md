# SmartQuote 项目术语表

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-03 | 2026-02-03 | SmartQuote 项目术语表 | Randy Luo |

---

## 📖 术语定义

| 中文术语 | 英文术语 | 定义 | 示例/备注 |
|----------|----------|------|-----------|
| **双轨计价** | Dual-Track Pricing | 同时计算标准价与 VAVE 优化价的计价机制 | 核心业务逻辑 |
| **VAVE** | Value Analysis/Value Engineering | 价值工程/价值分析，通过优化设计降低成本的方法 | 也称"价值优化" |
| **标准价** | Standard Price/Std | 当前正常的采购成本或生产成本 | 对应数据库 `std_price` |
| **VAVE价** | VAVE Price | 通过价值优化后的理想成本 | 对应数据库 `vave_price` |
| **节省空间** | Savings Gap | 标准价与 VAVE 价的差额 | `savings = std - vave` |
| **节省率** | Savings Rate | 节省空间占标准价的比例 | `savings_rate = savings / std × 100%` |
| **BOM** | Bill of Materials | 物料清单，产品所需材料的明细列表 | 通常以 Excel 格式上传 |
| **MHR** | Machine Hour Rate | 机时费率，每小时机器运行的综合成本 | 含折旧、能源、人工等 |
| **QS** | Quote Summary | 报价摘要，客户视角的报价总览 | 含总金额、利润率、交期等 |
| **BC** | Breakdown | 成本分解，内部视角的成本结构透明化 | 分为物料成本、工艺成本 |
| **HK III** | Herstellkosten III | 制造成本（工厂大门成本） | 不含研发和模具分摊 |
| **SK** | Selbstkosten | 完全成本，包含一切分摊后的真实总成本 | 德系成本核算术语 |
| **DB I** | Deckungsbeitrag I | 边际贡献 I（生产毛利） | `Net Sales - HK III` |
| **DB IV** | Deckungsbeitrag IV | 净利润，扣除所有投入后的最终利润 | `Net Sales - SK` |
| **NRE** | Non-Recurring Engineering | 一次性工程费用（模具、检具、研发投入） | 需按一定期限摊销 |
| **Payback** | Payback Period | 投资回收期，客户收回投资成本所需时间 | 以月为单位 |
| **SOP** | Start of Production | 量产启动时间 | 汽车行业常用术语 |
| **VM** | Value Management | 价值管理部门，报价流程的核心协调者 | 也称项目经理 |
| **IE** | Industrial Engineering | 工业工程部门，工艺路线维护者 | 负责工时预估 |
| **PE** | Product Engineering | 产品工程部门，工艺可行性评估者 | 负责技术审核 |
| **S&A** | Sales & Administration | 销售与管理费用，管销费用率 | 通常为销售额的 2-3% |
| **年降** | Sales Reduction | 客户要求的年度价格下降比例 | 通常为 -3% ~ -5% |
| **节拍工时** | Cycle Time | 完成单件产品所需的生产时长 | 以秒为单位 |
| **稼动率** | Efficiency Rate | 考虑设备故障、换模等因素后的实际产出率 | 通常为 75%-85% |
| **红绿灯** | Traffic Light Status | 数据置信度标识：🟢绿色(精确)、🟡黄色(估算)、🔴红色(缺失) | 用于审核优先级 |

---

## 🎨 状态颜色系统

| 颜色 | 含义 | 条件 | 操作建议 |
|------|------|------|----------|
| 🟢 Green | 自动通过 | 物料号完全匹配且价格有效 | 可直接使用 |
| 🟡 Yellow | 人工复核 | AI 语义匹配或 AI 估算参数 | 需确认后使用 |
| 🔴 Red | 人工介入 | 库中无数据且 AI 无法匹配 | 必须人工询价 |

---

## 📊 成本层级结构

```
Total Price (报价)
├── SK (完全成本)
│   ├── HK III (制造成本)
│   │   ├── Material Cost (物料成本)
│   │   │   ├── Raw Materials (原材料)
│   │   │   └── Purchased Parts (外购件)
│   │   └── Process Cost (工艺成本)
│   │       ├── Machine Cost (MHR × Cycle Time)
│   │       └── Labor Cost (人工成本)
│   ├── Amortization (摊销)
│   │   ├── Tooling (模具)
│   │   └── R&D (研发)
│   └── S&A (管销费用)
└── Margin (利润)
```

---

## 🔗 相关文档

- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) - 业务逻辑核心契约
- [docs/PRD.md](PRD.md) - 产品需求文档
- [docs/DATABASE_DESIGN.md](DATABASE_DESIGN.md) - 数据库设计
- [docs/BUSINESS_CASE_LOGIC.md](BUSINESS_CASE_LOGIC.md) - Business Case 计算逻辑

---

**文档结束**
