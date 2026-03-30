import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import * as repo from "../repositories";
import { getDb } from "../db";
import { profiles, users } from "../../drizzle/schema";
import { sendOpportunityMatchEmail } from "../lib/email";

const CATEGORY_ENUM = z.enum([
  "vaga_grupo","show","evento","projeto","aula","producao","estudio","servico","outro",
]);
const REQUIRED_TYPE_ENUM = z.enum([
  "artista_solo","grupo_banda","comunidade_roda","produtor","estudio",
  "professor","loja","luthier","contratante","qualquer",
]);

export const opportunitiesRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      state: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(({ input }) => repo.listOpportunities(input)),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const opp = await repo.getOpportunityById(input.id);
      return opp ?? null;
    }),

  myOpportunities: protectedProcedure
    .query(({ ctx }) => repo.listOpportunities({ userId: ctx.user.id })),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(300),
      description: z.string().optional(),
      category: CATEGORY_ENUM,
      requiredType: REQUIRED_TYPE_ENUM.default("qualquer"),
      city: z.string().optional(),
      state: z.string().optional(),
      budgetMin: z.number().optional(),
      budgetMax: z.number().optional(),
      tags: z.array(z.string()).optional(),
      deadline: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await repo.createOpportunity({
        ...input,
        userId: ctx.user.id,
        tags: input.tags ?? null,
        budgetMin: input.budgetMin != null ? String(input.budgetMin) : null,
        budgetMax: input.budgetMax != null ? String(input.budgetMax) : null,
        deadline: input.deadline ? new Date(input.deadline) : null,
        status: "active",
      });

      // Notify matching profiles (async, fire-and-forget, max 10)
      ;(async () => {
        try {
          const db = await getDb();
          if (!db) return;

          // Fetch the newly created opportunity to get its id
          const { opportunities: oppsTable } = await import("../../drizzle/schema");
          const { desc: descOrd } = await import("drizzle-orm");
          const [newOpp] = await db
            .select({ id: oppsTable.id })
            .from(oppsTable)
            .orderBy(descOrd(oppsTable.createdAt))
            .limit(1);
          const oppId = newOpp?.id ?? 0;

          const matchType = input.requiredType === "qualquer" ? undefined : input.requiredType;
          const matchingProfiles = await repo.listProfiles({
            profileType: matchType,
            state: input.state,
            limit: 10,
            offset: 0,
          });

          for (const profile of matchingProfiles.slice(0, 10)) {
            if (profile.userId === ctx.user.id) continue;
            const [user] = await db
              .select({ email: users.email, name: users.name })
              .from(users)
              .where(eq(users.id, profile.userId))
              .limit(1);
            if (user?.email) {
              sendOpportunityMatchEmail(
                user.email,
                user.name ?? profile.displayName,
                input.title,
                input.city ?? null,
                oppId,
                profile.userId,
              ).catch(() => {});
            }
          }
        } catch {
          // fire and forget — never throw
        }
      })();

      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(3).max(300).optional(),
      description: z.string().optional(),
      category: CATEGORY_ENUM.optional(),
      requiredType: REQUIRED_TYPE_ENUM.optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      budgetMin: z.number().optional(),
      budgetMax: z.number().optional(),
      tags: z.array(z.string()).optional(),
      deadline: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const opp = await repo.getOpportunityById(input.id);
      if (!opp) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        opp.userId !== ctx.user.id &&
        ctx.user.role !== "admin" &&
        ctx.user.role !== "owner"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, budgetMin, budgetMax, deadline, ...rest } = input;
      await repo.updateOpportunity(id, {
        ...rest,
        budgetMin: budgetMin != null ? String(budgetMin) : undefined,
        budgetMax: budgetMax != null ? String(budgetMax) : undefined,
        deadline: deadline != null ? new Date(deadline) : undefined,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const opp = await repo.getOpportunityById(input.id);
      if (!opp) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        opp.userId !== ctx.user.id &&
        ctx.user.role !== "admin" &&
        ctx.user.role !== "owner"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await repo.updateOpportunity(input.id, { isActive: false, status: "closed" });
      return { success: true };
    }),

  submitApplication: protectedProcedure
    .input(z.object({
      opportunityId: z.number(),
      profileId: z.number().optional(),
      coverLetter: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await repo.createApplication({
        opportunityId: input.opportunityId,
        userId: ctx.user.id,
        profileId: input.profileId,
        coverLetter: input.coverLetter,
      });
      return { success: true };
    }),

  myApplications: protectedProcedure
    .query(({ ctx }) => repo.getApplicationsByUser(ctx.user.id)),

  adminList: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(({ input }) => repo.listOpportunities({ status: input.status, limit: input.limit, offset: input.offset })),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending","active","rejected","closed"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await repo.updateOpportunity(id, data);
      await repo.createAdminLog({
        adminId: ctx.user.id,
        action: "update_opportunity",
        entityType: "opportunity",
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
});
