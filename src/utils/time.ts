/**
 * Formats the duration between two dates as a human-readable string.
 * Example: "45m", "1h 15m"
 */
export const formatDuration = (start: Date | string, end: Date | string): string => {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;

    const diffMs = endDate.getTime() - startDate.getTime();

    // Ensure we don't return negative duration
    const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    if (totalMinutes < 60) {
        return `${totalMinutes}m`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
};
