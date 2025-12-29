import { ProgramDayRepository } from '../repositories/ProgramDayRepository';
import { ProgramDay } from '../types/domain';

export const ProgramDayService = {
    /**
     * Gets all days for a program.
     */
    getDaysByProgramId: async (programId: string): Promise<ProgramDay[]> => {
        return await ProgramDayRepository.getByProgramId(programId);
    },

    /**
     * Creates a new day in a program.
     */
    createDay: async (programId: string, name: string, isRestDay: boolean = false): Promise<ProgramDay> => {
        return await ProgramDayRepository.create({ programId, name, isRestDay });
    },

    updateDay: async (id: string, updates: Partial<Omit<ProgramDay, 'id' | 'programId'>>): Promise<void> => {
        // Handle name preservation logic for rest day toggles
        if (updates.isRestDay !== undefined) {
            const currentDay = await ProgramDayRepository.getById(id);
            if (currentDay && currentDay.isRestDay !== updates.isRestDay) {
                if (updates.isRestDay) {
                    // Switching to REST: Save current name and set name to "Rest"
                    // Only save to previousName if current name is not already "Rest"
                    if (currentDay.name.toLowerCase() !== 'rest') {
                        updates.previousName = currentDay.name;
                        updates.name = 'Rest';
                    }
                } else {
                    // Switching to WORKOUT: Restore previous name if current is "Rest"
                    if (currentDay.name.toLowerCase() === 'rest' && currentDay.previousName) {
                        updates.name = currentDay.previousName;
                    }
                    updates.previousName = null;
                }
            }
        }
        return await ProgramDayRepository.update(id, updates);
    },

    /**
     * Deletes a day and handles re-indexing.
     */
    deleteDay: async (id: string): Promise<void> => {
        return await ProgramDayRepository.delete(id);
    },

    /**
     * Reorders days.
     */
    reorderDays: async (programId: string, dayIds: string[]): Promise<void> => {
        return await ProgramDayRepository.reorder(programId, dayIds);
    }
};
