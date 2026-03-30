import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// ─── AGENCY ENUMS ─────────────────────────────────────────────────────────────
export const agencyObjectiveEnum = pgEnum("agency_objective", [
  "aquisicao", "retencao", "expansao_regional", "reativacao", "expansao"
]);

export const agencyStatusEnum = pgEnum("agency_status", [
  "rascunho", "ativa", "pausada", "concluida"
]);

export const agencyTypeEnum = pgEnum("agency_type", [
  "email", "push", "whatsapp", "organica"
]);

export const agencyTriggerSourceEnum = pgEnum("agency_trigger_source", [
  "manual", "automatico", "reinvestimento"
]);

export const agencyContentPlatformEnum = pgEnum("agency_content_platform", [
  "email", "whatsapp", "push"
]);

export const agencyContentStatusEnum = pgEnum("agency_content_status", [
  "rascunho", "aprovado", "agendado", "publicado", "falhou", "falhou_definitivo"
]);

export const agencyScoreTypeEnum = pgEnum("agency_score_type", [
  "calor_geral", "por_tipo", "por_regiao", "oportunidade", "risco", "tendencia"
]);

export const agencyTrendEnum = pgEnum("agency_trend", [
  "subindo", "estavel", "caindo"
]);

export const agencyActionTypeEnum = pgEnum("agency_action_type", [
  "receita_acumulada", "learning_applied", "daily_engine", "weekly_analysis", "retry", "booking", "manual"
]);

export const agencyActionStatusEnum = pgEnum("agency_action_status", [
  "executado", "falhou", "retry_pendente"
]);

export const agencyAlertSeverityEnum = pgEnum("agency_alert_severity", [
  "info", "aviso", "critico", "urgente"
]);

export const agencyReinvestmentTriggerEnum = pgEnum("agency_reinvestment_trigger", [
  "booking_fechado", "meta_receita", "mensal", "manual"
]);

// ─── AGENCY TABLES ────────────────────────────────────────────────────────────

export const agencyCampaigns = pgTable("agency_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  objective: agencyObjectiveEnum("objective").notNull(),
  status: agencyStatusEnum("status").default("rascunho").notNull(),
  type: agencyTypeEnum("type").notNull(),
  targetRegion: varchar("targetRegion", { length: 100 }),
  targetProfileType: varchar("targetProfileType", { length: 50 }),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  spent: numeric("spent", { precision: 12, scale: 2 }).default("0"),
  metrics: jsonb("metrics").$type<{
    impressoes?: number;
    cliques?: number;
    cadastros?: number;
    bookings_gerados?: number;
    receita_atribuida?: number;
    roi?: number;
  }>(),
  roiScore: numeric("roiScore", { precision: 10, scale: 2 }),
  aiStrategy: text("aiStrategy"),
  triggerSource: agencyTriggerSourceEnum("triggerSource").default("manual").notNull(),
  attributionTag: varchar("attributionTag", { length: 100 }).unique().notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export const agencyContents = pgTable("agency_contents", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaignId").references(() => agencyCampaigns.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // email/whatsapp/push/copy/hashtags/roteiro
  platform: agencyContentPlatformEnum("platform").notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body").notNull(),
  mediaUrl: text("mediaUrl"),
  status: agencyContentStatusEnum("status").default("rascunho").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  retryCount: integer("retryCount").default(0).notNull(),
  lastError: text("lastError"),
  performance: jsonb("performance").$type<{
    entregues?: number;
    abertos?: number;
    cliques?: number;
    cadastros_atribuidos?: number;
  }>(),
  aiGenerated: boolean("aiGenerated").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agencyEcosystemScores = pgTable("agency_ecosystem_scores", {
  id: serial("id").primaryKey(),
  scoreType: agencyScoreTypeEnum("scoreType").notNull(),
  entity: varchar("entity", { length: 255 }).notNull(), // ex: "São Paulo", "artista_solo"
  value: integer("value").notNull(), // 0-100
  trend: agencyTrendEnum("trend").default("estavel").notNull(),
  metadata: jsonb("metadata"),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export const agencyActions = pgTable("agency_actions", {
  id: serial("id").primaryKey(),
  type: agencyActionTypeEnum("type").notNull(),
  description: text("description").notNull(),
  triggeredBy: varchar("triggeredBy", { length: 50 }).notNull(), // manual/automatico/booking/schedule/retry
  status: agencyActionStatusEnum("status").notNull(),
  payload: jsonb("payload"),
  retryCount: integer("retryCount").default(0).notNull(),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export const agencyAlerts = pgTable("agency_alerts", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  severity: agencyAlertSeverityEnum("severity").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  actionTaken: text("actionTaken"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agencyReinvestmentRules = pgTable("agency_reinvestment_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  triggerType: agencyReinvestmentTriggerEnum("triggerType").notNull(),
  reinvestmentPct: numeric("reinvestmentPct", { precision: 5, scale: 2 }).notNull(), // 10/15/20
  minimumThreshold: numeric("minimumThreshold", { precision: 12, scale: 2 }).default("1000.00").notNull(),
  accumulatedRevenue: numeric("accumulatedRevenue", { precision: 12, scale: 2 }).default("0.00").notNull(),
  targetObjective: agencyObjectiveEnum("targetObjective").notNull(),
  targetRegion: varchar("targetRegion", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  totalExecuted: integer("totalExecuted").default(0).notNull(),
  totalInvested: numeric("totalInvested", { precision: 12, scale: 2 }).default("0.00").notNull(),
  lastExecutedAt: timestamp("lastExecutedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agencyPlatformMetrics = pgTable("agency_platform_metrics", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).unique().notNull(), // YYYY-MM-DD
  mau: integer("mau").default(0),
  newRegistrations: integer("newRegistrations").default(0),
  bookingsCount: integer("bookingsCount").default(0),
  bookingsRevenue: numeric("bookingsRevenue", { precision: 12, scale: 2 }).default("0"),
  contractsRevenue: numeric("contractsRevenue", { precision: 12, scale: 2 }).default("0"),
  totalRevenue: numeric("totalRevenue", { precision: 12, scale: 2 }).default("0"),
  cac: numeric("cac", { precision: 10, scale: 2 }).default("0"),
  ltv: numeric("ltv", { precision: 10, scale: 2 }).default("0"),
  mrr: numeric("mrr", { precision: 12, scale: 2 }).default("0"),
  churn: numeric("churn", { precision: 5, scale: 2 }).default("0"),
  reinvestedAmount: numeric("reinvestedAmount", { precision: 12, scale: 2 }).default("0"),
  roiFromReinvestment: numeric("roiFromReinvestment", { precision: 10, scale: 2 }).default("0"),
  topRegion: varchar("topRegion", { length: 100 }),
  topProfileType: varchar("topProfileType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agencyLearningLog = pgTable("agency_learning_log", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaignId").references(() => agencyCampaigns.id, { onDelete: "set null" }),
  metricsBefore: jsonb("metricsBefore"),
  metricsAfter: jsonb("metricsAfter"),
  roiAchieved: numeric("roiAchieved", { precision: 10, scale: 2 }),
  recommendedPctAdjustment: numeric("recommendedPctAdjustment", { precision: 5, scale: 2 }),
  applied: boolean("applied").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const prelaunchWaitlist = pgTable("prelaunch_waitlist", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).unique().notNull(),
  phone: varchar("phone", { length: 30 }),
  city: varchar("city", { length: 100 }),
  profileType: varchar("profileType", { length: 50 }),
  referredBy: integer("referredBy"), // id from this table
  referralCode: varchar("referralCode", { length: 12 }).unique().notNull(),
  referralCount: integer("referralCount").default(0).notNull(),
  position: integer("position"),
  attributionTag: varchar("attributionTag", { length: 100 }),
  isConverted: boolean("isConverted").default(false).notNull(),
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
