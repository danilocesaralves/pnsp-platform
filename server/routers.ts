/**
 * PNSP — Root Router (composition layer)
 *
 * This file wires together all domain routers into a single appRouter.
 * Business logic lives in server/routers/*.router.ts.
 * Data access lives in server/repositories/*.repo.ts.
 */
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

// Domain routers
import { profilesRouter } from "./routers/profiles.router";
import { offeringsRouter } from "./routers/offerings.router";
import { opportunitiesRouter } from "./routers/opportunities.router";
import { studiosRouter } from "./routers/studios.router";
import { academyRouter } from "./routers/academy.router";
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

  // ─── AUTH (kept inline — small & framework-coupled) ────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── DOMAIN ROUTERS ───────────────────────────────────────────────────────
  profiles: profilesRouter,
  offerings: offeringsRouter,
  opportunities: opportunitiesRouter,
  studios: studiosRouter,
  academy: academyRouter,
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
