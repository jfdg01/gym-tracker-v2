export interface ProgramDay {
    id: string; // UUID
    programId: string; // FK: Program.id
    name: string;
    orderIndex: number;
}
