import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { WorkoutSet, ExerciseSnapshotItem, ResistanceType, TrackingType } from '../types/domain';

export const ProgressionService = {
    /**
     * Evaluates performance for a single exercise in a session and updates settings if successful.
     */
    evaluateProgression: async (
        exerciseId: string,
        snapshot: ExerciseSnapshotItem,
        sets: WorkoutSet[]
    ): Promise<{ progressed: boolean, newWeight?: number, newDifficulty?: string }> => {
        // 1. Check if at least target sets are present
        if (sets.length < snapshot.sets) {
            return { progressed: false };
        }

        // 2. Check if targets (reps or time) were met for ALL sets in the session for this exercise
        const allTargetsMet = sets.every(s => {
            if (s.skipped) return false;

            if (snapshot.trackingType === TrackingType.REPS) {
                return (s.reps || 0) >= (snapshot.targetReps || 0);
            } else {
                return (s.timeSeconds || 0) >= (snapshot.targetTimeSeconds || 0);
            }
        });

        if (!allTargetsMet) {
            return { progressed: false };
        }

        // 3. Apply progression
        const settings = await ExerciseRepository.getSettings(exerciseId);
        if (!settings) return { progressed: false };

        let updates: any = {};
        let result: any = { progressed: true };

        if (snapshot.resistanceType === ResistanceType.WEIGHT) {
            const currentWeight = settings.currentWeight || 0;
            const increase = settings.weightIncreaseFactor || 0;
            if (increase > 0) {
                updates.currentWeight = currentWeight + increase;
                result.newWeight = updates.currentWeight;
            }
        } else {
            // Difficulty progression
            const levels = settings.difficultyLevels;
            const currentLevel = settings.currentDifficultyLevel;
            if (levels.length > 0 && currentLevel) {
                const currentIndex = levels.indexOf(currentLevel);
                if (currentIndex !== -1 && currentIndex < levels.length - 1) {
                    updates.currentDifficultyLevel = levels[currentIndex + 1];
                    result.newDifficulty = updates.currentDifficultyLevel;
                }
            }
        }

        if (Object.keys(updates).length > 0) {
            await ExerciseRepository.updateSettings(exerciseId, updates);
            return result;
        }

        return { progressed: false };
    }
};
