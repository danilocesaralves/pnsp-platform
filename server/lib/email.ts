import { Resend } from "resend";

// ─── Resend instance (null when not configured) ───────────────────────────────
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "PNSP <noticias@pnsp.com.br>";
const BASE_URL = process.env.VITE_APP_URL ?? "https://pnsp-platform.vercel.app";

// ─── HTML template base ───────────────────────────────────────────────────────
function emailTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PNSP</title>
</head>
<body style="margin:0;padding:0;background:#0A0800;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0800;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1C160C;border-radius:16px;overflow:hidden;border:1px solid rgba(212,146,10,0.2);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1C160C 0%,#261E10 100%);padding:28px 32px;border-bottom:1px solid rgba(212,146,10,0.25);">
            <div style="font-size:22px;font-weight:800;color:#D4920A;letter-spacing:-0.5px;">
              🎵 PNSP
            </div>
            <div style="font-size:11px;color:rgba(245,237,216,0.45);margin-top:4px;text-transform:uppercase;letter-spacing:1.5px;">
              Plataforma Nacional do Samba e Pagode
            </div>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid rgba(212,146,10,0.10);">
            <p style="margin:0;font-size:11px;color:rgba(245,237,216,0.35);line-height:1.6;">
              Você está recebendo este e-mail porque tem uma conta na PNSP.<br />
              © 2026 PNSP — Plataforma Nacional do Samba e do Pagode.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#D4920A;color:#0A0800;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">${label}</a>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#F5EDD8;line-height:1.2;">${text}</h2>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;color:rgba(245,237,216,0.75);line-height:1.65;">${text}</p>`;
}

// ─── Base send function ───────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log(`[Email não configurado] ${subject} → ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[Email error]", err);
  }
}

// ─── Rate limiting — in-memory map ───────────────────────────────────────────
const emailRateLimit = new Map<string, number>();

// Clean up stale entries every hour
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [key, ts] of emailRateLimit) {
    if (ts < cutoff) emailRateLimit.delete(key);
  }
}, 60 * 60 * 1000);

function canSendEmail(key: string, cooldownMs = 3_600_000): boolean {
  const last = emailRateLimit.get(key);
  if (last && Date.now() - last < cooldownMs) return false;
  emailRateLimit.set(key, Date.now());
  return true;
}

// ─── Public email functions ───────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = emailTemplate(
    heading(`Bem-vindo à PNSP, ${name}! 🎵`) +
    p("Sua conta foi criada com sucesso. A plataforma digital do samba e pagode brasileiro aguarda você.") +
    p("Crie seu perfil, conecte-se com artistas, produtores e contratantes de todo o Brasil.") +
    btn("Criar meu perfil", `${BASE_URL}/criar-perfil`),
  );
  await sendEmail(to, `Bem-vindo à PNSP, ${name}! 🎵`, html);
}

export async function sendNewProposalEmail(
  to: string,
  artistName: string,
  contractorName: string,
  proposalTitle: string,
  valueCents: number | null | undefined,
  bookingId: number,
): Promise<void> {
  const rateKey = `booking:${bookingId}:proposal`;
  if (!canSendEmail(rateKey)) return;

  const valueStr = valueCents
    ? (valueCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "A combinar";

  const html = emailTemplate(
    heading(`Nova proposta: ${proposalTitle}`) +
    p(`Olá, <strong style="color:#F5EDD8;">${artistName}</strong>!`) +
    p(`<strong style="color:#D4920A;">${contractorName}</strong> enviou uma proposta de contratação para você.`) +
    p(`<strong style="color:#F5EDD8;">Valor proposto:</strong> ${valueStr}`) +
    btn("Ver proposta", `${BASE_URL}/negociacoes`),
  );
  await sendEmail(to, `Nova proposta recebida: ${proposalTitle}`, html);
}

export async function sendProposalAcceptedEmail(
  to: string,
  name: string,
  proposalTitle: string,
  bookingId: number,
): Promise<void> {
  const html = emailTemplate(
    heading(`Proposta aceita! 🎉`) +
    p(`Olá, <strong style="color:#F5EDD8;">${name}</strong>!`) +
    p(`A proposta <strong style="color:#D4920A;">"${proposalTitle}"</strong> foi aceita. É hora de fazer acontecer!`) +
    btn("Ver detalhes", `${BASE_URL}/negociacoes`),
  );
  await sendEmail(to, `Proposta aceita! 🎉 ${proposalTitle}`, html);
}

export async function sendNewMessageEmail(
  to: string,
  fromName: string,
  conversationId: number,
  userId: number,
): Promise<void> {
  const rateKey = `${userId}:msg:${conversationId}`;
  if (!canSendEmail(rateKey)) return;

  const html = emailTemplate(
    heading(`Nova mensagem de ${fromName}`) +
    p(`Você recebeu uma nova mensagem. Acesse a plataforma para responder.`) +
    btn("Abrir mensagens", `${BASE_URL}/mensagens`),
  );
  await sendEmail(to, `Nova mensagem de ${fromName}`, html);
}

export async function sendNewReviewEmail(
  to: string,
  reviewerName: string,
  rating: number,
  profileId: number,
  userId: number,
): Promise<void> {
  const rateKey = `${userId}:review:${profileId}:${reviewerName}`;
  if (!canSendEmail(rateKey, 24 * 3_600_000)) return;

  const stars = "⭐".repeat(rating);
  const html = emailTemplate(
    heading(`Nova avaliação ${stars}`) +
    p(`<strong style="color:#D4920A;">${reviewerName}</strong> avaliou seu perfil com <strong style="color:#F5EDD8;">${rating} estrela${rating > 1 ? "s" : ""}</strong>.`) +
    btn("Ver avaliação", `${BASE_URL}/dashboard`),
  );
  await sendEmail(to, `Nova avaliação ${stars} de ${reviewerName}`, html);
}

export async function sendOpportunityMatchEmail(
  to: string,
  name: string,
  opportunityTitle: string,
  city: string | null | undefined,
  opportunityId: number,
  userId: number,
): Promise<void> {
  const rateKey = `${userId}:opp:${opportunityId}`;
  if (!canSendEmail(rateKey, 24 * 3_600_000)) return;

  const cityStr = city ? ` em ${city}` : "";
  const html = emailTemplate(
    heading(`Nova oportunidade${cityStr}!`) +
    p(`Olá, <strong style="color:#F5EDD8;">${name}</strong>!`) +
    p(`Uma nova oportunidade que pode ser para você acabou de ser publicada: <strong style="color:#D4920A;">${opportunityTitle}</strong>.`) +
    btn("Ver oportunidade", `${BASE_URL}/oportunidades/${opportunityId}`),
  );
  await sendEmail(to, `Nova oportunidade${cityStr}: ${opportunityTitle}`, html);
}
