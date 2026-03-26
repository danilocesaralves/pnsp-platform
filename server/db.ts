import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
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
// Used by server/_core/oauth.ts for the OAuth callback flow.
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Partial<InsertUser> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    (values as Record<string, unknown>)[field] = value ?? null;
    (updateSet as Record<string, unknown>)[field] = value ?? null;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "owner";
    updateSet.role = "owner";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  try {
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    dbLogger.error({ err: error }, "Failed to upsert user");
    throw error;
  }
}

// getUserByOpenId is used by the auth SDK integration.
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
