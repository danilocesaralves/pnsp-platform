import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { studios, studioBookings } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createStudio(data: typeof studios.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(studios).values(data);
}

export async function getStudioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studios).where(eq(studios.id, id)).limit(1);
  return result[0];
}

export async function getStudioBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studios).where(eq(studios.slug, slug)).limit(1);
  return result[0];
}

export async function listStudios(opts: {
  state?: string;
  city?: string;
  studioType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(studios.isActive, true), eq(studios.status, "active")];
  if (opts.state) conditions.push(eq(studios.state, opts.state));
  if (opts.city) conditions.push(like(studios.city, `%${opts.city}%`));
  if (opts.studioType) conditions.push(eq(studios.studioType, opts.studioType as any));
  if (opts.search) {
    conditions.push(
      or(
        like(studios.name, `%${opts.search}%`),
        like(studios.description, `%${opts.search}%`),
      ) as any
    );
  }
  return db
    .select()
    .from(studios)
    .where(and(...conditions))
    .orderBy(desc(studios.isVerified), desc(studios.rating), desc(studios.createdAt))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function createBooking(data: typeof studioBookings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(studioBookings).values(data);
}

export async function getBookingsByStudio(studioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studioBookings).where(eq(studioBookings.studioId, studioId)).orderBy(desc(studioBookings.createdAt));
}

export async function getBookingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studioBookings).where(eq(studioBookings.userId, userId)).orderBy(desc(studioBookings.createdAt));
}

export async function getStudioCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(studios).where(eq(studios.isActive, true));
  return Number(result[0]?.count ?? 0);
}
