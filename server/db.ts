import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../drizzle/schema";
import { dbLogger } from "./lib/logger";
import { eq } from "drizzle-orm";

let _db: PostgresJsDatabase | null = null;

export async function getDb(): Promise<PostgresJsDatabase | null> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const client = postgres(url, { max: 10 });
    _db = drizzle(client);
  } catch (error) {
    dbLogger.warn({ err: error }, "Database connection failed");
  }
  return _db;
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
