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
    ): Promise<{ progressed: boolean, newWeight?: number, newDifficulty?: string, isMaxLevel?: boolean }> => {
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
                updates.currentWeight = Math.round((currentWeight + increase) * 100) / 100;
                result.newWeight = updates.currentWeight;
            }
        } else {
            // Difficulty progression
            const levels = settings.difficultyLevels;
            // Determine the difficulty used in the session (use the first set with difficulty as reference)
            const usedDifficulty = sets.find(s => s.difficulty)?.difficulty || settings.currentDifficultyLevel;

            if (levels.length > 0 && usedDifficulty) {
                const currentIndex = levels.indexOf(usedDifficulty);
                if (currentIndex !== -1) {
                    if (currentIndex < levels.length - 1) {
                        updates.currentDifficultyLevel = levels[currentIndex + 1];
                        result.newDifficulty = updates.currentDifficultyLevel;
                    } else {
                        // Max level reached.
                        // We return result to indicate success (progressed: true), but no next level updates are applied.
                        return result;
                    }
                } else {
                    // If used difficulty is not in list (or custom), fallback to first level if current is null
                    updates.currentDifficultyLevel = levels[0];
                    result.newDifficulty = updates.currentDifficultyLevel;
                }
            } else if (levels.length > 0 && !settings.currentDifficultyLevel) {
                // Initialize if null
                updates.currentDifficultyLevel = levels[0];
                result.newDifficulty = updates.currentDifficultyLevel;
            }
        }

        if (Object.keys(updates).length > 0) {
            await ExerciseRepository.updateSettings(exerciseId, updates);
            return result;
        }

        return { progressed: false };
    }
};
