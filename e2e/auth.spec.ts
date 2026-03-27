import { test, expect } from "@playwright/test";

test.describe("Autenticação", () => {
  test("página de login carrega", async ({ page }) => {
    await page.goto("/entrar");

    await expect(page).toHaveURL(/\/entrar/);
  });

  test("formulário de login tem campo de e-mail e senha", async ({ page }) => {
    await page.goto("/entrar");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("botão de entrar está presente", async ({ page }) => {
    await page.goto("/entrar");

    const submitBtn = page.getByRole("button", { name: /entrar/i });
    await expect(submitBtn).toBeVisible();
  });

  test("exibe erro ao submeter credenciais inválidas", async ({ page }) => {
    await page.goto("/entrar");

    await page.fill('input[type="email"]', "invalido@teste.com");
    await page.fill('input[type="password"]', "senhaerrada");
    await page.getByRole("button", { name: /entrar/i }).click();

    const error = page.getByText(/incorretos|inválido|erro/i);
    await expect(error).toBeVisible({ timeout: 10000 });
  });
});
