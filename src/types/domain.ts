export enum TrackingType {
    REPS = 'Reps',
    TIME = 'Time',
}

export enum ResistanceType {
    WEIGHT = 'Weight',
    DIFFICULTY = 'Difficulty',
}

export enum WorkoutStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ABANDONED = 'ABANDONED',
}

export interface Exercise {
    id: string; // UUID
    name: string;
    description: string | null;
    category: string | null;
    defaultTrackingType: TrackingType;
    defaultResistanceType: ResistanceType;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseSettings {
    id: string; // UUID
    exerciseId: string;
    // Weight-based
    currentWeight: number | null;
    weightIncreaseFactor: number | null;
    // Difficulty-based (user-managed ordered list)
    /** Stored as JSON string in DB; Repository layer handles parse/stringify */
    difficultyLevels: string[]; // e.g., ["Red", "Blue", "Green"]
    currentDifficultyLevel: string | null; // Value-based for stability
    restTimeSeconds: number | null;
    updatedAt: string;
}

export interface Program {
    id: string; // UUID
    name: string;
    description: string | null;
    lastCompletedDayId: string | null; // null = never started
    createdAt: string;
    updatedAt: string;
}

export interface ProgramDay {
    id: string; // UUID
    programId: string;
    name: string;
    orderIndex: number;
    isRestDay: boolean;
}

export interface ProgramDayExercise {
    id: string; // UUID
    programDayId: string;
    exerciseId: string;
    trackingType: TrackingType;       // Set at creation, not overridable
    resistanceType: ResistanceType;   // Set at creation, not overridable
    sets: number;
    targetReps: number | null;        // null if TIME
    targetTimeSeconds: number | null; // null if REPS
    orderIndex: number;
}

export interface WorkoutSession {
    id: string; // UUID
    programDayId: string | null; // Nullable; SET NULL on delete. Used for context in active sessions.
    programNameSnapshot: string | null; // Captured at start time for history preservation
    dayNameSnapshot: string | null;     // Captured at start time for history preservation
    exercisesSnapshot: ExerciseSnapshotItem[] | null; // Source of truth for history and active session state (swaps/order)
    restTimerTargetEndTime: string | null; // ISO 8601 UTC. Persisted for app-kill/resume robustness.
    startedAt: string;
    completedAt: string | null;
    isRestDay: boolean;
    status: WorkoutStatus;
}

/** Represents a single exercise entry in the exercises_snapshot JSON array */
export interface ExerciseSnapshotItem {
    programDayExerciseId: string; // Reference to original ProgramDayExercise (for traceability)
    exerciseId: string;           // Denormalized for history queries when original is deleted
    exerciseName: string;         // Snapshot is source of truth for history display
    exerciseDescription: string | null;
    exerciseCategory: string | null; // Denormalized for history filtering/display
    trackingType: TrackingType;
    resistanceType: ResistanceType;
    sets: number;
    targetReps: number | null;
    targetTimeSeconds: number | null;
    orderIndex: number;           // Captures order at snapshot time (including swaps)
    suggestedWeight?: number | null;
    suggestedDifficulty?: string | null;
    difficultyLevels?: string[] | null;
    restTimeSeconds?: number | null;
    result?: {
        progressed: boolean;
        newWeight?: number;
        newDifficulty?: string;
        isMaxLevel?: boolean;
    };
}

export interface WorkoutSet {
    id: string; // UUID
    workoutSessionId: string;
    exerciseId: string;
    setNumber: number;
    weight: number | null;
    difficulty: string | null; // Captured value at time of logging
    reps: number | null;
    timeSeconds: number | null;
    skipped: boolean;
    createdAt: string;
}
