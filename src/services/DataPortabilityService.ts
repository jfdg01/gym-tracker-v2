import { db } from '../db/client';
import * as schema from '../db/schema';
import { sql } from 'drizzle-orm';

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
        // Use a transaction for the entire import if possible, 
        // however drizzle-orm with expo-sqlite might have limitations on complex transactions via db tool.
        // For simplicity, we'll do sequential inserts with try-catch.

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
                    try {
                        // Using insert().onConflictUpdate() would be ideal but expo-sqlite driver support varies.
                        // We'll use a basic insert and ignore if exists for now, or just try-catch.
                        const { id, ...updateValues } = record;
                        await db.insert(table.schema).values(record).onConflictDoUpdate({
                            target: (table.schema as any).id,
                            set: updateValues
                        });
                    } catch (e) {
                        console.error(`Failed to import record into ${table.name}`, e);
                    }
                }
            }
        }
    }
};
