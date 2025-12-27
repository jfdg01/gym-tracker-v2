import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { ProgramRepository } from '../repositories/ProgramRepository';
import { ProgramDayRepository } from '../repositories/ProgramDayRepository';
import { ProgramDayExerciseRepository } from '../repositories/ProgramDayExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { WorkoutSession, WorkoutSet, ExerciseSnapshotItem } from '../types/domain';

export const WorkoutService = {
    /**
     * Checks if there's an active session.
     */
    getActiveSession: async (): Promise<WorkoutSession | null> => {
        return await WorkoutRepository.getActiveSession();
    },

    /**
     * Starts a new workout session for a given program day.
     * Captures snapshots of program, day, and exercises.
     */
    startWorkout: async (programDayId: string): Promise<WorkoutSession> => {
        const active = await WorkoutRepository.getActiveSession();
        if (active) {
            throw new Error('A session is already in progress.');
        }

        const day = await ProgramDayRepository.getById(programDayId);
        if (!day) throw new Error('Program day not found');

        const program = await ProgramRepository.getById(day.programId);
        if (!program) throw new Error('Program not found');

        const dayExercises = await ProgramDayExerciseRepository.getByProgramDayId(programDayId);

        const exercisesSnapshot: ExerciseSnapshotItem[] = await Promise.all(
            dayExercises.map(async (de) => {
                const ex = await ExerciseRepository.getById(de.exerciseId);
                return {
                    programDayExerciseId: de.id,
                    exerciseId: de.exerciseId,
                    exerciseName: ex?.name || 'Unknown Exercise',
                    exerciseDescription: ex?.description || null,
                    exerciseCategory: ex?.category || null,
                    trackingType: de.trackingType,
                    resistanceType: de.resistanceType,
                    sets: de.sets,
                    targetReps: de.targetReps,
                    targetTimeSeconds: de.targetTimeSeconds,
                    orderIndex: de.orderIndex,
                };
            })
        );

        return await WorkoutRepository.createSession({
            programDayId,
            programNameSnapshot: program.name,
            dayNameSnapshot: day.name,
            exercisesSnapshot,
            restTimerTargetEndTime: null,
        });
    },

    /**
     * Logs a set.
     */
    logSet: async (setData: Omit<WorkoutSet, 'id' | 'createdAt'>): Promise<WorkoutSet> => {
        return await WorkoutRepository.saveSet(setData);
    },

    /**
     * Gets all sets for a session.
     */
    getSetsForSession: async (sessionId: string): Promise<WorkoutSet[]> => {
        return await WorkoutRepository.getSetsBySessionId(sessionId);
    },

    /**
     * Updates session data (e.g., rest timer).
     */
    updateSession: async (sessionId: string, updates: Partial<WorkoutSession>): Promise<void> => {
        await WorkoutRepository.updateSession(sessionId, updates);
    },

    /**
     * Completes the session.
     */
    completeWorkout: async (sessionId: string): Promise<void> => {
        // TODO: Refactor: Move progression evaluation logic here (currently in useWorkout) to centralize business logic
        await WorkoutRepository.completeSession(sessionId);
    },

    /**
     * Abandons the session.
     */
    abandonWorkout: async (sessionId: string): Promise<void> => {
        await WorkoutRepository.abandonSession(sessionId);
    },

    /**
     * Gets completed workout history.
     */
    getHistory: async (): Promise<WorkoutSession[]> => {
        return await WorkoutRepository.getCompletedSessions();
    },

    /**
     * Gets full details of a workout session (session info + sets).
     */
    getWorkoutDetails: async (sessionId: string): Promise<{ session: WorkoutSession | null, sets: WorkoutSet[] }> => {
        const session = await WorkoutRepository.getSessionById(sessionId);
        const sets = await WorkoutRepository.getSetsBySessionId(sessionId);
        return { session, sets };
    }
};
