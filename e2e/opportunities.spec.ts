import { test, expect } from '@playwright/test';

test.describe('Oportunidades', () => {
  test('deve exibir feed de oportunidades na home', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('opportunity-feed')).toBeVisible();
  });

  test('deve abrir detalhes de oportunidade', async ({ page }) => {
    await page.goto('/oportunidades');
    
    // Tenta clicar no primeiro item se houver
    const firstOpp = page.getByTestId('opportunity-item').first();
    const count = await firstOpp.count();
    
    if (count > 0) {
      await firstOpp.click();
      await expect(page).toHaveURL(/.*oportunidades\/\d+/);
    } else {
      console.log('Aviso: Nenhuma oportunidade encontrada para testar clique.');
    }
  });
});
