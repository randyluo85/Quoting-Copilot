# Payback 投资回收期计算逻辑

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.5   | 2026-02-03 | 2026-02-05 | Payback 计算逻辑：项目静态回收期 | Randy Luo |

---

**版本变更记录：**
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.5 | 2026-02-05 | ✅ **重写逻辑**：从 VAVE 增量回收期改为项目静态回收期；新公式：Payback = 项目总投资 / 项目月度净利 |
| v1.4 | 2026-02-05 | 功能暂时下架（已回滚） |
| v1.3 | 2026-02-05 | 同步 v2.0 流程变更；MHR 费率拆分为 var/fix |
| v1.2 | 2026-02-04 | 折旧数据来源更新 |
| v1.1 | 2026-02-03 | 初始版本 |

---

## 1. 核心概念：项目静态回收期

### 1.1 定义

**Payback（投资回收期）** 回答以下问题：

> **"客户购买此产品/项目，需要多长时间收回全部投资成本？"**

### 1.2 业务场景

| 场景 | 说明 |
|------|------|
| **新设备投资** | 客户需要购买新设备/产线，报价中需要体现设备能帮客户多快回本 |
| **模具投资** | 客户需要承担模具开发费用，需要知道多久能通过产品利润收回 |
| **研发投入** | 客户承担 NRE 费用，需要评估投资回收周期 |

### 1.3 计算理念

本系统采用 **静态回收期（Static Payback Period）** 方法，不考虑货币时间价值，聚焦于：

- **简单直观**：易于向客户解释
- **保守估计**：不考虑折现，结果偏保守
- **快速决策**：作为报价决策的辅助指标

---

## 2. 核心计算公式

### 2.1 静态回收期公式

$$
Payback\ (月数) = \frac{项目总投资\ (Total\ Investment)}{项目月度净利\ (Monthly\ Net\ Profit)}
$$

### 2.2 计算因子详解

#### 项目总投资 (Total Investment, $I_{total}$)

$$
I_{total} = I_{tooling} + I_{rnd} + I_{equipment} + I_{other}
$$

| 组成项 | 说明 | 数据来源 |
|--------|------|----------|
| $I_{tooling}$ | 模具/检具/夹具投入 | `investment_items` 表（MOLD/GAUGE/JIG/FIXTURE） |
| $I_{rnd}$ | 研发投入 | `business_case_params.rnd_invest` |
| $I_{equipment}$ | 设备投入（如有） | `investment_items` 表（EQUIPMENT） |
| $I_{other}$ | 其他一次性投入 | `investment_items` 表（OTHER） |

#### 项目月度净利 (Monthly Net Profit, $P_{monthly}$)

$$
P_{monthly} = (Price_{quoted} - Cost_{unit}) \times \frac{Volume_{annual}}{12}
$$

| 变量 | 说明 | 数据来源 |
|------|------|----------|
| $Price_{quoted}$ | 报价单价 | `quote_summaries.quoted_price` / 年量 |
| $Cost_{unit}$ | 单件完全成本 (SK) | `quote_summaries.sk_cost` / 年量 |
| $Volume_{annual}$ | 年销量 | `projects.annual_volume` |

### 2.3 考虑摊销后的净利

如果使用摊销模式（如前 3 年摊销），月度净利应扣除摊销额：

$$
P_{monthly} = (Price_{quoted} \times Volume_{monthly}) - Cost_{total\_monthly} - Amortization_{monthly}
$$

其中：
- $Cost_{total\_monthly}$ = 月度物料成本 + 月度工艺成本 + 月度 S&A 费用
- $Amortization_{monthly}$ = 月度摊销额（从摊销策略表获取）

---

## 3. 数据来源与映射

### 3.1 投资数据来源

| 数据项 | 表名 | 字段 |
|--------|------|------|
| 模具投入 | `investment_items` | `unit_cost_est × quantity`（item_type = MOLD） |
| 检具投入 | `investment_items` | `unit_cost_est × quantity`（item_type = GAUGE） |
| 夹具投入 | `investment_items` | `unit_cost_est × quantity`（item_type = JIG/FIXTURE） |
| 研发投入 | `business_case_params` | `rnd_invest` |
| 摊销策略 | `amortization_strategies` | `mode, duration_months` |

### 3.2 成本数据来源

| 数据项 | 表名 | 字段 |
|--------|------|------|
| 物料成本 | `product_materials` | `SUM(std_cost × quantity)` |
| 工艺成本 | `product_processes` | `SUM(std_cost)` |
| HK III | `quote_summaries` | `hk_3_cost` |
| SK 成本 | `quote_summaries` | `sk_cost`（含 S&A、物流包装、其他制造费用） |
| 报价 | `quote_summaries` | `quoted_price` |

### 3.3 销量数据来源

| 数据项 | 表名 | 字段 |
|--------|------|------|
| 年销量 | `projects` | `annual_volume` |
| 月销量 | 计算 | `annual_volume / 12` |
| 逐年销量 | `business_case_years` | `volume, reduction_rate` |

---

## 4. 计算示例

### 4.1 简单场景示例

**项目背景：**
- 客户：博世汽车部件（苏州）有限公司
- 产品：制动管路总成
- 年销量：120,000 件
- 报价单价：¥ 5.00 / 件

**投资明细：**
| 项目 | 金额 |
|------|------|
| 模具投入 | ¥ 150,000 |
| 检具投入 | ¥ 30,000 |
| 研发投入 | ¥ 50,000 |
| **总投资** | **¥ 230,000** |

**成本明细：**
| 项目 | 年度金额 | 单件金额 |
|------|----------|----------|
| 物料成本 | ¥ 360,000 | ¥ 3.00 |
| 工艺成本 | ¥ 120,000 | ¥ 1.00 |
| HK III | ¥ 480,000 | ¥ 4.00 |
| S&A (2%) | ¥ 12,000 | ¥ 0.10 |
| **SK 成本** | **¥ 492,000** | **¥ 4.10** |

**回收期计算：**

```python
# 年度数据
annual_volume = 120000
annual_revenue = 5.00 * 120000 = 600000      # 年收入
annual_cost = 4.10 * 120000 = 492000        # 年成本
annual_profit = annual_revenue - annual_cost = 108000  # 年净利

# 月度数据
monthly_profit = annual_profit / 12 = 9000  # 月净利 ¥9,000

# 回收期
total_investment = 230000
payback_months = total_investment / monthly_profit  # 25.56 月
payback_years = payback_months / 12  # 2.13 年
```

**结果：** 客户需要约 **26 个月（2.13 年）** 收回全部投资。

### 4.2 带摊销的场景示例

**摊销模式：** 前 3 年摊销，年均摊销额 ¥ 80,000

**调整后的月度净利：**

```python
# 计算摊销前月度净利
monthly_profit_before_amort = 9000

# 计算月度摊销额
amortization_annual = 80000
amortization_monthly = amortization_annual / 12 = 6666.67

# 摊销后月度净利
monthly_profit_after_amort = monthly_profit_before_amort - amortization_monthly
monthly_profit_after_amort = 9000 - 6666.67 = 2333.33

# 回收期（从客户视角，摊销是成本的一部分）
payback_months = 230000 / 2333.33 = 98.57 月  # 约 8.2 年
```

**注意：** 此场景下，回收期较长，可能需要调整报价或摊销策略。

---

## 5. 数据模型定义

### 5.1 PaybackAnalysis 响应模型

```python
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional

class PaybackAnalysis(BaseModel):
    """项目静态回收期分析结果"""

    # 基础信息
    project_id: str
    project_name: str
    annual_volume: int

    # 投资数据
    tooling_investment: Decimal         # 模具投入
    gauge_investment: Decimal           # 检具投入
    fixture_investment: Decimal         # 夹具投入
    rnd_investment: Decimal             # 研发投入
    total_investment: Decimal           # 总投资

    # 收入与成本
    quoted_price: Decimal               # 报价单价
    unit_cost: Decimal                  # 单件成本 (SK)
    unit_hk3_cost: Decimal              # 单件 HK III
    unit_sa_cost: Decimal               # 单件 S&A 费用
    annual_revenue: Decimal             # 年收入
    annual_cost: Decimal                # 年成本
    annual_profit: Decimal              # 年净利

    # 摊销信息（如适用）
    amortization_mode: Optional[str]    # 摊销模式
    amortization_period: Optional[int]  # 摊销期限（月）
    monthly_amortization: Optional[Decimal]  # 月摊销额

    # 回收期计算
    monthly_profit: Decimal             # 月度净利
    payback_months: Decimal             # 回收期（月）
    payback_years: Decimal              # 回收期（年）

    # 决策建议
    recommendation: str                 # 推荐等级
    recommendation_reason: str          # 推荐理由

    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "PRJ-2024-001",
                "project_name": "制动管路总成报价",
                "annual_volume": 120000,
                "tooling_investment": 150000,
                "gauge_investment": 30000,
                "fixture_investment": 0,
                "rnd_investment": 50000,
                "total_investment": 230000,
                "quoted_price": 5.00,
                "unit_cost": 4.10,
                "unit_hk3_cost": 4.00,
                "unit_sa_cost": 0.10,
                "annual_revenue": 600000,
                "annual_cost": 492000,
                "annual_profit": 108000,
                "amortization_mode": None,
                "monthly_profit": 9000,
                "payback_months": 25.56,
                "payback_years": 2.13,
                "recommendation": "推荐",
                "recommendation_reason": "回收期约 26 个月，在可接受范围内"
            }
        }
```

### 5.2 推荐等级定义

| 等级 | 回收期 | 建议 |
|------|--------|------|
| **极力推荐** | ≤ 12 个月 | 回收期极短，投资回报快 |
| **推荐** | 12 - 24 个月 | 回收期适中，风险可控 |
| **谨慎** | 24 - 36 个月 | 回收期较长，需评估客户风险承受能力 |
| **不推荐** | > 36 个月 | 回收期过长，建议调整报价或投资策略 |

---

## 6. 与 DATABASE_DESIGN.md 的关联

本计算逻辑依赖以下数据表：

| 表名 | 用途 | 相关字段 |
|------|------|---------|
| `projects` | 项目基础数据 | `annual_volume`, `factory_id` |
| `investment_items` | 投资明细 | `item_type`, `unit_cost_est`, `quantity` |
| `business_case_params` | 业务参数 | `tooling_invest`, `rnd_invest` |
| `amortization_strategies` | 摊销策略 | `mode`, `duration_months`, `calculated_unit_add` |
| `quote_summaries` | 报价汇总 | `quoted_price`, `hk_3_cost`, `sk_cost` |
| `business_case_years` | 年度数据 | `volume`, `reduction_rate` |

---

## 7. 界面展示建议

### 7.1 推荐文案格式

> **项目投资回收期分析：**
> "本项目总投资 **¥ 230,000**，预计在第 **26 个月**（约 **2.1 年**）完成投资回收。
> 月均净利 **¥ 9,000**，年净利 **¥ 108,000**。"

### 7.2 可视化元素建议

```
┌─────────────────────────────────────────────────────────────┐
│  投资回收期分析                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  总投资: ¥230,000                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 回收期进度                                           │    │
│  │ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  26/36 月   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  📊 财务摘要：                                                │
│  • 年收入：¥600,000                                           │
│  • 年成本：¥492,000                                          │
│  • 年净利：¥108,000                                          │
│  • 月净利：¥9,000                                            │
│                                                              │
│  💡 建议：推荐（回收期在可接受范围内）                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. API 端点设计

### 8.1 计算回收期

**POST** `/api/v1/payback/calculate`

**请求体：**
```json
{
  "project_id": "PRJ-2024-001",
  "version_number": 1.0
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "project_id": "PRJ-2024-001",
    "total_investment": 230000,
    "monthly_profit": 9000,
    "payback_months": 25.56,
    "payback_years": 2.13,
    "recommendation": "推荐",
    "recommendation_reason": "回收期约 26 个月，在可接受范围内"
  }
}
```

---

**文档结束**
