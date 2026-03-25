import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { offerings, offeringInterests } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createOffering(data: typeof offerings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(offerings).values(data);
}

export async function getOfferingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(offerings).where(eq(offerings.id, id)).limit(1);
  return result[0];
}

export async function listOfferings(opts: {
  category?: string;
  state?: string;
  city?: string;
  search?: string;
  limit?: number;
  offset?: number;
  status?: string;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (!opts.userId) {
    conditions.push(eq(offerings.isActive, true));
    conditions.push(eq(offerings.status, "active"));
  }
  if (opts.category) conditions.push(eq(offerings.category, opts.category as any));
  if (opts.state) conditions.push(eq(offerings.state, opts.state));
  if (opts.city) conditions.push(like(offerings.city, `%${opts.city}%`));
  if (opts.userId) conditions.push(eq(offerings.userId, opts.userId));
  if (opts.status) conditions.push(eq(offerings.status, opts.status as any));
  if (opts.search) {
    conditions.push(
      or(
        like(offerings.title, `%${opts.search}%`),
        like(offerings.description, `%${opts.search}%`),
      ) as any
    );
  }
  return db
    .select()
    .from(offerings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(offerings.isPremium), desc(offerings.createdAt))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function updateOffering(id: number, data: Partial<typeof offerings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(offerings).set(data).where(eq(offerings.id, id));
}

export async function getOfferingCount(status?: string) {
  const db = await getDb();
  if (!db) return 0;
  const conditions: any[] = [];
  if (status) conditions.push(eq(offerings.status, status as any));
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(offerings)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  return Number(result[0]?.count ?? 0);
}

export async function createOfferingInterest(data: typeof offeringInterests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(offeringInterests).values(data);
}
