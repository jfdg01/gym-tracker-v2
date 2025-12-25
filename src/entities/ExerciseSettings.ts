export interface ExerciseSettings {
    id: string; // UUID
    exerciseId: string; // FK: Exercise.id
    // Weight-based
    currentWeight: number | null;
    weightIncreaseFactor: number | null;
    // Difficulty-based (user-managed ordered list)
    /** Stored as JSON string in DB; Repository layer handles parse/stringify */
    difficultyLevels: string[]; // e.g., ["Red", "Blue", "Green"]
    currentDifficultyLevel: string | null; // Value-based for stability
    restTimeSeconds: number | null;
    updatedAt: string;
}
