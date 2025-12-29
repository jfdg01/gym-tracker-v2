import { db } from '../db/client';
import * as schema from '../db/schema';
import { sql } from 'drizzle-orm';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { SQLiteText, SQLiteInteger, getTableConfig } from 'drizzle-orm/sqlite-core';

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
                    // Build a mapping from DB column names to JS property names
                    const dbToJsMap: Record<string, string> = {};
                    for (const [jsKey, col] of Object.entries(table.schema)) {
                        if (col && typeof col === 'object' && 'name' in col) {
                            dbToJsMap[(col as any).name] = jsKey;
                        }
                    }

                    const { columns } = getTableConfig(table.schema);

                    for (const record of records) {
                        const { id, ...updateValues } = record;

                        // Generic resilience: Provide defaults for missing or null NOT NULL fields
                        const dataToInsert = { ...record };

                        for (const col of columns) {
                            const dbName = col.name;
                            const jsName = dbToJsMap[dbName] || dbName;

                            const value = dataToInsert[jsName];

                            // If missing (undefined) or explicitly null, and it's a NOT NULL column
                            if ((value === undefined || value === null) && col.notNull) {
                                // If it's missing (undefined) and has a DB default, we OMIT it so the DB can apply the default
                                if (value === undefined && col.hasDefault) {
                                    delete dataToInsert[jsName];
                                    delete (updateValues as any)[jsName];
                                    continue;
                                }

                                // Otherwise (is null, OR is undefined without DB default), provide safe JS defaults based on column type
                                let defaultValue: any = null;
                                if (col instanceof SQLiteInteger) {
                                    defaultValue = 0;
                                } else if (col instanceof SQLiteText) {
                                    defaultValue = '';
                                }

                                if (defaultValue !== null) {
                                    dataToInsert[jsName] = defaultValue;
                                    (updateValues as any)[jsName] = defaultValue;
                                }
                            }
                        }

                        await tx.insert(table.schema).values(dataToInsert).onConflictDoUpdate({
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
