import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

export const expoDb = openDatabaseSync('gym-tracker.db');
export const db = drizzle(expoDb);