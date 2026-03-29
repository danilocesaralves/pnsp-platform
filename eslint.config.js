import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "drizzle/**",
    ],
  },

  // Base JS
  js.configs.recommended,

  // TypeScript + React (client only)
  {
    files: ["client/src/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // ── React Hooks — regra crítica do projeto ──────────────────────────
      "react-hooks/rules-of-hooks":  "error",   // nunca hook dentro de map/callback
      "react-hooks/exhaustive-deps": "warn",

      // ── TypeScript — permissivo para não bloquear o build ───────────────
      "@typescript-eslint/no-explicit-any":          "off",
      "@typescript-eslint/no-unused-vars":           "off",
      "@typescript-eslint/no-unused-expressions":    "off",
      "@typescript-eslint/no-require-imports":       "off",
    },
  },

  // Server TypeScript
  {
    files: ["server/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-explicit-any":       "off",
      "@typescript-eslint/no-unused-vars":        "off",
      "@typescript-eslint/no-require-imports":    "off",
    },
  },
);
