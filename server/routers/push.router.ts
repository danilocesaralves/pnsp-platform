import { z } from "zod";
import webpush from "web-push";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { pushSubscriptions } from "../../drizzle/schema";

// ─── VAPID config (set once at module load) ───────────────────────────────────
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL   = process.env.VAPID_EMAIL       ?? "mailto:admin@pnsp.com.br";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

// ─── Internal helper — exported for use in other routers ─────────────────────
export async function sendPushToUser(
  userId: number,
  payload: { title: string; body: string; icon?: string; url?: string },
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;     // VAPID not configured

  const db = await getDb();
  if (!db) return;

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  const pushPayload = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    icon:  payload.icon ?? "/logo-pnsp-crop.png",
    url:   payload.url  ?? "/",
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        pushPayload,
      );
    } catch (err: any) {
      // 410 Gone or 404 — subscription expired, remove it
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
  }
}

// ─── tRPC router ─────────────────────────────────────────────────────────────
export const pushRouter = router({
  getPublicKey: protectedProcedure
    .query(() => VAPID_PUBLIC || null),

  subscribe: protectedProcedure
    .input(z.object({
      endpoint: z.string().url(),
      p256dh:   z.string().min(1),
      auth:     z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) return { success: false };
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .insert(pushSubscriptions)
        .values({
          userId:   ctx.user.id,
          endpoint: input.endpoint,
          p256dh:   input.p256dh,
          auth:     input.auth,
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: { p256dh: input.p256dh, auth: input.auth, userId: ctx.user.id },
        });

      return { success: true };
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint));

      return { success: true };
    }),
});
