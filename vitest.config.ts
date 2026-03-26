import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    env: {
      DATABASE_URL: "",
      JWT_SECRET: "test-secret-32-chars-minimum-xxxx",
      VITE_APP_ID: "test",
      OAUTH_SERVER_URL: "https://api.manus.im",
      OWNER_OPEN_ID: "test-owner",
      BUILT_IN_FORGE_API_URL: "https://api.manus.im",
      BUILT_IN_FORGE_API_KEY: "test-key",
      STRIPE_SECRET_KEY: "sk_test_placeholder",
      STRIPE_WEBHOOK_SECRET: "whsec_placeholder",
    },
  },
});
