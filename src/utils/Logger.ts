/**
 * Utility for performance monitoring and structured logging.
 */
export const Logger = {
    // Stores start times for labels to mimic console.time
    _timers: new Map<string, number>(),

    /**
     * Starts a timer for performance measurement.
     * Use this with stopTimer for simple cases.
     */
    startTimer: (label: string) => {
        if (__DEV__) {
            Logger._timers.set(label, performance.now());
        }
    },

    /**
     * Stops a timer and logs the duration.
     * Note: If called multiple times concurrently with the same label, 
     * it will use the most recent start time. Use getTimer for better concurrency.
     */
    stopTimer: (label: string) => {
        if (__DEV__) {
            const start = Logger._timers.get(label);
            if (start) {
                const duration = performance.now() - start;
                console.log(`[PERF] ${label}: ${duration.toFixed(3)} ms`);
                Logger._timers.delete(label);
            }
        }
    },

    /**
     * Returns a function that, when called, logs the time elapsed since this call.
     * Best for concurrent operations.
     */
    getTimer: (label: string) => {
        if (!__DEV__) return () => {};
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            console.log(`[PERF] ${label}: ${duration.toFixed(3)} ms`);
        };
    },

    /**
     * Logs an informational message with a prefix.
     */
    info: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.log(`[INFO] ${message}`, ...args);
        }
    },

    /**
     * Logs a warning message with a prefix.
     */
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },

    /**
     * Logs an error message with a prefix.
     */
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    }
};
