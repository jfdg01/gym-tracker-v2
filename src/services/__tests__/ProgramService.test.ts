import { ProgramService } from "../ProgramService";
import { ProgramRepository } from "../../repositories/ProgramRepository";
import { DayRepository } from "../../repositories/DayRepository";
import {
    generateRandomProgram,
    generateRandomPartialProgram,
    generateRandomDay,
    generateRandomPartialDay,
    getRandomNumber
} from "../testUtils";

const mockProgramRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
} as unknown as ProgramRepository;

const mockDayRepository = {
    getByProgramId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
} as unknown as DayRepository;

describe('ProgramService', () => {
    let service: ProgramService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ProgramService(mockProgramRepository, mockDayRepository);
    });

    describe('Program Operations', () => {
        it('should create a program', async () => {
            const newProgram = generateRandomProgram();
            (mockProgramRepository.create as jest.Mock).mockResolvedValue({ id: 1, ...newProgram });
            await service.createProgram(newProgram);
            expect(mockProgramRepository.create).toHaveBeenCalledWith(newProgram);
        });

        it('should update a program with fuzzy partials', async () => {
            const id = getRandomNumber();
            for (let i = 0; i < 50; i++) {
                const partial = generateRandomPartialProgram();
                (mockProgramRepository.update as jest.Mock).mockResolvedValue({ id, ...partial });
                await service.updateProgram(id, partial);
                expect(mockProgramRepository.update).toHaveBeenLastCalledWith(id, partial);
            }
        });
    });

    describe('Day Operations', () => {
        it('should create a day', async () => {
            const newDay = generateRandomDay();
            (mockDayRepository.create as jest.Mock).mockResolvedValue({ id: 1, ...newDay });
            await service.createDay(newDay);
            expect(mockDayRepository.create).toHaveBeenCalledWith(newDay);
        });

        it('should update a day with fuzzy partials', async () => {
            const id = getRandomNumber();
            for (let i = 0; i < 50; i++) {
                const partial = generateRandomPartialDay();
                (mockDayRepository.update as jest.Mock).mockResolvedValue({ id, ...partial });
                await service.updateDay(id, partial);
                expect(mockDayRepository.update).toHaveBeenLastCalledWith(id, partial);
            }
        });
    });
});
