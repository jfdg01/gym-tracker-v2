// Type definitions for workout components

export interface WorkoutSet {
    id?: number;
    // workout_log_id: number; // Removed as implicit in ephemeral state
    // exercise_id: number;
    day_exercise_id: number | null;
    set_number: number;
    actual_reps: number | null;
    actual_weight: number | null;
    actual_time_seconds: number | null;
    actual_resistance_text: string | null;
    // target fields removed as they are now on the exercise level
    skipped: boolean;
    created_at?: Date;
}

export interface DayExerciseWithDetails {
    id: number;
    day_id: number;
    exercise_id: number;
    order_index: number;
    sets: number;
    max_reps: number | null;
    max_time: number | null;
    current_weight: number | null;
    weight_increase_rate: number | null;
    rest_time_seconds: number | null;
    name: string;
    description: string | null;
    tracking_type: string;
    resistance_type: string;
}

// Component prop interfaces

export interface ExerciseCardProps {
    exerciseName: string;
    targetSets: number;
    targetReps?: number | null;
    targetWeight?: number | null;
    sets: WorkoutSet[];
    onLogSet: (setNumber: number, reps: number, weight: number) => void;
}

export interface RestTimerProps {
    onAddSeconds: (seconds: number) => void;
    onSkip: () => void;
}

export interface SetInputRowProps {
    setNumber: number;
    targetReps?: number | null;
    targetWeight?: number | null;
    isCompleted: boolean;
    actualReps?: number;
    onComplete: (reps: number) => void;
    onUpdateReps?: (reps: number) => void;
}
