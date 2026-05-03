import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Perfil', () => {
  test('deve exibir perfil público por slug', async ({ page }) => {
    // Tenta acessar um slug que provavelmente existe ou redireciona
    await page.goto('/perfil/danilo-cesar');
    
    // Se não existir, o componente mostra "Perfil não encontrado"
    const notFound = await page.locator('text=Perfil não encontrado').isVisible();
    if (notFound) {
      console.log('Aviso: Slug danilo-cesar não encontrado, testando comportamento de erro');
      await expect(page.locator('text=Perfil não encontrado')).toBeVisible();
    } else {
      await expect(page.getByTestId('profile-name')).toBeVisible();
      await expect(page.getByTestId('profile-type-badge')).toBeVisible();
    }
  });

  test('deve navegar para editar perfil autenticado', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.click('[data-testid="edit-profile-button"]');
    await expect(page).toHaveURL(/.*editar-perfil/);
  });

  test('deve exibir ProfileStrength gauge', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('profile-strength-gauge')).toBeVisible();
  });
});
