import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'playwright@pnsp.test',
  password: 'PlaywrightTest123!',
  name: 'Playwright Teste'
};

export async function login(page: Page) {
  await page.goto('/entrar');
  await page.fill('[data-testid="email-input"]', TEST_USER.email);
  await page.fill('[data-testid="password-input"]', TEST_USER.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('**/');
}
