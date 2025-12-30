import * as Crypto from 'expo-crypto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { workoutSessions, workoutSets } from '../db/schema';
import { WorkoutSession, WorkoutSet, WorkoutStatus, ExerciseSnapshotItem } from '../types/domain';

const mapSession = (doc: typeof workoutSessions.$inferSelect): WorkoutSession => ({
    id: doc.id,
    programDayId: doc.programDayId,
    programNameSnapshot: doc.programNameSnapshot,
    dayNameSnapshot: doc.dayNameSnapshot,
    exercisesSnapshot: doc.exercisesSnapshot ? JSON.parse(doc.exercisesSnapshot) : null,
    restTimerTargetEndTime: doc.restTimerTargetEndTime,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    isRestDay: !!doc.isRestDay,
    status: doc.status as WorkoutStatus,
});

const mapSet = (doc: typeof workoutSets.$inferSelect): WorkoutSet => ({
    id: doc.id,
    workoutSessionId: doc.workoutSessionId,
    exerciseId: doc.exerciseId,
    setNumber: doc.setNumber,
    weight: doc.weight,
    difficulty: doc.difficulty,
    reps: doc.reps,
    timeSeconds: doc.timeSeconds,
    skipped: doc.skipped,
    createdAt: doc.createdAt || new Date().toISOString(),
});

export const WorkoutRepository = {
    /**
     * Gets the current active session (IN_PROGRESS).
     */
    getActiveSession: async (): Promise<WorkoutSession | null> => {
        const results = await db.select()
            .from(workoutSessions)
            .where(eq(workoutSessions.status, WorkoutStatus.IN_PROGRESS))
            .limit(1);
        return results.length > 0 ? mapSession(results[0]) : null;
    },

    /**
     * Starts a new workout session.
     */
    createSession: async (data: Omit<WorkoutSession, 'id' | 'startedAt' | 'completedAt' | 'status'>): Promise<WorkoutSession> => {
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        const newSession = {
            id,
            ...data,
            exercisesSnapshot: data.exercisesSnapshot ? JSON.stringify(data.exercisesSnapshot) : null,
            startedAt: now,
            status: WorkoutStatus.IN_PROGRESS,
        };

        await db.insert(workoutSessions).values(newSession as any);

        return {
            ...newSession,
            exercisesSnapshot: data.exercisesSnapshot,
            completedAt: null,
            status: WorkoutStatus.IN_PROGRESS,
            startedAt: now,
        };
    },

    /**
     * Updates an existing session (e.g., rest timer, status).
     */
    updateSession: async (id: string, updates: Partial<WorkoutSession>): Promise<void> => {
        const dbUpdates: any = { ...updates };
        if (updates.exercisesSnapshot) {
            dbUpdates.exercisesSnapshot = JSON.stringify(updates.exercisesSnapshot);
        }
        await db.update(workoutSessions)
            .set(dbUpdates)
            .where(eq(workoutSessions.id, id));
    },

    /**
     * Logs or updates a set within a session.
     */
    saveSet: async (setData: Omit<WorkoutSet, 'id' | 'createdAt'>): Promise<WorkoutSet> => {
        const existing = await db.select()
            .from(workoutSets)
            .where(and(
                eq(workoutSets.workoutSessionId, setData.workoutSessionId),
                eq(workoutSets.exerciseId, setData.exerciseId),
                eq(workoutSets.setNumber, setData.setNumber)
            ))
            .limit(1);

        if (existing.length > 0) {
            const id = existing[0].id;
            await db.update(workoutSets)
                .set({ ...setData })
                .where(eq(workoutSets.id, id));
            return mapSet({ ...existing[0], ...setData });
        } else {
            const id = Crypto.randomUUID();
            const now = new Date().toISOString();
            const newSet = {
                id,
                ...setData,
                createdAt: now,
            };
            await db.insert(workoutSets).values(newSet as any);
            return mapSet(newSet as any);
        }
    },

    /**
     * Gets all sets for a specific session.
     */
    getSetsBySessionId: async (sessionId: string): Promise<WorkoutSet[]> => {
        const results = await db.select()
            .from(workoutSets)
            .where(eq(workoutSets.workoutSessionId, sessionId))
            .orderBy(workoutSets.setNumber);
        return results.map(mapSet);
    },

    /**
     * Completes a session.
     */
    completeSession: async (sessionId: string): Promise<void> => {
        const now = new Date().toISOString();
        await db.update(workoutSessions)
            .set({
                status: WorkoutStatus.COMPLETED,
                completedAt: now,
            })
            .where(eq(workoutSessions.id, sessionId));
    },

    /**
     * Abandons a session.
     */
    abandonSession: async (sessionId: string): Promise<void> => {
        await db.update(workoutSessions)
            .set({
                status: WorkoutStatus.ABANDONED,
                completedAt: new Date().toISOString(),
            })
            .where(eq(workoutSessions.id, sessionId));
    },

    /**
     * Gets all completed workout sessions, ordered by completion date (descending).
     */
    getCompletedSessions: async (): Promise<WorkoutSession[]> => {
        console.time('DB: WorkoutRepository.getCompletedSessions');
        const results = await db.select()
            .from(workoutSessions)
            .where(eq(workoutSessions.status, WorkoutStatus.COMPLETED))
            .orderBy(desc(workoutSessions.completedAt));
        const mapped = results.map(mapSession);
        console.timeEnd('DB: WorkoutRepository.getCompletedSessions');
        return mapped;
    },

    /**
     * Gets a single session by its UUID.
     */
    getSessionById: async (id: string): Promise<WorkoutSession | null> => {
        const results = await db.select()
            .from(workoutSessions)
            .where(eq(workoutSessions.id, id));
        return results.length > 0 ? mapSession(results[0]) : null;
    }
};
