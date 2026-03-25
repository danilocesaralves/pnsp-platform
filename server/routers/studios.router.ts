import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as repo from "../repositories";

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
});
