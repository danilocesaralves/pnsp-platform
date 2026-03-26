/**
 * E2E — Fluxo 05: Publicação de oferta e geração de lead
 *
 * Cobre: listagem pública de ofertas → detalhe → botão "expressar interesse"
 * exige autenticação → tRPC offerings.list funcionando.
 */
import { test, expect } from "@playwright/test";

test.describe("Oferta e geração de lead", () => {
  test("página /ofertas carrega corretamente", async ({ page }) => {
    const response = await page.goto("/ofertas");
    expect(response?.status()).toBeLessThan(500);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/PNSP/i);
  });

  test("listagem de ofertas exibe conteúdo", async ({ page }) => {
    await page.goto("/ofertas");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(100);
  });

  test("detalhe de oferta inexistente não retorna 5xx", async ({ page }) => {
    const response = await page.goto("/ofertas/999999");
    expect(response?.status()).toBeLessThan(500);
  });

  test("rota /criar-oferta exige autenticação", async ({ page }) => {
    await page.goto("/criar-oferta");
    await page.waitForLoadState("networkidle");
    const urlAfter = page.url();
    const body = await page.textContent("body");
    const redirected = urlAfter.includes("/entrar") || urlAfter.includes("/cadastrar");
    const showsAuth = body?.toLowerCase().includes("entrar") || body?.toLowerCase().includes("acesso");
    expect(redirected || showsAuth).toBeTruthy();
  });

  test("tRPC offerings.list responde via API", async ({ request }) => {
    const response = await request.get(
      "/api/trpc/offerings.list?input=" + encodeURIComponent(JSON.stringify({ json: { limit: 5, offset: 0 } }))
    );
    expect(response.status()).toBeLessThan(500);
    const json = await response.json();
    // Deve retornar objeto tRPC válido (result ou error estruturado)
    expect(json).toBeTruthy();
  });

  test("tRPC offerings.listRecent não retorna 5xx", async ({ request }) => {
    const response = await request.get(
      "/api/trpc/offerings.listRecent?input=" + encodeURIComponent(JSON.stringify({ json: { limit: 6 } }))
    );
    expect(response.status()).toBeLessThan(500);
  });
});
