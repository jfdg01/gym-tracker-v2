import { ProgramRepository } from '../repositories/ProgramRepository';
import { Program } from '../types/domain';

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
    }
};
