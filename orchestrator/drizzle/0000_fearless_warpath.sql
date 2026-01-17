CREATE TABLE `column_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`stage` text NOT NULL,
	`display_name` text NOT NULL,
	`order` integer NOT NULL,
	`color` text,
	`auto_trigger_jobs` text,
	`required_approvals` integer DEFAULT 0,
	`ai_iterations` integer DEFAULT 0,
	`human_in_loop` integer DEFAULT false,
	`enabled` integer DEFAULT true,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`file_path` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`workspace_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`input` text,
	`output` text,
	`error` text,
	`progress` real DEFAULT 0,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jury_evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`phase` text NOT NULL,
	`jury_size` integer NOT NULL,
	`approval_rate` real,
	`conditional_rate` real,
	`rejection_rate` real,
	`verdict` text,
	`top_concerns` text,
	`top_suggestions` text,
	`raw_results` text,
	`report_path` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linear_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`linear_project_id` text NOT NULL,
	`linear_team_id` text NOT NULL,
	`synced_at` integer,
	`metadata` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `memory_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`project_id` text,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`embedding` blob,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `project_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`stage` text NOT NULL,
	`entered_at` integer NOT NULL,
	`exited_at` integer,
	`triggered_by` text,
	`notes` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`stage` text DEFAULT 'inbox' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`priority` integer DEFAULT 0,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototypes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`storybook_path` text,
	`chromatic_url` text,
	`chromatic_build_id` text,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'building',
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`linear_id` text,
	`linear_identifier` text,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'backlog',
	`priority` integer,
	`prototype_component_link` text,
	`estimated_points` integer,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`github_repo` text,
	`context_path` text DEFAULT 'pm-workspace-docs/',
	`settings` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
