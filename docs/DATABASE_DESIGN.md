# Dr.aiVOSS 数据库设计文档

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.8   | 2026-02-03 | 2026-02-13 | Dr.aiVOSS 数据库设计 | Randy Luo |

---

## 📋 变更日志 (Changelog)

| 日期 | 版本 | 变更内容 | 影响范围 |
|------|------|---------|---------|
| 2026-02-03 | v1.0 | 初始版本，定义核心表结构 | 全部 |
| 2026-02-03 | v1.2 | 修复前端技术栈描述；更新产品名称 | 全部 |
| 2026-02-03 | v1.3 | 🔴 **破坏性变更**：新增5张表；process_rates 表 MHR 拆分为 var/fix | 全部 |
| 2026-02-04 | v1.4 | 🔴 **破坏性变更**：process_rates 表新增折旧率字段，支持 Payback 现金流计算 | Payback 模块 |
| 2026-02-05 | v1.5 | 🔴 **破坏性变更**：projects 表新增 factory_id；quote_summaries 表新增 version_number；新增 factories 表；新增 std_investment_costs 表；business_case_params 新增 logistics_rate 和 other_mfg_rate | 多版本报价、工厂管理、系数维护 |
| 2026-02-05 | v1.6 | 🔴 **破坏性变更**：移除所有 VAVE 相关字段，简化双轨价格为单轨标准成本 | 全部表 |
| 2026-02-05 | v1.7 | 🔴 **新增功能**：新增向量数据表 material_vectors 和 product_vectors，支持语义匹配和产品复用 | 向量搜索 |
| 2026-02-13 | v1.8 | 🔴 **破坏性变更**：cost_centers 新增租金单价/能源单价/利率字段；process_rates 新增工作中心/设备原值/占用面积/额定功率/计划小时数/负载系数/std_mhr_total 字段；product_processes 新增人工费率/MHR快照字段 | MHR 计算逻辑 |

**变更规范：**
- 任何字段新增/修改/删除必须记录在此
- 影响范围填写：表名 / 模块名
- 破坏性变更使用 🔴 标记

---

## 1. 架构概述 {#architecture}

```
┌─────────────────────────────────────────────────────────────┐
│                      主数据层 (Master Data)                   │
├──────────────┬──────────────┬──────────────────────────────┤
│ materials    │ process_rates│                              │
│ 物料主数据    │ 工序费率主数据│                              │
└──────────────┴──────────────┴──────────────────────────────┘
                              ↓ 引用
┌─────────────────────────────────────────────────────────────┐
│                   交易数据层 (Transaction Data)              │
├──────────────┬──────────────┬──────────────────────────────┤
│ projects     │ project_products │ product_materials        │
│ 项目表        │ 项目-产品关联     │ 产品-物料关联（BOM行）     │
│              ├──────────────┼──────────────────────────────┤
│              │ product_processes │ quote_summaries          │
│              │ 产品工艺路线       │ 报价汇总                   │
└──────────────┴──────────────┴──────────────────────────────┘
                              ↓ 语义关联
┌─────────────────────────────────────────────────────────────┐
│                   向量数据层 (Vector Data) 🆕 v1.7            │
├──────────────┬──────────────────────────────────────────────┤
│ material_vectors│ 物料语义向量 → BOM清洗匹配                 │
│ product_vectors │ 产品指纹向量 → 历史方案复用                │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 2. ER 关系图 {#er-diagram}

```mermaid
erDiagram
    factories ||--o{ projects : "1:N 关联"
    factories ||--o{ cost_centers : "1:N 所属"
    projects ||--o{ project_products : "1:N 包含"
    project_products ||--o{ product_materials : "1:N 使用"
    project_products ||--o{ product_processes : "1:N 工艺路线"
    project_products ||--o{ investment_items : "1:N 投资"
    project_products ||--o| amortization_strategies : "1:1 分摊"

    materials ||--o{ product_materials : "1:N 被引用"
    materials ||--o| material_vectors : "1:1 向量"  -- 🆕 v1.7

    cost_centers ||--o{ process_rates : "1:N 所属"
    process_rates ||--o{ product_processes : "1:N 被引用"

    project_products ||--o| product_vectors : "1:1 指纹"  -- 🆕 v1.7

    projects ||--o{ quote_summaries : "1:N 多版本"
    projects ||--o| business_case_params : "1:1 参数"
    business_case_params ||--o{ business_case_years : "1:N 年度"

    factories {
        varchar20 id PK "工厂代码"
        string name
        string location
        decimal cost_coefficient "成本系数"
        string status
    }

    projects {
        char36 id PK
        string project_name
        string project_code "AS/AC编号"
        string customer_name
        varchar20 factory_id FK "所属工厂"
        int annual_volume
        string status
        decimal target_margin
    }

    cost_centers {
        varchar20 id PK "成本中心代码"
        varchar20 factory_id FK "所属工厂"
        string name
        decimal net_production_hours
        decimal efficiency_rate
        decimal plan_fx_rate
        decimal avg_wages_per_hour
        int useful_life_years
        string status
    }

    materials {
        varchar50 id PK "物料编码"
        string name
        string material_type "自制/外购"
        decimal std_price
    }

    product_materials {
        char36 id PK
        char36 project_product_id FK
        varchar50 material_id FK
        int material_level
        decimal quantity
        decimal std_cost
    }

    process_rates {
        int id PK
        varchar50 process_code UK "工序编码"
        varchar20 cost_center_id FK "成本中心"
        string process_name
        decimal std_mhr_var "标准变动费率"
        decimal std_mhr_fix "标准固定费率"
        decimal efficiency_factor
    }

    product_processes {
        char36 id PK
        char36 project_product_id FK
        varchar50 process_code FK
        int sequence_order
        int cycle_time_std "标准工时(秒)"
        decimal personnel_std
        decimal std_cost
    }

    investment_items {
        char36 id PK
        char36 project_id FK
        char36 product_id FK
        varchar20 item_type "MOLD/GAUGE/JIG/FIXTURE"
        string name
        decimal unit_cost_est
        string currency
        int quantity
        int asset_lifecycle
        boolean is_shared
    }

    amortization_strategies {
        char36 id PK
        char36 project_id FK
        varchar20 mode "UPFRONT/AMORTIZED"
        int amortization_volume
        int duration_years
        decimal interest_rate
        decimal calculated_unit_add
    }

    quote_summaries {
        char36 id PK
        char36 project_id FK
        decimal version_number "版本号"
        decimal total_std_cost
        decimal quoted_price
        decimal actual_margin
        decimal hk_3_cost
        decimal sk_cost
        decimal db_1
        decimal db_4
    }

    std_investment_costs {
        char36 id PK
        varchar20 item_type "MOLD/GAUGE/JIG/FIXTURE"
        string material_type "材质"
        decimal tonnage "吨位"
        varchar20 complexity "复杂度"
        decimal std_cost_min "成本下限"
        decimal std_cost_max "成本上限"
        string currency
        string status
    }

    business_case_params {
        char36 id PK
        char36 project_id FK
        decimal tooling_invest
        decimal rnd_invest
        decimal base_price
        decimal exchange_rate
        decimal sa_rate "管销费用率"
        decimal logistics_rate "物流包装费率"
        decimal other_mfg_rate "其他制造费用系数"
        varchar20 amortization_mode
    }

    business_case_years {
        char36 id PK
        char36 project_id FK
        int year
        int volume
        decimal reduction_rate
        decimal gross_sales
        decimal net_sales
        decimal net_price
        decimal hk_3_cost
        decimal recovery_tooling
        decimal recovery_rnd
        decimal overhead_sa
        decimal sk_cost
        decimal db_1
        decimal db_4
    }

    material_vectors {  -- 🆕 v1.7
        char36 id PK
        varchar50 material_id FK
        vector embedding "向量(1536维)"
        text embedding_text
        varchar50 embedding_model
        decimal similarity_threshold
    }

    product_vectors {  -- 🆕 v1.7
        char36 id PK
        char36 product_id FK
        vector embedding "向量(1536维)"
        text fingerprint_text
        varchar50 embedding_model
        decimal similarity_threshold
    }
```

---

## 3. 表结构详解 {#table-structure}

### 3.1 主数据表 {#master-data}

#### materials（物料主数据）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PK | 物料编码 |
| name | VARCHAR(200) | NOT NULL | 物料名称 |
| version | VARCHAR(20) | | 版本号 |
| material_type | VARCHAR(20) | | made(自制)/bought(外购) |
| status | VARCHAR(20) | DEFAULT 'active' | active/inactive |
| material | VARCHAR(100) | | 材料描述 |
| supplier | VARCHAR(200) | | 供应商 |
| std_price | DECIMAL(10,4) | | 标准单价 |
| remarks | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

#### process_rates（工序费率主数据）- 已扩展

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | |
| process_code | VARCHAR(50) | UNIQUE | 工序编码（字母+数字，如 I01） |
| **cost_center_id** | **VARCHAR(20)** | **FK** | **🔴 v1.3 新增：关联成本中心** |
| process_name | VARCHAR(100) | NOT NULL | 工序名称 |
| equipment | VARCHAR(100) | | 设备 |
| **work_center** | **VARCHAR(1)** | | **🔴 v1.8 新增：工作中心字母（I/A/M/T/P/S）** |
| **equipment_origin_value** | **DECIMAL(14,2)** | | **🔴 v1.8 新增：设备购置原值** |
| **floor_area** | **DECIMAL(8,2)** | | **🔴 v1.8 新增：占用面积（㎡）** |
| **rated_power** | **DECIMAL(8,2)** | | **🔴 v1.8 新增：额定功率（kW）** |
| **planned_hours** | **DECIMAL(10,2)** | | **🔴 v1.8 新增：计划小时数** |
| **load_factor** | **DECIMAL(3,2)** | **DEFAULT 0.70** | **🔴 v1.8 新增：负载系数** |
| **std_mhr_var** | DECIMAL(10,2) | | **🔴 v1.3 新增：标准变动费率** |
| **std_mhr_fix** | DECIMAL(10,2) | | **🔴 v1.3 新增：标准固定费率** |
| **std_mhr_total** | **DECIMAL(10,2)** | | **🔴 v1.8 新增：标准总费率（计算值）** |
| **std_depreciation_rate** | DECIMAL(8,4) | | **🔴 v1.4 新增：标准折旧率** |
| efficiency_factor | DECIMAL(4,2) | DEFAULT 1.0 | 效率系数 |
| remarks | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

> **v1.8 MHR 计算说明：**
> - `std_mhr_var` = 能源单价 × 额定功率 × 负载系数（能源成本）
> - `std_mhr_fix` = 租金成本 + 折旧成本 + 利息成本
> - `std_mhr_total` = `std_mhr_var` + `std_mhr_fix`
> - 新增工艺时自动触发 MHR 计算，详见 `PROCESS_COST_LOGIC.md`

### 3.2 交易数据表 {#transaction-data}

#### projects（项目表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_name | VARCHAR(200) | NOT NULL | 项目名称 |
| project_code | VARCHAR(50) | | AS/AC 编号 |
| customer_name | VARCHAR(200) | NOT NULL | 客户名称 |
| customer_code | VARCHAR(50) | | 客户编号 |
| **factory_id** | **VARCHAR(20)** | **FK** | **🔴 v1.5 新增：所属工厂** |
| annual_volume | INT | | 年量 |
| status | VARCHAR(20) | NOT NULL | 状态值 |
| owner | VARCHAR(50) | | 负责人 |
| remarks | TEXT | | 备注 |
| target_margin | DECIMAL(5,2) | | 目标利润率(%) |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

**状态值流转 v2.0:**
```
draft → parsing → (waiting_price | waiting_ie) → (waiting_mhr) →
calculated → sales_input → completed
```

**v1.5 变更说明：**
- 移除 `controlling_review` 状态
- 新增 `sales_input` 状态（Sales 输入商业参数）
- 新增 `factory_id` 字段关联工厂

#### project_products（项目-产品关联）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_id | CHAR(36) | FK, NOT NULL | 关联项目 |
| product_name | VARCHAR(200) | NOT NULL | 产品名称 |
| product_code | VARCHAR(50) | | 产品编号 |
| product_version | VARCHAR(20) | | 产品版本 |
| route_code | VARCHAR(50) | | 工艺路线编码 |
| bom_file_path | VARCHAR(500) | | BOM 文件路径 |
| created_at | DATETIME | DEFAULT NOW() | |

#### product_materials（BOM 行项目）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_product_id | CHAR(36) | FK, NOT NULL | 关联产品 |
| material_id | VARCHAR(50) | FK | 关联物料（可为空） |
| material_level | INT | | 物料层级 |
| material_name | VARCHAR(200) | | 物料名称（快照） |
| material_type | VARCHAR(20) | | made/bought |
| quantity | DECIMAL(10,3) | | 数量 |
| unit | VARCHAR(10) | | 单位 |
| std_cost | DECIMAL(12,4) | | 标准成本 |
| confidence | DECIMAL(5,2) | | 匹配置信度 0-100 |
| ai_suggestion | TEXT | | AI 建议 |
| remarks | TEXT | | 备注（BOM Comments） |
| created_at | DATETIME | DEFAULT NOW() | |

#### product_processes（产品工艺路线）- 已扩展

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_product_id | CHAR(36) | FK, NOT NULL | 关联产品 |
| process_code | VARCHAR(50) | FK, NOT NULL | 工序编码 |
| sequence_order | INT | NOT NULL | 工序顺序 |
| **cycle_time_std** | INT | | **🔴 新增：标准工时（秒）** |
| **personnel_std** | DECIMAL(4,2) | DEFAULT 1.0 | **🔴 新增：标准人工配置（人/机）** |
| std_mhr | DECIMAL(10,2) | | MHR 快照（保留兼容） |
| std_cost | DECIMAL(12,4) | | 标准成本 |
| remarks | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT NOW() | |

**扩展成本计算公式:**
```
std_cost = (cycle_time_std / 3600) × (std_mhr_var + std_mhr_fix + personnel_std × labor_rate)
```

#### quote_summaries（报价汇总）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_id | CHAR(36) | FK, NOT NULL | 关联项目 |
| **version_number** | **DECIMAL(3,1)** | **DEFAULT 1.0** | **🔴 v1.5 新增：版本号** |
| total_std_cost | DECIMAL(14,4) | | 总标准成本 |
| quoted_price | DECIMAL(14,4) | | 报价 |
| actual_margin | DECIMAL(5,2) | | 实际利润率(%) |
| **hk_3_cost** | DECIMAL(14,4) | | **🔴 新增：HK III 制造成本** |
| **sk_cost** | DECIMAL(14,4) | | **🔴 新增：SK 完全成本** |
| **db_1** | DECIMAL(14,4) | | **🔴 新增：DB I 边际贡献 I** |
| **db_4** | DECIMAL(14,4) | | **🔴 新增：DB IV 净利润** |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

**v1.5 变更说明：**
- 新增 `version_number` 字段支持多版本报价
- 更新 UNIQUE 约束为 `(project_id, version_number)`
- 一个项目可以有多条报价记录（v1.0, v1.1, v1.2...）

---

### 3.3 主数据扩展表 {#master-data-extension}

#### factories（工厂主数据）🔴 v1.5 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(20) | PK | 工厂代码 |
| name | VARCHAR(100) | NOT NULL | 工厂名称 |
| location | VARCHAR(200) | | 地理位置 |
| cost_coefficient | DECIMAL(8,4) | | 成本系数 |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE/INACTIVE |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

#### cost_centers（成本中心主数据）🔴 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(20) | PK | 成本中心代码 |
| **factory_id** | **VARCHAR(20)** | **FK** | **🔴 v1.5 新增：所属工厂** |
| name | VARCHAR(100) | NOT NULL | 成本中心名称 |
| net_production_hours | DECIMAL(8,2) | | 年度额定生产小时数 |
| efficiency_rate | DECIMAL(5,4) | | 稼动率 0-1 |
| plan_fx_rate | DECIMAL(10,6) | | 计划汇率 |
| avg_wages_per_hour | DECIMAL(10,2) | | 平均时薪 |
| useful_life_years | INT | DEFAULT 8 | 折旧年限 |
| **rent_unit_price** | **DECIMAL(10,4)** | | **🔴 v1.8 新增：租金单价（元/㎡/年）** |
| **energy_unit_price** | **DECIMAL(8,4)** | | **🔴 v1.8 新增：能源单价（元/kWh）** |
| **interest_rate** | **DECIMAL(5,4)** | | **🔴 v1.8 新增：年利率** |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE/INACTIVE |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

---

### 3.4 投资标准库表 {#investment-standards}

#### std_investment_costs（投资项标准库）🔴 v1.5 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| item_type | VARCHAR(20) | NOT NULL | MOLD/GAUGE/JIG/FIXTURE |
| material_type | VARCHAR(100) | | 模具材质 |
| tonnage | DECIMAL(8,2) | | 吨位 |
| complexity | VARCHAR(20) | | 复杂度：LOW/MEDIUM/HIGH |
| std_cost_min | DECIMAL(12,2) | | 标准成本下限 |
| std_cost_max | DECIMAL(12,2) | | 标准成本上限 |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 币种 |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE/INACTIVE |
| effective_date | DATETIME | | 生效日期 |
| expiry_date | DATETIME | | 失效日期 |
| remarks | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

**用途说明：**
- 用于校验投资成本的合理性
- 根据类型、材质、吨位、复杂度查询标准成本范围
- 当投资项超出标准范围 ±20% 时发出预警

---

### 3.5 NRE 投资相关表 {#nre-tables}

#### investment_items（投资项明细）🔴 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_id | CHAR(36) | FK, NOT NULL | 关联项目 |
| product_id | CHAR(36) | FK | 关联产品 |
| item_type | VARCHAR(20) | | MOLD/GAUGE/JIG/FIXTURE |
| name | VARCHAR(200) | | 投资项名称 |
| unit_cost_est | DECIMAL(12,2) | | 预估单价 |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 币种 |
| quantity | INT | DEFAULT 1 | 数量 |
| asset_lifecycle | INT | | 设计寿命(模次) |
| is_shared | BOOLEAN | DEFAULT FALSE | 是否共享资产 |
| shared_source_id | CHAR(36) | | 共享源 ID |
| status | VARCHAR(20) | DEFAULT 'DRAFT' | DRAFT/CONFIRMED |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

#### amortization_strategies（分摊策略）🔴 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_id | CHAR(36) | FK, NOT NULL, UNIQUE | 关联项目 |
| mode | VARCHAR(20) | | UPFRONT/AMORTIZED |
| amortization_volume | INT | | 分摊基数销量 |
| duration_years | INT | DEFAULT 2 | 分摊年限 |
| interest_rate | DECIMAL(5,4) | DEFAULT 0.0600 | 年利率 |
| calculated_unit_add | DECIMAL(10,4) | | 单件分摊额(计算结果) |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

---

### 3.6 Business Case 相关表 {#business-case-tables}

#### business_case_params（Business Case 参数）🔴 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_id | CHAR(36) | FK, NOT NULL, UNIQUE | 关联项目 |
| tooling_invest | DECIMAL(14,4) | | 模具投入总额 |
| rnd_invest | DECIMAL(14,4) | | 研发投入总额 |
| base_price | DECIMAL(10,4) | | 基础单价 |
| exchange_rate | DECIMAL(8,4) | | 汇率 |
| amortization_mode | VARCHAR(50) | | total_volume_based/fixed_3_years |
| sa_rate | DECIMAL(5,4) | DEFAULT 0.0210 | 管销费用率 ~2.1% |
| **logistics_rate** | **DECIMAL(5,4)** | | **🔴 v1.5 新增：物流包装费率** |
| **other_mfg_rate** | **DECIMAL(5,4)** | | **🔴 v1.5 新增：其他制造费用系数** |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

**v1.5 变更说明：**
- 新增 `logistics_rate` 物流包装费率（由 Controlling 维护）
- 新增 `other_mfg_rate` 其他制造费用系数（由 Controlling 维护）
- SK = HK III + S&A + 物流包装 + 其他制造费用

#### business_case_years（Business Case 年度数据）🔴 新增

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| project_id | CHAR(36) | FK, NOT NULL | 关联项目 |
| year | INT | NOT NULL | 年份 |
| volume | INT | NOT NULL | 销量 |
| reduction_rate | DECIMAL(5,4) | | 年降比例 |
| gross_sales | DECIMAL(14,4) | | 毛销售额 |
| net_sales | DECIMAL(14,4) | | 净销售额 |
| net_price | DECIMAL(10,4) | | 净单价 |
| hk_3_cost | DECIMAL(14,4) | | HK III 制造成本 |
| recovery_tooling | DECIMAL(14,4) | | 模具摊销 |
| recovery_rnd | DECIMAL(14,4) | | 研发摊销 |
| overhead_sa | DECIMAL(14,4) | | S&A 管销费用 |
| sk_cost | DECIMAL(14,4) | | SK 完全成本 |
| db_1 | DECIMAL(14,4) | | DB I 边际贡献 I |
| db_4 | DECIMAL(14,4) | | DB IV 净利润 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

**唯一索引:** UNIQUE KEY (project_id, year)

---

### 3.7 向量数据表 {#vector-tables} 🆕 v1.7

> **技术栈**：PostgreSQL 16 + pgvector 扩展
> **详细设计**：[VECTOR_DESIGN.md](VECTOR_DESIGN.md)

#### material_vectors（物料向量表）

**用途**：存储物料主数据的语义向量，用于 BOM 物料清洗匹配

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| material_id | VARCHAR(50) | FK, NOT NULL, UNIQUE | 关联 materials.id |
| embedding | vector(1536) | NOT NULL | 物料语义向量（pgvector） |
| embedding_text | TEXT | NOT NULL | 用于生成向量的汇集文本（快照） |
| embedding_model | VARCHAR(50) | DEFAULT 'text-embedding-v4' | 使用的嵌入模型 |
| similarity_threshold | DECIMAL(3,2) | DEFAULT 0.85 | 相似度阈值 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

**外键关系**：
```sql
FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
```

**汇集字段规则**：
- ✅ 包含：`name`, `material`, `remarks`, `material_type`
- ❌ 排除：`id`, `std_price`, `supplier`, `created_at`

#### product_vectors（产品向量表）

**用途**：存储产品 BOM 指纹向量，用于历史相似产品检索

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| product_id | CHAR(36) | FK, NOT NULL, UNIQUE | 关联 project_products.id |
| embedding | vector(1536) | NOT NULL | 产品指纹向量（pgvector） |
| fingerprint_text | TEXT | NOT NULL | 用于生成向量的汇集文本（快照） |
| embedding_model | VARCHAR(50) | DEFAULT 'text-embedding-v4' | 使用的嵌入模型 |
| similarity_threshold | DECIMAL(3,2) | DEFAULT 0.80 | 相似度阈值 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

**外键关系**：
```sql
FOREIGN KEY (product_id) REFERENCES project_products(id) ON DELETE CASCADE
```

**汇集字段规则**：
- ✅ 包含：`product_name`, Level 1 关键组件名、工艺名称序列、BOM 工艺关键词
- ❌ 排除：`quantity`, `product_code`, `cycle_time_std`, `std_cost`

---

## 4. 索引设计 {#indexes}

```sql
-- projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_customer ON projects(customer_code);
CREATE INDEX idx_projects_code ON projects(project_code);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_projects_factory ON projects(factory_id); -- 🔴 v1.5 新增

-- project_products
CREATE INDEX idx_pp_project ON project_products(project_id);

-- materials
CREATE INDEX idx_materials_type ON materials(material_type);
CREATE INDEX idx_materials_status ON materials(status);

-- product_materials
CREATE INDEX idx_pm_product ON product_materials(project_product_id);
CREATE INDEX idx_pm_material ON product_materials(material_id);

-- product_processes
CREATE INDEX idx_pproc_product ON product_processes(project_product_id);
CREATE INDEX idx_pproc_sequence ON product_processes(project_product_id, sequence_order);

-- quote_summaries
CREATE INDEX idx_qs_project ON quote_summaries(project_id);
CREATE UNIQUE INDEX idx_qs_project_version ON quote_summaries(project_id, version_number); -- 🔴 v1.5 更新

-- factories (v1.5 新增)
CREATE INDEX idx_factories_status ON factories(status);

-- cost_centers (新增)
CREATE INDEX idx_cc_status ON cost_centers(status);
CREATE INDEX idx_cc_factory ON cost_centers(factory_id); -- 🔴 v1.5 新增

-- std_investment_costs (v1.5 新增)
CREATE INDEX idx_std_inv_type ON std_investment_costs(item_type);
CREATE INDEX idx_std_inv_status ON std_investment_costs(status);

-- investment_items (新增)
CREATE INDEX idx_inv_project ON investment_items(project_id);
CREATE INDEX idx_inv_product ON investment_items(product_id);
CREATE INDEX idx_inv_type ON investment_items(item_type);
CREATE INDEX idx_inv_shared ON investment_items(is_shared, shared_source_id);

-- amortization_strategies (新增)
CREATE INDEX idx_amort_project ON amortization_strategies(project_id);

-- business_case_params (新增)
CREATE INDEX idx_bcp_project ON business_case_params(project_id);

-- business_case_years (新增)
CREATE INDEX idx_bcy_project ON business_case_years(project_id);
CREATE INDEX idx_bcy_year ON business_case_years(year);

-- 🆕 v1.7 向量索引 (pgvector HNSW)
CREATE INDEX idx_mv_embedding_hnsw
ON material_vectors USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_pv_embedding_hnsw
ON product_vectors USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## 5. 设计原则 {#principles}

| 原则 | 实现方式 |
|------|----------|
| **KISS** | 主数据与交易数据分离，结构清晰 |
| **DRY** | 物料和工序作为主数据共享，避免重复 |
| **YAGNI** | 只保留 MVP 必需字段 |
| **可扩展** | 预留 remarks 字段，状态值可扩展 |
| **数据完整性** | 使用外键约束，CASCADE 删除 |
| **审计追踪** | 所有表包含 created_at/updated_at |

---

**文档结束**
