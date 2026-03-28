import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { profiles, portfolioItems } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createProfile(data: typeof profiles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(profiles).values(data);
}

export async function getProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return result[0];
}

export async function getProfileBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles)
    .where(sql`LOWER(${profiles.slug}) = ${slug.toLowerCase()}`)
    .limit(1);
  return result[0];
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function updateProfile(id: number, data: Partial<typeof profiles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(profiles).set(data).where(eq(profiles.id, id));
}

export async function listProfiles(opts: {
  profileType?: string;
  city?: string;
  state?: string;
  search?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(profiles.isActive, true), eq(profiles.status, "active")];
  if (opts.profileType) conditions.push(eq(profiles.profileType, opts.profileType as any));
  if (opts.state) conditions.push(eq(profiles.state, opts.state));
  if (opts.city) conditions.push(ilike(profiles.city, `%${opts.city}%`));
  if (opts.featured) conditions.push(eq(profiles.isFeatured, true));
  if (opts.search) {
    conditions.push(
      or(
        ilike(profiles.displayName, `%${opts.search}%`),
        ilike(profiles.bio, `%${opts.search}%`),
        ilike(profiles.city, `%${opts.search}%`),
        ilike(profiles.state, `%${opts.search}%`),
      ) as any
    );
  }
  return db
    .select()
    .from(profiles)
    .where(and(...conditions))
    .orderBy(desc(profiles.isFeatured), desc(profiles.viewCount), desc(profiles.createdAt))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function listFeaturedProfiles(limit = 8) {
  return listProfiles({ featured: true, limit });
}

export async function getProfileCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.isActive, true));
  return Number(result[0]?.count ?? 0);
}

export async function getProfileCountByType() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ profileType: profiles.profileType, count: sql<number>`count(*)` })
    .from(profiles)
    .where(eq(profiles.isActive, true))
    .groupBy(profiles.profileType);
}

export async function incrementProfileView(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(profiles).set({ viewCount: sql`${profiles.viewCount} + 1` }).where(eq(profiles.id, id));
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
export async function getPortfolioByProfileId(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioItems).where(eq(portfolioItems.profileId, profileId)).orderBy(portfolioItems.sortOrder);
}

export async function addPortfolioItem(data: typeof portfolioItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(portfolioItems).values(data);
}

export async function deletePortfolioItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.delete(portfolioItems).where(eq(portfolioItems.id, id));
}
