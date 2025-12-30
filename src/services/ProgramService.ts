import { ProgramRepository } from '../repositories/ProgramRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { ProgramDayRepository } from '../repositories/ProgramDayRepository';
import { ProgramDayService } from './ProgramDayService';
import { Program, ProgramDay } from '../types/domain';
import { CacheService, CACHE_KEYS } from './CacheService';

/**
 * Service layer for Program-related business logic.
 * Acts as a clean interface for UI components to interact with the repository.
 */
export const ProgramService = {
    /**
     * Gets all programs.
     */
    getAllPrograms: async (): Promise<Program[]> => {
        const cached = CacheService.get<Program[]>(CACHE_KEYS.PROGRAMS);
        if (cached) return cached;

        const data = await ProgramRepository.getAll();
        CacheService.set(CACHE_KEYS.PROGRAMS, data);
        return data;
    },

    /**
     * Gets total and workout day counts for all programs in a single batch.
     * Prevents N+1 query problem on the Program List screen.
     */
    getProgramStats: async (): Promise<Record<string, { total: number, workout: number }>> => {
        const cached = CacheService.get<Record<string, { total: number, workout: number }>>(CACHE_KEYS.PROGRAM_STATS);
        if (cached) return cached;

        const programs = await ProgramRepository.getAll();
        const stats: Record<string, { total: number, workout: number }> = {};

        for (const program of programs) {
            const days = await ProgramDayService.getDaysByProgramId(program.id);
            stats[program.id] = {
                total: days.length,
                workout: days.filter((d: ProgramDay) => !d.isRestDay).length,
            };
        }

        CacheService.set(CACHE_KEYS.PROGRAM_STATS, stats);
        return stats;
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
        const newProgram = await ProgramRepository.create(program);

        // Ensure every program has at least one day
        await ProgramDayRepository.create({
            programId: newProgram.id,
            name: 'Day 1',
            isRestDay: false,
        });

        CacheService.invalidate(CACHE_KEYS.PROGRAMS);
        CacheService.invalidate(CACHE_KEYS.PROGRAM_STATS);
        return newProgram;
    },

    /**
     * Updates an existing program.
     */
    updateProgram: async (
        id: string,
        updates: Partial<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<void> => {
        await ProgramRepository.update(id, updates);
        CacheService.invalidate(CACHE_KEYS.PROGRAMS);
        CacheService.invalidate(CACHE_KEYS.PROGRAM_STATS);
    },

    /**
     * Deletes a program.
     */
    deleteProgram: async (id: string): Promise<void> => {
        // Check if there's an active session using this program before deletion
        const activeSession = await WorkoutRepository.getActiveSession();
        if (activeSession && activeSession.programDayId) {
            const sessionDay = await ProgramDayRepository.getById(activeSession.programDayId);
            if (sessionDay && sessionDay.programId === id) {
                throw new Error("Cannot delete program while a session is active. Please finish or abandon your workout first.");
            }
        }

        await ProgramRepository.delete(id);
        CacheService.invalidate(CACHE_KEYS.PROGRAMS);
        CacheService.invalidate(CACHE_KEYS.PROGRAM_STATS);
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
