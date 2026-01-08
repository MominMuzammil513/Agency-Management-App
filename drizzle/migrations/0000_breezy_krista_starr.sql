CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`mobile` text NOT NULL,
	`alt_mobile` text,
	`role` text NOT NULL,
	`agency_id` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`must_reset_password` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_agency_idx` ON `users` (`agency_id`);--> statement-breakpoint
CREATE INDEX `users_active_idx` ON `users` (`is_active`);--> statement-breakpoint
CREATE TABLE `agencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`address` text,
	`owner_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `agencies_city_idx` ON `agencies` (`city`);--> statement-breakpoint
CREATE UNIQUE INDEX `agencies_owner_idx` ON `agencies` (`owner_id`);