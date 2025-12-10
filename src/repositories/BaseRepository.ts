import { db } from "../db/client";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

export abstract class BaseRepository<T extends SQLiteTableWithColumns<any>> {
    constructor(protected table: T) { }

    protected get db() {
        return db;
    }

    async getAll() {
        return await this.db.select().from(this.table);
    }

    async getById(id: number) {
        const result = await this.db.select().from(this.table).where(eq(this.table.id, id));
        return result[0];
    }

    async delete(id: number) {
        return await this.db.delete(this.table).where(eq(this.table.id, id));
    }

    async importMany(data: any[]) {
        if (!data || data.length === 0) return;
        return await this.db.insert(this.table).values(data).onConflictDoNothing();
    }
}
