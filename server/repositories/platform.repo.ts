import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm";
import {
  adminLogs, financialRecords, generatedImages, notifications,
  offerings, profiles, subscriptions, users,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { dbLogger } from "../lib/logger";
import { getUserCount } from "./users.repo";
import { getProfileCount, getProfileCountByType } from "./profiles.repo";
import { getOfferingCount } from "./offerings.repo";
import { getOpportunityCount } from "./opportunities.repo";
import { getStudioCount } from "./studios.repo";
import { getAcademyContentCount } from "./academy.repo";

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  return db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
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
  return db
    .select()
    .from(financialRecords)
    .orderBy(desc(financialRecords.recordedAt))
    .limit(limit);
}

export async function getTotalRevenue() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(financialRecords)
    .where(eq(financialRecords.type, "receita"));
  return Number(result[0]?.total ?? 0);
}

export async function getTotalCosts() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(financialRecords)
    .where(eq(financialRecords.type, "custo"));
  return Number(result[0]?.total ?? 0);
}

// ─── PLATFORM STATS ──────────────────────────────────────────────────────────
const EMPTY_STATS = {
  userCount: 0, profileCount: 0, offeringCount: 0, opportunityCount: 0,
  studioCount: 0, academyCount: 0, revenue: 0, costs: 0, profit: 0, margin: 0,
  profilesByType: [] as Array<{ profileType: string | null; count: number }>,
};

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return EMPTY_STATS;
  const [
    userCount, profileCount, offeringCount, opportunityCount,
    studioCount, academyCount, revenue, costs, profilesByType,
  ] = await Promise.all([
    getUserCount(), getProfileCount(), getOfferingCount("active"),
    getOpportunityCount("active"), getStudioCount(), getAcademyContentCount(),
    getTotalRevenue(), getTotalCosts(), getProfileCountByType(),
  ]);
  return {
    userCount, profileCount, offeringCount, opportunityCount,
    studioCount, academyCount, revenue, costs,
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
  return db
    .select()
    .from(generatedImages)
    .where(eq(generatedImages.userId, userId))
    .orderBy(desc(generatedImages.createdAt))
    .limit(20);
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);
  return result[0];
}

export async function upsertSubscription(data: typeof subscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.stripeSubscriptionId) {
    return db
      .insert(subscriptions)
      .values(data)
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set: data,
      });
  }
  return db.insert(subscriptions).values(data);
}

// ─── PUBLIC STATS (sem autenticação) ─────────────────────────────────────────
export async function getPublicStats() {
  const db = await getDb();
  if (!db) return { profileCount: 0, opportunityCount: 0, cityCount: 0, studioCount: 0 };

  const [profileCount, opportunityCount, studioCount, cityResult] = await Promise.all([
    getProfileCount(),
    getOpportunityCount("active"),
    getStudioCount(),
    db
      .select({ cnt: sql<number>`COUNT(DISTINCT ${profiles.city})` })
      .from(profiles)
      .where(
        and(
          eq(profiles.isActive, true),
          isNotNull(profiles.city),
          ne(profiles.city, ""),
        ),
      ),
  ]);

  return {
    profileCount,
    opportunityCount,
    studioCount,
    cityCount: Number(cityResult[0]?.cnt ?? 0),
  };
}

// ─── DASHBOARD ANALYTICS ─────────────────────────────────────────────────────
export async function getProfilesByState() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ state: profiles.state, count: sql<number>`count(*)` })
    .from(profiles)
    .where(
      and(
        eq(profiles.isActive, true),
        isNotNull(profiles.state),
        ne(profiles.state, ""),
      ),
    )
    .groupBy(profiles.state)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(10);
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return {
    totalProfiles: 0, totalUsers: 0, totalOpportunities: 0, totalOfferings: 0,
    totalStudios: 0, totalCities: 0, verifiedProfiles: 0, activeProfiles: 0,
  };
  const [base, extraResult] = await Promise.all([
    getPlatformStats(),
    db
      .select({
        verifiedProfiles: sql<number>`COUNT(*) FILTER (WHERE ${profiles.isVerified} = true)::int`,
        totalCities: sql<number>`COUNT(DISTINCT ${profiles.city}) FILTER (WHERE ${profiles.city} IS NOT NULL AND ${profiles.city} != '')::int`,
      })
      .from(profiles)
      .where(eq(profiles.isActive, true)),
  ]);
  const extra = extraResult[0] ?? { verifiedProfiles: 0, totalCities: 0 };
  return {
    totalProfiles: base.profileCount,
    totalUsers: base.userCount,
    totalOpportunities: base.opportunityCount,
    totalOfferings: base.offeringCount,
    totalStudios: base.studioCount,
    totalCities: Number(extra.totalCities),
    verifiedProfiles: Number(extra.verifiedProfiles),
    activeProfiles: base.profileCount,
  };
}

export async function getHealthMetrics() {
  const db = await getDb();
  if (!db) return { total: 0, withAvatar: 0, withBio: 0, withPhone: 0, withInstagram: 0, withCover: 0 };
  const result = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      withAvatar: sql<number>`COUNT(*) FILTER (WHERE ${profiles.avatarUrl} IS NOT NULL AND ${profiles.avatarUrl} != '')::int`,
      withBio: sql<number>`COUNT(*) FILTER (WHERE ${profiles.bio} IS NOT NULL AND ${profiles.bio} != '')::int`,
      withPhone: sql<number>`COUNT(*) FILTER (WHERE ${profiles.phone} IS NOT NULL AND ${profiles.phone} != '')::int`,
      withInstagram: sql<number>`COUNT(*) FILTER (WHERE ${profiles.instagramUrl} IS NOT NULL AND ${profiles.instagramUrl} != '')::int`,
      withCover: sql<number>`COUNT(*) FILTER (WHERE ${profiles.coverUrl} IS NOT NULL AND ${profiles.coverUrl} != '')::int`,
    })
    .from(profiles)
    .where(eq(profiles.isActive, true));
  const row = result[0] ?? { total: 0, withAvatar: 0, withBio: 0, withPhone: 0, withInstagram: 0, withCover: 0 };
  return {
    total: Number(row.total),
    withAvatar: Number(row.withAvatar),
    withBio: Number(row.withBio),
    withPhone: Number(row.withPhone),
    withInstagram: Number(row.withInstagram),
    withCover: Number(row.withCover),
  };
}

export async function getProfileGrowthData() {
  const db = await getDb();
  if (!db) return [];
  try {
    return db
      .select({
        month: sql<string>`TO_CHAR(${profiles.createdAt}, 'YYYY-MM')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(profiles)
      .where(sql`${profiles.createdAt} >= NOW() - INTERVAL '6 months'`)
      .groupBy(sql`TO_CHAR(${profiles.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${profiles.createdAt}, 'YYYY-MM')`);
  } catch (err) {
    dbLogger.error({ err }, "getProfileGrowthData failed");
    return [];
  }
}

export async function getMonthlyGrowth() {
  const db = await getDb();
  if (!db) return [];

  type GrowthRow = { month: string; count: string };

  const runQuery = async (
    table: typeof profiles | typeof users | typeof offerings,
  ): Promise<GrowthRow[]> => {
    try {
      return db
        .select({
          month: sql<string>`TO_CHAR(${table.createdAt}, 'YYYY-MM')`,
          count: sql<string>`COUNT(*)::text`,
        })
        .from(table as typeof profiles)
        .where(sql`${table.createdAt} >= NOW() - INTERVAL '6 months'`)
        .groupBy(sql`TO_CHAR(${table.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${table.createdAt}, 'YYYY-MM')`);
    } catch (err) {
      dbLogger.error({ err }, "Monthly growth query failed");
      return [];
    }
  };

  const [profileGrowth, userGrowth, offeringGrowth] = await Promise.all([
    runQuery(profiles),
    runQuery(users),
    runQuery(offerings),
  ]);

  const months = new Set([
    ...profileGrowth.map((r) => r.month),
    ...userGrowth.map((r) => r.month),
    ...offeringGrowth.map((r) => r.month),
  ]);

  return Array.from(months)
    .sort()
    .map((month) => {
      const shortMonth = new Date(month + "-01").toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
      return {
        mes: shortMonth,
        perfis: Number(profileGrowth.find((r) => r.month === month)?.count ?? 0),
        usuarios: Number(userGrowth.find((r) => r.month === month)?.count ?? 0),
        ofertas: Number(offeringGrowth.find((r) => r.month === month)?.count ?? 0),
      };
    });
}
