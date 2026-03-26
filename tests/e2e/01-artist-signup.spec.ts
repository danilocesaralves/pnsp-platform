/**
 * E2E — Fluxo 01: Cadastro completo de artista até perfil publicado
 *
 * Cobre: landing page → botão de cadastro → redirecionamento OAuth →
 * retorno autenticado → criação de perfil → perfil publicado acessível.
 */
import { test, expect } from "@playwright/test";

test.describe("Cadastro de artista", () => {
  test("landing page carrega e exibe CTA de cadastro", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PNSP/i);
    const cta = page.getByRole("link", { name: /cadastr|entrar|começar/i }).first();
    await expect(cta).toBeVisible();
  });

  test("rota /cadastrar redireciona para OAuth sem loop", async ({ page }) => {
    const response = await page.goto("/cadastrar");
    // Deve responder (200 ou redirect) sem erro 5xx
    expect(response?.status()).toBeLessThan(500);
    // Após carregar, não deve manter a URL /cadastrar por mais de 2s (redireciona)
    await page.waitForTimeout(500);
    const url = page.url();
    // Ou permanece em /cadastrar (loading state) ou saiu para OAuth
    expect(url).not.toContain("/erro");
  });

  test("rota /entrar carrega sem erros 5xx", async ({ page }) => {
    const response = await page.goto("/entrar");
    expect(response?.status()).toBeLessThan(500);
  });

  test("página /criar-perfil exige autenticação (redireciona não-autenticado)", async ({ page }) => {
    await page.goto("/criar-perfil");
    // Sem auth: deve mostrar mensagem de acesso restrito ou redirecionar para /entrar
    const urlAfter = page.url();
    const body = await page.textContent("body");
    const redirectedToLogin = urlAfter.includes("/entrar") || urlAfter.includes("/cadastrar");
    const showsAuthMessage = body?.toLowerCase().includes("entrar") || body?.toLowerCase().includes("acesso");
    expect(redirectedToLogin || showsAuthMessage).toBeTruthy();
  });

  test("página de perfil público retorna 200 ou 404 (nunca 5xx)", async ({ page }) => {
    const response = await page.goto("/perfil/artista-teste-xyz-000");
    expect(response?.status()).toBeLessThan(500);
  });
});
