import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bookings, bookingTimeline, notifications, profiles, users } from "../../drizzle/schema";
import * as repo from "../repositories";
import { sendPushToUser } from "./push.router";
import { sendNewProposalEmail, sendProposalAcceptedEmail } from "../lib/email";

type BookingNegStatus = "rascunho" | "proposta_enviada" | "contraproposta" | "aceito" | "recusado" | "cancelado";

async function addTimeline(
  bookingId: number,
  actorProfileId: number,
  action: string,
  note: string | null = null,
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(bookingTimeline).values({ bookingId, actorProfileId, action, note });
}

async function createNotif(
  userId: number,
  type: string,
  title: string,
  message: string,
  link: string | null = null,
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({ userId, type, title, message: message, link });
}

const bookingInput = z.object({
  artistProfileId: z.number().int(),
  title:           z.string().min(1).max(200),
  description:     z.string().max(3000).optional(),
  eventDate:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  eventCity:       z.string().max(100).optional(),
  eventState:      z.string().length(2).optional(),
  proposedValue:   z.number().int().min(0).optional(),
  notes:           z.string().max(2000).optional(),
  opportunityId:   z.number().int().optional(),
});

export const bookingsRouter = router({

  // ── Criar booking rascunho ────────────────────────────────────────────────
  create: protectedProcedure
    .input(bookingInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "BAD_REQUEST", message: "Crie um perfil antes" });

      const [booking] = await db.insert(bookings).values({
        contractorProfileId: myProfile.id,
        artistProfileId:     input.artistProfileId,
        title:               input.title,
        description:         input.description ?? null,
        eventDate:           input.eventDate    ?? null,
        eventCity:           input.eventCity    ?? null,
        eventState:          input.eventState   ?? null,
        proposedValue:       input.proposedValue ?? null,
        notes:               input.notes        ?? null,
        opportunityId:       input.opportunityId ?? null,
        status:              "rascunho",
      }).returning();

      await addTimeline(booking.id, myProfile.id, "criado", null);
      return booking;
    }),

  // ── Enviar proposta ───────────────────────────────────────────────────────
  sendProposal: protectedProcedure
    .input(z.object({ bookingId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.contractorProfileId !== myProfile.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (booking.status !== "rascunho") throw new TRPCError({ code: "BAD_REQUEST", message: "Proposta já enviada" });

      const [updated] = await db.update(bookings)
        .set({ status: "proposta_enviada", updatedAt: new Date() })
        .where(eq(bookings.id, input.bookingId))
        .returning();

      await addTimeline(booking.id, myProfile.id, "proposta_enviada", null);

      // Notifica o artista
      const [artistProfile] = await db.select().from(profiles).where(eq(profiles.id, booking.artistProfileId)).limit(1);
      if (artistProfile) {
        await createNotif(
          artistProfile.userId,
          "nova_proposta",
          "Nova proposta de contratação",
          `${myProfile.displayName} enviou uma proposta: "${booking.title}"`,
          `/negociacoes`,
        );
        // Push + Email
        sendPushToUser(artistProfile.userId, {
          title: "Nova proposta de contratação",
          body: `${myProfile.displayName}: "${booking.title}"`,
          url: "/negociacoes",
        }).catch(() => {});
        const [artistUser] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, artistProfile.userId)).limit(1);
        if (artistUser?.email) {
          sendNewProposalEmail(
            artistUser.email,
            artistUser.name ?? artistProfile.displayName,
            myProfile.displayName,
            booking.title,
            booking.proposedValue,
            booking.id,
          ).catch(() => {});
        }
      }

      return updated;
    }),

  // ── Contraproposta (artista) ──────────────────────────────────────────────
  sendCounter: protectedProcedure
    .input(z.object({
      bookingId:    z.number().int(),
      counterValue: z.number().int().min(0),
      artistNotes:  z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.artistProfileId !== myProfile.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (booking.status !== "proposta_enviada") throw new TRPCError({ code: "BAD_REQUEST", message: "Estado inválido para contraproposta" });

      const [updated] = await db.update(bookings)
        .set({
          status:       "contraproposta",
          counterValue: input.counterValue,
          artistNotes:  input.artistNotes ?? null,
          updatedAt:    new Date(),
        })
        .where(eq(bookings.id, input.bookingId))
        .returning();

      await addTimeline(booking.id, myProfile.id, "contraproposta", input.artistNotes ?? null);

      // Notifica o contratante
      const [contractorProfile] = await db.select().from(profiles).where(eq(profiles.id, booking.contractorProfileId)).limit(1);
      if (contractorProfile) {
        await createNotif(
          contractorProfile.userId,
          "contraproposta",
          "Contraproposta recebida",
          `${myProfile.displayName} enviou uma contraproposta para "${booking.title}"`,
          `/negociacoes`,
        );
        sendPushToUser(contractorProfile.userId, {
          title: "Contraproposta recebida",
          body: `${myProfile.displayName}: "${booking.title}"`,
          url: "/negociacoes",
        }).catch(() => {});
      }

      return updated;
    }),

  // ── Aceitar booking ───────────────────────────────────────────────────────
  accept: protectedProcedure
    .input(z.object({ bookingId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });

      const isArtist     = booking.artistProfileId     === myProfile.id;
      const isContractor = booking.contractorProfileId === myProfile.id;
      if (!isArtist && !isContractor) throw new TRPCError({ code: "FORBIDDEN" });

      if (isArtist && booking.status !== "proposta_enviada") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Só pode aceitar proposta enviada" });
      }
      if (isContractor && booking.status !== "contraproposta") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Só pode aceitar contraproposta" });
      }

      const finalValue = isContractor ? (booking.counterValue ?? booking.proposedValue) : booking.proposedValue;

      const [updated] = await db.update(bookings)
        .set({ status: "aceito", finalValue: finalValue ?? null, updatedAt: new Date() })
        .where(eq(bookings.id, input.bookingId))
        .returning();

      await addTimeline(booking.id, myProfile.id, "aceito", null);

      // Notifica a outra parte
      const otherProfileId = isArtist ? booking.contractorProfileId : booking.artistProfileId;
      const [otherProfile] = await db.select().from(profiles).where(eq(profiles.id, otherProfileId)).limit(1);
      if (otherProfile) {
        await createNotif(
          otherProfile.userId,
          "booking_aceito",
          "Proposta aceita!",
          `"${booking.title}" foi aceito por ${myProfile.displayName}`,
          `/negociacoes`,
        );
        sendPushToUser(otherProfile.userId, {
          title: "Proposta aceita! 🎉",
          body: `"${booking.title}" por ${myProfile.displayName}`,
          url: "/negociacoes",
        }).catch(() => {});
        const [otherUser] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, otherProfile.userId)).limit(1);
        if (otherUser?.email) {
          sendProposalAcceptedEmail(
            otherUser.email,
            otherUser.name ?? otherProfile.displayName,
            booking.title,
            booking.id,
          ).catch(() => {});
        }
      }
      // Notifica o próprio usuário que aceitou
      sendProposalAcceptedEmail(
        ctx.user.email ?? "",
        ctx.user.name ?? myProfile.displayName,
        booking.title,
        booking.id,
      ).catch(() => {});

      return updated;
    }),

  // ── Recusar booking ───────────────────────────────────────────────────────
  refuse: protectedProcedure
    .input(z.object({ bookingId: z.number().int(), note: z.string().max(1000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.artistProfileId !== myProfile.id && booking.contractorProfileId !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updated] = await db.update(bookings)
        .set({ status: "recusado", updatedAt: new Date() })
        .where(eq(bookings.id, input.bookingId))
        .returning();

      await addTimeline(booking.id, myProfile.id, "recusado", input.note ?? null);

      const otherProfileId = booking.artistProfileId === myProfile.id ? booking.contractorProfileId : booking.artistProfileId;
      const [otherProfile] = await db.select().from(profiles).where(eq(profiles.id, otherProfileId)).limit(1);
      if (otherProfile) {
        await createNotif(
          otherProfile.userId,
          "booking_recusado",
          "Proposta recusada",
          `"${booking.title}" foi recusado por ${myProfile.displayName}`,
          `/negociacoes`,
        );
      }

      return updated;
    }),

  // ── Cancelar booking ──────────────────────────────────────────────────────
  cancel: protectedProcedure
    .input(z.object({ bookingId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.artistProfileId !== myProfile.id && booking.contractorProfileId !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updated] = await db.update(bookings)
        .set({ status: "cancelado", updatedAt: new Date() })
        .where(eq(bookings.id, input.bookingId))
        .returning();

      await addTimeline(booking.id, myProfile.id, "cancelado", null);
      return updated;
    }),

  // ── Listar meus bookings ──────────────────────────────────────────────────
  getMyBookings: protectedProcedure
    .input(z.object({
      status: z.enum(["rascunho","proposta_enviada","contraproposta","aceito","recusado","cancelado"]).optional(),
      limit:  z.number().default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return [];

      const whereClause = input?.status
        ? and(
            or(
              eq(bookings.contractorProfileId, myProfile.id),
              eq(bookings.artistProfileId, myProfile.id),
            ),
            eq(bookings.status, input.status),
          )
        : or(
            eq(bookings.contractorProfileId, myProfile.id),
            eq(bookings.artistProfileId, myProfile.id),
          );

      const rows = await db.select().from(bookings)
        .where(whereClause)
        .orderBy(desc(bookings.updatedAt))
        .limit(input?.limit ?? 20);

      // Enrich with profiles
      return Promise.all(rows.map(async b => {
        const [contractor, artist] = await Promise.all([
          db.select({ id: profiles.id, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl, slug: profiles.slug })
            .from(profiles).where(eq(profiles.id, b.contractorProfileId)).limit(1),
          db.select({ id: profiles.id, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl, slug: profiles.slug })
            .from(profiles).where(eq(profiles.id, b.artistProfileId)).limit(1),
        ]);
        return { ...b, contractorProfile: contractor[0] ?? null, artistProfile: artist[0] ?? null };
      }));
    }),

  // ── Detalhe completo com timeline ─────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ bookingId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.contractorProfileId !== myProfile.id && booking.artistProfileId !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [timeline, contractor, artist] = await Promise.all([
        db.select().from(bookingTimeline)
          .where(eq(bookingTimeline.bookingId, input.bookingId))
          .orderBy(asc(bookingTimeline.createdAt)),
        db.select({ id: profiles.id, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl, slug: profiles.slug })
          .from(profiles).where(eq(profiles.id, booking.contractorProfileId)).limit(1),
        db.select({ id: profiles.id, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl, slug: profiles.slug })
          .from(profiles).where(eq(profiles.id, booking.artistProfileId)).limit(1),
      ]);

      return { ...booking, timeline, contractorProfile: contractor[0] ?? null, artistProfile: artist[0] ?? null };
    }),

  // ── Contagem de pendentes ─────────────────────────────────────────────────
  getPendingCount: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return 0;

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return 0;

      const rows = await db.select().from(bookings)
        .where(and(
          or(
            eq(bookings.contractorProfileId, myProfile.id),
            eq(bookings.artistProfileId, myProfile.id),
          ),
          or(
            eq(bookings.status, "proposta_enviada"),
            eq(bookings.status, "contraproposta"),
          ),
        ));

      return rows.length;
    }),
});
