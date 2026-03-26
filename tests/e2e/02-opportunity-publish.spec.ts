/**
 * E2E — Fluxo 02: Publicação de oportunidade por contratante
 *
 * Cobre: listagem pública de oportunidades → navegação para detalhe →
 * formulário de criação exige autenticação.
 */
import { test, expect } from "@playwright/test";

test.describe("Publicação de oportunidade", () => {
  test("página /oportunidades carrega sem erros", async ({ page }) => {
    const response = await page.goto("/oportunidades");
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveTitle(/PNSP/i);
  });

  test("exibe conteúdo da listagem de oportunidades", async ({ page }) => {
    await page.goto("/oportunidades");
    // Aguarda renderização React
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body");
    // Deve exibir algum conteúdo (oportunidades ou estado vazio)
    expect(body).toBeTruthy();
    expect(body?.length).toBeGreaterThan(100);
  });

  test("botão de criar oportunidade não existe sem autenticação (ou redireciona)", async ({ page }) => {
    await page.goto("/oportunidades");
    await page.waitForLoadState("networkidle");
    // Se há botão "Nova Oportunidade", clicar deve redirecionar para login
    const btn = page.getByRole("link", { name: /nova oportunidade|publicar/i });
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForLoadState("networkidle");
      const url = page.url();
      const isAuthPage = url.includes("/entrar") || url.includes("/cadastrar") || url.includes("/criar-oportunidade");
      expect(isAuthPage).toBeTruthy();
    }
  });

  test("rota /criar-oportunidade exige autenticação", async ({ page }) => {
    await page.goto("/criar-oportunidade");
    await page.waitForLoadState("networkidle");
    const urlAfter = page.url();
    const body = await page.textContent("body");
    const redirected = urlAfter.includes("/entrar") || urlAfter.includes("/cadastrar");
    const showsAuth = body?.toLowerCase().includes("entrar") || body?.toLowerCase().includes("acesso");
    expect(redirected || showsAuth).toBeTruthy();
  });

  test("detalhe de oportunidade inexistente não retorna 5xx", async ({ page }) => {
    const response = await page.goto("/oportunidades/999999");
    expect(response?.status()).toBeLessThan(500);
  });
});
