ALTER TABLE `products` RENAME COLUMN "price" TO "purchase_price";--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN "stock" TO "selling_price";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
DROP INDEX "users_role_idx";--> statement-breakpoint
DROP INDEX "users_agency_idx";--> statement-breakpoint
DROP INDEX "users_active_idx";--> statement-breakpoint
DROP INDEX "agencies_owner_idx";--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "selling_price" TO "selling_price" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_agency_idx` ON `users` (`agency_id`);--> statement-breakpoint
CREATE INDEX `users_active_idx` ON `users` (`is_active`);--> statement-breakpoint
CREATE UNIQUE INDEX `agencies_owner_idx` ON `agencies` (`owner_id`);