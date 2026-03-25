import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { opportunities, opportunityApplications } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createOpportunity(data: typeof opportunities.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(opportunities).values(data);
}

export async function getOpportunityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
  return result[0];
}

export async function listOpportunities(opts: {
  category?: string;
  state?: string;
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
    conditions.push(eq(opportunities.isActive, true));
    conditions.push(eq(opportunities.status, "active"));
  }
  if (opts.category) conditions.push(eq(opportunities.category, opts.category as any));
  if (opts.state) conditions.push(eq(opportunities.state, opts.state));
  if (opts.userId) conditions.push(eq(opportunities.userId, opts.userId));
  if (opts.status) conditions.push(eq(opportunities.status, opts.status as any));
  if (opts.search) {
    conditions.push(
      or(
        like(opportunities.title, `%${opts.search}%`),
        like(opportunities.description, `%${opts.search}%`),
      ) as any
    );
  }
  return db
    .select()
    .from(opportunities)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(opportunities.createdAt))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function updateOpportunity(id: number, data: Partial<typeof opportunities.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(opportunities).set(data).where(eq(opportunities.id, id));
}

export async function getOpportunityCount(status?: string) {
  const db = await getDb();
  if (!db) return 0;
  const conditions: any[] = [];
  if (status) conditions.push(eq(opportunities.status, status as any));
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(opportunities)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  return Number(result[0]?.count ?? 0);
}

export async function createApplication(data: typeof opportunityApplications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(opportunityApplications).values(data);
}

export async function getApplicationsByOpportunity(opportunityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(opportunityApplications).where(eq(opportunityApplications.opportunityId, opportunityId));
}

export async function getApplicationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(opportunityApplications).where(eq(opportunityApplications.userId, userId)).orderBy(desc(opportunityApplications.createdAt));
}
