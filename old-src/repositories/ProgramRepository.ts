import { BaseRepository } from "./BaseRepository";
import { programs } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewProgram = InferInsertModel<typeof programs>;

export class ProgramRepository extends BaseRepository<typeof programs> {
    constructor() {
        super(programs);
    }

    async create(program: NewProgram) {
        const result = await this.db.insert(programs).values(program).returning();
        return result[0];
    }

    async update(id: number, program: Partial<NewProgram>) {
        const result = await this.db.update(programs)
            .set(program)
            .where(eq(programs.id, id))
            .returning();
        return result[0];
    }
}
