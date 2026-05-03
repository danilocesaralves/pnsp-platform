import { test, expect } from '@playwright/test';

test.describe('Busca e Filtros', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve buscar perfis na home', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('samba');
    await searchInput.press('Enter');
    
    // A busca na home redireciona para /perfis?q=samba
    await expect(page).toHaveURL(/.*perfis\?q=samba/);
  });

  test('deve filtrar por tipo de perfil na home', async ({ page }) => {
    // Na Home.tsx, o filter-artista é um link "Ver todos os perfis" 
    // ou um filtro que redireciona. O requisito pede clicar em filter-artista.
    await page.click('[data-testid="filter-artista"]');
    await expect(page).toHaveURL(/.*perfis/);
  });

  test('deve exibir resultados de destaque na home', async ({ page }) => {
    await expect(page.getByTestId('search-results')).toBeVisible();
  });
});
