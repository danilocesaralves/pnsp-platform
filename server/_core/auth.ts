import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { authUser, sessions, authAccount, authVerification } from "../../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const pg = postgres(DATABASE_URL, { max: 5 });
const authDb = drizzle(pg);

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "";

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema: {
      user: authUser,
      session: sessions,
      account: authAccount,
      verification: authVerification,
    },
  }),
  secret: process.env.JWT_SECRET ?? "fallback-secret-min-32-chars-change-in-prod",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,    // 30 days
    updateAge: 60 * 60 * 24,           // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: { enabled: false },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    ...(CORS_ORIGIN ? CORS_ORIGIN.split(",").map((o) => o.trim()) : []),
  ],
});
