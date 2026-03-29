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
- Logo: logo-pnsp-crop.png em todos os pontos de contato ✅
- Avatares: DiceBear initials douradas (#D4A017)
- Deploy: Vercel (frontend) + Railway (backend) + Neon PostgreSQL

## Design System
- COR PRIMÁRIA: #D4A017 (dourado — tema Noite de Samba aprovado)
- FUNDO: #0A0800
- SURFACE: #1a1200 (terra)
- TEXTO: var(--creme) / var(--creme-50)
- FONTE DISPLAY: Syne 700/800
- FONTE BODY: Inter 400/500/600

## Funcionalidades Implementadas

### M0 — Base
- Auth: better-auth com email/senha
- Perfis: CRUD completo, tipos (artista, grupo, produtor, estúdio, venue…), slug público
- Design system: Noite de Samba, CSS vars, componentes shadcn/ui customizados
- Busca inteligente na Home com filtros por tipo e cidade
- Perfil público: capa com gradiente por tipo, avatar 104px, badges, ReviewSection
- ProfileStrength: 10 itens, gauge SVG, navega para /editar-perfil/:id
- OpportunityFeed: feed LIVE com filtros por categoria
- Upload avatar + capa via Cloudflare R2
- Campos estendidos: cachê, duração, cidades, instrumentos, tipo de show
- Monitoramento: Sentry configurado
- CI/CD: GitHub Actions
- Home.tsx: header fixo próprio com logo + hero + seções + footer

### M1 — Operação
- Chat: mensagens em tempo real entre usuários autenticados
- Booking/negociação: proposta → aceite → contrato, BookingCard, BookingDetail
- Notificações: dropdown em tempo real, badge de contagem
- Dashboard Proprietário (/dashboard): 6 KPIs, 5 tabs (Visão Geral, Operação, Reputação, Agenda, Marketing)
- AgendaTab: estrutura com coming soon

### M2 — Financeiro
- Contratos: templates HTML (Show, Produção, Aula), wizard list→template→editor→detail, assinatura digital
- Patrocinadores: pipeline visual (prospecto→fechado), CRUD inline, deliverables
- Pagamentos: 3 KPIs (recebido/pendente/ticket médio), registro manual, confirmação
- BookingFlow: botão "📄 Gerar Contrato" quando booking aceito → gera e navega para /contratos

### M3 — Crescimento
- Marketing Inteligente IA: ScoreGauge SVG, insights por prioridade, gerador de conteúdo, campanhas
- Comunidade: feed de posts com likes toggle, comentários inline, filtros por tipo
- Academia: tab "Cursos" (enroll + progresso) + tab "Artigos & Vídeos"; 3 cursos demo no Neon
- Memórias: linha do tempo vertical por tipo, CRUD, público/privado, visível no perfil público
- Routers M3: marketing, community, memories + academy extendido (getCourses, enroll…)
- Fix crítico: await getDb() em 28 ocorrências nos routers M3

## Próximos Passos Prioritários
1. ANTHROPIC_API_KEY no Railway — ativa gerador de conteúdo IA real
2. Mapa Vivo — página existe no nav mas está vazia
3. SEO — meta tags dinâmicas por perfil para Google indexar
4. Mobile — otimização completa
5. Integração de pagamentos real (módulo já estruturado)
6. Playwright E2E no CI

## Sessão 2026-03-29 — M3: Marketing IA, Comunidade, Academia, Memórias

### Implementado (M3 completo):
- **Schema DB**: marketingCampaigns, marketingContents, marketingScores, marketingInsights, communityPosts, communityComments, communityLikes, academyCourses, academyLessons, academyEnrollments, memories — migration aplicada no Neon
- **marketing.router.ts**: getMyCampaigns, createCampaign, updateCampaign, getMyContents, generateContent (estático + isAiGenerated), updateContent, getMyScores, getMyInsights, dismissInsight, seedInsights
- **community.router.ts**: getPosts, createPost, deletePost, getComments, addComment, likePost (toggle), getMyLikes
- **academy.router.ts extendido**: getCourses, getCourseById, enroll, getMyEnrollments, updateProgress, seedCourses (3 cursos demo)
- **memories.router.ts**: getPublicMemories, getMyMemories, create, update, delete
- **routers.ts**: marketing, community, memories registrados
- **MarketingDashboard.tsx**: ScoreGauge SVG, InsightCard com prioridade, CampaignCard, ContentCard com badge IA, ContentGenerator, Termômetro, MarketingDashboard
- **CommunityFeed.tsx**: PostTypeBadge, CommentItem, PostCard (likes+comentários), NewPostForm, CommunityFeed com filtros
- **AcademyView.tsx**: CategoryBadge, LevelBadge, LessonItem, CourseCard, CourseDetail (enroll+progresso), AcademyView com filtros
- **MemoryTimeline.tsx**: MemoryTypeBadge, MemoryCard, NewMemoryForm, MemoryTimeline com linha do tempo vertical
- **Marketing.tsx**: página /marketing com guard de auth
- **Community.tsx**: página /comunidade pública com composer para autenticados
- **Memories.tsx**: página /memorias com guard de auth
- **Academy.tsx atualizado**: tab "Cursos" (AcademyView) + tab "Artigos & Vídeos" (conteúdo existente)
- **App.tsx**: rotas lazy /marketing, /comunidade, /memorias
- **Dashboard.tsx**: tab Marketing → MarketingDashboard; Visão Geral → seção Comunidade (CommunityFeed)
- **ProfileBySlug.tsx**: MemoryTimeline após ReviewSection (público vê memórias públicas, dono vê tudo)
- **PublicLayout.tsx**: "Comunidade" no nav principal; "Marketing IA" + "Memórias" no dropdown do usuário

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

## Instrução para Claude
Ao iniciar nova sessão: leia este arquivo primeiro.
Subcomponentes SEMPRE fora do export default.
Hooks SEMPRE no topo do componente.
