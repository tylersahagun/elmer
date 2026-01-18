CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`project_id` text,
	`job_id` text,
	`type` text NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'unread' NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`action_type` text,
	`action_label` text,
	`action_url` text,
	`action_data` text,
	`metadata` text,
	`read_at` integer,
	`actioned_at` integer,
	`created_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `notifications_workspace_idx` ON `notifications` (`workspace_id`);
--> statement-breakpoint
CREATE INDEX `notifications_status_idx` ON `notifications` (`status`);
--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);
--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);
