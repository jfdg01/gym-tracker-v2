import * as Crypto from 'expo-crypto';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { Exercise, ExerciseSettings } from '../types/domain';
import { CacheService, CACHE_KEYS } from './CacheService';

export const ExerciseService = {
    getAllExercises: async (): Promise<Exercise[]> => {
        const cached = CacheService.get<Exercise[]>(CACHE_KEYS.EXERCISES);
        if (cached) return cached;

        const data = await ExerciseRepository.getAll();
        CacheService.set(CACHE_KEYS.EXERCISES, data);
        return data;
    },

    getExerciseById: async (id: string): Promise<Exercise | null> => {
        return await ExerciseRepository.getById(id);
    },

    createExercise: async (
        exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
    ): Promise<Exercise> => {
        const id = Crypto.randomUUID();
        const result = await ExerciseRepository.create({
            ...exercise,
            id,
        });
        CacheService.invalidate(CACHE_KEYS.EXERCISES);
        return result;
    },

    updateExercise: async (
        id: string,
        updates: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<void> => {
        await ExerciseRepository.update(id, updates);
        CacheService.invalidate(CACHE_KEYS.EXERCISES);
    },

    archiveExercise: async (id: string): Promise<void> => {
        await ExerciseRepository.delete(id);
        CacheService.invalidate(CACHE_KEYS.EXERCISES);
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
