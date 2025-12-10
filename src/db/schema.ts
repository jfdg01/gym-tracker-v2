import { sqliteTable, integer, text, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Exercise Library
export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    // Configuration
    tracking_type: text('tracking_type').$type<'reps' | 'time'>().notNull(), // "reps" or "time"
    resistance_type: text('resistance_type').$type<'weight' | 'difficulty'>().notNull(), // "weight" or "difficulty"
    // Targets
    sets: integer('sets').notNull(),
    max_reps: integer('max_reps'), // Trigger for progression if tracking >= current_reps
    max_time: integer('max_time'), // Trigger for progression if tracking >= current_time
    // Current Resistance
    current_weight: real('current_weight'),
    weight_increase_rate: real('weight_increase_rate'),
    difficulty_qualitative: text('difficulty_qualitative'),
    rest_time_seconds: integer('rest_time_seconds'),
});

// Program Structure
export const programs = sqliteTable('programs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
});

export const days = sqliteTable('days', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    is_rest_day: integer('is_rest_day', { mode: 'boolean' }).notNull(),
    order_index: integer('order_index').notNull(),
});

export const day_exercises = sqliteTable('day_exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    day_id: integer('day_id').references(() => days.id, { onDelete: 'cascade' }),
    exercise_id: integer('exercise_id').references(() => exercises.id, { onDelete: 'cascade' }),
    order_index: integer('order_index').notNull(),
});

// User Data
export const user_settings = sqliteTable('user_settings', {
    id: integer('id').primaryKey(),
    language: text('language'),
    name: text('name'),
});

export const user_programs = sqliteTable('user_programs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    last_completed_day_id: integer('last_completed_day_id').references(() => days.id),
    is_active: integer('is_active', { mode: 'boolean' }).notNull(),
});

export const workout_logs = sqliteTable('workout_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    day_id: integer('day_id').references(() => days.id),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    completed_at: integer('completed_at', { mode: 'timestamp' }),
});

export const workout_set_logs = sqliteTable('workout_set_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workout_log_id: integer('workout_log_id').references(() => workout_logs.id, { onDelete: 'cascade' }).notNull(),
    exercise_id: integer('exercise_id').references(() => exercises.id).notNull(),
    set_number: integer('set_number').notNull(),
    reps: integer('reps'),
    time: integer('time'),
    weight: real('weight'),
    difficulty_qualitative: text('difficulty_qualitative'),
    is_skipped: integer('is_skipped', { mode: 'boolean' }).default(false).notNull(),
});
