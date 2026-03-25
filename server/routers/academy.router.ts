import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import * as repo from "../repositories";

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
      contentType: z.enum(["artigo","video","tutorial","curso","podcast"]),
      category: z.enum(["historia","tecnica","instrumentos","composicao","producao","carreira","negocios","cultura"]),
      level: z.enum(["iniciante","intermediario","avancado"]).default("iniciante"),
      thumbnailUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      duration: z.number().optional(),
      isPremium: z.boolean().default(false),
      price: z.number().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
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
});
