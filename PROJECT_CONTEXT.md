# PROJECT_CONTEXT.md - SmartQuote 业务逻辑唯一真理源

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v2.0   | 2026-02-02 | 2026-02-02 | SmartQuote 核心契约 (不可变) | Randy Luo |

---

**版本:** v2.0 (MVP)
**最后更新:** 2026-02-02
**状态:** 🔴 核心契约 (不可变)
**适用范围:** SmartQuote (Dr.aiVOSS) 全团队

---

## 1. 🎯 系统定义 (System Definition)

| 属性 | 值 |
|------|-----|
| **项目名称** | SmartQuote (智能报价系统) |
| **核心形态** | BOM 成本核算与 VAVE 决策辅助工具 (非单纯的 Chatbot) |
| **核心理念** | **双轨核算 (Dual-Track Calculation)** —— 系统必须始终同时计算并展示"当前标准成本 (Std)"与"VAVE 目标成本 (VAVE)"，以量化降本潜力 |

**用户角色:**

- **Admin (成本工程师):** 数据的守护者。负责维护 `Material_Master` 和 `Process_Rates`。
- **User (销售经理):** 数据的消费者。负责上传 BOM，审核 AI 结果，导出报价单。

---

## 2. 🧱 全局数据字典 (Global Data Schema)

> ⚠️ **警告:** 本章节定义的 Schema 是数据库和 API 的唯一真理。所有开发任务严禁修改字段名或类型，除非经过技术负责人批准。

### 2.1 核心值对象 (Value Objects)

所有涉及金额的计算，必须使用此结构：

```json
// PricePair: 双轨价格封装
{
  "std": "Decimal (标准成本)",
  "vave": "Decimal (目标成本)",
  "savings": "Decimal (std - vave)",
  "savings_rate": "Float (savings / std)"
}
```

### 2.2 数据库实体 (Database Entities - MySQL)

**Table: `materials` (物料主数据)**

| 字段 | 类型 | 说明 |
|------|------|------|
| `item_code` | PK, String | 唯一物料号 (e.g., "100-200-300") |
| `std_price` | Decimal | 标准采购/生产价 |
| `vave_price` | Decimal | VAVE 优化后的目标价 |
| `supplier_tier` | String | 供应商等级 |

**Table: `process_rates` (工艺费率)**

| 字段 | 类型 | 说明 |
|------|------|------|
| `process_name` | PK, String | 工艺名称 (e.g., "激光切割", "折弯") |
| `std_mhr`, `std_labor` | Decimal | 标准费率 |
| `vave_mhr`, `vave_labor` | Decimal | 优化费率 (用于模拟高效率设备/产线) |
| `efficiency_factor` | Decimal | 效率系数 (Default 1.0) |

### 2.3 业务实体 (Transaction Entities)

**Object: `BOMLineItem` (BOM 行)**

| 字段 | 类型 | 说明 |
|------|------|------|
| `raw_data` | Object | 原始 Excel 行数据 |
| `features` | JSON | AI 从 Comments 提取的特征, e.g. `{"bending": 32}` |
| `match_type` | Enum | `Exact`, `Semantic`, `None` |
| `status_light` | Enum | `Green`, `Yellow`, `Red` |
| `total_cost` | PricePair Object | 双轨总成本 |

---

## 3. 🧠 核心业务逻辑 (Business Logic)

### 3.1 双轨计算公式 (The Golden Formula)

后端计算服务必须严格执行以下两套公式并行计算：

**Standard Cost (当前):**
$$ Cost_{std} = (Qty \times MaterialPrice_{std}) + \sum (CycleTime \times (MHR_{std} + Labor_{std})) $$

**VAVE Cost (目标):**
$$ Cost_{vave} = (Qty \times MaterialPrice_{vave}) + \sum (CycleTime_{opt} \times (MHR_{vave} + Labor_{vave})) $$

> **注:** `CycleTime_opt` 由 AI 基于最佳实践推荐，或默认为 `CycleTime * 0.9`。

### 3.2 红绿灯置信度逻辑 (Traffic Light Logic)

| 状态 | 条件 |
|------|------|
| 🟢 **Green** (自动通过) | 物料号在 `materials` 表中完全匹配，且价格在有效期内 |
| 🟡 **Yellow** (人工复核) | 物料号未匹配，但 AI 通过 PartName + Spec 在向量库 (pgvector) 中找到相似度 > 85% 的历史物料；或使用了 AI 从 Comments 估算的工艺参数（如 AI 识别出"32次折弯"，需人工确认次数是否准确） |
| 🔴 **Red** (人工介入) | 库中无数据，且 AI 无法找到相似品。必须由人工输入询价结果 |

---

## 4. 🏗️ 技术栈约束 (Tech Stack)

| 层级 | 技术 |
|------|------|
| **Frontend** | Next.js (App Router) + ShadcnUI + React Table (处理复杂 BOM) |
| **Backend** | Python FastAPI (利用 Pydantic 做强类型校验) |
| **AI Core** | **Parsing:** LLM (Claude 3.5 Sonnet / GPT-4o) 用于 Comments 列的特征提取<br>**Retrieval:** pgvector 用于非结构化历史报价检索 |
| **Storage** | **MySQL:** 结构化主数据<br>**PostgreSQL:** 向量数据 |

---

## 5. 🤖 AI 行为准则 (AI Persona for Parsing)

当调用 LLM 进行 Excel 解析时，System Prompt 必须包含：

```
Role: "你是一个拥有 10 年经验的制造业成本工程师。"
Task: "提取隐藏在备注中的工艺参数，并转化为标准的 JSON 键值对。"
Constraint: "对于不确定的参数，不要猜测，直接标记为 null。"
```
