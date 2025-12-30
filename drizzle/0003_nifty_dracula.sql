CREATE INDEX `exercises_is_archived_idx` ON `exercises` (`is_archived`);--> statement-breakpoint
CREATE INDEX `exercises_name_idx` ON `exercises` (`name`);--> statement-breakpoint
CREATE INDEX `workout_sessions_status_idx` ON `workout_sessions` (`status`);--> statement-breakpoint
ALTER TABLE `programs` DROP COLUMN `color`;--> statement-breakpoint
ALTER TABLE `programs` DROP COLUMN `icon`;