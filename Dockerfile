# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies (including devDeps for build)
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build frontend + backend
RUN pnpm build

# ─── Stage 3: Production runner ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 pnsp && \
    adduser --system --uid 1001 pnsp

# Copy built artifacts
COPY --from=builder --chown=pnsp:pnsp /app/dist ./dist
COPY --from=builder --chown=pnsp:pnsp /app/node_modules ./node_modules
COPY --from=builder --chown=pnsp:pnsp /app/package.json ./package.json

USER pnsp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
