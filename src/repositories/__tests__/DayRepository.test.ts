import { DayRepository } from "../DayRepository";
import { days } from "../../db/schema";
import { db } from "../../db/client.native";
import { eq } from "drizzle-orm";

jest.mock("../../db/client", () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe("DayRepository", () => {
    let repository: DayRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new DayRepository();
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create a new day", async () => {
            const newDay = { name: "Leg Day", program_id: 1, order_index: 0, is_rest_day: false };
            const mockResult = [{ id: 1, ...newDay }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.create(newDay);

            expect(mockDb.insert).toHaveBeenCalledWith(days);
            expect(mockValues).toHaveBeenCalledWith(newDay);
            expect(result).toEqual(mockResult[0]);
        });

        it("should create a rest day", async () => {
            const newDay = { name: "Rest", program_id: 1, order_index: 1, is_rest_day: true };
            const mockResult = [{ id: 2, ...newDay }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.create(newDay);

            expect(mockValues).toHaveBeenCalledWith(newDay);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("update", () => {
        it("should update a day", async () => {
            const updateData = { name: "Updated Leg Day" };
            const mockResult = [{ id: 1, ...updateData }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.update(1, updateData);

            expect(mockDb.update).toHaveBeenCalledWith(days);
            expect(mockSet).toHaveBeenCalledWith(updateData);
            expect(mockWhere).toHaveBeenCalledWith(eq(days.id, 1));
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("getByProgramId", () => {
        it("should return days for a program", async () => {
            const mockResult = [{ id: 1, name: "Leg Day", program_id: 1 }];
            const mockWhere = jest.fn().mockResolvedValue(mockResult);
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select.mockImplementation(mockSelect);

            const result = await repository.getByProgramId(1);

            expect(mockDb.select).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith(days);
            expect(mockWhere).toHaveBeenCalledWith(eq(days.program_id, 1));
            expect(result).toEqual(mockResult);
        });
    });
});
