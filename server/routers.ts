import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import * as db from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-02-25.clover' });

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

// Owner guard
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "owner" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao proprietário" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── PROFILES ──────────────────────────────────────────────────────────────
  profiles: router({
    list: publicProcedure
      .input(z.object({
        profileType: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(({ input }) => db.listProfiles(input)),

    listFeatured: publicProcedure
      .input(z.object({ limit: z.number().default(8) }).optional())
      .query(({ input }) => db.listFeaturedProfiles(input?.limit ?? 8)),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const profile = await db.getProfileBySlug(input.slug);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
        await db.incrementProfileView(profile.id);
        const portfolio = await db.getPortfolioByProfileId(profile.id);
        return { ...profile, portfolio };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getProfileById(input.id);
        return profile ?? null;
      }),

    getMyProfile: protectedProcedure
      .query(({ ctx }) => db.getProfileByUserId(ctx.user.id)),

    create: protectedProcedure
      .input(z.object({
        profileType: z.enum(["artista_solo","grupo_banda","comunidade_roda","produtor","estudio","professor","loja","luthier","contratante","parceiro"]),
        displayName: z.string().min(2).max(200),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        coverUrl: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        instagramUrl: z.string().optional(),
        youtubeUrl: z.string().optional(),
        spotifyUrl: z.string().optional(),
        facebookUrl: z.string().optional(),
        tiktokUrl: z.string().optional(),
        specialties: z.array(z.string()).optional(),
        instruments: z.array(z.string()).optional(),
        genres: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const slug = `${input.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
        await db.createProfile({
          ...input,
          userId: ctx.user.id,
          slug,
          specialties: input.specialties ?? null,
          instruments: input.instruments ?? null,
          genres: input.genres ?? null,
          tags: input.tags ?? null,
        });
        return { success: true, slug };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        displayName: z.string().min(2).max(200).optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        coverUrl: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        instagramUrl: z.string().optional(),
        youtubeUrl: z.string().optional(),
        spotifyUrl: z.string().optional(),
        facebookUrl: z.string().optional(),
        tiktokUrl: z.string().optional(),
        specialties: z.array(z.string()).optional(),
        instruments: z.array(z.string()).optional(),
        genres: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileById(input.id);
        if (!profile || profile.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, specialties, instruments, genres, tags, ...rest } = input;
        await db.updateProfile(id, {
          ...rest,
          specialties: specialties ?? undefined,
          instruments: instruments ?? undefined,
          genres: genres ?? undefined,
          tags: tags ?? undefined,
        });
        return { success: true };
      }),

    addPortfolioItem: protectedProcedure
      .input(z.object({
        profileId: z.number(),
        mediaType: z.enum(["image", "video", "audio"]),
        url: z.string(),
        thumbnailUrl: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileById(input.profileId);
        if (!profile || profile.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.addPortfolioItem(input);
        return { success: true };
      }),

    // Admin: list all profiles
    adminList: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        const allProfiles = await db.listProfiles({ limit: input.limit, offset: input.offset });
        return allProfiles;
      }),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending","active","suspended"]).optional(),
        isVerified: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateProfile(id, data);
        await db.createAdminLog({
          adminId: ctx.user.id,
          action: "update_profile",
          entityType: "profile",
          entityId: id,
          details: JSON.stringify(data),
        });
        return { success: true };
      }),
  }),

  // ─── OFFERINGS ─────────────────────────────────────────────────────────────
  offerings: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(({ input }) => db.listOfferings(input)),

    listRecent: publicProcedure
      .input(z.object({ limit: z.number().default(6) }).optional())
      .query(({ input }) => db.listOfferings({ limit: input?.limit ?? 6 })),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const offering = await db.getOfferingById(input.id);
        return offering ?? null;
      }),

    myOfferings: protectedProcedure
      .query(({ ctx }) => db.listOfferings({ userId: ctx.user.id })),

    create: protectedProcedure
      .input(z.object({
        profileId: z.number(),
        title: z.string().min(3).max(300),
        description: z.string().optional(),
        category: z.enum(["show","aula","producao","instrumento_novo","instrumento_usado","artesanato","acessorio","audiovisual","luthieria","estudio","servico","outro"]),
        priceType: z.enum(["fixo","sob_consulta","gratuito","a_combinar"]).default("a_combinar"),
        price: z.number().optional(),
        imageUrl: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileById(input.profileId);
        if (!profile || profile.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.createOffering({
          ...input,
          userId: ctx.user.id,
          tags: input.tags ?? null,
          price: input.price != null ? String(input.price) : null,
          status: "active",
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        priceType: z.enum(["fixo","sob_consulta","gratuito","a_combinar"]).optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const offering = await db.getOfferingById(input.id);
        if (!offering || offering.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, price, ...rest } = input;
        await db.updateOffering(id, { ...rest, price: price != null ? String(price) : undefined });
        return { success: true };
      }),

    expressInterest: protectedProcedure
      .input(z.object({
        offeringId: z.number(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createOfferingInterest({
          offeringId: input.offeringId,
          userId: ctx.user.id,
          message: input.message,
        });
        return { success: true };
      }),

    adminList: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(({ input }) => db.listOfferings({ status: input.status, limit: input.limit, offset: input.offset })),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending","active","rejected","expired"]).optional(),
        isPremium: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateOffering(id, data);
        await db.createAdminLog({
          adminId: ctx.user.id,
          action: "update_offering",
          entityType: "offering",
          entityId: id,
          details: JSON.stringify(data),
        });
        return { success: true };
      }),
  }),

  // ─── OPPORTUNITIES ─────────────────────────────────────────────────────────
  opportunities: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        state: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(({ input }) => db.listOpportunities(input)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const opp = await db.getOpportunityById(input.id);
        return opp ?? null;
      }),

    myOpportunities: protectedProcedure
      .query(({ ctx }) => db.listOpportunities({ userId: ctx.user.id })),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(3).max(300),
        description: z.string().optional(),
        category: z.enum(["vaga_grupo","show","evento","projeto","aula","producao","estudio","servico","outro"]),
        requiredType: z.enum(["artista_solo","grupo_banda","comunidade_roda","produtor","estudio","professor","loja","luthier","contratante","qualquer"]).default("qualquer"),
        city: z.string().optional(),
        state: z.string().optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        tags: z.array(z.string()).optional(),
        deadline: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createOpportunity({
          ...input,
          userId: ctx.user.id,
          tags: input.tags ?? null,
          budgetMin: input.budgetMin != null ? String(input.budgetMin) : null,
          budgetMax: input.budgetMax != null ? String(input.budgetMax) : null,
          deadline: input.deadline ? new Date(input.deadline) : null,
          status: "active",
        });
        return { success: true };
      }),

    submitApplication: protectedProcedure
      .input(z.object({
        opportunityId: z.number(),
        profileId: z.number().optional(),
        coverLetter: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createApplication({
          opportunityId: input.opportunityId,
          userId: ctx.user.id,
          profileId: input.profileId,
          coverLetter: input.coverLetter,
        });
        return { success: true };
      }),

    myApplications: protectedProcedure
      .query(({ ctx }) => db.getApplicationsByUser(ctx.user.id)),

    adminList: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(({ input }) => db.listOpportunities({ status: input.status, limit: input.limit, offset: input.offset })),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending","active","rejected","closed"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateOpportunity(id, data);
        await db.createAdminLog({
          adminId: ctx.user.id,
          action: "update_opportunity",
          entityType: "opportunity",
          entityId: id,
          details: JSON.stringify(data),
        });
        return { success: true };
      }),
  }),

  // ─── STUDIOS ───────────────────────────────────────────────────────────────
  studios: router({
    list: publicProcedure
      .input(z.object({
        state: z.string().optional(),
        city: z.string().optional(),
        studioType: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(({ input }) => db.listStudios(input)),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const studio = await db.getStudioBySlug(input.slug);
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
        const studio = await db.getStudioById(input.studioId);
        if (!studio) throw new TRPCError({ code: "NOT_FOUND" });
        const start = new Date(input.startAt);
        const end = new Date(input.endAt);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const totalPrice = studio.pricePerHour ? Number(studio.pricePerHour) * hours : 0;
        await db.createBooking({
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
      .query(({ ctx }) => db.getBookingsByUser(ctx.user.id)),
  }),

  // ─── ACADEMY ───────────────────────────────────────────────────────────────
  academy: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        contentType: z.string().optional(),
        level: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(({ input }) => db.listAcademyContent(input)),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const content = await db.getAcademyContentBySlug(input.slug);
        if (!content) throw new TRPCError({ code: "NOT_FOUND" });
        return content;
      }),

    adminCreate: adminProcedure
      .input(z.object({
        title: z.string().min(3).max(300),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        contentType: z.enum(["artigo","video","tutorial","curso","podcast"]),
        category: z.enum(["historia","tecnica","instrumentos","composicao","producao","carreira","negocios","cultura"]),
        level: z.enum(["iniciante","intermediario","avancado"]).default("iniciante"),
        thumbnailUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        duration: z.number().optional(),
        isPremium: z.boolean().default(false),
        price: z.number().optional(),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
        await db.createAcademyContent({
          ...input,
          authorId: ctx.user.id,
          slug,
          tags: input.tags ?? null,
          price: input.price != null ? String(input.price) : null,
          publishedAt: input.isPublished ? new Date() : null,
        });
        return { success: true };
      }),
  }),

  // ─── MAP ───────────────────────────────────────────────────────────────────
  map: router({
    getMarkers: publicProcedure
      .input(z.object({
        type: z.enum(["profiles","studios","all"]).default("all"),
        state: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const markers: any[] = [];
        if (input.type === "profiles" || input.type === "all") {
          const profs = await db.listProfiles({ state: input.state, limit: 200 });
          profs.filter(p => p.lat && p.lng).forEach(p => {
            markers.push({
              id: `profile-${p.id}`,
              type: "profile",
              lat: Number(p.lat),
              lng: Number(p.lng),
              name: p.displayName,
              profileType: p.profileType,
              slug: p.slug,
              avatarUrl: p.avatarUrl,
              city: p.city,
              state: p.state,
            });
          });
        }
        if (input.type === "studios" || input.type === "all") {
          const studs = await db.listStudios({ state: input.state, limit: 200 });
          studs.filter(s => s.lat && s.lng).forEach(s => {
            markers.push({
              id: `studio-${s.id}`,
              type: "studio",
              lat: Number(s.lat),
              lng: Number(s.lng),
              name: s.name,
              slug: s.slug,
              imageUrl: s.imageUrl,
              city: s.city,
              state: s.state,
            });
          });
        }
        return markers;
      }),
  }),

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure
      .query(({ ctx }) => db.getUserNotifications(ctx.user.id)),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationRead(input.id);
        return { success: true };
      }),
  }),

  // ─── IMAGE GENERATION ──────────────────────────────────────────────────────
  imageGen: router({
    generate: protectedProcedure
      .input(z.object({
        prompt: z.string().min(10).max(500),
        purpose: z.enum(["perfil","oferta","evento","banner","outro"]).default("outro"),
      }))
      .mutation(async ({ ctx, input }) => {
        const enhancedPrompt = `Imagem profissional para plataforma de samba e pagode brasileiro. ${input.prompt}. Estilo: fotográfico, vibrante, cultural, alta qualidade.`;
        const result = await generateImage({ prompt: enhancedPrompt });
        await db.saveGeneratedImage({
          userId: ctx.user.id,
          prompt: input.prompt,
          imageUrl: result.url ?? "",
          purpose: input.purpose,
        });
        return { url: result.url };
      }),

    myImages: protectedProcedure
      .query(({ ctx }) => db.getUserGeneratedImages(ctx.user.id)),
  }),

  // ─── PLATFORM PUBLIC STATS ────────────────────────────────────────────────
  platform: router({
    publicStats: publicProcedure
      .query(() => db.getPublicStats()),
  }),

  // ─── ADMIN ─────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure
      .query(() => db.getPlatformStats()),

    users: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => db.getAllUsers(input.limit, input.offset)),

    updateUser: adminProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(["user","admin","owner"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db2 = await db.getDb();
        if (!db2) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db2.update(users).set({ role: input.role }).where(eq(users.id, input.id));
        await db.createAdminLog({
          adminId: ctx.user.id,
          action: "update_user_role",
          entityType: "user",
          entityId: input.id,
          details: JSON.stringify({ role: input.role }),
        });
        return { success: true };
      }),

    logs: adminProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(({ input }) => db.getAdminLogs(input.limit)),

    financialRecords: adminProcedure
      .query(() => db.getFinancialRecords()),

    createFinancialRecord: adminProcedure
      .input(z.object({
        type: z.enum(["receita","custo"]),
        category: z.string(),
        description: z.string().optional(),
        amount: z.number(),
        isProjected: z.boolean().default(false),
        recordedAt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createFinancialRecord({
          ...input,
          amount: String(input.amount),
          recordedAt: input.recordedAt ? new Date(input.recordedAt) : new Date(),
        });
        return { success: true };
      }),
  }),

  // ─── OWNER DASHBOARD ───────────────────────────────────────────────────────
  owner: router({
    stats: ownerProcedure
      .query(() => db.getPlatformStats()),

    financialSummary: ownerProcedure
      .query(async () => {
        const [records, revenue, costs] = await Promise.all([
          db.getFinancialRecords(200),
          db.getTotalRevenue(),
          db.getTotalCosts(),
        ]);
        return {
          records,
          totalRevenue: revenue,
          totalCosts: costs,
          profit: revenue - costs,
          margin: revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0,
        };
      }),

    analytics: ownerProcedure
      .query(async () => {
        const [profilesByState, monthlyGrowth] = await Promise.all([
          db.getProfilesByState(),
          db.getMonthlyGrowth(),
        ]);
        return { profilesByState, monthlyGrowth };
      }),
  }),

  // ─── STRIPE PAYMENTS ────────────────────────────────────────────────────────
  payments: router({
    createStudioBookingCheckout: protectedProcedure
      .input(z.object({
        studioId: z.number(),
        studioName: z.string(),
        hours: z.number().min(1).max(24),
        pricePerHour: z.number(),
        date: z.string(),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const totalAmount = Math.round(input.hours * input.pricePerHour * 100); // centavos
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'brl',
              product_data: {
                name: `Reserva: ${input.studioName}`,
                description: `${input.hours}h em ${input.date}`,
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            studio_id: input.studioId.toString(),
            hours: input.hours.toString(),
            date: input.date,
            type: 'studio_booking',
          },
          success_url: `${input.origin}/estudio/${input.studioId}?booking=success`,
          cancel_url: `${input.origin}/estudio/${input.studioId}?booking=cancelled`,
          allow_promotion_codes: true,
        });
        return { checkoutUrl: session.url };
      }),

    createAcademyCheckout: protectedProcedure
      .input(z.object({
        contentId: z.number(),
        contentTitle: z.string(),
        price: z.number(),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'brl',
              product_data: {
                name: `Academia: ${input.contentTitle}`,
                description: 'Conteúdo premium da Academia PNSP',
              },
              unit_amount: Math.round(input.price * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            content_id: input.contentId.toString(),
            type: 'academy_content',
          },
          success_url: `${input.origin}/academia/${input.contentId}?purchase=success`,
          cancel_url: `${input.origin}/academia?purchase=cancelled`,
          allow_promotion_codes: true,
        });
        return { checkoutUrl: session.url };
      }),

    createOfferingHighlightCheckout: protectedProcedure
      .input(z.object({
        offeringId: z.number(),
        offeringTitle: z.string(),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Destaque de Oferta Premium',
                description: `Destaque: ${input.offeringTitle} por 30 dias`,
              },
              unit_amount: 4990, // R$ 49,90
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            offering_id: input.offeringId.toString(),
            type: 'offering_highlight',
          },
          success_url: `${input.origin}/oferta/${input.offeringId}?highlight=success`,
          cancel_url: `${input.origin}/oferta/${input.offeringId}?highlight=cancelled`,
          allow_promotion_codes: true,
        });
        return { checkoutUrl: session.url };
      }),

    createSubscriptionCheckout: protectedProcedure
      .input(z.object({
        plan: z.enum(['basic', 'pro']),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const plans = {
          basic: { name: 'Assinatura PNSP Básica', price: 2990, desc: 'Visibilidade aumentada e perfil verificado' },
          pro: { name: 'Assinatura PNSP Pro', price: 7990, desc: 'Visibilidade máxima, destaque no mapa e analytics' },
        };
        const plan = plans[input.plan];
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'brl',
              product_data: { name: plan.name, description: plan.desc },
              unit_amount: plan.price,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          }],
          mode: 'subscription',
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            plan: input.plan,
            type: 'subscription',
          },
          success_url: `${input.origin}/dashboard?subscription=success`,
          cancel_url: `${input.origin}/planos?subscription=cancelled`,
          allow_promotion_codes: true,
        });
        return { checkoutUrl: session.url };
      }),
  }),

  // ─── USER DASHBOARDD ────────────────────────────────────────────────────────
  dashboard: router({
    summary: protectedProcedure
      .query(async ({ ctx }) => {
        const [profile, myOfferings, myOpportunities, myApplications, myBookings, notifications] = await Promise.all([
          db.getProfileByUserId(ctx.user.id),
          db.listOfferings({ userId: ctx.user.id }),
          db.listOpportunities({ userId: ctx.user.id }),
          db.getApplicationsByUser(ctx.user.id),
          db.getBookingsByUser(ctx.user.id),
          db.getUserNotifications(ctx.user.id),
        ]);
        return {
          profile,
          offeringsCount: myOfferings.length,
          opportunitiesCount: myOpportunities.length,
          applicationsCount: myApplications.length,
          bookingsCount: myBookings.length,
          unreadNotifications: notifications.filter(n => !n.isRead).length,
          recentOfferings: myOfferings.slice(0, 5),
          recentOpportunities: myOpportunities.slice(0, 5),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
