import type { Express } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { profiles } from "../../drizzle/schema";

const FRONTEND = "https://pnsp-platform.vercel.app";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function registerOgMetaRoute(app: Express): void {
  app.get("/og/perfil/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const db = await getDb();

      let title = "Perfil — PNSP";
      let description =
        "Conheça os profissionais do ecossistema digital do samba e pagode brasileiro.";
      let image = `${FRONTEND}/logo-pnsp-crop.png`;
      const canonical = `${FRONTEND}/perfil/${slug}`;

      if (db) {
        const [profile] = await db
          .select({
            displayName: profiles.displayName,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl,
            city: profiles.city,
          })
          .from(profiles)
          .where(sql`LOWER(${profiles.slug}) = ${slug.toLowerCase()}`)
          .limit(1);

        if (profile) {
          title = `${profile.displayName} — PNSP`;
          description = profile.bio
            ? profile.bio.slice(0, 160)
            : `Conheça o perfil de ${profile.displayName} na infraestrutura digital do samba e pagode.`;
          if (profile.avatarUrl) image = profile.avatarUrl;
        }
      }

      const t = escapeHtml(title);
      const d = escapeHtml(description);
      const c = escapeHtml(canonical);
      const img = escapeHtml(image);

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image" content="${img}">
  <meta property="og:url" content="${c}">
  <meta property="og:type" content="profile">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="PNSP — Infraestrutura Digital do Samba">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">
  <script>window.location.replace("${c}");</script>
</head>
<body><p>Redirecionando...</p></body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
      res.send(html);
    } catch {
      res.redirect(302, `${FRONTEND}/perfil/${encodeURIComponent(slug)}`);
    }
  });
}
