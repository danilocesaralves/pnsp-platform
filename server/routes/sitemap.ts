import type { Express } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { profiles, opportunities } from "../../drizzle/schema";

const BASE = "https://pnsp-platform.vercel.app";

function urlEntry(
  loc: string,
  priority: string,
  changefreq: string,
  lastmod?: string,
): string {
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`;
}

export function registerSitemapRoute(app: Express): void {
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const db = await getDb();
      const today = new Date().toISOString().split("T")[0];

      const staticEntries = [
        urlEntry("/", "1.0", "daily", today),
        urlEntry("/faq", "0.9", "monthly"),
        urlEntry("/perfis", "0.9", "daily", today),
        urlEntry("/oportunidades", "0.8", "daily", today),
        urlEntry("/academia", "0.8", "weekly", today),
        urlEntry("/mapa", "0.7", "weekly"),
        urlEntry("/estudios", "0.7", "weekly"),
        urlEntry("/comunidade", "0.7", "daily"),
        urlEntry("/entrar", "0.5", "monthly"),
        urlEntry("/cadastrar", "0.6", "monthly"),
      ];

      const dynamicEntries: string[] = [];

      if (db) {
        const profileRows = await db
          .select({ slug: profiles.slug, updatedAt: profiles.updatedAt })
          .from(profiles)
          .where(eq(profiles.isActive, true))
          .limit(500);

        for (const p of profileRows) {
          if (p.slug) {
            const lastmod = p.updatedAt
              ? new Date(p.updatedAt).toISOString().split("T")[0]
              : undefined;
            dynamicEntries.push(urlEntry(`/perfil/${p.slug}`, "0.7", "weekly", lastmod));
          }
        }

        const oppRows = await db
          .select({ id: opportunities.id, updatedAt: opportunities.updatedAt })
          .from(opportunities)
          .where(eq(opportunities.isActive, true))
          .limit(500);

        for (const o of oppRows) {
          const lastmod = o.updatedAt
            ? new Date(o.updatedAt).toISOString().split("T")[0]
            : undefined;
          dynamicEntries.push(urlEntry(`/oportunidades/${o.id}`, "0.6", "weekly", lastmod));
        }
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...dynamicEntries].join("\n")}\n</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch {
      res.status(500).send("Error generating sitemap");
    }
  });
}
