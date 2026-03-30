import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql, count, isNull, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  agencyCampaigns, 
  agencyContents, 
  agencyActions, 
  agencyAlerts, 
  agencyReinvestmentRules, 
  agencyPlatformMetrics, 
  agencyEcosystemScores,
  agencyLearningLog,
  prelaunchWaitlist,
  profiles,
  bookings
} from "../../drizzle/schema";
import { runDailyEngine, publishContent, evaluateReinvestment, executeReinvestment } from "../lib/marketing-agency";

// ─── AGENCY ROUTER ────────────────────────────────────────────────────────────

export const agencyRouter = router({
  // ─── PUBLIC: PRE-LAUNCH / WAITLIST ─────────────────────────────────────────
  joinWaitlist: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      city: z.string().optional(),
      profileType: z.string().optional(),
      referralCode: z.string().optional(),
      attributionTag: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if already exists
      const [existing] = await db.select().from(prelaunchWaitlist).where(eq(prelaunchWaitlist.email, input.email)).limit(1);
      if (existing) return { 
        position: existing.position, 
        referralCode: existing.referralCode,
        alreadyRegistered: true 
      };

      // Find referrer
      let referredById: number | null = null;
      if (input.referralCode) {
        const [referrer] = await db.select().from(prelaunchWaitlist).where(eq(prelaunchWaitlist.referralCode, input.referralCode)).limit(1);
        if (referrer) {
          referredById = referrer.id;
          // Increment referrer's count
          await db.update(prelaunchWaitlist)
            .set({ referralCount: referrer.referralCount + 1 })
            .where(eq(prelaunchWaitlist.id, referrer.id));
        }
      }

      const myReferralCode = nanoid(8);
      const [total] = await db.select({ count: count() }).from(prelaunchWaitlist);
      const position = total.count + 1;

      const [waitlistEntry] = await db.insert(prelaunchWaitlist).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        city: input.city,
        profileType: input.profileType,
        referredBy: referredById,
        referralCode: myReferralCode,
        position,
        attributionTag: input.attributionTag,
      }).returning();

      return {
        position: waitlistEntry.position,
        referralCode: waitlistEntry.referralCode,
        referralLink: `https://pnsp-platform.vercel.app/pre-lancamento?ref=${waitlistEntry.referralCode}`
      };
    }),

  getWaitlistPosition: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [entry] = await db.select().from(prelaunchWaitlist).where(eq(prelaunchWaitlist.email, input.email)).limit(1);
      if (!entry) throw new TRPCError({ code: "NOT_FOUND", message: "E-mail não encontrado na lista" });

      return {
        position: entry.position,
        referralCount: entry.referralCount,
        referralCode: entry.referralCode
      };
    }),

  // ─── PROTECTED: AGENCY ADMIN ────────────────────────────────────────────────
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      // Guard: only specific email (or admin role)
      if (ctx.user.email !== "composisamba@gmail.com" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [todayMetrics] = await db.select().from(agencyPlatformMetrics).orderBy(desc(agencyPlatformMetrics.date)).limit(1);
      const activeAlerts = await db.select().from(agencyAlerts).where(eq(agencyAlerts.isRead, false));
      const activeCampaigns = await db.select().from(agencyCampaigns).where(eq(agencyCampaigns.status, "ativa"));
      const pendingContents = await db.select().from(agencyContents).where(eq(agencyContents.status, "rascunho"));
      const recentActions = await db.select().from(agencyActions).orderBy(desc(agencyActions.executedAt)).limit(10);
      const scores = await db.select().from(agencyEcosystemScores).orderBy(desc(agencyEcosystemScores.calculatedAt)).limit(50);
      const rules = await db.select().from(agencyReinvestmentRules);

      return {
        todayMetrics,
        activeAlerts,
        activeCampaigns,
        pendingContents,
        recentActions,
        scores,
        rules
      };
    }),

  getMetricsHistory: protectedProcedure
    .input(z.object({ days: z.enum(["7", "30", "90"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      return db.select().from(agencyPlatformMetrics)
        .orderBy(desc(agencyPlatformMetrics.date))
        .limit(parseInt(input.days));
    }),

  dismissAlert: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(agencyAlerts).set({ isRead: true }).where(eq(agencyAlerts.id, input.id));
      return { success: true };
    }),

  approveContent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(agencyContents).set({ status: "aprovado" }).where(eq(agencyContents.id, input.id));
      return { success: true };
    }),

  approveAllContents: protectedProcedure
    .mutation(async () => {
      const db = await getDb();
      await db.update(agencyContents).set({ status: "aprovado" }).where(eq(agencyContents.status, "rascunho"));
      return { success: true };
    }),

  publishContentManual: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await publishContent(input.id);
      return { success: true };
    }),

  triggerDailyEngine: protectedProcedure
    .mutation(async () => {
      return runDailyEngine();
    }),

  getPreLaunchStats: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [total] = await db.select({ count: count() }).from(prelaunchWaitlist);
      const topReferrers = await db.select().from(prelaunchWaitlist).orderBy(desc(prelaunchWaitlist.referralCount)).limit(5);

      return {
        totalSubscribers: total.count,
        topReferrers,
        checklistStatus: {
          anthropicKey: !!process.env.ANTHROPIC_API_KEY,
          resendKey: !!process.env.RESEND_API_KEY,
          vapidKeys: !!process.env.VAPID_PUBLIC_KEY,
          zapiConfigured: !!(process.env.ZAPI_INSTANCE && process.env.ZAPI_TOKEN),
          waitlistTarget: total.count >= 500,
        }
      };
    }),
});
