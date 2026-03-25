import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ── Helpers ──────────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(role: "user" | "admin" | "owner" = "user"): TrpcContext {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-open-id",
    email: "test@pnsp.com.br",
    name: "Usuário Teste",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ── Auth Tests ────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const ctx = makeCtx();
    const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
    (ctx.res as any).clearCookie = (name: string, options: Record<string, unknown>) => {
      clearedCookies.push({ name, options });
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      httpOnly: true,
      path: "/",
    });
  });

  it("returns authenticated user from auth.me", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).not.toBeNull();
    expect(me?.role).toBe("admin");
    expect(me?.email).toBe("test@pnsp.com.br");
  });

  it("returns null for unauthenticated user from auth.me", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });
});

// ── Profiles Tests ────────────────────────────────────────────────────────────

describe("profiles", () => {
  it("profiles.list returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("profiles.listFeatured returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.listFeatured({ limit: 6 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("profiles.getById returns null for non-existent id", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.getById({ id: 999999 });
    expect(result).toBeNull();
  });

  it("profiles.list respects limit parameter", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({ limit: 3, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(3);
  });
});

// ── Offerings Tests ───────────────────────────────────────────────────────────

describe("offerings", () => {
  it("offerings.list returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("offerings.listRecent returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.listRecent({ limit: 4 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(4);
  });

  it("offerings.getById returns null for non-existent id", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.getById({ id: 999999 });
    expect(result).toBeNull();
  });
});

// ── Opportunities Tests ───────────────────────────────────────────────────────

describe("opportunities", () => {
  it("opportunities.list returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("opportunities.getById returns null for non-existent id", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.getById({ id: 999999 });
    expect(result).toBeNull();
  });
});

// ── Studios Tests ─────────────────────────────────────────────────────────────

describe("studios", () => {
  it("studios.list returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.studios.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("studios.getBySlug returns null for non-existent slug", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.studios.getBySlug({ slug: "nao-existe-999" })).rejects.toThrow();
  });
});

// ── Academy Tests ─────────────────────────────────────────────────────────────

describe("academy", () => {
  it("academy.list returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("academy.getBySlug throws for non-existent slug", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.academy.getBySlug({ slug: "nao-existe-999" })).rejects.toThrow();
  });
});

// ── Admin Tests ───────────────────────────────────────────────────────────────

describe("admin", () => {
  it("admin.stats returns platform statistics", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.admin.stats();
    expect(stats).toBeDefined();
    expect(typeof stats.userCount).toBe("number");
    expect(typeof stats.profileCount).toBe("number");
    expect(typeof stats.offeringCount).toBe("number");
    expect(typeof stats.opportunityCount).toBe("number");
    expect(typeof stats.studioCount).toBe("number");
    expect(typeof stats.academyCount).toBe("number");
  });

  it("admin.stats throws FORBIDDEN for non-admin users", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("admin.users returns array for admin", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.users({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Owner Tests ───────────────────────────────────────────────────────────────

describe("owner", () => {
  it("owner.stats returns platform statistics for admin/owner", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.owner.stats();
    expect(stats).toBeDefined();
    expect(typeof stats.userCount).toBe("number");
    expect(typeof stats.profileCount).toBe("number");
  });

  it("owner.financialSummary returns financial data for admin/owner", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const financial = await caller.owner.financialSummary();
    expect(financial).toBeDefined();
    expect(typeof financial.totalRevenue).toBe("number");
    expect(typeof financial.totalCosts).toBe("number");
    expect(typeof financial.profit).toBe("number");
    expect(typeof financial.margin).toBe("number");
    expect(Array.isArray(financial.records)).toBe(true);
  });

  it("owner.stats throws FORBIDDEN for regular users", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.owner.stats()).rejects.toThrow();
  });
});

// ── Map Tests ─────────────────────────────────────────────────────────────────

describe("map", () => {
  it("map.getMarkers returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.map.getMarkers({});
    expect(Array.isArray(result)).toBe(true);
  });
});
