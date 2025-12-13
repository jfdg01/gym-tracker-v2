import { UserRepository, NewUserSettings, NewUserProgram } from "../repositories/UserRepository";

export class UserService {
    constructor(private userRepository: UserRepository) { }

    async getUserSettings() {
        await this.userRepository.ensureSettingsExist();
        return await this.userRepository.getSettings();
    }

    async updateUserSettings(settings: Partial<NewUserSettings>) {
        await this.userRepository.ensureSettingsExist();
        return await this.userRepository.updateSettings(settings);
    }

    async getActiveProgram() {
        return await this.userRepository.getActiveProgram();
    }

    async joinProgram(programId: number) {
        // Deactivate others? - Implementing simple create for now
        // Ideally should check if already active, etc.
        const newProgram: NewUserProgram = {
            program_id: programId,
            is_active: true,
        };
        return await this.userRepository.createUserProgram(newProgram);
    }

    async getAllUserSettings() {
        return await this.userRepository.getAll();
    }

    async getAllUserPrograms() {
        return await this.userRepository.getUserPrograms();
    }

    async importUserSettings(data: any[]) {
        return await this.userRepository.importMany(data);
    }

    async importUserPrograms(data: any[]) {
        return await this.userRepository.importUserPrograms(data);
    }
}
