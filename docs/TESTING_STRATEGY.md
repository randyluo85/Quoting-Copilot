# Dr.aiVOSS 测试策略指南

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.2   | 2026-02-03 | 2026-02-05 | Dr.aiVOSS 测试策略指南 | Randy Luo |

---

**版本变更记录：**
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.2 | 2026-02-05 | 🔴 移除 VAVE 相关测试用例（双轨计算测试） |
| v1.1 | 2026-02-03 | 初始版本 |

---

## 1. 测试金字塔架构

```
                    /\
                   /  \
                  / E2E \
                 /______\
                /        \
               /集成测试  \
              /__________\
             /            \
            /  单元测试    \
           /________________\
```

| 层级 | 占比 | 覆盖范围 | 工具/框架 |
|------|------|----------|-----------|
| **单元测试** | 70% | 独立函数、类、组件 | pytest (Python), Vitest (TS) |
| **集成测试** | 20% | API 接口、数据库交互 | pytest + fixtures |
| **E2E 测试** | 10% | 完整业务流程 | Playwright |

---

## 2. 标准成本计算测试覆盖要求

### 2.1 核心计算公式测试

**必须覆盖的场景：**

| 场景 | 标准成本 | 预期结果 |
|------|----------|----------|
| 正常计算 | > 0 | 正确计算成本 |
| 零成本 | 0 | 返回零值 |
| 数值精度 | 小数位 | 保留2位小数 |
| 负值处理 | < 0 | 不允许负成本 |

**测试用例示例：**

```python
# tests/core/test_price_pair.py
import pytest
from decimal import Decimal

def test_price_pair_calculations():
    """测试标准价格计算"""
    from app.models import PricePair

    # 正常计算
    pair = PricePair(std=Decimal("100.00"))
    assert pair.std == Decimal("100.00")

def test_negative_cost_rejected():
    """测试负成本被拒绝"""
    with pytest.raises(ValidationError):
        PricePair(std=Decimal("-10.00"))
```

### 2.2 边界值测试

| 参数 | 最小值 | 最大值 | 边界行为 |
|------|--------|--------|----------|
| 物料数量 | 0.001 | 999999.999 | 超限抛异常 |
| 工时(秒) | 1 | 86400 (24h) | 超限警告 |
| MHR 费率 | 0.01 | 9999.99 | 超限抛异常 |
| 标准成本 | 0 | - | 不允许负值 |

---

## 3. BOM 解析测试数据集

### 3.1 标准测试用例

**文件:** `tests/fixtures/bom_samples/`

| 用例 | 文件名 | 场景描述 | 预期结果 |
|------|--------|----------|----------|
| 完美匹配 | `perfect_match.xlsx` | 所有物料号都在库中 | 🟢 100% |
| 部分匹配 | `partial_match.xlsx` | 50% 物料号匹配 | 🟢 50%, 🟡 50% |
| 无匹配 | `no_match.xlsx` | 所有物料号不在库中 | 🔴 100% |
| 含 Comments | `with_comments.xlsx` | 备注列含工艺参数 | 正确提取特征 |
| 空白行 | `with_empty_rows.xlsx` | 包含空白行 | 自动跳过 |
| 特殊字符 | `special_chars.xlsx` | 物料名含特殊符号 | 正常处理 |

### 3.2 Comments 特征提取测试

| 输入 Comments | 预期提取特征 | 置信度 |
|---------------|--------------|--------|
| "折弯：32次，焊接：4点" | `{"bending": 32, "welding": 4}` | 🟢 高 |
| "需要热处理" | `{"heat_treatment": true}` | 🟡 中 |
| "（空白）" | `{}` | 🔴 无 |

---

## 4. API 接口测试规范

### 4.1 响应结构验证

**每个 API 必须验证：**

```python
def test_api_response_structure():
    """测试 API 响应结构"""
    response = client.get("/api/v1/projects/PRJ-001")

    assert response.status_code == 200
    data = response.json()

    # 必需字段
    assert "id" in data
    assert "project_name" in data
    assert "status" in data

    # 标准成本字段
    if "quote" in data:
        assert "std_cost" in data["quote"]
        assert "total_cost" in data["quote"]
```

### 4.2 错误码测试

| 错误码 | 场景 | 预期响应 |
|--------|------|----------|
| 400 | 缺少必需参数 | `{"error": "missing_field", "field": "annual_volume"}` |
| 404 | 项目不存在 | `{"error": "project_not_found", "id": "PRJ-999"}` |
| 422 | 数据验证失败 | `{"error": "validation_error", "details": [...]}` |
| 500 | 服务器错误 | `{"error": "internal_error", "message": "..."}` |

---

## 5. 性能测试基准

### 5.1 BOM 解析性能

| 场景 | 数据量 | 响应时间目标 | 内存限制 |
|------|--------|--------------|----------|
| 小型 | 100 行 | < 1 秒 | < 50MB |
| 中型 | 1,000 行 | < 5 秒 | < 200MB |
| 大型 | 10,000 行 | < 30 秒 | < 1GB |

### 5.2 计算性能

| 操作 | 目标 QPS | P95 延迟 |
|------|----------|----------|
| 成本计算 | 100 | < 500ms |
| 物料查询 | 500 | < 100ms |
| 报价生成 | 50 | < 2s |

---

## 6. CI/CD 集成策略

### 6.1 GitHub Actions 工作流

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml
      - name: Coverage check
        run: |
          coverage report --fail-under=80

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
```

### 6.2 代码覆盖率要求

| 模块 | 最低覆盖率 | 推荐覆盖率 |
|------|-----------|-----------|
| 核心计算逻辑 | 90% | 95% |
| API 路由 | 80% | 90% |
| 数据模型 | 85% | 90% |
| 前端组件 | 70% | 80% |

---

## 7. 测试数据管理

### 7.1 数据隔离策略

| 环境 | 数据来源 | 刷新策略 |
|------|----------|----------|
| 单元测试 | Mock/Fixture | 无需真实数据 |
| 集成测试 | 测试数据库 | 每次运行重置 |
| E2E 测试 | 专用测试环境 | 每日重置 |

### 7.2 敏感数据处理

- 禁止在测试代码中硬编码真实客户数据
- 使用脱敏后的数据作为测试用例
- 测试数据库密码使用环境变量

---

## 8. 运行测试命令

```bash
# 后端测试
cd backend
pytest                          # 运行全部测试
pytest -v                        # 详细输出
pytest --cov=app                 # 生成覆盖率报告
pytest tests/core/test_price_pair.py  # 运行特定文件

# 前端测试
cd frontend
npm test                         # 运行全部测试
npm run test:ui                  # UI 模式
npm run test:coverage            # 生成覆盖率

# E2E 测试
npm run test:e2e                 # 运行 E2E 测试
```

---

## 9. 测试检查清单

开发新功能时，必须完成：

- [ ] 单元测试覆盖率 > 80%
- [ ] 核心计算逻辑有边界值测试
- [ ] API 接口有错误码测试
- [ ] 标准成本计算结果已验证
- [ ] 性能测试通过基准
- [ ] 代码审查通过
- [ ] 文档已同步更新

---

## 10. 相关文档

- [docs/API_REFERENCE.md](API_REFERENCE.md) - API 完整参考
- [docs/BUSINESS_CASE_LOGIC.md](BUSINESS_CASE_LOGIC.md) - 计算逻辑
- [CLAUDE.md](../CLAUDE.md) - 开发协作指南

---

**文档结束**
