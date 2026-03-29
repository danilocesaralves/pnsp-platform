import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { communityPosts, communityComments, communityLikes, profiles } from "../../drizzle/schema";
import * as repo from "../repositories";

const POST_TYPE_ENUM = z.enum(["texto", "imagem", "video", "evento", "oportunidade", "conquista"]);

export const communityRouter = router({
  // ─── Posts ────────────────────────────────────────────────────────────────
  getPosts: publicProcedure
    .input(z.object({
      postType: POST_TYPE_ENUM.optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const where = input.postType ? eq(communityPosts.postType, input.postType) : undefined;
      const rows = await db
        .select({
          post: communityPosts,
          profile: {
            id: profiles.id,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
            profileType: profiles.profileType,
          },
        })
        .from(communityPosts)
        .innerJoin(profiles, eq(communityPosts.profileId, profiles.id))
        .where(where)
        .orderBy(desc(communityPosts.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return rows;
    }),

  createPost: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      postType: POST_TYPE_ENUM.default("texto"),
      title: z.string().max(200).optional(),
      body: z.string().min(1).max(5000),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [post] = await db.insert(communityPosts).values({
        profileId: input.profileId,
        postType: input.postType,
        title: input.title,
        body: input.body,
        imageUrl: input.imageUrl,
        videoUrl: input.videoUrl,
        tags: input.tags,
      }).returning();
      return post;
    }),

  deletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, input.id));
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== post.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.delete(communityPosts).where(eq(communityPosts.id, input.id));
      return { success: true };
    }),

  // ─── Comments ─────────────────────────────────────────────────────────────
  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      return db
        .select({
          comment: communityComments,
          profile: {
            id: profiles.id,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
          },
        })
        .from(communityComments)
        .innerJoin(profiles, eq(communityComments.profileId, profiles.id))
        .where(eq(communityComments.postId, input.postId))
        .orderBy(communityComments.createdAt);
    }),

  addComment: protectedProcedure
    .input(z.object({
      postId: z.number(),
      profileId: z.number(),
      body: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, input.postId));
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      const [comment] = await db.insert(communityComments).values({
        postId: input.postId,
        profileId: input.profileId,
        body: input.body,
      }).returning();
      await db.update(communityPosts)
        .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
        .where(eq(communityPosts.id, input.postId));
      return comment;
    }),

  // ─── Likes ────────────────────────────────────────────────────────────────
  likePost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      profileId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const existing = await db.select().from(communityLikes)
        .where(and(eq(communityLikes.postId, input.postId), eq(communityLikes.profileId, input.profileId)));
      if (existing.length > 0) {
        // Unlike
        await db.delete(communityLikes).where(eq(communityLikes.id, existing[0].id));
        await db.update(communityPosts)
          .set({ likesCount: sql`GREATEST(${communityPosts.likesCount} - 1, 0)` })
          .where(eq(communityPosts.id, input.postId));
        return { liked: false };
      }
      // Like
      await db.insert(communityLikes).values({ postId: input.postId, profileId: input.profileId });
      await db.update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, input.postId));
      return { liked: true };
    }),

  getMyLikes: protectedProcedure
    .input(z.object({ profileId: z.number(), postIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile || myProfile.id !== input.profileId) return [];
      if (input.postIds.length === 0) return [];
      const likes = await db.select({ postId: communityLikes.postId })
        .from(communityLikes)
        .where(eq(communityLikes.profileId, input.profileId));
      return likes.map((l) => l.postId);
    }),
});
