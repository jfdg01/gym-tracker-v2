import { ProgramRepository } from "../ProgramRepository";
import { programs } from "../../db/schema";
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

describe("ProgramRepository", () => {
    let repository: ProgramRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new ProgramRepository();
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create a new program with name only", async () => {
            const newProgram = { name: "PPL" };
            const mockResult = [{ id: 1, ...newProgram }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.create(newProgram);

            expect(mockDb.insert).toHaveBeenCalledWith(programs);
            expect(mockValues).toHaveBeenCalledWith(newProgram);
            expect(result).toEqual(mockResult[0]);
        });

        it("should create a program with description", async () => {
            const newProgram = { name: "Full Body", description: "3 days a week" };
            const mockResult = [{ id: 2, ...newProgram }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.create(newProgram);

            expect(mockValues).toHaveBeenCalledWith(newProgram);
            expect(result).toEqual(mockResult[0]);
        });

        it("should handle special characters in name", async () => {
            const newProgram = { name: "Gara's Prográm! @#$%" };
            const mockResult = [{ id: 3, ...newProgram }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.create(newProgram);

            expect(mockValues).toHaveBeenCalledWith(newProgram);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("update", () => {
        it("should update a program", async () => {
            const updateData = { name: "Updated PPL" };
            const mockResult = [{ id: 1, ...updateData }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.update(1, updateData);

            expect(mockDb.update).toHaveBeenCalledWith(programs);
            expect(mockSet).toHaveBeenCalledWith(updateData);
            expect(mockWhere).toHaveBeenCalledWith(eq(programs.id, 1));
            expect(result).toEqual(mockResult[0]);
        });
    });
});
