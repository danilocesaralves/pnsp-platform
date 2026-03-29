import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import { slugify } from "../lib/slugify";
import { getDb } from "../db";
import { academyCourses, academyLessons, academyEnrollments } from "../../drizzle/schema";
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
      const content = await repo.getAcademyContentBySlug(input.slug.toLowerCase());
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
      const slug = slugify(input.title, Date.now());
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

  // ─── Courses (M3) ─────────────────────────────────────────────────────────
  getCourses: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      level: z.string().optional(),
      isFree: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(academyCourses.isPublished, true)];
      if (input.category) conditions.push(eq(academyCourses.category, input.category as any));
      if (input.level) conditions.push(eq(academyCourses.level, input.level as any));
      if (input.isFree !== undefined) conditions.push(eq(academyCourses.isFree, input.isFree));
      return db.select().from(academyCourses)
        .where(and(...conditions))
        .orderBy(desc(academyCourses.enrollmentsCount))
        .limit(input.limit)
        .offset(input.offset);
    }),

  getCourseById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [course] = await db.select().from(academyCourses).where(eq(academyCourses.id, input.id));
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      const lessons = await db.select().from(academyLessons)
        .where(eq(academyLessons.courseId, input.id))
        .orderBy(asc(academyLessons.order));
      return { ...course, lessons };
    }),

  enroll: protectedProcedure
    .input(z.object({ courseId: z.number(), profileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [course] = await db.select().from(academyCourses).where(eq(academyCourses.id, input.courseId));
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      const existing = await db.select().from(academyEnrollments)
        .where(and(eq(academyEnrollments.courseId, input.courseId), eq(academyEnrollments.profileId, input.profileId)));
      if (existing.length > 0) return existing[0];
      const [enrollment] = await db.insert(academyEnrollments).values({
        courseId: input.courseId,
        profileId: input.profileId,
        progress: 0,
      }).returning();
      await db.update(academyCourses)
        .set({ enrollmentsCount: sql`${academyCourses.enrollmentsCount} + 1` })
        .where(eq(academyCourses.id, input.courseId));
      return enrollment;
    }),

  getMyEnrollments: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db
        .select({ enrollment: academyEnrollments, course: academyCourses })
        .from(academyEnrollments)
        .innerJoin(academyCourses, eq(academyEnrollments.courseId, academyCourses.id))
        .where(eq(academyEnrollments.profileId, input.profileId))
        .orderBy(desc(academyEnrollments.enrolledAt));
    }),

  updateProgress: protectedProcedure
    .input(z.object({ enrollmentId: z.number(), progress: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [enrollment] = await db.select().from(academyEnrollments).where(eq(academyEnrollments.id, input.enrollmentId));
      if (!enrollment) throw new TRPCError({ code: "NOT_FOUND" });
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== enrollment.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const completedAt = input.progress >= 100 ? new Date() : null;
      await db.update(academyEnrollments)
        .set({ progress: input.progress, completedAt })
        .where(eq(academyEnrollments.id, input.enrollmentId));
      return { success: true };
    }),

  seedCourses: adminProcedure
    .mutation(async () => {
      const db = getDb();
      const existing = await db.select({ id: academyCourses.id }).from(academyCourses).limit(1);
      if (existing.length > 0) return { message: "Courses already seeded" };

      const coursesData = [
        {
          slug: "historia-do-samba-fundamentos",
          title: "História do Samba — Fundamentos",
          description: "Mergulhe nas raízes do samba, desde os terreiros da Bahia até os morros cariocas. Aprenda sobre os pioneiros, os gêneros e a evolução cultural que moldou o Brasil.",
          category: "historia" as const,
          level: "iniciante" as const,
          instructorName: "Mestre Zumbi do Samba",
          durationMinutes: 240,
          isFree: true,
          isPublished: true,
        },
        {
          slug: "tecnica-avancada-de-cavaquinho",
          title: "Técnica Avançada de Cavaquinho",
          description: "Domine as batidas, arpejos e improvisações do cavaquinho com este curso voltado para músicos que já possuem base no instrumento. Do pagode ao choro.",
          category: "tecnica" as const,
          level: "avancado" as const,
          instructorName: "Cavaquinhista D. Américo",
          durationMinutes: 360,
          isFree: false,
          isPublished: true,
          price: 9700,
        },
        {
          slug: "carreira-musical-gestao-e-negocios",
          title: "Carreira Musical — Gestão e Negócios",
          description: "Aprenda a monetizar seu talento: contratos, cachê, marketing digital, patrocínios e como usar plataformas de streaming para crescer profissionalmente.",
          category: "negocios" as const,
          level: "intermediario" as const,
          instructorName: "Profa. Mariana Ramos",
          durationMinutes: 300,
          isFree: false,
          isPublished: true,
          price: 7900,
        },
      ];

      for (const courseData of coursesData) {
        const [course] = await db.insert(academyCourses).values(courseData).returning();
        const lessons = [
          { courseId: course.id, order: 1, title: "Introdução", durationMinutes: 15, isFree: true },
          { courseId: course.id, order: 2, title: "Fundamentos essenciais", durationMinutes: 30, isFree: true },
          { courseId: course.id, order: 3, title: "Prática e exercícios", durationMinutes: 45, isFree: false },
          { courseId: course.id, order: 4, title: "Aplicação avançada", durationMinutes: 60, isFree: false },
          { courseId: course.id, order: 5, title: "Projeto final", durationMinutes: 30, isFree: false },
        ];
        await db.insert(academyLessons).values(lessons);
      }
      return { message: "Courses seeded successfully" };
    }),
});
