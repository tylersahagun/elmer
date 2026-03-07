CREATE TABLE "signal_personas" (
	"id" text PRIMARY KEY NOT NULL,
	"signal_id" text NOT NULL,
	"persona_id" text NOT NULL,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	"linked_by" text,
	CONSTRAINT "signal_personas_signal_id_persona_id_unique" UNIQUE("signal_id","persona_id")
);
--> statement-breakpoint
CREATE TABLE "signal_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"signal_id" text NOT NULL,
	"project_id" text NOT NULL,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	"linked_by" text,
	"link_reason" text,
	"confidence" real,
	CONSTRAINT "signal_projects_signal_id_project_id_unique" UNIQUE("signal_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "signals" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"verbatim" text NOT NULL,
	"interpretation" text,
	"severity" text,
	"frequency" text,
	"user_segment" text,
	"source" text NOT NULL,
	"source_ref" text,
	"source_metadata" jsonb,
	"status" text DEFAULT 'new' NOT NULL,
	"embedding" text,
	"ai_classification" jsonb,
	"inbox_item_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "signal_personas" ADD CONSTRAINT "signal_personas_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_personas" ADD CONSTRAINT "signal_personas_linked_by_users_id_fk" FOREIGN KEY ("linked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_projects" ADD CONSTRAINT "signal_projects_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_projects" ADD CONSTRAINT "signal_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_projects" ADD CONSTRAINT "signal_projects_linked_by_users_id_fk" FOREIGN KEY ("linked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_inbox_item_id_inbox_items_id_fk" FOREIGN KEY ("inbox_item_id") REFERENCES "public"."inbox_items"("id") ON DELETE set null ON UPDATE no action;