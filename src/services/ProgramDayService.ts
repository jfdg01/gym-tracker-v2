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

    /**
     * Updates a day's name.
     */
    updateDay: async (id: string, updates: Partial<Omit<ProgramDay, 'id' | 'programId'>>): Promise<void> => {
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
