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

// ─── ENUMS ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "owner"]);

export const profileTypeEnum = pgEnum("profile_type", [
  "artista_solo", "grupo_banda", "comunidade_roda", "produtor", "estudio",
  "professor", "loja", "luthier", "contratante", "parceiro", "venue",
]);

export const profileStatusEnum = pgEnum("profile_status", ["pending", "active", "suspended"]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "audio"]);

export const offeringCategoryEnum = pgEnum("offering_category", [
  "show", "aula", "producao", "instrumento_novo", "instrumento_usado",
  "artesanato", "acessorio", "audiovisual", "luthieria", "estudio", "servico", "outro",
]);

export const priceTypeEnum = pgEnum("price_type", ["fixo", "sob_consulta", "gratuito", "a_combinar"]);

export const offeringStatusEnum = pgEnum("offering_status", ["pending", "active", "rejected", "expired"]);

export const opportunityCategoryEnum = pgEnum("opportunity_category", [
  "vaga_grupo", "show", "evento", "projeto", "aula", "producao", "estudio", "servico", "outro",
]);

export const requiredTypeEnum = pgEnum("required_type", [
  "artista_solo", "grupo_banda", "comunidade_roda", "produtor", "estudio",
  "professor", "loja", "luthier", "contratante", "qualquer",
]);

export const opportunityStatusEnum = pgEnum("opportunity_status", ["pending", "active", "rejected", "closed"]);

export const applicationStatusEnum = pgEnum("application_status", [
  "pending", "viewed", "shortlisted", "rejected", "accepted",
]);

export const interestStatusEnum = pgEnum("interest_status", ["pending", "contacted", "closed"]);

export const studioTypeEnum = pgEnum("studio_type", ["gravacao", "ensaio", "ambos"]);

export const studioStatusEnum = pgEnum("studio_status", ["pending", "active", "suspended"]);

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);

export const contentTypeEnum = pgEnum("content_type", ["artigo", "video", "tutorial", "curso", "podcast"]);

export const academyCategoryEnum = pgEnum("academy_category", [
  "historia", "tecnica", "instrumentos", "composicao", "producao", "carreira", "negocios", "cultura",
]);

export const levelEnum = pgEnum("level", ["iniciante", "intermediario", "avancado"]);

export const purchaseStatusEnum = pgEnum("purchase_status", ["pending", "completed", "refunded"]);

export const financialTypeEnum = pgEnum("financial_type", ["receita", "custo"]);

export const imagePurposeEnum = pgEnum("image_purpose", ["perfil", "oferta", "evento", "banner", "outro"]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", ["basico", "profissional", "premium"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", "cancelled", "past_due", "trialing",
]);

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── BETTER-AUTH TABLES ───────────────────────────────────────────────────────

export const authUser = pgTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = pgTable("auth_account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const authVerification = pgTable("auth_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── PROFILES (VITRINES) ─────────────────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  slug: varchar("slug", { length: 120 }).unique(),
  profileType: profileTypeEnum("profileType").notNull(),
  displayName: varchar("displayName", { length: 200 }).notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  coverUrl: text("coverUrl"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  geocoded: boolean("geocoded").default(false),
  phone: varchar("phone", { length: 30 }),
  website: text("website"),
  instagramUrl: text("instagramUrl"),
  youtubeUrl: text("youtubeUrl"),
  spotifyUrl: text("spotifyUrl"),
  facebookUrl: text("facebookUrl"),
  tiktokUrl: text("tiktokUrl"),
  specialties: jsonb("specialties").$type<string[]>(),
  instruments: jsonb("instruments").$type<string[]>(),
  genres: jsonb("genres").$type<string[]>(),
  tags: jsonb("tags").$type<string[]>(),
  priceMin: integer("priceMin"),
  priceMax: integer("priceMax"),
  durationMin: varchar("durationMin", { length: 20 }),
  durationMax: varchar("durationMax", { length: 20 }),
  showTypes: jsonb("showTypes").$type<string[]>(),
  cities: text("cities"),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  viewCount: integer("viewCount").default(0),
  status: profileStatusEnum("status").default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("profiles_type_active_idx").on(t.profileType, t.isActive),
  index("profiles_city_state_idx").on(t.city, t.state),
  index("profiles_slug_idx").on(t.slug),
  index("profiles_created_at_idx").on(t.createdAt),
]);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// ─── PORTFOLIO MEDIA ─────────────────────────────────────────────────────────
export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull(),
  mediaType: mediaTypeEnum("mediaType").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;

// ─── OFFERINGS ────────────────────────────────────────────────────────────────
export const offerings = pgTable("offerings", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: offeringCategoryEnum("category").notNull(),
  priceType: priceTypeEnum("priceType").default("a_combinar"),
  price: numeric("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  imageUrl: text("imageUrl"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  tags: jsonb("tags").$type<string[]>(),
  isPremium: boolean("isPremium").default(false),
  isActive: boolean("isActive").default(true),
  status: offeringStatusEnum("status").default("pending"),
  viewCount: integer("viewCount").default(0),
  leadCount: integer("leadCount").default(0),
  interestCount: integer("interestCount").default(0),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("offerings_category_active_idx").on(t.category, t.isActive),
  index("offerings_city_state_idx").on(t.city, t.state),
  index("offerings_created_at_idx").on(t.createdAt),
]);

export type Offering = typeof offerings.$inferSelect;
export type InsertOffering = typeof offerings.$inferInsert;

// ─── OFFERING INTERESTS ───────────────────────────────────────────────────────
export const offeringInterests = pgTable("offering_interests", {
  id: serial("id").primaryKey(),
  offeringId: integer("offeringId").notNull(),
  userId: integer("userId").notNull(),
  message: text("message"),
  status: interestStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  profileId: integer("profileId"),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: opportunityCategoryEnum("category").notNull(),
  requiredType: requiredTypeEnum("requiredType").default("qualquer"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  budgetMin: numeric("budgetMin", { precision: 10, scale: 2 }),
  budgetMax: numeric("budgetMax", { precision: 10, scale: 2 }),
  tags: jsonb("tags").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  status: opportunityStatusEnum("status").default("pending"),
  applicationCount: integer("applicationCount").default(0),
  viewCount: integer("viewCount").default(0),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("opportunities_category_active_idx").on(t.category, t.isActive),
  index("opportunities_state_idx").on(t.state),
  index("opportunities_created_at_idx").on(t.createdAt),
]);

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// ─── OPPORTUNITY APPLICATIONS ─────────────────────────────────────────────────
export const opportunityApplications = pgTable("opportunity_applications", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunityId").notNull(),
  userId: integer("userId").notNull(),
  profileId: integer("profileId"),
  coverLetter: text("coverLetter"),
  status: applicationStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  unique("applications_opportunity_profile_uniq").on(t.opportunityId, t.profileId),
]);

export type OpportunityApplication = typeof opportunityApplications.$inferSelect;

// ─── STUDIOS ──────────────────────────────────────────────────────────────────
export const studios = pgTable("studios", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId"),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 120 }).unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  coverUrl: text("coverUrl"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  address: text("address"),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  instagramUrl: text("instagramUrl"),
  studioType: studioTypeEnum("studioType").default("ambos"),
  equipment: jsonb("equipment").$type<string[]>(),
  amenities: jsonb("amenities").$type<string[]>(),
  pricePerHour: numeric("pricePerHour", { precision: 10, scale: 2 }),
  pricePerDay: numeric("pricePerDay", { precision: 10, scale: 2 }),
  capacity: integer("capacity"),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  status: studioStatusEnum("status").default("active"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("studios_city_state_idx").on(t.city, t.state),
  index("studios_slug_idx").on(t.slug),
]);

export type Studio = typeof studios.$inferSelect;
export type InsertStudio = typeof studios.$inferInsert;

// ─── STUDIO BOOKINGS ──────────────────────────────────────────────────────────
export const studioBookings = pgTable("studio_bookings", {
  id: serial("id").primaryKey(),
  studioId: integer("studioId").notNull(),
  userId: integer("userId").notNull(),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt").notNull(),
  totalHours: numeric("totalHours", { precision: 5, scale: 2 }),
  totalPrice: numeric("totalPrice", { precision: 10, scale: 2 }),
  notes: text("notes"),
  status: bookingStatusEnum("status").default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 200 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type StudioBooking = typeof studioBookings.$inferSelect;

// ─── ACADEMY CONTENT ──────────────────────────────────────────────────────────
export const academyContent = pgTable("academy_content", {
  id: serial("id").primaryKey(),
  authorId: integer("authorId"),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  contentType: contentTypeEnum("contentType").notNull(),
  category: academyCategoryEnum("category").notNull(),
  level: levelEnum("level").default("iniciante"),
  thumbnailUrl: text("thumbnailUrl"),
  videoUrl: text("videoUrl"),
  duration: integer("duration"),
  isPremium: boolean("isPremium").default(false),
  price: numeric("price", { precision: 10, scale: 2 }),
  tags: jsonb("tags").$type<string[]>(),
  isPublished: boolean("isPublished").default(false),
  viewCount: integer("viewCount").default(0),
  likeCount: integer("likeCount").default(0),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type AcademyContent = typeof academyContent.$inferSelect;
export type InsertAcademyContent = typeof academyContent.$inferInsert;

// ─── ACADEMY PURCHASES ────────────────────────────────────────────────────────
export const academyPurchases = pgTable("academy_purchases", {
  id: serial("id").primaryKey(),
  contentId: integer("contentId").notNull(),
  userId: integer("userId").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 200 }),
  status: purchaseStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── ADMIN LOGS ───────────────────────────────────────────────────────────────
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: integer("entityId"),
  details: jsonb("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;

// ─── PLATFORM METRICS ─────────────────────────────────────────────────────────
export const platformMetrics = pgTable("platform_metrics", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull(),
  totalUsers: integer("totalUsers").default(0),
  newUsers: integer("newUsers").default(0),
  totalProfiles: integer("totalProfiles").default(0),
  totalOfferings: integer("totalOfferings").default(0),
  totalOpportunities: integer("totalOpportunities").default(0),
  totalApplications: integer("totalApplications").default(0),
  totalBookings: integer("totalBookings").default(0),
  totalRevenue: numeric("totalRevenue", { precision: 12, scale: 2 }).default("0"),
  activeUsers: integer("activeUsers").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FINANCIAL RECORDS ────────────────────────────────────────────────────────
export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  type: financialTypeEnum("type").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  referenceId: varchar("referenceId", { length: 200 }),
  referenceType: varchar("referenceType", { length: 50 }),
  isProjected: boolean("isProjected").default(false),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  link: text("link"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── GENERATED IMAGES ────────────────────────────────────────────────────────
export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("imageUrl").notNull(),
  purpose: imagePurposeEnum("purpose").default("outro"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  plan: subscriptionPlanEnum("plan").default("basico"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 200 }).unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 200 }),
  status: subscriptionStatusEnum("status").default("active"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewerId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  reviewedId: integer("reviewedId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  context: varchar("context", { length: 100 }).default("Outro"),
  ownerReply: text("ownerReply"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("reviews_reviewed_idx").on(t.reviewedId),
  index("reviews_reviewer_idx").on(t.reviewerId),
  unique("reviews_reviewer_reviewed_context_uniq").on(t.reviewerId, t.reviewedId, t.context),
]);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── EVENTS (AGENDA) ──────────────────────────────────────────────────────────
export const eventTypeEnum = pgEnum("event_type", ["show", "ensaio", "gravacao", "reuniao", "outro"]);
export const eventStatusEnum = pgEnum("event_status", ["confirmado", "pendente", "cancelado"]);

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  type: eventTypeEnum("type").notNull().default("outro"),
  date: varchar("date", { length: 10 }).notNull(),
  startTime: varchar("startTime", { length: 5 }),
  endTime: varchar("endTime", { length: 5 }),
  location: text("location"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  notes: text("notes"),
  status: eventStatusEnum("status").notNull().default("pendente"),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("events_profile_date_idx").on(t.profileId, t.date),
  index("events_date_idx").on(t.date),
]);

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── CONVERSATIONS ────────────────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  participantA: integer("participantA").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  participantB: integer("participantB").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  context: varchar("context", { length: 200 }),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("conversations_a_idx").on(t.participantA),
  index("conversations_b_idx").on(t.participantB),
  unique("conversations_participants_uniq").on(t.participantA, t.participantB),
]);

export type Conversation = typeof conversations.$inferSelect;

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: integer("senderId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("messages_conv_idx").on(t.conversationId),
  index("messages_created_idx").on(t.createdAt),
]);

export type ChatMessage = typeof chatMessages.$inferSelect;

// ─── BOOKINGS (NEGOCIAÇÃO) ────────────────────────────────────────────────────
export const bookingNegStatusEnum = pgEnum("booking_neg_status", [
  "rascunho", "proposta_enviada", "contraproposta", "aceito", "recusado", "cancelado",
]);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  opportunityId:       integer("opportunityId").references(() => opportunities.id, { onDelete: "set null" }),
  contractorProfileId: integer("contractorProfileId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  artistProfileId:     integer("artistProfileId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title:               varchar("title", { length: 200 }).notNull(),
  description:         text("description"),
  eventDate:           varchar("eventDate", { length: 10 }),
  eventCity:           varchar("eventCity", { length: 100 }),
  eventState:          varchar("eventState", { length: 2 }),
  proposedValue:       integer("proposedValue"),
  counterValue:        integer("counterValue"),
  finalValue:          integer("finalValue"),
  status:              bookingNegStatusEnum("status").notNull().default("rascunho"),
  notes:               text("notes"),
  contractorNotes:     text("contractorNotes"),
  artistNotes:         text("artistNotes"),
  createdAt:           timestamp("createdAt").defaultNow().notNull(),
  updatedAt:           timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("bookings_contractor_idx").on(t.contractorProfileId),
  index("bookings_artist_idx").on(t.artistProfileId),
  index("bookings_status_idx").on(t.status),
]);

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── BOOKING TIMELINE ─────────────────────────────────────────────────────────
export const bookingTimeline = pgTable("booking_timeline", {
  id:             serial("id").primaryKey(),
  bookingId:      integer("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  action:         varchar("action", { length: 100 }).notNull(),
  actorProfileId: integer("actorProfileId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  note:           text("note"),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("timeline_booking_idx").on(t.bookingId),
]);

export type BookingTimeline = typeof bookingTimeline.$inferSelect;


// ─── CONTRACT TEMPLATES ────────────────────────────────────────────────────────
export const contractTypeEnum = pgEnum("contract_type", [
  "show", "producao", "aula", "parceria", "patrocinio", "fornecedor", "outro",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "rascunho", "aguardando_assinatura", "assinado", "cancelado",
]);

export const contractTemplates = pgTable("contract_templates", {
  id:        serial("id").primaryKey(),
  name:      varchar("name", { length: 200 }).notNull(),
  type:      varchar("type", { length: 50 }).notNull().default("show"),
  content:   text("content").notNull(),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractTemplate = typeof contractTemplates.$inferSelect;

export const contracts = pgTable("contracts", {
  id:                   serial("id").primaryKey(),
  bookingId:            integer("bookingId").references(() => bookings.id, { onDelete: "set null" }),
  profileId:            integer("profileId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  counterpartProfileId: integer("counterpartProfileId").references(() => profiles.id, { onDelete: "set null" }),
  title:                varchar("title", { length: 200 }).notNull(),
  type:                 contractTypeEnum("type").notNull().default("show"),
  templateId:           integer("templateId").references(() => contractTemplates.id, { onDelete: "set null" }),
  content:              text("content").notNull(),
  status:               contractStatusEnum("status").notNull().default("rascunho"),
  signedAt:             timestamp("signedAt"),
  signerName:           varchar("signerName", { length: 200 }),
  signerDocument:       varchar("signerDocument", { length: 50 }),
  ipAddress:            varchar("ipAddress", { length: 50 }),
  createdAt:            timestamp("createdAt").defaultNow().notNull(),
  updatedAt:            timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("contracts_profile_idx").on(t.profileId),
  index("contracts_status_idx").on(t.status),
]);

export type Contract = typeof contracts.$inferSelect;

// ─── SPONSORS ─────────────────────────────────────────────────────────────────
export const sponsorStatusEnum = pgEnum("sponsor_status", [
  "prospecto", "proposta_enviada", "em_negociacao", "fechado", "recusado",
]);

export const sponsors = pgTable("sponsors", {
  id:             serial("id").primaryKey(),
  profileId:      integer("profileId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  companyName:    varchar("companyName", { length: 200 }).notNull(),
  contactName:    varchar("contactName", { length: 200 }),
  contactEmail:   varchar("contactEmail", { length: 200 }),
  contactPhone:   varchar("contactPhone", { length: 50 }),
  website:        varchar("website", { length: 300 }),
  logoUrl:        varchar("logoUrl", { length: 500 }),
  proposalValue:  integer("proposalValue"),
  finalValue:     integer("finalValue"),
  status:         sponsorStatusEnum("status").notNull().default("prospecto"),
  notes:          text("notes"),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index("sponsors_profile_idx").on(t.profileId),
  index("sponsors_status_idx").on(t.status),
]);

export type Sponsor = typeof sponsors.$inferSelect;

export const sponsorDeliverables = pgTable("sponsor_deliverables", {
  id:          serial("id").primaryKey(),
  sponsorId:   integer("sponsorId").notNull().references(() => sponsors.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 300 }).notNull(),
  isDone:      boolean("isDone").default(false),
  dueDate:     varchar("dueDate", { length: 10 }),
});

export type SponsorDeliverable = typeof sponsorDeliverables.$inferSelect;

// ─── MANUAL PAYMENTS ──────────────────────────────────────────────────────────
export const paymentMethodEnum = pgEnum("payment_method", [
  "pix", "transferencia", "dinheiro", "outro",
]);

export const paymentRegStatusEnum = pgEnum("payment_reg_status", [
  "pendente", "confirmado", "cancelado",
]);

export const paymentRecords = pgTable("payment_records", {
  id:        serial("id").primaryKey(),
  bookingId: integer("bookingId").references(() => bookings.id, { onDelete: "set null" }),
  payerId:   integer("payerId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  payeeId:   integer("payeeId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  amount:    integer("amount").notNull(),
  method:    paymentMethodEnum("method").notNull().default("pix"),
  status:    paymentRegStatusEnum("status").notNull().default("pendente"),
  reference: varchar("reference", { length: 200 }),
  notes:     text("notes"),
  paidAt:    timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("paymentrec_payer_idx").on(t.payerId),
  index("paymentrec_payee_idx").on(t.payeeId),
]);

export type PaymentRecord = typeof paymentRecords.$inferSelect;
