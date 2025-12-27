import { ProgramDayExerciseRepository } from '../repositories/ProgramDayExerciseRepository';
import { ProgramDayExercise } from '../types/domain';

export const ProgramDayExerciseService = {
    getExercisesByDayId: async (dayId: string): Promise<ProgramDayExercise[]> => {
        return await ProgramDayExerciseRepository.getByProgramDayId(dayId);
    },

    addExerciseToDay: async (data: Omit<ProgramDayExercise, 'id' | 'orderIndex'>): Promise<ProgramDayExercise> => {
        return await ProgramDayExerciseRepository.create(data);
    },

    updateExerciseInDay: async (id: string, updates: Partial<Omit<ProgramDayExercise, 'id' | 'programDayId' | 'exerciseId'>>): Promise<void> => {
        return await ProgramDayExerciseRepository.update(id, updates);
    },

    removeExerciseFromDay: async (id: string): Promise<void> => {
        return await ProgramDayExerciseRepository.delete(id);
    },

    reorderExercisesInDay: async (dayId: string, exerciseIds: string[]): Promise<void> => {
        return await ProgramDayExerciseRepository.reorder(dayId, exerciseIds);
    }
};
