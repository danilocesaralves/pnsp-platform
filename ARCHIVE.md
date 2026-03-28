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

## Próximas Melhorias (próxima sessão)
1. Página de edição de perfil com todos os novos campos funcionais
2. Calculadora de cachê com índice de mercado por cidade
3. Página de Venue completa
4. Animações de scroll e parallax na Home
5. Mobile 100% otimizado
6. Instagram: link funcional no perfil público
7. Telefone: link funcional (WhatsApp) no perfil público

## Instrução para Claude
Ao iniciar nova sessão: leia este arquivo primeiro.
Subcomponentes SEMPRE fora do export default.
Hooks SEMPRE no topo do componente.
