import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Bookings e Negociações', () => {
  test('deve exibir botão de proposta em perfil público para usuário logado', async ({ page }) => {
    await login(page);
    await page.goto('/perfil/danilo-cesar');
    
    // Se for o próprio perfil, o botão não aparece. 
    // Assumindo que danilo-cesar não é o TEST_USER.
    const isOwner = await page.locator('text=Editar perfil').isVisible();
    if (!isOwner) {
      await expect(page.getByTestId('booking-button')).toBeVisible();
    }
  });

  test('deve navegar para /negociacoes autenticado', async ({ page }) => {
    await login(page);
    await page.goto('/negociacoes');
    await expect(page.getByTestId('bookings-list')).toBeVisible();
  });
});
