import * as Crypto from 'expo-crypto';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/client';
import { programDays } from '../db/schema';
import { ProgramDay } from '../types/domain';

const mapProgramDay = (doc: typeof programDays.$inferSelect): ProgramDay => ({
    id: doc.id,
    programId: doc.programId,
    name: doc.name,
    orderIndex: doc.orderIndex,
});

export const ProgramDayRepository = {
    /**
     * Gets all days for a specific program, ordered by orderIndex.
     */
    getByProgramId: async (programId: string): Promise<ProgramDay[]> => {
        const results = await db.select()
            .from(programDays)
            .where(eq(programDays.programId, programId))
            .orderBy(asc(programDays.orderIndex));
        return results.map(mapProgramDay);
    },

    /**
     * Gets a single program day by ID.
     */
    getById: async (id: string): Promise<ProgramDay | null> => {
        const results = await db.select()
            .from(programDays)
            .where(eq(programDays.id, id));
        return results.length > 0 ? mapProgramDay(results[0]) : null;
    },

    /**
     * Creates a new program day.
     * Automatically calculates the next orderIndex if not provided.
     */
    create: async (data: Omit<ProgramDay, 'id' | 'orderIndex'> & { orderIndex?: number }): Promise<ProgramDay> => {
        const id = Crypto.randomUUID();

        let orderIndex = data.orderIndex;
        if (orderIndex === undefined) {
            const existing = await ProgramDayRepository.getByProgramId(data.programId);
            orderIndex = existing.length; // 0-based index
        }

        const newDay = {
            id,
            programId: data.programId,
            name: data.name,
            orderIndex,
        };

        await db.insert(programDays).values(newDay);
        return newDay;
    },

    /**
     * Updates a program day.
     */
    update: async (id: string, updates: Partial<Omit<ProgramDay, 'id' | 'programId'>>): Promise<void> => {
        await db.update(programDays)
            .set(updates)
            .where(eq(programDays.id, id));
    },

    /**
     * Deletes a program day and re-calculates orderIndex for remaining days to keep them dense.
     */
    delete: async (id: string): Promise<void> => {
        const dayToDelete = await ProgramDayRepository.getById(id);
        if (!dayToDelete) return;

        await db.delete(programDays).where(eq(programDays.id, id));

        // Re-index remaining days to maintain density
        const remainingDays = await ProgramDayRepository.getByProgramId(dayToDelete.programId);
        for (let i = 0; i < remainingDays.length; i++) {
            if (remainingDays[i].orderIndex !== i) {
                await db.update(programDays)
                    .set({ orderIndex: i })
                    .where(eq(programDays.id, remainingDays[i].id));
            }
        }
    },

    /**
     * Reorders days within a program.
     */
    reorder: async (programId: string, dayIds: string[]): Promise<void> => {
        for (let i = 0; i < dayIds.length; i++) {
            await db.update(programDays)
                .set({ orderIndex: i })
                .where(eq(programDays.id, dayIds[i]));
        }
    }
};
