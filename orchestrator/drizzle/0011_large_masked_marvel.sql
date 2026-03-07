ALTER TABLE "signals" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "interview_date" timestamp;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "interviewee" text;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "webhook_key_id" text;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_webhook_key_id_webhook_keys_id_fk" FOREIGN KEY ("webhook_key_id") REFERENCES "public"."webhook_keys"("id") ON DELETE set null ON UPDATE no action;