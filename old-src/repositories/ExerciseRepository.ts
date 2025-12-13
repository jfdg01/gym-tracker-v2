import { BaseRepository } from "./BaseRepository";
import { exercises } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewExercise = InferInsertModel<typeof exercises>;

export class ExerciseRepository extends BaseRepository<typeof exercises> {
    constructor() {
        super(exercises);
    }

    async create(exercise: NewExercise) {
        const result = await this.db.insert(exercises).values(exercise).returning();
        return result[0];
    }

    async update(id: number, exercise: Partial<NewExercise>) {
        const result = await this.db.update(exercises)
            .set(exercise)
            .where(eq(exercises.id, id))
            .returning();
        return result[0];
    }
}
