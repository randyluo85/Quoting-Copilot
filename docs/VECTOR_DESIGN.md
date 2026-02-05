# Dr.aiVOSS 向量化数据架构设计

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-05 | 2026-02-05 | Dr.aiVOSS 向量化数据架构设计 | Randy Luo |

---

## 📋 变更日志 (Changelog)

| 日期 | 版本 | 变更内容 | 影响范围 |
|------|------|---------|---------|
| 2026-02-05 | v1.0 | 初始版本，定义向量化数据架构 | 新增功能 |

---

## 1. 设计概述 {#overview}

### 1.1 核心目标

Dr.aiVOSS 向量化架构服务于两个核心业务场景：

| 场景 | 说明 | 业务价值 |
|------|------|----------|
| **物料清洗匹配** | 当 VM 上传 BOM 时，系统自动将 `PA66-GF30 Housing` 匹配到标准库中的 `Housing, Polyamide 66 30% GF` | 减少人工核对工作量，提升匹配准确率 |
| **产品复用检索** | 当新项目进来时，根据 BOM 结构快速找到历史相似项目，复用其工艺路线和 MHR | 缩短新项目报价周期，保证成本一致性 |

### 1.2 双索引策略

```
┌─────────────────────────────────────────────────────────────┐
│                    向量化数据架构                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐      ┌─────────────────────┐      │
│  │  微观层：单物料      │      │  宏观层：产品指纹    │      │
│  │  Material Embedding │      │  Product Fingerprint│      │
│  ├─────────────────────┤      ├─────────────────────┤      │
│  │ • name              │      │ • product_name      │      │
│  │ • material          │      │ • 关键组件列表       │      │
│  │ • remarks           │      │ • 工艺名称序列       │      │
│  │ • material_type     │      │ • 工艺特征关键词     │      │
│  └─────────────────────┘      └─────────────────────┘      │
│           ↓                             ↓                    │
│  ┌─────────────────────┐      ┌─────────────────────┐      │
│  │  material_vectors   │      │  product_vectors    │      │
│  │  (物料清洗匹配)      │      │  (历史方案复用)      │      │
│  └─────────────────────┘      └─────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 业务场景 {#business-scenarios}

### 2.1 物料清洗匹配 {#material-matching}

**触发时机**：VM 上传 Excel BOM 文件后

**业务流程**：
```
1. 系统解析 BOM，提取物料信息
2. 尝试精确匹配（物料号完全一致）
   ├─ 匹配成功 → 🟢 Green 状态
   └─ 匹配失败 ↓
3. 执行向量语义搜索
   ├─ 相似度 > 85% → 🟡 Yellow 状态（需人工确认）
   └─ 相似度 ≤ 85% → 🔴 Red 状态（需人工输入）
```

**示例**：
| BOM 中的物料 | 标准库匹配结果 | 相似度 | 状态 |
|-------------|---------------|--------|------|
| `PA66-GF30 Housing` | `Housing, Polyamide 66 30% GF` | 92% | 🟡 待确认 |
| `Steel Tube 6mm` | `Steel Tube 6mm DIN 2391` | 100% | 🟢 自动通过 |
| `XYZ-123 Custom Part` | 无匹配结果 | - | 🔴 待输入 |

### 2.2 产品复用检索 {#product-reuse}

**触发时机**：创建新项目，添加产品后

**业务流程**：
```
1. 系统根据新产品的 BOM 结构生成指纹向量
2. 在历史产品向量库中搜索相似产品
3. 返回 Top 3 相似产品及以下信息：
   • 相似度评分
   • 历史工艺路线
   • 标准 MHR 参考
   • 成本结构对比
4. VM 可选择复用历史工艺路线
```

**示例**：
| 新产品 | Top 1 相似产品 | 相似度 | 可复用信息 |
|--------|---------------|--------|-----------|
| `Front Brake Line Assy` | `Brake Line Assembly - 2024-Q1` | 89% | 工艺路线、MHR 费率 |
| `Rear Suspension Arm` | `Suspension Arm - 2023-Q4` | 76% | 部分工序参考 |

---

## 3. 向量表设计 {#vector-tables}

> **技术栈**：PostgreSQL 16 + pgvector 扩展
> **向量维度**：1536（OpenAI text-embedding-ada-002）或根据模型调整
> **相似度计算**：余弦距离（Cosine Distance）

### 3.1 material_vectors（物料向量表）{#material-vectors}

**用途**：存储物料主数据的语义向量，用于 BOM 物料清洗匹配

#### 表结构

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| material_id | VARCHAR(50) | FK, NOT NULL, UNIQUE | 关联 materials.id |
| embedding | vector(1536) | NOT NULL | 物料语义向量 |
| embedding_text | TEXT | NOT NULL | 用于生成向量的汇集文本（快照） |
| embedding_model | VARCHAR(50) | DEFAULT 'text-embedding-ada-002' | 使用的嵌入模型 |
| similarity_threshold | DECIMAL(3,2) | DEFAULT 0.85 | 相似度阈值 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

#### 外键关系
```sql
ALTER TABLE material_vectors
ADD CONSTRAINT fk_mv_material
FOREIGN KEY (material_id) REFERENCES materials(id)
ON DELETE CASCADE;
```

#### 索引设计
```sql
-- pgvector HNSW 索引（高性能近似最近邻搜索）
CREATE INDEX idx_mv_embedding_hnsw
ON material_vectors USING hnsw (embedding vector_cosine_ops);

-- 物料 ID 索引
CREATE INDEX idx_mv_material_id ON material_vectors(material_id);
```

#### 示例数据
| material_id | embedding_text |
|-------------|----------------|
| `MAT-001` | `Name: Housing; Material: Polyamide 66 30% Glass Fiber; Type: Made; Remarks: High temp resistance` |
| `MAT-002` | `Name: Steel Tube; Material: Stainless Steel 304; Type: Bought; Remarks: DIN 2391 standard` |

---

### 3.2 product_vectors（产品向量表）{#product-vectors}

**用途**：存储产品 BOM 指纹向量，用于历史相似产品检索

#### 表结构

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| product_id | CHAR(36) | FK, NOT NULL, UNIQUE | 关联 project_products.id |
| embedding | vector(1536) | NOT NULL | 产品指纹向量 |
| fingerprint_text | TEXT | NOT NULL | 用于生成向量的汇集文本（快照） |
| embedding_model | VARCHAR(50) | DEFAULT 'text-embedding-ada-002' | 使用的嵌入模型 |
| similarity_threshold | DECIMAL(3,2) | DEFAULT 0.80 | 相似度阈值 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

#### 外键关系
```sql
ALTER TABLE product_vectors
ADD CONSTRAINT fk_pv_product
FOREIGN KEY (product_id) REFERENCES project_products(id)
ON DELETE CASCADE;
```

#### 索引设计
```sql
-- pgvector HNSW 索引
CREATE INDEX idx_pv_embedding_hnsw
ON product_vectors USING hnsw (embedding vector_cosine_ops);

-- 产品 ID 索引
CREATE INDEX idx_pv_product_id ON product_vectors(product_id);
```

#### 示例数据
| product_id | fingerprint_text |
|------------|------------------|
| `PROD-001` | `Product: Front Brake Line Assy. Key Components: [Steel Tube 6mm, M12 Connector, Rubber Hose]. Process Flow: [Cutting, CNC Bending, End Forming, Manual Assembly, Leak Testing]. Features: [Zinc Coating, 3000bar pressure test]` |

---

## 4. 字段汇集规则 {#field-aggregation}

> ⚠️ **关键原则**：不要把整个 JSON 树丢进去。只保留语义相关的核心字段，排除数值型噪音。

### 4.1 物料层汇集策略 {#material-aggregation}

**数据源表**：`materials`（物料主数据表）

#### 包含字段（语义相关）

| 核心字段 | 字段名 (DB) | 权重 | 处理方式 |
|:---|:---|:---|:---|
| **物料名称** | `name` | ⭐⭐⭐ 最高 | 放在文本首部，作为核心标识 |
| **材料描述** | `material` | ⭐⭐ 高 | 作为补充描述，决定物理属性 |
| **备注/规格** | `remarks` | ⭐⭐ 高 | 提取工艺暗示（如"镀锌"、"热处理"） |
| **物料类型** | `material_type` | ⭐ 中 | 辅助上下文，避免跨类型错误匹配 |

#### 排除字段（噪音）

| 字段 | 排除理由 |
|:---|:---|
| `id`, `created_at`, `updated_at` | 无语义意义 |
| `std_price` | 价格随市场波动，但物料物理属性不变。**不要让价格影响相似度匹配** |
| `supplier` | 供应商信息不影响物料本身的物理属性 |
| `quantity` | 数量是交易属性，不是物料属性 |

#### 汇集函数示例

```python
def create_material_embedding_text(row: dict) -> str:
    """
    为物料生成用于 Embedding 的文本

    Args:
        row: materials 表的一行数据

    Returns:
        汇集后的文本
    """
    parts = []

    # 核心标识（最高权重）
    if row.get('name'):
        parts.append(f"Name: {row['name']}")

    # 材料描述
    if row.get('material'):
        parts.append(f"Material: {row['material']}")

    # 物料类型（辅助上下文）
    if row.get('material_type'):
        type_label = "Made" if row['material_type'] == 'made' else "Bought"
        parts.append(f"Type: {type_label}")

    # 备注/规格
    if row.get('remarks'):
        parts.append(f"Remarks: {row['remarks']}")

    return "; ".join(parts)
```

#### 汇集文本示例

```text
Name: Housing; Material: Polyamide 66 30% Glass Fiber; Type: Made; Remarks: High temp resistance, zinc plated
```

---

### 4.2 产品层汇集策略 {#product-aggregation}

**数据源表**：`project_products`（产品头） + `product_materials`（组件） + `product_processes`（工艺）

#### 包含字段（语义相关）

| 核心维度 | 来源字段 | 权重 | 汇集策略 |
|:---|:---|:---|:---|
| **产品名称** | `project_products.product_name` | ⭐⭐⭐ | 提供高层级上下文 |
| **关键组件** | `product_materials.material_name` | ⭐⭐⭐ | **仅 Level 1 的关键物料**，忽略标准件 |
| **主工艺流** | `product_processes.process_name` | ⭐⭐⭐ | 去重后的工艺名称序列 |
| **工艺特征** | `product_materials.remarks` | ⭐⭐ | 提取 BOM 中的工艺关键词 |

#### 排除字段（噪音）

| 字段 | 排除理由 |
|:---|:---|
| `quantity` | 数量差异（1米 vs 1.2米）不改变工艺路线本质 |
| `product_code` | 客户零件号通常是乱码或无规律数字 |
| `cycle_time_std` | 工时数值差异不影响工艺路线类型 |
| `std_cost` | 成本金额不影响工艺路线相似度 |

#### 汇集函数示例

```python
def create_product_fingerprint(
    product_name: str,
    bom_rows: list[dict],
    process_rows: list[dict]
) -> str:
    """
    为产品生成用于 Embedding 的指纹文本

    Args:
        product_name: 产品名称
        bom_rows: product_materials 数据
        process_rows: product_processes 数据

    Returns:
        汇集后的指纹文本
    """
    parts = []

    # 产品名称
    if product_name:
        parts.append(f"Product: {product_name}")

    # 关键组件（仅 Level 1，过滤低价值标准件）
    key_materials = []
    standard_part_keywords = ['screw', 'bolt', 'nut', 'washer', 'seal', 'o-ring']

    for row in bom_rows:
        # 仅 Level 1 物料
        if row.get('material_level') != 1:
            continue

        # 排除标准件
        material_name_lower = row.get('material_name', '').lower()
        if any(kw in material_name_lower for kw in standard_part_keywords):
            continue

        key_materials.append(row.get('material_name'))

    if key_materials:
        parts.append(f"Key Components: [{', '.join(key_materials)}]")

    # 工艺流（去重，按顺序）
    process_flow = []
    seen_processes = set()

    for row in sorted(process_rows, key=lambda x: x.get('sequence_order', 0)):
        proc_name = row.get('process_name')
        if proc_name and proc_name not in seen_processes:
            process_flow.append(proc_name)
            seen_processes.add(proc_name)

    if process_flow:
        parts.append(f"Process Flow: [{', '.join(process_flow)}]")

    # 工艺特征（从 BOM remarks 提取）
    features = []
    for row in bom_rows:
        remarks = row.get('remarks', '')
        if remarks and any(kw in remarks.lower() for kw in ['weld', 'coat', 'test', 'heat']):
            features.append(remarks[:50])  # 限制长度

    if features:
        parts.append(f"Features: [{', '.join(features)}]")

    return ". ".join(parts)
```

#### 汇集文本示例

```text
Product: Front Brake Line Assy. Key Components: [Steel Tube 6mm, M12 Connector, Rubber Hose]. Process Flow: [Cutting, CNC Bending, End Forming, Manual Assembly, Leak Testing]. Features: [Zinc Coating, 3000bar pressure test]
```

---

## 5. 向量索引设计 {#index-design}

### 5.1 HNSW 索引参数

**HNSW（Hierarchical Navigable Small World）** 是 pgvector 推荐的索引类型，平衡了查询速度和准确率。

```sql
-- 物料向量索引
CREATE INDEX idx_mv_embedding_hnsw
ON material_vectors
USING hnsw (embedding vector_cosine_ops)
WITH (
    m = 16,        -- 每层最多连接数 (default: 16)
    ef_construction = 64  -- 构建时的候选数 (default: 64)
);

-- 产品向量索引
CREATE INDEX idx_pv_embedding_hnsw
ON product_vectors
USING hnsw (embedding vector_cosine_ops)
WITH (
    m = 16,
    ef_construction = 64
);
```

### 5.2 查询参数调优

```sql
-- 运行时设置 ef_size（越大越准确，但越慢）
SET hnsw.ef_search = 100;  -- default: 40

-- 查询示例
SELECT material_id,
       1 - (embedding <=> :query_vector) AS similarity
FROM material_vectors
WHERE 1 - (embedding <=> :query_vector) > 0.85
ORDER BY similarity DESC
LIMIT 5;
```

---

## 6. API 端点定义 {#api-endpoints}

### 6.1 向量搜索 - 物料

**POST** `/api/v1/vector/materials/search`

搜索与给定文本语义相似的物料。

#### 请求体
```json
{
  "query": "PA66-GF30 Housing",
  "limit": 5,
  "min_similarity": 0.85,
  "material_type_filter": "made"
}
```

#### 响应
```json
{
  "success": true,
  "data": {
    "query_embedding": [0.0123, ...],
    "results": [
      {
        "material_id": "MAT-001",
        "name": "Housing, Polyamide 66 30% GF",
        "material": "PA66-GF30",
        "std_price": 28.50,
        "similarity": 0.92,
        "match_type": "semantic"
      }
    ],
    "total_results": 3
  }
}
```

---

### 6.2 向量搜索 - 产品

**POST** `/api/v1/vector/products/search`

搜索与给定 BOM 结构相似的历史产品。

#### 请求体
```json
{
  "product_name": "Front Brake Line Assy",
  "bom_materials": [
    {"name": "Steel Tube 6mm", "level": 1},
    {"name": "M12 Connector", "level": 1}
  ],
  "processes": ["Cutting", "CNC Bending", "Assembly"],
  "limit": 3,
  "min_similarity": 0.80
}
```

#### 响应
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "product_id": "PROD-001",
        "project_name": "Brake Line Project 2024-Q1",
        "similarity": 0.89,
        "processes": ["Cutting", "CNC Bending", "End Forming", "Assembly"],
        "avg_mhr": 75.50
      }
    ],
    "total_results": 2
  }
}
```

---

### 6.3 同步向量 - 物料

**POST** `/api/v1/vector/materials/sync`

为指定物料生成/更新向量嵌入。

#### 请求体
```json
{
  "material_ids": ["MAT-001", "MAT-002"],
  "force_rebuild": false
}
```

#### 响应
```json
{
  "success": true,
  "data": {
    "synced": 2,
    "failed": 0,
    "details": [
      {"material_id": "MAT-001", "status": "created"},
      {"material_id": "MAT-002", "status": "updated"}
    ]
  }
}
```

---

### 6.4 同步向量 - 产品

**POST** `/api/v1/vector/products/sync`

为指定产品生成/更新指纹向量。

#### 请求体
```json
{
  "product_ids": ["PROD-001"],
  "force_rebuild": false
}
```

#### 响应
```json
{
  "success": true,
  "data": {
    "synced": 1,
    "failed": 0,
    "details": [
      {"product_id": "PROD-001", "status": "updated"}
    ]
  }
}
```

---

## 7. 实现建议 {#implementation}

### 7.1 Embedding 模型选择

| 模型 | 维度 | 语言 | 推荐 |
|------|------|------|------|
| **text-embedding-ada-002** | 1536 | 多语言 | ⭐⭐⭐ 推荐 |
| **通义千问 Embedding** | 1024 | 中英 | ⭐⭐ 备选 |
| **bge-large-zh** | 1024 | 中文 | ⭐ 备选 |

### 7.2 数据同步策略

```python
# 伪代码：异步向量同步
@receiver(post_save, sender=Material)
def sync_material_vector(sender, instance, created, **kwargs):
    """物料保存后异步生成向量"""
    if created or instance.has_tracked_changes():
        async_task(
            'vector.sync_material',
            material_id=instance.id
        )

@receiver(post_save, sender=ProductMaterial)
@receiver(post_save, sender=ProductProcess)
def sync_product_fingerprint(sender, instance, **kwargs):
    """BOM 或工艺变更后重新生成产品指纹"""
    async_task(
        'vector.sync_product',
        product_id=instance.project_product_id
    )
```

### 7.3 缓存策略

| 缓存键 | TTL | 说明 |
|--------|-----|------|
| `vector:search:{hash}` | 10min | 向量检索结果 |
| `vector:embedding:{material_id}` | 24h | 物料向量嵌入 |
| `vector:fingerprint:{product_id}` | 24h | 产品指纹向量 |

### 7.4 监控指标

- 向量生成成功率（目标：> 99%）
- 平均搜索响应时间（目标：< 500ms）
- 缓存命中率（目标：> 60%）

---

## 8. 参考文档

- [DATABASE_DESIGN.md](DATABASE_DESIGN.md) - 数据库结构设计
- [API_REFERENCE.md](API_REFERENCE.md) - API 完整参考
- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) - 业务逻辑核心契约

---

**文档结束**
