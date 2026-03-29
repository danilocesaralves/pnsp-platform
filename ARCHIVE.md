# PNSP — Arquivo de Contexto Estratégico

## Stack
React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui + tRPC + Drizzle ORM + PostgreSQL + better-auth

## Deploy
- Frontend: https://pnsp-platform.vercel.app
- Backend: https://pnsp-platform-production.up.railway.app
- Banco: Neon PostgreSQL
- Repo: https://github.com/danilocesaralves/pnsp-platform

## Status Atual
- 124 testes passando
- Visual: Tema "Noite de Samba" dourado — APROVADO
- Logo: logo-pnsp-crop.png, 64px no header, 80px no footer, sem fundo preto
- Avatares: DiceBear initials douradas (#D4A017)
- Deploy: Vercel (frontend) + Railway (backend) + Neon (banco)

## Design System
- COR PRIMÁRIA: #D4A017 (dourado — tema Noite de Samba aprovado)
- FUNDO: #0A0800
- SURFACE: #1a1200 (terra)
- TEXTO: var(--creme) / var(--creme-50)
- FONTE DISPLAY: Syne 700/800
- FONTE BODY: Inter 400/500/600

## Funcionalidades Implementadas e Funcionando
- ProfileStrength: 10 itens, gauge SVG, navega para /editar-perfil/:id
- OpportunityFeed: feed LIVE com filtros por categoria
- Dashboard 2 colunas: força do perfil + feed
- Perfil público: capa com gradiente por tipo, avatar 104px, badges
- Busca inteligente na Home
- Toast notifications
- Upload avatar + capa via Cloudflare R2
- Novos campos: cachê, duração, cidades, instrumentos, tipo de show
- Novo tipo de perfil: Venue / Casa de Show
- Migration aplicada no Neon PostgreSQL
- Auth: better-auth com email/senha
- Monitoramento: Sentry configurado
- CI/CD: GitHub Actions

## Sessão 2026-03-29 — M2: Contratos, Patrocinadores, Pagamentos

### Implementado (M2 completo):
- **Schema DB**: contract_templates, contracts, sponsors, sponsor_deliverables, payment_records — já estavam no banco Neon
- **Seed templates**: 3 templates HTML inseridos (Show, Produção Musical, Aula/Oficina)
- **Routers** (já existiam): contracts.router.ts, sponsors.router.ts, payrecords.router.ts — todos registrados em routers.ts
- **ContractFlow.tsx**: ContractStatusBadge, ContractCard, TemplateSelector, ContractPreview, SignatureModal, ContractDetail, ContractEditor — subcomponentes fora do export default
- **SponsorFlow.tsx**: SponsorStatusBadge, SponsorPipeline, DeliverableItem, SponsorCard, SponsorDetail, NewSponsorForm — fix import path `@/lib/trpc`
- **Página /contratos**: wizard list→template→editor→detail com lazy loading
- **Página /patrocinadores**: pipeline visual, filtros pills, CRUD inline
- **Página /pagamentos**: 3 KPIs (recebido/pendente/ticket médio), lista + form registrar
- **BookingFlow.tsx**: botão "📄 Gerar Contrato" dourado em BookingDetail quando status = "aceito" → gera contrato automaticamente e navega para /contratos
- **PublicLayout.tsx**: dropdown do usuário com links Contratos / Patrocinadores / Pagamentos
- **App.tsx**: rotas lazy /contratos, /patrocinadores, /pagamentos
- 124 testes passando

## Sessão 2026-03-28 — Auditoria + Dashboard Proprietário

### Implementado:
- Dashboard Proprietário do usuário (/dashboard) — completamente reescrito
  - 6 KPIs: views do perfil, avaliação média, ofertas, oportunidades, candidaturas, notificações
  - 5 tabs: Visão Geral | Operação | Reputação | Agenda (coming soon) | Marketing (coming soon)
  - Visão Geral: perfil card + ProfileStrength + quick actions + opportunity feed + candidaturas
  - Operação: minhas ofertas (com status/views), minhas oportunidades, candidaturas enviadas
  - Reputação: avg de avaliações + distribuição + indicadores de confiança + avaliações recentes
  - Agenda/Marketing: estrutura placeholder rica com coming soon
- dashboardRouter.summary expandido: review stats, avaliações recentes, receivedApplicationsCount, profileViewCount
- PublicLayout: botão "Dashboard" na navbar desktop quando autenticado; mobile nav completo com Dashboard + Conta + Sair
- OwnerDashboard: fix COLORS (var(--o500)/var(--g500) → var(--ouro)/var(--verde)) — gráficos não quebravam mais
- MEMORY.md: corrigido índice errado (dizia "turquesa" quando o design é dourado)

### Pendente (próximas sessões):
1. Página de edição de perfil com todos os novos campos funcionais (cachê, duração, cidades, instrumentos, showTypes)
2. Agenda/Calendário — módulo completo
3. Chat básico contextual entre usuários
4. Módulo de Patrocinadores
5. Marketing Inteligente Autônomo — estrutura base
6. Booking/negociação entre partes
7. Calculadora de cachê com índice por cidade
8. Meta tags dinâmicas e Open Graph por perfil
9. Sitemap
10. Notificações por email (SMTP)

## Instrução para Claude
Ao iniciar nova sessão: leia este arquivo primeiro.
Subcomponentes SEMPRE fora do export default.
Hooks SEMPRE no topo do componente.
