import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { chatMessages, conversations, profiles } from "../../drizzle/schema";
import * as repo from "../repositories";

export const chatRouter = router({

  // ── Busca ou cria conversa entre dois perfis ──────────────────────────────
  getOrCreateConversation: protectedProcedure
    .input(z.object({
      otherProfileId: z.number().int(),
      context:        z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "BAD_REQUEST", message: "Crie um perfil primeiro" });

      if (myProfile.id === input.otherProfileId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível conversar com si mesmo" });
      }

      // Garante ordem canônica A < B para evitar duplicatas
      const a = Math.min(myProfile.id, input.otherProfileId);
      const b = Math.max(myProfile.id, input.otherProfileId);

      const existing = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.participantA, a), eq(conversations.participantB, b)))
        .limit(1);

      if (existing[0]) return existing[0];

      const [created] = await db
        .insert(conversations)
        .values({ participantA: a, participantB: b, context: input.context ?? null })
        .returning();

      return created;
    }),

  // ── Lista conversas do usuário com último msg + não lidas ─────────────────
  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return [];

      const mine = await db
        .select()
        .from(conversations)
        .where(or(
          eq(conversations.participantA, myProfile.id),
          eq(conversations.participantB, myProfile.id),
        ))
        .orderBy(desc(conversations.lastMessageAt))
        .limit(50);

      if (mine.length === 0) return [];

      // Para cada conversa busca o outro perfil + última mensagem + não lidas
      const enriched = await Promise.all(mine.map(async conv => {
        const otherId = conv.participantA === myProfile.id ? conv.participantB : conv.participantA;

        const [otherProfile, lastMsgRows, unreadRow] = await Promise.all([
          db.select({ id: profiles.id, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl, slug: profiles.slug })
            .from(profiles).where(eq(profiles.id, otherId)).limit(1),

          db.select().from(chatMessages)
            .where(eq(chatMessages.conversationId, conv.id))
            .orderBy(desc(chatMessages.createdAt))
            .limit(1),

          db.select({ count: sql<number>`COUNT(*)::int` })
            .from(chatMessages)
            .where(and(
              eq(chatMessages.conversationId, conv.id),
              eq(chatMessages.isRead, false),
              // não contabiliza mensagens que eu enviei
              or(
                eq(chatMessages.senderId, conv.participantA === myProfile.id ? conv.participantB : conv.participantA),
              ),
            )),
        ]);

        return {
          ...conv,
          otherProfile: otherProfile[0] ?? null,
          lastMessage:  lastMsgRows[0]   ?? null,
          unreadCount:  Number(unreadRow[0]?.count ?? 0),
        };
      }));

      return enriched;
    }),

  // ── Mensagens de uma conversa paginado ────────────────────────────────────
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number().int(),
      limit:          z.number().default(50),
      offset:         z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return [];

      // Verifica que o usuário participa desta conversa
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, input.conversationId)).limit(1);
      if (!conv) throw new TRPCError({ code: "NOT_FOUND" });
      if (conv.participantA !== myProfile.id && conv.participantB !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // ── Enviar mensagem ───────────────────────────────────────────────────────
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number().int(),
      content:        z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) throw new TRPCError({ code: "BAD_REQUEST" });

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, input.conversationId)).limit(1);
      if (!conv) throw new TRPCError({ code: "NOT_FOUND" });
      if (conv.participantA !== myProfile.id && conv.participantB !== myProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [msg] = await db.insert(chatMessages).values({
        conversationId: input.conversationId,
        senderId:       myProfile.id,
        content:        input.content,
      }).returning();

      // Atualiza lastMessageAt da conversa
      await db.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return msg;
    }),

  // ── Marca todas as mensagens de uma conversa como lidas ───────────────────
  markAsRead: protectedProcedure
    .input(z.object({ conversationId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: true };

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return { success: true };

      await db
        .update(chatMessages)
        .set({ isRead: true })
        .where(and(
          eq(chatMessages.conversationId, input.conversationId),
          eq(chatMessages.isRead, false),
        ));

      return { success: true };
    }),

  // ── Total de mensagens não lidas do usuário ───────────────────────────────
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return 0;

      const myProfile = await repo.getProfileByUserId(ctx.user.id);
      if (!myProfile) return 0;

      // Conversas do usuário
      const myConvs = await db
        .select({ id: conversations.id, participantA: conversations.participantA, participantB: conversations.participantB })
        .from(conversations)
        .where(or(
          eq(conversations.participantA, myProfile.id),
          eq(conversations.participantB, myProfile.id),
        ));

      if (myConvs.length === 0) return 0;

      let total = 0;
      for (const conv of myConvs) {
        const otherId = conv.participantA === myProfile.id ? conv.participantB : conv.participantA;
        const [row] = await db.select({ count: sql<number>`COUNT(*)::int` })
          .from(chatMessages)
          .where(and(
            eq(chatMessages.conversationId, conv.id),
            eq(chatMessages.isRead, false),
            eq(chatMessages.senderId, otherId),
          ));
        total += Number(row?.count ?? 0);
      }

      return total;
    }),
});
