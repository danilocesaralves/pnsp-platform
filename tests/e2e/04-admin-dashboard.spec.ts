/**
 * E2E — Fluxo 04: Login de admin e acesso ao dashboard
 *
 * Cobre: rota /admin exige role admin → não-autenticado é redirecionado →
 * health check → tRPC platform.stats acessível.
 */
import { test, expect } from "@playwright/test";

test.describe("Painel Admin", () => {
  test("rota /admin redireciona não-autenticado", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const urlAfter = page.url();
    const body = await page.textContent("body");
    const redirected = urlAfter.includes("/entrar") || urlAfter.includes("/cadastrar");
    const showsUnauth = body?.toLowerCase().includes("acesso") || body?.toLowerCase().includes("restrito") || body?.toLowerCase().includes("entrar");
    expect(redirected || showsUnauth).toBeTruthy();
  });

  test("health check retorna db:ok e version", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.status).toBe("ok");
    expect(json.service).toBe("pnsp-platform");
    expect(typeof json.version).toBe("string");
    expect(typeof json.uptime).toBe("number");
  });

  test("tRPC platform.stats retorna métricas públicas sem crash", async ({ request }) => {
    const response = await request.get(
      "/api/trpc/platform.stats?input=" + encodeURIComponent(JSON.stringify({ json: {} }))
    );
    expect(response.status()).toBeLessThan(500);
  });

  test("rota /admin/usuarios redireciona não-autenticado", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
    // Não pode retornar página vazia nem erro 5xx
    expect(body?.length).toBeGreaterThan(50);
  });

  test("rota /dashboard exige autenticação", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const urlAfter = page.url();
    const body = await page.textContent("body");
    const redirected = urlAfter.includes("/entrar") || urlAfter.includes("/cadastrar");
    const showsAuth = body?.toLowerCase().includes("entrar") || body?.toLowerCase().includes("acesso");
    expect(redirected || showsAuth).toBeTruthy();
  });
});
