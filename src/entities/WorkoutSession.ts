import { WorkoutStatus, ExerciseSnapshotItem } from './types';

export interface WorkoutSession {
    id: string; // UUID
    programDayId: string | null; // FK: ProgramDay.id, Nullable; SET NULL on delete. Used for context in active sessions.
    programNameSnapshot: string | null; // Captured at start time for history preservation
    dayNameSnapshot: string | null;     // Captured at start time for history preservation
    exercisesSnapshot: ExerciseSnapshotItem[] | null; // Source of truth for history and active session state (swaps/order)
    restTimerTargetEndTime: string | null; // ISO 8601 UTC. Persisted for app-kill/resume robustness.
    startedAt: string;
    completedAt: string | null;
    status: WorkoutStatus;
}
