import { NewExercise } from "../repositories/ExerciseRepository";

export const getRandomString = (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const getRandomNumber = (min: number = 0, max: number = 100): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomBoolean = (): boolean => {
    return Math.random() < 0.5;
};

export const getRandomEnum = <T>(values: T[]): T => {
    return values[Math.floor(Math.random() * values.length)];
};

export const generateRandomExercise = (): NewExercise => {
    return {
        name: getRandomString(15),
        description: getRandomString(50),
        tracking_type: getRandomEnum(['reps', 'time']),
        resistance_type: getRandomEnum(['weight', 'text']),
        sets: getRandomNumber(1, 5),
        max_reps: getRandomNumber(1, 20),
        max_time: getRandomNumber(10, 120),
        current_weight: getRandomNumber(5, 50),
        weight_increase_rate: 2.5,
        rest_time_seconds: 60,
        difficulty_qualitative: getRandomString(10),
    } as NewExercise;
};

export const generateRandomPartialExercise = (): Partial<NewExercise> => {
    const exercise = generateRandomExercise();
    const partial: Partial<NewExercise> = {};

    if (getRandomBoolean()) partial.name = exercise.name;
    if (getRandomBoolean()) partial.description = exercise.description;
    if (getRandomBoolean()) partial.tracking_type = exercise.tracking_type;
    if (getRandomBoolean()) partial.resistance_type = exercise.resistance_type;
    if (getRandomBoolean()) partial.sets = exercise.sets;

    return partial;
};

export const generateRandomProgram = (): any => {
    return {
        name: getRandomString(15),
        description: getRandomString(50),
    };
};

export const generateRandomPartialProgram = (): any => {
    const program = generateRandomProgram();
    const partial: any = {};
    if (getRandomBoolean()) partial.name = program.name;
    if (getRandomBoolean()) partial.description = program.description;
    return partial;
};

export const generateRandomDay = (programId: number = 1): any => {
    return {
        program_id: programId,
        name: getRandomString(10),
        is_rest_day: getRandomBoolean(),
        order_index: getRandomNumber(1, 10),
    };
};

export const generateRandomPartialDay = (): any => {
    const day = generateRandomDay();
    const partial: any = {};
    if (getRandomBoolean()) partial.name = day.name;
    if (getRandomBoolean()) partial.is_rest_day = day.is_rest_day;
    if (getRandomBoolean()) partial.order_index = day.order_index;
    return partial;
};

export const generateRandomUserSettings = (): any => {
    return {
        language: getRandomEnum(['es', 'en', 'fr']),
        name: getRandomString(10),
    };
};

export const generateRandomPartialUserSettings = (): any => {
    const settings = generateRandomUserSettings();
    const partial: any = {};
    if (getRandomBoolean()) partial.language = settings.language;
    if (getRandomBoolean()) partial.name = settings.name;
    return partial;
};

export const generateRandomWorkoutLog = (): any => {
    return {
        program_id: getRandomNumber(),
        day_id: getRandomNumber(),
        duration_seconds: getRandomNumber(60, 3600),
    };
};

export const generateRandomPartialWorkoutLog = (): any => {
    const log = generateRandomWorkoutLog();
    const partial: any = {};
    if (getRandomBoolean()) partial.program_id = log.program_id;
    if (getRandomBoolean()) partial.day_id = log.day_id;
    if (getRandomBoolean()) partial.duration_seconds = log.duration_seconds;
    return partial;
};


