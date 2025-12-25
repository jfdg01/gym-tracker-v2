export interface WorkoutSet {
    id: string; // UUID
    workoutSessionId: string; // FK: WorkoutSession.id
    exerciseId: string; // FK: Exercise.id
    setNumber: number;
    weight: number | null;
    difficulty: string | null; // Captured value at time of logging
    reps: number | null;
    timeSeconds: number | null;
    skipped: boolean;
    createdAt: string;
}
