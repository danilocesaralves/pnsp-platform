import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { paymentRecords, profiles } from "../../drizzle/schema";
import * as repo from "../repositories";

export const payRecordsRouter = router({

  // ── Criar pagamento ───────────────────────────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      payeeId:   z.number().int(),
      amount:    z.number().int().min(1),
      method:    z.enum(["pix","transferencia","dinheiro","outro"]).default("pix"),
      bookingId: z.number().int().optional(),
      reference: z.string().max(200).optional(),
      notes:     z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "BAD_REQUEST", message: "Crie um perfil antes" });

      const [pay] = await db.insert(paymentRecords).values({
        payerId:   myProfile.id,
        payeeId:   input.payeeId,
        amount:    input.amount,
        method:    input.method,
        bookingId: input.bookingId ?? null,
        reference: input.reference ?? null,
        notes:     input.notes     ?? null,
        status:    "pendente",
      }).returning();

      return pay;
    }),

  // ── Confirmar pagamento ───────────────────────────────────────────────────
  confirm: protectedProcedure
    .input(z.object({ paymentId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [pay] = await db.select().from(paymentRecords).where(eq(paymentRecords.id, input.paymentId)).limit(1);
      if (!pay) throw new TRPCError({ code: "NOT_FOUND" });
      if (pay.payerId !== myProfile.id && pay.payeeId !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updated] = await db.update(paymentRecords)
        .set({ status: "confirmado", paidAt: new Date() })
        .where(eq(paymentRecords.id, input.paymentId))
        .returning();

      return updated;
    }),

  // ── Listar pagamentos (recebidos + enviados) ──────────────────────────────
  getMyPayments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const myProfile = await repo.getProfileByUserId(ctx.user.id);
    if (!myProfile) return [];

    const rows = await db.select().from(paymentRecords)
      .where(or(
        eq(paymentRecords.payerId, myProfile.id),
        eq(paymentRecords.payeeId, myProfile.id),
      ))
      .orderBy(desc(paymentRecords.createdAt));

    return Promise.all(rows.map(async p => {
      const [payer, payee] = await Promise.all([
        db.select({ id: profiles.id, displayName: profiles.displayName }).from(profiles).where(eq(profiles.id, p.payerId)).limit(1),
        db.select({ id: profiles.id, displayName: profiles.displayName }).from(profiles).where(eq(profiles.id, p.payeeId)).limit(1),
      ]);
      return { ...p, payerProfile: payer[0] ?? null, payeeProfile: payee[0] ?? null, isIncoming: p.payeeId === myProfile.id };
    }));
  }),

  // ── Stats ─────────────────────────────────────────────────────────────────
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalReceived: 0, totalPending: 0, avgTicket: 0, count: 0 };

    const myProfile = await repo.getProfileByUserId(ctx.user.id);
    if (!myProfile) return { totalReceived: 0, totalPending: 0, avgTicket: 0, count: 0 };

    const [received] = await db.select({
      total: sql<number>`COALESCE(SUM(${paymentRecords.amount}), 0)::int`,
      count: sql<number>`COUNT(*)::int`,
      avg:   sql<number>`COALESCE(AVG(${paymentRecords.amount}), 0)::int`,
    }).from(paymentRecords)
      .where(and(eq(paymentRecords.payeeId, myProfile.id), eq(paymentRecords.status, "confirmado")));

    const [pending] = await db.select({
      total: sql<number>`COALESCE(SUM(${paymentRecords.amount}), 0)::int`,
    }).from(paymentRecords)
      .where(and(eq(paymentRecords.payeeId, myProfile.id), eq(paymentRecords.status, "pendente")));

    return {
      totalReceived: Number(received?.total ?? 0),
      totalPending:  Number(pending?.total ?? 0),
      avgTicket:     Number(received?.avg ?? 0),
      count:         Number(received?.count ?? 0),
    };
  }),
});
