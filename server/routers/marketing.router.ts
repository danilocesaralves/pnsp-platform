import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  marketingCampaigns,
  marketingContents,
  marketingScores,
  marketingInsights,
  profiles,
} from "../../drizzle/schema";
import * as repo from "../repositories";

const OBJECTIVE_ENUM = z.enum(["awareness", "engajamento", "conversao", "retencao"]);
const CAMPAIGN_STATUS_ENUM = z.enum(["rascunho", "ativa", "pausada", "finalizada"]);
const CONTENT_TYPE_ENUM = z.enum(["post", "story", "reels", "video", "artigo", "email"]);
const PLATFORM_ENUM = z.enum(["instagram", "facebook", "youtube", "tiktok", "twitter", "email", "whatsapp"]);
const CONTENT_STATUS_ENUM = z.enum(["rascunho", "agendado", "publicado", "arquivado"]);

// ─── Static AI content templates ─────────────────────────────────────────────
const CONTENT_TEMPLATES: Record<string, Record<string, string[]>> = {
  post: {
    instagram: [
      "🎵 Minha arte não se define — ela se sente. Venha viver essa experiência!",
      "✨ Cada apresentação é uma história única. Reserve sua data!",
      "🔥 Música que emociona, arte que transforma. Confira meu perfil!",
    ],
    facebook: [
      "Olá amigos! Compartilho aqui mais um momento especial da minha trajetória musical.",
      "Estou disponível para shows, eventos e projetos especiais. Entre em contato!",
    ],
  },
  story: {
    instagram: [
      "👆 Arrasta pra cima e descobre o que preparei!",
      "🎤 Por trás dos bastidores hoje — fica ligado!",
    ],
  },
  reels: {
    instagram: [
      "30 segundos que vão te fazer sentir algo. Assiste até o fim! 🎵",
      "Isso foi ao vivo, sem edição. Pura emoção! 🔥",
    ],
  },
};

function generateStaticContent(
  contentType: string,
  platform: string,
  profileName: string,
): string {
  const templates = CONTENT_TEMPLATES[contentType]?.[platform];
  if (templates && templates.length > 0) {
    const idx = Math.floor(Math.random() * templates.length);
    return templates[idx].replace("meu perfil", `o perfil de ${profileName}`);
  }
  return `✨ ${profileName} — arte, emoção e talento. Confira e compartilhe!`;
}

function calcScore(profileData: { bio?: string | null; avatarUrl?: string | null; instagramUrl?: string | null; genres?: string[] | null }): number {
  let score = 40;
  if (profileData.bio && profileData.bio.length > 50) score += 15;
  if (profileData.avatarUrl) score += 15;
  if (profileData.instagramUrl) score += 15;
  if (profileData.genres && profileData.genres.length > 0) score += 15;
  return Math.min(score, 100);
}

export const marketingRouter = router({
  // ─── Campaigns ─────────────────────────────────────────────────────────────
  getMyCampaigns: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      status: CAMPAIGN_STATUS_ENUM.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const where = input.status
        ? and(eq(marketingCampaigns.profileId, input.profileId), eq(marketingCampaigns.status, input.status))
        : eq(marketingCampaigns.profileId, input.profileId);
      return db.select().from(marketingCampaigns).where(where).orderBy(desc(marketingCampaigns.createdAt));
    }),

  createCampaign: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      title: z.string().min(3).max(200),
      objective: OBJECTIVE_ENUM.default("awareness"),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.number().optional(),
      platforms: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [campaign] = await db.insert(marketingCampaigns).values({
        profileId: input.profileId,
        title: input.title,
        objective: input.objective,
        startDate: input.startDate,
        endDate: input.endDate,
        budget: input.budget,
        platforms: input.platforms,
        notes: input.notes,
      }).returning();
      return campaign;
    }),

  updateCampaign: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(3).max(200).optional(),
      objective: OBJECTIVE_ENUM.optional(),
      status: CAMPAIGN_STATUS_ENUM.optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.number().optional(),
      platforms: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [campaign] = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, input.id));
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== campaign.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, ...rest } = input;
      await db.update(marketingCampaigns).set(rest).where(eq(marketingCampaigns.id, id));
      return { success: true };
    }),

  // ─── Contents ──────────────────────────────────────────────────────────────
  getMyContents: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      campaignId: z.number().optional(),
      status: CONTENT_STATUS_ENUM.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const conditions = [eq(marketingContents.profileId, input.profileId)];
      if (input.campaignId) conditions.push(eq(marketingContents.campaignId, input.campaignId));
      if (input.status) conditions.push(eq(marketingContents.status, input.status));
      return db.select().from(marketingContents).where(and(...conditions)).orderBy(desc(marketingContents.createdAt));
    }),

  generateContent: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      contentType: CONTENT_TYPE_ENUM,
      platform: PLATFORM_ENUM,
      campaignId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const body = generateStaticContent(input.contentType, input.platform, myProfile.displayName);
      const [content] = await db.insert(marketingContents).values({
        profileId: input.profileId,
        campaignId: input.campaignId,
        contentType: input.contentType,
        platform: input.platform,
        status: "rascunho",
        body,
        isAiGenerated: true,
      }).returning();
      return content;
    }),

  updateContent: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      body: z.string().optional(),
      status: CONTENT_STATUS_ENUM.optional(),
      hashtags: z.array(z.string()).optional(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [content] = await db.select().from(marketingContents).where(eq(marketingContents.id, input.id));
      if (!content) throw new TRPCError({ code: "NOT_FOUND" });
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== content.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, scheduledAt, ...rest } = input;
      await db.update(marketingContents).set({
        ...rest,
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
      }).where(eq(marketingContents.id, id));
      return { success: true };
    }),

  // ─── Scores & Insights ─────────────────────────────────────────────────────
  getMyScores: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.select().from(marketingScores).where(eq(marketingScores.profileId, input.profileId));
    }),

  getMyInsights: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.select().from(marketingInsights)
        .where(and(
          eq(marketingInsights.profileId, input.profileId),
          eq(marketingInsights.isDismissed, false),
        ))
        .orderBy(desc(marketingInsights.createdAt));
    }),

  dismissInsight: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [insight] = await db.select().from(marketingInsights).where(eq(marketingInsights.id, input.id));
      if (!insight) throw new TRPCError({ code: "NOT_FOUND" });
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== insight.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.update(marketingInsights).set({ isDismissed: true }).where(eq(marketingInsights.id, input.id));
      return { success: true };
    }),

  seedInsights: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      // Calculate score based on profile completeness
      const overallScore = calcScore(myProfile as { bio?: string | null; avatarUrl?: string | null; instagramUrl?: string | null; genres?: string[] | null });

      // Upsert score
      const existing = await db.select().from(marketingScores)
        .where(and(eq(marketingScores.profileId, input.profileId), eq(marketingScores.scoreType, "perfil")));
      if (existing.length === 0) {
        await db.insert(marketingScores).values({ profileId: input.profileId, scoreType: "perfil", score: overallScore });
      } else {
        await db.update(marketingScores).set({ score: overallScore }).where(eq(marketingScores.id, existing[0].id));
      }

      // Delete existing non-dismissed insights and recreate
      await db.update(marketingInsights)
        .set({ isDismissed: true })
        .where(and(eq(marketingInsights.profileId, input.profileId), eq(marketingInsights.isDismissed, false)));

      const insightsToCreate = [];
      if (!myProfile.bio) {
        insightsToCreate.push({ profileId: input.profileId, insightType: "sugestao" as const, priority: "alta" as const, title: "Complete sua bio", description: "Perfis com bio têm 3x mais visualizações." });
      }
      if (!myProfile.instagramUrl) {
        insightsToCreate.push({ profileId: input.profileId, insightType: "oportunidade" as const, priority: "media" as const, title: "Conecte seu Instagram", description: "Amplie seu alcance conectando suas redes sociais." });
      }
      insightsToCreate.push({ profileId: input.profileId, insightType: "sugestao" as const, priority: "baixa" as const, title: "Crie sua primeira campanha", description: "Campanhas ajudam a organizar sua estratégia de marketing." });
      if (overallScore >= 80) {
        insightsToCreate.push({ profileId: input.profileId, insightType: "conquista" as const, priority: "baixa" as const, title: "Perfil completo!", description: `Sua pontuação de marketing é ${overallScore}/100. Excelente!` });
      }
      if (insightsToCreate.length > 0) {
        await db.insert(marketingInsights).values(insightsToCreate);
      }
      return { score: overallScore };
    }),
});
