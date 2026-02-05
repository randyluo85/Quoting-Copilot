# PROJECT_CONTEXT.md - Dr.aiVOSS 业务逻辑唯一真理源

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v2.3   | 2026-02-02 | 2026-02-05 | Dr.aiVOSS 核心契约 (不可变) | Randy Luo |

---

**版本变更记录：**
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v2.3 | 2026-02-05 | 🔴 v2.0 流程变更：VM/Sales/Controlling 职责重新划分；移除 Controlling 审核；新增多版本报价支持；v2.1 采购询价邮件化 |
| v2.2 | 2026-02-03 | 初始版本 |

---

**版本:** v2.2 (MVP)
**最后更新:** 2026-02-03
**状态:** 🔴 核心契约 (不可变)
**适用范围:** Dr.aiVOSS 智能快速报价助手 全团队

---

## 1. 🎯 系统定义 (System Definition)

| 属性 | 值 |
|------|-----|
| **产品名称** | Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot) |
| **项目代号** | SmartQuote MVP |
| **核心形态** | BOM 成本核算与 VAVE 决策辅助工具 (非单纯的 Chatbot) |
| **核心理念** | **双轨核算 (Dual-Track Calculation)** —— 系统必须始终同时计算并展示"当前标准成本 (Std)"与"VAVE 目标成本 (VAVE)"，以量化降本潜力 |

**用户角色 v2.0:**

- **VM (Value Management):** 成本报价协调者。负责创建项目、上传 BOM、完成所有成本计算（物料+工艺+投资+研发）、通知 Sales 介入。
- **Sales (销售经理):** 商业参数把控者。负责发起项目、输入商业参数（单价/汇率/年降/利润率）、计算 QS/BC/Payback、直接导出报价单。
- **Controlling (成本控制):** MHR 标准维护者。负责创建/维护 MHR 标准、维护 SK/HK 转换系数（S&A、物流包装、其他制造费用）。
- **IE (工艺工程师):** 工艺路线维护者。负责维护工艺路线模板、预估新工艺的标准工时。
- **PE (产品工程师):** 可行性评估者。负责评估图纸中的工艺可行性。
- **Procurement (采购):** 供应商价格维护者。负责维护供应商物料价格。

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

### 2.2 数据库结构

> ⚠️ **数据库 Schema 的唯一权威来源** 是 `docs/DATABASE_DESIGN.md`。
> 本节仅列出与业务逻辑密切相关的关键字段引用。

**核心实体映射：**

| 业务概念 | 对应表 | 关键字段 |
|---------|--------|---------|
| 物料主数据 | `materials` | `id` (物料编码), `std_price`, `vave_price` |
| 工序费率 | `process_rates` | `process_code`, `std_mhr`, `vave_mhr` |
| 项目 | `projects` | `id`, `project_code`, `status`, `annual_volume` |
| BOM 行 | `product_materials` | `std_cost`, `vave_cost`, `confidence` |

**状态流转（projects.status）v2.0：**
```
draft → parsing → (waiting_price | waiting_ie) → waiting_mhr →
calculated → sales_input → completed
```

**v2.0 变更说明：**
- 移除 `controlling_review` 状态
- 新增 `sales_input` 状态（Sales 输入商业参数）
- Sales 完成计算后直接进入 `completed` 状态，可导出报价单

完整表结构、索引、约束请参考 [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md)。

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
| **Frontend** | Vite 6 + React 18 + ShadcnUI + React Table (处理复杂 BOM) |
| **Backend** | Python FastAPI (利用 Pydantic 做强类型校验) |
| **AI Core** | **Parsing:** 通义千问 Qwen-Plus (阿里云 DashScope) 用于 Comments 列的特征提取<br>**Retrieval:** pgvector 用于非结构化历史报价检索 |
| **Storage** | **MySQL:** 结构化主数据<br>**PostgreSQL:** 向量数据<br>**Redis:** 缓存层 (物料价格、费率、LLM 响应) |

---

## 5. 🤖 AI 行为准则 (AI Persona for Parsing)

当调用 LLM 进行 Excel 解析时，System Prompt 必须包含：

```
Role: "你是一个拥有 10 年经验的制造业成本工程师。"
Task: "提取隐藏在备注中的工艺参数，并转化为标准的 JSON 键值对。"
Constraint: "对于不确定的参数，不要猜测，直接标记为 null。"
```

### 5.1 AI 服务配置 (阿里云 DashScope)

**模型选择：**
- **主模型**: `qwen-plus` (通义千问 Plus) - 用于特征提取和语义分析
- **备用模型**: `qwen-turbo` - 快速响应场景

**API 配置：**
```python
# 环境变量
DASHSCOPE_API_KEY=sk-xxx
DASHSCOPE_MODEL=qwen-plus
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

**成本优势：**
- ✅ 国内服务，无网络延迟
- ✅ 价格约为 Claude 3.5 的 1/5
- ✅ 兼容 OpenAI API 格式

### 5.2 Redis 缓存策略

**缓存内容：**

| 缓存键格式 | TTL | 说明 |
|-----------|-----|------|
| `material:{item_code}` | 1h | 物料主数据 |
| `rate:{process_name}` | 1h | 工艺费率 |
| `llm:parse:{hash}` | 24h | LLM 解析结果 (内容哈希) |
| `vector:search:{query_hash}` | 10min | 向量检索结果 |

**缓存伪代码：**
```python
# 物料查询优先走缓存
material = redis.get(f"material:{item_code}")
if not material:
    material = db.query(Material).filter_by(item_code=item_code).first()
    redis.setex(f"material:{item_code}", 3600, material.json())

# LLM 解析结果缓存
content_hash = hashlib.md5(comments_content.encode()).hexdigest()
cached = redis.get(f"llm:parse:{content_hash}")
if cached:
    return json.loads(cached)

result = call_qwen_api(prompt)
redis.setex(f"llm:parse:{content_hash}", 86400, json.dumps(result))
```
