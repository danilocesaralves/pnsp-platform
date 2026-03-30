import { eq, and, gte, lte, desc, sql, count, sum } from "drizzle-orm";
import { getDb } from "../db";
import { 
  agencyCampaigns, 
  agencyContents, 
  agencyEcosystemScores, 
  agencyActions, 
  agencyAlerts, 
  agencyReinvestmentRules, 
  agencyPlatformMetrics, 
  agencyLearningLog,
  profiles,
  bookings,
  contracts,
  paymentRecords,
  users,
  pushSubscriptions
} from "../../drizzle/schema";
import { sendEmail, emailTemplate, p, heading, btn } from "./email";
import { sendPushToUser } from "../routers/push.router";
import { sendWhatsApp } from "./whatsapp";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type CampaignObjective = "aquisicao" | "retencao" | "expansao_regional" | "reativacao" | "expansao";
type Platform = "email" | "push" | "whatsapp";

// ─── REINVESTMENT ENGINE ──────────────────────────────────────────────────────

/**
 * Executes reinvestment logic based on revenue triggers
 */
export async function executeReinvestment(
  triggerType: "booking_fechado" | "meta_receita" | "mensal" | "manual",
  revenueAmount: number,
  profileId?: number,
  metadata?: any
) {
  const db = await getDb();
  if (!db) return { status: "error", message: "Database not available" };

  // Find active rules for this trigger
  const activeRules = await db
    .select()
    .from(agencyReinvestmentRules)
    .where(eq(agencyReinvestmentRules.triggerType, triggerType));

  for (const rule of activeRules) {
    if (!rule.isActive) continue;

    const currentAccumulated = Number(rule.accumulatedRevenue) + revenueAmount;
    const threshold = Number(rule.minimumThreshold);

    if (currentAccumulated < threshold) {
      // Just update accumulated
      await db
        .update(agencyReinvestmentRules)
        .set({ accumulatedRevenue: currentAccumulated.toString() })
        .where(eq(agencyReinvestmentRules.id, rule.id));

      await logAction("receita_acumulada", `Acumulado: R$${currentAccumulated.toFixed(2)} / R$${threshold.toFixed(2)}`, "booking", {
        ruleId: rule.id,
        accumulated: currentAccumulated,
        threshold
      });
    } else {
      // Threshold reached! Execute reinvestment
      const budget = (currentAccumulated * Number(rule.reinvestmentPct)) / 100;
      
      // 1. Create Campaign
      const strategy = await generateCampaignStrategy(rule.targetObjective, rule.targetRegion, budget);
      
      // 2. Generate Contents (3 platforms)
      await generateCampaignContents(strategy.id, {
        objective: strategy.objective,
        targetRegion: strategy.targetRegion,
        targetProfileType: strategy.targetProfileType,
        attributionTag: strategy.attributionTag
      });

      // 3. Reset accumulated and update rule stats
      await db
        .update(agencyReinvestmentRules)
        .set({ 
          accumulatedRevenue: "0",
          totalExecuted: rule.totalExecuted + 1,
          totalInvested: (Number(rule.totalInvested) + budget).toString(),
          lastExecutedAt: new Date()
        })
        .where(eq(agencyReinvestmentRules.id, rule.id));

      await logAction("booking", `Reinvestimento executado: R$${budget.toFixed(2)}`, "booking", {
        ruleId: rule.id,
        campaignId: strategy.id,
        budget
      });
    }
  }
}

// ─── DAILY ENGINE ────────────────────────────────────────────────────────────

export async function runDailyEngine() {
  console.log("🎭 PNSP Agency: Running Daily Engine...");
  try {
    const metrics = await collectPlatformMetrics();
    const { scores, gaps } = await calculateEcosystemScores();
    const alerts = await detectAlerts(scores, metrics);
    
    // Generate daily strategic campaign
    const strategy = await generateCampaignStrategy();
    await generateCampaignContents(strategy.id, {
      objective: strategy.objective,
      targetRegion: strategy.targetRegion,
      targetProfileType: strategy.targetProfileType,
      attributionTag: strategy.attributionTag
    });

    // Evaluate ROI for old campaigns (30 days ago)
    await evaluateRecentCampaignsROI();
    
    // Apply learning from past results
    await applyLearning();

    await logAction("daily_engine", "Engine diária executada com sucesso", "schedule");
    
    // Send summary email
    await sendSummaryEmail(metrics, alerts, strategy);
    
    return { success: true, metrics, alerts, strategy };
  } catch (error) {
    console.error("❌ PNSP Agency Daily Engine Error:", error);
    await logAction("daily_engine", `Falha na engine diária: ${error instanceof Error ? error.message : "Erro desconhecido"}`, "schedule", {}, "falhou");
    return { success: false, error };
  }
}

// ─── CORE ENGINE FUNCTIONS ───────────────────────────────────────────────────

async function collectPlatformMetrics() {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const todayStr = new Date().toISOString().split("T")[0];
  
  // Basic platform counts
  const [userCount] = await db.select({ count: count() }).from(users);
  const [profileCount] = await db.select({ count: count() }).from(profiles);
  const [bookingStats] = await db.select({ 
    count: count(), 
    revenue: sum(bookings.finalValue) 
  }).from(bookings).where(eq(bookings.status, "aceito"));

  // Calculate MRR (simplified as 30d revenue)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [mrrStats] = await db.select({
    revenue: sum(bookings.finalValue)
  }).from(bookings)
  .where(and(eq(bookings.status, "aceito"), gte(bookings.updatedAt, thirtyDaysAgo)));

  // Upsert metrics for today
  const metrics = {
    date: todayStr,
    mau: 0, // Would need tracking table
    newRegistrations: 0, // Filter profiles by today
    bookingsCount: bookingStats.count,
    bookingsRevenue: bookingStats.revenue || "0",
    contractsRevenue: "0",
    totalRevenue: bookingStats.revenue || "0",
    cac: "0",
    ltv: "0",
    mrr: mrrStats.revenue || "0",
    churn: "0",
    createdAt: new Date()
  };

  await db.insert(agencyPlatformMetrics).values(metrics).onConflictDoUpdate({
    target: agencyPlatformMetrics.date,
    set: metrics
  });

  return metrics;
}

async function calculateEcosystemScores() {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Query cities and their profile counts
  const cityStats = await db.execute(sql`
    SELECT 
      city, 
      COUNT(*) as profile_count,
      (SELECT COUNT(*) FROM opportunities WHERE city = profiles.city AND "isActive" = true) as opportunity_count,
      (SELECT COUNT(*) FROM bookings WHERE "eventCity" = profiles.city AND status = 'aceito' AND "updatedAt" > NOW() - INTERVAL '30 days') as activity_count
    FROM profiles 
    WHERE city IS NOT NULL AND "isActive" = true
    GROUP BY city
  `);

  const scores: any[] = [];
  const gaps: any[] = [];

  for (const row of (cityStats.rows as any)) {
    const oferta = Number(row.profile_count);
    const demanda = Number(row.opportunity_count);
    const atividade = Number(row.activity_count);

    // Score formula: Demand vs Supply (40%) + Recent Activity (60%)
    const scoreVal = Math.min(100, (demanda / Math.max(oferta, 1)) * 40 + Math.min(atividade, 10) * 6);
    
    await db.insert(agencyEcosystemScores).values({
      scoreType: "por_regiao",
      entity: row.city,
      value: Math.round(scoreVal),
      trend: "estavel", // To calculate trend, would need previous record
      calculatedAt: new Date()
    });

    scores.push({ city: row.city, value: scoreVal });
    if (demanda > oferta * 3) {
      gaps.push({ city: row.city, demand: demanda, supply: oferta });
    }
  }

  return { scores, gaps };
}

async function detectAlerts(scores: any[], metrics: any) {
  const db = await getDb();
  if (!db) return [];

  const newAlerts = [];

  // 1. Regional Gaps
  for (const score of scores) {
    if (score.value > 80) {
      newAlerts.push({
        type: "gap_regional",
        severity: "critico",
        title: `Gap Crítico em ${score.city}`,
        message: `Alta demanda e baixa oferta detectada em ${score.city}. Score: ${score.value.toFixed(0)}`,
        metadata: { city: score.city, score: score.value }
      });
    }
  }

  // 2. Churn/CAC Alerts (Example placeholders)
  // if (metrics.churn > 5) ...
  
  // Deduplicate and save
  for (const alert of newAlerts) {
    const [exists] = await db.select().from(agencyAlerts)
      .where(and(eq(agencyAlerts.type, alert.type), eq(agencyAlerts.isRead, false)))
      .limit(1);

    if (!exists) {
      await db.insert(agencyAlerts).values(alert);
      if (alert.severity === "critico" || alert.severity === "urgente") {
        await sendEmail("composisamba@gmail.com", `🚨 ALERTA PNSP: ${alert.title}`, emailTemplate(`
          ${heading(alert.title)}
          ${p(alert.message)}
          ${p("Acesse o painel da agência para tomar providências.")}
        `));
      }
    }
  }

  return newAlerts;
}

async function generateCampaignStrategy(objective?: CampaignObjective, region?: string, budget?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Fallback if no specific objective/region provided
  const targetObjective = objective || "aquisicao";
  const targetRegion = region || "São Paulo";
  const targetBudget = budget?.toString() || "0";
  const tag = `camp_${Date.now()}_${targetRegion.toLowerCase().replace(/\s+/g, '_')}`;

  const [campaign] = await db.insert(agencyCampaigns).values({
    name: `Campanha Autônoma: ${targetObjective} em ${targetRegion}`,
    objective: targetObjective,
    status: "ativa",
    type: "email", // Primary type
    targetRegion,
    budget: targetBudget,
    triggerSource: "automatico",
    attributionTag: tag,
    startDate: new Date(),
    createdAt: new Date()
  }).returning();

  return campaign;
}

async function generateCampaignContents(campaignId: number, context: { objective: string, targetRegion: string | null, targetProfileType: string | null, attributionTag: string }) {
  const db = await getDb();
  if (!db) return;

  const platforms: Platform[] = ["email", "push", "whatsapp"];
  const link = `https://pnsp-platform.vercel.app/registro?ref=${context.attributionTag}`;

  for (const platform of platforms) {
    const title = "Oportunidade no Ecossistema do Samba";
    let body: string;

    if (platform === "email") {
      body = `Olá profissional do samba em ${context.targetRegion || 'sua região'}. A PNSP está crescendo e precisamos de você. Cadastre-se agora e faça parte da maior infraestrutura digital do nosso mercado. Link: ${link}`;
    } else if (platform === "whatsapp") {
      body = `A PNSP chegou em ${context.targetRegion || 'sua região'}! 🎵\n\nEstamos conectando o ecossistema profissional do samba. Não fique de fora: ${link}`;
    } else {
      body = `Nova oportunidade em ${context.targetRegion || 'sua região'}! Entre no ecossistema.`;
    }

    await db.insert(agencyContents).values({
      campaignId,
      type: "copy",
      platform,
      title,
      body,
      status: "rascunho", // Step 1: Manual approval in Week 1
      aiGenerated: false,
      createdAt: new Date()
    });
  }
}

// ─── PUBLISHING & RETRY ──────────────────────────────────────────────────────

export async function publishContent(contentId: number) {
  const db = await getDb();
  if (!db) return;

  const [content] = await db.select().from(agencyContents).where(eq(agencyContents.id, contentId)).limit(1);
  if (!content || content.status !== "aprovado") return;

  let success = false;
  let errorMsg = "";

  try {
    if (content.platform === "email") {
      // Find targets (e.g., inactive profiles for retention or waitlist for acquisition)
      // For now, let's use a placeholder target or specific logic
      await sendEmail("composisamba@gmail.com", content.title || "PNSP", emailTemplate(`
        ${heading(content.title || "PNSP")}
        ${p(content.body)}
      `));
      success = true;
    } else if (content.platform === "push") {
      // Logic to target relevant users
      success = true;
    } else if (content.platform === "whatsapp") {
      const result = await sendWhatsApp("11999999999", content.body);
      success = result.sent;
      errorMsg = result.reason || "";
    }

    if (success) {
      await db.update(agencyContents).set({ 
        status: "publicado", 
        publishedAt: new Date() 
      }).where(eq(agencyContents.id, contentId));
    } else {
      await db.update(agencyContents).set({ 
        status: "falhou", 
        lastError: errorMsg,
        retryCount: content.retryCount + 1
      }).where(eq(agencyContents.id, contentId));
    }
  } catch (err) {
    await db.update(agencyContents).set({ 
      status: "falhou", 
      lastError: err instanceof Error ? err.message : "Unknown",
      retryCount: content.retryCount + 1
    }).where(eq(agencyContents.id, contentId));
  }
}

// ─── EVALUATION & LEARNING ───────────────────────────────────────────────────

async function evaluateRecentCampaignsROI() {
  const db = await getDb();
  if (!db) return;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeCampaigns = await db.select().from(agencyCampaigns)
    .where(and(eq(agencyCampaigns.status, "ativa"), lte(agencyCampaigns.startDate, thirtyDaysAgo)));

  for (const campaign of activeCampaigns) {
    // 1. Count registrations with tag
    const [regCount] = await db.select({ count: count() }).from(profiles).where(eq(profiles.attributionTag, campaign.attributionTag));
    
    // 2. Count bookings revenue from these profiles
    // This requires more complex joining or tracking

    const roi = 150; // Placeholder ROI %

    await db.update(agencyCampaigns).set({
      metrics: {
        cadastros: regCount.count,
        roi: roi
      },
      roiScore: roi.toString()
    }).where(eq(agencyCampaigns.id, campaign.id));

    await db.insert(agencyLearningLog).values({
      campaignId: campaign.id,
      roiAchieved: roi.toString(),
      recommendedPctAdjustment: roi > 300 ? "2" : (roi < 50 ? "-2" : "0"),
      applied: false,
      createdAt: new Date()
    });
  }
}

async function applyLearning() {
  const db = await getDb();
  if (!db) return;

  const logs = await db.select().from(agencyLearningLog).where(eq(agencyLearningLog.applied, false));

  for (const log of logs) {
    if (!log.recommendedPctAdjustment || log.recommendedPctAdjustment === "0") continue;

    const rules = await db.select().from(agencyReinvestmentRules).where(eq(agencyReinvestmentRules.isActive, true));
    for (const rule of rules) {
      const currentPct = Number(rule.reinvestmentPct);
      const adjustment = Number(log.recommendedPctAdjustment);
      const newPct = Math.max(5, Math.min(30, currentPct + adjustment));

      await db.update(agencyReinvestmentRules).set({ reinvestmentPct: newPct.toString() }).where(eq(agencyReinvestmentRules.id, rule.id));
    }

    await db.update(agencyLearningLog).set({ applied: true }).where(eq(agencyLearningLog.id, log.id));
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function logAction(type: any, description: string, triggeredBy: string, payload: any = {}, status: any = "executado") {
  const db = await getDb();
  if (!db) return;
  await db.insert(agencyActions).values({
    type,
    description,
    triggeredBy,
    status,
    payload,
    executedAt: new Date()
  });
}

async function sendSummaryEmail(metrics: any, alerts: any[], strategy: any) {
  const html = emailTemplate(`
    ${heading("Resumo Diário PNSP Agency")}
    ${p(`Novos Cadastros: ${metrics.newRegistrations}`)}
    ${p(`Bookings Ativos: ${metrics.bookingsCount}`)}
    ${p(`Receita Total: R$${Number(metrics.totalRevenue).toFixed(2)}`)}
    <hr style="border:0;border-top:1px solid rgba(212,146,10,0.2);margin:16px 0;" />
    ${heading("Alertas")}
    ${alerts.length > 0 ? alerts.map((a: any) => p(`- [${a.severity}] ${a.title}`)).join("") : p("Sem alertas críticos.")}
    <hr style="border:0;border-top:1px solid rgba(212,146,10,0.2);margin:16px 0;" />
    ${heading("Próxima Estratégia")}
    ${p(`Objetivo: ${strategy.objective}`)}
    ${p(`Região Alvo: ${strategy.targetRegion}`)}
    ${btn("Ver Painel da Agência", "https://pnsp-platform.vercel.app/agencia")}
  `);

  await sendEmail("composisamba@gmail.com", "📊 PNSP Agency: Resumo Diário", html);
}

/**
 * Main entry point for the scheduler
 */
export function scheduleEngine() {
  console.log("🎭 Agência de Marketing Autônoma PNSP — engine iniciada");

  // Run daily at 08:00 BRT
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(8, 0, 0, 0);
  if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);

  const msToNext = nextRun.getTime() - now.getTime();
  setTimeout(() => {
    runDailyEngine();
    setInterval(runDailyEngine, 24 * 60 * 60 * 1000);
  }, msToNext);

  // Monitor every 30 mins
  setInterval(async () => {
    console.log("🔍 Running Real-Time Monitor...");
    // Check for failed contents to retry
    const db = await getDb();
    if (db) {
      const failed = await db.select().from(agencyContents).where(and(eq(agencyContents.status, "falhou"), lte(agencyContents.retryCount, 3)));
      for (const item of failed) {
        await publishContent(item.id);
      }
    }
  }, 30 * 60 * 1000);
}
