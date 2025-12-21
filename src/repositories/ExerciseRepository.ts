import { db } from '../db/client';
import { exercises, exerciseSettings } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface CreateExerciseDto {
    name: string;
    description?: string;
    category?: string;
    defaultTrackingType: 'REPS' | 'TIME';
    defaultResistanceType: 'WEIGHT' | 'DIFFICULTY';
}

export const ExerciseRepository = {
    getAll: async () => {
        return await db.query.exercises.findMany({
            where: eq(exercises.isArchived, false),
            with: {
                // We'll add relations to the schema later if needed
            }
        });
    },

    getById: async (id: string) => {
        return await db.query.exercises.findFirst({
            where: eq(exercises.id, id),
        });
    },

    create: async (data: CreateExerciseDto) => {
        const id = crypto.randomUUID();
        return await db.transaction(async (tx) => {
            const [exercise] = await tx.insert(exercises).values({
                id,
                ...data,
            }).returning();

            await tx.insert(exerciseSettings).values({
                id: crypto.randomUUID(),
                exerciseId: id,
            });

            return exercise;
        });
    },

    update: async (id: string, data: Partial<CreateExerciseDto>) => {
        return await db.update(exercises)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(eq(exercises.id, id))
            .returning();
    },

    archive: async (id: string) => {
        return await db.update(exercises)
            .set({ isArchived: true, updatedAt: new Date().toISOString() })
            .where(eq(exercises.id, id))
            .returning();
    },

    restore: async (id: string) => {
        return await db.update(exercises)
            .set({ isArchived: false, updatedAt: new Date().toISOString() })
            .where(eq(exercises.id, id))
            .returning();
    },

    getSettings: async (exerciseId: string) => {
        return await db.query.exerciseSettings.findFirst({
            where: eq(exerciseSettings.exerciseId, exerciseId),
        });
    },

    updateSettings: async (exerciseId: string, data: any) => {
        return await db.update(exerciseSettings)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(eq(exerciseSettings.exerciseId, exerciseId))
            .returning();
    }
};
