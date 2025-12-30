/**
 * A simple in-memory cache service to prevent redundant database fetches
 * during tab navigation and frequent focus changes.
 */

type CacheValue = any;

class CacheServiceClass {
    private cache: Map<string, CacheValue> = new Map();

    /**
     * Gets a value from the cache.
     */
    get<T>(key: string): T | null {
        const value = this.cache.get(key);
        return value !== undefined ? (value as T) : null;
    }

    /**
     * Sets a value in the cache.
     */
    set<T>(key: string, data: T): void {
        this.cache.set(key, data);
    }

    /**
     * Invalidates a specific cache key.
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clears all cached data.
     */
    clearAll(): void {
        this.cache.clear();
    }
}

export const CacheService = new CacheServiceClass();

/**
 * Common cache keys for standard lists.
 */
export const CACHE_KEYS = {
    PROGRAMS: 'programs',
    EXERCISES: 'exercises',
    HISTORY: 'history',
    PROGRAM_STATS: 'program_stats',
};
