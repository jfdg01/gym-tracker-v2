import { BaseRepository } from "./BaseRepository";
import { user_settings, user_programs } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewUserSettings = InferInsertModel<typeof user_settings>;
export type NewUserProgram = InferInsertModel<typeof user_programs>;

export class UserRepository extends BaseRepository<typeof user_settings> {
    constructor() {
        super(user_settings);
    }

    async getSettings() {
        // Singleton, ID is always 1
        const result = await this.db.select().from(user_settings).where(eq(user_settings.id, 1));
        return result[0];
    }

    async updateSettings(settings: Partial<NewUserSettings>) {
        const result = await this.db.update(user_settings)
            .set(settings)
            .where(eq(user_settings.id, 1))
            .returning();
        return result[0];
    }

    async ensureSettingsExist() {
        const existing = await this.getSettings();
        if (!existing) {
            await this.db.insert(user_settings).values({ id: 1 }).returning();
        }
    }

    // User Programs Methods
    async getUserPrograms() {
        return await this.db.select().from(user_programs);
    }

    async createUserProgram(program: NewUserProgram) {
        const result = await this.db.insert(user_programs).values(program).returning();
        return result[0];
    }

    async updateUserProgram(id: number, data: Partial<NewUserProgram>) {
        const result = await this.db.update(user_programs)
            .set(data)
            .where(eq(user_programs.id, id))
            .returning();
        return result[0];
    }

    async getActiveProgram() {
        const result = await this.db.select().from(user_programs).where(eq(user_programs.is_active, true));
        return result[0];
    }

    async importUserPrograms(data: any[]) {
        if (!data || data.length === 0) return;
        return await this.db.insert(user_programs).values(data).onConflictDoNothing();
    }
}
