import { TrackingType, ResistanceType } from './types';

export interface ProgramDayExercise {
    id: string; // UUID
    programDayId: string; // FK: ProgramDay.id
    exerciseId: string; // FK: Exercise.id
    trackingType: TrackingType;       // Set at creation, not overridable
    resistanceType: ResistanceType;   // Set at creation, not overridable
    sets: number;
    targetReps: number | null;        // null if TIME
    targetTimeSeconds: number | null; // null if REPS
    orderIndex: number;
}
