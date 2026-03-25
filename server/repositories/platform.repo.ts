import { and, desc, eq, sql } from "drizzle-orm";
import {
  adminLogs, financialRecords, generatedImages, notifications,
  profiles, subscriptions,
} from "../../drizzle/schema";
import { getDb } from "../db";
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

// ─── PLATFORM STATS ──────────────────────────────────────────────────────────
export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return null;
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

// ─── PUBLIC STATS ────────────────────────────────────────────────────────────
export async function getPublicStats() {
  const db = await getDb();
  if (!db) return { profileCount: 0, opportunityCount: 0, cityCount: 0, studioCount: 0 };
  const [profileCount, opportunityCount, studioCount, cityResult] = await Promise.all([
    getProfileCount(),
    getOpportunityCount("active"),
    getStudioCount(),
    (db as any).execute(
      `SELECT COUNT(DISTINCT \`city\`) as \`cnt\` FROM \`profiles\` WHERE \`isActive\` = 1 AND \`city\` IS NOT NULL AND \`city\` != ''`
    ),
  ]);
  const cityCount = Number((cityResult as any)?.[0]?.[0]?.cnt ?? 0);
  return { profileCount, opportunityCount, studioCount, cityCount };
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
  const runQuery = async (table: string): Promise<Array<{ month: string; count: string }>> => {
    try {
      const [rows] = await (db as any).execute(
        `SELECT DATE_FORMAT(\`createdAt\`, '%Y-%m') AS \`month\`, COUNT(*) AS \`count\`
         FROM \`${table}\`
         WHERE \`createdAt\` >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY \`month\`
         ORDER BY \`month\``
      );
      return (rows ?? []) as Array<{ month: string; count: string }>;
    } catch (err) {
      console.error(`[Analytics] Monthly growth query failed for ${table}:`, err);
      return [];
    }
  };
  const [profileGrowth, userGrowth, offeringGrowth] = await Promise.all([
    runQuery("profiles"),
    runQuery("users"),
    runQuery("offerings"),
  ]);
  const months = new Set([
    ...profileGrowth.map(r => r.month),
    ...userGrowth.map(r => r.month),
    ...offeringGrowth.map(r => r.month),
  ]);
  return Array.from(months).sort().map(month => {
    const shortMonth = new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    return {
      mes: shortMonth,
      perfis: Number(profileGrowth.find(r => r.month === month)?.count ?? 0),
      usuarios: Number(userGrowth.find(r => r.month === month)?.count ?? 0),
      ofertas: Number(offeringGrowth.find(r => r.month === month)?.count ?? 0),
    };
  });
}
