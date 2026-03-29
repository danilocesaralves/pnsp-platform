import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, or } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contracts, contractTemplates, bookings, profiles, notifications } from "../../drizzle/schema";
import * as repo from "../repositories";

function fmtBRL(cents: number | null | undefined): string {
  if (cents == null) return "A confirmar";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "A confirmar";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function applyVars(content: string, vars: Record<string, string>): string {
  let result = content;
  for (const [k, v] of Object.entries(vars)) {
    result = result.replaceAll(`{{${k}}}`, v);
  }
  return result;
}

export const contractsRouter = router({

  // ── Listar templates ──────────────────────────────────────────────────────
  getTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contractTemplates).orderBy(contractTemplates.name);
  }),

  // ── Criar contrato rascunho ────────────────────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      title:                z.string().min(1).max(200),
      type:                 z.enum(["show","producao","aula","parceria","patrocinio","fornecedor","outro"]).default("show"),
      content:              z.string().min(1),
      templateId:           z.number().int().optional(),
      bookingId:            z.number().int().optional(),
      counterpartProfileId: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "BAD_REQUEST", message: "Crie um perfil antes" });

      const [contract] = await db.insert(contracts).values({
        profileId:            myProfile.id,
        title:                input.title,
        type:                 input.type,
        content:              input.content,
        templateId:           input.templateId ?? null,
        bookingId:            input.bookingId ?? null,
        counterpartProfileId: input.counterpartProfileId ?? null,
        status:               "rascunho",
      }).returning();

      return contract;
    }),

  // ── Meus contratos ────────────────────────────────────────────────────────
  getMyContracts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const myProfile = await repo.getProfileByUserId(ctx.user.id);
    if (!myProfile) return [];

    const rows = await db.select().from(contracts)
      .where(or(
        eq(contracts.profileId, myProfile.id),
        eq(contracts.counterpartProfileId, myProfile.id),
      ))
      .orderBy(desc(contracts.updatedAt));

    return Promise.all(rows.map(async c => {
      const [owner, counterpart] = await Promise.all([
        db.select({ id: profiles.id, displayName: profiles.displayName, slug: profiles.slug })
          .from(profiles).where(eq(profiles.id, c.profileId)).limit(1),
        c.counterpartProfileId
          ? db.select({ id: profiles.id, displayName: profiles.displayName, slug: profiles.slug })
              .from(profiles).where(eq(profiles.id, c.counterpartProfileId)).limit(1)
          : Promise.resolve([]),
      ]);
      return { ...c, ownerProfile: owner[0] ?? null, counterpartProfile: (counterpart as any[])[0] ?? null };
    }));
  }),

  // ── Detalhe ───────────────────────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ contractId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [contract] = await db.select().from(contracts).where(eq(contracts.id, input.contractId)).limit(1);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      if (contract.profileId !== myProfile.id && contract.counterpartProfileId !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [owner, counterpart] = await Promise.all([
        db.select({ id: profiles.id, displayName: profiles.displayName, slug: profiles.slug })
          .from(profiles).where(eq(profiles.id, contract.profileId)).limit(1),
        contract.counterpartProfileId
          ? db.select({ id: profiles.id, displayName: profiles.displayName, slug: profiles.slug })
              .from(profiles).where(eq(profiles.id, contract.counterpartProfileId)).limit(1)
          : Promise.resolve([]),
      ]);

      return { ...contract, ownerProfile: owner[0] ?? null, counterpartProfile: (counterpart as any[])[0] ?? null };
    }),

  // ── Enviar para assinatura ────────────────────────────────────────────────
  sendForSignature: protectedProcedure
    .input(z.object({ contractId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [contract] = await db.select().from(contracts).where(eq(contracts.id, input.contractId)).limit(1);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      if (contract.profileId !== myProfile.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (contract.status !== "rascunho") throw new TRPCError({ code: "BAD_REQUEST", message: "Só rascunhos podem ser enviados" });

      const [updated] = await db.update(contracts)
        .set({ status: "aguardando_assinatura", updatedAt: new Date() })
        .where(eq(contracts.id, input.contractId))
        .returning();

      // Notifica contraparte
      if (contract.counterpartProfileId) {
        const [counterpart] = await db.select().from(profiles).where(eq(profiles.id, contract.counterpartProfileId)).limit(1);
        if (counterpart) {
          await db.insert(notifications).values({
            userId:  counterpart.userId,
            type:    "nova_proposta",
            title:   "Contrato aguardando sua assinatura",
            message: `${myProfile.displayName} enviou "${contract.title}" para assinatura`,
            link:    "/contratos",
          });
        }
      }

      return updated;
    }),

  // ── Assinar ───────────────────────────────────────────────────────────────
  sign: protectedProcedure
    .input(z.object({
      contractId:     z.number().int(),
      signerName:     z.string().min(2).max(200),
      signerDocument: z.string().min(5).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [contract] = await db.select().from(contracts).where(eq(contracts.id, input.contractId)).limit(1);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

      const isCounterpart = contract.counterpartProfileId === myProfile.id;
      const isOwner       = contract.profileId === myProfile.id;
      if (!isCounterpart && !isOwner) throw new TRPCError({ code: "FORBIDDEN" });
      if (contract.status !== "aguardando_assinatura") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contrato não está aguardando assinatura" });
      }

      const [updated] = await db.update(contracts)
        .set({
          status:         "assinado",
          signedAt:       new Date(),
          signerName:     input.signerName,
          signerDocument: input.signerDocument,
          updatedAt:      new Date(),
        })
        .where(eq(contracts.id, input.contractId))
        .returning();

      // Notifica o dono do contrato
      const [owner] = await db.select().from(profiles).where(eq(profiles.id, contract.profileId)).limit(1);
      if (owner && isCounterpart) {
        await db.insert(notifications).values({
          userId:  owner.userId,
          type:    "booking_aceito",
          title:   "Contrato assinado!",
          message: `${myProfile.displayName} assinou "${contract.title}"`,
          link:    "/contratos",
        });
      }

      return updated;
    }),

  // ── Cancelar ──────────────────────────────────────────────────────────────
  cancel: protectedProcedure
    .input(z.object({ contractId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [contract] = await db.select().from(contracts).where(eq(contracts.id, input.contractId)).limit(1);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      if (contract.profileId !== myProfile.id && contract.counterpartProfileId !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updated] = await db.update(contracts)
        .set({ status: "cancelado", updatedAt: new Date() })
        .where(eq(contracts.id, input.contractId))
        .returning();

      return updated;
    }),

  // ── Gerar contrato a partir de booking ────────────────────────────────────
  generateFromBooking: protectedProcedure
    .input(z.object({ bookingId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.contractorProfileId !== myProfile.id && booking.artistProfileId !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (booking.status !== "aceito") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Só bookings aceitos podem gerar contrato" });
      }

      // Busca perfis
      const [contractorProfile, artistProfile] = await Promise.all([
        db.select({ id: profiles.id, displayName: profiles.displayName })
          .from(profiles).where(eq(profiles.id, booking.contractorProfileId)).limit(1),
        db.select({ id: profiles.id, displayName: profiles.displayName })
          .from(profiles).where(eq(profiles.id, booking.artistProfileId)).limit(1),
      ]);

      // Template padrão tipo show
      const [template] = await db.select().from(contractTemplates)
        .where(and(eq(contractTemplates.type, "show"), eq(contractTemplates.isDefault, true)))
        .limit(1);

      const content = template
        ? applyVars(template.content, {
            artista:    artistProfile[0]?.displayName    ?? "Artista",
            contratante: contractorProfile[0]?.displayName ?? "Contratante",
            valor:      fmtBRL(booking.finalValue ?? booking.proposedValue),
            data:       fmtDate(booking.eventDate),
            local:      booking.eventCity
              ? `${booking.eventCity}${booking.eventState ? `/${booking.eventState}` : ""}`
              : "A confirmar",
            horario:    "A confirmar",
            duracao:    "Conforme rider técnico",
          })
        : `<h2>Contrato: ${booking.title}</h2><p>Gerado automaticamente.</p>`;

      const [contract] = await db.insert(contracts).values({
        bookingId:            booking.id,
        profileId:            booking.contractorProfileId,
        counterpartProfileId: booking.artistProfileId,
        title:                `Contrato — ${booking.title}`,
        type:                 "show",
        templateId:           template?.id ?? null,
        content,
        status:               "rascunho",
      }).returning();

      return contract;
    }),
});
