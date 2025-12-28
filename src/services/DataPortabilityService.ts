import { db } from '../db/client';
import * as schema from '../db/schema';
import { sql } from 'drizzle-orm';
import { WorkoutRepository } from '../repositories/WorkoutRepository';

export const DataPortabilityService = {
    /**
     * Exports all database content to a JSON-serializable object.
     */
    exportAllData: async (): Promise<any> => {
        const data: any = {};

        data.exercises = await db.select().from(schema.exercises);
        data.exerciseSettings = await db.select().from(schema.exerciseSettings);
        data.programs = await db.select().from(schema.programs);
        data.programDays = await db.select().from(schema.programDays);
        data.programDayExercises = await db.select().from(schema.programDayExercises);
        data.workoutSessions = await db.select().from(schema.workoutSessions);
        data.workoutSets = await db.select().from(schema.workoutSets);

        return data;
    },

    /**
     * Imports data from a JSON object.
     * WARNING: This implementation overwrites/merges based on IDs.
     */
    importData: async (data: any): Promise<void> => {
        const activeSession = await WorkoutRepository.getActiveSession();
        if (activeSession) {
            throw new Error('Cannot import data while a workout is in progress.');
        }

        await db.transaction(async (tx) => {
            const tables = [
                { name: 'exercises', schema: schema.exercises },
                { name: 'exerciseSettings', schema: schema.exerciseSettings },
                { name: 'programs', schema: schema.programs },
                { name: 'programDays', schema: schema.programDays },
                { name: 'programDayExercises', schema: schema.programDayExercises },
                { name: 'workoutSessions', schema: schema.workoutSessions },
                { name: 'workoutSets', schema: schema.workoutSets },
            ];

            for (const table of tables) {
                const records = data[table.name];
                if (records && Array.isArray(records)) {
                    for (const record of records) {
                        const { id, ...updateValues } = record;
                        await tx.insert(table.schema).values(record).onConflictDoUpdate({
                            target: (table.schema as any).id,
                            set: updateValues
                        });
                    }
                }
            }
        });
    },

    /**
     * Deletes all data from the database.
     * DANGER: This is irreversible.
     */
    deleteAllData: async (): Promise<void> => {
        await db.delete(schema.workoutSets);
        await db.delete(schema.workoutSessions);
        await db.delete(schema.programDayExercises);
        await db.delete(schema.programDays);
        await db.delete(schema.programs);
        await db.delete(schema.exerciseSettings);
        await db.delete(schema.exercises);
    }
};
