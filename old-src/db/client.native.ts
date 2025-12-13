import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as schema from "./schema";
import migrations from "../../drizzle/migrations";

const expoDb = openDatabaseSync("gym-tracker.db");
export const db = drizzle(expoDb, { schema });

// Run migrations using Drizzle's migration system
export function runMigrations() {
    const { success, error } = useMigrations(db, migrations);

    if (error) {
        console.error('❌ Migration error:', error);
    } else if (success) {
        console.log('✅ Database migrations completed');
    }
}

// Run migrations immediately
runMigrations();