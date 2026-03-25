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
- [x] 24 testes Vitest passando (100%)
- [x] Cobertura: auth, perfis, ofertas, oportunidades, estúdios, academia, admin, owner, mapa

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
- [ ] Migrar banco de MySQL para PostgreSQL (Supabase)
- [ ] Atualizar schema Drizzle para PostgreSQL (pg driver)
- [ ] Adicionar índices críticos: (type, isActive), (city, state), (slug), (createdAt)
- [ ] Adicionar UNIQUE(opportunityId, profileId) em applications
- [ ] Adicionar campos lat/lng/geocoded em profiles
- [ ] Adicionar viewCount/leadCount em offers
- [ ] Aplicar migrations no Supabase
- [ ] Instalar Helmet e configurar headers de segurança
- [ ] Instalar e configurar CORS explícito
- [ ] Instalar express-rate-limit
- [ ] Validação do .env no startup com Zod
- [ ] Criar .env.example completo e documentado

## ELEVAÇÃO 10/10 — Fase B (Importante)
- [ ] Design system: paleta g*/o*/n* no Tailwind config
- [ ] Fontes Fraunces + DM Sans
- [ ] Componente Logo com variantes (nav, hero, sidebar, footer, auth)
- [ ] Skeleton loading em todas as páginas
- [ ] Empty state com CTA em todas as listagens
- [ ] Error state amigável em todos os erros de API
- [ ] Toast em todas as ações do usuário
- [ ] Loading state em todos os botões de submit
- [ ] Mobile-first: funciona em 375px
- [ ] Code splitting por rota (React.lazy + Suspense)
- [ ] Paginação cursor-based
- [ ] Cache opcional Redis

## ELEVAÇÃO 10/10 — Fase C (Profissional)
- [ ] Testes Vitest cobertura >= 80%
- [ ] GitHub Actions CI: lint + typecheck + test + build
- [ ] Dockerfile multi-stage
- [ ] Health check GET /api/health
- [ ] README com setup em 5 comandos
- [ ] Seed 100% realista
- [ ] Sync completo com GitHub
