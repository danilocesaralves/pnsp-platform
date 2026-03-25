# PNSP — Variáveis de Ambiente

Todas as variáveis de ambiente são gerenciadas pelo Manus via Settings → Secrets.

## Variáveis Obrigatórias

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string (gerenciado automaticamente) |
| `JWT_SECRET` | Segredo para assinar sessões |
| `VITE_APP_ID` | ID do app Manus OAuth |
| `OAUTH_SERVER_URL` | URL do servidor OAuth |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login |
| `OWNER_OPEN_ID` | OpenID do proprietário da plataforma |
| `OWNER_NAME` | Nome do proprietário |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (sk_test_...) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook Stripe (whsec_...) |
| `BUILT_IN_FORGE_API_KEY` | API key Manus Forge — servidor |
| `BUILT_IN_FORGE_API_URL` | URL Manus Forge — servidor |
| `VITE_FRONTEND_FORGE_API_KEY` | API key Manus Forge — frontend |
| `VITE_FRONTEND_FORGE_API_URL` | URL Manus Forge — frontend |

## Variáveis Opcionais (Produção Independente)

| Variável | Serviço | Como Obter |
|---|---|---|
| `REDIS_URL` | Upstash Redis | https://console.upstash.com |
| `REDIS_TOKEN` | Upstash Redis Token | https://console.upstash.com |
| `SENTRY_DSN` | Sentry Error Monitoring | https://sentry.io |
| `RESEND_API_KEY` | Resend Email Transacional | https://resend.com |

## Setup Local (5 comandos)

```bash
git clone https://github.com/danilocesaralves/pnsp-platform
cd pnsp-platform
# Configure as variáveis no painel Manus Settings → Secrets
pnpm install
pnpm dev
```
