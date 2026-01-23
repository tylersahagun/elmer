CREATE TABLE "integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"platform" text NOT NULL,
	"name" text NOT NULL,
	"webhook_secret" text,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"slack_team_id" text,
	"slack_team_name" text,
	"slack_bot_user_id" text,
	"pylon_account_id" text,
	"is_active" boolean DEFAULT true,
	"config" jsonb,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;