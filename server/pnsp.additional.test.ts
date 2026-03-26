/**
 * Additional unit tests — edge cases, input validation, new routes
 * These complement server/pnsp.test.ts without duplicating it.
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(role: "user" | "admin" | "owner" = "user"): TrpcContext {
  const user: NonNullable<TrpcContext["user"]> = {
    id: 42,
    openId: "extra-test-open-id",
    email: "extra@pnsp.com.br",
    name: "Extra Usuário",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

// ── profiles.getBySlug ───────────────────────────────────────────────────────
describe("profiles.getBySlug", () => {
  it("throws NOT_FOUND for a non-existent slug", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.profiles.getBySlug({ slug: "slug-nao-existe-xyz-999" }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("is accessible without authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // Should not throw UNAUTHORIZED — it will throw NOT_FOUND (no DB) or succeed
    try {
      await caller.profiles.getBySlug({ slug: "qualquer-slug" });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });
});

// ── profiles.create — input validation ───────────────────────────────────────
describe("profiles.create — input validation", () => {
  it("rejects displayName shorter than 2 chars", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.profiles.create({ profileType: "artista_solo", displayName: "A" }),
    ).rejects.toThrow();
  });

  it("rejects invalid profileType", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.profiles.create({
        profileType: "tipo_invalido" as "artista_solo",
        displayName: "Nome Válido",
      }),
    ).rejects.toThrow();
  });

  it("rejects unauthenticated create", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.profiles.create({ profileType: "artista_solo", displayName: "Nome" }),
    ).rejects.toThrow();
  });
});

// ── opportunities.create — input validation ──────────────────────────────────
describe("opportunities.create — input validation", () => {
  it("rejects unauthenticated create", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.opportunities.create({
        title: "Vaga para Sambista",
        category: "vaga_grupo",
      }),
    ).rejects.toThrow();
  });

  it("rejects title shorter than 3 chars", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.opportunities.create({ title: "Ab", category: "vaga_grupo" }),
    ).rejects.toThrow();
  });

  it("rejects invalid category", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.opportunities.create({
        title: "Título Válido",
        category: "categoria_invalida" as "vaga_grupo",
      }),
    ).rejects.toThrow();
  });
});

// ── opportunities.submitApplication — auth required ──────────────────────────
describe("opportunities.submitApplication", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.opportunities.submitApplication({ opportunityId: 1 }),
    ).rejects.toThrow();
  });
});

// ── payments — auth required ─────────────────────────────────────────────────
describe("payments — auth required", () => {
  it("createStudioBookingCheckout requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.payments.createStudioBookingCheckout({
        studioId: 1, studioName: "Studio", hours: 2, pricePerHour: 100, date: "2026-06-01", origin: "https://pnsp.com.br",
      }),
    ).rejects.toThrow();
  });

  it("createSubscriptionCheckout requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.payments.createSubscriptionCheckout({ plan: "basic", origin: "https://pnsp.com.br" }),
    ).rejects.toThrow();
  });

  it("createAcademyCheckout requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.payments.createAcademyCheckout({
        contentId: 1, contentTitle: "Aula", price: 49.9, origin: "https://pnsp.com.br",
      }),
    ).rejects.toThrow();
  });
});

// ── admin.createFinancialRecord — validation ─────────────────────────────────
describe("admin.createFinancialRecord", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.admin.createFinancialRecord({ type: "receita", category: "assinatura", amount: 100 }),
    ).rejects.toThrow();
  });

  it("validates type enum (receita | custo)", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      caller.admin.createFinancialRecord({
        type: "despesa" as "receita",
        category: "assinatura",
        amount: 100,
      }),
    ).rejects.toThrow();
  });
});

// ── offerings.create — auth and validation ───────────────────────────────────
describe("offerings.create — auth and validation", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.offerings.create({
        profileId: 1, title: "Aula de Cavaquinho", category: "aula", priceType: "fixo",
      }),
    ).rejects.toThrow();
  });

  it("rejects empty title", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.offerings.create({ profileId: 1, title: "", category: "aula", priceType: "fixo" }),
    ).rejects.toThrow();
  });

  it("rejects invalid category", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.offerings.create({
        profileId: 1,
        title: "Título",
        category: "categoria_invalida" as "aula",
        priceType: "fixo",
      }),
    ).rejects.toThrow();
  });
});

// ── notifications.markRead — auth required ───────────────────────────────────
describe("notifications.markRead", () => {
  it("requires authentication to mark as read", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.notifications.markRead({ id: 1 })).rejects.toThrow();
  });
});

// ── BLOCO A: delete / update guards ──────────────────────────────────────────
describe("profiles.delete", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.profiles.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("offerings.delete", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.offerings.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("offerings.update — full fields", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.offerings.update({ id: 1, title: "Novo Título" }),
    ).rejects.toThrow();
  });

  it("rejects title shorter than 3 chars", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.offerings.update({ id: 1, title: "Ab" }),
    ).rejects.toThrow();
  });
});

describe("opportunities.delete", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.opportunities.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("opportunities.update", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.opportunities.update({ id: 1, title: "Novo Título Válido" }),
    ).rejects.toThrow();
  });

  it("rejects title shorter than 3 chars", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.opportunities.update({ id: 1, title: "Ab" }),
    ).rejects.toThrow();
  });
});

describe("studios.create", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.studios.create({ name: "Estúdio Teste" }),
    ).rejects.toThrow();
  });

  it("rejects name shorter than 2 chars", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.studios.create({ name: "A" })).rejects.toThrow();
  });
});

describe("studios.update", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.studios.update({ id: 1, name: "Novo Nome" }),
    ).rejects.toThrow();
  });
});

describe("studios.delete", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.studios.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("academy.adminUpdate", () => {
  it("requires admin role (rejects regular user)", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.academy.adminUpdate({ id: 1, title: "Novo Título" }),
    ).rejects.toThrow();
  });

  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.academy.adminUpdate({ id: 1, title: "Novo Título" }),
    ).rejects.toThrow();
  });
});

describe("academy.adminDelete", () => {
  it("requires admin role (rejects regular user)", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.academy.adminDelete({ id: 1 })).rejects.toThrow();
  });

  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.academy.adminDelete({ id: 1 })).rejects.toThrow();
  });
});

// ── dashboard.summary — data shape ───────────────────────────────────────────
describe("dashboard.summary — data shape", () => {
  it("returns all required fields with correct types", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    const result = await caller.dashboard.summary();
    expect(typeof result.offeringsCount).toBe("number");
    expect(typeof result.opportunitiesCount).toBe("number");
    expect(typeof result.applicationsCount).toBe("number");
    expect(typeof result.bookingsCount).toBe("number");
    expect(typeof result.unreadNotifications).toBe("number");
    expect(Array.isArray(result.recentOfferings)).toBe(true);
    expect(Array.isArray(result.recentOpportunities)).toBe(true);
    expect(result.offeringsCount).toBeGreaterThanOrEqual(0);
    expect(result.unreadNotifications).toBeGreaterThanOrEqual(0);
  });
});
