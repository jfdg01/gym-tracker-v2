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
        // Check if at least target sets are present
        if (sets.length < snapshot.sets) {
            return { progressed: false };
        }

        // Verify targets were met for all sets
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

        // Apply progression settings
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
                        // Check if the NEW level is the max level
                        if (currentIndex + 1 === levels.length - 1) {
                            result.isMaxLevel = true;
                        }
                    } else {
                        // Max level already reached. Return success with current level.
                        result.newDifficulty = usedDifficulty;
                        result.isMaxLevel = true;
                        return result;
                    }
                } else {
                    // If used difficulty is not in list (or custom), fallback to first level if current is null
                    updates.currentDifficultyLevel = levels[0];
                    result.newDifficulty = updates.currentDifficultyLevel;
                    if (levels.length === 1) {
                        result.isMaxLevel = true;
                    }
                }
            } else if (levels.length > 0 && !settings.currentDifficultyLevel) {
                // Initialize default difficulty level if currently null
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
