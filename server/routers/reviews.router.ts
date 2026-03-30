import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reviews, profiles, users } from "../../drizzle/schema";
import * as repo from "../repositories";
import { sendPushToUser } from "./push.router";
import { sendNewReviewEmail } from "../lib/email";

export const reviewsRouter = router({

  // ── Criar avaliação ────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      reviewedId: z.number().int(),
      rating:     z.number().int().min(1).max(5),
      comment:    z.string().min(1).max(1000).optional(),
      context:    z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const reviewerProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!reviewerProfile) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Crie um perfil antes de avaliar" });
      }
      if (reviewerProfile.id === input.reviewedId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode avaliar seu próprio perfil" });
      }

      try {
        await db.insert(reviews).values({
          reviewerId: reviewerProfile.id,
          reviewedId: input.reviewedId,
          rating:     input.rating,
          comment:    input.comment ?? null,
          context:    input.context ?? "Outro",
        });
      } catch (e: any) {
        if (e?.code === "23505") {
          throw new TRPCError({ code: "CONFLICT", message: "Você já avaliou este perfil neste contexto" });
        }
        throw e;
      }

      // Push + Email para o avaliado
      const [reviewedProfile] = await db
        .select({ userId: profiles.userId, displayName: profiles.displayName })
        .from(profiles)
        .where(eq(profiles.id, input.reviewedId))
        .limit(1);

      if (reviewedProfile) {
        sendPushToUser(reviewedProfile.userId, {
          title: `Nova avaliação: ${input.rating}⭐`,
          body: `${reviewerProfile.displayName} avaliou seu perfil`,
          url: "/dashboard",
        }).catch(() => {});

        const [reviewedUser] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, reviewedProfile.userId))
          .limit(1);

        if (reviewedUser?.email) {
          sendNewReviewEmail(
            reviewedUser.email,
            reviewerProfile.displayName,
            input.rating,
            input.reviewedId,
            reviewedProfile.userId,
          ).catch(() => {});
        }
      }

      return { success: true };
    }),

  // ── Avaliações de um perfil (com dados do avaliador) ───────────────────────
  getByProfile: publicProcedure
    .input(z.object({
      profileId: z.number().int(),
      limit:     z.number().min(1).max(50).default(20),
      offset:    z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id:             reviews.id,
          rating:         reviews.rating,
          comment:        reviews.comment,
          context:        reviews.context,
          ownerReply:     reviews.ownerReply,
          createdAt:      reviews.createdAt,
          reviewerId:     reviews.reviewerId,
          reviewerName:   profiles.displayName,
          reviewerAvatar: profiles.avatarUrl,
          reviewerType:   profiles.profileType,
          reviewerSlug:   profiles.slug,
        })
        .from(reviews)
        .innerJoin(profiles, eq(reviews.reviewerId, profiles.id))
        .where(eq(reviews.reviewedId, input.profileId))
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // ── Stats: média + total + distribuição ────────────────────────────────────
  getStats: publicProcedure
    .input(z.object({ profileId: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { avg: 0, total: 0, distribution: [] as Array<{ rating: number; count: number }> };

      const [statsRow, distRows] = await Promise.all([
        db.select({
          avgRating: sql<string>`COALESCE(AVG(${reviews.rating}), 0)`,
          total:     sql<number>`COUNT(*)::int`,
        })
        .from(reviews)
        .where(eq(reviews.reviewedId, input.profileId)),

        db.select({
          rating: reviews.rating,
          count:  sql<number>`COUNT(*)::int`,
        })
        .from(reviews)
        .where(eq(reviews.reviewedId, input.profileId))
        .groupBy(reviews.rating)
        .orderBy(desc(reviews.rating)),
      ]);

      const s = statsRow[0] ?? { avgRating: "0", total: 0 };
      const total = Number(s.total);
      const distribution = [5, 4, 3, 2, 1].map(star => {
        const found = distRows.find(r => r.rating === star);
        return { rating: star, count: found ? Number(found.count) : 0 };
      });

      return {
        avg:          total > 0 ? Math.round(Number(s.avgRating) * 10) / 10 : 0,
        total,
        distribution,
      };
    }),

  // ── Dono do perfil responde uma avaliação ──────────────────────────────────
  replyToReview: protectedProcedure
    .input(z.object({
      reviewId: z.number().int(),
      reply:    z.string().min(1).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [review] = await db.select().from(reviews).where(eq(reviews.id, input.reviewId)).limit(1);
      if (!review) throw new TRPCError({ code: "NOT_FOUND" });

      const userProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!userProfile || userProfile.id !== review.reviewedId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Só o dono do perfil pode responder" });
      }

      await db.update(reviews)
        .set({ ownerReply: input.reply, updatedAt: new Date() })
        .where(eq(reviews.id, input.reviewId));

      return { success: true };
    }),

  // ── Avaliações dadas por um perfil ─────────────────────────────────────────
  getGiven: publicProcedure
    .input(z.object({
      profileId: z.number().int(),
      limit:     z.number().default(20),
      offset:    z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id:             reviews.id,
          rating:         reviews.rating,
          comment:        reviews.comment,
          context:        reviews.context,
          createdAt:      reviews.createdAt,
          revieweeName:   profiles.displayName,
          revieweeAvatar: profiles.avatarUrl,
          revieweeSlug:   profiles.slug,
        })
        .from(reviews)
        .innerJoin(profiles, eq(reviews.reviewedId, profiles.id))
        .where(eq(reviews.reviewerId, input.profileId))
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // ── Stats em lote (para listagem de perfis) ────────────────────────────────
  getStatsBatch: publicProcedure
    .input(z.object({ profileIds: z.array(z.number().int()).max(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db || input.profileIds.length === 0) return [];
      return db
        .select({
          profileId: reviews.reviewedId,
          avg:       sql<string>`ROUND(AVG(${reviews.rating})::numeric, 1)`,
          total:     sql<number>`COUNT(*)::int`,
        })
        .from(reviews)
        .where(inArray(reviews.reviewedId, input.profileIds))
        .groupBy(reviews.reviewedId);
    }),
});
