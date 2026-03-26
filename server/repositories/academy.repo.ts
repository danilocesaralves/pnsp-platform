import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { academyContent } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createAcademyContent(data: typeof academyContent.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(academyContent).values(data);
}

export async function getAcademyContentBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(academyContent).where(eq(academyContent.slug, slug)).limit(1);
  return result[0];
}

export async function getAcademyContentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(academyContent).where(eq(academyContent.id, id)).limit(1);
  return result[0];
}

export async function listAcademyContent(opts: {
  category?: string;
  contentType?: string;
  level?: string;
  search?: string;
  limit?: number;
  offset?: number;
  isPremium?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(academyContent.isPublished, true)];
  if (opts.category) conditions.push(eq(academyContent.category, opts.category as any));
  if (opts.contentType) conditions.push(eq(academyContent.contentType, opts.contentType as any));
  if (opts.level) conditions.push(eq(academyContent.level, opts.level as any));
  if (opts.isPremium !== undefined) conditions.push(eq(academyContent.isPremium, opts.isPremium));
  if (opts.search) {
    conditions.push(
      or(
        like(academyContent.title, `%${opts.search}%`),
        like(academyContent.excerpt, `%${opts.search}%`),
      ) as any
    );
  }
  return db
    .select()
    .from(academyContent)
    .where(and(...conditions))
    .orderBy(desc(academyContent.publishedAt))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function updateAcademyContent(id: number, data: Partial<typeof academyContent.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(academyContent).set(data).where(eq(academyContent.id, id));
}

export async function getAcademyContentCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(academyContent).where(eq(academyContent.isPublished, true));
  return Number(result[0]?.count ?? 0);
}
