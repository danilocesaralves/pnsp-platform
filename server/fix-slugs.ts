/**
 * One-shot migration: lowercase all slugs in profiles, studios and academyContent.
 * Run once: pnpm tsx server/fix-slugs.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL ausente no .env");

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  const tables = ["profiles", "studios", "academy_content"] as const;
  for (const table of tables) {
    const result = await db.execute(
      sql.raw(`UPDATE ${table} SET slug = LOWER(slug) WHERE slug != LOWER(slug)`)
    );
    const count = (result as any).count ?? (result as any).rowCount ?? "?";
    console.log(`${table}: ${count} row(s) updated`);
  }
  console.log("Done.");
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
