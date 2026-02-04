# Payback 投资回收期计算逻辑

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.2   | 2026-02-03 | 2026-02-04 | Payback 计算逻辑与 BOM 映射 | Randy Luo |

---

## 1. BOM 解析引擎：从"技术参数"到"财务科目"的映射逻辑

为了实现"自动化填充"，引擎需要通过语义匹配和规则引擎，将 BOM 中的每一行映射到财务科目的投入或收益项中。

### 1.1 资产类科目自动匹配 (Investment / Outflow)

当解析引擎识别到 BOM 中的非消耗性条目时，按以下逻辑分类：

#### 模具/工装费 (Tooling)

**识别特征：**
- 名称包含 "Mold"、"Die"、"Fixture"
- 物料类型标记为 "Asset"

**填充逻辑：**
- 自动关联至"初始投资-模具"科目
- 若系统库中有历史类似零件，自动检索该类模具的平均单价作为参考

#### 设备/产线改造 (Machine Investment)

**识别特征：**
- 工艺路线（Routing）中出现新设备名称

**填充逻辑：**
- 引擎根据"工艺费率库"中该设备的固定资产原值
- 按项目占用比例（或直接购买成本）填充至"设备投资"科目

### 1.2 运营成本自动匹配 (Operational Cost / Inflow Impact)

#### 物料成本 (Material Cost)

**填充逻辑：**
- 通过 Part Number 匹配物料库中的 Standard Price（标准价）和 VAVE Price（优化价）

#### 人工与能源 (Labor & Utility)

**填充逻辑：**
- 解析 BOM 中的"工时（Cycle Time）"参数
- 乘以"工艺费率库"中的 Labor Rate 和 Utility Rate
- 自动填充至"变动成本"科目

---

## 2. Payback（投资回收期）计算逻辑方案

在双轨系统（标准 vs VAVE）中，Payback 的核心意义在于：

> **"为了省钱而多花的投资，多久能赚回来？"**

### 2.1 核心计算公式：增量回收期

$$
Payback\ (Months) = \frac{VAVE\ 额外投资总额\ (Incremental\ Investment)}{VAVE\ 方案带来的月度毛利增量\ (Monthly\ Cash\ Inflow\ Delta)}
$$

### 2.2 计算因子详解

#### 增量投资 ($I_\Delta$)

$$
I_\Delta = (VAVE\ 方案模具费 + 验证费) - (标准方案模具费 + 验证费)
$$

#### 月度现金流入增量 ($S_\Delta$)

$$
S_\Delta = (\text{标准单价} - \text{VAVE\ 优化后单价}) \times \frac{\text{年预测产量 (EAU)}}{12}
$$

### 2.3 动态修正（可选，符合成熟企业财务规范）

**考虑折旧回拨：**
- 由于折旧是不影响现金流的成本
- 在计算 Payback 时，应将利润中扣除的折旧费加回
- 即：**现金流 = 净利 + 折旧**

**折旧数据来源（v1.4 更新）：**
- 折旧率存储在 `process_rates` 表的 `depreciation_rate` 字段中
- 标准方案使用 `std_depreciation_rate`
- VAVE 方案使用 `vave_depreciation_rate`
- 单件折旧额 = `depreciation_rate × (cycle_time / 3600)`
- 总折旧 = `Σ(各工序单件折旧额 × 产量)`

**计算示例：**
```python
# 获取工序折旧率
process_rate = get_process_rate("INJECTION_001")
std_depr_rate = process_rate.std_depreciation_rate  # 例如：8.50 元/小时

# 计算单件折旧额
cycle_time_seconds = 45  # 工时节拍（秒）
depreciation_per_unit = std_depr_rate * (cycle_time_seconds / 3600)  # 0.10625 元

# 计算总折旧（用于现金流回拨）
annual_volume = 50000
total_depreciation = depreciation_per_unit * annual_volume  # 5,312.50 元

# 现金流计算
net_profit = 150000  # 净利
cash_flow = net_profit + total_depreciation  # 155,312.50 元
```

---

## 3. 自动化流转：逻辑触发架构

为了符合"不理解代码但理解逻辑"的管理习惯，建议将逻辑封装在以下三个自动化触发器中：

### 3.1 解析触发器 (The Parser)

**Action：** Sales 上传 Excel 后
- 引擎自动识别哪些是"一次性投入"（如 €15w 模具费）
- 哪些是"持续收益"（如每件省 €2）

### 3.2 对比分析器 (The Comparator)

**Action：** 系统自动生成两条成本曲线
- 一条是"高投资、低单价"的 VAVE 方案
- 一条是"低投资、高单价"的标准方案

### 3.3 决策辅助器 (The Advisor)

**Action：** 自动计算出两条曲线的交叉点（Break-even Point）

**逻辑结论：**
| 回本时间 | 建议 |
|---------|------|
| 交叉点 < 12 个月 | 极力推荐 |
| 12 个月 ≤ 交叉点 < 24 个月 | 推荐 |
| 交叉点 ≥ 项目生命周期 | 建议放弃 VAVE，维持标准报价 |

---

## 4. 界面展示建议（供产品经理参考）

在 UI 层面，建议不要只显示一个数字（如：1.2年），而是显示一个**"回本进度条"**：

### 推荐文案格式

> **VAVE 方案评估：**
> "本项目预计在第 **14 个月** 完成增量回本，此时项目尚余 **34 个月** 生命周期，预计为公司创造额外纯利 **€ 420,000**。"

### 可视化元素建议

```
┌─────────────────────────────────────────────────────────────┐
│  投资回收期分析                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  标准方案 ──────────────────────────────────────             │
│  VAVE 方案  ╱╲                                        │
│                    ╱  ╲      (盈亏平衡点)                   │
│                ╱      ╲  ╱                                 │
│  月度差额  ─────────╱───────────────────────>               │
│                   第14个月                                 │
│                                                              │
│  回本后总收益: €420,000                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 数据模型定义

### 5.1 PaybackAnalysis 响应模型

```python
class PaybackAnalysis(BaseModel):
    """投资回收期分析结果"""

    # 投资数据
    standard_investment: Decimal      # 标准方案总投资
    vave_investment: Decimal          # VAVE 方案总投资
    incremental_investment: Decimal   # 增量投资 (可正可负)

    # 成本数据
    standard_unit_cost: Decimal       # 标准方案单件成本
    vave_unit_cost: Decimal           # VAVE 方案单件成本
    unit_cost_saving: Decimal         # 单件节省

    # 折旧数据（v1.4 新增）
    standard_depreciation_per_unit: Decimal  # 标准方案单件折旧
    vave_depreciation_per_unit: Decimal      # VAVE 方案单件折旧

    # 回本计算
    payback_months: Decimal           # 回本月数
    payback_years: Decimal            # 回本年数
    break_even_month: int             # 盈亏平衡月份

    # 现金流计算（考虑折旧回拨）
    net_profit_annual: Decimal        # 年度净利
    depreciation_annual: Decimal      # 年度折旧（用于回拨）
    cash_flow_annual: Decimal         # 年度现金流 = 净利 + 折旧

    # 生命周期收益
    project_lifecycle_months: int     # 项目生命周期（月）
    remaining_profit_after_payback: Decimal  # 回本后剩余收益

    # 决策建议
    recommendation: str               # 推荐/不推荐/谨慎
    confidence_level: float           # 置信度 0-100
```

### 5.2 投资科目映射表

| 财务科目 | BOM 识别特征 | 数据来源 |
|---------|-------------|---------|
| 初始投资-模具 | 名称含 Mold/Die/Fixture 或类型为 Asset | 物料库历史价格 |
| 初始投资-设备 | Routing 出现新设备 | 工艺费率库固定资产原值 |
| 变动成本-物料 | 消耗性物料，Part Number 匹配 | 物料库 Standard/VAVE Price |
| 变动成本-人工 | Cycle Time × Labor Rate | 工艺费率库 |
| 变动成本-能源 | Cycle Time × Utility Rate | 工艺费率库 |

---

## 6. 与 DATABASE_DESIGN.md 的关联

本计算逻辑依赖以下数据表：

| 表名 | 用途 | 相关字段 |
|------|------|---------|
| `materials` | 物料成本查询 | `std_price`, `vave_price` |
| `process_rates` | 工时费率查询 | `std_mhr_var`, `std_mhr_fix`, **`std_depreciation_rate`** 🔴 |
| `product_materials` | BOM 行项目 | `std_cost`, `vave_cost` |
| `product_processes` | 工艺路线 | `cycle_time`, `std_cost`, `vave_cost` |
| `projects` | 项目基础数据 | `annual_volume`, `target_margin` |

> **🔴 v1.4 折旧数据来源：**
> - `process_rates.std_depreciation_rate` / `vave_depreciation_rate` 存储折旧率（元/小时）
> - 单件折旧 = `depreciation_rate × (cycle_time / 3600)`
> - 用于 Payback 现金流计算：现金流 = 净利 + 折旧

---

**文档结束**
