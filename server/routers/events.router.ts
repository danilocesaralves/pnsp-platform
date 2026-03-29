import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { events } from "../../drizzle/schema";
import * as repo from "../repositories";

const eventInput = z.object({
  title:     z.string().min(1).max(200),
  type:      z.enum(["show", "ensaio", "gravacao", "reuniao", "outro"]),
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime:   z.string().regex(/^\d{2}:\d{2}$/).optional(),
  location:  z.string().max(300).optional(),
  city:      z.string().max(100).optional(),
  state:     z.string().length(2).optional(),
  notes:     z.string().max(2000).optional(),
  status:    z.enum(["confirmado", "pendente", "cancelado"]).default("pendente"),
  isPublic:  z.boolean().default(false),
});

export const eventsRouter = router({

  // ── Criar evento ──────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(eventInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const profile = await repo.getProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "BAD_REQUEST", message: "Crie um perfil antes de criar eventos" });

      // Verifica conflito de horário no mesmo dia
      if (input.startTime && input.endTime) {
        const sameDay = await db
          .select()
          .from(events)
          .where(and(
            eq(events.profileId, profile.id),
            eq(events.date, input.date),
          ));

        const conflict = sameDay.find(e => {
          if (!e.startTime || !e.endTime) return false;
          return input.startTime! < e.endTime && input.endTime! > e.startTime;
        });

        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Conflito de horário com "${conflict.title}" (${conflict.startTime}–${conflict.endTime})`,
          });
        }
      }

      const [created] = await db.insert(events).values({
        profileId: profile.id,
        ...input,
        startTime: input.startTime ?? null,
        endTime:   input.endTime   ?? null,
        location:  input.location  ?? null,
        city:      input.city      ?? null,
        state:     input.state     ?? null,
        notes:     input.notes     ?? null,
      }).returning();

      return created;
    }),

  // ── Listar eventos públicos de um perfil ─────────────────────────────────
  getByProfile: publicProcedure
    .input(z.object({ profileId: z.number().int(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(events)
        .where(and(eq(events.profileId, input.profileId), eq(events.isPublic, true)))
        .orderBy(asc(events.date))
        .limit(input.limit);
    }),

  // ── Todos os eventos do usuário logado ────────────────────────────────────
  getMyEvents: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const profile = await repo.getProfileByUserId(ctx.user.id);
      if (!profile) return [];

      return db
        .select()
        .from(events)
        .where(eq(events.profileId, profile.id))
        .orderBy(asc(events.date), asc(events.startTime));
    }),

  // ── Próximos 5 eventos ────────────────────────────────────────────────────
  getUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const profile = await repo.getProfileByUserId(ctx.user.id);
      if (!profile) return [];

      const today = new Date().toISOString().split("T")[0];
      return db
        .select()
        .from(events)
        .where(and(
          eq(events.profileId, profile.id),
          gte(events.date, today),
        ))
        .orderBy(asc(events.date))
        .limit(5);
    }),

  // ── Atualizar evento (só dono) ────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({ id: z.number().int(), data: eventInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const profile = await repo.getProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "FORBIDDEN" });

      const [event] = await db.select().from(events).where(eq(events.id, input.id)).limit(1);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      if (event.profileId !== profile.id) throw new TRPCError({ code: "FORBIDDEN" });

      const [updated] = await db
        .update(events)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(events.id, input.id))
        .returning();

      return updated;
    }),

  // ── Deletar evento (só dono) ──────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const profile = await repo.getProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "FORBIDDEN" });

      const [event] = await db.select().from(events).where(eq(events.id, input.id)).limit(1);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      if (event.profileId !== profile.id) throw new TRPCError({ code: "FORBIDDEN" });

      await db.delete(events).where(eq(events.id, input.id));
      return { success: true };
    }),
});
