import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, academyContent, adminLogs, financialRecords, generatedImages,
  notifications, offeringInterests, offerings, opportunityApplications,
  opportunities, platformMetrics, portfolioItems, profiles, studioBookings,
  studios, subscriptions, users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
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
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function getUserCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return Number(result[0]?.count ?? 0);
}

// ─── PROFILES ────────────────────────────────────────────────────────────────
export async function createProfile(data: typeof profiles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(profiles).values(data);
  return result;
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
  const result = await db.select().from(profiles).where(eq(profiles.slug, slug)).limit(1);
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
  if (opts.city) conditions.push(like(profiles.city, `%${opts.city}%`));
  if (opts.featured) conditions.push(eq(profiles.isFeatured, true));
  if (opts.search) {
    conditions.push(
      or(
        like(profiles.displayName, `%${opts.search}%`),
        like(profiles.bio, `%${opts.search}%`),
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

// ─── OFFERINGS ────────────────────────────────────────────────────────────────
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

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
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

// ─── STUDIOS ──────────────────────────────────────────────────────────────────
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

// ─── ACADEMY ──────────────────────────────────────────────────────────────────
export async function createAcademyContent(data: typeof academyContent.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(academyContent).values(data);
}

export async function getAcademyContentBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(academyContent).where(eq(academyContent.slug, slug)).limit(1);
  return result[0];
}

export async function getAcademyContentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(academyContent).where(eq(academyContent.id, id)).limit(1);
  return result[0];
}

export async function listAcademyContent(opts: {
  category?: string;
  contentType?: string;
  level?: string;
  search?: string;
  limit?: number;
  offset?: number;
  isPremium?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(academyContent.isPublished, true)];
  if (opts.category) conditions.push(eq(academyContent.category, opts.category as any));
  if (opts.contentType) conditions.push(eq(academyContent.contentType, opts.contentType as any));
  if (opts.level) conditions.push(eq(academyContent.level, opts.level as any));
  if (opts.isPremium !== undefined) conditions.push(eq(academyContent.isPremium, opts.isPremium));
  if (opts.search) {
    conditions.push(
      or(
        like(academyContent.title, `%${opts.search}%`),
        like(academyContent.excerpt, `%${opts.search}%`),
      ) as any
    );
  }
  return db
    .select()
    .from(academyContent)
    .where(and(...conditions))
    .orderBy(desc(academyContent.publishedAt))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function getAcademyContentCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(academyContent).where(eq(academyContent.isPublished, true));
  return Number(result[0]?.count ?? 0);
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  return db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(20);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  return db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

// ─── ADMIN LOGS ───────────────────────────────────────────────────────────────
export async function createAdminLog(data: typeof adminLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  return db.insert(adminLogs).values(data);
}

export async function getAdminLogs(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt)).limit(limit);
}

// ─── FINANCIAL RECORDS ────────────────────────────────────────────────────────
export async function createFinancialRecord(data: typeof financialRecords.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  return db.insert(financialRecords).values(data);
}

export async function getFinancialRecords(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(financialRecords).orderBy(desc(financialRecords.recordedAt)).limit(limit);
}

export async function getTotalRevenue() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(financialRecords)
    .where(eq(financialRecords.type, "receita"));
  return Number(result[0]?.total ?? 0);
}

export async function getTotalCosts() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(financialRecords)
    .where(eq(financialRecords.type, "custo"));
  return Number(result[0]?.total ?? 0);
}

// ─── PLATFORM METRICS ─────────────────────────────────────────────────────────
export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return null;
  const [
    userCount,
    profileCount,
    offeringCount,
    opportunityCount,
    studioCount,
    academyCount,
    revenue,
    costs,
    profilesByType,
  ] = await Promise.all([
    getUserCount(),
    getProfileCount(),
    getOfferingCount("active"),
    getOpportunityCount("active"),
    getStudioCount(),
    getAcademyContentCount(),
    getTotalRevenue(),
    getTotalCosts(),
    getProfileCountByType(),
  ]);
  return {
    userCount,
    profileCount,
    offeringCount,
    opportunityCount,
    studioCount,
    academyCount,
    revenue,
    costs,
    profit: revenue - costs,
    margin: revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0,
    profilesByType,
  };
}

// ─── GENERATED IMAGES ────────────────────────────────────────────────────────
export async function saveGeneratedImage(data: typeof generatedImages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(generatedImages).values(data);
}

export async function getUserGeneratedImages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generatedImages).where(eq(generatedImages.userId, userId)).orderBy(desc(generatedImages.createdAt)).limit(20);
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))).limit(1);
  return result[0];
}

export async function upsertSubscription(data: typeof subscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(subscriptions).values(data).onDuplicateKeyUpdate({ set: data });
}

// ─── PUBLIC STATS (sem autenticação) ─────────────────────────────────────────
export async function getPublicStats() {
  const db = await getDb();
  if (!db) return { profileCount: 0, opportunityCount: 0, cityCount: 0, studioCount: 0 };
  const [profileCount, opportunityCount, studioCount, cityResult] = await Promise.all([
    getProfileCount(),
    getOpportunityCount("active"),
    getStudioCount(),
    db.select({ city: profiles.city })
      .from(profiles)
      .where(and(eq(profiles.isActive, true), sql`${profiles.city} IS NOT NULL AND ${profiles.city} != ''`))
      .groupBy(profiles.city),
  ]);
  return {
    profileCount,
    opportunityCount,
    studioCount,
    cityCount: cityResult.length,
  };
}

// ─── DASHBOARD ANALYTICS ─────────────────────────────────────────────────────
export async function getProfilesByState() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ state: profiles.state, count: sql<number>`count(*)` })
    .from(profiles)
    .where(and(eq(profiles.isActive, true), sql`${profiles.state} IS NOT NULL AND ${profiles.state} != ''`))
    .groupBy(profiles.state)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(10);
}

export async function getMonthlyGrowth() {
  const db = await getDb();
  if (!db) return [];
  // Get counts grouped by month for the last 6 months (createdAt is native timestamp)
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const [profileGrowth, userGrowth, offeringGrowth] = await Promise.all([
    db.select({
      month: sql<string>`DATE_FORMAT(${profiles.createdAt}, '%Y-%m')`,
      count: sql<number>`count(*)`,
    })
      .from(profiles)
      .where(sql`${profiles.createdAt} >= ${sixMonthsAgo}`)
      .groupBy(sql`DATE_FORMAT(${profiles.createdAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${profiles.createdAt}, '%Y-%m')`),
    db.select({
      month: sql<string>`DATE_FORMAT(${users.createdAt}, '%Y-%m')`,
      count: sql<number>`count(*)`,
    })
      .from(users)
      .where(sql`${users.createdAt} >= ${sixMonthsAgo}`)
      .groupBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`),
    db.select({
      month: sql<string>`DATE_FORMAT(${offerings.createdAt}, '%Y-%m')`,
      count: sql<number>`count(*)`,
    })
      .from(offerings)
      .where(sql`${offerings.createdAt} >= ${sixMonthsAgo}`)
      .groupBy(sql`DATE_FORMAT(${offerings.createdAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${offerings.createdAt}, '%Y-%m')`),
  ]);
  // Merge into unified monthly data
  const months = new Set([
    ...profileGrowth.map(r => r.month),
    ...userGrowth.map(r => r.month),
    ...offeringGrowth.map(r => r.month),
  ]);
  return Array.from(months).sort().map(month => {
    const shortMonth = new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    return {
      mes: shortMonth,
      perfis: profileGrowth.find(r => r.month === month)?.count ?? 0,
      usuarios: userGrowth.find(r => r.month === month)?.count ?? 0,
      ofertas: offeringGrowth.find(r => r.month === month)?.count ?? 0,
    };
  });
}
