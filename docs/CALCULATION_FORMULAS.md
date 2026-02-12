# Dr.aiVOSS 报价系统 - 完整计算公式手册

> **文档版本:** v2.3
> **创建日期:** 2026-02-12
> **更新日期:** 2026-02-12
> **适用对象:** 开发者、IE工程师、财务人员、Sales
> **数据来源:** 基于 PROJECT_CONTEXT.md 及 docs/ 下所有逻辑文档

---

## 版本变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v2.3 | 2026-02-12 | 🐛 修复拼写错误（编码问题导致的） |
| v2.2 | 2026-02-12 | ✨ 为每个公式添加中文注释，便于理解每个参数含义 |
| v2.1 | 2026-02-12 | 🆕 新增：每个公式参数的数据库表来源映射；新增：缺失字段清单 |
| v2.0 | 2026-02-12 | 🔧 完全重写：基于所有官方文档重新核验所有公式 |

---

## 目录

1. [总览：成本层层累加](#1-总览成本层层累加)
2. [核心标准成本公式](#2-核心标准成本公式)
3. [物料成本计算](#3-物料成本计算)
4. [工艺成本计算](#4-工艺成本计算)
5. [HK III（制造成本）计算](#5-hk-iii制造成本计算)
6. [NRE 投资分摊计算](#6-nre-投资分摊计算)
7. [SK（完全成本）计算](#7-sk完全成本计算)
8. [利润指标计算](#8-利润指标计算)
9. [年降（LTA）计算](#9-年降lta计算)
10. [Business Case 多年度计算](#10-business-case-多年度计算)
11. [Payback 投资回收期计算](#11-payback-投资回收期计算)
12. [折旧率计算](#12-折旧率计算)
13. [完整数据流](#13-完整数据流)
14. [关键公式速查表](#14-关键公式速查表)
15. [术语对照表](#15-术语对照表)
16. [参数来源表映射](#16-参数来源表映射)
17. [缺失字段清单](#17-缺失字段清单)

---

## 1. 总览：成本层层累加

### 1.1 成本金字塔结构

```
┌─────────────────────────────────────────────────────────────┐
│                       报价 (VP)                              │
│                  客户看到的最终单价                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        SK (完全成本)                          │
│              HK III + 分摊 + 管销 + 物流 + 其他制造费          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    HK III (制造成本)                         │
│          Material_Cost + Variable_Process_Cost + Fixed_Overhead   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────┬─────────────────────────────────┐
│        Material Cost       │        Process Cost               │
│    Σ(Qty × Price)      │  Σ((MHR + Labor) × Hours)      │
└───────────────────────────┴─────────────────────────────────┘
```

### 1.2 计算层级关系

| 层级 | 名称 | 说明 | 公式 |
|------|------|------|------|
| Level 1 | 物料成本 | BOM中所有物料的成本总和 | Σ(quantity × std_price) |
| Level 2 | 变动工艺成本 | 所有工序的机时+人工变动部分 | Σ((MHR_var + Labor) × cycle_time/3600) |
| Level 2 | 固定制造费用 | 厂房折旧、管理等 | Fixed_Overhead |
| Level 3 | HK III | 工厂大门成本 | Material_Cost + Variable_Process_Cost + Fixed_Overhead |
| Level 4 | SK | 含分摊的完全成本 | HK_III + Amortization + S&A + 物流 + 其他制造 |
| Level 5 | VP | 报价单价 | SK / (1 - 目标利润率) |
| Level 5 | DB I | 生产毛利 | Net_Sales - HK_III |
| Level 5 | DB IV | 净利润 | Net_Sales - SK |

---

## 2. 核心标准成本公式

> 来源：PROJECT_CONTEXT.md §3.1

### 2.1 标准成本公式

```
# 标准成本 = (物料数量 × 物料标准单价) + Σ(工序工时 × (机时费率 + 人工标准费率))
Standard_Cost = (Qty × MaterialPrice_std) + Σ(CycleTime × (MHR_std + Labor_std))
```

**展开形式：**

```
# 标准成本 = 物料成本 + 工艺成本
Standard_Cost = Material_Cost + Process_Cost

# 其中：
# 物料成本 = Σ(物料数量_i × 物料标准单价_i)
- Material_Cost = Σ(Qty_i × MaterialPrice_std_i)

# 工艺成本 = Σ((工序工时_i / 3600) × (机时费率标准值_i + 人工标准费率_i))
- Process_Cost = Σ(CycleTime_i / 3600 × (MHR_std_i + Labor_std_i))
```

### 2.2 参数说明与数据来源

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `Qty` | BOM中的数量 | `product_materials` | `quantity` |
| `MaterialPrice_std` | 物料标准单价 | `materials` | `std_price` |
| `CycleTime` | 工艺标准工时（秒） | `product_processes` | `cycle_time_std` |
| `MHR_std` | 机时费率标准值 | `process_rates` | `std_mhr_var + std_mhr_fix` |
| `Labor_std` | 人工费率标准值 | `cost_centers` + `product_processes` | `avg_wages_per_hour × personnel_std` |

---

## 3. 物料成本计算

### 3.1 单行物料成本公式

```
# 单行物料成本 = 数量 × 标准单价
Material_Cost_Line = quantity × std_price
```

### 3.2 总物料成本公式

```
# 总物料成本 = Σ(单行物料成本_i)
#            = Σ(数量_i × 标准单价_i)
Material_Cost = Σ(Material_Cost_Line_i)
                = Σ(quantity_i × std_price_i)
```

### 3.3 参数来源

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `quantity` | `product_materials` | `quantity` |
| `std_price` | `materials` | `std_price` |

### 3.4 价格匹配规则（红绿灯系统）

> 来源：PROJECT_CONTEXT.md §3.2

| 状态 | 条件 | 处理方式 |
|------|------|----------|
| 🟢 **Green** | 物料号在 `materials` 表中完全匹配，且价格在有效期内 | 系统自动采用标准价格 |
| 🟡 **Yellow** | 物料号未匹配，但 AI 通过向量语义搜索找到相似度 > 85% 的历史物料；或使用了 AI 从 Comments 估算的工艺参数 | 标记为待确认，VM 需人工核对后确认采用 |
| 🔴 **Red** | 库中无数据，且 AI 向量搜索未找到相似品（相似度 ≤ 85%） | 必须由人工发起询价并输入结果 |

### 3.5 向量语义搜索规则

> 来源：PROJECT_CONTEXT.md §3.2

**向量汇集字段：**

```
# 向量汇集文本 = "名称: {name}; 材料: {material}; 类型: {material_type}; 备注: {remarks}"
embedding_text = "Name: {name}; Material: {material}; Type: {material_type}; Remarks: {remarks}"
```

**参数来源：**

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `name` | `materials` | `name` |
| `material` | `materials` | `material` |
| `material_type` | `materials` | `material_type` |
| `remarks` | `materials` | `remarks` |
| `embedding` (向量) | `material_vectors` | `embedding` (pgvector) |
| `similarity_threshold` | `material_vectors` | `similarity_threshold` |

**排除字段（噪音）：**
- `std_price` - 价格波动不影响物料物理属性
- `supplier` - 供应商不影响物料本身
- `quantity` - 数量是交易属性，不是物料属性
- `id`, `created_at`, `updated_at` - 无语义意义

---

## 4. 工艺成本计算

> 来源：PROCESS_COST_LOGIC.md

### 4.1 MHR（机时费率）拆解

```
# 机时费率总计 = 机时变动费率 + 机时固定费率
MHR_total = MHR_var + MHR_fix
```

**参数来源：**

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `MHR_var` | `process_rates` | `std_mhr_var` |
| `MHR_fix` | `process_rates` | `std_mhr_fix` |

**组成部分：**

| 组成部分 | 说明 | 包含内容 |
|----------|------|----------|
| **MHR_var** | 机器变动费率 | 能源、维修、刀具、操作辅料 |
| **MHR_fix** | 机器固定费率 | 折旧、利息、厂房租金、保险费 |

### 4.2 单工序工艺成本公式

```
# 工艺成本 = (机时变动费率 + 机时固定费率 + 人工费率) × (标准工时秒 / 3600转为小时)
Process_Cost = (MHR_var + MHR_fix + Labor_Rate) × (cycle_time_std / 3600)
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `cycle_time_std` | 节拍工时 | `product_processes` | `cycle_time_std` (单位: 秒) |
| `MHR_var` | 机器变动费率 | `process_rates` | `std_mhr_var` |
| `MHR_fix` | 机器固定费率 | `process_rates` | `std_mhr_fix` |
| `personnel_std` | 标准人工配置 | `product_processes` | `personnel_std` (人/机) |
| `avg_wages_per_hour` | 平均时薪 | `cost_centers` | `avg_wages_per_hour` |
| `Labor_Rate` | 人工费率 | 计算值 | `avg_wages_per_hour × personnel_std` |

> 注意：cycle_time_std 单位是秒，需要除以 3600 转换为小时

### 4.3 工艺成本计算示例

```
已知条件：
- cycle_time_std = 45 秒      # 标准工时45秒
- MHR_var = 45.00 元/小时     # 机器变动费率
- MHR_fix = 30.00 元/小时     # 机器固定费率
- personnel_std = 1.0 人/机    # 每台机器需1人操作
- avg_wages_per_hour = 85.50 元/小时  # 平均时薪85.5元

计算过程：
# 人工费率 = 平均时薪 × 标准人工配置
Labor_Rate = 85.50 × 1.0 = 85.50 元/小时

# 机时费率总计 = 机器变动费率 + 机器固定费率
MHR_total = 45.00 + 30.00 = 75.00 元/小时

# 工时数 = 标准工时秒数 / 3600转为小时
Hours = 45 / 3600 = 0.0125 小时

# 工艺成本 = (机时费率总计 + 人工费率) × 工时数
Process_Cost = (75.00 + 85.50) × 0.0125
            = 160.50 × 0.0125
            = 2.006 元
```

### 4.4 总工艺成本公式

```
# 总工艺成本 = Σ(各工序工艺成本_i)
Total_Process_Cost = Σ(Process_Cost_i)
```

---

## 5. HK III（制造成本）计算

> 来源：BUSINESS_CASE_LOGIC.md

### 5.1 定义

**HK III = Herstellkosten III** = 制造成本 = 工厂大门成本

**包含：**
- ✅ Material_Cost（直接材料成本）
- ✅ Variable_Process_Cost（变动工艺成本 - 机时+人工变动部分）
- ✅ Fixed_Overhead（固定制造费用 - 厂房折旧、管理等）

**不包含：**
- ❌ 研发费用
- ❌ 模具/检具分摊
- ❌ 管销费用 (S&A)
- ❌ 物流费用

### 5.2 计算公式

```
# 第n年HK_III = 第n年销量 × (物料成本 + 变动工艺成本 + 固定制造费用)
HK_III_n = Volume_n × (Material_Cost + Variable_Process_Cost + Fixed_Overhead)

# 或简化为单件成本形式：
# 单件HK_III = 物料成本 + 变动工艺成本 + 固定制造费用
HK_III_per_unit = Material_Cost + Variable_Process_Cost + Fixed_Overhead
```

### 5.3 参数来源

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `Material_Cost` | 物料成本 | 计算值 | Σ(`product_materials.quantity` × `materials.std_price`) |
| `Variable_Process_Cost` | 变动工艺成本 | 计算值 | Σ((`MHR_var` + `Labor_Rate`) × `cycle_time_std`/3600) |
| `Fixed_Overhead` | 🔴 **固定制造费用** | ❌ **缺失** | **需新增字段或配置表** |
| `Volume_n` | 第n年销量 | `business_case_years` | `volume` |
| `HK_III_per_unit` | 单件制造成本 | `quote_summaries` | `hk_3_cost` |

### 5.4 各组成部分

```
# 物料成本 = Σ(数量 × 标准单价)
Material_Cost = Σ(quantity × std_price)

# 变动工艺成本 = Σ((机时变动费率 + 人工费率) × 工时/3600)
Variable_Process_Cost = Σ((MHR_var + Labor_Rate) × cycle_time/3600)

# 固定制造费用 = 固定制造费用分摊（如厂房折旧、管理人员工资等）
Fixed_Overhead = 固定制造费用分摊（如厂房折旧、管理人员工资等）
```

### 5.5 数据来源

| 成本项 | 数据来源 | 计算方法 |
|--------|---------|----------|
| 物料成本 | `product_materials` 表汇总 | Σ(quantity × std_price) |
| 变动工艺成本 | `product_processes` 表汇总 | Σ((MHR_var + Labor) × cycle_time/3600) |
| 固定制造费用 | ❌ **缺失** | 🔴 需要新增配置表或字段 |

---

## 6. NRE 投资分摊计算

> 来源：NRE_INVESTMENT_LOGIC.md

### 6.1 投资类型

| 类型代码 | 中文名称 | 英文名称 | 示例 |
|----------|----------|----------|------|
| **MOLD** | 模具 | Molding Tool | 注塑模、压铸模、冲压模 |
| **GAUGE** | 检具 | Gauge | 通止规、气密测试台、综合检具 |
| **JIG** | 夹具 | Jig | 焊接定位座、流水线托盘 |
| **FIXTURE** | 工装 | Fixture | 去水口刀具、机械手抓手 |

### 6.2 总投资计算

```
# 投资总额 = 预估单价 × 数量
Total_Investment = unit_cost_est × quantity
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `unit_cost_est` | 预估单价 | `investment_items` | `unit_cost_est` |
| `quantity` | 数量 | `investment_items` | `quantity` |
| `item_type` | 投资类型 | `investment_items` | `item_type` (MOLD/GAUGE/JIG/FIXTURE) |

### 6.3 寿命重置逻辑

当总销量超过工装寿命时，需要重置工装：

```
# 如果 设计寿命不为空 且 总销量 > 设计寿命:
#     数量 = 向上取整(总销量 / 设计寿命)
#     投资总额 = 预估单价 × 数量
IF asset_lifecycle IS NOT NULL AND total_volume > asset_lifecycle:
    quantity = CEILING(total_volume / asset_lifecycle)
    Total_Investment = unit_cost_est × quantity
```

**参数来源：**

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `asset_lifecycle` | 设计寿命(模次) | `investment_items` | `asset_lifecycle` |
| `total_volume` | 总销量 | `projects` | `annual_volume` 或累计值 |

### 6.4 分摊模式

#### 模式A：一次性支付 (UPFRONT)

```
# 单件分摊额 = 0 （客户单独支付工装费用，不计入零件单价）
Unit_Amort = 0
```

客户单独支付工装费用，不计入零件单价。

#### 模式B：分摊进单价 (AMORTIZED) - VOSS默认

**含资本利息的核心公式：**

```
# 单件分摊额 = 投资总额 × (1 + 资本年利率 × 分摊年限) / 分摊基数销量
#               = 投资总额 × 资本利息因子 / 分摊基数销量
Unit_Amort = Total_Investment × (1 + interest_rate × duration_years) / amortization_volume
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `Total_Investment` | 投资总额 | `investment_items` | `unit_cost_est × quantity` |
| `interest_rate` | 资本年利率 | `amortization_strategies` | `interest_rate` (默认 6%) |
| `duration_years` | 分摊年限 | `amortization_strategies` | `duration_years` (如 2 年) |
| `amortization_volume` | 分摊基数销量 | `amortization_strategies` | `amortization_volume` |
| `mode` | 分摊模式 | `amortization_strategies` | `mode` (UPFRONT/AMORTIZED) |
| `(1 + interest_rate × duration_years)` | Capital Interest 因子 | 计算值 | - |

### 6.5 分摊计算示例

```
场景：一副注塑模具分摊

输入参数：
┌──────────────────────────┬────────────┐
│ 参数                     │ 值          │
├──────────────────────────┼────────────┤
│ 模具费 (unit_cost_est)   │ 170,000 元 │
│ 分摊年限 (duration)       │ 2 年        │
│ 资本利率 (interest_rate)  │ 6%          │
│ 分摊销量 (amort_vol)      │ 29,750 件   │
└──────────────────────────┴────────────┘

计算过程：
# 资本利息因子 = 1 + 资本利率 × 分摊年限
Capital_Interest_Factor = 1 + 0.06 × 2 = 1.12

# 含息总额 = 投资总额 × 资本利息因子
含息总额 = 170,000 × 1.12 = 190,400 元

# 单件分摊额 = 含息总额 / 分摊销量
Unit_Amort = 190,400 / 29,750 = 6.40 元/件
```

---

## 7. SK（完全成本）计算

> 来源：QUOTATION_SUMMARY_LOGIC.md, BUSINESS_CASE_LOGIC.md

### 7.1 定义

**SK = Selbstkosten** = 完全成本 = 包含一切分摊后的真实总成本

### 7.2 SK-1 计算公式

```
# SK_1 = HK_III + (净销售额 × 管销费用率)
SK_1 = HK_III + (Net_Sales × sa_rate)
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `HK_III` | 制造成本 | `quote_summaries` | `hk_3_cost` |
| `Net_Sales` | 净销售额 | 计算值 | `Volume × Net_Price` |
| `sa_rate` | 管销费用率 | `business_case_params` | `sa_rate` (默认 2.1%) |

### 7.3 Working Capital Interest（营运资金利息）

```
# 营运资金利息 = 报价 × 资金利率 × (付款账期天数 / 360)
Working_Capital_Interest = VP × interest_rate × (payment_terms_days / 360)
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `VP` | 报价单价 | `quote_summaries` | `quoted_price` |
| `interest_rate` | 资金利率 | `cost_centers` | ❌ **缺失：需新增字段** |
| `payment_terms_days` | 🔴 **付款账期** | ❌ **缺失** | **需新增到 business_case_params** |

**注意：** 这是独立于 Tooling 分摊中 Capital Interest 的资金占用成本

### 7.4 SK-2 计算公式（完全成本）

```
# SK_2 = HK_III
#         + 模具分摊
#         + 研发分摊
#         + 净销售额 × (管销费用率 + 物流费率 + 其他制造费率)
SK_2 = HK_III
        + Recovery_Tool              # 模具分摊
        + Recovery_R&D              # 研发分摊
        + Net_Sales × (S&A_Rate + Logistics_Rate + OtherMfg_Rate)
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `HK_III` | 制造成本 | `quote_summaries` | `hk_3_cost` |
| `Recovery_Tool` | 模具分摊 | `business_case_years` | `recovery_tooling` |
| `Recovery_R&D` | 研发分摊 | `business_case_years` | `recovery_rnd` |
| `S&A_Rate` | 管销费用率 | `business_case_params` | `sa_rate` |
| `Logistics_Rate` | 物流费率 | `business_case_params` | `logistics_rate` |
| `OtherMfg_Rate` | 其他制造费率 | `business_case_params` | `other_mfg_rate` |
| `Net_Sales` | 净销售额 | 计算值 | `Volume × Net_Price` |

### 7.5 展开形式

```
# SK_2 = HK_III
#         + 模具分摊
#         + 研发分摊
#         + 净销售额 × 管销费用率       # 管销费用
#         + 净销售额 × 物流费率        # 物流费
#         + 净销售额 × 其他制造费率      # 其他制造费
#         + 营运资金利息                # 营运资金利息 (可选)
SK_2 = HK_III
       + Recovery_Tool
       + Recovery_R&D
       + (Net_Sales × sa_rate)       # S&A费用
       + (Net_Sales × logistics_rate)  # 物流费
       + (Net_Sales × other_mfg_rate) # 其他制造费
       + Working_Capital_Interest     # 营运资金利息 (可选)
```

### 7.6 完整计算示例

```
输入参数：
┌──────────────────────┬────────────┐
│ 参数                 │ 值          │
├──────────────────────┼────────────┤
│ HK_III               │ 46.24 元    │
│ sa_rate              │ 2.1%        │
│ Recovery_Tool        │ 6.40 元     │
│ Recovery_R&D         │ 0.54 元     │
│ logistics_rate       │ 1.5%        │
│ other_mfg_rate       │ 2.0%        │
│ interest_rate        │ 5%          │
│ payment_terms_days   │ 90天        │
│ VP（暂估值）        │ 57.90 元    │
└──────────────────────┴────────────┘

计算过程：
# 净销售额 ≈ 报价 = 57.90 元
Net_Sales ≈ VP = 57.90 元

# 管销费用 = 净销售额 × 管销费用率
S&A费用 = 57.90 × 0.021 = 1.22 元

# 物流费 = 净销售额 × 物流费率
物流费 = 57.90 × 0.015 = 0.87 元

# 其他制造费 = 净销售额 × 其他制造费率
其他制造费 = 57.90 × 0.02 = 1.16 元

# 营运资金利息 = 报价 × 资金利率 × (付款账期天数 / 360)
Working_Capital_Interest = 57.90 × 0.05 × (90/360)
                          = 57.90 × 0.0125
                          = 0.72 元

# SK_2 = HK_III + 模具分摊 + 研发分摊 + 管销费用 + 物流费 + 其他制造费 + 营运资金利息
SK_2 = 46.24 + 6.40 + 0.54 + 1.22 + 0.87 + 1.16 + 0.72
     = 57.15 元
```

---

## 8. 利润指标计算

> 来源：QUOTATION_SUMMARY_LOGIC.md, BUSINESS_CASE_LOGIC.md

### 8.1 指标体系

```
┌─────────────────────────────────────────────────────────────┐
│                       报价 (VP)                             │
│                     客户支付的价格                            │
└─────────────────────────────────────────────────────────────┘
         ↙                    ↘
   DB I (生产毛利)          HK III (制造成本)
   工厂赚不赚钱？
         ↙                    ↘
   DB IV (净利润)           SK-2 (完全成本)
   项目赚不赚钱？
```

### 8.2 DB I（边际贡献 I - 生产毛利）

**定义：** 衡量工厂生产这个产品是否盈利。

**公式：**

```
# DB_I (边际贡献I) = 净销售额 - HK_III
DB_I = Net_Sales - HK_III

# DB_I比率 = (报价 - HK_III) / 报价
DB_I_Rate = (VP - HK_III) / VP

# 另一种形式（考虑分摊）：
# DB_I比率_含分摊 = (报价 - HK_III - 模具分摊 - 研发分摊) / 报价
DB_I_Rate_All = (VP - HK_III - Recovery_Tool - Recovery_R&D) / VP
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `VP` | 报价单价 | `quote_summaries` | `quoted_price` |
| `Net_Sales` | 净销售额 | 计算值 | `Volume × Net_Price` |
| `HK_III` | 制造成本 | `quote_summaries` | `hk_3_cost` |
| `Recovery_Tool` | 模具分摊 | `business_case_years` | `recovery_tooling` |
| `Recovery_R&D` | 研发分摊 | `business_case_years` | `recovery_rnd` |
| `DB_I_Rate` | 生产毛利率 | `quote_summaries` | ❌ **缺失：建议新增** |
| `DB_I` | 生产毛利额 | `quote_summaries` | `db_1` |

**判断标准：**
- `DB_I_Rate ≥ 15%`: 健康的生产毛利
- `10% ≤ DB_I_Rate < 15%`: 需要关注
- `DB_I_Rate < 10%`: 警戒线

### 8.3 DB IV（净利润 - 最终底线）

**定义：** 衡量整个项目扣除所有投入（含研发、工装、管销）后是否盈利。

**公式：**

```
# DB_IV (净利润) = 净销售额 - SK_2
DB_IV = Net_Sales - SK_2

# DB_IV比率 = (报价 - SK_2) / 报价
DB_IV_Rate = (VP - SK_2) / VP

# DB_IV金额 = DB_IV比率 × 销量
DB_IV_Value = DB_IV_Rate × Volume
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `Net_Sales` | 净销售额 | 计算值 | `Volume × Net_Price` |
| `SK_2` | 完全成本 | `quote_summaries` | `sk_cost` |
| `VP` | 报价单价 | `quote_summaries` | `quoted_price` |
| `Volume` | 销量 | `projects` | `annual_volume` |
| `DB_IV_Rate` | 净利率 | `quote_summaries` | ❌ **缺失：建议新增** |
| `DB_IV` | 净利润额 | `quote_summaries` | `db_4` |

**判断标准：**
- `DB_IV_Rate ≥ 10%`: 项目盈利健康
- `5% ≤ DB_IV_Rate < 10%`: 项目盈利但偏低
- `DB_IV_Rate < 5%`: 项目微利
- `DB_IV_Rate < 0%`: ⚠️ 项目亏损

### 8.4 计算示例

```
VP = 57.90 元       # 报价
HK_III = 46.24 元     # 制造成本
SK_2 = 57.15 元       # 完全成本

# DB_I = 净销售额 - HK_III = 报价 - HK_III
DB_I = 57.90 - 46.24 = 11.66 元

# DB_I比率 = (报价 - HK_III) / 报价
DB_I_Rate = (57.90 - 46.24) / 57.90 = 20.1%  ✅ 健康状态

# DB_IV = 净销售额 - SK_2 = 报价 - SK_2
DB_IV = 57.90 - 57.15 = 0.75 元

# DB_IV比率 = (报价 - SK_2) / 报价
DB_IV_Rate = (57.90 - 57.15) / 57.90 = 1.30%  ⚠️ 项目微利
```

### 8.5 利润判断矩阵

| 场景 | DB I 状态 | DB IV 状态 | 判断 | 建议 |
|------|-----------|------------|------|------|
| 1 | 盈利 | 盈利 | ✅ 理想状态 | 正常推进 |
| 2 | 盈利 | 亏损 | ⚠️ 警告 | 研发/工装投入过高，需优化或调整报价 |
| 3 | 亏损 | 盈利 | ❌ 异常 | 数据错误，需检查 |
| 4 | 亏损 | 亏损 | ❌ 严重 | 不能接单或大幅提价 |

---

## 9. 年降（LTA）计算

> 来源：BUSINESS_CASE_LOGIC.md

### 9.1 核心公式（默认模式 - 累计模式）

**⚠️ 重要：德系客户通常使用累计复利计算**

```
# 第n年净价 = 基础单价 × (1 - 累计年降比例_i)
Net_Price_n = Base_Price × (1 - Σ|Reduction_Rate_i|)
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `Base_Price` | 基础单价（第1年价格） | `business_case_params` | `base_price` |
| `Σ|Reduction_Rate_i|` | 累计年降比例 | `business_case_years` | 累计 `reduction_rate` |
| `Net_Price_n` | 第n年的年降后单价 | `business_case_years` | `net_price` |
| `n` | 年份 | `business_case_years` | `year` |

### 9.2 计算示例

```
基价 = 21.76 €      # 基础单价
年降率 = 3%（累计模式）      # 每年降3%
基准年 = 2026年

计算过程：
┌──────┬──────────────────┬────────────────────────┬────────────┐
│ 年份  │ 累计年降比例    │ 计算公式                │ 年降后单价  │
├──────┼──────────────────┼────────────────────────┼────────────┤
│ 2026 │ 0%              │ 21.76 × (1 - 0%)     │ 21.76 €    │
│ 2027 │ 3%              │ 21.76 × (1 - 3%)    │ 21.11 €    │
│ 2028 │ 6%              │ 21.76 × (1 - 6%)    │ 20.45 €    │
│ 2029 │ 9%              │ 21.76 × (1 - 9%)    │ 19.80 €    │
└──────┴──────────────────┴────────────────────────┴────────────┘
```

### 9.3 年降参数

| 参数 | 默认值 | 数据来源表 | 字段路径 |
|------|--------|------------|----------|
| `lta_rate` | 2% - 5% | `business_case_years` | `reduction_rate` |
| `base_year` | 项目第1年 | `business_case_years` | `year = 1` |
| `lta_mode` | cumulative | ❌ **缺失** | 建议新增到配置 |

---

## 10. Business Case 多年度计算

> 来源：BUSINESS_CASE_LOGIC.md

### 10.1 目的

计算项目全生命周期的盈利情况。

### 10.2 输入参数来源

```json
{
  "volumes": {
    "year_1": 45000,        // → business_case_years.volume WHERE year=1
    "year_2": 120000,       // → business_case_years.volume WHERE year=2
    ...
  },
  "tooling_invest": 49468.00,    // → business_case_params.tooling_invest
  "rnd_invest": 48079.00,        // → business_case_params.rnd_invest
  "base_price": 21.76,           // → business_case_params.base_price
  "exchange_rate": 7.83,          // → business_case_params.exchange_rate
  "lta_rate": 0.03,              // → business_case_years.reduction_rate
  "sa_rate": 0.021,              // → business_case_params.sa_rate
  "logistics_rate": 0.015,        // → business_case_params.logistics_rate
  "other_mfg_rate": 0.02,        // → business_case_params.other_mfg_rate
  "interest_rate": 0.05,          // → amortization_strategies.interest_rate
  "payment_terms_days": 90,        // → ❌ 缺失：需新增
  "amortization_volume": 165000    // → amortization_strategies.amortization_volume
}
```

### 10.3 单年度计算公式与参数来源

#### 收入侧

**公式：**

```
# 第n年销售总额 = 第n年销量 × 基础单价
Gross_Sales_n = Volume_n × Base_Price

# 第n年净价 = 基础单价 × (1 - 累计年降_n)
Net_Price_n = Base_Price × (1 - 累计年降_n)

# 第n年净销售额 = 第n年销量 × 第n年净价
Net_Sales_n = Volume_n × Net_Price_n
```

**参数来源：**

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `Volume_n` | `business_case_years` | `volume` (WHERE year=n) |
| `Base_Price` | `business_case_params` | `base_price` |
| `累计年降_n` | 计算值 | Σ(`business_case_years.reduction_rate` FROM year=1 TO n) |
| `Gross_Sales_n` | `business_case_years` | `gross_sales` |
| `Net_Price_n` | `business_case_years` | `net_price` |
| `Net_Sales_n` | `business_case_years` | `net_sales` |

#### 成本侧

**公式：**

```
# 第n年HK_III = 第n年销量 × (物料成本 + 变动工艺成本 + 固定制造费用)
# 制造成本
HK_III_n = Volume_n × (Material_Cost + Variable_Process_Cost + Fixed_Overhead)

# 第n年工装分摊 = 模具投资总额 × 第n年销量 / 分摊基数销量
# 工装分摊（按量分摊）
Recovery_Tooling_n = Tooling_Invest × Volume_n / Amortization_Volume

# 第n年研发分摊 = 研发投资总额 × 第n年销量 / 分摊基数销量
# 研发分摊
Recovery_R&D_n = R&D_Invest × Volume_n / Amortization_Volume

# 第n年管销费用 = 第n年净销售额 × 管销费用率
# 管销费用
Overhead_SA_n = Net_Sales_n × sa_rate

# 第n年物流费用 = 第n年净销售额 × 物流费率
# 物流费用
Logistics_n = Net_Sales_n × logistics_rate

# 第n年其他制造费 = 第n年净销售额 × 其他制造费率
# 其他制造费
Other_Mfg_n = Net_Sales_n × other_mfg_rate

# 第n年营运资金 = 第n年净价 × 资金利率 × (付款账期天数 / 360) × 第n年销量
# 营运资金利息
Working_Cap_n = Net_Price_n × interest_rate × (payment_terms_days / 360) × Volume_n
```

**参数来源：**

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `HK_III_n` | `business_case_years` | `hk_3_cost` |
| `Tooling_Invest` | `business_case_params` | `tooling_invest` |
| `R&D_Invest` | `business_case_params` | `rnd_invest` |
| `Amortization_Volume` | `amortization_strategies` | `amortization_volume` |
| `sa_rate` | `business_case_params` | `sa_rate` |
| `logistics_rate` | `business_case_params` | `logistics_rate` |
| `other_mfg_rate` | `business_case_params` | `other_mfg_rate` |
| `interest_rate` | `amortization_strategies` | `interest_rate` |
| `payment_terms_days` | ❌ **缺失** | **需新增到 business_case_params** |
| `Recovery_Tooling_n` | `business_case_years` | `recovery_tooling` |
| `Recovery_R&D_n` | `business_case_years` | `recovery_rnd` |
| `Overhead_SA_n` | `business_case_years` | `overhead_sa` |

#### 完全成本汇总

**公式：**

```
# 第n年SK = 第n年HK_III
#            + 第n年工装分摊
#            + 第n年研发分摊
#            + 第n年管销费用
#            + 第n年物流费用
#            + 第n年其他制造费
#            + 第n年营运资金
SK_n = HK_III_n
       + Recovery_Tooling_n
       + Recovery_R&D_n
       + Overhead_SA_n
       + Logistics_n
       + Other_Mfg_n
       + Working_Cap_n
```

**参数来源：**

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `SK_n` | `business_case_years` | `sk_cost` |

#### 利润侧

**公式：**

```
# 第n年DB_I = 第n年净销售额 - 第n年HK_III
DB_I_n = Net_Sales_n - HK_III_n

# 第n年DB_I比率 = 第n年DB_I / 第n年净销售额
DB_I_Rate_n = DB_I_n / Net_Sales_n

# 第n年DB_IV = 第n年净销售额 - 第n年SK
DB_IV_n = Net_Sales_n - SK_n

# 第n年DB_IV比率 = 第n年DB_IV / 第n年净销售额
DB_IV_Rate_n = DB_IV_n / Net_Sales_n

# 第n年DB_IV金额 = 第n年DB_IV  # 绝对金额
DB_IV_Value_n = DB_IV_n  # 绝对金额
```

**参数来源：**

| 参数 | 数据来源表 | 字段路径 |
|------|------------|----------|
| `DB_I_n` | `business_case_years` | `db_1` |
| `DB_IV_n` | `business_case_years` | `db_4` |

### 10.4 多年度汇总指标

```
# 全生命周期净利 = Σ(所有年份的 DB_IV_n)
# 全生命周期净利 = Σ(所有年份的净利润_n)
Total_DB_IV = Σ(所有年份的 DB_IV_n)

# 盈亏平衡年份 = min(年份n | 累计DB_IV_n > 0)
# 盈亏平衡年份 = 第一个累计净利润为正的年份
Break_Even_Year = min(n | DB_IV_cumulative_n > 0)

# 加权平均净利率 = Σ(DB_IV_n) / Σ(净销售额_n)
# 加权平均净利率 = 所有年份净利润之和 / 所有年份净销售额之和
Weighted_AVG_DB_IV_Rate = Σ(DB_IV_n) / Σ(Net_Sales_n)
```

---

## 11. Payback 投资回收期计算

> 来源：PROJECT_CONTEXT.md, BUSINESS_CASE_LOGIC.md

### 11.1 核心概念

**Payback（投资回收期）** 回答以下问题：

> **"客户购买此产品/项目，需要多长时间收回全部投资成本？"**

### 11.2 静态回收期公式

```
# 回收期(月数) = 项目总投资 / 项目月度净利
Payback(月数) = 项目总投资 / 项目月度净利
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `项目总投资` | 各项投资之和 | 计算值 | 见下表 |
| `项目月度净利` | 每月净利润 | 计算值 | 见下表 |
| `Payback` | 回收期(月) | `quote_summaries` | `payback_period` |

### 11.3 项目总投资

```
# 投资总额 = 模具投入 + 研发投入 + 设备投入 + 其他投入
I_total = I_tooling + I_rnd + I_equipment + I_other
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `I_tooling` | 模具投资 | `investment_items` | `unit_cost_est × quantity` (WHERE item_type='MOLD') |
| `I_rnd` | 研发投资 | `investment_items` | `unit_cost_est × quantity` (WHERE item_type='R&D') |
| `I_equipment` | 设备投资 | `investment_items` | `unit_cost_est × quantity` (WHERE item_type='EQUIPMENT') |
| `I_other` | 其他投资 | `investment_items` | `unit_cost_est × quantity` (WHERE item_type='OTHER') |

### 11.4 项目月度净利

```
# 月度净利 = (年净销售额 - 年完全成本) / 12
Monthly_Profit = (Net_Sales - SK) / 12
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `Net_Sales` | 年净销售额 | `business_case_years` | `net_sales` |
| `SK` | 年完全成本 | `business_case_years` | `sk_cost` |

### 11.5 Payback 计算示例

```
输入参数：
┌──────────────────────┬────────────┐
│ 参数                 │ 值          │
├──────────────────────┼────────────┤
│ 模具投资             │ 170,000 元 │
│ 研发投资             │ 15,000 元  │
│ 设备投资             │ 0 元       │
│ 年净销售额           │ 1,738,000 元 │
│ 年完全成本 (SK)      │ 1,633,500 元 │
└──────────────────────┴────────────┘

计算过程：
# 投资总额 = 170,000 + 15,000 = 185,000 元
I_total = 170,000 + 15,000 = 185,000 元

# 年净利 = 年净销售额 - 年完全成本
Annual_Profit = 1,738,000 - 1,633,500 = 104,500 元

# 月度净利 = 年净利 / 12
Monthly_Profit = 104,500 / 12 ≈ 8,708 元

# 回收期(月) = 投资总额 / 月度净利
Payback = 185,000 / 8,708 ≈ 21.2 月
```

---

## 12. 折旧率计算

> 来源：PROCESS_COST_LOGIC.md v1.4

### 12.1 折旧率定义

**折旧率** 是设备/工装投资按年分摊到成本中的比例。

### 12.2 折旧率公式

```
# 年折旧额 = 设备原值 / 折旧年限
Annual_Depreciation = Equipment_Value / Useful_Life_Years

# 折旧率 = 年折旧额 / 设备原值
Depreciation_Rate = 1 / Useful_Life_Years

# 或：折旧率 = 年折旧额 / 年度有效工时
Depreciation_Rate_Per_Hour = Annual_Depreciation / H_effective
```

**参数来源：**

| 参数 | 说明 | 数据来源表 | 字段路径 |
|------|------|------------|----------|
| `Equipment_Value` | 设备原值 | `investment_items` | `unit_cost_est` (WHERE item_type='EQUIPMENT') |
| `Useful_Life_Years` | 折旧年限 | `cost_centers` | `useful_life_years` (默认 8 年) |
| `H_effective` | 年度有效工时 | `cost_centers` | `net_production_hours × efficiency_rate` |
| `std_depreciation_rate` | 标准折旧率 | `process_rates` | `std_depreciation_rate` |

### 12.3 折旧率在 MHR 中的位置

```
# MHR_fix(含折旧) = 折旧率 + 租金 + 保险费 + 管理分摊
MHR_fix = Depreciation_Rate_Per_Hour + Rent_Per_Hour + Insurance_Per_Hour + Admin_Per_Hour

# MHR_fix(不含折旧) = 租金 + 保险费 + 管理分摊
MHR_fix_excl_Depreciation = MHR_fix - Depreciation_Rate_Per_Hour
```

---

## 13. 完整数据流

### 13.1 成本计算数据流向

```
┌─────────────────────────────────────────────────────────────────┐
│                        输入层 (Input)                          │
├─────────────────────────────────────────────────────────────────┤
│ • BOM 文件 → product_materials (物料清单)                      │
│ • 工艺路线 → product_processes (工序工时)                      │
│ • 物料主数据 → materials (标准价格)                           │
│ • 工序费率 → process_rates (MHR_var, MHR_fix)                │
│ • 投资项 → investment_items (模具、研发、设备)                 │
│ • 商业参数 → business_case_params (汇率、年降率、费率)        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       计算层 (Calculation)                     │
├─────────────────────────────────────────────────────────────────┤
│ Step 1: 物料成本 = Σ(quantity × std_price)                    │
│ Step 2: 工艺成本 = Σ((MHR_var + MHR_fix + Labor) × Cycle/3600) │
│ Step 3: HK_III = Material_Cost + Process_Cost + Fixed_Overhead│
│ Step 4: Tooling 分摊 = Invest × (1 + 利率 × 年限) / 分摊销量   │
│ Step 5: SK = HK_III + 分摊 + Net_Sales × (管销+物流+其他制造) │
│ Step 6: DB_I = Net_Sales - HK_III                             │
│ Step 7: DB_IV = Net_Sales - SK                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                        输出层 (Output)                         │
├─────────────────────────────────────────────────────────────────┤
│ • quote_summaries (单年度报价汇总)                             │
│ • business_case_years (多年度 Business Case)                    │
│ • API Response (JSON) → 前端展示                              │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 表间关联关系

```
projects (项目)
    ├─→ project_products (产品)
    │       ├─→ product_materials (物料) ──→ materials (主数据)
    │       ├─→ product_processes (工序) ──→ process_rates (主数据)
    │       ├─→ investment_items (投资项)
    │       └─→ amortization_strategies (分摊策略)
    │
    ├─→ quote_summaries (报价汇总) ──→ business_case_params (参数)
    │                                          └─→ business_case_years (年度数据)
    │
    └─→ factories (工厂) ──→ cost_centers (成本中心)
```

---

## 14. 关键公式速查表

| 公式名称 | 公式 | 说明 |
|---------|------|------|
| **物料成本** | `Σ(quantity × std_price)` | 所有物料按数量×单价累加 |
| **工艺成本** | `Σ((MHR_var + MHR_fix + Labor) × Cycle/3600)` | 工序工时×费率累加 |
| **HK III** | `Material_Cost + Process_Cost + Fixed_Overhead` | 制造成本 |
| **Tooling 分摊** | `Invest × (1 + rate × years) / amort_vol` | 含息投资按销量分摊 |
| **SK** | `HK_III + 分摊 + Net_Sales × (S&A+物流+其他制造)` | 完全成本 |
| **DB I** | `Net_Sales - HK_III` | 生产毛利 |
| **DB IV** | `Net_Sales - SK` | 净利润 |
| **年降后价格** | `Base_Price × (1 - 年降率)` | LTA 调整后单价 |
| **Payback** | `总投资 / 月度净利` | 静态回收期(月) |
| **折旧率** | `1 / 折旧年限` | 直线法年折旧率 |

---

## 15. 术语对照表

| 英文术语 | 中文术语 | 缩写 | 说明 |
|---------|---------|------|------|
| Material Cost | 物料成本 | MC | 原材料成本 |
| Process Cost | 工艺成本 | PC | 加工成本 |
| Variable Process Cost | 变动工艺成本 | VPC | 随产量变化的成本 |
| Fixed Overhead | 固定制造费用 | FOH | 厂房、管理等固定成本 |
| HK III | 制造成本 | HK3 | 工厂大门成本 |
| SK | 完全成本 | SK | 含所有分摊的总成本 |
| S&A | 销售与管理费用 | SA | 管销费用 |
| MHR | Machine Hour Rate | MHR | 机时费率 |
| DB I | 边际贡献 I | DB1 | 生产毛利 |
| DB IV | 净利润 | DB4 | 最终净利润 |
| LTA | Long Term Agreement | LTA | 年降协议 |
| SOP | Start of Production | SOP | 量产开始 |
| NRE | Non-Recurring Engineering | NRE | 一次性投入 |
| Payback | 投资回收期 | - | 回收全部投资所需时间 |

---

## 16. 参数来源表映射

### 16.1 物料成本参数

| 参数 | 来源表 | 字段 |
|------|--------|------|
| `quantity` | `product_materials` | `quantity` |
| `std_price` | `materials` | `std_price` |

### 16.2 工艺成本参数

| 参数 | 来源表 | 字段 |
|------|--------|------|
| `cycle_time` | `product_processes` | `cycle_time` |
| `MHR_var` | `process_rates` | `std_mhr_var` |
| `MHR_fix` | `process_rates` | `std_mhr_fix` |
| `Labor_Rate` | `process_rates` | `std_labor_rate` |

### 16.3 投资分摊参数

| 参数 | 来源表 | 字段 |
|------|--------|------|
| `tooling_invest` | `investment_items` | `SUM(unit_cost_est × quantity)` WHERE item_type='MOLD' |
| `rnd_invest` | `investment_items` | `SUM(unit_cost_est × quantity)` WHERE item_type='R&D' |
| `interest_rate` | `amortization_strategies` | `interest_rate` |
| `duration_years` | `amortization_strategies` | `duration_years` |
| `amortization_volume` | `amortization_strategies` | `amortization_volume` |

### 16.4 Business Case 参数

| 参数 | 来源表 | 字段 |
|------|--------|------|
| `sa_rate` | `business_case_params` | `sa_rate` |
| `logistics_rate` | `business_case_params` | `logistics_rate` |
| `other_mfg_rate` | `business_case_params` | `other_mfg_rate` |
| `exchange_rate` | `business_case_params` | `exchange_rate` |
| `annual_reduction_rate` | `business_case_params` | `annual_reduction_rate` |

---

## 17. 缺失字段清单

以下字段在当前数据库设计中**缺失**，需要补充以支持完整计算：

### 17.1 必须新增的字段

| # | 表名 | 缺失字段 | 类型 | 说明 | 优先级 |
|---|------|---------|------|------|--------|
| 1 | `quote_summaries` | `fixed_overhead` | DECIMAL(10,2) | HK III 中的固定制造费用 | 🔴 高 |
| 2 | `cost_centers` | `interest_rate` | DECIMAL(5,4) | 营运资金利率，用于计算 Working Capital Interest | 🔴 高 |
| 3 | `business_case_params` | `payment_terms_days` | INT | 付款账期天数，用于计算营运资金利息 | 🔴 高 |
| 4 | `quote_summaries` | `db_1_rate` | DECIMAL(5,4) | DB I 比率(生产毛利率) | 🟡 中 |
| 5 | `quote_summaries` | `db_4_rate` | DECIMAL(5,4) | DB IV 比率(净利率) | 🟡 中 |
| 6 | `quote_summaries` | `payback_period` | DECIMAL(6,2) | 投资回收期(月) | 🟡 中 |
| 7 | `business_case_params` | `lta_mode` | VARCHAR(20) | 年降模式：cumulative(累计) 或 compound(复利) | 🟢 低 |
| 8 | `cost_centers` | `working_capital_rate` | DECIMAL(5,4) | 营运资金费率(可选备用字段) | 🟢 低 |

### 17.2 字段补充 SQL 参考

```sql
-- ============================================
-- 1. quote_summaries 表新增字段
-- ============================================
ALTER TABLE quote_summaries
ADD COLUMN fixed_overhead DECIMAL(10,2) COMMENT '固定制造费用',
ADD COLUMN db_1_rate DECIMAL(5,4) COMMENT 'DB I 比率(生产毛利率)',
ADD COLUMN db_4_rate DECIMAL(5,4) COMMENT 'DB IV 比率(净利率)',
ADD COLUMN payback_period DECIMAL(6,2) COMMENT '投资回收期(月)';

-- ============================================
-- 2. cost_centers 表新增字段
-- ============================================
ALTER TABLE cost_centers
ADD COLUMN interest_rate DECIMAL(5,4) DEFAULT 0.0600 COMMENT '营运资金年利率(默认6%)',
ADD COLUMN working_capital_rate DECIMAL(5,4) COMMENT '营运资金费率(备用)';

-- ============================================
-- 3. business_case_params 表新增字段
-- ============================================
ALTER TABLE business_case_params
ADD COLUMN payment_terms_days INT DEFAULT 90 COMMENT '付款账期(天)',
ADD COLUMN lta_mode VARCHAR(20) DEFAULT 'cumulative' COMMENT '年降模式: cumulative(累计)或compound(复利)';
```

### 17.3 字段说明

| 字段 | 用于公式 | 说明 |
|------|----------|------|
| `fixed_overhead` | HK III 计算 | 固定制造费用（厂房折旧、管理分摊等），与变动工艺成本相加得到 HK III |
| `interest_rate` | Working Capital Interest | 营运资金利息 = VP × interest_rate × (payment_terms_days / 360) |
| `payment_terms_days` | Working Capital Interest | 客户付款账期，默认 90 天 |
| `db_1_rate` | DB I 指标 | 生产毛利率 = (VP - HK_III) / VP |
| `db_4_rate` | DB IV 指标 | 净利率 = (VP - SK) / VP |
| `payback_period` | Payback 计算 | 回收期(月) = 项目总投资 / 项目月度净利 |
| `lta_mode` | 年降计算 | 年降模式：累计模式(cumulative) 或 复利模式(compound) |

---

**文档结束**

> 如有计算疑问，请参考：
> - PROJECT_CONTEXT.md (业务逻辑总纲)
> - BUSINESS_CASE_LOGIC.md (Business Case 详细逻辑)
> - PROCESS_COST_LOGIC.md (工艺成本计算逻辑)
> - DATABASE_DESIGN.md (数据库表结构)
