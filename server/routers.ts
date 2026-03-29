/**
 * PNSP — Root Router (composition layer)
 *
 * This file wires together all domain routers into a single appRouter.
 * Business logic lives in server/routers/*.router.ts.
 * Data access lives in server/repositories/*.repo.ts.
 */
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

// Domain routers
import { profilesRouter } from "./routers/profiles.router";
import { offeringsRouter } from "./routers/offerings.router";
import { opportunitiesRouter } from "./routers/opportunities.router";
import { studiosRouter } from "./routers/studios.router";
import { academyRouter } from "./routers/academy.router";
import { uploadRouter } from "./routers/upload.router";
import { reviewsRouter } from "./routers/reviews.router";
import {
  mapRouter,
  notificationsRouter,
  imageGenRouter,
  platformRouter,
  adminRouter,
  ownerRouter,
  paymentsRouter,
  dashboardRouter,
} from "./routers/platform.router";

export const appRouter = router({
  system: systemRouter,

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  // Session management is handled by better-auth at /api/auth/*
  // auth.me reads user from tRPC context (populated by better-auth session)
  // auth.logout is a no-op kept for backwards compatibility; clients should
  // call POST /api/auth/sign-out directly for proper cookie invalidation.
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),

  // ─── DOMAIN ROUTERS ───────────────────────────────────────────────────────
  profiles: profilesRouter,
  offerings: offeringsRouter,
  opportunities: opportunitiesRouter,
  studios: studiosRouter,
  academy: academyRouter,
  upload: uploadRouter,
  reviews: reviewsRouter,
  map: mapRouter,
  notifications: notificationsRouter,
  imageGen: imageGenRouter,
  platform: platformRouter,
  admin: adminRouter,
  owner: ownerRouter,
  payments: paymentsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
