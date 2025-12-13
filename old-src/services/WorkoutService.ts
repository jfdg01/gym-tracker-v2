import { WorkoutRepository, NewWorkoutLog } from "../repositories/WorkoutRepository";
import { DayRepository } from "../repositories/DayRepository";
import { ExerciseRepository } from "../repositories/ExerciseRepository";
import { UserRepository } from "../repositories/UserRepository";

export class WorkoutService {
    constructor(
        private workoutRepository: WorkoutRepository,
        private dayRepository: DayRepository,
        private exerciseRepository: ExerciseRepository,
        private userRepository: UserRepository
    ) { }

    async createWorkoutLog(log: NewWorkoutLog) {
        return await this.workoutRepository.createLog(log);
    }

    async updateWorkoutLog(id: number, log: Partial<NewWorkoutLog>) {
        return await this.workoutRepository.updateLog(id, log);
    }

    async getDayWithExercises(dayId: number) {
        const day = await this.dayRepository.getById(dayId);
        if (!day) {
            throw new Error('Day not found');
        }
        const exercises = await this.dayRepository.getDayExercisesWithDetails(dayId);
        return { day, exercises };
    }

    async startWorkout(dayId: number, programId: number | null) {
        // Create a new workout log with created_at
        const log: NewWorkoutLog = {
            day_id: dayId,
            program_id: programId,
            created_at: new Date(),
        };

        const result = await this.workoutRepository.createLog(log);
        return result.id;
    }

    async saveSetLog(workoutLogId: number, setLog: any) {
        await this.workoutRepository.createSetLogs([{
            ...setLog,
            workout_log_id: workoutLogId
        }]);
    }

    async completeWorkout(logId: number, setLogs: any[], isCompleted: boolean) {
        // 1. Mark as completed (update timestamp) if fully completed
        if (isCompleted) {
            await this.workoutRepository.updateLog(logId, {
                completed_at: new Date()
            });
        }

        // 2. Save Set Logs
        if (setLogs.length > 0) {
            // Map setLogs to include workout_log_id
            const logsToSave = setLogs.map(log => ({
                ...log,
                workout_log_id: logId
            }));
            await this.workoutRepository.createSetLogs(logsToSave);
        }

        // 3. Update User Program Progress (Last Completed Day) ONLY if completed
        if (isCompleted) {
            // Fetch the log to get program_id and day_id
            const completedLog = await this.workoutRepository.getById(logId);

            if (!completedLog || !completedLog.day_id || !completedLog.program_id) return;

            const userPrograms = await this.userRepository.getUserPrograms();
            const activeProgram = userPrograms.find(up => up.program_id === completedLog.program_id);

            if (activeProgram) {
                await this.userRepository.updateUserProgram(activeProgram.id, {
                    last_completed_day_id: completedLog.day_id
                });
            }
        }
    }

    private async _calculateCompletionStatus(log: any, setLogs: any[]): Promise<string | Date | null> {
        if (log.completed_at) return log.completed_at;

        try {
            const exercises = await this.dayRepository.getDayExercisesWithDetails(log.day_id);

            const missingNames: string[] = [];
            const partialNames: string[] = [];

            for (const ex of exercises) {
                const exerciseLogs = setLogs.filter(s => s.exercise_id === ex.exercise_id);
                const setsLogged = exerciseLogs.length;
                const setsRequired = ex.sets || 0;

                if (setsLogged === 0) {
                    missingNames.push(ex.name);
                } else if (setsLogged < setsRequired) {
                    const startSkipped = exerciseLogs.some(s => s.is_skipped);
                    if (!startSkipped) {
                        partialNames.push(`${ex.name} (${setsLogged}/${setsRequired})`);
                    }
                }
            }

            const parts: string[] = [];
            if (missingNames.length > 0) {
                parts.push(`Missing: ${missingNames.join(', ')}`);
            }
            if (partialNames.length > 0) {
                parts.push(`Partial: ${partialNames.join(', ')}`);
            }

            if (parts.length > 0) {
                return parts.join(' | ');
            } else {
                return 'Incomplete (Unknown)';
            }
        } catch (error) {
            // Keep error generic or make it "Unknown" to look cleaner
            return 'Incomplete (Unknown)';
        }
    }

    async getAllWorkoutLogs() {
        const logs = await this.workoutRepository.getAll();

        const enrichedLogs = await Promise.all(logs.map(async (log) => {
            const setLogs = await this.workoutRepository.getSetLogsByWorkoutId(log.id);
            const status = await this._calculateCompletionStatus(log, setLogs);
            return {
                ...log,
                completed_at: status
            };
        }));

        return enrichedLogs;
    }

    async importWorkoutLogs(data: any[]) {
        return await this.workoutRepository.importMany(data);
    }

    async getAllWorkoutSetLogs() {
        return await this.workoutRepository.getAllSetLogs();
    }

    async importWorkoutSetLogs(data: any[]) {
        return await this.workoutRepository.importSetLogs(data);
    }

    async getWorkoutDetails(workoutId: number) {
        const log = await this.workoutRepository.getById(workoutId);
        if (!log) return null;

        const sets = await this.workoutRepository.getSetLogsByWorkoutId(workoutId);

        // Calculate granular status if incomplete
        if (!log.completed_at) {
            const status = await this._calculateCompletionStatus(log, sets);
            // Enrich log object for display
            (log as any).completed_at = status;
        }

        // Enrich sets with exercise names
        const enrichedSets = await Promise.all(sets.map(async (set) => {
            const exercise = await this.exerciseRepository.getById(set.exercise_id);
            return {
                ...set,
                exercise_name: exercise ? exercise.name : 'Unknown Exercise'
            };
        }));

        return {
            log,
            sets: enrichedSets
        };
    }
}
