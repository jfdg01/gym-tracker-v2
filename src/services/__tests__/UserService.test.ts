import { UserService } from "../UserService";
import { UserRepository } from "../../repositories/UserRepository";
import {
    generateRandomUserSettings,
    generateRandomPartialUserSettings,
    getRandomNumber
} from "../testUtils";

const mockUserRepository = {
    ensureSettingsExist: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
} as unknown as UserRepository;

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new UserService(mockUserRepository);
    });

    describe('User Settings Operations', () => {
        it('should get user settings', async () => {
            const settings = generateRandomUserSettings();
            (mockUserRepository.getSettings as jest.Mock).mockResolvedValue(settings);

            const result = await service.getUserSettings();

            expect(mockUserRepository.ensureSettingsExist).toHaveBeenCalled();
            expect(mockUserRepository.getSettings).toHaveBeenCalled();
            expect(result).toEqual(settings);
        });

        it('should update user settings with fuzzy partials', async () => {
            const iterations = 50;
            for (let i = 0; i < iterations; i++) {
                const partial = generateRandomPartialUserSettings();
                const updatedSettings = { ...generateRandomUserSettings(), ...partial };
                (mockUserRepository.updateSettings as jest.Mock).mockResolvedValue(updatedSettings);

                await service.updateUserSettings(partial);

                expect(mockUserRepository.ensureSettingsExist).toHaveBeenCalled();
                expect(mockUserRepository.updateSettings).toHaveBeenLastCalledWith(partial);
            }
        });
    });
});
