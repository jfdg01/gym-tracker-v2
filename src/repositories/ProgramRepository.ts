import * as Crypto from 'expo-crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { programs, workoutSessions, workoutSets } from '../db/schema';
import { Program, WorkoutSession, WorkoutSet, WorkoutStatus } from '../types/domain';
import { Logger } from '../utils/Logger';

const mapProgram = (doc: typeof programs.$inferSelect): Program => ({
    id: doc.id,
    name: doc.name,
    description: doc.description,
    lastCompletedDayId: doc.lastCompletedDayId,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
});

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

export const ProgramRepository = {
    getAll: async (): Promise<Program[]> => {
        const stopTimer = Logger.getTimer('DB: ProgramRepository.getAll');
        const results = await db.select().from(programs);
        const mapped = results.map(mapProgram);
        stopTimer();
        return mapped;
    },

    getById: async (id: string): Promise<Program | null> => {
        const results = await db.select().from(programs).where(eq(programs.id, id));
        return results.length > 0 ? mapProgram(results[0]) : null;
    },

    create: async (program: Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'lastCompletedDayId'>): Promise<Program> => {
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        const newProgram = {
            id,
            ...program,
            lastCompletedDayId: null,
            createdAt: now,
            updatedAt: now,
        };

        await db.insert(programs).values(newProgram);
        return newProgram;
    },

    update: async (id: string, updates: Partial<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
        await db.update(programs)
            .set({
                ...updates,
                updatedAt: new Date().toISOString()
            })
            .where(eq(programs.id, id));
    },

    delete: async (id: string): Promise<void> => {
        await db.delete(programs).where(eq(programs.id, id));
    },

    updateLastCompletedDay: async (id: string, lastCompletedDayId: string | null): Promise<void> => {
        await db.update(programs)
            .set({
                lastCompletedDayId,
                updatedAt: new Date().toISOString()
            })
            .where(eq(programs.id, id));
    }
};

export const WorkoutRepository = {
    getActiveSession: async (): Promise<WorkoutSession | null> => {
        const stopTimer = Logger.getTimer('DB: WorkoutRepository.getActiveSession');
        const results = await db.select()
            .from(workoutSessions)
            .where(eq(workoutSessions.status, WorkoutStatus.IN_PROGRESS))
            .limit(1);
        const mapped = results.length > 0 ? mapSession(results[0]) : null;
        stopTimer();
        return mapped;
    },

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

    updateSession: async (id: string, updates: Partial<WorkoutSession>): Promise<void> => {
        const dbUpdates: any = { ...updates };
        if (updates.exercisesSnapshot) {
            dbUpdates.exercisesSnapshot = JSON.stringify(updates.exercisesSnapshot);
        }
        await db.update(workoutSessions)
            .set(dbUpdates)
            .where(eq(workoutSessions.id, id));
    },

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

    getSetsBySessionId: async (sessionId: string): Promise<WorkoutSet[]> => {
        const results = await db.select()
            .from(workoutSets)
            .where(eq(workoutSets.workoutSessionId, sessionId))
            .orderBy(workoutSets.setNumber);
        return results.map(mapSet);
    },

    completeSession: async (sessionId: string): Promise<void> => {
        const now = new Date().toISOString();
        await db.update(workoutSessions)
            .set({
                status: WorkoutStatus.COMPLETED,
                completedAt: now,
            })
            .where(eq(workoutSessions.id, sessionId));
    },

    abandonSession: async (sessionId: string): Promise<void> => {
        await db.update(workoutSessions)
            .set({
                status: WorkoutStatus.ABANDONED,
                completedAt: new Date().toISOString(),
            })
            .where(eq(workoutSessions.id, sessionId));
    },

    getCompletedSessions: async (): Promise<WorkoutSession[]> => {
        const stopTimer = Logger.getTimer('DB: WorkoutRepository.getCompletedSessions');
        const results = await db.select()
            .from(workoutSessions)
            .where(eq(workoutSessions.status, WorkoutStatus.COMPLETED))
            .orderBy(desc(workoutSessions.completedAt));
        const mapped = results.map(mapSession);
        stopTimer();
        return mapped;
    },

    getSessionById: async (id: string): Promise<WorkoutSession | null> => {
        const results = await db.select()
            .from(workoutSessions)
            .where(eq(workoutSessions.id, id));
        return results.length > 0 ? mapSession(results[0]) : null;
    }
};
