/**
 * Playwright E2E 测试配置
 *
 * 用于前后端联调的浏览器自动化测试
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e/specs',

  // 顺序执行，避免数据库冲突
  fullyParallel: false,

  // 失败时不重试，快速反馈
  retries: 0,

  // 测试超时时间
  timeout: 30000,

  use: {
    baseURL: 'http://localhost:5173',

    // 失败时截图
    screenshot: 'only-on-failure',

    // 失败时录制视频
    video: 'retain-on-failure',

    // 失败时截图
    trace: 'retain-on-failure',
  },

  // 测试项目
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // 启动前端开发服务器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
