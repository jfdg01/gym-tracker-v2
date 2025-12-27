CREATE TABLE `exercise_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`current_weight` integer,
	`weight_increase_factor` integer,
	`difficulty_levels` text,
	`current_difficulty_level` text,
	`rest_time_seconds` integer,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`default_tracking_type` text NOT NULL,
	`default_resistance_type` text NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `program_day_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`program_day_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`tracking_type` text NOT NULL,
	`resistance_type` text NOT NULL,
	`sets` integer NOT NULL,
	`target_reps` integer,
	`target_time_seconds` integer,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`program_day_id`) REFERENCES `program_days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `program_days` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`last_completed_day_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`program_day_id` text,
	`program_name_snapshot` text,
	`day_name_snapshot` text,
	`exercises_snapshot` text,
	`rest_timer_target_end_time` text,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	`status` text DEFAULT 'IN_PROGRESS' NOT NULL,
	FOREIGN KEY (`program_day_id`) REFERENCES `program_days`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `workout_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`weight` integer,
	`difficulty` text,
	`reps` integer,
	`time_seconds` integer,
	`skipped` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `session_id_idx` ON `workout_sets` (`workout_session_id`);--> statement-breakpoint
CREATE INDEX `exercise_id_idx` ON `workout_sets` (`exercise_id`);