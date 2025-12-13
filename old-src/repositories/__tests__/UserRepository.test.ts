import { UserRepository } from "../UserRepository";
import { user_settings } from "../../db/schema";
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

describe("UserRepository", () => {
    let repository: UserRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new UserRepository();
        jest.clearAllMocks();
    });

    describe("getSettings", () => {
        it("should return user settings", async () => {
            const mockResult = [{ id: 1, language: "es" }];
            const mockWhere = jest.fn().mockResolvedValue(mockResult);
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select.mockImplementation(mockSelect);

            const result = await repository.getSettings();

            expect(mockDb.select).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith(user_settings);
            expect(mockWhere).toHaveBeenCalledWith(eq(user_settings.id, 1));
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("updateSettings", () => {
        it("should update settings", async () => {
            const mockResult = [{ id: 1, language: "en" }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.updateSettings({ language: "en" });

            expect(mockDb.update).toHaveBeenCalledWith(user_settings);
            expect(mockSet).toHaveBeenCalledWith({ language: "en" });
            expect(mockWhere).toHaveBeenCalledWith(eq(user_settings.id, 1));
            expect(result).toEqual(mockResult[0]);
        });

        it("should update nullable fields to null", async () => {
            const mockResult = [{ id: 1, current_program_id: null }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.updateSettings({ language: 'en' });

            expect(mockSet).toHaveBeenCalledWith({ language: 'en' });
            expect(result).toEqual(mockResult[0]);
        });

        it("should update multiple fields at once", async () => {
            const updateData = { language: "fr", name: "Pierre" };
            const mockResult = [{ id: 1, ...updateData }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.updateSettings(updateData);

            expect(mockSet).toHaveBeenCalledWith(updateData);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("ensureSettingsExist", () => {
        it("should create settings if they do not exist", async () => {
            // Mock getSettings to return undefined
            const mockWhereGet = jest.fn().mockResolvedValue([]);
            const mockFromGet = jest.fn().mockReturnValue({ where: mockWhereGet });
            const mockSelectGet = jest.fn().mockReturnValue({ from: mockFromGet });
            mockDb.select.mockImplementation(mockSelectGet);

            // Mock insert
            const mockReturningInsert = jest.fn().mockResolvedValue([{ id: 1 }]);
            const mockValuesInsert = jest.fn().mockReturnValue({ returning: mockReturningInsert });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValuesInsert });
            mockDb.insert.mockImplementation(mockInsert);

            await repository.ensureSettingsExist();

            expect(mockDb.insert).toHaveBeenCalledWith(user_settings);
            expect(mockValuesInsert).toHaveBeenCalledWith({ id: 1 });
        });

        it("should not create settings if they exist", async () => {
            // Mock getSettings to return existing settings
            const mockWhereGet = jest.fn().mockResolvedValue([{ id: 1 }]);
            const mockFromGet = jest.fn().mockReturnValue({ where: mockWhereGet });
            const mockSelectGet = jest.fn().mockReturnValue({ from: mockFromGet });
            mockDb.select.mockImplementation(mockSelectGet);

            await repository.ensureSettingsExist();

            expect(mockDb.insert).not.toHaveBeenCalled();
        });
    });
});
