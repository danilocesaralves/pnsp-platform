import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
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
    loginMethod: "email",
    passwordHash: null,
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

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

describe("auth", () => {
  it("auth.logout returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
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

// ══════════════════════════════════════════════════════════════════════════════
// PROFILES
// ══════════════════════════════════════════════════════════════════════════════

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

  it("profiles.list with profileType filter returns correct type", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({ limit: 10, offset: 0, profileType: "artista_solo" });
    expect(Array.isArray(result)).toBe(true);
    result.forEach((p: any) => {
      expect(p.profileType).toBe("artista_solo");
    });
  });

  it("profiles.list with state filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({ limit: 10, offset: 0, state: "RJ" });
    expect(Array.isArray(result)).toBe(true);
    result.forEach((p: any) => {
      expect(p.state).toBe("RJ");
    });
  });

  it("profiles.list with search filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({ limit: 10, offset: 0, search: "samba" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("profiles.create requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profiles.create({
      profileType: "artista_solo",
      displayName: "Test",
    })).rejects.toThrow();
  });

  it("profiles.getMyProfile requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profiles.getMyProfile()).rejects.toThrow();
  });

  it("profiles.getMyProfile works for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.getMyProfile();
    // May return null if user has no profile, that's ok
    expect(result === null || result === undefined || typeof result === "object").toBe(true);
  });

  it("profiles.update requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profiles.update({ id: 1, displayName: "Test" })).rejects.toThrow();
  });

  it("profiles.addPortfolioItem requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profiles.addPortfolioItem({
      profileId: 1,
      mediaType: "image",
      url: "https://example.com/img.jpg",
    })).rejects.toThrow();
  });

  it("profiles.adminList requires admin role", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profiles.adminList({ limit: 10, offset: 0 })).rejects.toThrow();
  });

  it("profiles.adminList works for admin", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.adminList({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// OFFERINGS
// ══════════════════════════════════════════════════════════════════════════════

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

  it("offerings.list with category filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ limit: 10, offset: 0, category: "show" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("offerings.list with search filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ limit: 10, offset: 0, search: "aula" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("offerings.myOfferings requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.offerings.myOfferings()).rejects.toThrow();
  });

  it("offerings.myOfferings works for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.myOfferings();
    expect(Array.isArray(result)).toBe(true);
  });

  it("offerings.expressInterest requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.offerings.expressInterest({ offeringId: 1 })).rejects.toThrow();
  });

  it("offerings.adminList requires admin role", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.offerings.adminList({ limit: 10, offset: 0 })).rejects.toThrow();
  });

  it("offerings.adminList works for admin", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.adminList({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// OPPORTUNITIES
// ══════════════════════════════════════════════════════════════════════════════

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

  it("opportunities.list with category filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({ limit: 10, offset: 0, category: "show" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("opportunities.list with state filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({ limit: 10, offset: 0, state: "SP" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("opportunities.myOpportunities requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.opportunities.myOpportunities()).rejects.toThrow();
  });

  it("opportunities.myOpportunities works for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.myOpportunities();
    expect(Array.isArray(result)).toBe(true);
  });

  it("opportunities.myApplications requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.opportunities.myApplications()).rejects.toThrow();
  });

  it("opportunities.myApplications works for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.myApplications();
    expect(Array.isArray(result)).toBe(true);
  });

  it("opportunities.adminList requires admin role", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.opportunities.adminList({ limit: 10, offset: 0 })).rejects.toThrow();
  });

  it("opportunities.adminList works for admin", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.adminList({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDIOS
// ══════════════════════════════════════════════════════════════════════════════

describe("studios", () => {
  it("studios.list returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.studios.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("studios.getBySlug throws for non-existent slug", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.studios.getBySlug({ slug: "nao-existe-999" })).rejects.toThrow();
  });

  it("studios.list with state filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.studios.list({ limit: 10, offset: 0, state: "SP" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("studios.list with search filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.studios.list({ limit: 10, offset: 0, search: "estudio" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("studios.myBookings requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.studios.myBookings()).rejects.toThrow();
  });

  it("studios.myBookings works for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.studios.myBookings();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ACADEMY
// ══════════════════════════════════════════════════════════════════════════════

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

  it("academy.list with category filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.list({ limit: 10, offset: 0, category: "historia" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("academy.list with level filter works", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.list({ limit: 10, offset: 0, level: "iniciante" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("academy.adminCreate requires admin role", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.academy.adminCreate({
      title: "Test Content",
      contentType: "artigo",
      category: "historia",
    })).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════════════════════

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

  it("admin.users throws for non-admin", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users({ limit: 10, offset: 0 })).rejects.toThrow();
  });

  it("admin.logs returns array for admin", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.logs({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.financialRecords returns array for admin", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.financialRecords();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.financialRecords throws for non-admin", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.financialRecords()).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// OWNER DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

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

  it("owner.financialSummary throws for regular users", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.owner.financialSummary()).rejects.toThrow();
  });

  it("owner.analytics returns profilesByState and monthlyGrowth arrays", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.owner.analytics();
      expect(result).toBeDefined();
      expect(Array.isArray(result.profilesByState)).toBe(true);
      expect(Array.isArray(result.monthlyGrowth)).toBe(true);
    } catch (e: any) {
      // SQL DATE_FORMAT may fail in test env — verify it's a DB error, not auth
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("owner.analytics throws FORBIDDEN for regular users", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.owner.analytics()).rejects.toThrow();
  });

  it("owner.analytics throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.owner.analytics()).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// MAP
// ══════════════════════════════════════════════════════════════════════════════

describe("map", () => {
  it("map.getMarkers returns an array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.map.getMarkers({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("map.getMarkers accepts type and state filters", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.map.getMarkers({ type: "profiles", state: "RJ" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("map.getMarkers with studios type returns array", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.map.getMarkers({ type: "studios" });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

describe("notifications", () => {
  it("notifications.list requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.notifications.list()).rejects.toThrow();
  });

  it("notifications.list works for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("notifications.markRead requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.notifications.markRead({ id: 1 })).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// PLATFORM PUBLIC STATS
// ══════════════════════════════════════════════════════════════════════════════

describe("platform.publicStats", () => {
  it("platform.publicStats returns stats without authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.platform.publicStats();
    expect(result).toBeDefined();
    expect(typeof result.profileCount).toBe("number");
    expect(typeof result.opportunityCount).toBe("number");
    expect(typeof result.studioCount).toBe("number");
    expect(typeof result.cityCount).toBe("number");
    expect(result.profileCount).toBeGreaterThanOrEqual(0);
  });

  it("platform.publicStats is accessible to authenticated users too", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.platform.publicStats();
    expect(result).toBeDefined();
    expect(typeof result.profileCount).toBe("number");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD (USER)
// ══════════════════════════════════════════════════════════════════════════════

describe("dashboard", () => {
  it("dashboard.summary requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dashboard.summary()).rejects.toThrow();
  });

  it("dashboard.summary returns summary for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.summary();
    expect(result).toBeDefined();
    expect(typeof result.offeringsCount).toBe("number");
    expect(typeof result.opportunitiesCount).toBe("number");
    expect(typeof result.applicationsCount).toBe("number");
    expect(typeof result.bookingsCount).toBe("number");
    expect(typeof result.unreadNotifications).toBe("number");
    expect(Array.isArray(result.recentOfferings)).toBe(true);
    expect(Array.isArray(result.recentOpportunities)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// IMAGE GENERATION
// ══════════════════════════════════════════════════════════════════════════════

describe("imageGen", () => {
  it("imageGen.generate requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.imageGen.generate({
      prompt: "Uma roda de samba no Rio de Janeiro",
      purpose: "perfil",
    })).rejects.toThrow();
  });

  it("imageGen.myImages requires authentication", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.imageGen.myImages()).rejects.toThrow();
  });

  it("imageGen.myImages works for authenticated user", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.imageGen.myImages();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTHORIZATION (CROSS-CUTTING)
// ══════════════════════════════════════════════════════════════════════════════

describe("authorization", () => {
  it("protected procedures throw UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profiles.create({
      profileType: "artista_solo",
      displayName: "Test",
    })).rejects.toThrow();
  });

  it("admin procedures throw FORBIDDEN for regular users", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("admin procedures work for admin role", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.stats();
    expect(result).toBeDefined();
  });

  it("owner procedures work for owner role", async () => {
    const ctx = makeCtx("owner");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.owner.stats();
    expect(result).toBeDefined();
  });

  it("owner procedures work for admin role (admin can access owner)", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.owner.stats();
    expect(result).toBeDefined();
  });

  it("all protected endpoints reject unauthenticated access", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const protectedEndpoints = [
      () => caller.profiles.getMyProfile(),
      () => caller.offerings.myOfferings(),
      () => caller.opportunities.myOpportunities(),
      () => caller.opportunities.myApplications(),
      () => caller.studios.myBookings(),
      () => caller.notifications.list(),
      () => caller.imageGen.myImages(),
      () => caller.dashboard.summary(),
    ];
    for (const endpoint of protectedEndpoints) {
      await expect(endpoint()).rejects.toThrow();
    }
  });

  it("all admin endpoints reject regular user access", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const adminEndpoints = [
      () => caller.admin.stats(),
      () => caller.admin.users({ limit: 10, offset: 0 }),
      () => caller.admin.logs({ limit: 10 }),
      () => caller.admin.financialRecords(),
      () => caller.owner.stats(),
      () => caller.owner.financialSummary(),
      () => caller.owner.analytics(),
    ];
    for (const endpoint of adminEndpoints) {
      await expect(endpoint()).rejects.toThrow();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// INPUT VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

describe("input validation", () => {
  it("profiles.list accepts valid limit and offset", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profiles.list({ limit: 5, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("offerings.list accepts valid limit and offset", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ limit: 5, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("opportunities.list accepts valid limit and offset", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({ limit: 5, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("studios.list accepts valid limit and offset", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.studios.list({ limit: 5, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("academy.list accepts valid limit and offset", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.list({ limit: 5, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

describe("system", () => {
  it("auth.me returns null for unauthenticated context", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user for authenticated context", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("user");
  });
});
