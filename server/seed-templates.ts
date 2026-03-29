/**
 * Seed default contract templates.
 * Run after migration: npx tsx server/seed-templates.ts
 */
import { getDb } from "./db";
import { contractTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const TEMPLATES = [
  {
    name: "Contrato de Show",
    type: "show",
    isDefault: true,
    content: `<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS ARTÍSTICOS</h2>
<p><strong>CONTRATANTE:</strong> {{contratante}}</p>
<p><strong>ARTISTA/GRUPO:</strong> {{artista}}</p>
<p><strong>DATA DO EVENTO:</strong> {{data}}</p>
<p><strong>LOCAL:</strong> {{local}}</p>
<p><strong>HORÁRIO:</strong> {{horario}}</p>
<p><strong>DURAÇÃO:</strong> {{duracao}}</p>
<p><strong>VALOR TOTAL:</strong> {{valor}}</p>
<h3>CLÁUSULAS</h3>
<p>1. O ARTISTA compromete-se a realizar apresentação artística nas condições acima especificadas.</p>
<p>2. O pagamento será realizado conforme acordado entre as partes.</p>
<p>3. Em caso de cancelamento com menos de 48h, aplica-se multa de 50% do valor contratado.</p>
<p>4. Este contrato é regido pela legislação brasileira.</p>`,
  },
  {
    name: "Contrato de Produção Musical",
    type: "producao",
    isDefault: true,
    content: `<h2>CONTRATO DE PRODUÇÃO MUSICAL</h2>
<p><strong>CONTRATANTE:</strong> {{contratante}}</p>
<p><strong>PRODUTOR/ARTISTA:</strong> {{artista}}</p>
<p><strong>DATA DE INÍCIO:</strong> {{data}}</p>
<p><strong>LOCAL DE GRAVAÇÃO:</strong> {{local}}</p>
<p><strong>DURAÇÃO DO PROJETO:</strong> {{duracao}}</p>
<p><strong>VALOR TOTAL:</strong> {{valor}}</p>
<h3>CLÁUSULAS</h3>
<p>1. O PRODUTOR compromete-se a entregar as faixas produzidas no prazo estipulado.</p>
<p>2. Os direitos autorais das composições pertencem ao CONTRATANTE, salvo acordo específico.</p>
<p>3. Revisões ilimitadas estão incluídas até a aprovação final.</p>
<p>4. Pagamento em duas parcelas: 50% na assinatura, 50% na entrega.</p>`,
  },
  {
    name: "Contrato de Aula/Oficina",
    type: "aula",
    isDefault: true,
    content: `<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h2>
<p><strong>CONTRATANTE:</strong> {{contratante}}</p>
<p><strong>PROFESSOR/INSTRUTOR:</strong> {{artista}}</p>
<p><strong>DATA:</strong> {{data}}</p>
<p><strong>LOCAL:</strong> {{local}}</p>
<p><strong>HORÁRIO:</strong> {{horario}}</p>
<p><strong>DURAÇÃO:</strong> {{duracao}}</p>
<p><strong>VALOR:</strong> {{valor}}</p>
<h3>CLÁUSULAS</h3>
<p>1. O INSTRUTOR compromete-se a ministrar aula/oficina conforme programação acordada.</p>
<p>2. Material didático necessário é de responsabilidade do INSTRUTOR.</p>
<p>3. Cancelamento com 24h de antecedência não acarreta penalidades.</p>
<p>4. O CONTRATANTE deve fornecer estrutura mínima: espaço adequado e equipamento de som.</p>`,
  },
];

async function seedTemplates() {
  const db = await getDb();
  if (!db) { console.error("DB not available"); process.exit(1); }

  let inserted = 0;
  for (const tpl of TEMPLATES) {
    const existing = await db.select()
      .from(contractTemplates)
      .where(eq(contractTemplates.name, tpl.name))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(contractTemplates).values(tpl);
      inserted++;
      console.log(`  ✓ Inserted: ${tpl.name}`);
    } else {
      console.log(`  – Already exists: ${tpl.name}`);
    }
  }
  console.log(`\nSeed complete. ${inserted} template(s) inserted.`);
  process.exit(0);
}

seedTemplates().catch(e => { console.error(e); process.exit(1); });
