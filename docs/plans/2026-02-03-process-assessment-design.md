# 工艺评估模块设计文档

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-03 | 2026-02-03 | 工艺评估模块设计 | Randy Luo |

---

## 1. 概述 {#overview}

### 1.1 功能描述

工艺评估模块允许 IE 工程师为新项目创建和维护工艺路线。系统支持：
- **成熟工艺**：数据库中已存在的工艺路线，在 BOM 页面直接展示成本
- **新工艺**：需要 IE 工程师创建和评估的工艺路线，支持版本管理和审批流程

### 1.2 业务流程

```
┌─────────────┐    route_code存在?    ┌─────────────┐
│  BOM 解析   │ ──────────────────────│ 成熟工艺     │
│ (上传文件)  │          Yes           │ (直接展示)   │
└─────────────┘                       └─────────────┘
      │ No
      ▼
┌─────────────┐    工序ID匹配?        ┌─────────────┐
│ 工艺评估页面 │ ──────────────────────│ 草稿模板     │
│ (IE编辑)    │          Yes           │ (可复用)    │
└─────────────┘                       └─────────────┘
      │ No
      ▼
┌─────────────┐
│ 创建新工艺   │
│ 路线        │
└─────────────┘
      │
      ▼
┌─────────────┐
│ 提交审批     │
└─────────────┘
      │
      ▼
┌─────────────┐
│ 审批通过     │ → 生效
└─────────────┘
```

---

## 2. 数据库设计 {#database}

### 2.1 新增表

#### process_routes（工艺路线主数据）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PK | 工艺路线编码，如 "PR-2024-001" |
| name | VARCHAR(200) | NOT NULL | 工艺路线名称 |
| product_id | VARCHAR(50) | | 关联产品ID（可选） |
| version | INT | DEFAULT 1 | 当前版本号 |
| status | VARCHAR(20) | NOT NULL | 状态: draft/pending/active/deprecated |
| created_by | VARCHAR(50) | | 创建人（IE工程师） |
| approved_by | VARCHAR(50) | | 审批人 |
| approved_at | DATETIME | | 审批时间 |
| remarks | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

#### process_route_items（工序明细）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | CHAR(36) | PK | UUID |
| route_id | VARCHAR(50) | FK, NOT NULL | 关联 process_routes.id |
| operation_no | VARCHAR(20) | NOT NULL | 工序号，如 "OP010" |
| process_code | VARCHAR(50) | NOT NULL | 关联 process_rates.process_code |
| sequence | INT | DEFAULT 0 | 排序顺序 |
| cycle_time_std | INT | | 标准工时（秒） |
| cycle_time_vave | INT | | VAVE 工时（秒） |
| personnel_std | DECIMAL(4,2) | DEFAULT 1.0 | 标准人工配置 |
| personnel_vave | DECIMAL(4,2) | | VAVE 人工配置 |
| std_mhr_var | DECIMAL(10,2) | | 标准变动费率（快照） |
| std_mhr_fix | DECIMAL(10,2) | | 标准固定费率（快照） |
| vave_mhr_var | DECIMAL(10,2) | | VAVE 变动费率（快照） |
| vave_mhr_fix | DECIMAL(10,2) | | VAVE 固定费率（快照） |
| efficiency_factor | DECIMAL(4,2) | DEFAULT 1.0 | 效率系数 |
| equipment | VARCHAR(100) | | 设备（快照） |
| remarks | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT NOW() | |

### 2.2 修改表

#### project_products（新增字段）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| route_id | VARCHAR(50) | FK | 关联的工艺路线ID |

---

## 3. API 接口设计 {#api}

### 3.1 工艺路线管理 API

**模块**: `backend/app/api/v1/process_routes.py`

| 方法 | 端点 | 功能 | 权限 |
|------|------|------|------|
| GET | `/process-routes` | 获取工艺路线列表 | All |
| POST | `/process-routes` | 创建新工艺路线（草稿） | IE |
| GET | `/process-routes/{id}` | 获取工艺路线详情 | All |
| PUT | `/process-routes/{id}` | 更新工艺路线 | IE |
| DELETE | `/process-routes/{id}` | 删除工艺路线（仅草稿） | IE |
| POST | `/process-routes/{id}/submit` | 提交审批 | IE |
| POST | `/process-routes/{id}/approve` | 审批通过 | Supervisor |
| POST | `/process-routes/{id}/reject` | 审批拒绝 | Supervisor |
| GET | `/process-routes/by-code/{code}` | 根据 route_code 查询 | All |

### 3.2 请求/响应示例

#### 创建工艺路线

**请求**:
```json
POST /api/v1/process-routes
{
  "name": "铝合金缸体标准工艺",
  "items": [
    {
      "operation_no": "OP010",
      "process_code": "CAST-001",
      "sequence": 1,
      "cycle_time_std": 120,
      "cycle_time_vave": 110,
      "personnel_std": 1.0,
      "personnel_vave": 1.0
    }
  ]
}
```

**响应**:
```json
{
  "id": "PR-2024-001",
  "name": "铝合金缸体标准工艺",
  "status": "draft",
  "version": 1,
  "items": [
    {
      "id": "uuid-xxx",
      "operation_no": "OP010",
      "process_code": "CAST-001",
      "process_name": "重力铸造",
      "equipment": "铸造车间-A线",
      "sequence": 1,
      "cycle_time_std": 120,
      "cycle_time_vave": 110,
      "std_cost": 45.00,
      "vave_cost": 42.00
    }
  ],
  "total_std_cost": 45.00,
  "total_vave_cost": 42.00,
  "total_savings": 3.00,
  "created_at": "2024-02-03T10:00:00Z"
}
```

---

## 4. 前端组件设计 {#frontend}

### 4.1 组件结构

```
frontend/src/components/
├── ProcessAssessment.tsx        # 主页面（工艺路线列表）
├── ProcessRouteEditor.tsx       # 编辑器（新建/编辑工艺路线）
└── ProcessPreviewCard.tsx       # BOM 页面内嵌的工艺卡片
```

### 4.2 ProcessAssessment（主页面）

```
┌─────────────────────────────────────────────────────────┐
│ 工艺路线管理                           [+ 新建工艺路线]  │
├─────────────────────────────────────────────────────────┤
│ 🔍 [搜索]    状态: [全部▼]    排序: [更新时间▼]         │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────┐  │
│ │ PR-2024-001  铝合金缸体标准工艺    [Active] 🟢   │  │
│ │ 5道工序 | 标准成本 ¥45.00 | 更新: 2024-02-03     │  │
│ │ [查看] [编辑] [复制] [版本历史]                  │  │
│ └───────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────┐  │
│ │ PR-2024-002  新产品试制工艺        [Draft] 🟡   │  │
│ │ 3道工序 | 待完善 | 更新: 2024-02-02              │  │
│ │ [查看] [编辑] [提交审批] [删除]                  │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.3 ProcessRouteEditor（编辑器）

```
┌─────────────────────────────────────────────────────────┐
│ 工艺路线编辑                                [保存][提交] │
├─────────────────────────────────────────────────────────┤
│ 工艺路线名称: [铝合金缸体标准工艺____________]          │
│ 状态: Draft                                             │
├─────────────────────────────────────────────────────────┤
│ 工序明细                               [+ 添加工序]     │
├─────────────────────────────────────────────────────────┤
│ OP010  | 重力铸造 | 铸造车间-A线 | 120s | ¥45.00 | [×]  │
│ OP020  | 粗加工   | 机加车间-B线 | 180s | ¥32.00 | [×]  │
│ OP030  | 精加工   | 机加车间-B线 | 150s | ¥28.00 | [×]  │
│ ... (支持拖拽排序)                                       │
├─────────────────────────────────────────────────────────┤
│ 成本汇总:                                               │
│   标准成本: ¥105.00   VAVE成本: ¥98.00   节省: 7.0%   │
└─────────────────────────────────────────────────────────┘
```

### 4.4 ProcessPreviewCard（BOM 页面内嵌）

#### 成熟工艺展示

```
┌─────────────────────────────────────────────────────────┐
│ 📋 工艺路线                          [查看详情] [编辑]   │
├─────────────────────────────────────────────────────────┤
│ 工艺路线: PR-2024-001 (铝合金缸体标准工艺) ✅           │
│ 工序数: 5道                                             │
│                                                         │
│ 工序      | 名称     | 设备       | 工时   | 成本      │
│ OP010     | 重力铸造 | 铸造-A线   | 120s   | ¥45.00    │
│ OP020     | 粗加工   | 机加-B线   | 180s   | ¥32.00    │
│ OP030     | 精加工   | 机加-B线   | 150s   | ¥28.00    │
│ ...                                                    │
│                                                         │
│ 工艺成本: ¥105.00 (标准) / ¥98.00 (VAVE)                │
└─────────────────────────────────────────────────────────┘
```

#### 新工艺提示

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ 工艺路线待评估                                       │
│ 该产品使用新工艺路线，需要 IE 工程师进行评估           │
│                                    [前往评估]           │
└─────────────────────────────────────────────────────────┘
```

---

## 5. 测试策略 {#testing}

### 5.1 测试金字塔

```
                 ┌──────────────┐
                 │   E2E Tests   │  ← Chrome DevTools MCP
                 │  (Playwright) │     关键用户流程
                 └──────────────┘
                ┌────────────────┐
                │  Integration   │  ← API Tests
                │     Tests      │     前后端联调
                └────────────────┘
               ┌────────────────────┐
               │    Unit Tests       │  ← Vitest / Pytest
               │  (Component/Logic)  │     独立单元
               └────────────────────┘
```

### 5.2 单元测试

#### 后端
```python
# tests/test_process_routes.py
def test_create_process_route():
    """测试创建工艺路线"""

def test_add_process_item():
    """测试添加工序"""

def test_calculate_route_cost():
    """测试工艺路线成本计算（双轨）"""

def test_submit_approval():
    """测试提交审批流程"""
```

#### 前端
```typescript
// ProcessRouteEditor.test.tsx
describe('ProcessRouteEditor', () => {
  it('should add process item')
  it('should delete process item')
  it('should reorder by drag')
  it('should calculate cost in real-time')
})
```

### 5.3 E2E 测试场景

| 场景 | 测试内容 | 验证点 |
|------|---------|--------|
| **成熟工艺展示** | 打开 BOM 页面，产品有 route_code | 显示工艺卡片、成本正确 |
| **新工艺跳转** | 打开 BOM 页面，产品无 route_code | 显示"待评估"，点击跳转 |
| **创建工艺路线** | 新建 → 填写名称 → 添加工序 → 保存 | 保存成功，状态为 draft |
| **编辑工序** | 拖拽排序 → 修改工时 → 实时计算 | 成本实时更新 |
| **审批流程** | 提交审批 → 主管登录 → 审批通过 | 状态变为 active |

### 5.4 性能指标

- 页面加载时间 < 2s
- API 响应时间 < 500ms
- 大型工艺路线（50+工序）渲染不卡顿

---

## 6. 实施计划 {#implementation}

### 6.1 开发顺序

| 阶段 | 任务 | 测试 | 预计时间 |
|------|------|------|---------|
| **1️⃣ 数据库** | 创建 process_routes 表、修改 product_processes | Alembic 迁移测试 | 0.5d |
| **2️⃣ 后端核心** | 工艺路线 CRUD API | Pytest 单元测试 | 1d |
| **3️⃣ 后端业务** | 成本计算、审批流程 | Pytest 单元测试 | 1d |
| **4️⃣ 前端组件** | ProcessRouteEditor 组件 | Vitest 组件测试 | 1d |
| **5️⃣ 前端集成** | BOM 页面工艺卡片、路由跳转 | Vitest + API Mock | 1d |
| **6️⃣ 联调测试** | 前后端集成，Chrome DevTools E2E | Playwright + MCP | 0.5d |
| **7️⃣ 验收** | 完整流程测试、性能验证 | Chrome DevTools | 0.5d |

### 6.2 关键文件清单

#### 新建文件

**后端**:
```
backend/app/api/v1/process_routes.py          # API 端点
backend/app/services/process_route_service.py # 业务逻辑
backend/app/models/process_route.py           # ORM 模型
backend/app/schemas/process_route.py          # Pydantic Schema
backend/tests/test_process_routes.py          # 测试
backend/alembic/versions/xxx_process_routes.py # 数据库迁移
```

**前端**:
```
frontend/src/components/ProcessAssessment.tsx  # 主页面
frontend/src/components/ProcessRouteEditor.tsx # 编辑器
frontend/src/components/ProcessPreviewCard.tsx # 预览卡片
frontend/src/hooks/useProcessRoutes.ts         # 数据 Hook
frontend/src/lib/api/processRoutes.ts          # API 客户端
frontend/tests/process/                        # 测试目录
```

#### 修改文件

```
backend/app/models/product.py          # 添加 route_id 字段
frontend/src/components/BOMManagement.tsx  # 集成工艺卡片
docs/DATABASE_DESIGN.md                # 更新文档
```

---

## 7. 成本计算公式 {#calculation}

### 7.1 工序成本计算

```
std_cost = (cycle_time_std / 3600) × (std_mhr_var + std_mhr_fix + personnel_std × labor_rate)
vave_cost = (cycle_time_vave / 3600) × (vave_mhr_var + vave_mhr_fix + personnel_vave × labor_rate)
```

### 7.2 工艺路线总成本

```
total_std_cost = Σ(std_cost_i)
total_vave_cost = Σ(vave_cost_i)
total_savings = total_std_cost - total_vave_cost
savings_rate = (total_savings / total_std_cost) × 100%
```

---

**文档结束**
