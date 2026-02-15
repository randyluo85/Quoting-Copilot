# Dr.aiVOSS 智能快速报价助手 - 产品需求文档 (PRD)

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v2.3   | 2026-02-03 | 2026-02-14 | Dr.aiVOSS 智能快速报价助手 PRD | Randy Luo |

---

## 📋 文档修订历史

| 版本 | 日期 | 修订人 | 修订内容 |
|------|------|--------|----------|
| v1.0 | 2026-02-03 | Randy Luo | 初始版本，定义 MVP 核心功能 |
| v1.1 | 2026-02-03 | Randy Luo | 优化流程图：物料/工艺并行计算，自动化邮件通知，调整审核顺序为 Sales→Controlling |
| v1.2 | 2026-02-03 | Randy Luo | 修复技术栈描述（Next.js → Vite），补充业务概念（HK III/SK/DB），更新参考资料引用 |
| v1.3 | 2026-02-03 | Randy Luo | 统一产品名称为 Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot) |
| v1.4 | 2026-02-03 | Randy Luo | 删除开发计划章节；统一金额单位为人民币(¥) |
| v1.5 | 2026-02-03 | Randy Luo | 精简业务概念章节：移除计算公式（改为引用逻辑文档），明确文档职责分离 |
| v1.6 | 2026-02-03 | Randy Luo | 应用 SPEC 原则完善功能规范：添加具体的性能指标、验收标准和完整定义 |
| v1.7 | 2026-02-05 | Randy Luo | 🔴 v2.0 流程变更：VM/Sales/Controlling 职责重新划分；移除 Controlling 审核；新增多版本报价支持；v2.1 采购询价邮件化：采购无需登录系统，VM 导入报价单识别价格 |
| v1.8 | 2026-02-05 | Randy Luo | 架构调整：移除双轨计价功能，简化为单一标准成本计算 |
| v1.9 | 2026-02-05 | Randy Luo | ✅ 重写 Payback 功能：从 VAVE 增量回收期改为项目静态回收期 |
| v2.0 | 2026-02-05 | Randy Luo | 🔴 组织架构调整：移除 PE (Product Engineer) 角色，简化工艺处理流程 |
| **v2.1** | **2026-02-13** | **Randy Luo** | **✅ 职责澄清：Sales 负责创建项目（手动/导入）；VM 审核工时；IE 填写工时+维护工艺路线库；Controlling 仅维护 MHR 固定参数** |
| **v2.2** | **2026-02-13** | **Randy Luo** | **🆕 AI驱动开发规范：新增 §12 AI驱动开发规范（Figma Make 集成），包含核心页面 Prompt 模板、组件规范、设计系统** |
| **v2.3** | **2026-02-14** | **Randy Luo** | **🆕 页面功能描述增强：新增 §12.2.5 项目简介页面、§12.2.6 项目管理流程页面；增强 §12.2.1 Dashboard 功能描述；更新 §3 功能优先级** |

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

**"智能自动化"** - 通过 AI 辅助的 BOM 解析和自动化成本计算，消除人工计算的误差和低效，实现快速、准确的报价响应。

---

## 2. 用户画像

### 2.1 VM (Value Management) - 成本报价协调者

**角色定位：** 核心协调者，报价流程的中枢

**主要职责：**
- 上传 BOM（Bill of Materials）并完成物料成本计算
- 维护物料库和工艺费率库
- **审核工时是否合理**
- 自动计算标准成本
- **完成投资成本计算**（模具、检具、夹具、工装）
- **完成研发成本计算**
- **成本计算完成后通知 Sales 介入**
- 协调跨部门评审

**痛点：**
- 需要向 5 个部门收集数据，沟通成本高
- Excel 计算公式容易出错
- 无法追溯历史报价数据
- 报价"水分"难以识别

**核心需求：**
- 一键上传 BOM，自动解析
- 实时查看各部门评审状态
- 自动计算标准成本
- **完整的成本计算（物料+工艺+投资+研发）**

---

### 2.2 Sales - 项目发起者

**角色定位：** 项目发起与商业参数把控者

**主要职责：**
- **创建报价项目**（两种方式）：
  1. 手动填写项目信息并创建空的项目（项目名称、AS号、客户名称、客户编码、项目年量）
  2. 通过导入报价单或 BOM 表创建项目
- 设定目标利润率
- **输入商业参数：单价、汇率、年降比例**
- **计算 QS（Quote Summary，报价摘要）**
- **计算 BC（Breakdown，成本分解）**
- **计算 Payback（投资回报期）**
- **直接导出报价单**（无需 Controlling 审核）

**痛点：**
- 不知道合理的利润率应该是多少
- 缺乏历史报价数据参考
- 客户催单时无法快速响应
- **商业参数分散在不同系统中**

**核心需求：**
- 快速创建项目
- **统一输入商业参数**
- **自助计算 QS/BC/Payback**
- **快速导出报价单（PDF）**

---

### 2.3 IE (Industrial Engineering) - 工艺专家

**角色定位：** 工艺路线库维护者

**主要职责：**
- **维护工艺路线库**（如：机加工、焊接、装配）
- **填写标准工时**
- 维护工作中心库（MHR 参数 + 工时计算规则）

**痛点：**
- 重复回答相同工艺的工时问题
- 缺乏标准化的工时数据库

**核心需求：**
- 工艺路线库 CRUD 操作
- 查看相似工艺的历史工时参考

---

### 2.4 Controlling - 成本标准维护者

**角色定位：** MHR 固定参数维护者

**主要职责：**
- **维护 MHR 计算时涉及的固定参数**（租金单价、能源单价、折旧年限、利率、小时工资）
- 维护价格系数（汇率、通胀系数等）
- **维护 SK/HK 转换系数（S&A、物流包装、其他制造费用）**

**痛点：**
- 无法验证各部门给出的报价是否合理
- 缺乏历史数据对比
- **新设备 MHR 标准缺乏参考**

**核心需求：**
- **MHR 标准库管理**
- 设置费率阈值，超值自动预警
- 查看同类项目的历史报价对比

---

### 2.6 采购询价流程（邮件化）🔴 v2.0 变更

**流程说明：**
- 采购**不需要登录系统**
- VM 通过系统自动发送询价邮件给采购
- 采购联系供应商获取报价后，通过邮件回复报价单
- VM 导入报价单，系统自动识别物料价格并入库

**询价邮件内容：**
- 物料编码、物料名称
- 汇总数量（项目级）
- 推荐供应商列表
- 预计回复日期

**报价单导入：**
- 支持格式：Excel/CSV/PDF
- 自动识别：物料编码、单价、供应商
- 价格验证：超出历史范围 ±20% 自动预警

---

## 3. 核心功能规范（SPEC 原则）

> **SPEC 原则说明：**
> - **S**pecific（具体的）：明确的功能描述
> - **P**erformance（绩效）：可衡量的性能指标
> - **E**xecutable（可执行的）：可测试的验收标准
> - **C**omplete（完整的）：完整的输入输出定义

### 3.1 功能优先级总览

基于 RICE 评分模型（Reach × Impact × Confidence / Effort）：

| 优先级 | 功能模块 | RICE 评分 | 说明 |
|--------|----------|----------|------|
| **P0** | BOM 上传与解析 | 🔥 128 | MVP 核心，必须支持 Excel/CSV 解析 |
| **P0** | 自动计算工艺成本 | 🔥 125 | 核心算法，标准成本计算 |
| **P0** | 物料库管理 | 🔥 120 | 基础数据 CRUD |
| **P0** | 工艺费率库管理 | 🔥 118 | 基础数据 CRUD |
| **P0** | 项目创建与流转 | 🔥 115 | 主流程引擎 |
| **P1** | 审批流程引擎 | ⭐ 90 | 节点配置，状态机 |
| **P1** | 报价单导出 (PDF) | ⭐ 88 | 模板化导出 |
| **P1** | MHR 审核 | ⭐ 85 | Controlling 专用功能 |
| **P2** | QS/BC 计算 | 💡 72 | 高级分析功能（Payback 功能暂时下架） |
| **P2** | AI 语义匹配物料 | 💡 65 | 模糊匹配，提升体验 |
| **P3** | 历史数据 BI 分析 | 💡 50 | 后续优化 |

---

### 3.2 P0 功能详细规范

#### 3.2.1 BOM 上传与解析

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 用户上传 Excel/CSV 格式的 BOM 文件，系统自动解析并识别物料和工艺信息 |
| **Performance（性能指标）** | • 解析速度：< 5 秒/1000 行<br/>• 解析准确率：> 95%（格式标准时）<br/>• 支持最大文件：10 MB |
| **Executable（验收标准）** | • 能正确解析包含以下列的 Excel：物料号、物料名、数量、单位、工序、工时<br/>• 对空行、格式错误能给出明确提示<br/>• 解析结果以表格形式展示，支持手动编辑 |
| **Complete（完整定义）** | **输入**：Excel/CSV 文件（拖拽或点击上传）<br/>**处理**：格式验证 → 数据提取 → AI 特征识别（Comments 列）<br/>**输出**：结构化物料列表 + 工艺列表 |

---

#### 3.2.2 自动计算工艺成本

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 根据 BOM 数据和知识库，自动计算每个工序的 Standard Cost |
| **Performance（性能指标）** | • 计算时间：< 2 秒/100 行 BOM<br/>• 计算精度：小数点后 2 位 |
| **Executable（验收标准）** | • 物料有历史价格时自动填充<br/>• 工艺有对应 MHR 时自动计算成本<br/>• 新物料/新工艺标记为"待确认"<br/>• 计算结果实时展示，支持参数调整后重新计算 |
| **Complete（完整定义）** | **输入**：BOM 数据 + 物料库 + 工艺费率库<br/>**公式**：`Cost = (Material × Qty) + (CycleTime / 3600) × (mhr_var + mhr_fix + personnel × labor_rate)`<br/>**输出**：Standard Cost |

---

#### 3.2.3 物料库管理

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 维护物料主数据，支持标准价格录入 |
| **Performance（性能指标）** | • 查询响应：< 500 ms<br/>• 支持数据量：> 10,000 条<br/>• 批量导入：> 1000 条/次 |
| **Executable（验收标准）** | • 支持物料号唯一性校验<br/>• 支持物料分类（原材料/外购件/半成品）<br/>• 价格变更时记录历史版本<br/>• 支持物料号模糊搜索 |
| **Complete（完整定义）** | **数据字段**：物料号、物料名、规格、材质、单位、Standard Price、供应商、更新时间<br/>**操作**：Create / Read / Update / Delete / Batch Import |

---

#### 3.2.4 工艺费率库管理

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 维护工序费率（MHR），支持标准费率录入 |
| **Performance（性能指标）** | • 费率查询：< 300 ms<br/>• 支持工序数：> 500 种<br/>• 费率精度：0.01 元 |
| **Executable（验收标准）** | • 工序编码唯一性校验<br/>• 支持按成本中心分类管理<br/>• 费率变更需 Controlling 审批<br/>• 支持费率生效日期管理 |
| **Complete（完整定义）** | **数据字段**：工序编码、工序名称、成本中心、Standard MHR、生效日期、状态<br/>**操作**：Create / Read / Update / Delete / Approve |

---

#### 3.2.5 项目创建与流转

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 创建报价项目，支持跨部门审批流转，状态机管理 |
| **Performance（性能指标）** | • 项目创建：< 3 秒<br/>• 状态流转实时通知：< 1 分钟内<br/>• 支持并发项目数：> 100 |
| **Executable（验收标准）** | • 必填字段校验（项目名、客户、年量）<br/>• 状态流转不可逆（除"返回修改"）<br/>• 每次状态变更记录操作日志<br/>• 支持项目暂存草稿 |
| **Complete（完整定义）** | **状态流转 v2.0**：draft → parsing → (waiting_price | waiting_ie) → waiting_mhr → calculated → sales_input → completed<br/>**角色权限**：Sales（发起/输入商业参数）、VM（成本计算）、Controlling（创建/维护 MHR 标准）<br/>**通知机制**：邮件 + 站内消息 |

---

### 3.3 P1 功能详细规范

#### 3.3.1 审批流程引擎

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 可配置的多级审批流程，支持并行/串行审批 |
| **Performance（性能指标）** | • 审批操作响应：< 500 ms<br/>• 审批历史查询：< 1 秒 |
| **Executable（验收标准）** | • 支持审批节点动态配置<br/>• 支持审批意见必填/选填<br/>• 支持审批超时提醒（48 小时） |
| **Complete（完整定义）** | **审批节点**：Sales 审核 → Controlling 审核<br/>**审批操作**：批准 / 驳回（需填写原因）<br/>**通知规则**：审批通过通知下一节点，被驳回通知发起人 |

---

#### 3.3.2 报价单导出（PDF）

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 根据项目数据生成标准格式的 PDF 报价单 |
| **Performance（性能指标）** | • PDF 生成时间：< 5 秒<br/>• 文件大小：< 1 MB（单页） |
| **Executable（验收标准）** | • 支持中文显示<br/>• 支持公司 Logo 和签名<br/>• 支持预览后下载 |
| **Complete（完整定义）** | **模板内容**：项目信息、报价汇总、成本分解、有效期、条款<br/>**导出方式**：预览 → 下载 PDF |

---

#### 3.3.3 MHR 审核（Controlling）

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | Controlling 审核新工艺的机时费率是否合理 |
| **Performance（性能指标）** | • 审核响应：< 500 ms<br/>• 历史数据查询：< 1 秒 |
| **Executable（验收标准）** | • 支持查看同类工艺的历史 MHR 参考<br/>• MHR 超出阈值（±20%）自动预警<br/>• 审核意见必填 |
| **Complete（完整定义）** | **输入**：待审核的 MHR 值 + 工艺描述<br/>**参考数据**：同类工艺历史 MHR 区间<br/>**输出**：批准 / 驳回（附原因） |

---

### 3.4 P2 功能详细规范

#### 3.4.1 QS/BC 计算

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 计算报价摘要（QS）、成本分解（BC） |
| **Performance（性能指标）** | • 计算时间：< 2 秒<br/>• 数据准确性：100% |
| **Executable（验收标准）** | • QS 包含含税报价、利润率、交货周期<br/>• BC 包含物料/工艺成本占比 |
| **Complete（完整定义）** | **输入**：Standard Cost + 利润率参数<br/>**输出**：QS 报价 / BC 分解图<br/>**注意**：Payback 功能暂时下架<br/>**参考**：详细计算逻辑见逻辑文档 |

---

#### 3.4.2 AI 语义匹配物料

| SPEC 维度 | 内容 |
|-----------|------|
| **Specific（具体功能）** | 当物料号不完全匹配时，使用 LLM 语义相似度匹配 |
| **Performance（性能指标）** | • 匹配响应：< 3 秒<br/>• 匹配准确率：> 70%（相似物料） |
| **Executable（验收标准）** | • 展示相似度评分（0-100）<br/>• 支持用户确认/拒绝<br/>• 拒绝后记录作为训练数据 |
| **Complete（完整定义）** | **输入**：物料名称 + 规格<br/>**匹配逻辑**：向量相似度 + LLM 语义理解<br/>**输出**：Top 3 候选物料 + 相似度评分 |

---

### 3.5 P3 功能规划

| 功能 | 说明 | 预计实现时间 |
|------|------|-------------|
| 历史数据 BI 分析 | 报价趋势分析、成本结构分析、供应商绩效分析 | Growth 阶段后 |
| 移动端适配 | 支持手机查看/审批报价 | Growth 阶段后 |
| 多语言支持 | 英文/德文界面 | 国际化阶段 |

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
| | KR2: 成本计算准确率 | > 95% |
| **O2: 扩展使用场景** | KR1: 月活报价项目数 | > 50 |
| | KR2: 跨部门采用率 | 100% (5 个部门) |

---

## 5. 报价流程

### 5.1 标准流程（主流程）v2.1

```mermaid
flowchart TB
    Start([开始: Sales 发起]) --> Project[创建项目]

    Project --> Upload[VM 上传 BOM]
    Upload --> Parse[系统解析 BOM]

    Parse --> MBranch{物料处理}
    Parse --> PBranch{工艺处理}

    %% 物料分支（左侧）
    MBranch -->|已存在| MAuto[自动获取价格]
    MBranch -->|新物料| MMail[🔴 VM 发邮件给采购]
    MMail --> MWait[等待采购邮件回复]
    MWait --> MImport[VM 导入报价单]
    MImport --> MAuto

    %% 工艺分支（右侧）
    PBranch -->|已存在| PAuto[自动获取费率]
    PBranch -->|新工艺| PIE[IE 维护路线]
    PIE --> PControl[Controlling 创建 MHR 标准]
    PControl --> PAuto

    %% 汇合计算
    MAuto --> Calc[VM 完成成本计算]
    PAuto --> Calc

    Calc --> CalcFull[物料 + 工艺<br/>+ 投资 + 研发]
    CalcFull --> Notify[通知 Sales 介入]

    %% Sales 输入商业参数
    Notify --> Sales[Sales 输入商业参数<br/>单价/汇率/年降/利润率]
    Sales --> CalcQSBC[计算 QS/BC/Payback]

    CalcQSBC --> SDec{确认?}
    SDec -->|否| SEdit[返回修改]
    SEdit --> Sales

    SDec -->|是| Export[生成报价单]
    Export --> End([结束: 发送客户])

    %% 样式：不超过3种颜色
    classDef startEnd fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#fff
    classDef process fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e293b
    classDef highlight fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#1e293b

    class Start,End startEnd
    class MBranch,PBranch,SDec,MAuto,PAuto,Calc,CalcQSBC,PIE,PControl,Project,Upload,Parse,Notify,Export process
    class SEdit,MImport,Sales,MMail,MWait highlight
```

### 5.2 状态流转 v2.1

```mermaid
stateDiagram-v2
    [*] --> Draft: 创建项目
    Draft --> Parsed: 上传 BOM

    Parsed --> M_Auto: 物料匹配
    Parsed --> P_Auto: 工艺匹配

    M_Auto --> M_Wait: 等待采购邮件
    M_Wait --> M_Import: VM 导入报价单
    M_Import --> M_Ready: 完成
    M_Auto --> M_Ready: 自动完成

    P_Auto --> P_Wait: 等待 IE
    P_Wait --> P_Ctrl: Controlling 创建 MHR
    P_Ctrl --> P_Ready: 完成
    P_Auto --> P_Ready: 自动完成

    M_Ready --> Calc: VM 计算成本
    P_Ready --> Calc

    Calc --> FullCalc: 完整计算<br/>(物料+工艺+投资+研发)
    FullCalc --> Sales: Sales 输入商业参数

    Sales --> QSBC: 计算 QS/BC/Payback
    QSBC --> Done: 直接导出
    Sales --> FullCalc: 返回修改

    Done --> [*]
```

### 5.3 角色参与矩阵 v2.1

| 流程节点 | Sales | VM | Controlling | IE | 采购 |
|----------|-------|----|-------------|----|----|
| 创建项目 | ✅ 主导 | ❌ | ❌ | ❌ | ❌ |
| 上传 BOM | ❌ | ✅ 主导 | ❌ | ❌ | ❌ |
| 物料价格匹配 | ❌ | 🔶 自动 | ❌ | ❌ | ❌ |
| **新物料询价** | ❌ | ✅ **主导**<br/>触发邮件/导入报价单 | ❌ | ❌ | 📧 邮件回复 |
| 工艺费率匹配 | ❌ | 🔶 自动 | ❌ | ❌ | ❌ |
| 新工艺路线维护 | ❌ | ❌ | ❌ | ✅ 主导 | ❌ |
| **创建 MHR 标准（新工艺）** | ❌ | ❌ | ✅ **主导** | ❌ | ❌ |
| **完成成本计算** | ❌ | ✅ **主导**<br/>物料+工艺+投资+研发 | ❌ | ❌ | ❌ |
| **输入商业参数** | ✅ **主导**<br/>单价/汇率/年降/利润率 | ❌ | ❌ | ❌ | ❌ |
| **计算 QS/BC/Payback** | ✅ **主导** | ❌ | ❌ | ❌ | ❌ |
| **导出报价单** | ✅ **主导** | ❌ | ❌ | ❌ | ❌ |

*注：🔶 表示系统自动执行；📧 表示邮件交互（无需登录系统）*

### 5.4 核心流程变更说明（v2.0 更新）

#### VM 职责增强
**变更前**：VM 完成物料和工艺成本计算后，即可通知 Sales 介入。
**变更后**：VM 必须**完成所有成本计算**（物料 + 工艺 + 投资 + 研发）后，才能通知 Sales 介入。

> **理由**：Sales 需要完整的成本数据作为输入，才能准确计算 QS/BC/Payback。

#### Controlling 职责变更
| 变更前 | 变更后 |
|--------|--------|
| 审核 MHR（新工艺） | ❌ 移除 |
| 审核利润率是否合理 | ❌ 移除 |
| 审核 BC 是否合理 | ❌ 移除 |
| **正确职责** | **创建/维护 MHR 标准**<br/>**维护 SK/HK 转换系数** |

> **理由**：Controlling 的核心价值在于建立和维护成本标准，而非审批每个报价。新流程让 Sales 能够更快速响应客户需求。

#### Sales 职责增强
| 变更前 | 变更后 |
|--------|--------|
| 设定目标利润率 | 保持 |
| 审核 QS/BC | ✅ 改为**自行计算** |
| 等待 Controlling 审核通过 | ❌ **移除** |
| **新增职责** | **输入商业参数：单价、汇率、年降**<br/>**计算 QS/BC/Payback**<br/>**直接导出报价单** |

#### 并行处理架构（保持）
**物料和工艺解析后并行处理**，大幅缩短整体处理时间。

#### 物料处理自动化（保持）
| 场景 | 处理方式 |
|------|----------|
| 无新物料 | ✅ **系统自动**获取物料价格并计算 |
| 有新物料 | ✅ **VM 发邮件**通知采购询价 |
| 物料成本审核 | ❌ **不需要审核**，直接计入成本 |

#### 工艺处理流程（调整）
| 场景 | 变更前 | 变更后 |
|------|--------|--------|
| 无新工艺 | 系统自动获取工艺费率 | 保持 |
| 有新工艺 | IE → Controlling 审核 MHR | ✅ IE → **Controlling 创建 MHR 标准** |

#### 项目级汇总询价（邮件化）
**变更前**：按 BOM 行逐个发送询价邮件，同一物料重复询价。
**变更后**：
- **项目级汇总询价**，系统自动抓取整个项目中相同的物料进行汇总
- **采购无需登录系统**，通过邮件完成询价交互
- VM **导入报价单**，系统自动识别物料价格并入库

**邮件化询价流程：**
```
VM 点击"一键询价" → VM 发邮件给采购 → 采购联系供应商 → 采购邮件回复报价单 → VM 导入报价单 → 系统自动识别价格入库
```

#### 关键价值
1. **效率提升**：物料/工艺并行处理，节省 40-50% 处理时间
2. **自动化增强**：系统自动邮件通知，减少人工沟通成本
3. **流程简化**：移除 Controlling 审核环节，Sales 可直接导出报价单
4. **职责清晰**：Controlling 专注于标准维护，Sales 专注于商业决策
5. **询价优化**：项目级汇总询价，避免重复询价
6. **采购零门槛**：采购无需登录系统，通过邮件即可完成询价

---

## 6. 业务概念详解

### 6.1 QS (Quote Summary) - 报价摘要

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
> - 总报价：¥ 125,000
> - 目标利润率：15%
> - 交货周期：12 周

---

### 6.2 BC (Breakdown) - 成本分解

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
> - 总成本：¥ 106,250
> - 物料成本：¥ 65,000 (61.2%)
> - 工艺成本：¥ 41,250 (38.8%)
>   - 机台成本：¥ 28,000
>   - 人工成本：¥ 13,250

---

### 6.3 Payback - 项目静态投资回收期 🔴 v1.5

**定义：** 客户购买此产品后，需要多长时间收回全部投资成本

**核心公式：**
$$ Payback\ (月数) = \frac{项目总投资}{项目月度净利} $$

**业务场景：**
- 客户需要购买新设备/产线
- 客户需要承担模具开发费用
- 报价中需要体现"设备能帮客户多快回本"

**计算理念：**
- 采用静态回收期方法，不考虑货币时间价值
- 简单直观，易于向客户解释
- 结果偏保守，有利于风险控制

**推荐等级：**
| 等级 | 回收期 | 建议 |
|------|--------|------|
| 极力推荐 | ≤ 12 个月 | 回收期极短，投资回报快 |
| 推荐 | 12 - 24 个月 | 回收期适中，风险可控 |
| 谨慎 | 24 - 36 个月 | 回收期较长，需评估风险 |
| 不推荐 | > 36 个月 | 回收期过长，建议调整策略 |

> **详细计算逻辑：** [docs/PAYBACK_LOGIC.md](PAYBACK_LOGIC.md)

---

### 6.4 MHR (Machine Hour Rate) - 机时费率

**定义：** 每小时机器运行的综合成本

**包含内容：**
- 设备折旧
- 能源消耗
- 维护成本
- 厂房分摊

**示例：**
> **MHR 费率表**
> | 工艺 | Standard MHR |
> |------|-------------|
> | CNC 加工 | ¥ 85/h |
> | 焊接 | ¥ 65/h |

---

### 6.5 HK III (Herstellkosten III) - 制造成本

**定义：** 工厂大门的制造成本，不含研发和模具分摊

**包含内容：**
- 物料成本（Raw Materials + Purchased Parts）
- 工艺成本（Machine Cost + Labor Cost）

**业务意义：** 衡量工厂生产这个产品是否赚钱的核心指标

> **详细计算逻辑：** [docs/BUSINESS_CASE_LOGIC.md](BUSINESS_CASE_LOGIC.md) §3 HK III 计算

---

### 6.6 SK (Selbstkosten) - 完全成本

**定义：** 包含一切分摊后的真实总成本

**包含内容：**
- HK III（制造成本）
- 摊销（Amortization）：模具、研发
- S&A（管销费用）：通常为净销售额的 2-3%

**业务意义：** 企业真实承担的总成本，是定价决策的底线

> **详细计算逻辑：** [docs/BUSINESS_CASE_LOGIC.md](BUSINESS_CASE_LOGIC.md) §4 SK 计算

---

### 6.7 DB I & DB IV (Deckungsbeitrag) - 边际贡献

**DB I - 边际贡献 I（生产毛利）：**
- **意义：** 衡量工厂生产这个产品赚不赚钱，不考虑研发和模具分摊

**DB IV - 净利润：**
- **意义：** 衡量整个项目扣除所有投入后赚不赚钱

**业务解读：**
- 项目初期亏损：因为销量还没爬坡，且前期投入摊销重
- 后期 DB IV 转正：典型的汽车行业"前亏后盈"模型

> **详细计算逻辑：** [docs/BUSINESS_CASE_LOGIC.md](BUSINESS_CASE_LOGIC.md) §5 DB 计算

---

### 6.8 NRE (Non-Recurring Engineering) - 一次性工程费用

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

### 6.9 S&A (Sales & Administration) - 管销费用

**定义：** 销售与管理费用的分摊

**参数说明：**
- S&A Rate 通常为 2% - 3%
- 基数为净销售额（Net Sales）

**包含内容：**
- 销售人员工资
- 管理费用分摊
- 办公场地租金
- 其他运营费用

> **详细计算逻辑：** [docs/BUSINESS_CASE_LOGIC.md](BUSINESS_CASE_LOGIC.md) §6 S&A 计算

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

### 9.2 核心算法概述

**标准成本计算机制：** 系统对所有物料和工艺计算 Standard Cost，提供准确的成本核算基础。

**计算模块：**
- 物料成本计算
- 工艺成本计算（MHR 费率 × Cycle Time）
- HK III / SK / DB 汇总计算
- Payback 投资回收期计算（暂时下架）

> **详细算法实现：** 参考各业务逻辑文档（见附录 11.2）

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
- [docs/PROCESS_COST_LOGIC.md](PROCESS_COST_LOGIC.md) - 工艺成本计算逻辑 (MHR/标准成本)
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

## 11. 审批记录

| 角色 | 姓名 | 审批意见 | 日期 |
|------|------|----------|------|
| 产品负责人 | - | 待审批 | - |
| 技术负责人 | - | 待审批 | - |
| 业务代表 | - | 待审批 | - |

---

## 12. AI驱动开发规范（Figma Make 集成）🆕 v2.1

> **适用场景：** 本项目全程使用 AI 辅助开发，原型设计使用 Figma Make（AI prompt-to-code 工具）。本章节提供结构化的 Prompt 规范，确保 AI 能准确理解需求并生成可用的原型代码。

### 12.1 设计原则

| 原则 | 说明 |
|------|------|
| **Prompt-First** | 所有 UI 描述必须能直接作为 Figma Make 的输入 prompt |
| **组件化** | 界面拆分为独立组件，每个组件有清晰的输入/输出定义 |
| **渐进增强** | 先生成基础结构，再添加交互逻辑 |
| **设计系统一致** | 统一使用 ShadcnUI 组件库，保持视觉一致性 |

---

### 12.2 核心页面 Prompt 模板

#### 12.2.1 Dashboard（仪表盘）

```markdown
**页面名称：** Dashboard

**功能描述：** 项目列表总览，支持项目搜索、状态筛选、PM同步、新建项目

**布局结构：**
- 顶部导航栏：Logo + 用户头像 + 通知图标
- 左侧边栏：流程导航（当前项目进度可视化）
- 主内容区：
  - **统计卡片区（4列 Grid）：**
    - 项目总数（带文件夹图标）
    - 草稿项目数（灰色）
    - 进行中项目数（蓝色）
    - 已完成项目数（绿色）
  - **操作栏：**
    - 搜索框（支持：项目名称、客户名称、项目编号、ASAC编号）
    - 状态筛选 Tab（全部 / 草稿 / 进行中 / 已完成）
    - "从PM软件同步"按钮（带刷新图标和加载状态）
    - "新建项目"按钮（主操作按钮）
  - **项目列表表格：**
    - 列：项目编号、ASAC编号、项目名称、客户名称、产品数、年量、负责人（Sales/VM）、状态徽章、创建日期
    - 行操作：点击行 → 进入项目工作流
  - **AI 助手提示卡片：**
    - 底部固定区域
    - 提示文案："AI 智能报价助手已就绪"

**搜索功能：**
- 支持模糊搜索
- 搜索字段：项目名称、客户名称、项目编号、ASAC编号
- 实时过滤，无需按回车

**状态筛选：**
- Tab 切换：全部 | 草稿 | 进行中 | 已完成
- 默认显示"全部"
- 切换后保持搜索条件

**PM 同步：**
- 点击"从PM软件同步" → 显示加载状态
- 同步成功 → Toast 通知 + 列表自动刷新
- 同步失败 → Alert 错误提示

**交互行为：**
- 点击项目行 → 进入项目简介页面（Project Overview）
- 点击"新建项目" → 打开创建项目对话框（手动填写 / 导入报价单）
- 输入搜索关键词 → 实时过滤项目列表
- 切换状态 Tab → 按状态筛选
- 点击"从PM软件同步" → 同步外部项目数据

**组件依赖：** Card, Badge, Table, Input, Button, Tabs, Toast

**ShadcnUI 组件：**
- `Card` 用于统计卡片和列表容器
- `Table` 用于项目列表展示
- `Badge` 用于状态显示（draft=灰色, in-progress=蓝色, completed=绿色）
- `Input` 用于搜索框
- `Tabs` 用于状态筛选
- `Button` 用于同步和新建操作
- `Toast/Sonner` 用于操作反馈通知

**API 依赖：**
- GET `/api/v1/projects` - 获取项目列表
- GET `/api/v1/projects?status={status}` - 按状态筛选
- POST `/api/v1/projects` - 创建新项目
- POST `/api/v1/projects/sync` - PM 同步（需对接真实 PM 系统）

**验收标准：**
| 场景 | 预期结果 |
|------|---------|
| 页面加载 | 3秒内显示项目列表，统计卡片数据准确 |
| 搜索"博世" | 显示所有客户名包含"博世"的项目 |
| 切换"进行中" Tab | 仅显示 status="in-progress" 的项目 |
| 点击项目行 | 正确跳转到项目简介页面 |
| PM 同步成功 | 显示绿色 Toast 通知，列表新增项目 |
```

---

#### 12.2.2 BOM Management（BOM 管理）

```markdown
**页面名称：** BOM Management

**功能描述：** BOM 文件上传、解析、物料/工艺列表展示

**布局结构：**
- 页面标题 + 项目名称面包屑
- 上传区域（拖拽上传或点击选择文件）
- Tab 切换：物料列表 / 工艺列表
- 数据表格：
  - 物料列：序号、零件号、零件名、材质、数量、单价、状态（红绿灯）、AI建议
  - 工艺列：工序号、工序名、工作中心、标准工时、MHR、状态

**状态红绿灯规则：**
- 🟢 Green（verified）：库中完全匹配
- 🟡 Yellow（warning）：AI语义匹配或估算参数
- 🔴 Red（missing）：库中无数据

**交互行为：**
- 拖拽文件 → 自动上传并解析
- 点击状态图标 → 显示详细信息
- 编辑单元格 → 内联编辑
- 点击"发送询价" → 弹出邮件预览

**组件依赖：** Tabs, Table, FileUpload, Badge, Tooltip

**ShadcnUI 组件：**
- `Tabs` 用于物料/工艺切换
- `Table` 用于数据展示
- `Badge` 用于状态红绿灯
```

---

#### 12.2.3 Cost Calculation（成本计算）

```markdown
**页面名称：** Cost Calculation

**功能描述：** 成本汇总展示、参数调整、重新计算

**布局结构：**
- 左侧面板（40%）：
  - 成本结构树（可折叠）
  - 物料成本明细
  - 工艺成本明细
- 右侧面板（60%）：
  - 成本汇总卡片
  - 调整参数表单
  - 操作按钮（重新计算 / 确认）

**数据展示：**
- 物料成本：¥XXX（XX%）
- 工艺成本：¥XXX（XX%）
- 投资成本：¥XXX（摊销方式）
- 研发成本：¥XXX
- 总成本（HK III）：¥XXX

**交互行为：**
- 展开/折叠成本节点
- 修改参数 → 实时预览影响
- 点击"重新计算" → 更新所有数值

**组件依赖：** Collapsible, Card, Form, Input, Button

**ShadcnUI 组件：**
- `Collapsible` 用于成本结构树
- `Card` 用于汇总展示
- `Form` 用于参数调整
```

---

#### 12.2.4 Quote Summary（报价摘要）

```markdown
**页面名称：** Quote Summary

**功能描述：** Sales 输入商业参数、计算 QS/BC/Payback、导出报价单

**布局结构：**
- 顶部：项目信息摘要（只读）
- 左侧（商业参数输入）：
  - 单价输入框
  - 汇率选择
  - 年降比例（%）
  - 目标利润率（%）
- 右侧（计算结果）：
  - QS 卡片：含税报价、利润率、交货周期
  - BC 卡片：成本分解饼图
  - Payback 卡片：回收期月数 + 推荐等级

**交互行为：**
- 参数变化 → 实时计算 QS/BC
- 点击"导出 PDF" → 生成报价单下载
- 点击"保存草稿" → 暂存当前状态

**组件依赖：** Card, Input, Select, Button, Progress

**ShadcnUI 组件：**
- `Card` 用于 QS/BC/Payback 展示
- `Input` 用于参数输入
- `Progress` 用于回收期等级可视化
```

---

#### 12.2.5 Project Overview（项目简介）

```markdown
**页面名称：** Project Overview（项目简介）

**功能描述：** 汇总项目所有相关信息，作为项目的"信息中心"。用户可在此页面查看项目基本信息、产品列表、询价单、报价版本和附件。

**布局结构：**

```
┌─────────────────────────────────────────────────────────────────────┐
│ 项目简介                                          [状态徽章]        │
│ PRJ-2024-001 · 博世汽车 · 年量 120,000                               │
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────┐ ┌─────────────────────────────┐│
│ │ 产品列表 (3)                      │ │ 询价单                      ││
│ │ ┌───────────────────────────────┐ │ │ • 物料询价单 #1 [待发送]    ││
│ │ │ ▼ 发动机缸体                  │ │ │ • 物料询价单 #2 [已回复]    ││
│ │ │   物料: 15项 工艺: 8项         │ │ │                             ││
│ │ │   成本: ¥325.50               │ │ │ [发起询价]                  ││
│ │ │   [查看完整 BOM]              │ │ ├─────────────────────────────┤│
│ │ └───────────────────────────────┘ │ │ 报价单版本                  ││
│ │ ┌───────────────────────────────┐ │ │ • v1.0 [已提交] 2024-02-05  ││
│ │ │ ▶ 缸盖组件                    │ │ │ • v1.1 [草稿]  2024-02-06   ││
│ │ └───────────────────────────────┘ │ │ [创建新版本]                ││
│ │ ┌───────────────────────────────┐ │ ├─────────────────────────────┤│
│ │ │ ▶ 密封垫片                    │ │ │ 附件 (5)                    ││
│ │ └───────────────────────────────┘ │ │ 📄 BOM_v1.xlsx  [下载][删除]││
│ └───────────────────────────────────┘ │ 📄 报价单.pdf   [下载][删除]││
│                                       └─────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ 快速操作: [上传BOM] [成本核算] [QS报价] [导出PDF]                    │
└─────────────────────────────────────────────────────────────────────┘
```

**页面组成区域：**

**1. 顶部项目信息卡片**
- 项目名称、项目编号、ASAC编号
- 客户名称、客户编号
- 年量、目标利润率
- 负责人信息（Sales、VM、IE、Controlling）
- 项目状态徽章
- 创建/更新时间

**2. 左侧产品列表区域（60%宽度）**
- Accordion 可折叠列表
- 每个产品展开显示：
  - BOM 摘要表格（前5条物料）
  - 工艺摘要表格（前5条工序）
  - 物料数、工艺数、待询价数统计
  - 物料成本汇总、工艺成本汇总
  - "查看完整 BOM" 链接按钮

**3. 右侧信息卡片区域（40%宽度）**

**3.1 询价单卡片**
- 询价单列表（物料询价单）
- 状态徽章：待发送 | 已发送 | 已回复 | 已确认
- 创建时间、发送时间
- "发起询价"按钮 → 打开邮件预览对话框

**3.2 报价单版本卡片**
- 多版本报价列表
- 版本号（v1.0, v1.1, v2.0...）
- 状态徽章：草稿 | 已提交 | 已批准
- 总成本、报价、利润率
- 创建时间
- "创建新版本"按钮

**3.3 附件管理卡片**
- 附件文件列表
- 文件图标（PDF/Excel/图片）
- 文件名、大小、上传人、上传时间
- 操作按钮：预览、下载、删除
- "上传附件"按钮 → 拖拽上传区域

**4. 底部快速操作栏**
- 按钮组：[上传 BOM] [成本核算] [QS 报价] [导出 PDF]
- 按钮状态根据项目进度动态启用/禁用

**交互行为：**
- 展开产品 → 显示 BOM 摘要（前5条物料+工艺）
- 点击"查看完整 BOM" → 跳转 BOM 管理页面，自动选中该产品
- 点击"发起询价" → 打开询价邮件预览对话框
- 上传附件 → 拖拽或点击上传，显示上传进度
- 下载附件 → 直接触发浏览器下载
- 预览附件 → PDF/图片在 Dialog 中预览，Excel 下载
- 创建新报价版本 → 自动递增版本号，跳转到报价编辑页
- 点击快速操作按钮 → 跳转到对应功能页面

**数据展示需求：**

```typescript
// 项目基本信息
interface ProjectOverview {
  id: string;              // 项目编号
  asacNumber: string;      // ASAC 编号
  customerNumber: string;  // 客户编号
  clientName: string;      // 客户名称
  projectName: string;     // 项目名称
  annualVolume: string;    // 年量
  targetMargin?: number;   // 目标利润率
  status: ProjectStatus;   // 状态
  owners: ProjectOwner;    // 负责人
  createdDate: string;
  updatedDate: string;
}

// 产品 BOM 摘要
interface ProductBOMSummary {
  productId: string;
  productName: string;
  productCode: string;
  materialCount: number;      // 物料数量
  processCount: number;       // 工艺数量
  needInquiryCount: number;   // 待询价数量
  totalMaterialCost?: number; // 物料成本汇总
  totalProcessCost?: number;  // 工艺成本汇总
  materials: Material[];      // 物料列表（前5条）
  processes: Process[];       // 工艺列表（前5条）
}

// 询价单
interface ProcurementInquiry {
  id: string;
  projectId: string;
  status: 'pending' | 'sent' | 'replied' | 'confirmed';
  materials: Array<{
    materialCode: string;
    materialName: string;
    quantity: number;
    unit: string;
  }>;
  createdAt: string;
  sentAt?: string;
  repliedAt?: string;
}

// 报价单版本
interface QuoteVersion {
  id: string;
  projectId: string;
  versionNumber: number;      // 1.0, 1.1, 2.0...
  status: 'draft' | 'submitted' | 'approved';
  totalCost: number;
  quotedPrice?: number;
  actualMargin?: number;
  createdAt: string;
}

// 附件
interface ProjectAttachment {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;  // pdf, xlsx, png, etc.
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
}
```

**组件依赖：** Accordion, Card, Badge, Button, Table, Dialog, Progress, Tooltip

**ShadcnUI 组件：**
- `Card` 用于各区域卡片
- `Accordion` 用于产品列表折叠
- `Table` 用于 BOM 摘要展示
- `Badge` 用于状态显示
- `Button` 用于操作按钮
- `Dialog` 用于邮件预览、附件预览
- `Progress` 用于上传进度
- `Tooltip` 用于信息提示

**API 依赖：**
| API | 方法 | 状态 | 说明 |
|-----|------|------|------|
| `/api/v1/projects/{id}` | GET | **已实现** | 获取项目详情 |
| `/api/v1/projects/{id}/products` | GET | **已实现** | 获取产品列表 |
| `/api/v1/bom/products/{projectId}` | GET | **已实现** | 获取 BOM 数据 |
| `/api/v1/procurement/summary/{projectId}` | GET | **需新增** | 获取询价单列表 |
| `/api/v1/quotations/{projectId}` | GET | **需新增** | 获取报价版本列表 |
| `/api/v1/attachments/{projectId}` | GET | **需新增** | 获取附件列表 |
| `/api/v1/attachments/{projectId}` | POST | **需新增** | 上传附件 |
| `/api/v1/attachments/{id}` | DELETE | **需新增** | 删除附件 |

**验收标准：**
| 场景 | 预期结果 |
|------|---------|
| 页面加载 | 2秒内显示项目信息、产品列表、询价单、报价单 |
| 展开产品 | 显示 BOM 摘要（前5条物料+工艺） |
| 点击"查看完整 BOM" | 跳转到 BOM 管理页面，自动选中该产品 |
| 发起询价 | 打开询价邮件预览对话框 |
| 上传附件 | 支持拖拽上传，显示上传进度条 |
| 下载附件 | 正确下载对应文件 |
| 创建新报价版本 | 自动递增版本号，跳转到报价编辑页 |
| 快速操作按钮 | 根据项目进度正确启用/禁用 |
```

---

#### 12.2.6 Project Workflow（项目管理流程）

```markdown
**页面名称：** Project Workflow（项目管理流程）

**功能描述：** 可视化展示项目从创建到完成的完整流程，显示各步骤的状态和进度，引导用户完成报价工作流。

**UI 展示方式：** 左侧侧边栏流程图（当前已通过 AppSidebar 组件实现）

**流程步骤（9步）：**

| 序号 | 步骤名称 | 视图 | 子步骤 | 触发条件 |
|------|---------|------|--------|----------|
| 1 | 项目总览 | dashboard | - | 始终可访问 |
| 2 | 创建项目 | new-project | - | 项目未创建时 |
| 3 | 报价管理 | bom | 物料清单、工艺清单、投资清单(可选)、其他清单(可选) | BOM 未上传时 |
| 4 | 分支：新工艺评估 | process | IE 工艺评估 | 检测到新工艺时触发 |
| 5 | 分支：新物料询价 | - | 采购上传报价单 | 检测到新物料时触发 |
| 6 | 成本核算 | cost-calc | 销售查看成本 | BOM 已解析后 |
| 7 | QS/BC/Payback | quotation | QS 报价摘要、BC 成本分析、Payback 投资回收 | 成本计算完成后 |
| 8 | 控制审核 | - | - | v2.0 已移除此步骤 |
| 9 | 报价输出 | output | - | 所有步骤完成后 |

**状态标识：**

| 状态 | 图标 | 颜色 | 说明 |
|------|------|------|------|
| 已完成 | ✓ (CheckCircle) | 绿色 bg-green-500 | 该步骤已完成 |
| 进行中 | ⏳ (Clock) | 蓝色 bg-blue-500 | 当前正在执行的步骤 |
| 待执行 | ○ (Circle) | 灰色 bg-gray-300 | 尚未开始的步骤 |
| 条件触发 | 虚线框 + Badge | 橙色 | 仅在特定条件下触发 |

**布局结构：**
```
┌─────────────────────────┐
│ 项目进度                │
├─────────────────────────┤
│ ✓ 项目总览              │ ← 已完成（绿色）
│ ✓ 创建项目              │ ← 已完成（绿色）
│ ⏳ 报价管理             │ ← 进行中（蓝色）
│   ├─ 物料清单           │
│   ├─ 工艺清单           │
│   ├─ 投资清单           │
│   └─ 其他清单           │
│ ┌─ 分支：新工艺评估 ─┐  │ ← 条件触发（虚线框）
│ │  [条件触发]        │  │
│ └───────────────────┘  │
│ ┌─ 分支：新物料询价 ─┐  │ ← 条件触发（虚线框）
│ │  [条件触发]        │  │
│ └───────────────────┘  │
│ ○ 成本核算              │ ← 待执行（灰色）
│ ○ QS/BC/Payback        │ ← 待执行（灰色）
│ ○ 报价输出              │ ← 待执行（灰色）
├─────────────────────────┤
│ 图例说明                │
│ ✓ 已完成  ⏳ 进行中     │
│ ○ 待执行  ┈ 条件触发    │
└─────────────────────────┘
```

**交互行为：**
- 点击已完成步骤 → 跳转到对应页面，可查看/编辑
- 点击进行中步骤 → 跳转到对应页面
- 点击待执行步骤 → 显示 Tooltip 提示"需先完成前置步骤"
- 悬停步骤 → 显示状态详情 Tooltip（完成时间、操作人等）
- 流程自动更新 → 根据项目状态自动计算各步骤状态

**状态判断逻辑：**

```typescript
// 步骤状态计算函数
function getStepStatus(stepId: string, project: Project): StepStatus {
  const { status, bomData, hasNewMaterials, hasNewProcesses } = project;

  switch (stepId) {
    case 'dashboard':
      return 'completed'; // 始终可访问
    case 'new-project':
      return status !== 'draft' ? 'completed' : 'active';
    case 'bom':
      if (!bomData?.isParsed) return 'active';
      return 'completed';
    case 'process-assessment':
      return hasNewProcesses ? 'active' : 'optional';
    case 'procurement':
      return hasNewMaterials ? 'active' : 'optional';
    case 'cost-calc':
      if (bomData?.isParsed) return 'active';
      return 'pending';
    case 'quotation':
      if (status === 'calculated' || status === 'sales_input') return 'active';
      if (status === 'completed') return 'completed';
      return 'pending';
    case 'output':
      return status === 'completed' ? 'completed' : 'pending';
    default:
      return 'pending';
  }
}
```

**组件依赖：** Sidebar, SidebarContent, SidebarGroup, Badge, Tooltip

**ShadcnUI 组件：**
- `Sidebar` / `SidebarContent` / `SidebarGroup` 用于侧边栏容器
- `Badge` 用于"条件触发"标签
- `Tooltip` 用于步骤详情提示
- 自定义图标组件（CheckCircle, Clock, Circle）

**API 依赖：**
| API | 方法 | 状态 | 说明 |
|-----|------|------|------|
| `/api/v1/projects/{id}` | GET | **已实现** | 获取项目状态 |
| `/api/v1/bom/products/{projectId}` | GET | **已实现** | 获取 BOM 解析状态 |

**验收标准：**
| 场景 | 预期结果 |
|------|---------|
| 进入 BOM 管理页 | 侧边栏"报价管理"步骤显示为 active（蓝色时钟图标） |
| 完成 BOM 上传 | 侧边栏"报价管理"步骤变为 completed（绿色勾） |
| 检测到新工艺 | 侧边栏"分支：新工艺评估"显示"条件触发"徽章 |
| 点击已完成步骤 | 正确跳转到对应页面，保留已填写数据 |
| 点击待执行步骤 | 显示 Tooltip 提示需先完成前置步骤 |
| 流程自动更新 | 项目状态变更后，侧边栏状态自动重新计算 |
```

---

### 12.3 通用组件 Prompt 规范

#### 12.3.1 状态徽章（Status Badge）

```markdown
**组件名称：** StatusBadge

**功能描述：** 显示项目/物料/工艺状态的彩色徽章

**Props 定义：**
```typescript
interface StatusBadgeProps {
  status: 'draft' | 'in-progress' | 'completed' | 'verified' | 'warning' | 'missing';
  size?: 'sm' | 'md' | 'lg';
}
```

**样式规则：**
| status | 背景色 | 文字色 | 文案 |
|--------|--------|--------|------|
| draft | gray-100 | gray-700 | 草稿 |
| in-progress | blue-100 | blue-700 | 进行中 |
| completed | green-100 | green-700 | 已完成 |
| verified | green-100 | green-700 | 已验证 |
| warning | yellow-100 | yellow-700 | 待确认 |
| missing | red-100 | red-700 | 缺失数据 |

**ShadcnUI 基础组件：** `Badge`
```

---

#### 12.3.2 项目卡片（Project Card）

```markdown
**组件名称：** ProjectCard

**功能描述：** 在 Dashboard 中展示单个项目摘要

**Props 定义：**
```typescript
interface ProjectCardProps {
  id: string;
  projectName: string;
  clientName: string;
  status: 'draft' | 'in-progress' | 'completed';
  owner: {
    sales: string;
    vm: string;
  };
  createdDate: string;
  annualVolume: string;
  onClick?: () => void;
}
```

**布局结构：**
```
┌─────────────────────────────────┐
│ 项目名称            [状态徽章] │
│ 客户名称                         │
│ ─────────────────────────────────│
│ Sales: XXX  |  VM: XXX          │
│ 年量: XXXX                       │
│ 创建: 2026-02-13                 │
└─────────────────────────────────┘
```

**交互行为：**
- 悬停 → 显示阴影效果
- 点击 → 触发 onClick 回调

**ShadcnUI 基础组件：** `Card`
```

---

### 12.4 设计系统规范

#### 12.4.1 颜色系统（TailwindCSS）

| 用途 | 颜色类 | 色值 |
|------|--------|------|
| **主色** | `bg-blue-600` | #2563eb |
| **主色悬停** | `hover:bg-blue-700` | #1d4ed8 |
| **成功** | `bg-green-600` | #16a34a |
| **警告** | `bg-yellow-500` | #eab308 |
| **错误** | `bg-red-600` | #dc2626 |
| **中性背景** | `bg-slate-50` | #f8fafc |
| **边框** | `border-slate-200` | #e2e8f0 |
| **文字主色** | `text-slate-900` | #0f172a |
| **文字次色** | `text-slate-500` | #64748b |

#### 12.4.2 间距系统

| 级别 | Tailwind 类 | 用途 |
|------|-------------|------|
| xs | `p-1` / `gap-1` | 紧凑元素内部间距 |
| sm | `p-2` / `gap-2` | 按钮内边距 |
| md | `p-4` / `gap-4` | 卡片内边距 |
| lg | `p-6` / `gap-6` | 页面区块间距 |
| xl | `p-8` / `gap-8` | 大区块间距 |

#### 12.4.3 圆角规范

| 组件 | 圆角类 | 值 |
|------|--------|-----|
| 按钮 | `rounded-md` | 6px |
| 卡片 | `rounded-lg` | 8px |
| 输入框 | `rounded-md` | 6px |
| 对话框 | `rounded-xl` | 12px |
| 徽章 | `rounded-full` | 全圆 |

---

### 12.5 交互状态规范

#### 12.5.1 加载状态

```markdown
**场景：** 数据加载中（BOM解析、成本计算、API请求）

**UI 表现：**
- 使用 `Skeleton` 组件占位
- 骨架屏颜色：`bg-slate-200`
- 动画：`animate-pulse`

**ShadcnUI 组件：** `Skeleton`
```

#### 12.5.2 空状态

```markdown
**场景：** 无数据（空项目列表、空BOM）

**UI 表现：**
- 居中显示插图/图标
- 提示文案："暂无XX，点击新增"
- 主操作按钮

**ShadcnUI 组件：** `Card` + 自定义插图
```

#### 12.5.3 错误状态

```markdown
**场景：** 操作失败（上传失败、计算错误）

**UI 表现：**
- 使用 `Alert` 组件
- 类型：`destructive`
- 包含错误信息 + 重试按钮

**ShadcnUI 组件：** `Alert`
```

---

### 12.6 响应式断点

| 断点 | Tailwind 前缀 | 最小宽度 | 布局调整 |
|------|--------------|----------|----------|
| Mobile | (default) | 0px | 单列，侧边栏隐藏 |
| Tablet | `md:` | 768px | 双列，侧边栏折叠 |
| Desktop | `lg:` | 1024px | 三列，侧边栏展开 |

---

### 12.7 Prompt 编写最佳实践

> **给 Figma Make 的建议：** 以下格式能帮助 AI 更准确地生成代码

**✅ 好的 Prompt 格式：**
```
创建一个 [页面名称] 页面，包含：
1. [组件1]：[具体描述]
2. [组件2]：[具体描述]

使用 ShadcnUI 的 [组件列表]。
布局：[具体布局描述]
交互：[具体交互行为]
```

**❌ 避免的 Prompt 格式：**
```
做一个好看的页面，要有按钮和表格
（太模糊，AI 无法理解具体需求）
```

---

**文档结束**

*如有疑问，请联系产品团队：luoxin@jshine.cc*
