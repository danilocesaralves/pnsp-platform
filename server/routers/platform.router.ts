import { TRPCError } from "@trpc/server";
import { z } from "zod";
import Stripe from "stripe";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { generateImage } from "../_core/imageGeneration";
import { adminProcedure, ownerProcedure } from "../lib/guards";
import * as repo from "../repositories";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

// ─── MAP ─────────────────────────────────────────────────────────────────────
export const mapRouter = router({
  getMarkers: publicProcedure
    .input(z.object({
      type: z.enum(["profiles","studios","all"]).default("all"),
      state: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const markers: any[] = [];
      if (input.type === "profiles" || input.type === "all") {
        const profs = await repo.listProfiles({ state: input.state, limit: 200 });
        profs.filter(p => p.lat && p.lng).forEach(p => {
          markers.push({
            id: `profile-${p.id}`, type: "profile",
            lat: Number(p.lat), lng: Number(p.lng),
            name: p.displayName, profileType: p.profileType,
            slug: p.slug, avatarUrl: p.avatarUrl,
            city: p.city, state: p.state,
          });
        });
      }
      if (input.type === "studios" || input.type === "all") {
        const studs = await repo.listStudios({ state: input.state, limit: 200 });
        studs.filter(s => s.lat && s.lng).forEach(s => {
          markers.push({
            id: `studio-${s.id}`, type: "studio",
            lat: Number(s.lat), lng: Number(s.lng),
            name: s.name, slug: s.slug,
            imageUrl: s.imageUrl, city: s.city, state: s.state,
          });
        });
      }
      return markers;
    }),
});

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notificationsRouter = router({
  list: protectedProcedure
    .query(({ ctx }) => repo.getUserNotifications(ctx.user.id)),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await repo.markNotificationRead(input.id);
      return { success: true };
    }),
});

// ─── IMAGE GENERATION ────────────────────────────────────────────────────────
export const imageGenRouter = router({
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string().min(10).max(500),
      purpose: z.enum(["perfil","oferta","evento","banner","outro"]).default("outro"),
    }))
    .mutation(async ({ ctx, input }) => {
      const enhancedPrompt = `Imagem profissional para plataforma de samba e pagode brasileiro. ${input.prompt}. Estilo: fotográfico, vibrante, cultural, alta qualidade.`;
      const result = await generateImage({ prompt: enhancedPrompt });
      await repo.saveGeneratedImage({
        userId: ctx.user.id,
        prompt: input.prompt,
        imageUrl: result.url ?? "",
        purpose: input.purpose,
      });
      return { url: result.url };
    }),

  myImages: protectedProcedure
    .query(({ ctx }) => repo.getUserGeneratedImages(ctx.user.id)),
});

// ─── PLATFORM PUBLIC STATS ──────────────────────────────────────────────────
export const platformRouter = router({
  publicStats: publicProcedure
    .query(() => repo.getPublicStats()),
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export const adminRouter = router({
  stats: adminProcedure
    .query(() => repo.getPlatformStats()),

  users: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(({ input }) => repo.getAllUsers(input.limit, input.offset)),

  updateUser: adminProcedure
    .input(z.object({
      id: z.number(),
      role: z.enum(["user","admin","owner"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const db2 = await getDb();
      if (!db2) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { users } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await db2.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      await repo.createAdminLog({
        adminId: ctx.user.id,
        action: "update_user_role",
        entityType: "user",
        entityId: input.id,
        details: JSON.stringify({ role: input.role }),
      });
      return { success: true };
    }),

  logs: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(({ input }) => repo.getAdminLogs(input.limit)),

  financialRecords: adminProcedure
    .query(() => repo.getFinancialRecords()),

  createFinancialRecord: adminProcedure
    .input(z.object({
      type: z.enum(["receita","custo"]),
      category: z.string(),
      description: z.string().optional(),
      amount: z.number(),
      isProjected: z.boolean().default(false),
      recordedAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await repo.createFinancialRecord({
        ...input,
        amount: String(input.amount),
        recordedAt: input.recordedAt ? new Date(input.recordedAt) : new Date(),
      });
      return { success: true };
    }),

  // ── Dashboard admin (Stripe-ready) ─────────────────────────────────────────
  getStats: adminProcedure
    .query(() => repo.getAdminStats()),

  getRecentProfiles: adminProcedure
    .query(() => repo.getRecentProfiles(10)),

  getProfilesByType: adminProcedure
    .query(() => repo.getProfileCountByType()),

  getProfilesByState: adminProcedure
    .query(() => repo.getProfilesByState()),

  getHealthMetrics: adminProcedure
    .query(() => repo.getHealthMetrics()),

  getGrowthData: adminProcedure
    .query(() => repo.getProfileGrowthData()),

  getRevenueData: adminProcedure
    .query(() => ({
      mrr: 0,
      arr: 0,
      totalRevenue: 0,
      totalTransactions: 0,
      avgTicket: 0,
      projectedRevenue: 0,
      projectedArr: 0,
    })),
});

// ─── OWNER DASHBOARD ─────────────────────────────────────────────────────────
export const ownerRouter = router({
  stats: ownerProcedure
    .query(() => repo.getPlatformStats()),

  financialSummary: ownerProcedure
    .query(async () => {
      const [records, revenue, costs] = await Promise.all([
        repo.getFinancialRecords(200),
        repo.getTotalRevenue(),
        repo.getTotalCosts(),
      ]);
      return {
        records,
        totalRevenue: revenue,
        totalCosts: costs,
        profit: revenue - costs,
        margin: revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0,
      };
    }),

  analytics: ownerProcedure
    .query(async () => {
      const [profilesByState, monthlyGrowth] = await Promise.all([
        repo.getProfilesByState(),
        repo.getMonthlyGrowth(),
      ]);
      return { profilesByState, monthlyGrowth };
    }),
});

// ─── STRIPE PAYMENTS ─────────────────────────────────────────────────────────
export const paymentsRouter = router({
  createStudioBookingCheckout: protectedProcedure
    .input(z.object({
      studioId: z.number(),
      studioName: z.string(),
      hours: z.number().min(1).max(24),
      pricePerHour: z.number(),
      date: z.string(),
      origin: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const totalAmount = Math.round(input.hours * input.pricePerHour * 100);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: {
              name: `Reserva: ${input.studioName}`,
              description: `${input.hours}h em ${input.date}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        }],
        mode: "payment",
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          studio_id: input.studioId.toString(),
          hours: input.hours.toString(),
          date: input.date,
          type: "studio_booking",
        },
        success_url: `${input.origin}/estudio/${input.studioId}?booking=success`,
        cancel_url: `${input.origin}/estudio/${input.studioId}?booking=cancelled`,
        allow_promotion_codes: true,
      });
      return { checkoutUrl: session.url };
    }),

  createAcademyCheckout: protectedProcedure
    .input(z.object({
      contentId: z.number(),
      contentTitle: z.string(),
      price: z.number(),
      origin: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: {
              name: `Academia: ${input.contentTitle}`,
              description: "Conteúdo premium da Academia PNSP",
            },
            unit_amount: Math.round(input.price * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          content_id: input.contentId.toString(),
          type: "academy_content",
        },
        success_url: `${input.origin}/academia/${input.contentId}?purchase=success`,
        cancel_url: `${input.origin}/academia?purchase=cancelled`,
        allow_promotion_codes: true,
      });
      return { checkoutUrl: session.url };
    }),

  createOfferingHighlightCheckout: protectedProcedure
    .input(z.object({
      offeringId: z.number(),
      offeringTitle: z.string(),
      origin: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: {
              name: "Destaque de Oferta Premium",
              description: `Destaque: ${input.offeringTitle} por 30 dias`,
            },
            unit_amount: 4990,
          },
          quantity: 1,
        }],
        mode: "payment",
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          offering_id: input.offeringId.toString(),
          type: "offering_highlight",
        },
        success_url: `${input.origin}/oferta/${input.offeringId}?highlight=success`,
        cancel_url: `${input.origin}/oferta/${input.offeringId}?highlight=cancelled`,
        allow_promotion_codes: true,
      });
      return { checkoutUrl: session.url };
    }),

  createSubscriptionCheckout: protectedProcedure
    .input(z.object({
      plan: z.enum(["basic", "pro"]),
      origin: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const plans = {
        basic: { name: "Assinatura PNSP Básica", price: 2990, desc: "Visibilidade aumentada e perfil verificado" },
        pro: { name: "Assinatura PNSP Pro", price: 7990, desc: "Visibilidade máxima, destaque no mapa e analytics" },
      };
      const plan = plans[input.plan];
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: { name: plan.name, description: plan.desc },
            unit_amount: plan.price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        mode: "subscription",
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          plan: input.plan,
          type: "subscription",
        },
        success_url: `${input.origin}/dashboard?subscription=success`,
        cancel_url: `${input.origin}/planos?subscription=cancelled`,
        allow_promotion_codes: true,
      });
      return { checkoutUrl: session.url };
    }),
});

// ─── USER DASHBOARD ──────────────────────────────────────────────────────────
export const dashboardRouter = router({
  summary: protectedProcedure
    .query(async ({ ctx }) => {
      const [profile, myOfferings, myOpportunities, myApplications, myBookings, notifications] = await Promise.all([
        repo.getProfileByUserId(ctx.user.id),
        repo.listOfferings({ userId: ctx.user.id }),
        repo.listOpportunities({ userId: ctx.user.id }),
        repo.getApplicationsByUser(ctx.user.id),
        repo.getBookingsByUser(ctx.user.id),
        repo.getUserNotifications(ctx.user.id),
      ]);

      // Review stats for this user's profile
      let reviewStats = { avg: 0, total: 0 };
      let recentReviews: any[] = [];
      let receivedApplicationsCount = 0;

      if (profile) {
        const db = await import("../db").then(m => m.getDb());
        if (db) {
          const { reviews, profiles: profilesTable, opportunityApplications } = await import("../../drizzle/schema");
          const { eq, desc, sql: sqlExpr, and, inArray } = await import("drizzle-orm");

          // Review stats
          const [statsRow] = await db.select({
            avg:   sqlExpr<string>`COALESCE(ROUND(AVG(${reviews.rating})::numeric, 1), 0)`,
            total: sqlExpr<number>`COUNT(*)::int`,
          }).from(reviews).where(eq(reviews.reviewedId, profile.id));
          reviewStats = {
            avg:   Number(statsRow?.avg ?? 0),
            total: Number(statsRow?.total ?? 0),
          };

          // 3 most recent reviews
          recentReviews = await db
            .select({
              id:             reviews.id,
              rating:         reviews.rating,
              comment:        reviews.comment,
              context:        reviews.context,
              createdAt:      reviews.createdAt,
              reviewerName:   profilesTable.displayName,
              reviewerAvatar: profilesTable.avatarUrl,
              reviewerSlug:   profilesTable.slug,
            })
            .from(reviews)
            .innerJoin(profilesTable, eq(reviews.reviewerId, profilesTable.id))
            .where(eq(reviews.reviewedId, profile.id))
            .orderBy(desc(reviews.createdAt))
            .limit(3);

          // Applications received on user's opportunities
          if (myOpportunities.length > 0) {
            const oppIds = myOpportunities.map(o => o.id);
            const [appCountRow] = await db.select({
              count: sqlExpr<number>`COUNT(*)::int`,
            }).from(opportunityApplications)
              .where(inArray(opportunityApplications.opportunityId, oppIds));
            receivedApplicationsCount = Number(appCountRow?.count ?? 0);
          }
        }
      }

      return {
        profile,
        offeringsCount:            myOfferings.length,
        opportunitiesCount:        myOpportunities.length,
        applicationsCount:         myApplications.length,
        bookingsCount:             myBookings.length,
        unreadNotifications:       notifications.filter(n => !n.isRead).length,
        recentOfferings:           myOfferings.slice(0, 8),
        recentOpportunities:       myOpportunities.slice(0, 8),
        recentApplications:        myApplications.slice(0, 5),
        reviewStats,
        recentReviews,
        receivedApplicationsCount,
        profileViewCount:          profile?.viewCount ?? 0,
      };
    }),
});
