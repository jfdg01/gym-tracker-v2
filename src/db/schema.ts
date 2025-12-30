import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const exercises = sqliteTable('exercises', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category'),
    defaultTrackingType: text('default_tracking_type').notNull(), // 'Reps', 'Time'
    defaultResistanceType: text('default_resistance_type').notNull(), // 'Weight', 'Difficulty'
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    isArchivedIdx: index('exercises_is_archived_idx').on(table.isArchived),
    nameIdx: index('exercises_name_idx').on(table.name),
}));

export const exerciseSettings = sqliteTable('exercise_settings', {
    id: text('id').primaryKey(),
    exerciseId: text('exercise_id').notNull().references(() => exercises.id),
    currentWeight: integer('current_weight').notNull().default(0), // Decimals handled as scaled integers or float
    weightIncreaseFactor: integer('weight_increase_factor'),
    difficultyLevels: text('difficulty_levels'), // JSON array
    currentDifficultyLevel: text('current_difficulty_level'),
    restTimeSeconds: integer('rest_time_seconds'),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const programs = sqliteTable('programs', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    lastCompletedDayId: text('last_completed_day_id'), // Set by app logic
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const programDays = sqliteTable('program_days', {
    id: text('id').primaryKey(),
    programId: text('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    previousName: text('previous_name'),
    orderIndex: integer('order_index').notNull(),
    isRestDay: integer('is_rest_day', { mode: 'boolean' }).notNull().default(false),
});

export const programDayExercises = sqliteTable('program_day_exercises', {
    id: text('id').primaryKey(),
    programDayId: text('program_day_id').notNull().references(() => programDays.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull().references(() => exercises.id),
    trackingType: text('tracking_type').notNull(), // 'Reps', 'Time'
    resistanceType: text('resistance_type').notNull(), // 'Weight', 'Difficulty'
    sets: integer('sets').notNull(),
    targetReps: integer('target_reps'),
    targetTimeSeconds: integer('target_time_seconds'),
    orderIndex: integer('order_index').notNull(),
});

export const workoutSessions = sqliteTable('workout_sessions', {
    id: text('id').primaryKey(),
    programDayId: text('program_day_id').references(() => programDays.id, { onDelete: 'set null' }),
    programNameSnapshot: text('program_name_snapshot'),
    dayNameSnapshot: text('day_name_snapshot'),
    exercisesSnapshot: text('exercises_snapshot'), // JSON array
    restTimerTargetEndTime: text('rest_timer_target_end_time'),
    startedAt: text('started_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    completedAt: text('completed_at'),
    isRestDay: integer('is_rest_day', { mode: 'boolean' }).notNull().default(false),
    status: text('status').notNull().default('IN_PROGRESS'),
}, (table) => ({
    statusIdx: index('workout_sessions_status_idx').on(table.status),
}));

export const workoutSets = sqliteTable('workout_sets', {
    id: text('id').primaryKey(),
    workoutSessionId: text('workout_session_id').notNull().references(() => workoutSessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(), // Denormalized or Soft-Link
    setNumber: integer('set_number').notNull(),
    weight: integer('weight'),
    difficulty: text('difficulty'),
    reps: integer('reps'),
    timeSeconds: integer('time_seconds'),
    skipped: integer('skipped', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    sessionIdIdx: index('session_id_idx').on(table.workoutSessionId),
    exerciseIdIdx: index('exercise_id_idx').on(table.exerciseId),
}));
