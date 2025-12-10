import { ExerciseService } from "../ExerciseService";
import { ExerciseRepository } from "../../repositories/ExerciseRepository";
import { generateRandomExercise, generateRandomPartialExercise, getRandomNumber } from "../testUtils";

// Mock the repository
const mockExerciseRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
} as unknown as ExerciseRepository;

describe('ExerciseService', () => {
    let service: ExerciseService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ExerciseService(mockExerciseRepository);
    });

    describe('Standard Operations', () => {
        it('should get all exercises', async () => {
            const exercises = [generateRandomExercise(), generateRandomExercise()];
            (mockExerciseRepository.getAll as jest.Mock).mockResolvedValue(exercises);

            const result = await service.getAllExercises();
            expect(mockExerciseRepository.getAll).toHaveBeenCalled();
            expect(result).toEqual(exercises);
        });

        it('should get exercise by id', async () => {
            const id = getRandomNumber();
            const exercise = generateRandomExercise();
            (mockExerciseRepository.getById as jest.Mock).mockResolvedValue(exercise);

            const result = await service.getExerciseById(id);
            expect(mockExerciseRepository.getById).toHaveBeenCalledWith(id);
            expect(result).toEqual(exercise);
        });

        it('should create an exercise', async () => {
            const newExercise = generateRandomExercise();
            (mockExerciseRepository.create as jest.Mock).mockResolvedValue({ id: 1, ...newExercise });

            const result = await service.createExercise(newExercise);

            expect(mockExerciseRepository.create).toHaveBeenCalledWith(newExercise);
            expect(result).toEqual({ id: 1, ...newExercise });
        });

        it('should delete an exercise', async () => {
            const id = getRandomNumber();
            (mockExerciseRepository.delete as jest.Mock).mockResolvedValue({ id });

            const result = await service.deleteExercise(id);
            expect(mockExerciseRepository.delete).toHaveBeenCalledWith(id);
        });
    });

    describe('Fuzzy Partial Updates', () => {
        it('should update an exercise with random partial data multiple times', async () => {
            const id = getRandomNumber();
            const iterations = 50; // Run multiple times as requested

            for (let i = 0; i < iterations; i++) {
                const partialUpdate = generateRandomPartialExercise();
                (mockExerciseRepository.update as jest.Mock).mockResolvedValue({ id, ...partialUpdate });

                await service.updateExercise(id, partialUpdate);

                expect(mockExerciseRepository.update).toHaveBeenLastCalledWith(id, partialUpdate);
            }
        });
    });

    describe('Edge Cases for Value Types', () => {
        it('should handle empty strings in name', async () => {
            const exercise = generateRandomExercise();
            exercise.name = '';
            (mockExerciseRepository.create as jest.Mock).mockResolvedValue({ id: 1, ...exercise });

            await service.createExercise(exercise);
            expect(mockExerciseRepository.create).toHaveBeenCalledWith(exercise);
        });

        it('should handle long strings in description', async () => {
            const exercise = generateRandomExercise();
            exercise.description = 'a'.repeat(10000);
            (mockExerciseRepository.create as jest.Mock).mockResolvedValue({ id: 1, ...exercise });

            await service.createExercise(exercise);
            expect(mockExerciseRepository.create).toHaveBeenCalledWith(exercise);
        });

        it('should handle null/undefined fields where optional', async () => {
            // NewExercise types might not allow nulls if defined as notNull() in schema
            // But we can test if the service passes them through if we cast
            const exercise = generateRandomExercise();
            // @ts-ignore
            exercise.description = null;

            (mockExerciseRepository.create as jest.Mock).mockResolvedValue({ id: 1, ...exercise });

            await service.createExercise(exercise);
            expect(mockExerciseRepository.create).toHaveBeenCalledWith(exercise);
        });
    });
});
