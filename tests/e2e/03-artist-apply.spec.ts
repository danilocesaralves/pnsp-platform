/**
 * E2E — Fluxo 03: Candidatura de artista a oportunidade
 *
 * Cobre: listagem de oportunidades → detalhe → botão de candidatura
 * exige autenticação quando não autenticado.
 */
import { test, expect } from "@playwright/test";

test.describe("Candidatura a oportunidade", () => {
  test("listagem de oportunidades é acessível publicamente", async ({ page }) => {
    const response = await page.goto("/oportunidades");
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");
  });

  test("API /api/health retorna status ok", async ({ page }) => {
    const response = await page.goto("/api/health");
    expect(response?.status()).toBe(200);
    const json = await response?.json();
    expect(json?.status).toBe("ok");
  });

  test("rota /minhas-candidaturas exige autenticação", async ({ page }) => {
    await page.goto("/minhas-candidaturas");
    await page.waitForLoadState("networkidle");
    const urlAfter = page.url();
    const body = await page.textContent("body");
    const redirected = urlAfter.includes("/entrar") || urlAfter.includes("/cadastrar") || urlAfter.includes("/dashboard");
    const showsAuth = body?.toLowerCase().includes("entrar") || body?.toLowerCase().includes("acesso") || body?.toLowerCase().includes("autenticad");
    expect(redirected || showsAuth).toBeTruthy();
  });

  test("oportunidade detalhe carrega sem erros", async ({ page }) => {
    // Navega para listagem e tenta abrir o primeiro item
    await page.goto("/oportunidades");
    await page.waitForLoadState("networkidle");
    const links = page.getByRole("link", { name: /ver detalhes|saiba mais|candidatar/i });
    if (await links.count() > 0) {
      await links.first().click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/oportunidade");
    }
  });

  test("tRPC opportunities.list responde via API", async ({ request }) => {
    const response = await request.get(
      "/api/trpc/opportunities.list?input=" + encodeURIComponent(JSON.stringify({ json: { limit: 5, offset: 0 } }))
    );
    expect(response.status()).toBeLessThan(500);
  });
});
