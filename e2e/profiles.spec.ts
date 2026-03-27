import { test, expect } from "@playwright/test";

test.describe("Perfis", () => {
  test("página de perfis carrega", async ({ page }) => {
    await page.goto("/perfis");

    await expect(page).toHaveURL(/\/perfis/);
  });

  test("exibe heading de perfis", async ({ page }) => {
    await page.goto("/perfis");

    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });

  test("lista perfis ou exibe estado de carregamento", async ({ page }) => {
    await page.goto("/perfis");

    const hasProfiles = page.locator('[data-testid="profile-card"]');
    const hasLoading = page.getByText(/carregando/i);
    const hasCount = page.getByText(/perfis/i);

    await expect(hasCount.or(hasLoading).or(hasProfiles.first())).toBeVisible();
  });
});
