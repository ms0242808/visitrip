ALTER TABLE "trip" ADD COLUMN "is_private" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "vibes" text[] DEFAULT '{}'::text[] NOT NULL;