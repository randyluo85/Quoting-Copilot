# Dr.aiVOSS 智能快速报价助手 - 产品需求文档 (PRD)

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.3   | 2026-02-03 | 2026-02-03 | Dr.aiVOSS 智能快速报价助手 PRD | Randy Luo |

---

## 📋 文档修订历史

| 版本 | 日期 | 修订人 | 修订内容 |
|------|------|--------|----------|
| v1.0 | 2026-02-03 | Randy Luo | 初始版本，定义 MVP 核心功能 |
| v1.1 | 2026-02-03 | Randy Luo | 优化流程图：物料/工艺并行计算，自动化邮件通知，调整审核顺序为 Sales→Controlling |
| v1.2 | 2026-02-03 | Randy Luo | 修复技术栈描述（Next.js → Vite），补充业务概念（HK III/SK/DB），更新参考资料引用 |
| v1.3 | 2026-02-03 | Randy Luo | 统一产品名称为 Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot) |

---

## 1. 产品愿景与目标

### 1.1 产品愿景

> **"Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot) 是汽车零部件企业的智能报价中台，通过数据驱动的自动化计算，消除跨部门报价中的'水分'，实现标准化、透明化、可追溯的成本核算，帮助企业在保持竞争力的同时最大化利润空间。"**

### 1.2 核心目标

| 目标维度 | 当前状态 | 目标状态 | 改善幅度 |
|----------|----------|----------|----------|
| **报价周期** | 3-5 天 | < 1 天 | **80% 缩减** |
| **报价准确性** | 标准偏差 15-20% | < 5% | **70% 提升** |
| **人力投入** | 5-8 人次/报价 | 2-3 人次/报价 | **60% 减少** |
| **流程透明度** | 黑盒操作，依赖邮件 | 全流程可视化 | **质的飞跃** |

### 1.3 核心价值主张

**"双轨计价"** - 同时提供标准报价与 VAVE 优化报价，让企业在竞标中拥有更多策略选择。

---

## 2. 用户画像

### 2.1 VM (Value Management) - 成本报价协调者

**角色定位：** 核心协调者，报价流程的中枢

**主要职责：**
- 创建报价项目并上传 BOM（Bill of Materials）
- 维护物料库和工艺费率库
- 自动计算标准成本和 VAVE 成本
- 协调跨部门评审
- 生成最终报价单

**痛点：**
- 需要向 5 个部门收集数据，沟通成本高
- Excel 计算公式容易出错
- 无法追溯历史报价数据
- 报价"水分"难以识别

**核心需求：**
- 一键上传 BOM，自动解析
- 实时查看各部门评审状态
- 自动计算双轨成本，对比差异

---

### 2.2 Sales - 项目发起者

**角色定位：** 项目发起与利润率把控者

**主要职责：**
- 发起报价项目，输入客户需求
- 设定目标利润率
- 审核 QS（Quote Summary，报价摘要）
- 审核 BC（Breakdown，成本分解）
- 审核 Payback（投资回报期）
- 发送最终报价给客户

**痛点：**
- 不知道合理的利润率应该是多少
- 缺乏历史报价数据参考
- 客户催单时无法快速响应

**核心需求：**
- 快速创建项目
- 查看 QS/BC/Payback 汇总
- 导出专业报价单（PDF）

---

### 2.3 IE (Industrial Engineering) - 工艺专家

**角色定位：** 工艺路线库维护者

**主要职责：**
- 维护工艺路线模板（如：机加工、焊接、装配）
- 预估新工艺的标准工时
- 审核 AI 预估的工时是否合理

**痛点：**
- 重复回答相同工艺的工时问题
- 缺乏标准化的工时数据库

**核心需求：**
- 工艺路线库 CRUD 操作
- 查看相似工艺的历史工时参考

---

### 2.4 PE (Product Engineering) - 可行性评估者

**角色定位：** 工艺可行性评估者

**主要职责：**
- 评估图纸中的工艺是否可行
- 标注高风险工艺（如：公差要求过严）

**痛点：**
- 经常被问"这个能不能做"
- 缺乏结构化的可行性评估记录

**核心需求：**
- 在 BOM 行项目中标注可行性状态
- 添加技术评论

---

### 2.5 Controlling - 成本控制者

**角色定位：** 成本审核与费率管理

**主要职责：**
- 维护价格系数（汇率、通胀系数等）
- 维护工艺有效工时范围
- 审核利润率是否合理
- 审核 BC（成本分解）是否合理
- 审核 MHR（Machine Hour Rate，机时费率）

**痛点：**
- 无法验证各部门给出的报价是否合理
- 缺乏历史数据对比

**核心需求：**
- 设置费率阈值，超值自动预警
- 查看同类项目的历史报价对比

---

### 2.6 采购 (Procurement) - 供应商价格维护者

**角色定位：** 物料价格维护者

**主要职责：**
- 维护供应商物料价格
- 标注供应商等级（Tier 1/Tier 2）

**痛点：**
- 重复回答相同物料的价格
- 缺乏供应商绩效数据

**核心需求：**
- 物料价格库 CRUD 操作
- 批量导入价格表

---

## 3. 核心功能优先级

基于 RICE 评分模型（Reach × Impact × Confidence / Effort）：

| 优先级 | 功能模块 | RICE 评分 | 说明 |
|--------|----------|----------|------|
| **P0** | BOM 上传与解析 | 🔥 128 | MVP 核心，必须支持 Excel/CSV 解析 |
| **P0** | 自动计算工艺成本 | 🔥 125 | 核心算法，标准价 + VAVE 价 |
| **P0** | 物料库管理 | 🔥 120 | 基础数据 CRUD |
| **P0** | 工艺费率库管理 | 🔥 118 | 基础数据 CRUD |
| **P0** | 项目创建与流转 | 🔥 115 | 主流程引擎 |
| **P1** | 双轨计价展示 | ⭐ 95 | 差异高亮，节省率计算 |
| **P1** | 审批流程引擎 | ⭐ 90 | 节点配置，状态机 |
| **P1** | 报价单导出 (PDF) | ⭐ 88 | 模板化导出 |
| **P1** | MHR 审核 | ⭐ 85 | Controlling 专用功能 |
| **P2** | QS/BC/Payback 计算 | 💡 72 | 高级分析功能 |
| **P2** | AI 语义匹配物料 | 💡 65 | 模糊匹配，提升体验 |
| **P3** | 历史数据 BI 分析 | 💡 50 | 后续优化 |

---

## 4. 成功指标 (OKR)

### 4.1 北极星指标

> **报价周期 < 1 天，且标准偏差率 < 5%**

### 4.2 分阶段 OKR

#### MVP 阶段（3 个月）

| Objective | Key Results | 目标值 |
|-----------|-------------|--------|
| **O1: 实现基础报价自动化** | KR1: BOM 解析准确率 | > 95% |
| | KR2: 自动计算覆盖率 | > 80% |
| | KR3: 报价周期缩短 | < 1 天 |
| **O2: 建立数据基础** | KR1: 物料库数据量 | > 1000 条 |
| | KR2: 工艺费率库完整度 | > 90% |
| **O3: 用户满意度** | KR1: 用户采用率 | > 70% |
| | KR2: 用户 NPS | > 40 |

#### Growth 阶段（6 个月）

| Objective | Key Results | 目标值 |
|-----------|-------------|--------|
| **O1: 提升报价准确性** | KR1: 标准偏差率 | < 5% |
| | KR2: VAVE 节省率识别准确率 | > 85% |
| **O2: 扩展使用场景** | KR1: 月活报价项目数 | > 50 |
| | KR2: 跨部门采用率 | 100% (5 个部门) |

---

## 5. 报价流程

### 5.1 标准流程（主流程）

```mermaid
flowchart TB
    Start([开始: Sales 发起]) --> Project[创建项目]

    Project --> Upload[VM 上传 BOM]
    Upload --> Parse[系统解析 BOM]

    Parse --> MBranch{物料处理}
    Parse --> PBranch{工艺处理}

    %% 物料分支（左侧）
    MBranch -->|已存在| MAuto[自动获取价格]
    MBranch -->|新物料| MMail[邮件通知采购]
    MMail --> MPrice[采购维护价格]
    MPrice --> MAuto

    %% 工艺分支（右侧）
    PBranch -->|已存在| PAuto[自动获取费率]
    PBranch -->|新工艺| PIE[IE 维护路线]
    PIE --> PPE[PE 评估可行性]
    PPE --> PControl[Controlling 审核 MHR]
    PControl --> PAuto

    %% 汇合计算
    MAuto --> Calc[系统计算双轨成本]
    PAuto --> Calc

    %% 审核流程（从上到下，无交叉）
    Calc --> Sales[Sales 审核 QS/BC<br/>输入利润率]
    Sales --> SDec{确认?}

    SDec -->|否| SEdit[返回修改]
    SEdit --> Calc

    SDec -->|是| Control[Controlling 审核<br/>成本与利润率]
    Control --> CDec{通过?}

    CDec -->|否| CEdit[返回 Sales]
    CEdit --> Sales

    CDec -->|是| Export[生成报价单]
    Export --> End([结束: 发送客户])

    %% 样式：深色文字 + 浅色背景
    classDef startEnd fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#fff
    classDef decision fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#1e293b
    classDef auto fill:#ecfdf5,stroke:#10b981,stroke-width:1px,color:#1e293b
    classDef manual fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#1e293b
    classDef system fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e293b
    classDef review fill:#f3e8ff,stroke:#a855f7,stroke-width:1px,color:#1e293b

    class Start,End startEnd
    class MBranch,PBranch,SDec,CDec decision
    class MAuto,PAuto,Calc auto
    class MMail,MPrice,PIE,PPE,PControl,SEdit,CEdit manual
    class Project,Upload,Parse,Export system
    class Sales,Control review
```

### 5.2 状态流转

```mermaid
stateDiagram-v2
    [*] --> Draft: 创建项目
    Draft --> Parsed: 上传 BOM

    Parsed --> M_Auto: 物料匹配
    Parsed --> P_Auto: 工艺匹配

    M_Auto --> M_Wait: 等待采购
    M_Wait --> M_Ready: 完成
    M_Auto --> M_Ready: 自动完成

    P_Auto --> P_Wait: 等待 IE
    P_Wait --> P_PE: PE 评估
    P_PE --> P_Ctrl: Controlling 审核
    P_Ctrl --> P_Ready: 完成
    P_Auto --> P_Ready: 自动完成

    M_Ready --> Calc: 计算双轨成本
    P_Ready --> Calc

    Calc --> Sales: Sales 审核
    Sales --> Ctrl: Controlling 审核

    Ctrl --> Done: 完成
    Sales --> Calc: 返回修改
    Ctrl --> Sales: 返回修改

    Done --> [*]
```

### 5.3 角色参与矩阵

| 流程节点 | Sales | VM | Controlling | IE | PE | 采购 |
|----------|-------|----|-------------|----|----|----|
| 创建项目 | ✅ 主导 | ❌ | ❌ | ❌ | ❌ | ❌ |
| 上传 BOM | ❌ | ✅ 主导 | ❌ | ❌ | ❌ | ❌ |
| 物料价格匹配 | ❌ | 🔶 自动 | ❌ | ❌ | ❌ | ❌ |
| 新物料询价通知 | ❌ | 🔶 自动发邮件 | ❌ | ❌ | ❌ | ✅ 维护 |
| 工艺费率匹配 | ❌ | 🔶 自动 | ❌ | ❌ | ❌ | ❌ |
| 新工艺路线维护 | ❌ | ❌ | ❌ | ✅ 主导 | ❌ | ❌ |
| 可行性评估 | ❌ | ❌ | ❌ | ❌ | ✅ 主导 | ❌ |
| 审核 MHR（新工艺） | ❌ | ❌ | ✅ 主导 | ❌ | ❌ | ❌ |
| 双轨成本计算 | ❌ | 🔶 自动 | ❌ | ❌ | ❌ | ❌ |
| **审核 QS/BC/Payback** | ✅ **主导**<br/>输入利润率 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **最终审核并释放** | ❌ | ❌ | ✅ **主导** | ❌ | ❌ | ❌ |

*注：🔶 表示系统自动执行*

### 5.4 核心流程变更说明（v1.1 更新）

#### 并行处理架构
**变更前**：物料和工艺按顺序处理，存在等待依赖。
**变更后**：物料和工艺解析后**并行处理**，大幅缩短整体处理时间。

#### 审核顺序调整
| 变更前 | 变更后 |
|--------|--------|
| Controlling 先审核成本 | ❌ 错误顺序 |
| Sales 后审核 QS/BC | ❌ 错误顺序 |
| **正确流程** | **Sales 先审核（输入利润率）** → **Controlling 最终审核并释放** |

> **理由**：Sales 需要先确认客户需求、输入目标利润率，Controlling 基于此进行最终成本与利润率合理性审核后才能释放报价。

#### 物料处理自动化
| 场景 | 变更前 | 变更后 |
|------|--------|--------|
| 无新物料 | VM 手动确认 | ✅ **系统自动**获取物料价格并计算 |
| 有新物料 | VM 通知采购 | ✅ **系统自动发邮件**通知采购询价 |
| 物料成本审核 | 需要 Controlling 审核 | ❌ **不需要审核**，直接计入成本 |

#### 工艺处理流程
| 场景 | 变更前 | 变更后 |
|------|--------|--------|
| 无新工艺 | VM 手动确认 | ✅ **系统自动**获取工艺费率 |
| 有新工艺 | 顺序处理 | ✅ IE → PE → Controlling **依次处理** |

#### 关键价值
1. **效率提升**：物料/工艺并行处理，理论上节省 40-50% 处理时间
2. **自动化增强**：系统自动邮件通知，减少人工沟通成本
3. **简化流程**：物料成本无需审批，聚焦于工艺成本和最终利润率审核
4. **审核顺序优化**：Sales 先确认业务需求，Controlling 后做风控把关

---

## 6. 业务概念详解

### 7.1 双轨计价 (Dual-Track Pricing)

**定义：** 同一物料/工艺同时计算两个价格：
- **Standard Price（标准价）**：当前正常的采购成本/生产成本
- **VAVE Price（优化价）**：通过 VAVE（Value Analysis/Value Engineering）优化后的理想成本

**计算公式：**
```
Savings（节省空间） = Standard Price - VAVE Price
Savings Rate（节省率） = Savings / Standard Price × 100%
```

**业务价值：**
- 帮助企业在竞标中了解"底线价格"
- 识别高水分的供应商/工艺
- 持续优化成本结构

---

### 7.2 QS (Quote Summary) - 报价摘要

**定义：** 客户视角的报价总览

**核心字段：**
- 总报价金额（含税）
- 目标利润率
- 预计交货周期
- 付款条件
- 质保条款

**示例：**
> **QS 报价摘要**
> - 项目：VOSS-2026-001（制动管路总成）
> - 总报价：€ 125,000
> - 目标利润率：15%
> - 交货周期：12 周

---

### 7.3 BC (Breakdown) - 成本分解

**定义：** 内部视角的成本结构透明化

**核心层级：**
```
Total Cost（总成本）
├── Material Cost（物料成本）
│   ├── Raw Materials（原材料）
│   └── Purchased Parts（外购件）
└── Process Cost（工艺成本）
    ├── Machine Cost（机台成本）
    └── Labor Cost（人工成本）
```

**示例：**
> **BC 成本分解**
> - 总成本：€ 106,250
> - 物料成本：€ 65,000 (61.2%)
> - 工艺成本：€ 41,250 (38.8%)
>   - 机台成本：€ 28,000
>   - 人工成本：€ 13,250

---

### 7.4 Payback - 投资回报期

**定义：** 客户购买此产品后，需要多长时间收回投资成本

**计算公式：**
```
Payback (Months) = Investment / Monthly Savings
```

**业务场景：**
- 客户需要购买新设备/产线
- SmartQuote 报价中需要体现"我们的设备能帮你多快回本"

**示例：**
> **Payback 计算**
> - 客户投资：€ 125,000
> - 每月节省（效率提升）：€ 15,000
> - **Payback = 8.3 个月**

---

### 7.5 MHR (Machine Hour Rate) - 机时费率

**定义：** 每小时机器运行的综合成本

**包含内容：**
- 设备折旧
- 能源消耗
- 维护成本
- 厂房分摊

**双轨费率：**
- **Standard MHR**：当前实际费率
- **VAVE MHR**：优化后的理想费率

**示例：**
> **MHR 费率表**
> | 工艺 | Standard MHR | VAVE MHR | 节省率 |
> |------|-------------|----------|--------|
> | CNC 加工 | € 85/h | € 65/h | 23.5% |
> | 焊接 | € 65/h | € 50/h | 23.1% |

---

### 7.6 HK III (Herstellkosten III) - 制造成本

**定义：** 工厂大门的制造成本，不含研发和模具分摊

**包含内容：**
- 物料成本（Raw Materials + Purchased Parts）
- 工艺成本（Machine Cost + Labor Cost）

**计算公式：**
```
HK III = Material Cost + Process Cost
Process Cost = Σ(Cycle Time / 3600 × MHR)
```

**业务意义：** 衡量工厂生产这个产品是否赚钱的核心指标

---

### 7.7 SK (Selbstkosten) - 完全成本

**定义：** 包含一切分摊后的真实总成本

**包含内容：**
- HK III（制造成本）
- 摊销（Amortization）：模具、研发
- S&A（管销费用）：通常为净销售额的 2-3%

**计算公式：**
```
SK = HK III + Tooling_Amortization + R&D_Amortization + (Net_Sales × S&A_Rate)
```

**业务意义：** 企业真实承担的总成本，是定价决策的底线

---

### 7.8 DB I & DB IV (Deckungsbeitrag) - 边际贡献

**DB I - 边际贡献 I（生产毛利）：**
- **公式：** `DB I = Net Sales - HK III`
- **意义：** 衡量工厂生产这个产品赚不赚钱，不考虑研发和模具分摊

**DB IV - 净利润：**
- **公式：** `DB IV = Net Sales - SK`
- **意义：** 衡量整个项目扣除所有投入后赚不赚钱

**业务解读：**
- 2026年亏损：因为销量还没爬坡，且前期投入摊销重
- 2028年 DB IV 转正：典型的汽车行业"前亏后盈"模型

---

### 7.9 NRE (Non-Recurring Engineering) - 一次性工程费用

**定义：** 项目启动时的一次性投资费用

**包含内容：**
- 模具投入（Tooling Investment）
- 检具投入（Gauge Investment）
- 夹具投入（Fixture Investment）
- 研发投入（R&D Investment）

**摊销方式：**
| 模式 | 说明 | 适用场景 |
|------|------|----------|
| Per Piece | 全生命周期平摊 | 稳定量产项目 |
| Fixed 3 Years | 前3年摊销 | 客户要求快速回收 |

---

### 7.10 S&A (Sales & Administration) - 管销费用

**定义：** 销售与管理费用的分摊

**计算方式：**
```
S&A = Net Sales × S&A_Rate
```
其中 S&A_Rate 通常为 2% - 3%

**包含内容：**
- 销售人员工资
- 管理费用分摊
- 办公场地租金
- 其他运营费用

---

## 7. 非功能性需求

### 8.1 性能要求

| 指标 | 目标值 |
|------|--------|
| BOM 解析速度 | < 5 秒/1000 行 |
| 页面加载时间 | < 2 秒 |
| 并发用户数 | > 50 用户 |

### 8.2 安全性要求

- 用户认证：支持 SSO（单点登录）
- 权限控制：RBAC（基于角色的访问控制）
- 数据加密：传输层 TLS 1.3，存储层 AES-256
- 审计日志：所有操作可追溯

### 8.3 可用性要求

- 系统可用性：> 99.5%（月度）
- 数据备份：每日自动备份，保留 30 天
- 灾难恢复：RPO < 1 小时，RTO < 4 小时

---

## 8. 技术架构概述

### 9.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | Vite + React 18 + TypeScript + ShadcnUI | B 端极简 UI |
| **后端** | Python + FastAPI | 高性能异步 API |
| **数据库** | MySQL（主库）+ PostgreSQL（向量库） | 关系型 + 向量搜索 |
| **缓存** | Redis | 会话管理 + 计算缓存 |
| **部署** | Docker + Nginx | 容器化部署 |

### 9.2 核心算法

**双轨计价算法（伪代码）：**
```python
def calculate_dual_track_cost(bom_line_item):
    # 1. 获取物料价格
    material_std = get_material_price(bom_line_item.material_code, price_type='std')
    material_vave = get_material_price(bom_line_item.material_code, price_type='vave')

    # 2. 获取工艺费率
    process_std = get_process_rate(bom_line_item.process_name, rate_type='std')
    process_vave = get_process_rate(bom_line_item.process_name, rate_type='vave')

    # 3. 计算总成本
    total_std = (material_std * bom_line_item.qty) + (process_std.mhr * bom_line_item.hours)
    total_vave = (material_vave * bom_line_item.qty) + (process_vave.mhr * bom_line_item.hours)

    # 4. 计算节省空间
    savings = total_std - total_vave
    savings_rate = (savings / total_std) * 100

    return {
        'standard': total_std,
        'vave': total_vave,
        'savings': savings,
        'savings_rate': savings_rate
    }
```

---

## 9. 风险与依赖

### 10.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Excel 解析格式不统一 | 高 | 提供标准模板 + AI 智能识别 |
| 计算精度问题 | 中 | 使用 Decimal 类型，单元测试覆盖 |
| 并发计算性能 | 中 | 异步任务队列（Celery） |

### 10.2 业务风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 用户抵触新系统 | 高 | 分阶段推广，提供培训 |
| 历史数据迁移 | 中 | 先导入核心数据，其余手动录入 |
| 部门协作阻力 | 中 | 由管理层推动，制定流程规范 |

---

## 10. 附录

### 11.1 术语表

> 完整的项目术语表请参考：**[docs/GLOSSARY.md](docs/GLOSSARY.md)**

| 术语 | 英文全称 | 简要说明 |
|------|----------|----------|
| BOM | Bill of Materials | 物料清单 |
| VAVE | Value Analysis/Value Engineering | 价值工程/价值分析 |
| QS | Quote Summary | 报价摘要 |
| BC | Breakdown | 成本分解 |
| MHR | Machine Hour Rate | 机时费率 |
| HK III | Herstellkosten III | 制造成本（工厂大门成本） |
| SK | Selbstkosten | 完全成本（含所有分摊） |
| DB I | Deckungsbeitrag I | 边际贡献 I（生产毛利） |
| DB IV | Deckungsbeitrag IV | 净利润（扣除所有投入） |

### 11.2 参考资料

**核心文档：**
- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) - 业务逻辑核心契约
- [CLAUDE.md](../CLAUDE.md) - 开发协作指南
- [README.md](../README.md) - 项目概览与入门

**数据库与逻辑文档：**
- [docs/DATABASE_DESIGN.md](DATABASE_DESIGN.md) - 数据库结构唯一真理源
- [docs/GLOSSARY.md](GLOSSARY.md) - 项目术语表（完整版）
- [docs/BUSINESS_CASE_LOGIC.md](BUSINESS_CASE_LOGIC.md) - Business Case 计算逻辑 (HK/SK/DB)
- [docs/PROCESS_COST_LOGIC.md](PROCESS_COST_LOGIC.md) - 工艺成本计算逻辑 (MHR/双轨计价)
- [docs/NRE_INVESTMENT_LOGIC.md](NRE_INVESTMENT_LOGIC.md) - NRE 投资成本计算逻辑
- [docs/PAYBACK_LOGIC.md](PAYBACK_LOGIC.md) - 投资回收期计算逻辑
- [docs/QUOTATION_SUMMARY_LOGIC.md](QUOTATION_SUMMARY_LOGIC.md) - 报价汇总计算逻辑

**运维与测试：**
- [docs/DEPLOYMENT.md](DEPLOYMENT.md) - 部署运维指南
- [docs/TESTING_STRATEGY.md](TESTING_STRATEGY.md) - 测试策略指南
- [docs/API_REFERENCE.md](API_REFERENCE.md) - API 完整参考

**变更记录：**
- [docs/CHANGELOG.md](CHANGELOG.md) - 文档变更日志

---

## 12. 审批记录

| 角色 | 姓名 | 审批意见 | 日期 |
|------|------|----------|------|
| 产品负责人 | - | 待审批 | - |
| 技术负责人 | - | 待审批 | - |
| 业务代表 | - | 待审批 | - |

---

**文档结束**

*如有疑问，请联系产品团队：product@smartquote.ai*
