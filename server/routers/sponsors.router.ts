import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sponsors, sponsorDeliverables } from "../../drizzle/schema";
import * as repo from "../repositories";

export const sponsorsRouter = router({

  // ── Criar patrocinador ────────────────────────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      companyName:   z.string().min(1).max(200),
      contactName:   z.string().max(200).optional(),
      contactEmail:  z.string().email().optional(),
      contactPhone:  z.string().max(50).optional(),
      website:       z.string().max(300).optional(),
      logoUrl:       z.string().max(500).optional(),
      proposalValue: z.number().int().min(0).optional(),
      notes:         z.string().max(3000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "BAD_REQUEST", message: "Crie um perfil antes" });

      const [sponsor] = await db.insert(sponsors).values({
        profileId:     myProfile.id,
        companyName:   input.companyName,
        contactName:   input.contactName   ?? null,
        contactEmail:  input.contactEmail  ?? null,
        contactPhone:  input.contactPhone  ?? null,
        website:       input.website       ?? null,
        logoUrl:       input.logoUrl       ?? null,
        proposalValue: input.proposalValue ?? null,
        notes:         input.notes         ?? null,
        status:        "prospecto",
      }).returning();

      return sponsor;
    }),

  // ── Listar meus patrocinadores ────────────────────────────────────────────
  getMySponsors: protectedProcedure
    .input(z.object({
      status: z.enum(["prospecto","proposta_enviada","em_negociacao","fechado","recusado"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return [];

      const whereClause = input?.status
        ? eq(sponsors.status, input.status) && eq(sponsors.profileId, myProfile.id)
        : eq(sponsors.profileId, myProfile.id);

      return db.select().from(sponsors)
        .where(input?.status
          ? (({ and: a, eq: e }) => a(e(sponsors.profileId, myProfile.id), e(sponsors.status, input.status!)))(await import("drizzle-orm"))
          : eq(sponsors.profileId, myProfile.id)
        )
        .orderBy(desc(sponsors.updatedAt));
    }),

  // ── Detalhe com deliverables ──────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ sponsorId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, input.sponsorId)).limit(1);
      if (!sponsor) throw new TRPCError({ code: "NOT_FOUND" });
      if (sponsor.profileId !== myProfile.id) throw new TRPCError({ code: "FORBIDDEN" });

      const deliverables = await db.select().from(sponsorDeliverables)
        .where(eq(sponsorDeliverables.sponsorId, input.sponsorId));

      return { ...sponsor, deliverables };
    }),

  // ── Atualizar ─────────────────────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({
      sponsorId: z.number().int(),
      data: z.object({
        companyName:   z.string().max(200).optional(),
        contactName:   z.string().max(200).optional(),
        contactEmail:  z.string().email().optional(),
        contactPhone:  z.string().max(50).optional(),
        website:       z.string().max(300).optional(),
        proposalValue: z.number().int().optional(),
        finalValue:    z.number().int().optional(),
        status:        z.enum(["prospecto","proposta_enviada","em_negociacao","fechado","recusado"]).optional(),
        notes:         z.string().max(3000).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, input.sponsorId)).limit(1);
      if (!sponsor) throw new TRPCError({ code: "NOT_FOUND" });
      if (sponsor.profileId !== myProfile.id) throw new TRPCError({ code: "FORBIDDEN" });

      const [updated] = await db.update(sponsors)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(sponsors.id, input.sponsorId))
        .returning();

      return updated;
    }),

  // ── Adicionar contrapartida ───────────────────────────────────────────────
  addDeliverable: protectedProcedure
    .input(z.object({
      sponsorId:   z.number().int(),
      description: z.string().min(1).max(300),
      dueDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, input.sponsorId)).limit(1);
      if (!sponsor || sponsor.profileId !== myProfile.id) throw new TRPCError({ code: "FORBIDDEN" });

      const [d] = await db.insert(sponsorDeliverables).values({
        sponsorId:   input.sponsorId,
        description: input.description,
        dueDate:     input.dueDate ?? null,
      }).returning();

      return d;
    }),

  // ── Toggle deliverable ────────────────────────────────────────────────────
  toggleDeliverable: protectedProcedure
    .input(z.object({ deliverableId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [d] = await db.select().from(sponsorDeliverables)
        .where(eq(sponsorDeliverables.id, input.deliverableId)).limit(1);
      if (!d) throw new TRPCError({ code: "NOT_FOUND" });

      const [updated] = await db.update(sponsorDeliverables)
        .set({ isDone: !d.isDone })
        .where(eq(sponsorDeliverables.id, input.deliverableId))
        .returning();

      return updated;
    }),

  // ── Pipeline stats ────────────────────────────────────────────────────────
  getPipelineStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return [];

      const rows = await db.select({
        status: sponsors.status,
        count:  sql<number>`COUNT(*)::int`,
        total:  sql<number>`COALESCE(SUM(${sponsors.finalValue}), 0)::int`,
      }).from(sponsors)
        .where(eq(sponsors.profileId, myProfile.id))
        .groupBy(sponsors.status);

      return rows;
    }),
});
