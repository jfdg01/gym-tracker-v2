import * as Crypto from 'expo-crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { exercises, exerciseSettings } from '../db/schema';
import { Exercise, ExerciseSettings, TrackingType, ResistanceType } from '../types/domain';

const mapExercise = (doc: typeof exercises.$inferSelect): Exercise => ({
    id: doc.id,
    name: doc.name,
    description: doc.description,
    category: doc.category,
    defaultTrackingType: doc.defaultTrackingType as TrackingType,
    defaultResistanceType: doc.defaultResistanceType as ResistanceType,
    isArchived: doc.isArchived,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
});

const mapSettings = (doc: typeof exerciseSettings.$inferSelect): ExerciseSettings => ({
    id: doc.id,
    exerciseId: doc.exerciseId,
    currentWeight: doc.currentWeight,
    weightIncreaseFactor: doc.weightIncreaseFactor,
    difficultyLevels: doc.difficultyLevels ? JSON.parse(doc.difficultyLevels) : [],
    currentDifficultyLevel: doc.currentDifficultyLevel,
    restTimeSeconds: doc.restTimeSeconds,
    updatedAt: doc.updatedAt || new Date().toISOString(),
});

export const ExerciseRepository = {
    getAll: async (): Promise<Exercise[]> => {
        const results = await db.select().from(exercises).where(eq(exercises.isArchived, false));
        return results.map(mapExercise);
    },

    getById: async (id: string): Promise<Exercise | null> => {
        const results = await db.select().from(exercises).where(eq(exercises.id, id));
        return results.length > 0 ? mapExercise(results[0]) : null;
    },

    create: async (exercise: Omit<Exercise, 'createdAt' | 'updatedAt' | 'isArchived'>): Promise<Exercise> => {
        const newExercise = {
            ...exercise,
            isArchived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await db.insert(exercises).values(newExercise);

        // Create default settings
        const settingsId = Crypto.randomUUID();
        await db.insert(exerciseSettings).values({
            id: settingsId,
            exerciseId: exercise.id,
            updatedAt: new Date().toISOString(),
        });

        return newExercise;
    },

    update: async (id: string, updates: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
        await db.update(exercises)
            .set({ ...updates, updatedAt: new Date().toISOString() })
            .where(eq(exercises.id, id));
    },

    archive: async (id: string): Promise<void> => {
        await db.update(exercises)
            .set({ isArchived: true, updatedAt: new Date().toISOString() })
            .where(eq(exercises.id, id));
    },

    getSettings: async (exerciseId: string): Promise<ExerciseSettings | null> => {
        const results = await db.select().from(exerciseSettings).where(eq(exerciseSettings.exerciseId, exerciseId));
        return results.length > 0 ? mapSettings(results[0]) : null;
    },

    updateSettings: async (exerciseId: string, updates: Partial<Omit<ExerciseSettings, 'id' | 'exerciseId' | 'updatedAt'>>): Promise<void> => {
        const dbUpdates: any = { ...updates, updatedAt: new Date().toISOString() };
        if (updates.difficultyLevels) {
            dbUpdates.difficultyLevels = JSON.stringify(updates.difficultyLevels);
        }

        await db.update(exerciseSettings)
            .set(dbUpdates)
            .where(eq(exerciseSettings.exerciseId, exerciseId));
    }
};
