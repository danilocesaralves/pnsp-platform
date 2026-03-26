import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import * as repo from "../repositories";

export const profilesRouter = router({
  list: publicProcedure
    .input(z.object({
      profileType: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(({ input }) => repo.listProfiles(input)),

  listFeatured: publicProcedure
    .input(z.object({ limit: z.number().default(8) }).optional())
    .query(({ input }) => repo.listFeaturedProfiles(input?.limit ?? 8)),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const profile = await repo.getProfileBySlug(input.slug);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      await repo.incrementProfileView(profile.id);
      const portfolio = await repo.getPortfolioByProfileId(profile.id);
      return { ...profile, portfolio };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const profile = await repo.getProfileById(input.id);
      return profile ?? null;
    }),

  getMyProfile: protectedProcedure
    .query(({ ctx }) => repo.getProfileByUserId(ctx.user.id)),

  create: protectedProcedure
    .input(z.object({
      profileType: z.enum(["artista_solo","grupo_banda","comunidade_roda","produtor","estudio","professor","loja","luthier","contratante","parceiro"]),
      displayName: z.string().min(2).max(200),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      coverUrl: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      instagramUrl: z.string().optional(),
      youtubeUrl: z.string().optional(),
      spotifyUrl: z.string().optional(),
      facebookUrl: z.string().optional(),
      tiktokUrl: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      instruments: z.array(z.string()).optional(),
      genres: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const slug = `${input.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
      await repo.createProfile({
        ...input,
        userId: ctx.user.id,
        slug,
        specialties: input.specialties ?? null,
        instruments: input.instruments ?? null,
        genres: input.genres ?? null,
        tags: input.tags ?? null,
      });
      return { success: true, slug };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      displayName: z.string().min(2).max(200).optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      coverUrl: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      instagramUrl: z.string().optional(),
      youtubeUrl: z.string().optional(),
      spotifyUrl: z.string().optional(),
      facebookUrl: z.string().optional(),
      tiktokUrl: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      instruments: z.array(z.string()).optional(),
      genres: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await repo.getProfileById(input.id);
      if (!profile || profile.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, specialties, instruments, genres, tags, ...rest } = input;
      await repo.updateProfile(id, {
        ...rest,
        specialties: specialties ?? undefined,
        instruments: instruments ?? undefined,
        genres: genres ?? undefined,
        tags: tags ?? undefined,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await repo.getProfileById(input.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        profile.userId !== ctx.user.id &&
        ctx.user.role !== "admin" &&
        ctx.user.role !== "owner"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await repo.updateProfile(input.id, { isActive: false, status: "suspended" });
      return { success: true };
    }),

  addPortfolioItem: protectedProcedure
    .input(z.object({
      profileId: z.number(),
      mediaType: z.enum(["image", "video", "audio"]),
      url: z.string(),
      thumbnailUrl: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await repo.getProfileById(input.profileId);
      if (!profile || profile.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await repo.addPortfolioItem(input);
      return { success: true };
    }),

  adminList: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => repo.listProfiles({ limit: input.limit, offset: input.offset })),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending","active","suspended"]).optional(),
      isVerified: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await repo.updateProfile(id, data);
      await repo.createAdminLog({
        adminId: ctx.user.id,
        action: "update_profile",
        entityType: "profile",
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
});
