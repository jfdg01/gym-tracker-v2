import { ExerciseRepository, NewExercise } from "../repositories/ExerciseRepository";

export class ExerciseService {
    constructor(private exerciseRepository: ExerciseRepository) { }

    async getAllExercises() {
        return await this.exerciseRepository.getAll();
    }

    async getExerciseById(id: number) {
        return await this.exerciseRepository.getById(id);
    }

    async createExercise(exercise: NewExercise) {
        return await this.exerciseRepository.create(exercise);
    }

    async updateExercise(id: number, exercise: Partial<NewExercise>) {
        return await this.exerciseRepository.update(id, exercise);
    }

    async deleteExercise(id: number) {
        return await this.exerciseRepository.delete(id);
    }

    async importExercises(data: any[]) {
        return await this.exerciseRepository.importMany(data);
    }
}
