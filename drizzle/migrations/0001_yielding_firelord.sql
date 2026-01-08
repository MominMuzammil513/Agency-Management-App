PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agencies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_agencies`("id", "name", "owner_id", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "owner_id", "created_at", "updated_at", "deleted_at" FROM `agencies`;--> statement-breakpoint
DROP TABLE `agencies`;--> statement-breakpoint
ALTER TABLE `__new_agencies` RENAME TO `agencies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `agencies_owner_idx` ON `agencies` (`owner_id`);--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
DROP INDEX "users_role_idx";--> statement-breakpoint
DROP INDEX "users_agency_idx";--> statement-breakpoint
DROP INDEX "users_active_idx";--> statement-breakpoint
DROP INDEX "agencies_owner_idx";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "agency_id" TO "agency_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_agency_idx` ON `users` (`agency_id`);--> statement-breakpoint
CREATE INDEX `users_active_idx` ON `users` (`is_active`);