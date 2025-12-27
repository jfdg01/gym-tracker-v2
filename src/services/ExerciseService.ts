import * as Crypto from 'expo-crypto';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { Exercise, ExerciseSettings } from '../types/domain';

export const ExerciseService = {
    getAllExercises: async (): Promise<Exercise[]> => {
        return await ExerciseRepository.getAll();
    },

    getExerciseById: async (id: string): Promise<Exercise | null> => {
        return await ExerciseRepository.getById(id);
    },

    createExercise: async (
        exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
    ): Promise<Exercise> => {
        const id = Crypto.randomUUID();
        return await ExerciseRepository.create({
            ...exercise,
            id,
        });
    },

    updateExercise: async (
        id: string,
        updates: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<void> => {
        return await ExerciseRepository.update(id, updates);
    },

    archiveExercise: async (id: string): Promise<void> => {
        // TODO: Implement "Smart Delete" logic: Add check for active usage in programs or workout history before archiving
        return await ExerciseRepository.archive(id);
    },

    getExerciseSettings: async (exerciseId: string): Promise<ExerciseSettings | null> => {
        return await ExerciseRepository.getSettings(exerciseId);
    },

    updateExerciseSettings: async (
        exerciseId: string,
        updates: Partial<Omit<ExerciseSettings, 'id' | 'exerciseId' | 'updatedAt'>>
    ): Promise<void> => {
        return await ExerciseRepository.updateSettings(exerciseId, updates);
    }
};
