/**
 * 项目管理流程 E2E 测试
 *
 * 测试场景：
 * 1. 查看空项目列表
 * 2. 创建新项目
 * 3. 查看项目详情
 * 4. 项目列表显示新创建的项目
 */

import { test, expect } from '@playwright/test';
import { generateTestProject, fillProjectForm, navigateTo } from '../helpers/test-helpers';

test.describe('项目管理流程 - Phase A', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到应用首页
    await page.goto('/');
  });

  test('应该显示应用标题', async ({ page }) => {
    // 验证页面加载
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('应该导航到新建项目页面', async ({ page }) => {
    // 点击新建项目按钮/链接
    const newProjectButton = page.locator('[data-testid="nav-new-project"], button:has-text("新建项目"), a:has-text("新建项目")').first();

    await newProjectButton.click();

    // 验证导航成功 - 应该看到表单
    await expect(page.locator('[data-testid="project-name-input"], input[name*="project"], input[placeholder*="项目"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('应该成功创建新项目', async ({ page }) => {
    // 导航到新建项目页面
    await navigateTo(page, 'new-project');

    // 生成测试数据
    const testData = generateTestProject();

    // 填写表单
    await page.fill('[data-testid="asac-number-input"], input[name*="asac"]', testData.asacNumber);
    await page.fill('[data-testid="customer-number-input"], input[name*="customer"]', testData.customerNumber);
    await page.fill('[data-testid="project-name-input"], input[name*="projectName"]', testData.projectName);
    await page.fill('[data-testid="annual-volume-input"], input[name*="annual"]', testData.annualVolume);

    // 填写产品信息（如果存在）
    const productNameInput = page.locator('input[name*="productName"], input[placeholder*="产品名称"]').first();
    if (await productNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await productNameInput.fill(testData.products[0].name);
    }

    // 填写负责人信息
    await page.fill('[data-testid="sales-input"], input[name*="sales"]', testData.owners.sales);
    await page.fill('[data-testid="vm-input"], input[name*="vm"]', testData.owners.vm);

    // 提交表单
    await page.click('button[type="submit"], button:has-text("创建"), button:has-text("提交")');

    // 验证成功 - 应该看到成功消息或跳转到成功页面
    await expect(page.locator('text=成功, text=创建成功, [data-testid="project-success"]').first()).toBeVisible({ timeout: 5000 });

    // 验证项目名称显示
    await expect(page.locator(`text=${testData.projectName}`)).toBeVisible();
  });

  test('创建后应能查看项目详情', async ({ page }) => {
    // 先创建一个项目（通过 API 或手动创建）
    // 这里假设已有一个项目 ID
    // TODO: 实际实现时需要先创建项目获取 ID

    // 导航到项目详情
    // await page.goto(`/project/TEST-PROJECT-ID`);

    // 验证项目信息显示
    // await expect(page.locator('[data-testid="project-detail"]')).toBeVisible();
  });

  test('Dashboard 应显示项目列表', async ({ page }) => {
    // 导航到 Dashboard
    await navigateTo(page, 'dashboard');

    // 验证项目列表区域可见
    await expect(page.locator('[data-testid="project-list"], .project-list, table').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('项目表单验证', () => {
  test('应该验证必填字段', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'new-project');

    // 直接提交空表单
    await page.click('button[type="submit"]');

    // 验证错误提示
    await expect(page.locator('text=必填, text=required, [data-testid="form-error"]').first()).toBeVisible({ timeout: 2000 });
  });

  test('应该验证年量格式', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'new-project');

    // 输入无效的年量
    const volumeInput = page.locator('[data-testid="annual-volume-input"], input[name*="annual"]').first();
    await volumeInput.fill('invalid');

    // 验证错误提示
    await page.blur(volumeInput);
    await expect(page.locator('text=数字, text=invalid, [data-testid="field-error"]').first()).toBeVisible({ timeout: 2000 });
  });
});
