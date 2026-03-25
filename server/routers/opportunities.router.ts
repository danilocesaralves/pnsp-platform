import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import * as repo from "../repositories";

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
      category: z.enum(["vaga_grupo","show","evento","projeto","aula","producao","estudio","servico","outro"]),
      requiredType: z.enum(["artista_solo","grupo_banda","comunidade_roda","produtor","estudio","professor","loja","luthier","contratante","qualquer"]).default("qualquer"),
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
