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
import { eventsRouter } from "./routers/events.router";
import { chatRouter } from "./routers/chat.router";
import { bookingsRouter } from "./routers/bookings.router";
import { notificationsRouter as notifRouter } from "./routers/notifications.router";
import { contractsRouter } from "./routers/contracts.router";
import { sponsorsRouter } from "./routers/sponsors.router";
import { payRecordsRouter } from "./routers/payrecords.router";
import { marketingRouter } from "./routers/marketing.router";
import { communityRouter } from "./routers/community.router";
import { memoriesRouter } from "./routers/memories.router";
import { pushRouter } from "./routers/push.router";
import { agencyRouter } from "./routers/agency.router";
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
  events: eventsRouter,
  chat: chatRouter,
  bookings: bookingsRouter,
  notifs: notifRouter,
  contracts: contractsRouter,
  sponsors: sponsorsRouter,
  pay: payRecordsRouter,
  marketing: marketingRouter,
  community: communityRouter,
  memories: memoriesRouter,
  push: pushRouter,
  agency: agencyRouter,
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
