# Dr.aiVOSS API 完整参考

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.4   | 2026-02-03 | 2026-02-24 | Dr.aiVOSS API 完整参考 | Randy Luo |

---

**版本变更记录：**
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.4 | 2026-02-24 | 🆕 报价接口升级：新增 package_total、整车产量、单车用量、SAP附加费、寄售库存、多模具摊销、VOSS财务指标 |
| v1.3 | 2026-02-05 | 🆕 新增向量搜索 API（§2.7） |
| v1.2 | 2026-02-05 | 🔴 移除 VAVE 相关端点 |
| v1.1 | 2026-02-03 | 初始版本 |

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
| GET | `/quotation/{projectId}` | 获取报价摘要（支持组合报价） | 🟡 需要 |
| POST | `/quotation/generate` | 生成报价单 | 🟡 需要 |
| GET | `/quotation/{projectId}/export` | 导出报价单 (PDF) | 🟡 需要 |

#### GET /quotation/{projectId}

> **v1.4 升级说明：** 新增 `package_total`、`volume_params`、`new_cost_items`、`voss_metrics` 字段

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
      "actual_margin": 13.65,
      "currency": "CNY"
    },
    "breakdown": {
      "material_cost": {
        "amount": 210950.00,
        "percentage": 44.4
      },
      "process_cost": {
        "amount": 264000.00,
        "percentage": 55.6
      },
      "logistics_cost": {
        "amount": 5000.00,
        "percentage": 1.05
      },
      "other_mfg_cost": {
        "amount": 3000.00,
        "percentage": 0.63
      }
    },
    "new_cost_items": {
      "sap_surcharge": {
        "rate": 0.005,
        "amount": 2750.00
      },
      "consign_stock": {
        "rate": 0.02,
        "amount": 11000.00
      },
      "tooling_amortizations": {
        "Tooling 1": 6.40,
        "Tooling 2": 1.80
      }
    },
    "volume_params": {
      "vehicle_vol": 105000,
      "factor_per_vehicle": 0.15,
      "calculated_volume": 15750
    },
    "target_params": {
      "target_db4": 0.08,
      "target_db1": 0.15,
      "reverse_pricing_result": 20.11
    },
    "investment": {
      "tooling": 49468.00,
      "rnd": 48079.00,
      "total": 97547.00,
      "amortization_mode": "total_volume_based",
      "amortization_groups": [
        {
          "group_name": "Tooling 1",
          "total_invest": 40000.00,
          "per_piece": 6.40
        },
        {
          "group_name": "Tooling 2",
          "total_invest": 9468.00,
          "per_piece": 1.80
        }
      ]
    },
    "voss_metrics": {
      "gm_percent": 15.5,
      "db1_hk3": 26188.00,
      "db1_all_costs": 15000.00,
      "db4": 15000.00
    },
    "business_case": {
      "years": [
        {
          "year": 2026,
          "vehicle_vol": 105000,
          "factor_per_vehicle": 0.15,
          "volume": 15750,
          "net_sales": 342658.00,
          "hk_3_cost": 316470.00,
          "sk_1_cost": 323666.00,
          "sk_2_cost": 364023.00,
          "sap_surcharge": 1713.29,
          "consign_stock": 6853.16,
          "db_1": 26188.00,
          "db_4": -21365.00
        }
      ],
      "total_db_4": 45680.00,
      "break_even_year": 2028
    },
    "package_total": {
      "product_count": 3,
      "total_hk3": 1424850.00,
      "total_sk": 1460123.00,
      "weighted_gm_percent": 14.8,
      "weighted_db4": 0.065
    }
  }
}
```

**响应字段说明（v1.4 新增）：**

| 字段路径 | 类型 | 说明 |
|----------|------|------|
| `new_cost_items.sap_surcharge` | object | SAP 系统附加费（rate × net_sales） |
| `new_cost_items.consign_stock` | object | 寄售库存/VMI 成本（rate × net_sales） |
| `new_cost_items.tooling_amortizations` | object | 多模具分组摊销（JSON: `{"Tooling 1": 6.40}`） |
| `volume_params.vehicle_vol` | int | 整车产量（台/年） |
| `volume_params.factor_per_vehicle` | decimal | 单车用量（件/台） |
| `volume_params.calculated_volume` | int | 计算销量 = 整车产量 × 单车用量 |
| `target_params.target_db4` | decimal | 目标 DB4 净利率 |
| `target_params.target_db1` | decimal | 目标 DB1 边际贡献率 |
| `target_params.reverse_pricing_result` | decimal | 反推基准单价 |
| `investment.amortization_groups` | array | 摊销分组列表（含 group_name, total_invest, per_piece） |
| `voss_metrics.gm_percent` | decimal | 毛利率 GM% |
| `voss_metrics.db1_hk3` | decimal | DB1 (HK3) 边际贡献 |
| `voss_metrics.db1_all_costs` | decimal | DB1 (all costs) 含所有成本 |
| `voss_metrics.db4` | decimal | DB4 净利润 |
| `business_case.years[].sk_1_cost` | decimal | SK-1 项目综合成本 |
| `business_case.years[].sk_2_cost` | decimal | SK-2 项目全成本 |
| `business_case.years[].sap_surcharge` | decimal | 年度 SAP 附加费 |
| `business_case.years[].consign_stock` | decimal | 年度寄售库存成本 |
| `package_total.product_count` | int | 组合报价产品数量 |
| `package_total.total_hk3` | decimal | 组合 HK3 汇总 |
| `package_total.total_sk` | decimal | 组合 SK 汇总 |
| `package_total.weighted_gm_percent` | decimal | 加权平均毛利率 |
| `package_total.weighted_db4` | decimal | 加权平均 DB4 |

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

> **详细设计**：[向量设计.md](向量设计.md)

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
- [向量设计.md](向量设计.md) - 向量化数据架构设计 🆕
- [测试策略.md](测试策略.md) - 测试策略
- [部署指南.md](部署指南.md) - 部署指南

---

**文档结束**
