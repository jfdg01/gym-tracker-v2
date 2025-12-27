import { ProgramRepository } from '../repositories/ProgramRepository';
import { ProgramDayRepository } from '../repositories/ProgramDayRepository';
import { Program, ProgramDay } from '../types/domain';

/**
 * Service layer for Program-related business logic.
 * Acts as a clean interface for UI components to interact with the repository.
 */
export const ProgramService = {
    /**
     * Gets all programs.
     */
    getAllPrograms: async (): Promise<Program[]> => {
        return await ProgramRepository.getAll();
    },

    /**
     * Gets a single program by ID.
     */
    getProgramById: async (id: string): Promise<Program | null> => {
        return await ProgramRepository.getById(id);
    },

    /**
     * Creates a new program.
     */
    createProgram: async (
        program: Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'lastCompletedDayId'>
    ): Promise<Program> => {
        return await ProgramRepository.create(program);
    },

    /**
     * Updates an existing program.
     */
    updateProgram: async (
        id: string,
        updates: Partial<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<void> => {
        return await ProgramRepository.update(id, updates);
    },

    /**
     * Deletes a program.
     */
    deleteProgram: async (id: string): Promise<void> => {
        // Future Logic: check if there's an active session using this program before deletion
        return await ProgramRepository.delete(id);
    },

    /**
     * Updates the last completed day for a program.
     * Useful for tracking progression through program days.
     */
    updateProgression: async (id: string, lastCompletedDayId: string | null): Promise<void> => {
        return await ProgramRepository.updateLastCompletedDay(id, lastCompletedDayId);
    },

    /**
     * Suggests the next day to work out for a given program.
     */
    getSuggestedDay: async (programId: string): Promise<ProgramDay | null> => {
        const program = await ProgramRepository.getById(programId);
        if (!program) return null;

        const days = await ProgramDayRepository.getByProgramId(programId);
        if (days.length === 0) return null;

        if (!program.lastCompletedDayId) {
            return days[0];
        }

        const lastIndex = days.findIndex((d: ProgramDay) => d.id === program.lastCompletedDayId);
        if (lastIndex === -1 || lastIndex === days.length - 1) {
            return days[0];
        }

        return days[lastIndex + 1];
    }
};
