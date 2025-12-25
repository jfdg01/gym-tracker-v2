export interface Program {
    id: string; // UUID
    name: string;
    description: string | null;
    lastCompletedDayId: string | null; // FK: ProgramDay.id, null = never started
    createdAt: string;
    updatedAt: string;
}
