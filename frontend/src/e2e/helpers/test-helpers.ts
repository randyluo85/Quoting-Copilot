/**
 * E2E 测试辅助函数
 */

import { Page, expect } from '@playwright/test';

/**
 * 等待 API 请求完成
 */
export async function waitForAPIResponse(page: Page, urlPattern: string) {
  return page.waitForResponse(
    (response) => response.url().includes(urlPattern) && response.status() === 200
  );
}

/**
 * 填写项目表单
 */
export async function fillProjectForm(page: Page, data: {
  asacNumber?: string;
  customerNumber?: string;
  projectName?: string;
  annualVolume?: string;
}) {
  if (data.asacNumber) {
    await page.fill('[data-testid="asac-number-input"]', data.asacNumber);
  }
  if (data.customerNumber) {
    await page.fill('[data-testid="customer-number-input"]', data.customerNumber);
  }
  if (data.projectName) {
    await page.fill('[data-testid="project-name-input"]', data.projectName);
  }
  if (data.annualVolume) {
    await page.fill('[data-testid="annual-volume-input"]', data.annualVolume);
  }
}

/**
 * 导航到指定视图
 */
export async function navigateTo(page: Page, view: string) {
  const testId = `nav-${view}`;
  await page.click(`[data-testid="${testId}"]`);
}

/**
 * 等待加载状态消失
 */
export async function waitForLoading(page: Page) {
  await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' }).catch(() => {});
}

/**
 * 截图并保存（用于调试）
 */
export async function debugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}
