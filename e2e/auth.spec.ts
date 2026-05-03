import { test, expect } from '@playwright/test';
import { login, logout, TEST_USER } from './helpers/auth';

test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/entrar');
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
  });

  test('deve rejeitar credenciais inválidas', async ({ page }) => {
    await page.goto('/entrar');
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', 'SenhaErrada123');
    await page.click('[data-testid="login-button"]');
    
    // Verifica se há alguma mensagem de erro (ajuste conforme o componente real)
    await expect(page.locator('text=inválida')).toBeVisible();
  });

  test('deve fazer logout', async ({ page }) => {
    // Primeiro faz login (assume que o teste de login passou ou faz direto)
    await login(page);
    await logout(page);
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('deve redirecionar rota protegida para /entrar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*entrar/);
  });
});
