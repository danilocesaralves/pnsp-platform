# PNSP — Plataforma Nacional de Samba e Pagode
## TODO — Fase 1

### FASE 1 — INFRAESTRUTURA BASE
- [x] Upload logo CDN
- [x] Schema completo do banco de dados (16 tabelas)
- [x] Migrations aplicadas
- [x] Design system e CSS global (cores, tipografia, tokens PNSP)
- [x] Layout base com navegação principal (PublicLayout responsivo)
- [x] PWA manifest configurado

### AUTENTICAÇÃO E CONTAS
- [x] Login/Registro com Manus OAuth
- [x] Sessões e proteção de rotas
- [x] Perfil do usuário (edição)
- [x] Tipos de conta (artista, grupo, estúdio, etc.)
- [x] Role-based access (user, admin, owner)

### PERFIS E VITRINES PÚBLICAS
- [x] Criação de perfil unificado
- [x] Edição de perfil (bio, foto, vídeos, áudio, localização, redes sociais)
- [x] Vitrine pública por id
- [x] Portfólio (galeria de mídia)
- [x] Verificação básica de perfil
- [x] Listagem/busca de perfis com filtros

### MOTOR DE OFERTAS
- [x] Criação de oferta (serviço, produto, aula, etc.)
- [x] Publicação e moderação de ofertas
- [x] Busca e filtros avançados de ofertas
- [x] Página de detalhe da oferta
- [x] Gestão de ofertas pelo usuário
- [x] Interesse/contato em oferta

### MOTOR DE OPORTUNIDADES
- [x] Criação de oportunidade (vaga, evento, projeto)
- [x] Publicação e moderação de oportunidades
- [x] Candidatura a oportunidades
- [x] Gestão de candidaturas
- [x] Busca e filtros de oportunidades

### MAPA VIVO NACIONAL
- [x] Integração Google Maps (proxy Manus)
- [x] Proxy server-side corrigido (Origin header + callback-based loading)
- [x] Visualização de perfis por localização
- [x] Filtros no mapa (tipo, estado)
- [x] Detalhes ao clicar no marcador
- [x] Link para vitrine pública

### ACADEMIA V1
- [x] Estrutura de categorias de conteúdo
- [x] Listagem de artigos/vídeos/tutoriais
- [x] Página de detalhe do conteúdo
- [x] Busca na Academia
- [x] Compra de cursos (Stripe)
- [x] 15 conteúdos demo

### HUB DE ESTÚDIOS V1
- [x] Diretório de estúdios
- [x] Página de detalhe do estúdio
- [x] Equipamentos e preços
- [x] Sistema de reservas básico
- [x] Pagamento de reserva (Stripe)
- [x] 12 estúdios demo

### PAINEL ADMIN
- [x] Gestão de usuários (listar, editar role)
- [x] Moderação de ofertas (aprovar, rejeitar, suspender)
- [x] Moderação de oportunidades
- [x] Moderação de conteúdo da Academia
- [x] Logs de auditoria
- [x] Estatísticas completas

### DASHBOARD PROPRIETÁRIO
- [x] Visão geral executiva (8 KPIs principais)
- [x] Total de perfis por tipo (PieChart)
- [x] Métricas de ofertas e oportunidades
- [x] Receitas registradas (Stripe)
- [x] Custos e margem
- [x] Previsto x realizado (barras de progresso)
- [x] Gráficos de crescimento (AreaChart, LineChart)
- [x] Distribuição geográfica (BarChart)
- [x] Logs administrativos
- [x] Tabs: Visão Geral, Financeiro, Crescimento, Operação
- [x] Saúde da plataforma
- [x] Previsão de receita (3 meses)

### DADOS DEMO
- [x] 50 perfis fictícios realistas
- [x] 30 ofertas ativas
- [x] 20 oportunidades
- [x] 15 conteúdos da Academia
- [x] 12 estúdios cadastrados
- [x] 11 usuários demo

### STRIPE
- [x] Integração Stripe configurada
- [x] Webhook endpoint (/api/stripe/webhook)
- [x] Reserva de estúdio (pagamento)
- [x] Compra de curso da Academia
- [x] Produtos definidos (stripe-products.ts)
- [x] Sandbox Stripe ativo

### GERAÇÃO DE IMAGENS
- [x] Interface de criação de imagem por prompt
- [x] Geração de banner para perfil/oferta/evento
- [x] Salvar imagem gerada

### TESTES
- [x] 90 testes Vitest passando (100%)
- [x] Cobertura: auth, perfis, ofertas, oportunidades, estúdios, academia, admin, owner, mapa, platform, analytics, autorização, validação de inputs, dashboard, notificações, imageGen

### PENDENTE — FASE 2
- [ ] Notificações por email (SMTP)
- [ ] Chat entre usuários
- [ ] Sistema de avaliações e reviews
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] App nativo (iOS/Android)
- [ ] Pagamentos internos completos (split, escrow)
- [ ] Antifraude avançado
- [ ] BI enterprise
- [ ] Clusters no mapa
- [ ] Meta tags dinâmicas e Open Graph
- [ ] Sitemap

## ELEVAÇÃO 10/10 — Fase A (Crítico)
- [x] Helmet configurado com CSP, CORS, rate-limit
- [x] trust proxy configurado corretamente
- [x] Home pública sem redirect para login (query admin.stats → platform.publicStats)
- [x] Todas as rotas públicas usam publicProcedure
- [x] Validação do .env no startup (check de variáveis obrigatórias)
- [x] .env.example documentado (via ENVIRONMENT.md)
- [x] Índices críticos criados no banco (type, isActive, state, createdAt)
- [ ] Adicionar UNIQUE(opportunityId, profileId) em applications
- [ ] Adicionar campos lat/lng/geocoded em profiles
- [ ] Adicionar viewCount/leadCount em offers

## ELEVAÇÃO 10/10 — Fase B (Importante)
- [x] Design system: paleta g*/o*/n* no Tailwind config
- [x] Fontes Fraunces + DM Sans carregadas
- [x] Code splitting por rota (React.lazy + Suspense)
- [x] Componente PNSPLogo com variantes (nav, hero, sidebar, footer)
- [x] Mobile-first: nav hamburger com Sheet (PublicLayout)
- [x] Skeleton loading em Perfis, Ofertas, Oportunidades, Academia, Estúdios (já existia)
- [x] Empty state em todas as listagens (já existia)
- [x] Error state (isError + AlertCircle + botão Tentar novamente) em Perfis, Ofertas, Oportunidades, Estúdios, Academia
- [x] Toast (sonner) em todas as ações do usuário (já existia)
- [x] Loading state em todos os botões de submit (já existia)

## SESSÃO 3 — Banco + Performance
- [x] Índices críticos criados: (type, isActive), (state), (createdAt)
- [x] Dados demo distribuídos em 6 meses com curva de crescimento (out/25 → mar/26)
- [x] Gráfico de crescimento do Dashboard com dados reais (6 meses visíveis)
- [x] Query getMonthlyGrowth corrigida com raw SQL + alias para ONLY_FULL_GROUP_BY
- [ ] UNIQUE(opportunityId, profileId) em applications
- [ ] Campos latitude/longitude em profiles
- [ ] viewCount e leadCount em offerings

## SESSÃO 4 — Dashboard Proprietário Completo
- [x] Aba Financeiro: receitas/custos manuais + previsto x realizado + fontes de receita
- [x] Aba Operação: usuários recentes + saúde da plataforma + fila de moderação + previsão de receita
- [x] Aba Crescimento: gráfico temporal (6 meses), distribuição por tipo, distribuição geográfica real
- [x] Distribuição geográfica com dados reais (RJ, MG, PE, DF, PB)
- [ ] Exportação de relatório PDF com KPIs e gráficos
- [ ] Seletor de período (7d, 30d, 90d, 1a)

## ELEVAÇÃO 10/10 — Fase C (Profissional)
- [x] 90 testes Vitest passando
- [x] Health check GET /api/health com DB probe
- [x] Graceful shutdown (SIGTERM + SIGINT com timeout 10s)
- [x] README profissional com setup em 5 comandos
- [ ] UNIQUE(opportunityId, profileId) em applications
- [ ] viewCount e leadCount em offerings
- [ ] latitude/longitude em profiles
- [x] Split routers.ts em módulos por domínio (6 domain routers)
- [x] Split db.ts em módulos por domínio (7 repositories)
- [ ] Exportação PDF do Dashboard
- [ ] Seletor de período no Dashboard
- [x] Logging estruturado (pino) — server, stripe, maps, trpc child loggers
- [ ] GitHub Actions CI: lint + typecheck + test + build
- [x] Testes cobertura: 90 testes passando (auth, RBAC, CRUD, edge cases)
- [x] Open Graph + Twitter Card meta tags
- [x] PWA Service Worker com cache offline
- [x] robots.txt + canonical URL
- [ ] PWA icons completos (192x192, 512x512)
- [ ] Logo variantes (auth, footer)
