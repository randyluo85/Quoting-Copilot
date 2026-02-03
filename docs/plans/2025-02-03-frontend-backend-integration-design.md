# 前后端联调设计方案

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2025-02-03 | 2025-02-03 | 前后端联调 TDD 方案 | Randy Luo |

## 1. 概述

本文档描述 SmartQuote AI 双轨报价系统的前后端联调方案，采用 TDD 开发模式，使用 chrome-devtools 进行浏览器自动化测试。

## 2. 整体架构

```
doha/
├── backend/           # FastAPI 服务 (端口 8000)
│   └── app/
│       ├── api/v1/    # 已完成的 API 路由
│       └── tests/     # pytest 测试
│
├── frontend/          # Vite + React (端口 5173)
│   └── src/
│       ├── lib/
│       │   ├── api.ts           # API client (fetch 封装)
│       │   └── store.ts         # Zustand store
│       ├── components/
│       │   └── ...              # 现有组件
│       └── e2e/
│           └── specs/           # Playwright E2E 测试
│
└── docs/
    └── plans/           # 本设计文档
```

## 3. 技术栈

| 层级 | 技术选型 |
|------|----------|
| 后端 | FastAPI + SQLAlchemy + MySQL |
| 前端 | Vite + React 18 + TypeScript + ShadcnUI |
| 状态管理 | Zustand |
| 测试 | Playwright (E2E) + Vitest (单元测试) |
| 调试 | chrome-devtools MCP |

## 4. API Client 设计

```typescript
// frontend/src/lib/api.ts

const API_BASE = 'http://localhost:8000/api/v1';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const api = {
  projects: {
    list: () => fetch.get('/projects'),
    create: (data: ProjectCreate) => fetch.post('/projects', data),
    get: (id: string) => fetch.get(`/projects/${id}`),
  },

  bom: {
    upload: (projectId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch.post(`/bom/upload?project_id=${projectId}`, formData);
    },
  },

  cost: {
    calculate: (projectId: string, productId: string) =>
      fetch.post(`/cost/calculate?project_id=${projectId}&product_id=${productId}`),
  },
};
```

## 5. Zustand Store 设计

```typescript
// frontend/src/lib/store.ts

// 项目 Store
interface ProjectState {
  projects: ProjectData[];
  selectedProject: ProjectData | null;
  loading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<ProjectData>;
  selectProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await api.projects.list();
      set({ projects, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ...
}));

// BOM Store、Cost Store 类似结构
```

## 6. E2E 测试结构

```
e2e/
├── helpers/
│   └── test-helpers.ts
├── specs/
│   ├── project.spec.ts        # 阶段 A
│   ├── bom.spec.ts            # 阶段 B
│   └── cost.spec.ts           # 阶段 C
└── fixtures/
    └── test-data.ts
```

**测试示例：**

```typescript
import { test, expect } from '@playwright/test';

test.describe('项目管理流程', () => {
  test('应该成功创建新项目', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('[data-testid="nav-new-project"]');
    await page.fill('[name="projectName"]', '测试项目');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=项目创建成功')).toBeVisible();
  });
});
```

## 7. Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e/specs',
  fullyParallel: false,  // 顺序执行，共享数据库
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
```

## 8. 实施计划

| 阶段 | 功能 | 测试文件 | 优先级 |
|------|------|----------|--------|
| **A** | 项目管理 (CRUD) | `project.spec.ts` | P0 |
| **B** | BOM 上传解析 | `bom.spec.ts` | P0 |
| **C** | 成本计算展示 | `cost.spec.ts` | P1 |

## 9. TDD 工作流

```
1. 红 → 写 Playwright 测试
   └─ chrome-devtools 调试测试

2. 绿 → 实现 API client
   └─ chrome-devtools Network 验证

3. 绿 → 组件集成 Store
   └─ chrome-devtools React DevTools 验证

4. 重构 → 提取复杂逻辑
   └─ Vitest 单元测试
```

## 10. 依赖安装

```bash
# 前端新增依赖
npm install zustand
npm install -D @playwright/test vitest
```
