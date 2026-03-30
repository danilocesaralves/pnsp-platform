/**
 * PNSP Agency — Seed
 * Popula as regras iniciais da Agência Autônoma
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { agencyReinvestmentRules } from "../../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL ausente no .env");

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("🌱  Iniciando seed Agency PNSP...\n");

  const rules = [
    {
      name: "Reinvestimento por Booking Fechado",
      triggerType: "booking_fechado" as const,
      reinvestmentPct: "10.00",
      minimumThreshold: "1000.00",
      accumulatedRevenue: "0.00",
      targetObjective: "aquisicao" as const,
      isActive: true,
      totalExecuted: 0,
      totalInvested: "0.00",
    },
    {
      name: "Reinvestimento Mensal",
      triggerType: "mensal" as const,
      reinvestmentPct: "15.00",
      minimumThreshold: "1000.00",
      accumulatedRevenue: "0.00",
      targetObjective: "retencao" as const,
      isActive: true,
      totalExecuted: 0,
      totalInvested: "0.00",
    },
    {
      name: "Meta de Receita Atingida",
      triggerType: "meta_receita" as const,
      reinvestmentPct: "20.00",
      minimumThreshold: "1000.00",
      accumulatedRevenue: "0.00",
      targetObjective: "expansao" as const,
      isActive: true,
      totalExecuted: 0,
      totalInvested: "0.00",
    }
  ];

  for (const rule of rules) {
    console.log(`- Inserindo regra: ${rule.name}`);
    await db.insert(agencyReinvestmentRules).values(rule).onConflictDoNothing();
  }

  console.log("\n✅ Seed Agency concluído!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
