CREATE TYPE "public"."booking_neg_status" AS ENUM('rascunho', 'proposta_enviada', 'contraproposta', 'aceito', 'recusado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."community_post_type" AS ENUM('texto', 'imagem', 'video', 'evento', 'oportunidade', 'conquista');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('rascunho', 'aguardando_assinatura', 'assinado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('show', 'producao', 'aula', 'parceria', 'patrocinio', 'fornecedor', 'outro');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('confirmado', 'pendente', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('show', 'ensaio', 'gravacao', 'reuniao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."marketing_campaign_status" AS ENUM('rascunho', 'ativa', 'pausada', 'finalizada');--> statement-breakpoint
CREATE TYPE "public"."marketing_content_status" AS ENUM('rascunho', 'agendado', 'publicado', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."marketing_content_type" AS ENUM('post', 'story', 'reels', 'video', 'artigo', 'email');--> statement-breakpoint
CREATE TYPE "public"."marketing_insight_priority" AS ENUM('alta', 'media', 'baixa');--> statement-breakpoint
CREATE TYPE "public"."marketing_insight_type" AS ENUM('oportunidade', 'alerta', 'sugestao', 'conquista');--> statement-breakpoint
CREATE TYPE "public"."marketing_objective" AS ENUM('awareness', 'engajamento', 'conversao', 'retencao');--> statement-breakpoint
CREATE TYPE "public"."marketing_platform" AS ENUM('instagram', 'facebook', 'youtube', 'tiktok', 'twitter', 'email', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."marketing_score_type" AS ENUM('perfil', 'conteudo', 'engajamento', 'alcance', 'conversao');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('show', 'gravacao', 'conquista', 'colaboracao', 'formacao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('pix', 'transferencia', 'dinheiro', 'outro');--> statement-breakpoint
CREATE TYPE "public"."payment_reg_status" AS ENUM('pendente', 'confirmado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."sponsor_status" AS ENUM('prospecto', 'proposta_enviada', 'em_negociacao', 'fechado', 'recusado');--> statement-breakpoint
CREATE TYPE "public"."agency_action_status" AS ENUM('executado', 'falhou', 'retry_pendente');--> statement-breakpoint
CREATE TYPE "public"."agency_action_type" AS ENUM('receita_acumulada', 'learning_applied', 'daily_engine', 'weekly_analysis', 'retry', 'booking', 'manual');--> statement-breakpoint
CREATE TYPE "public"."agency_alert_severity" AS ENUM('info', 'aviso', 'critico', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."agency_content_platform" AS ENUM('email', 'whatsapp', 'push');--> statement-breakpoint
CREATE TYPE "public"."agency_content_status" AS ENUM('rascunho', 'aprovado', 'agendado', 'publicado', 'falhou', 'falhou_definitivo');--> statement-breakpoint
CREATE TYPE "public"."agency_objective" AS ENUM('aquisicao', 'retencao', 'expansao_regional', 'reativacao', 'expansao');--> statement-breakpoint
CREATE TYPE "public"."agency_reinvestment_trigger" AS ENUM('booking_fechado', 'meta_receita', 'mensal', 'manual');--> statement-breakpoint
CREATE TYPE "public"."agency_score_type" AS ENUM('calor_geral', 'por_tipo', 'por_regiao', 'oportunidade', 'risco', 'tendencia');--> statement-breakpoint
CREATE TYPE "public"."agency_status" AS ENUM('rascunho', 'ativa', 'pausada', 'concluida');--> statement-breakpoint
CREATE TYPE "public"."agency_trend" AS ENUM('subindo', 'estavel', 'caindo');--> statement-breakpoint
CREATE TYPE "public"."agency_trigger_source" AS ENUM('manual', 'automatico', 'reinvestimento');--> statement-breakpoint
CREATE TYPE "public"."agency_type" AS ENUM('email', 'push', 'whatsapp', 'organica');--> statement-breakpoint
ALTER TYPE "public"."profile_type" ADD VALUE 'venue';--> statement-breakpoint
CREATE TABLE "academy_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"category" "academy_category" DEFAULT 'tecnica' NOT NULL,
	"level" "level" DEFAULT 'iniciante' NOT NULL,
	"coverUrl" text,
	"instructorName" varchar(200),
	"instructorAvatarUrl" text,
	"durationMinutes" integer,
	"price" integer DEFAULT 0 NOT NULL,
	"isFree" boolean DEFAULT true,
	"isPublished" boolean DEFAULT false,
	"enrollmentsCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academy_courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "academy_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"profileId" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"completedAt" timestamp,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academy_enrollment_unique" UNIQUE("courseId","profileId")
);
--> statement-breakpoint
CREATE TABLE "academy_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"videoUrl" text,
	"durationMinutes" integer,
	"isFree" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer NOT NULL,
	"action" varchar(100) NOT NULL,
	"actorProfileId" integer NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunityId" integer,
	"contractorProfileId" integer NOT NULL,
	"artistProfileId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"eventDate" varchar(10),
	"eventCity" varchar(100),
	"eventState" varchar(2),
	"proposedValue" integer,
	"counterValue" integer,
	"finalValue" integer,
	"status" "booking_neg_status" DEFAULT 'rascunho' NOT NULL,
	"notes" text,
	"contractorNotes" text,
	"artistNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversationId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"profileId" integer NOT NULL,
	"body" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"profileId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "community_likes_unique" UNIQUE("postId","profileId")
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"postType" "community_post_type" DEFAULT 'texto' NOT NULL,
	"title" varchar(200),
	"body" text NOT NULL,
	"imageUrl" text,
	"videoUrl" text,
	"tags" jsonb,
	"likesCount" integer DEFAULT 0 NOT NULL,
	"commentsCount" integer DEFAULT 0 NOT NULL,
	"isPinned" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" varchar(50) DEFAULT 'show' NOT NULL,
	"content" text NOT NULL,
	"isDefault" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer,
	"profileId" integer NOT NULL,
	"counterpartProfileId" integer,
	"title" varchar(200) NOT NULL,
	"type" "contract_type" DEFAULT 'show' NOT NULL,
	"templateId" integer,
	"content" text NOT NULL,
	"status" "contract_status" DEFAULT 'rascunho' NOT NULL,
	"signedAt" timestamp,
	"signerName" varchar(200),
	"signerDocument" varchar(50),
	"ipAddress" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"participantA" integer NOT NULL,
	"participantB" integer NOT NULL,
	"context" varchar(200),
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_participants_uniq" UNIQUE("participantA","participantB")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"type" "event_type" DEFAULT 'outro' NOT NULL,
	"date" varchar(10) NOT NULL,
	"startTime" varchar(5),
	"endTime" varchar(5),
	"location" text,
	"city" varchar(100),
	"state" varchar(2),
	"notes" text,
	"status" "event_status" DEFAULT 'pendente' NOT NULL,
	"isPublic" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"objective" "marketing_objective" DEFAULT 'awareness' NOT NULL,
	"status" "marketing_campaign_status" DEFAULT 'rascunho' NOT NULL,
	"startDate" varchar(10),
	"endDate" varchar(10),
	"budget" integer,
	"platforms" jsonb,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaignId" integer,
	"profileId" integer NOT NULL,
	"contentType" "marketing_content_type" DEFAULT 'post' NOT NULL,
	"platform" "marketing_platform" DEFAULT 'instagram' NOT NULL,
	"status" "marketing_content_status" DEFAULT 'rascunho' NOT NULL,
	"title" varchar(200),
	"body" text,
	"imageUrl" text,
	"hashtags" jsonb,
	"isAiGenerated" boolean DEFAULT false,
	"scheduledAt" timestamp,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"insightType" "marketing_insight_type" DEFAULT 'sugestao' NOT NULL,
	"priority" "marketing_insight_priority" DEFAULT 'media' NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"actionLabel" varchar(100),
	"actionUrl" varchar(300),
	"isRead" boolean DEFAULT false,
	"isDismissed" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"scoreType" "marketing_score_type" NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"calculatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"memoryType" "memory_type" DEFAULT 'outro' NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"date" varchar(10) NOT NULL,
	"location" varchar(200),
	"imageUrl" text,
	"tags" jsonb,
	"isPublic" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer,
	"payerId" integer NOT NULL,
	"payeeId" integer NOT NULL,
	"amount" integer NOT NULL,
	"method" "payment_method" DEFAULT 'pix' NOT NULL,
	"status" "payment_reg_status" DEFAULT 'pendente' NOT NULL,
	"reference" varchar(200),
	"notes" text,
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_sub_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewerId" integer NOT NULL,
	"reviewedId" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"context" varchar(100) DEFAULT 'Outro',
	"ownerReply" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_reviewer_reviewed_context_uniq" UNIQUE("reviewerId","reviewedId","context")
);
--> statement-breakpoint
CREATE TABLE "sponsor_deliverables" (
	"id" serial PRIMARY KEY NOT NULL,
	"sponsorId" integer NOT NULL,
	"description" varchar(300) NOT NULL,
	"isDone" boolean DEFAULT false,
	"dueDate" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"companyName" varchar(200) NOT NULL,
	"contactName" varchar(200),
	"contactEmail" varchar(200),
	"contactPhone" varchar(50),
	"website" varchar(300),
	"logoUrl" varchar(500),
	"proposalValue" integer,
	"finalValue" integer,
	"status" "sponsor_status" DEFAULT 'prospecto' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "agency_action_type" NOT NULL,
	"description" text NOT NULL,
	"triggeredBy" varchar(50) NOT NULL,
	"status" "agency_action_status" NOT NULL,
	"payload" jsonb,
	"retryCount" integer DEFAULT 0 NOT NULL,
	"executedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"severity" "agency_alert_severity" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"actionTaken" text,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"objective" "agency_objective" NOT NULL,
	"status" "agency_status" DEFAULT 'rascunho' NOT NULL,
	"type" "agency_type" NOT NULL,
	"targetRegion" varchar(100),
	"targetProfileType" varchar(50),
	"budget" numeric(12, 2),
	"spent" numeric(12, 2) DEFAULT '0',
	"metrics" jsonb,
	"roiScore" numeric(10, 2),
	"aiStrategy" text,
	"triggerSource" "agency_trigger_source" DEFAULT 'manual' NOT NULL,
	"attributionTag" varchar(100) NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agency_campaigns_attributionTag_unique" UNIQUE("attributionTag")
);
--> statement-breakpoint
CREATE TABLE "agency_contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaignId" integer,
	"type" varchar(50) NOT NULL,
	"platform" "agency_content_platform" NOT NULL,
	"title" varchar(255),
	"body" text NOT NULL,
	"mediaUrl" text,
	"status" "agency_content_status" DEFAULT 'rascunho' NOT NULL,
	"scheduledAt" timestamp,
	"publishedAt" timestamp,
	"retryCount" integer DEFAULT 0 NOT NULL,
	"lastError" text,
	"performance" jsonb,
	"aiGenerated" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_ecosystem_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"scoreType" "agency_score_type" NOT NULL,
	"entity" varchar(255) NOT NULL,
	"value" integer NOT NULL,
	"trend" "agency_trend" DEFAULT 'estavel' NOT NULL,
	"metadata" jsonb,
	"calculatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_learning_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaignId" integer,
	"metricsBefore" jsonb,
	"metricsAfter" jsonb,
	"roiAchieved" numeric(10, 2),
	"recommendedPctAdjustment" numeric(5, 2),
	"applied" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_platform_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"mau" integer DEFAULT 0,
	"newRegistrations" integer DEFAULT 0,
	"bookingsCount" integer DEFAULT 0,
	"bookingsRevenue" numeric(12, 2) DEFAULT '0',
	"contractsRevenue" numeric(12, 2) DEFAULT '0',
	"totalRevenue" numeric(12, 2) DEFAULT '0',
	"cac" numeric(10, 2) DEFAULT '0',
	"ltv" numeric(10, 2) DEFAULT '0',
	"mrr" numeric(12, 2) DEFAULT '0',
	"churn" numeric(5, 2) DEFAULT '0',
	"reinvestedAmount" numeric(12, 2) DEFAULT '0',
	"roiFromReinvestment" numeric(10, 2) DEFAULT '0',
	"topRegion" varchar(100),
	"topProfileType" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agency_platform_metrics_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "agency_reinvestment_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"triggerType" "agency_reinvestment_trigger" NOT NULL,
	"reinvestmentPct" numeric(5, 2) NOT NULL,
	"minimumThreshold" numeric(12, 2) DEFAULT '1000.00' NOT NULL,
	"accumulatedRevenue" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"targetObjective" "agency_objective" NOT NULL,
	"targetRegion" varchar(100),
	"isActive" boolean DEFAULT true NOT NULL,
	"totalExecuted" integer DEFAULT 0 NOT NULL,
	"totalInvested" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"lastExecutedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prelaunch_waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(30),
	"city" varchar(100),
	"profileType" varchar(50),
	"referredBy" integer,
	"referralCode" varchar(12) NOT NULL,
	"referralCount" integer DEFAULT 0 NOT NULL,
	"position" integer,
	"attributionTag" varchar(100),
	"isConverted" boolean DEFAULT false NOT NULL,
	"convertedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prelaunch_waitlist_email_unique" UNIQUE("email"),
	CONSTRAINT "prelaunch_waitlist_referralCode_unique" UNIQUE("referralCode")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "priceMin" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "priceMax" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "durationMin" varchar(20);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "durationMax" varchar(20);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "showTypes" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cities" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "attributionTag" text;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_courseId_academy_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."academy_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_lessons" ADD CONSTRAINT "academy_lessons_courseId_academy_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."academy_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_timeline" ADD CONSTRAINT "booking_timeline_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_timeline" ADD CONSTRAINT "booking_timeline_actorProfileId_profiles_id_fk" FOREIGN KEY ("actorProfileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_opportunityId_opportunities_id_fk" FOREIGN KEY ("opportunityId") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_contractorProfileId_profiles_id_fk" FOREIGN KEY ("contractorProfileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_artistProfileId_profiles_id_fk" FOREIGN KEY ("artistProfileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_profiles_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_postId_community_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_postId_community_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_counterpartProfileId_profiles_id_fk" FOREIGN KEY ("counterpartProfileId") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_templateId_contract_templates_id_fk" FOREIGN KEY ("templateId") REFERENCES "public"."contract_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participantA_profiles_id_fk" FOREIGN KEY ("participantA") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participantB_profiles_id_fk" FOREIGN KEY ("participantB") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_contents" ADD CONSTRAINT "marketing_contents_campaignId_marketing_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."marketing_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_contents" ADD CONSTRAINT "marketing_contents_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_insights" ADD CONSTRAINT "marketing_insights_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_scores" ADD CONSTRAINT "marketing_scores_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_payerId_profiles_id_fk" FOREIGN KEY ("payerId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_payeeId_profiles_id_fk" FOREIGN KEY ("payeeId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_profiles_id_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewedId_profiles_id_fk" FOREIGN KEY ("reviewedId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_deliverables" ADD CONSTRAINT "sponsor_deliverables_sponsorId_sponsors_id_fk" FOREIGN KEY ("sponsorId") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_profileId_profiles_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_contents" ADD CONSTRAINT "agency_contents_campaignId_agency_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."agency_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_learning_log" ADD CONSTRAINT "agency_learning_log_campaignId_agency_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."agency_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "academycourse_category_idx" ON "academy_courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "academylesson_course_idx" ON "academy_lessons" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "timeline_booking_idx" ON "booking_timeline" USING btree ("bookingId");--> statement-breakpoint
CREATE INDEX "bookings_contractor_idx" ON "bookings" USING btree ("contractorProfileId");--> statement-breakpoint
CREATE INDEX "bookings_artist_idx" ON "bookings" USING btree ("artistProfileId");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "messages_conv_idx" ON "chat_messages" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "messages_created_idx" ON "chat_messages" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "communitycomment_post_idx" ON "community_comments" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "communitypost_profile_idx" ON "community_posts" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "communitypost_created_idx" ON "community_posts" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "contracts_profile_idx" ON "contracts" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversations_a_idx" ON "conversations" USING btree ("participantA");--> statement-breakpoint
CREATE INDEX "conversations_b_idx" ON "conversations" USING btree ("participantB");--> statement-breakpoint
CREATE INDEX "events_profile_date_idx" ON "events" USING btree ("profileId","date");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "mktcampaign_profile_idx" ON "marketing_campaigns" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "mktcontent_profile_idx" ON "marketing_contents" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "mktcontent_campaign_idx" ON "marketing_contents" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "mktinsight_profile_idx" ON "marketing_insights" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "mktscore_profile_idx" ON "marketing_scores" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "memories_profile_idx" ON "memories" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "memories_date_idx" ON "memories" USING btree ("date");--> statement-breakpoint
CREATE INDEX "paymentrec_payer_idx" ON "payment_records" USING btree ("payerId");--> statement-breakpoint
CREATE INDEX "paymentrec_payee_idx" ON "payment_records" USING btree ("payeeId");--> statement-breakpoint
CREATE INDEX "push_sub_user_idx" ON "push_subscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "reviews_reviewed_idx" ON "reviews" USING btree ("reviewedId");--> statement-breakpoint
CREATE INDEX "reviews_reviewer_idx" ON "reviews" USING btree ("reviewerId");--> statement-breakpoint
CREATE INDEX "sponsors_profile_idx" ON "sponsors" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "sponsors_status_idx" ON "sponsors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "profiles_attribution_idx" ON "profiles" USING btree ("attributionTag");