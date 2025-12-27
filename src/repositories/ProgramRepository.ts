import * as Crypto from 'expo-crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { programs } from '../db/schema';
import { Program } from '../types/domain';

const mapProgram = (doc: typeof programs.$inferSelect): Program => ({
    id: doc.id,
    name: doc.name,
    description: doc.description,
    lastCompletedDayId: doc.lastCompletedDayId,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
});

export const ProgramRepository = {
    /**
     * Retrieves all programs from the database.
     */
    getAll: async (): Promise<Program[]> => {
        const results = await db.select().from(programs);
        return results.map(mapProgram);
    },

    /**
     * Retrieves a single program by its UUID.
     */
    getById: async (id: string): Promise<Program | null> => {
        const results = await db.select().from(programs).where(eq(programs.id, id));
        return results.length > 0 ? mapProgram(results[0]) : null;
    },

    /**
     * Creates a new program. IDs are generated using expo-crypto.
     * Timestamps are stored as UTC ISO 8601 strings.
     */
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

    /**
     * Updates an existing program's fields.
     */
    update: async (id: string, updates: Partial<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
        await db.update(programs)
            .set({
                ...updates,
                updatedAt: new Date().toISOString()
            })
            .where(eq(programs.id, id));
    },

    /**
     * Permanently deletes a program. 
     * Note: Cascading deletes for programDays are handled at the DB level (onDelete: 'cascade').
     */
    delete: async (id: string): Promise<void> => {
        await db.delete(programs).where(eq(programs.id, id));
    },

    /**
     * Updates the last completed day for a program.
     */
    updateLastCompletedDay: async (id: string, lastCompletedDayId: string | null): Promise<void> => {
        await db.update(programs)
            .set({
                lastCompletedDayId,
                updatedAt: new Date().toISOString()
            })
            .where(eq(programs.id, id));
    }
};
