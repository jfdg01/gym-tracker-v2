import { BaseRepository } from "./BaseRepository";
import { days, day_exercises, exercises } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewDay = InferInsertModel<typeof days>;

export class DayRepository extends BaseRepository<typeof days> {
    constructor() {
        super(days);
    }

    async create(day: NewDay) {
        const result = await this.db.insert(days).values(day).returning();
        return result[0];
    }

    async update(id: number, day: Partial<NewDay>) {
        const result = await this.db.update(days)
            .set(day)
            .where(eq(days.id, id))
            .returning();
        return result[0];
    }

    async getByProgramId(programId: number) {
        return await this.db.select().from(days).where(eq(days.program_id, programId));
    }

    async getDayExercises(dayId: number) {
        return await this.db.select().from(day_exercises).where(eq(day_exercises.day_id, dayId));
    }

    async getDayExercisesWithDetails(dayId: number) {
        return await this.db.select({
            id: day_exercises.id,
            day_id: day_exercises.day_id,
            exercise_id: day_exercises.exercise_id,
            order_index: day_exercises.order_index,
            // Configuration now comes from exercises
            sets: exercises.sets,
            max_reps: exercises.max_reps,
            max_time: exercises.max_time,
            current_weight: exercises.current_weight,
            weight_increase_rate: exercises.weight_increase_rate,
            difficulty_qualitative: exercises.difficulty_qualitative,
            rest_time_seconds: exercises.rest_time_seconds,
            name: exercises.name,
            description: exercises.description,
            tracking_type: exercises.tracking_type,
            resistance_type: exercises.resistance_type,
        })
            .from(day_exercises)
            .innerJoin(exercises, eq(day_exercises.exercise_id, exercises.id))
            .where(eq(day_exercises.day_id, dayId))
            .orderBy(day_exercises.order_index);
    }

    async getAllDayExercises() {
        return await this.db.select().from(day_exercises);
    }

    async importDayExercises(data: any[]) {
        if (!data || data.length === 0) return;
        return await this.db.insert(day_exercises).values(data).onConflictDoNothing();
    }
}
