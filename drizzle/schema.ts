import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "owner"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── PROFILES (VITRINES) ─────────────────────────────────────────────────────
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  slug: varchar("slug", { length: 120 }).unique(),
  profileType: mysqlEnum("profileType", [
    "artista_solo","grupo_banda","comunidade_roda","produtor","estudio",
    "professor","loja","luthier","contratante","parceiro",
  ]).notNull(),
  displayName: varchar("displayName", { length: 200 }).notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  coverUrl: text("coverUrl"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  phone: varchar("phone", { length: 30 }),
  website: text("website"),
  instagramUrl: text("instagramUrl"),
  youtubeUrl: text("youtubeUrl"),
  spotifyUrl: text("spotifyUrl"),
  facebookUrl: text("facebookUrl"),
  tiktokUrl: text("tiktokUrl"),
  specialties: json("specialties").$type<string[]>(),
  instruments: json("instruments").$type<string[]>(),
  genres: json("genres").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  viewCount: int("viewCount").default(0),
  status: mysqlEnum("status", ["pending","active","suspended"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// ─── PORTFOLIO MEDIA ─────────────────────────────────────────────────────────
export const portfolioItems = mysqlTable("portfolio_items", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  mediaType: mysqlEnum("mediaType", ["image","video","audio"]).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;

// ─── OFFERINGS ────────────────────────────────────────────────────────────────
export const offerings = mysqlTable("offerings", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "show","aula","producao","instrumento_novo","instrumento_usado",
    "artesanato","acessorio","audiovisual","luthieria","estudio","servico","outro",
  ]).notNull(),
  priceType: mysqlEnum("priceType", ["fixo","sob_consulta","gratuito","a_combinar"]).default("a_combinar"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  imageUrl: text("imageUrl"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  tags: json("tags").$type<string[]>(),
  isPremium: boolean("isPremium").default(false),
  isActive: boolean("isActive").default(true),
  status: mysqlEnum("status", ["pending","active","rejected","expired"]).default("pending"),
  viewCount: int("viewCount").default(0),
  interestCount: int("interestCount").default(0),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offering = typeof offerings.$inferSelect;
export type InsertOffering = typeof offerings.$inferInsert;

// ─── OFFERING INTERESTS ───────────────────────────────────────────────────────
export const offeringInterests = mysqlTable("offering_interests", {
  id: int("id").autoincrement().primaryKey(),
  offeringId: int("offeringId").notNull(),
  userId: int("userId").notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending","contacted","closed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  profileId: int("profileId"),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "vaga_grupo","show","evento","projeto","aula","producao","estudio","servico","outro",
  ]).notNull(),
  requiredType: mysqlEnum("requiredType", [
    "artista_solo","grupo_banda","comunidade_roda","produtor","estudio",
    "professor","loja","luthier","contratante","qualquer",
  ]).default("qualquer"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  budgetMin: decimal("budgetMin", { precision: 10, scale: 2 }),
  budgetMax: decimal("budgetMax", { precision: 10, scale: 2 }),
  tags: json("tags").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  status: mysqlEnum("status", ["pending","active","rejected","closed"]).default("pending"),
  applicationCount: int("applicationCount").default(0),
  viewCount: int("viewCount").default(0),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// ─── OPPORTUNITY APPLICATIONS ─────────────────────────────────────────────────
export const opportunityApplications = mysqlTable("opportunity_applications", {
  id: int("id").autoincrement().primaryKey(),
  opportunityId: int("opportunityId").notNull(),
  userId: int("userId").notNull(),
  profileId: int("profileId"),
  coverLetter: text("coverLetter"),
  status: mysqlEnum("status", ["pending","viewed","shortlisted","rejected","accepted"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OpportunityApplication = typeof opportunityApplications.$inferSelect;

// ─── STUDIOS ──────────────────────────────────────────────────────────────────
export const studios = mysqlTable("studios", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId"),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 120 }).unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  coverUrl: text("coverUrl"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  address: text("address"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  instagramUrl: text("instagramUrl"),
  studioType: mysqlEnum("studioType", ["gravacao","ensaio","ambos"]).default("ambos"),
  equipment: json("equipment").$type<string[]>(),
  amenities: json("amenities").$type<string[]>(),
  pricePerHour: decimal("pricePerHour", { precision: 10, scale: 2 }),
  pricePerDay: decimal("pricePerDay", { precision: 10, scale: 2 }),
  capacity: int("capacity"),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  status: mysqlEnum("status", ["pending","active","suspended"]).default("active"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Studio = typeof studios.$inferSelect;
export type InsertStudio = typeof studios.$inferInsert;

// ─── STUDIO BOOKINGS ──────────────────────────────────────────────────────────
export const studioBookings = mysqlTable("studio_bookings", {
  id: int("id").autoincrement().primaryKey(),
  studioId: int("studioId").notNull(),
  userId: int("userId").notNull(),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt").notNull(),
  totalHours: decimal("totalHours", { precision: 5, scale: 2 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending","confirmed","cancelled","completed"]).default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 200 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudioBooking = typeof studioBookings.$inferSelect;

// ─── ACADEMY CONTENT ──────────────────────────────────────────────────────────
export const academyContent = mysqlTable("academy_content", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId"),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  contentType: mysqlEnum("contentType", ["artigo","video","tutorial","curso","podcast"]).notNull(),
  category: mysqlEnum("category", [
    "historia","tecnica","instrumentos","composicao","producao","carreira","negocios","cultura",
  ]).notNull(),
  level: mysqlEnum("level", ["iniciante","intermediario","avancado"]).default("iniciante"),
  thumbnailUrl: text("thumbnailUrl"),
  videoUrl: text("videoUrl"),
  duration: int("duration"),
  isPremium: boolean("isPremium").default(false),
  price: decimal("price", { precision: 10, scale: 2 }),
  tags: json("tags").$type<string[]>(),
  isPublished: boolean("isPublished").default(false),
  viewCount: int("viewCount").default(0),
  likeCount: int("likeCount").default(0),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AcademyContent = typeof academyContent.$inferSelect;
export type InsertAcademyContent = typeof academyContent.$inferInsert;

// ─── ACADEMY PURCHASES ────────────────────────────────────────────────────────
export const academyPurchases = mysqlTable("academy_purchases", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  userId: int("userId").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 200 }),
  status: mysqlEnum("status", ["pending","completed","refunded"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── ADMIN LOGS ───────────────────────────────────────────────────────────────
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;

// ─── PLATFORM METRICS ─────────────────────────────────────────────────────────
export const platformMetrics = mysqlTable("platform_metrics", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(),
  totalUsers: int("totalUsers").default(0),
  newUsers: int("newUsers").default(0),
  totalProfiles: int("totalProfiles").default(0),
  totalOfferings: int("totalOfferings").default(0),
  totalOpportunities: int("totalOpportunities").default(0),
  totalApplications: int("totalApplications").default(0),
  totalBookings: int("totalBookings").default(0),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0"),
  activeUsers: int("activeUsers").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FINANCIAL RECORDS ────────────────────────────────────────────────────────
export const financialRecords = mysqlTable("financial_records", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["receita","custo"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  referenceId: varchar("referenceId", { length: 200 }),
  referenceType: varchar("referenceType", { length: 50 }),
  isProjected: boolean("isProjected").default(false),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  link: text("link"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── GENERATED IMAGES ────────────────────────────────────────────────────────
export const generatedImages = mysqlTable("generated_images", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("imageUrl").notNull(),
  purpose: mysqlEnum("purpose", ["perfil","oferta","evento","banner","outro"]).default("outro"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["basico","profissional","premium"]).default("basico"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 200 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 200 }),
  status: mysqlEnum("status", ["active","cancelled","past_due","trialing"]).default("active"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
