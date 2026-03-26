import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import * as repo from "../repositories";

const CATEGORY_ENUM = z.enum([
  "show","aula","producao","instrumento_novo","instrumento_usado",
  "artesanato","acessorio","audiovisual","luthieria","estudio","servico","outro",
]);
const PRICE_TYPE_ENUM = z.enum(["fixo","sob_consulta","gratuito","a_combinar"]);

export const offeringsRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(({ input }) => repo.listOfferings(input)),

  listRecent: publicProcedure
    .input(z.object({ limit: z.number().default(6) }).optional())
    .query(({ input }) => repo.listOfferings({ limit: input?.limit ?? 6 })),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const offering = await repo.getOfferingById(input.id);
      return offering ?? null;
    }),

  myOfferings: protectedProcedure
    .query(({ ctx }) => repo.listOfferings({ userId: ctx.user.id })),

  create: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      title: z.string().min(3).max(300),
      description: z.string().optional(),
      category: CATEGORY_ENUM,
      priceType: PRICE_TYPE_ENUM.default("a_combinar"),
      price: z.number().optional(),
      imageUrl: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await repo.getProfileById(input.profileId);
      if (!profile || profile.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await repo.createOffering({
        ...input,
        userId: ctx.user.id,
        tags: input.tags ?? null,
        price: input.price != null ? String(input.price) : null,
        status: "active",
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(3).max(300).optional(),
      description: z.string().optional(),
      category: CATEGORY_ENUM.optional(),
      price: z.number().optional(),
      priceType: PRICE_TYPE_ENUM.optional(),
      imageUrl: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const offering = await repo.getOfferingById(input.id);
      if (!offering) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        offering.userId !== ctx.user.id &&
        ctx.user.role !== "admin" &&
        ctx.user.role !== "owner"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, price, ...rest } = input;
      await repo.updateOffering(id, {
        ...rest,
        price: price != null ? String(price) : undefined,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const offering = await repo.getOfferingById(input.id);
      if (!offering) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        offering.userId !== ctx.user.id &&
        ctx.user.role !== "admin" &&
        ctx.user.role !== "owner"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await repo.updateOffering(input.id, { isActive: false, status: "expired" });
      return { success: true };
    }),

  expressInterest: protectedProcedure
    .input(z.object({
      offeringId: z.number(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await repo.createOfferingInterest({
        offeringId: input.offeringId,
        userId: ctx.user.id,
        message: input.message,
      });
      return { success: true };
    }),

  adminList: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(({ input }) => repo.listOfferings({ status: input.status, limit: input.limit, offset: input.offset })),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending","active","rejected","expired"]).optional(),
      isPremium: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await repo.updateOffering(id, data);
      await repo.createAdminLog({
        adminId: ctx.user.id,
        action: "update_offering",
        entityType: "offering",
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
});
