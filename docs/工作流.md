# Dr.aiVOSS 开发工作流

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-10 | 2026-02-10 | Dr.aiVOSS 开发工作流 | Randy Luo |

---

## 1. Git 工作流

### 1.1 分支策略（简化版 Git Flow）

```
main          ─── 生产环境，稳定版本
  ↑
develop       ─── 开发主分支，合并测试后的功能
  ↑
feature/*     ─── 功能分支，从 develop 分出
hotfix/*       ─── 紧急修复，从 main 分出
```

**规则：**
- `main` 分支受保护，需要 PR 才能合并
- `feature/xxx` 分支命名：`randyluo85/功能描述`
- 每个功能一个分支，完成后合并到 `develop`

### 1.2 Commit 规范（Conventional Commits）

```bash
<type>(<scope>): <subject>

# type 类型
feat     # 新功能
fix      # 修复
docs     # 文档
refactor # 重构
test     # 测试
chore    # 构建/工具

# 示例
feat(auth): add JWT authentication
fix(bom): resolve Excel parsing error
docs(workflow): add Git workflow guide
```

**使用工具：** `zcf:git-commit` 自动生成符合规范的 commit 信息

### 1.3 Code Review 流程

1. **自检清单**（提交前）
   - [ ] 代码通过 ruff format 和 ruff check
   - [ ] 测试通过（pytest）
   - [ ] 自己 Review 一遍代码

2. **PR 标题**
   - 使用 Conventional Commit 格式
   - 简洁描述变更内容

3. **Review 重点**
   - 逻辑正确性
   - 代码可读性
   - 测试覆盖

---

## 2. 开发流程

```
需求讨论 → Spec（如需要）→ 实现 → 测试 → Review → 合并
```

### 2.1 何时编写 Spec

**需要 Spec：**
- 功能涉及多个模块
- 需要多人协作
- 业务逻辑复杂（如 RBAC、状态机）

**不需要 Spec：**
- 简单的 CRUD
- 单人可完成的任务
- 代码注释已足够说明

### 2.2 开发顺序

1. **后端优先**：先实现 API 和数据模型
2. **测试驱动**：关键业务逻辑必须有单元测试
3. **前端对接**：API 稳定后再开发前端

---

## 3. 代码规范

### 3.1 Python (Backend)

**工具链：**
- 包管理：`uv`
- 格式化：`ruff format`
- 检查：`ruff check`
- 测试：`pytest`

**代码风格：**
- 遵循 PEP 8
- 使用类型注解（Type Hints）
- Docstring 遵循 Google 风格

```python
async def get_project(project_id: str) -> ProjectResponse | None:
    """获取项目详情

    Args:
        project_id: 项目ID

    Returns:
        项目响应，不存在返回 None
    """
    ...
```

### 3.2 TypeScript (Frontend)

**工具链：**
- 包管理：`npm`
- 格式化：`Prettier`
- 检查：`ESLint`

**代码风格：**
- 使用函数组件 + Hooks
- Props 定义使用 TypeScript 接口
- 状态管理优先用 React 内置（复杂场景考虑 Zustand）

---

## 4. 测试策略

### 4.1 后端测试

- **单元测试**：核心业务逻辑（成本计算、BOM 解析）
- **集成测试**：API 端点
- **目标覆盖率**：关键模块 > 80%

### 4.2 前端测试

- **E2E 测试**：关键用户流程（创建项目、上传 BOM）
- **工具**：Playwright

---

## 5. 文档更新

### 5.1 必须更新文档的情况

| 变更类型 | 更新文档 |
|---------|---------|
| 新增功能 | CHANGELOG.md |
| 修改 API | API_REFERENCE.md |
| 修改数据表 | DATABASE_DESIGN.md |
| 修改业务逻辑 | PROJECT_CONTEXT.md |

### 5.2 文档版本管理

每个文档顶部包含版本表：

```markdown
| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-10 | 2026-02-10 | xxx | Randy Luo |
```

---

## 6. 快速命令

```bash
# 后端
cd backend
uv run ruff format app/
uv run ruff check app/ --fix
uv run pytest

# 前端
cd frontend
npm run lint
npm run format
npm run test

# Git
git checkout -b randyluo85/feature-name
# ... coding ...
zcf:git-commit  # 自动生成规范的 commit 信息
```
