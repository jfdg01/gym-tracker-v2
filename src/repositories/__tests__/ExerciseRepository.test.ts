import { ExerciseRepository } from "../ExerciseRepository";
import { exercises } from "../../db/schema";
import { db } from "../../db/client";
import { eq } from "drizzle-orm";

jest.mock("../../db/client", () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe("ExerciseRepository", () => {
    let repository: ExerciseRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new ExerciseRepository();
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create a new exercise with minimal required fields", async () => {
            const newExercise = { name: "Squat", tracking_type: "reps" as const, resistance_type: "weight" as const, sets: 3 };
            const mockResult = [{ id: 1, ...newExercise }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.create(newExercise);

            expect(mockDb.insert).toHaveBeenCalledWith(exercises);
            expect(mockValues).toHaveBeenCalledWith(newExercise);
            expect(result).toEqual(mockResult[0]);
        });

        it("should create an exercise with all optional fields", async () => {
            const newExercise = {
                name: "Plank",
                description: "Hold position",
                tracking_type: "time" as const,
                resistance_type: "difficulty" as const,
                sets: 1
            };
            const mockResult = [{ id: 2, ...newExercise }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.create(newExercise);

            expect(mockValues).toHaveBeenCalledWith(newExercise);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("update", () => {
        it("should update an exercise name", async () => {
            const updateData = { name: "Updated Squat" };
            const mockResult = [{ id: 1, ...updateData }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.update(1, updateData);

            expect(mockDb.update).toHaveBeenCalledWith(exercises);
            expect(mockSet).toHaveBeenCalledWith(updateData);
            expect(mockWhere).toHaveBeenCalledWith(eq(exercises.id, 1));
            expect(result).toEqual(mockResult[0]);
        });

        it("should update exercise type fields", async () => {
            const updateData = { tracking_type: "time" as const, resistance_type: "difficulty" as const };
            const mockResult = [{ id: 1, ...updateData }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.update(1, updateData);

            expect(mockSet).toHaveBeenCalledWith(updateData);
            expect(result).toEqual(mockResult[0]);
        });
    });
});
