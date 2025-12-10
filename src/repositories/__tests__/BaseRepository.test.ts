import { BaseRepository } from "../BaseRepository";
import { exercises } from "../../db/schema";
import { db } from "../../db/client";
import { eq } from "drizzle-orm";

// Mock the db client
jest.mock("../../db/client", () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

// Concrete implementation for testing
class TestRepository extends BaseRepository<typeof exercises> {
    constructor() {
        super(exercises);
    }
}

describe("BaseRepository", () => {
    let repository: TestRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new TestRepository();
        jest.clearAllMocks();
    });

    describe("getAll", () => {
        it("should return all records", async () => {
            const mockResult = [{ id: 1, name: "Push Up" }];
            const mockFrom = jest.fn().mockResolvedValue(mockResult);
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select.mockImplementation(mockSelect);

            const result = await repository.getAll();

            expect(mockDb.select).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalled(); // select() called
            expect(mockFrom).toHaveBeenCalledWith(exercises);
            expect(result).toEqual(mockResult);
        });
    });

    describe("getById", () => {
        it("should return a record by id", async () => {
            const mockResult = [{ id: 1, name: "Push Up" }];
            const mockWhere = jest.fn().mockResolvedValue(mockResult);
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select.mockImplementation(mockSelect);

            const result = await repository.getById(1);

            expect(mockDb.select).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith(exercises);
            expect(mockWhere).toHaveBeenCalledWith(eq(exercises.id, 1));
            expect(result).toEqual(mockResult[0]);
        });

        it("should return undefined if not found", async () => {
            const mockWhere = jest.fn().mockResolvedValue([]);
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select.mockImplementation(mockSelect);

            const result = await repository.getById(999);

            expect(result).toBeUndefined();
        });
    });

    describe("delete", () => {
        it("should delete a record by id", async () => {
            const mockWhere = jest.fn().mockResolvedValue({ changes: 1 });
            const mockDelete = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.delete.mockImplementation(mockDelete);

            await repository.delete(1);

            expect(mockDb.delete).toHaveBeenCalledWith(exercises);
            expect(mockWhere).toHaveBeenCalledWith(eq(exercises.id, 1));
        });
    });
});
