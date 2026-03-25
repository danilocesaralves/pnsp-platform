# PNSP — Plataforma Nacional de Samba e Pagode

> Infraestrutura digital setorial para o ecossistema do samba e pagode brasileiro.

[![CI](https://github.com/danilocesaralves/pnsp-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/danilocesaralves/pnsp-platform/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-40%20passing-brightgreen)](#testes)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## O que é a PNSP

A PNSP conecta artistas, grupos, bandas, duplas, comunidades, rodas de samba, projetos culturais, compositores, músicos, produtores, professores, estúdios, lojas de instrumentos, luthiers, artesãos, contratantes, bares, casas de show, eventos, hotelaria, turismo e parceiros do ecossistema.

**Não é rede social genérica. Não é diretório simples. É infraestrutura digital setorial.**

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Node.js + Express 4 + tRPC 11 |
| Banco de Dados | MySQL (TiDB) + Drizzle ORM |
| Autenticação | Manus OAuth 2.0 (JWT + cookies seguros) |
| Pagamentos | Stripe (Checkout Sessions + Webhooks) |
| Mapas | Google Maps JavaScript API (proxy Manus) |
| Geração de Imagens | Manus Forge API (IA generativa) |
| Testes | Vitest (40 testes, 100% passando) |
| CI/CD | GitHub Actions |
| Deploy | Manus Hosting (PWA) / Docker (self-hosted) |

---

## Módulos da Fase 1

| Módulo | Status | Descrição |
|---|---|---|
| Autenticação OAuth | Produção | Login com Manus OAuth, roles user/admin/owner |
| Perfis e Vitrines | Produção | 10 tipos de perfil, portfólio, busca e filtros |
| Motor de Ofertas | Produção | Publicação e busca de serviços, shows, aulas |
| Motor de Oportunidades | Produção | Vagas, eventos, projetos, candidaturas |
| Mapa Vivo Nacional | Produção | Google Maps com marcadores interativos |
| Academia V1 | Produção | Biblioteca educacional com conteúdo premium |
| Hub de Estúdios V1 | Produção | Diretório com reservas via Stripe |
| Painel Admin | Produção | Moderação, aprovação, logs de auditoria |
| Dashboard Proprietário | Produção | KPIs executivos, gráficos, financeiro |
| Geração de Imagens IA | Produção | Criação de material visual por prompt |
| Pagamentos Stripe | Sandbox | Reservas, cursos, assinaturas premium |

---

## Setup em 5 Comandos

```bash
# 1. Clone
git clone https://github.com/danilocesaralves/pnsp-platform.git
cd pnsp-platform

# 2. Instale dependências
pnpm install

# 3. Configure variáveis de ambiente
cp ENVIRONMENT.md .env
# Edite .env com suas credenciais

# 4. Aplique o schema do banco
pnpm drizzle-kit generate && pnpm drizzle-kit migrate

# 5. Inicie em desenvolvimento
pnpm dev
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | MySQL/TiDB connection string |
| `JWT_SECRET` | Sim | Mínimo 32 caracteres |
| `VITE_APP_ID` | Sim | Manus OAuth App ID |
| `OAUTH_SERVER_URL` | Sim | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Sim | `https://auth.manus.im` |
| `OWNER_OPEN_ID` | Sim | OpenID do proprietário |
| `OWNER_NAME` | Sim | Nome do proprietário |
| `BUILT_IN_FORGE_API_URL` | Sim | Manus Forge API URL |
| `BUILT_IN_FORGE_API_KEY` | Sim | Manus Forge API Key (server) |
| `VITE_FRONTEND_FORGE_API_KEY` | Sim | Manus Forge API Key (client) |
| `VITE_FRONTEND_FORGE_API_URL` | Sim | Manus Forge API URL (client) |
| `STRIPE_SECRET_KEY` | Pagamentos | `sk_live_...` ou `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Pagamentos | `whsec_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Pagamentos | `pk_live_...` ou `pk_test_...` |

---

## Estrutura do Projeto

```
pnsp-platform/
├── client/                     # Frontend React (lazy-loaded, code splitting)
│   └── src/
│       ├── pages/              # 25 páginas
│       │   ├── admin/          # Painel Admin (5 páginas)
│       │   └── owner/          # Dashboard Proprietário
│       ├── components/         # Componentes reutilizáveis
│       │   ├── PublicLayout.tsx # Navbar + Footer premium
│       │   └── PNSPLogo.tsx    # Componente Logo com variantes
│       ├── lib/
│       │   └── pnsp-constants.ts # Constantes da plataforma
│       └── index.css           # Design system (g*/o*/n* palette)
├── server/                     # Backend Express + tRPC
│   ├── routers.ts              # 12 routers tRPC
│   ├── db.ts                   # Query helpers (Drizzle)
│   ├── stripe-products.ts      # Produtos e preços Stripe
│   ├── pnsp.test.ts            # 40 testes Vitest
│   └── _core/
│       └── index.ts            # Helmet, CORS, rate limiting, health check
├── drizzle/
│   └── schema.ts               # 16 tabelas
├── shared/
│   └── pnsp.ts                 # Constantes compartilhadas
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions CI/CD
├── Dockerfile                  # Multi-stage build
└── ENVIRONMENT.md              # Documentação de variáveis
```

---

## Banco de Dados (16 Tabelas)

| Tabela | Descrição |
|---|---|
| `users` | Usuários autenticados (role: user/admin/owner) |
| `profiles` | Vitrines públicas dos profissionais |
| `portfolio_items` | Portfólio de mídia dos perfis |
| `offerings` | Motor de Ofertas |
| `opportunities` | Motor de Oportunidades |
| `applications` | Candidaturas a oportunidades |
| `studios` | Hub de Estúdios |
| `studio_bookings` | Reservas de estúdios (Stripe) |
| `academy_content` | Conteúdo da Academia |
| `academy_purchases` | Compras de conteúdo premium (Stripe) |
| `generated_images` | Imagens geradas por IA |
| `financial_records` | Registros financeiros |
| `admin_logs` | Logs de auditoria |
| `notifications` | Notificações do sistema |
| `stripe_events` | Eventos do webhook Stripe |

---

## Segurança

- **Helmet.js** — Headers HTTP de segurança (CSP, HSTS, X-Frame-Options)
- **CORS explícito** — Apenas origens `*.manus.space` e `*.manus.computer`
- **Rate limiting** — 500 req/15min global, 30 req/15min auth, 20 req/h imagens
- **RBAC** — Roles: `user`, `admin`, `owner` com procedures separadas
- **Stripe Webhooks** — Verificação de assinatura obrigatória
- **JWT** — Sessões assinadas com secret configurável, HttpOnly, SameSite

---

## Health Check

```bash
GET /api/health
# Response:
# {
#   "status": "ok",
#   "db": "ok",
#   "service": "pnsp-platform",
#   "version": "1.0.0",
#   "uptime": 123,
#   "timestamp": "2026-03-25T18:00:00.000Z"
# }
```

---

## Testes

```bash
pnpm test
# ✓ server/auth.logout.test.ts (1 test)
# ✓ server/pnsp.test.ts (39 tests)
# Tests: 40 passed (40)
```

---

## Deploy com Docker

```bash
# Build
docker build -t pnsp-platform .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  pnsp-platform
```

O Dockerfile usa **multi-stage build** com usuário não-root e healthcheck integrado.

---

## Dados Demo

| Entidade | Quantidade |
|---|---|
| Perfis | 50 (artistas, grupos, produtores, professores, luthiers...) |
| Estúdios | 12 (em 8 estados brasileiros) |
| Ofertas | 30 (shows, aulas, produção, instrumentos) |
| Oportunidades | 20 (vagas, eventos, projetos, parcerias) |
| Conteúdos Academia | 15 (artigos e tutoriais) |

---

## Roadmap — Fase 2

- [ ] Notificações por email (Resend)
- [ ] Chat em tempo real (Socket.io)
- [ ] Sistema de avaliações e reviews
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] App nativo (React Native)
- [ ] Pagamentos split e escrow
- [ ] Antifraude avançado
- [ ] BI enterprise

---

**Fundador:** Danilo — Estrategista e fundador da PNSP  
**Licença:** MIT © 2026 PNSP
