# PNSP — Plataforma Nacional de Samba e Pagode

**Infraestrutura digital setorial para o ecossistema do samba e do pagode brasileiro.**

A PNSP conecta artistas solo, grupos, bandas, duplas, comunidades, rodas de samba, projetos culturais, compositores, músicos, produtores, professores, estúdios, lojas de instrumentos, luthiers, artesãos, contratantes, bares, casas de show, eventos, hotelaria, turismo e parceiros do ecossistema.

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + TailwindCSS 4 |
| Backend | Node.js + Express 4 + tRPC 11 |
| Banco de Dados | MySQL (TiDB) + Drizzle ORM |
| Autenticação | Manus OAuth (JWT + cookies seguros) |
| Pagamentos | Stripe (checkout, webhooks) |
| Mapas | Google Maps API (proxy Manus) |
| Geração de Imagens | IA generativa (Manus Forge API) |
| Testes | Vitest (24 testes, 100% passando) |
| Deploy | Manus Hosting (PWA) |

---

## Módulos da Fase 1

### 1. Autenticação e Contas
- Login/Registro com Manus OAuth
- Sessões persistentes com cookie seguro (HttpOnly, SameSite)
- Roles: `user`, `admin`, `owner`
- Proteção de rotas por role (protectedProcedure, adminProcedure, ownerProcedure)

### 2. Perfis e Vitrines Públicas
- Criação e edição de perfil unificado
- Tipos: artista solo, grupo/banda, comunidade/roda, produtor, estúdio, professor, loja, luthier, contratante, parceiro
- Portfólio de mídia (imagens, vídeos, áudio)
- Perfis verificados e em destaque
- Busca e filtros avançados

### 3. Motor de Ofertas
- Publicação de serviços, produtos, aulas, shows, produção
- Categorias: show, aula, produção, instrumento novo/usado, artesanato, luthieria, estúdio, serviço
- Tipos de preço: fixo, sob consulta, gratuito, a combinar
- Gestão pelo usuário (criar, editar, ativar/desativar)

### 4. Motor de Oportunidades
- Publicação de vagas, eventos, projetos, parcerias
- Candidatura a oportunidades
- Gestão de candidaturas
- Status: aberta, em andamento, encerrada

### 5. Mapa Vivo Nacional
- Visualização geográfica interativa de perfis
- Filtros por tipo de perfil e estado
- Marcadores com popup de informações
- Link direto para vitrine pública

### 6. Academia V1
- Biblioteca de conteúdo educacional
- Tipos: artigo, vídeo, tutorial, curso, podcast
- Categorias: história, técnica, instrumentos, composição, produção, carreira, negócios, cultura
- Níveis: iniciante, intermediário, avançado
- Conteúdo premium com Stripe

### 7. Hub de Estúdios V1
- Diretório de estúdios de gravação e ensaio
- Informações completas: equipamentos, preços, localização
- Sistema de reservas com pagamento via Stripe

### 8. Painel Admin
- Gestão de usuários (listar, alterar role)
- Moderação de perfis, ofertas, oportunidades e conteúdo
- Aprovação, suspensão, verificação e destaque
- Logs de auditoria completos
- Estatísticas da plataforma

### 9. Dashboard Proprietário
- 8 KPIs executivos em tempo real
- Gráficos: crescimento (AreaChart), distribuição por tipo (PieChart), geográfico (BarChart)
- Metas vs Realizado com barras de progresso
- Resumo financeiro: receita, custos, lucro, margem
- Previsão de receita (3 meses)
- Saúde da plataforma
- 4 abas: Visão Geral, Financeiro, Crescimento, Operação

### 10. Geração de Imagens com IA
- Criação de imagens promocionais por prompt de texto
- Histórico de imagens geradas
- Integração com Manus Forge API

---

## Estrutura do Projeto

```
pnsp-platform/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page premium
│   │   │   ├── Profiles.tsx          # Listagem de perfis
│   │   │   ├── ProfileDetail.tsx     # Vitrine pública
│   │   │   ├── Offerings.tsx         # Motor de Ofertas
│   │   │   ├── OfferingDetail.tsx    # Detalhe de oferta
│   │   │   ├── Opportunities.tsx     # Motor de Oportunidades
│   │   │   ├── MapPage.tsx           # Mapa Vivo Nacional
│   │   │   ├── Academy.tsx           # Academia V1
│   │   │   ├── Studios.tsx           # Hub de Estúdios V1
│   │   │   ├── Dashboard.tsx         # Dashboard do usuário
│   │   │   ├── ImageGenerator.tsx    # Geração de imagens IA
│   │   │   ├── admin/
│   │   │   │   └── AdminPanel.tsx    # Painel Admin
│   │   │   └── owner/
│   │   │       └── OwnerDashboard.tsx # Dashboard Proprietário
│   │   ├── components/
│   │   │   └── PublicLayout.tsx      # Layout principal com nav
│   │   └── lib/
│   │       └── pnsp-constants.ts     # Constantes da plataforma
├── server/
│   ├── routers.ts                    # Todos os endpoints tRPC
│   ├── db.ts                         # Query helpers (Drizzle)
│   ├── stripe-products.ts            # Produtos Stripe
│   └── pnsp.test.ts                  # 24 testes Vitest
├── drizzle/
│   └── schema.ts                     # 16 tabelas do banco
└── shared/
    └── pnsp.ts                       # Constantes compartilhadas
```

---

## Banco de Dados (16 Tabelas)

| Tabela | Descrição |
|---|---|
| `users` | Usuários autenticados |
| `profiles` | Vitrines públicas dos profissionais |
| `portfolio_items` | Portfólio de mídia dos perfis |
| `offerings` | Motor de Ofertas |
| `opportunities` | Motor de Oportunidades |
| `applications` | Candidaturas a oportunidades |
| `studios` | Hub de Estúdios |
| `studio_bookings` | Reservas de estúdios |
| `academy_content` | Conteúdo da Academia |
| `academy_purchases` | Compras de conteúdo premium |
| `generated_images` | Imagens geradas por IA |
| `financial_records` | Registros financeiros |
| `admin_logs` | Logs de auditoria |
| `notifications` | Notificações do sistema |
| `stripe_events` | Eventos do webhook Stripe |

---

## Dados Demo

| Entidade | Quantidade |
|---|---|
| Usuários | 11 |
| Perfis | 50 |
| Estúdios | 12 |
| Ofertas | 30 |
| Oportunidades | 20 |
| Conteúdos Academia | 15 |

---

## Como Executar Localmente

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencher DATABASE_URL, JWT_SECRET, etc.

# Rodar em desenvolvimento
pnpm dev

# Rodar testes
pnpm test

# Build para produção
pnpm build
```

---

## Testes

```bash
pnpm test
# ✓ server/auth.logout.test.ts (1 test)
# ✓ server/pnsp.test.ts (23 tests)
# Tests: 24 passed (24)
```

---

## Variáveis de Ambiente Necessárias

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string MySQL/TiDB |
| `JWT_SECRET` | Chave para assinar cookies de sessão |
| `VITE_APP_ID` | ID do app Manus OAuth |
| `OAUTH_SERVER_URL` | URL do servidor OAuth Manus |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook Stripe |
| `BUILT_IN_FORGE_API_KEY` | Chave da API Manus Forge (imagens, LLM) |

---

## Roadmap — Fase 2

- Notificações por email (SMTP)
- Chat entre usuários
- Sistema de avaliações e reviews
- Exportação de relatórios (PDF/Excel)
- App nativo (iOS/Android)
- Pagamentos internos completos (split, escrow)
- Antifraude avançado
- BI enterprise

---

**Fundador:** Danilo — Estrategista e fundador da PNSP  
**Stack construída por:** Manus AI  
**Licença:** MIT
