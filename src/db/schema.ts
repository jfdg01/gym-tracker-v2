import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const exercises = sqliteTable("exercises", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category: text("category").notNull(),
});
