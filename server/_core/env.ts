import { z } from "zod";

const envSchema = z.object({
  VITE_APP_ID: z.string().min(1, "VITE_APP_ID is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  DATABASE_URL: z.string().default(""),
  OAUTH_SERVER_URL: z.string().min(1, "OAUTH_SERVER_URL is required"),
  OWNER_OPEN_ID: z.string().default(""),
  OWNER_NAME: z.string().default(""),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().default("https://api.manus.im"),
  BUILT_IN_FORGE_API_KEY: z.string().default(""),
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  VITE_FRONTEND_FORGE_API_KEY: z.string().optional(),
  VITE_FRONTEND_FORGE_API_URL: z.string().optional(),
  VITE_OAUTH_PORTAL_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  if (process.env.NODE_ENV !== "test") {
    // In production/development, exit hard on bad env
    process.stderr.write(`[env] Invalid environment variables: ${missing}\n`);
    process.exit(1);
  } else {
    // In test mode, throw so the test runner surfaces the error
    throw new Error(`Invalid environment variables: ${missing}`);
  }
}

const e = parsed.data;

export const ENV = {
  appId: e.VITE_APP_ID,
  cookieSecret: e.JWT_SECRET,
  databaseUrl: e.DATABASE_URL,
  oAuthServerUrl: e.OAUTH_SERVER_URL,
  ownerOpenId: e.OWNER_OPEN_ID,
  ownerName: e.OWNER_NAME,
  isProduction: e.NODE_ENV === "production",
  forgeApiUrl: e.BUILT_IN_FORGE_API_URL,
  forgeApiKey: e.BUILT_IN_FORGE_API_KEY,
  stripeSecretKey: e.STRIPE_SECRET_KEY,
  stripeWebhookSecret: e.STRIPE_WEBHOOK_SECRET,
};
