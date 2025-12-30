import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { ProgramRepository } from '../repositories/ProgramRepository';
import { ProgramDayRepository } from '../repositories/ProgramDayRepository';
import { ProgramDayExerciseRepository } from '../repositories/ProgramDayExerciseRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { WorkoutSession, WorkoutSet, ExerciseSnapshotItem } from '../types/domain';
import { ProgressionService } from './ProgressionService';
import { ProgramService } from './ProgramService';
import { CacheService, CACHE_KEYS } from './CacheService';

export const WorkoutService = {
    /**
     * Checks if there's an active session.
     */
    getActiveSession: async (): Promise<WorkoutSession | null> => {
        const active = await WorkoutRepository.getActiveSession();

        if (active) {
            const startedAt = new Date(active.startedAt).getTime();
            const now = Date.now();
            const hoursSinceStart = (now - startedAt) / (1000 * 60 * 60);
            const AUTO_ABANDON_THRESHOLD_HOURS = 20;

            if (hoursSinceStart > AUTO_ABANDON_THRESHOLD_HOURS) {
                const sets = await WorkoutRepository.getSetsBySessionId(active.id);
                if (sets.length > 0) {
                    // Stale but has data -> Save as Completed (History), but don't advance Program
                    await WorkoutRepository.completeSession(active.id);
                } else {
                    // Stale and empty -> Ghost session, just clean it up
                    await WorkoutRepository.abandonSession(active.id);
                }
                return null;
            }
        }

        return active;
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
                const settings = await ExerciseRepository.getSettings(de.exerciseId);
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
                    suggestedWeight: settings?.currentWeight,
                    suggestedDifficulty: settings?.currentDifficultyLevel,
                    difficultyLevels: settings?.difficultyLevels,
                    restTimeSeconds: settings?.restTimeSeconds,
                };
            })
        );

        return await WorkoutRepository.createSession({
            programDayId,
            programNameSnapshot: program.name,
            dayNameSnapshot: day.name,
            exercisesSnapshot,
            isRestDay: day.isRestDay,
            restTimerTargetEndTime: null,
        });
    },

    /**
     * Logs a set.
     */
    logSet: async (setData: Omit<WorkoutSet, 'id' | 'createdAt'>): Promise<{ set: WorkoutSet, progression?: { progressed: boolean, newWeight?: number, newDifficulty?: string, isMaxLevel?: boolean } }> => {
        // Update settings if user logs a different weight
        if (setData.weight !== undefined && setData.weight !== null && setData.weight > 0) {
            const currentSettings = await ExerciseRepository.getSettings(setData.exerciseId);
            if (currentSettings && currentSettings.currentWeight !== setData.weight) {
                await ExerciseRepository.updateSettings(setData.exerciseId, {
                    currentWeight: setData.weight
                });
            }
        }

        const newSet = await WorkoutRepository.saveSet(setData);

        let progressionResult: { progressed: boolean, newWeight?: number, newDifficulty?: string, isMaxLevel?: boolean } | undefined;

        // Trigger progression evaluation if this was the last set
        const session = await WorkoutRepository.getSessionById(setData.workoutSessionId);
        if (session && session.exercisesSnapshot) {
            const exerciseSnapshot = session.exercisesSnapshot.find(e => e.exerciseId === setData.exerciseId);
            if (exerciseSnapshot) {
                const exerciseSets = await WorkoutRepository.getSetsBySessionId(setData.workoutSessionId);
                const currentExerciseSets = exerciseSets.filter(s => s.exerciseId === setData.exerciseId);

                if (currentExerciseSets.length >= exerciseSnapshot.sets) {
                    progressionResult = await ProgressionService.evaluateProgression(
                        setData.exerciseId,
                        exerciseSnapshot,
                        currentExerciseSets
                    );

                    if (progressionResult) {
                        // Persist result in the snapshot for history
                        const updatedSnapshot = session.exercisesSnapshot.map(e =>
                            e.exerciseId === setData.exerciseId
                                ? { ...e, result: progressionResult }
                                : e
                        );
                        await WorkoutRepository.updateSession(setData.workoutSessionId, {
                            exercisesSnapshot: updatedSnapshot
                        });
                    }
                }
            }
        }

        return { set: newSet, progression: progressionResult };
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
        const session = await WorkoutRepository.getSessionById(sessionId);
        if (!session) throw new Error('Session not found');

        await WorkoutRepository.completeSession(sessionId);
        CacheService.invalidate(CACHE_KEYS.HISTORY);

        // Update program progression
        if (session.programDayId) {
            try {
                const day = await ProgramDayRepository.getById(session.programDayId);
                if (day) {
                    await ProgramService.updateProgression(day.programId, day.id);
                }
            } catch (error) {
                console.warn('Failed to update progression (program might have been deleted):', error);
            }
        }
    },

    /**
     * Abandons the session.
     */
    abandonWorkout: async (sessionId: string): Promise<void> => {
        await WorkoutRepository.abandonSession(sessionId);
        // We don't necessarily need to invalidate history on abandon as it filtered by completed
    },

    /**
     * Gets completed workout history.
     */
    getHistory: async (): Promise<WorkoutSession[]> => {
        const cached = CacheService.get<WorkoutSession[]>(CACHE_KEYS.HISTORY);
        if (cached) return cached;

        const data = await WorkoutRepository.getCompletedSessions();
        CacheService.set(CACHE_KEYS.HISTORY, data);
        return data;
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
