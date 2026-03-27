import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("carrega a página inicial com identidade PNSP", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/PNSP/i);
  });

  test("exibe o hero com texto principal", async ({ page }) => {
    await page.goto("/");

    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();
  });

  test("links de navegação estão presentes", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /perfis/i }).first()).toBeVisible();
  });
});
