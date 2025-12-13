import { WorkoutRepository } from "../WorkoutRepository";
import { workout_logs } from "../../db/schema";
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

describe("WorkoutRepository", () => {
    let repository: WorkoutRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new WorkoutRepository();
        jest.clearAllMocks();
    });

    describe("createLog", () => {
        it("should create a workout log for scheduled program", async () => {
            const newLog = { program_id: 1, day_id: 1, created_at: new Date() };
            const mockResult = [{ id: 1, ...newLog }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.createLog(newLog);

            expect(mockDb.insert).toHaveBeenCalledWith(workout_logs);
            expect(mockValues).toHaveBeenCalledWith(newLog);
            expect(result).toEqual(mockResult[0]);
        });

        it("should create an ad-hoc workout log (no program/day)", async () => {
            const newLog = { created_at: new Date() };
            const mockResult = [{ id: 2, ...newLog }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.createLog(newLog);

            expect(mockValues).toHaveBeenCalledWith(newLog);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("updateLog", () => {
        it("should update a workout log", async () => {
            const updateData = { completed_at: new Date() };
            const mockResult = [{ id: 1, ...updateData }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.updateLog(1, updateData);

            expect(mockDb.update).toHaveBeenCalledWith(workout_logs);
            expect(mockSet).toHaveBeenCalledWith(updateData);
            expect(mockWhere).toHaveBeenCalledWith(eq(workout_logs.id, 1));
            expect(result).toEqual(mockResult[0]);
        });
    });

    /*
        describe("createSet", () => {
            it("should create a workout set with minimal data", async () => {
                const newSet = { workout_log_id: 1, exercise_id: 1, set_number: 1 };
                const mockResult = [{ id: 1, ...newSet }];
                const mockReturning = jest.fn().mockResolvedValue(mockResult);
                const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
                const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
                mockDb.insert.mockImplementation(mockInsert);
    
                const result = await repository.createSet(newSet);
    
                expect(mockDb.insert).toHaveBeenCalledWith(workout_exercise_sets);
                expect(mockValues).toHaveBeenCalledWith(newSet);
                expect(result).toEqual(mockResult[0]);
            });
    
            it("should create a skipped set", async () => {
                const newSet = { workout_log_id: 1, exercise_id: 1, set_number: 2, skipped: true };
                const mockResult = [{ id: 2, ...newSet }];
                const mockReturning = jest.fn().mockResolvedValue(mockResult);
                const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
                const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
                mockDb.insert.mockImplementation(mockInsert);
    
                const result = await repository.createSet(newSet);
    
                expect(mockValues).toHaveBeenCalledWith(newSet);
                expect(result).toEqual(mockResult[0]);
            });
    
            it("should create a completed set with performance data", async () => {
                const newSet = {
                    workout_log_id: 1,
                    exercise_id: 1,
                    set_number: 3,
                    actual_reps: 12,
                    actual_weight: 50,
                    actual_time_seconds: 60
                };
                const mockResult = [{ id: 3, ...newSet }];
                const mockReturning = jest.fn().mockResolvedValue(mockResult);
                const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
                const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
                mockDb.insert.mockImplementation(mockInsert);
    
                const result = await repository.createSet(newSet);
    
                expect(mockValues).toHaveBeenCalledWith(newSet);
                expect(result).toEqual(mockResult[0]);
            });
        });
    
        describe("getSetsByLogId", () => {
            it("should return sets for a log", async () => {
                const mockResult = [{ id: 1, workout_log_id: 1 }];
                const mockWhere = jest.fn().mockResolvedValue(mockResult);
                const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
                const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
                mockDb.select.mockImplementation(mockSelect);
    
                const result = await repository.getSetsByLogId(1);
    
                expect(mockDb.select).toHaveBeenCalled();
                expect(mockFrom).toHaveBeenCalledWith(workout_exercise_sets);
                expect(mockWhere).toHaveBeenCalledWith(eq(workout_exercise_sets.workout_log_id, 1));
                expect(result).toEqual(mockResult);
            });
        });
    */
});
