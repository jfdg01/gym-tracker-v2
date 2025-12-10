import { BaseRepository } from "./BaseRepository";
import { workout_logs, workout_set_logs } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewWorkoutLog = InferInsertModel<typeof workout_logs>;
export type NewWorkoutSetLog = InferInsertModel<typeof workout_set_logs>;

export class WorkoutRepository extends BaseRepository<typeof workout_logs> {
    constructor() {
        super(workout_logs);
    }

    async createLog(log: NewWorkoutLog) {
        const result = await this.db.insert(workout_logs).values(log).returning();
        return result[0];
    }

    async updateLog(id: number, log: Partial<NewWorkoutLog>) {
        const result = await this.db.update(workout_logs)
            .set(log)
            .where(eq(workout_logs.id, id))
            .returning();
        return result[0];
    }

    async createSetLogs(logs: NewWorkoutSetLog[]) {
        if (logs.length === 0) return;
        return await this.db.insert(workout_set_logs).values(logs);
    }

    async getById(id: number) {
        const result = await this.db.select().from(workout_logs).where(eq(workout_logs.id, id));
        return result[0];
    }

    async getSetLogsByWorkoutId(workoutId: number) {
        return await this.db.select().from(workout_set_logs).where(eq(workout_set_logs.workout_log_id, workoutId));
    }

    async getAllSetLogs() {
        return await this.db.select().from(workout_set_logs);
    }

    async importSetLogs(data: any[]) {
        if (!data || data.length === 0) return;
        return await this.db.insert(workout_set_logs).values(data).onConflictDoNothing();
    }
}
