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
- CRUD completo em todos os módulos
- Auth: better-auth com email/senha
- Upload de imagens: Cloudflare R2
- Monitoramento: Sentry configurado
- CI/CD: GitHub Actions

## Design System
- COR PRIMÁRIA: #00C4A0 (turquesa — inédita no setor)
- FUNDO: #0A0A0A
- SURFACE: #111111
- TEXTO: #EDECEA / #6B6B6B
- FONTE DISPLAY: Syne 700/800
- FONTE BODY: Inter 400/500/600

## Problema Atual (resolver na próxima sessão)
- CSS quebrado no commit 72f690b — precisa restaurar com: git revert 72f690b --no-edit
- Após restaurar: o visual volta ao estado funcional (7/10)
- Próximo objetivo: elevar para 10/10 com redesign cirúrgico único

## Funcionalidades Implementadas
- ProfileStrength (força do perfil estilo LinkedIn)
- OpportunityFeed (feed de oportunidades em tempo real)
- Busca inteligente na Home
- Toast notifications
- Dashboard 2 colunas
- Badges All-Star/Verificado no perfil público
- Upload avatar + capa via R2
- Mapa Vivo Nacional

## Próximos Passos (por prioridade)
1. Restaurar CSS (git revert 72f690b)
2. Redesign 10/10 com paleta turquesa aplicada corretamente
3. Playwright E2E no CI
4. Stripe quando tiver usuários reais

## Instrução para Claude
Ao iniciar nova sessão: leia este arquivo primeiro.
Cor primária é SEMPRE #00C4A0. Nunca dourado/sépia.
Subcomponentes SEMPRE fora do export default.
Hooks SEMPRE no topo do componente.
