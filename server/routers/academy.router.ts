import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import * as repo from "../repositories";

const CONTENT_TYPE_ENUM = z.enum(["artigo","video","tutorial","curso","podcast"]);
const CATEGORY_ENUM = z.enum([
  "historia","tecnica","instrumentos","composicao","producao","carreira","negocios","cultura",
]);
const LEVEL_ENUM = z.enum(["iniciante","intermediario","avancado"]);

export const academyRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      contentType: z.string().optional(),
      level: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(({ input }) => repo.listAcademyContent(input)),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const content = await repo.getAcademyContentBySlug(input.slug);
      if (!content) throw new TRPCError({ code: "NOT_FOUND" });
      return content;
    }),

  adminCreate: adminProcedure
    .input(z.object({
      title: z.string().min(3).max(300),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      contentType: CONTENT_TYPE_ENUM,
      category: CATEGORY_ENUM,
      level: LEVEL_ENUM.default("iniciante"),
      thumbnailUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      duration: z.number().optional(),
      isPremium: z.boolean().default(false),
      price: z.number().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const slug = `${input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now()}`;
      await repo.createAcademyContent({
        ...input,
        authorId: ctx.user.id,
        slug,
        tags: input.tags ?? null,
        price: input.price != null ? String(input.price) : null,
        publishedAt: input.isPublished ? new Date() : null,
      });
      return { success: true };
    }),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(3).max(300).optional(),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      contentType: CONTENT_TYPE_ENUM.optional(),
      category: CATEGORY_ENUM.optional(),
      level: LEVEL_ENUM.optional(),
      thumbnailUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      duration: z.number().optional(),
      isPremium: z.boolean().optional(),
      price: z.number().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const content = await repo.getAcademyContentById(input.id);
      if (!content) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, price, isPublished, ...rest } = input;
      await repo.updateAcademyContent(id, {
        ...rest,
        ...(price !== undefined && { price: String(price) }),
        ...(isPublished !== undefined && {
          isPublished,
          publishedAt: isPublished && !content.publishedAt ? new Date() : content.publishedAt,
        }),
      });
      await repo.createAdminLog({
        adminId: ctx.user.id,
        action: "update_academy",
        entityType: "academy_content",
        entityId: id,
        details: JSON.stringify(input),
      });
      return { success: true };
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const content = await repo.getAcademyContentById(input.id);
      if (!content) throw new TRPCError({ code: "NOT_FOUND" });
      await repo.updateAcademyContent(input.id, { isPublished: false });
      await repo.createAdminLog({
        adminId: ctx.user.id,
        action: "delete_academy",
        entityType: "academy_content",
        entityId: input.id,
        details: JSON.stringify({ title: content.title }),
      });
      return { success: true };
    }),
});
