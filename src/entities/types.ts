export enum TrackingType {
    REPS = 'REPS',
    TIME = 'TIME',
}

export enum ResistanceType {
    WEIGHT = 'WEIGHT',
    DIFFICULTY = 'DIFFICULTY',
}

export enum WorkoutStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ABANDONED = 'ABANDONED',
}

export interface ExerciseSnapshotItem {
    programDayExerciseId: string; // FK: ProgramDayExercise.id
    exerciseId: string; // FK: Exercise.id
    exerciseName: string;
    exerciseDescription: string | null;
    exerciseCategory: string | null;
    trackingType: TrackingType;
    resistanceType: ResistanceType;
    sets: number;
    targetReps: number | null;
    targetTimeSeconds: number | null;
    orderIndex: number;
}
