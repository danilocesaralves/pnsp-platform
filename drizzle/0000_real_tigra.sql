CREATE TYPE "public"."academy_category" AS ENUM('historia', 'tecnica', 'instrumentos', 'composicao', 'producao', 'carreira', 'negocios', 'cultura');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'viewed', 'shortlisted', 'rejected', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('artigo', 'video', 'tutorial', 'curso', 'podcast');--> statement-breakpoint
CREATE TYPE "public"."financial_type" AS ENUM('receita', 'custo');--> statement-breakpoint
CREATE TYPE "public"."image_purpose" AS ENUM('perfil', 'oferta', 'evento', 'banner', 'outro');--> statement-breakpoint
CREATE TYPE "public"."interest_status" AS ENUM('pending', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."level" AS ENUM('iniciante', 'intermediario', 'avancado');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."offering_category" AS ENUM('show', 'aula', 'producao', 'instrumento_novo', 'instrumento_usado', 'artesanato', 'acessorio', 'audiovisual', 'luthieria', 'estudio', 'servico', 'outro');--> statement-breakpoint
CREATE TYPE "public"."offering_status" AS ENUM('pending', 'active', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."opportunity_category" AS ENUM('vaga_grupo', 'show', 'evento', 'projeto', 'aula', 'producao', 'estudio', 'servico', 'outro');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('pending', 'active', 'rejected', 'closed');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('fixo', 'sob_consulta', 'gratuito', 'a_combinar');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."profile_type" AS ENUM('artista_solo', 'grupo_banda', 'comunidade_roda', 'produtor', 'estudio', 'professor', 'loja', 'luthier', 'contratante', 'parceiro');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'completed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."required_type" AS ENUM('artista_solo', 'grupo_banda', 'comunidade_roda', 'produtor', 'estudio', 'professor', 'loja', 'luthier', 'contratante', 'qualquer');--> statement-breakpoint
CREATE TYPE "public"."studio_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."studio_type" AS ENUM('gravacao', 'ensaio', 'ambos');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('basico', 'profissional', 'premium');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'past_due', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'owner');--> statement-breakpoint
CREATE TABLE "academy_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"authorId" integer,
	"title" varchar(300) NOT NULL,
	"slug" varchar(200),
	"excerpt" text,
	"content" text,
	"contentType" "content_type" NOT NULL,
	"category" "academy_category" NOT NULL,
	"level" "level" DEFAULT 'iniciante',
	"thumbnailUrl" text,
	"videoUrl" text,
	"duration" integer,
	"isPremium" boolean DEFAULT false,
	"price" numeric(10, 2),
	"tags" jsonb,
	"isPublished" boolean DEFAULT false,
	"viewCount" integer DEFAULT 0,
	"likeCount" integer DEFAULT 0,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academy_content_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "academy_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"contentId" integer NOT NULL,
	"userId" integer NOT NULL,
	"price" numeric(10, 2),
	"stripePaymentIntentId" varchar(200),
	"status" "purchase_status" DEFAULT 'pending',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"adminId" integer NOT NULL,
	"action" varchar(100) NOT NULL,
	"entityType" varchar(50),
	"entityId" integer,
	"details" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "financial_type" NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL',
	"referenceId" varchar(200),
	"referenceType" varchar(50),
	"isProjected" boolean DEFAULT false,
	"recordedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"prompt" text NOT NULL,
	"imageUrl" text NOT NULL,
	"purpose" "image_purpose" DEFAULT 'outro',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text,
	"link" text,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offering_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"offeringId" integer NOT NULL,
	"userId" integer NOT NULL,
	"message" text,
	"status" "interest_status" DEFAULT 'pending',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offerings" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text,
	"category" "offering_category" NOT NULL,
	"priceType" "price_type" DEFAULT 'a_combinar',
	"price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'BRL',
	"imageUrl" text,
	"city" varchar(100),
	"state" varchar(2),
	"tags" jsonb,
	"isPremium" boolean DEFAULT false,
	"isActive" boolean DEFAULT true,
	"status" "offering_status" DEFAULT 'pending',
	"viewCount" integer DEFAULT 0,
	"leadCount" integer DEFAULT 0,
	"interestCount" integer DEFAULT 0,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"profileId" integer,
	"title" varchar(300) NOT NULL,
	"description" text,
	"category" "opportunity_category" NOT NULL,
	"requiredType" "required_type" DEFAULT 'qualquer',
	"city" varchar(100),
	"state" varchar(2),
	"budgetMin" numeric(10, 2),
	"budgetMax" numeric(10, 2),
	"tags" jsonb,
	"isActive" boolean DEFAULT true,
	"status" "opportunity_status" DEFAULT 'pending',
	"applicationCount" integer DEFAULT 0,
	"viewCount" integer DEFAULT 0,
	"deadline" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunityId" integer NOT NULL,
	"userId" integer NOT NULL,
	"profileId" integer,
	"coverLetter" text,
	"status" "application_status" DEFAULT 'pending',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applications_opportunity_profile_uniq" UNIQUE("opportunityId","profileId")
);
--> statement-breakpoint
CREATE TABLE "platform_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"totalUsers" integer DEFAULT 0,
	"newUsers" integer DEFAULT 0,
	"totalProfiles" integer DEFAULT 0,
	"totalOfferings" integer DEFAULT 0,
	"totalOpportunities" integer DEFAULT 0,
	"totalApplications" integer DEFAULT 0,
	"totalBookings" integer DEFAULT 0,
	"totalRevenue" numeric(12, 2) DEFAULT '0',
	"activeUsers" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer NOT NULL,
	"mediaType" "media_type" NOT NULL,
	"url" text NOT NULL,
	"thumbnailUrl" text,
	"title" varchar(200),
	"description" text,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"slug" varchar(120),
	"profileType" "profile_type" NOT NULL,
	"displayName" varchar(200) NOT NULL,
	"bio" text,
	"avatarUrl" text,
	"coverUrl" text,
	"city" varchar(100),
	"state" varchar(2),
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"geocoded" boolean DEFAULT false,
	"phone" varchar(30),
	"website" text,
	"instagramUrl" text,
	"youtubeUrl" text,
	"spotifyUrl" text,
	"facebookUrl" text,
	"tiktokUrl" text,
	"specialties" jsonb,
	"instruments" jsonb,
	"genres" jsonb,
	"tags" jsonb,
	"isVerified" boolean DEFAULT false,
	"isActive" boolean DEFAULT true,
	"isFeatured" boolean DEFAULT false,
	"viewCount" integer DEFAULT 0,
	"status" "profile_status" DEFAULT 'active',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "studio_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"studioId" integer NOT NULL,
	"userId" integer NOT NULL,
	"startAt" timestamp NOT NULL,
	"endAt" timestamp NOT NULL,
	"totalHours" numeric(5, 2),
	"totalPrice" numeric(10, 2),
	"notes" text,
	"status" "booking_status" DEFAULT 'pending',
	"stripePaymentIntentId" varchar(200),
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studios" (
	"id" serial PRIMARY KEY NOT NULL,
	"profileId" integer,
	"userId" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(120),
	"description" text,
	"imageUrl" text,
	"coverUrl" text,
	"city" varchar(100),
	"state" varchar(2),
	"address" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"phone" varchar(30),
	"email" varchar(320),
	"website" text,
	"instagramUrl" text,
	"studioType" "studio_type" DEFAULT 'ambos',
	"equipment" jsonb,
	"amenities" jsonb,
	"pricePerHour" numeric(10, 2),
	"pricePerDay" numeric(10, 2),
	"capacity" integer,
	"isVerified" boolean DEFAULT false,
	"isActive" boolean DEFAULT true,
	"status" "studio_status" DEFAULT 'active',
	"rating" numeric(3, 2) DEFAULT '0',
	"reviewCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "studios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"plan" "subscription_plan" DEFAULT 'basico',
	"stripeSubscriptionId" varchar(200),
	"stripeCustomerId" varchar(200),
	"status" "subscription_status" DEFAULT 'active',
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "offerings_category_active_idx" ON "offerings" USING btree ("category","isActive");--> statement-breakpoint
CREATE INDEX "offerings_city_state_idx" ON "offerings" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "offerings_created_at_idx" ON "offerings" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "opportunities_category_active_idx" ON "opportunities" USING btree ("category","isActive");--> statement-breakpoint
CREATE INDEX "opportunities_state_idx" ON "opportunities" USING btree ("state");--> statement-breakpoint
CREATE INDEX "opportunities_created_at_idx" ON "opportunities" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "profiles_type_active_idx" ON "profiles" USING btree ("profileType","isActive");--> statement-breakpoint
CREATE INDEX "profiles_city_state_idx" ON "profiles" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "profiles_slug_idx" ON "profiles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "profiles_created_at_idx" ON "profiles" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "studios_city_state_idx" ON "studios" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "studios_slug_idx" ON "studios" USING btree ("slug");