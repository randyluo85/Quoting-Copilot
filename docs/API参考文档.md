# Dr.aiVOSS API 完整参考

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.3   | 2026-02-03 | 2026-02-05 | Dr.aiVOSS API 完整参考 | Randy Luo |

---

## 1. API 基础信息

### 1.1 基础配置

| 属性 | 值 |
|------|-----|
| Base URL | `http://localhost:8000/api/v1` |
| 协议 | HTTP/HTTPS |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | Bearer Token (待实现) |
| API 版本 | v1 |

### 1.2 通用响应格式

**成功响应:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**错误响应:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "annual_volume",
        "message": "Must be greater than 0"
      }
    ]
  }
}
```

---

## 2. API 端点列表

### 2.1 项目管理 (Projects)

| 方法 | 端点 | 功能 | 认证 |
|------|------|------|------|
| GET | `/projects` | 获取项目列表 | 🟡 需要 |
| POST | `/projects` | 创建新项目 | 🟡 需要 |
| GET | `/projects/{id}` | 获取项目详情 | 🟡 需要 |
| PUT | `/projects/{id}` | 更新项目 | 🟡 需要 |
| DELETE | `/projects/{id}` | 删除项目 | 🔒 管理员 |
| POST | `/projects/sync` | 从 PM 软件同步 | 🔒 管理员 |

#### GET /projects

**请求参数:**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页数量，默认 20 |
| status | str | 否 | 状态过滤 |
| search | str | 否 | 项目名称搜索 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "PRJ-2024-001",
        "project_code": "AS-2024-001",
        "project_name": "发动机缸体零部件报价",
        "customer_name": "博世汽车部件（苏州）有限公司",
        "customer_code": "BOSCH-2024-Q1",
        "annual_volume": 120000,
        "status": "in-progress",
        "target_margin": 15.0,
        "created_at": "2026-02-01T10:00:00Z",
        "updated_at": "2026-02-03T15:30:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "size": 20
  }
}
```

#### POST /projects

**请求体:**
```json
{
  "project_name": "新项目名称",
  "project_code": "AS-2024-002",
  "customer_name": "客户名称",
  "customer_code": "CUSTOMER-001",
  "annual_volume": 50000,
  "target_margin": 12.5,
  "owners": {
    "sales": "张三",
    "vm": "李四",
    "ie": "王五",
    "pe": "赵六",
    "controlling": "钱七"
  }
}
```

---

### 2.2 BOM 管理 (BOM)

| 方法 | 端点 | 功能 | 认证 |
|------|------|------|------|
| POST | `/bom/upload` | 上传并解析 BOM 文件 | 🟡 需要 |
| GET | `/bom/{projectId}/materials` | 获取物料清单 | 🟡 需要 |
| GET | `/bom/{projectId}/processes` | 获取工艺清单 | 🟡 需要 |
| PUT | `/bom/{projectId}/materials/{id}` | 更新物料行 | 🟡 需要 |

#### POST /bom/upload

**请求:**
- Content-Type: `multipart/form-data`
- Body: `file` (Excel/CSV 文件)
- Query: `projectId` (项目 ID)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "parse_id": "parse-123",
    "status": "completed",
    "summary": {
      "total_rows": 150,
      "parsed_rows": 148,
      "skipped_rows": 2,
      "materials_count": 85,
      "processes_count": 12
    },
    "materials": [
      {
        "id": "M-001",
        "line_index": 1,
        "part_number": "A356-T6",
        "part_name": "铝合金",
        "quantity": 3.5,
        "unit": "kg",
        "unit_price": 28.50,
        "has_history_data": true,
        "status": "verified",
        "confidence": 100.0,
        "comments_extracted": {
          "material_spec": "T6热处理",
          "supplier": "美铝"
        }
      }
    ],
    "processes": [
      {
        "id": "P-001",
        "line_index": 10,
        "op_no": "010",
        "name": "重力铸造",
        "work_center": "铸造车间",
        "cycle_time_std": 45,
        "has_history_data": true,
        "status": "verified"
      }
    ],
    "warnings": [
      {
        "row": 25,
        "message": "物料号未找到，使用 AI 语义匹配",
        "severity": "warning"
      }
    ]
  }
}
```

---

### 2.3 成本计算 (Cost)

| 方法 | 端点 | 功能 | 认证 |
|------|------|------|------|
| POST | `/cost/calculate` | 执行成本核算 | 🟡 需要 |
| GET | `/cost/{projectId}` | 获取成本结果 | 🟡 需要 |
| GET | `/cost/{projectId}/products/{productId}` | 获取产品成本明细 | 🟡 需要 |

#### POST /cost/calculate

**请求体:**
```json
{
  "project_id": "PRJ-2024-001",
  "recalculate": false
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "calculation_id": "calc-456",
    "project_id": "PRJ-2024-001",
    "summary": {
      "total_cost": 474950.00
    },
    "by_product": [
      {
        "product_id": "PROD-001",
        "product_name": "制动管路总成",
        "material_cost": 210950.00,
        "process_cost": 264000.00,
        "total_cost": 474950.00
      }
    ]
  }
}
```

---

### 2.4 报价管理 (Quotation)

| 方法 | 端点 | 功能 | 认证 |
|------|------|------|------|
| GET | `/quotation/{projectId}` | 获取报价摘要 | 🟡 需要 |
| POST | `/quotation/generate` | 生成报价单 | 🟡 需要 |
| GET | `/quotation/{projectId}/export` | 导出报价单 (PDF) | 🟡 需要 |

#### GET /quotation/{projectId}

**响应示例:**
```json
{
  "success": true,
  "data": {
    "project_id": "PRJ-2024-001",
    "quote_summary": {
      "total_cost": 474950.00,
      "quoted_price": 550000.00,
      "target_margin": 15.0,
      "actual_margin": 13.65
    },
    "breakdown": {
      "material_cost": {
        "amount": 210950.00,
        "percentage": 44.4
      },
      "process_cost": {
        "amount": 264000.00,
        "percentage": 55.6
      }
    },
    "investment": {
      "tooling": 49468.00,
      "rnd": 48079.00,
      "total": 97547.00,
      "amortization_period": "3_years"
    },
    "business_case": {
      "years": [
        {
          "year": 2026,
          "volume": 15750,
          "net_sales": 342658.00,
          "hk_3_cost": 316470.00,
          "sk_cost": 364023.00,
          "db_1": 26188.00,
          "db_4": -21365.00
        }
      ],
      "total_db_4": 45680.00,
      "break_even_year": 2028
    }
  }
}
```

---

### 2.5 主数据管理 (Master Data)

| 方法 | 端点 | 功能 | 认证 |
|------|------|------|------|
| GET | `/materials` | 获取物料列表 | 🟡 需要 |
| POST | `/materials` | 创建物料 | 🔒 Admin |
| PUT | `/materials/{id}` | 更新物料 | 🔒 Admin |
| GET | `/process-rates` | 获取工艺费率 | 🟡 需要 |
| POST | `/process-rates` | 创建工艺费率 | 🔒 Admin |
| PUT | `/process-rates/{id}` | 更新工艺费率 | 🔒 Admin |

---

### 2.6 系统管理 (System)

| 方法 | 端点 | 功能 | 认证 |
|------|------|------|------|
| GET | `/health` | 健康检查 | ❌ 公开 |
| GET | `/version` | 获取版本信息 | ❌ 公开 |
| GET | `/users/me` | 获取当前用户 | 🟡 需要 |

---

### 2.7 向量搜索 (Vector Search) 🆕 v1.3

> **详细设计**：[VECTOR_DESIGN.md](VECTOR_DESIGN.md)

| 方法 | 端点 | 功能 | 认证 |
|------|------|------|------|
| POST | `/vector/materials/search` | 语义搜索物料 | 🟡 需要 |
| POST | `/vector/products/search` | 搜索相似产品 | 🟡 需要 |
| POST | `/vector/materials/sync` | 同步物料向量 | 🔒 Admin |
| POST | `/vector/products/sync` | 同步产品向量 | 🔒 Admin |

#### POST /vector/materials/search

搜索与给定文本语义相似的物料。

**请求体:**
```json
{
  "query": "PA66-GF30 Housing",
  "limit": 5,
  "min_similarity": 0.85,
  "material_type_filter": "made"
}
```

**请求参数:**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| query | string | 是 | 搜索查询文本 |
| limit | int | 否 | 返回结果数量，默认 5 |
| min_similarity | decimal | 否 | 最小相似度，默认 0.85 |
| material_type_filter | string | 否 | 物料类型过滤：made/bought |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "query_embedding": [0.0123, -0.0456, ...],
    "results": [
      {
        "material_id": "MAT-001",
        "name": "Housing, Polyamide 66 30% GF",
        "material": "PA66-GF30",
        "material_type": "made",
        "std_price": 28.50,
        "similarity": 0.92,
        "match_type": "semantic"
      },
      {
        "material_id": "MAT-002",
        "name": "Housing PA66 GF30 reinforced",
        "material": "PA66-GF30",
        "material_type": "made",
        "std_price": 30.00,
        "similarity": 0.88,
        "match_type": "semantic"
      }
    ],
    "total_results": 2
  }
}
```

#### POST /vector/products/search

搜索与给定 BOM 结构相似的历史产品。

**请求体:**
```json
{
  "product_name": "Front Brake Line Assy",
  "bom_materials": [
    {"name": "Steel Tube 6mm", "level": 1},
    {"name": "M12 Connector", "level": 1},
    {"name": "Rubber Hose", "level": 1}
  ],
  "processes": ["Cutting", "CNC Bending", "Assembly", "Leak Testing"],
  "limit": 3,
  "min_similarity": 0.80
}
```

**请求参数:**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| product_name | string | 否 | 产品名称 |
| bom_materials | array | 否 | BOM 物料列表 |
| processes | array | 否 | 工艺列表 |
| limit | int | 否 | 返回结果数量，默认 3 |
| min_similarity | decimal | 否 | 最小相似度，默认 0.80 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "product_id": "PROD-001",
        "project_id": "PRJ-2024-Q1",
        "project_name": "Brake Line Project 2024-Q1",
        "product_name": "Brake Line Assembly",
        "similarity": 0.89,
        "processes": ["Cutting", "CNC Bending", "End Forming", "Assembly", "Leak Testing"],
        "avg_mhr": 75.50,
        "created_at": "2024-01-15T10:00:00Z"
      },
      {
        "product_id": "PROD-045",
        "project_id": "PRJ-2023-Q4",
        "project_name": "Suspension Line Project",
        "product_name": "Front Brake Line Assy",
        "similarity": 0.82,
        "processes": ["Cutting", "CNC Bending", "Assembly"],
        "avg_mhr": 68.00,
        "created_at": "2023-10-20T14:30:00Z"
      }
    ],
    "total_results": 2
  }
}
```

#### POST /vector/materials/sync

为指定物料生成/更新向量嵌入。

**请求体:**
```json
{
  "material_ids": ["MAT-001", "MAT-002"],
  "force_rebuild": false
}
```

**请求参数:**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| material_ids | array | 是 | 物料 ID 列表 |
| force_rebuild | boolean | 否 | 是否强制重建，默认 false |

**响应示例:**
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

#### POST /vector/products/sync

为指定产品生成/更新指纹向量。

**请求体:**
```json
{
  "product_ids": ["PROD-001"],
  "force_rebuild": false
}
```

**请求参数:**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| product_ids | array | 是 | 产品 ID 列表 |
| force_rebuild | boolean | 否 | 是否强制重建，默认 false |

**响应示例:**
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

## 3. 错误码定义

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| `VALIDATION_ERROR` | 400 | 请求参数验证失败 |
| `UNAUTHORIZED` | 401 | 未授权，缺少或无效的 Token |
| `FORBIDDEN` | 403 | 无权限访问 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源冲突（如重复创建） |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `SERVICE_UNAVAILABLE` | 503 | 服务暂时不可用 |

---

## 4. 数据模型定义

### 4.1 MaterialStatus（物料状态）

```typescript
type MaterialStatus = 'verified' | 'warning' | 'missing';

interface Material {
  id: string;
  part_number: string;
  part_name: string;
  quantity: number;
  unit: string;
  unit_price?: number;
  has_history_data: boolean;
  status: MaterialStatus;
  confidence: number; // 0-100
  comments_extracted?: Record<string, any>;
}
```

---

## 5. 速率限制

| 端点类型 | 限制 | 时间窗口 |
|----------|------|----------|
| 公开端点 | 100 请求 | 1 分钟 |
| 认证端点 | 1000 请求 | 1 分钟 |
| BOM 上传 | 10 请求 | 1 小时 |

超过限制时返回:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 60
}
```

---

## 6. 相关文档

- [CLAUDE.md](../CLAUDE.md) - 开发协作指南
- [docs/VECTOR_DESIGN.md](VECTOR_DESIGN.md) - 向量化数据架构设计 🆕
- [docs/TESTING_STRATEGY.md](TESTING_STRATEGY.md) - 测试策略
- [docs/DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南

---

**文档结束**
