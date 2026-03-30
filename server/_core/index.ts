import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { serverLogger, stripeLogger, mapsLogger, trpcLogger } from "../lib/logger";

// ENV is validated via Zod in server/_core/env.ts (imported transitively)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

// ─── ALLOWED ORIGINS ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS: Array<RegExp | string> = [
  /\.manus\.computer$/,
  /\.manus\.space$/,
  /^https?:\/\/localhost:\d+$/,
  /^https?:\/\/127\.0\.0\.1:\d+$/,
  // Additional origins from CORS_ORIGIN env var (comma-separated)
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.some((pattern) =>
    typeof pattern === "string" ? pattern === origin : pattern.test(origin)
  );
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust the Manus gateway proxy (required for rate limiting + X-Forwarded-For)
  app.set("trust proxy", 1);

  // ── 1. Stripe webhook — MUST be before express.json() ─────────────────────
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      try {
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig as string,
          webhookSecret as string
        );
        if (event.id.startsWith("evt_test_")) {
          stripeLogger.info("Test event detected");
          return res.json({ verified: true });
        }
        stripeLogger.info({ type: event.type, id: event.id }, "Webhook event received");
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            stripeLogger.info({ userId: session.metadata?.user_id }, "Payment completed");
            break;
          }
          case "payment_intent.succeeded":
            stripeLogger.info("PaymentIntent succeeded");
            break;
        }
        res.json({ received: true });
      } catch (err: any) {
        stripeLogger.error({ err: err.message }, "Webhook error");
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
  );

  // ── 2. Security headers (Helmet) ──────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
          workerSrc: ["blob:", "https://maps.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
          connectSrc: ["'self'", "https:", "wss:", "https://maps.googleapis.com", "https://maps.gstatic.com"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── 3. CORS ────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );

  // ── 4. Rate limiting ──────────────────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
    skip: (req) => req.path.startsWith("/api/trpc/auth."),
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Muitas tentativas de autenticação. Aguarde 15 minutos." },
  });

  const publicLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Muitas requisições. Tente novamente em alguns segundos." },
    skip: (req) => !!req.headers.cookie,
  });

  const imageGenLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Limite de geração de imagens atingido. Tente em 1 hora." },
  });

  app.use("/api/", globalLimiter);
  app.use("/api/auth/", authLimiter);
  app.use("/api/trpc/", publicLimiter);
  app.use("/api/trpc/imageGen.", imageGenLimiter);

  // ── 5. Maps proxy (forward Google Maps JS with frontend key + Origin) ────────
  app.get("/api/maps-proxy/*", async (req, res) => {
    try {
      const forgeUrl = process.env.BUILT_IN_FORGE_API_URL || "https://forge.manus.ai";
      // Frontend key is required for maps/api/js (browser-scoped endpoint)
      const frontendKey = process.env.VITE_FRONTEND_FORGE_API_KEY || process.env.BUILT_IN_FORGE_API_KEY || "";
      const mapPath = (req.params as any)[0];
      const queryParams = new URLSearchParams(req.query as Record<string, string>);
      queryParams.set("key", frontendKey);
      const targetUrl = `${forgeUrl}/v1/maps/proxy/${mapPath}?${queryParams.toString()}`;
      // Determine origin: browser sends Origin for cross-origin requests, but NOT for same-origin script tags.
      // Fall back to constructing origin from the Host header.
      const rawOrigin = req.headers.origin || req.headers.referer;
      let origin = rawOrigin ? rawOrigin.replace(/\/$/, "") : "";
      if (!origin && req.headers.host) {
        const proto = req.headers["x-forwarded-proto"] || "https";
        origin = `${proto}://${req.headers.host}`;
      }
      mapsLogger.debug({ path: mapPath, origin }, "Maps proxy request");
      const upstream = await fetch(targetUrl, {
        headers: origin ? { "Origin": origin } : {},
      });
      const contentType = upstream.headers.get("content-type") || "application/javascript";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      const body = await upstream.text();
      res.status(upstream.status).send(body);
    } catch (err: any) {
      mapsLogger.error({ err: err.message }, "Maps proxy error");
      res.status(500).json({ error: "Maps proxy error" });
    }
  });

  // ── 6. Health check ───────────────────────────────────────────────────────
  app.get("/api/health", async (_req, res) => {
    let dbStatus = "ok";
    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) dbStatus = "unavailable";
    } catch {
      dbStatus = "error";
    }
    const httpStatus = dbStatus === "ok" ? 200 : 503;
    res.status(httpStatus).json({
      status: dbStatus === "ok" ? "ok" : "degraded",
      db: dbStatus,
      service: "pnsp-platform",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    });
  });

  // ── 6. Body parsers ───────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // ── 7. Better-auth routes ────────────────────────────────────────────────
  app.all("/api/auth/*", toNodeHandler(auth));

  // ── 8. Custom routes (sitemap, OG meta) ──────────────────────────────────
  const { registerSitemapRoute } = await import("../routes/sitemap");
  const { registerOgMetaRoute } = await import("../routes/og-meta");
  registerSitemapRoute(app);
  registerOgMetaRoute(app);

  // ── 9. tRPC ───────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        if (error.code !== "NOT_FOUND" && error.code !== "UNAUTHORIZED") {
          trpcLogger.error({ path, code: error.code }, error.message);
        }
      },
    })
  );

  // ── 10. Frontend ─────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    serverLogger.warn({ preferredPort, port }, "Port busy, using alternative");
  }

  server.listen(port, () => {
    serverLogger.info({ port, env: process.env.NODE_ENV || "development" }, `Server running on http://localhost:${port}/`);
    setupGracefulShutdown(server);
  });
}


// ─── GRACEFUL SHUTDOWN ───────────────────────────────────────────────────────
function setupGracefulShutdown(httpServer: import("http").Server) {
  const shutdown = (signal: string) => {
    serverLogger.info({ signal }, "Shutting down gracefully...");
    httpServer.close(() => {
      serverLogger.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      serverLogger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch(console.error);
