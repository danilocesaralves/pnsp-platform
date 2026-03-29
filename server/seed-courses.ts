/**
 * Seed demo academy courses + lessons.
 * Run: npx tsx server/seed-courses.ts
 */
import { getDb } from "./db";
import { academyCourses, academyLessons } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const COURSES = [
  {
    slug: "historia-do-samba-fundamentos",
    title: "História do Samba — Fundamentos",
    description: "Mergulhe nas raízes do samba, desde os terreiros da Bahia até os morros cariocas. Aprenda sobre os pioneiros, os gêneros e a evolução cultural que moldou o Brasil.",
    category: "historia" as const,
    level: "iniciante" as const,
    instructorName: "Mestre Zumbi do Samba",
    durationMinutes: 240,
    isFree: true,
    isPublished: true,
    price: 0,
    lessons: [
      { order: 1, title: "As origens africanas do samba", durationMinutes: 30, isFree: true },
      { order: 2, title: "Bahia: berço e matriz cultural", durationMinutes: 35, isFree: true },
      { order: 3, title: "A chegada ao Rio de Janeiro", durationMinutes: 40, isFree: false },
      { order: 4, title: "Pioneiros: Donga, Chiquinha e Pixinguinha", durationMinutes: 45, isFree: false },
      { order: 5, title: "A Era de Ouro: 1930-1950", durationMinutes: 50, isFree: false },
      { order: 6, title: "Samba hoje: continuidade e renovação", durationMinutes: 40, isFree: false },
    ],
  },
  {
    slug: "tecnica-avancada-de-cavaquinho",
    title: "Técnica Avançada de Cavaquinho",
    description: "Domine as batidas, arpejos e improvisações do cavaquinho com este curso voltado para músicos que já possuem base no instrumento. Do pagode ao choro.",
    category: "tecnica" as const,
    level: "avancado" as const,
    instructorName: "Cavaquinhista D. Américo",
    durationMinutes: 360,
    isFree: false,
    isPublished: true,
    price: 9700,
    lessons: [
      { order: 1, title: "Revisão: postura e afinação", durationMinutes: 20, isFree: true },
      { order: 2, title: "Batidas do pagode: clave e variações", durationMinutes: 55, isFree: false },
      { order: 3, title: "Arpejos em progressões de ii-V-I", durationMinutes: 60, isFree: false },
      { order: 4, title: "Improvisação no choro", durationMinutes: 65, isFree: false },
      { order: 5, title: "Toques regionais: baião e frevo", durationMinutes: 70, isFree: false },
      { order: 6, title: "Projeto final: composição própria", durationMinutes: 90, isFree: false },
    ],
  },
  {
    slug: "carreira-musical-gestao-e-negocios",
    title: "Carreira Musical — Gestão e Negócios",
    description: "Aprenda a monetizar seu talento: contratos, cachê, marketing digital, patrocínios e como usar plataformas de streaming para crescer profissionalmente.",
    category: "negocios" as const,
    level: "intermediario" as const,
    instructorName: "Profa. Mariana Ramos",
    durationMinutes: 300,
    isFree: false,
    isPublished: true,
    price: 7900,
    lessons: [
      { order: 1, title: "Introdução: artista como empreendedor", durationMinutes: 20, isFree: true },
      { order: 2, title: "Como precificar seu cachê", durationMinutes: 45, isFree: false },
      { order: 3, title: "Contratos: o que nunca assinar sem ler", durationMinutes: 50, isFree: false },
      { order: 4, title: "Marketing digital para músicos", durationMinutes: 60, isFree: false },
      { order: 5, title: "Patrocínios e editais culturais", durationMinutes: 65, isFree: false },
      { order: 6, title: "Streaming, direitos autorais e ECAD", durationMinutes: 60, isFree: false },
    ],
  },
];

async function seedCourses() {
  const db = await getDb();
  if (!db) { console.error("DB not available — set DATABASE_URL"); process.exit(1); }

  let coursesInserted = 0;
  let lessonsInserted = 0;
  let skipped = 0;

  for (const { lessons, ...courseData } of COURSES) {
    const existing = await db.select({ id: academyCourses.id })
      .from(academyCourses)
      .where(eq(academyCourses.slug, courseData.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  – Already exists: ${courseData.title}`);
      skipped++;
      continue;
    }

    const [course] = await db.insert(academyCourses).values(courseData).returning();
    coursesInserted++;
    console.log(`  ✓ Course inserted: ${course.title} (id=${course.id})`);

    for (const lesson of lessons) {
      await db.insert(academyLessons).values({ courseId: course.id, ...lesson });
      lessonsInserted++;
    }
    console.log(`    ↳ ${lessons.length} aulas inseridas`);
  }

  console.log(`\nSeed completo: ${coursesInserted} curso(s) inserido(s), ${lessonsInserted} aula(s), ${skipped} já existia(m).`);
  process.exit(0);
}

seedCourses().catch(e => { console.error(e); process.exit(1); });
