import { test, expect } from "@playwright/test";

test.describe("Páginas públicas", () => {
  test("home carrega com título PNSP e hero visível", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PNSP/i);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("listagem de perfis é acessível sem autenticação", async ({ page }) => {
    await page.goto("/perfis");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("academia é acessível sem autenticação", async ({ page }) => {
    await page.goto("/academia");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("comunidade é acessível sem autenticação", async ({ page }) => {
    await page.goto("/comunidade");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
