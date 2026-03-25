import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

// ─── ALLOWED ORIGINS ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  /\.manus\.computer$/,
  /\.manus\.space$/,
  /^https?:\/\/localhost:\d+$/,
  /^https?:\/\/127\.0\.0\.1:\d+$/,
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
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
          console.log("[Webhook] Test event detected");
          return res.json({ verified: true });
        }
        console.log(`[Webhook] ${event.type} | ${event.id}`);
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(
              `[Webhook] Payment completed for user ${session.metadata?.user_id}`
            );
            break;
          }
          case "payment_intent.succeeded":
            console.log("[Webhook] PaymentIntent succeeded");
            break;
        }
        res.json({ received: true });
      } catch (err: any) {
        console.error("[Webhook] Error:", err.message);
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
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Muitas tentativas de autenticação. Aguarde 15 minutos." },
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
  app.use("/api/oauth/", authLimiter);
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
      console.log(`[Maps Proxy] path=${mapPath} origin=${origin} url=${targetUrl.substring(0, 80)}`);
      const upstream = await fetch(targetUrl, {
        headers: origin ? { "Origin": origin } : {},
      });
      const contentType = upstream.headers.get("content-type") || "application/javascript";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      const body = await upstream.text();
      res.status(upstream.status).send(body);
    } catch (err: any) {
      console.error("[Maps Proxy] Error:", err.message);
      res.status(500).json({ error: "Maps proxy error" });
    }
  });

  // ── 6. Health check ───────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "pnsp-platform",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ── 6. Body parsers ───────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // ── 7. OAuth routes ───────────────────────────────────────────────────────
  registerOAuthRoutes(app);

  // ── 8. tRPC ───────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        if (error.code !== "NOT_FOUND" && error.code !== "UNAUTHORIZED") {
          console.error(`[tRPC] Error in ${path}:`, error.message);
        }
      },
    })
  );

  // ── 9. Frontend ───────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} busy, using ${port}`);
  }

  server.listen(port, () => {
    console.log(`[PNSP] Server running on http://localhost:${port}/`);
    console.log(`[PNSP] Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch(console.error);
