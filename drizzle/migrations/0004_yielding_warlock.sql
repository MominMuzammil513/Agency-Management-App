CREATE TABLE `stock` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`agency_id` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_unique` ON `stock` (`product_id`,`agency_id`);--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`stock_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`reason` text,
	`performed_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
