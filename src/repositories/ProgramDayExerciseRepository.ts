import * as Crypto from 'expo-crypto';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/client';
import { programDayExercises } from '../db/schema';
import { ProgramDayExercise, TrackingType, ResistanceType } from '../types/domain';

const mapProgramDayExercise = (doc: typeof programDayExercises.$inferSelect): ProgramDayExercise => ({
    id: doc.id,
    programDayId: doc.programDayId,
    exerciseId: doc.exerciseId,
    trackingType: doc.trackingType as TrackingType,
    resistanceType: doc.resistanceType as ResistanceType, // Drizzle returns string, cast to enum
    sets: doc.sets,
    targetReps: doc.targetReps,
    targetTimeSeconds: doc.targetTimeSeconds,
    orderIndex: doc.orderIndex,
});

export const ProgramDayExerciseRepository = {
    /**
     * Gets all exercises for a specific program day, ordered by orderIndex.
     */
    getByProgramDayId: async (programDayId: string): Promise<ProgramDayExercise[]> => {
        const results = await db.select()
            .from(programDayExercises)
            .where(eq(programDayExercises.programDayId, programDayId))
            .orderBy(asc(programDayExercises.orderIndex));
        return results.map(mapProgramDayExercise);
    },

    /**
     * Gets a single program day exercise by ID.
     */
    getById: async (id: string): Promise<ProgramDayExercise | null> => {
        const results = await db.select()
            .from(programDayExercises)
            .where(eq(programDayExercises.id, id));
        return results.length > 0 ? mapProgramDayExercise(results[0]) : null;
    },

    /**
     * Creates a new program day exercise.
     */
    create: async (data: Omit<ProgramDayExercise, 'id' | 'orderIndex'> & { orderIndex?: number }): Promise<ProgramDayExercise> => {
        const id = Crypto.randomUUID();

        let orderIndex = data.orderIndex;
        if (orderIndex === undefined) {
            const existing = await ProgramDayExerciseRepository.getByProgramDayId(data.programDayId);
            orderIndex = existing.length;
        }

        const newEntry = {
            id,
            ...data,
            orderIndex,
        };

        await db.insert(programDayExercises).values(newEntry as any);
        return newEntry;
    },

    /**
     * Updates a program day exercise.
     */
    update: async (id: string, updates: Partial<Omit<ProgramDayExercise, 'id' | 'programDayId' | 'exerciseId'>>): Promise<void> => {
        await db.update(programDayExercises)
            .set(updates as any)
            .where(eq(programDayExercises.id, id));
    },

    /**
     * Deletes a program day exercise and re-indexes.
     */
    delete: async (id: string): Promise<void> => {
        const itemToDelete = await ProgramDayExerciseRepository.getById(id);
        if (!itemToDelete) return;

        await db.delete(programDayExercises).where(eq(programDayExercises.id, id));

        // Re-index
        const remaining = await ProgramDayExerciseRepository.getByProgramDayId(itemToDelete.programDayId);
        for (let i = 0; i < remaining.length; i++) {
            if (remaining[i].orderIndex !== i) {
                await db.update(programDayExercises)
                    .set({ orderIndex: i })
                    .where(eq(programDayExercises.id, remaining[i].id));
            }
        }
    },

    /**
     * Reorders exercises within a day.
     */
    reorder: async (programDayId: string, exerciseIds: string[]): Promise<void> => {
        for (let i = 0; i < exerciseIds.length; i++) {
            await db.update(programDayExercises)
                .set({ orderIndex: i })
                .where(eq(programDayExercises.id, exerciseIds[i]));
        }
    }
};
