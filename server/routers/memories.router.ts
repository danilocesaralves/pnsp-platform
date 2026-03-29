import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, asc, desc, eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { memories } from "../../drizzle/schema";
import * as repo from "../repositories";

const MEMORY_TYPE_ENUM = z.enum(["show", "gravacao", "conquista", "colaboracao", "formacao", "outro"]);

export const memoriesRouter = router({
  getPublicMemories: publicProcedure
    .input(z.object({
      profileId: z.number(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      return db.select().from(memories)
        .where(and(eq(memories.profileId, input.profileId), eq(memories.isPublic, true)))
        .orderBy(desc(memories.date), desc(memories.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  getMyMemories: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      memoryType: MEMORY_TYPE_ENUM.optional(),
      limit: z.number().min(1).max(50).default(30),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const conditions = [eq(memories.profileId, input.profileId)];
      if (input.memoryType) conditions.push(eq(memories.memoryType, input.memoryType));
      return db.select().from(memories)
        .where(and(...conditions))
        .orderBy(desc(memories.date), desc(memories.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  create: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      memoryType: MEMORY_TYPE_ENUM.default("outro"),
      title: z.string().min(2).max(200),
      description: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
      location: z.string().max(200).optional(),
      imageUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [memory] = await db.insert(memories).values({
        profileId: input.profileId,
        memoryType: input.memoryType,
        title: input.title,
        description: input.description,
        date: input.date,
        location: input.location,
        imageUrl: input.imageUrl,
        tags: input.tags,
        isPublic: input.isPublic,
      }).returning();
      return memory;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      memoryType: MEMORY_TYPE_ENUM.optional(),
      title: z.string().min(2).max(200).optional(),
      description: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      location: z.string().max(200).optional(),
      imageUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [memory] = await db.select().from(memories).where(eq(memories.id, input.id));
      if (!memory) throw new TRPCError({ code: "NOT_FOUND" });
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== memory.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, ...rest } = input;
      await db.update(memories).set(rest).where(eq(memories.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [memory] = await db.select().from(memories).where(eq(memories.id, input.id));
      if (!memory) throw new TRPCError({ code: "NOT_FOUND" });
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== memory.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.delete(memories).where(eq(memories.id, input.id));
      return { success: true };
    }),
});
