import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../lib/guards";
import * as repo from "../repositories";

const STUDIO_TYPE_ENUM = z.enum(["gravacao","ensaio","ambos"]);

export const studiosRouter = router({
  list: publicProcedure
    .input(z.object({
      state: z.string().optional(),
      city: z.string().optional(),
      studioType: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(({ input }) => repo.listStudios(input)),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const studio = await repo.getStudioBySlug(input.slug);
      if (!studio) throw new TRPCError({ code: "NOT_FOUND" });
      return studio;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(200),
      description: z.string().optional(),
      studioType: STUDIO_TYPE_ENUM.default("ambos"),
      city: z.string().optional(),
      state: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      instagramUrl: z.string().optional(),
      pricePerHour: z.number().min(0).optional(),
      pricePerDay: z.number().min(0).optional(),
      capacity: z.number().int().min(1).optional(),
      equipment: z.array(z.string()).optional(),
      amenities: z.array(z.string()).optional(),
      imageUrl: z.string().optional(),
      coverUrl: z.string().optional(),
      profileId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const slug = `${input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now()}`;
      await repo.createStudio({
        ...input,
        userId: ctx.user.id,
        slug,
        pricePerHour: input.pricePerHour != null ? String(input.pricePerHour) : null,
        pricePerDay: input.pricePerDay != null ? String(input.pricePerDay) : null,
        equipment: input.equipment ?? null,
        amenities: input.amenities ?? null,
        status: "active",
      });
      return { success: true, slug };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(2).max(200).optional(),
      description: z.string().optional(),
      studioType: STUDIO_TYPE_ENUM.optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      instagramUrl: z.string().optional(),
      pricePerHour: z.number().min(0).optional(),
      pricePerDay: z.number().min(0).optional(),
      capacity: z.number().int().min(1).optional(),
      equipment: z.array(z.string()).optional(),
      amenities: z.array(z.string()).optional(),
      imageUrl: z.string().optional(),
      coverUrl: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const studio = await repo.getStudioById(input.id);
      if (!studio) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        studio.userId !== ctx.user.id &&
        ctx.user.role !== "admin" &&
        ctx.user.role !== "owner"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, pricePerHour, pricePerDay, ...rest } = input;
      await repo.updateStudio(id, {
        ...rest,
        pricePerHour: pricePerHour != null ? String(pricePerHour) : undefined,
        pricePerDay: pricePerDay != null ? String(pricePerDay) : undefined,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const studio = await repo.getStudioById(input.id);
      if (!studio) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        studio.userId !== ctx.user.id &&
        ctx.user.role !== "admin" &&
        ctx.user.role !== "owner"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await repo.updateStudio(input.id, { isActive: false, status: "suspended" });
      return { success: true };
    }),

  book: protectedProcedure
    .input(z.object({
      studioId: z.number(),
      startAt: z.string(),
      endAt: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const studio = await repo.getStudioById(input.studioId);
      if (!studio) throw new TRPCError({ code: "NOT_FOUND" });
      const start = new Date(input.startAt);
      const end = new Date(input.endAt);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const totalPrice = studio.pricePerHour ? Number(studio.pricePerHour) * hours : 0;
      await repo.createBooking({
        studioId: input.studioId,
        userId: ctx.user.id,
        startAt: start,
        endAt: end,
        totalHours: String(hours),
        totalPrice: String(totalPrice),
        notes: input.notes,
      });
      return { success: true };
    }),

  myBookings: protectedProcedure
    .query(({ ctx }) => repo.getBookingsByUser(ctx.user.id)),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending","active","suspended"]).optional(),
      isVerified: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await repo.updateStudio(id, data);
      await repo.createAdminLog({
        adminId: ctx.user.id,
        action: "update_studio",
        entityType: "studio",
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
});
