import * as fs from 'fs';
import * as path from 'path';
import { db } from "../../db/client";
import {
    exercises, programs, days, day_exercises,
    user_settings, user_programs, workout_logs, workout_set_logs
} from "../../db/schema";
import { ExerciseService } from "../../services/ExerciseService";
import { ProgramService } from "../../services/ProgramService";
import { UserService } from "../../services/UserService";
import { WorkoutService } from "../../services/WorkoutService";
import { ProgramRepository } from "../../repositories/ProgramRepository";

export interface DataServices {
    exerciseService: ExerciseService;
    programService: ProgramService;
    userService: UserService;
    workoutService: WorkoutService;
    programRepo: ProgramRepository;
}

const DATA_DIR = path.join(__dirname, '../data');

// --- Types ---

interface ExportMetadata {
    version: string;
    exported_at: string;
    app_version?: string;
}

interface ExportData {
    metadata: ExportMetadata;
    data: {
        exercises: any[];
        programs: any[];
        days: any[];
        day_exercises: any[];
        user_settings: any[];
        user_programs: any[];
        workout_logs: any[];
        workout_set_logs: any[];
    };
}

// --- Helper Functions ---

const ensureDataDir = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
};

const getTimestampFilename = (prefix: string = 'gym_tracker_export') => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${prefix}_${dateStr}_${timeStr}.json`;
};

// --- Export Logic ---

export const handleExportData = async (
    services: DataServices,
    askQuestion: (query: string) => Promise<string>
) => {
    const { exerciseService, programService, userService, workoutService } = services;

    try {
        console.log("Gathering data...");
        const allExercises = await exerciseService.getAllExercises();
        const programsData = await programService.getAllPrograms();
        const allDays = await programService.getAllDays();
        const allDayExercises = await programService.getAllDayExercises();
        const allUserSettings = await userService.getAllUserSettings();
        const allUserPrograms = await userService.getAllUserPrograms();
        const allWorkoutLogs = await workoutService.getAllWorkoutLogs();

        const exportData: ExportData = {
            metadata: {
                version: "1.0",
                exported_at: new Date().toISOString(),
            },
            data: {
                exercises: allExercises,
                programs: programsData,
                days: allDays,
                day_exercises: allDayExercises,
                user_settings: allUserSettings,
                user_programs: allUserPrograms,
                workout_logs: allWorkoutLogs,
                workout_set_logs: await workoutService.getAllWorkoutSetLogs()
            }
        };

        const defaultFilename = getTimestampFilename();
        const filenameInput = await askQuestion(`Enter filename to export to (default: ${defaultFilename}): `);
        const finalFilename = filenameInput.trim() || defaultFilename;
        // Append .json if missing
        const finalFilenameWithExt = finalFilename.endsWith('.json') ? finalFilename : `${finalFilename}.json`;

        ensureDataDir();
        const finalPath = path.join(DATA_DIR, finalFilenameWithExt);

        fs.writeFileSync(finalPath, JSON.stringify(exportData, null, 2));
        console.log(`\n✅ Data exported successfully to: ${finalPath}`);

    } catch (error) {
        console.error("❌ Error exporting data:", error);
    }
};

// --- Import Logic ---

const wipeDatabase = async () => {
    console.log("⚠️  Wiping database...");
    // Order matters greatly due to foreign keys
    await db.delete(workout_set_logs); // Delete set logs first
    await db.delete(workout_logs);
    await db.delete(user_programs);
    await db.delete(day_exercises);
    await db.delete(days);
    await db.delete(programs); // user_programs, days ref programs
    await db.delete(exercises); // day_exercises, workout_logs ref exercises (indirectly via logic or direct FKs depending on schema evolution)
    await db.delete(user_settings);
    console.log("✅ Database wiped.");
};

const processImport = async (
    services: DataServices,
    data: any,
    mode: 'WIPE_RESTORE' | 'APPEND'
) => {
    const { exerciseService, programService, userService, workoutService } = services;

    // If legacy format (direct keys), wrap it. If new format (under .data), use it.
    const importContent = data.metadata ? data.data : data;

    if (mode === 'WIPE_RESTORE') {
        await wipeDatabase();
    }

    console.log(`Processing import (Mode: ${mode})...`);

    // Helper to log results
    const logResult = (entity: string, result: any) => {
        if (mode === 'APPEND') {
            // BaseRepository doesn't return counts for conflict ignores easily, 
            // but we can assume success if no error thrown.
            // console.log(`  Processed ${entity}.`);
        }
    };

    if (importContent.exercises?.length) {
        await exerciseService.importExercises(importContent.exercises);
        console.log(`  - Exercises processed.`);
    }

    if (importContent.programs?.length) {
        await programService.importPrograms(importContent.programs);
        console.log(`  - Programs processed.`);
    }

    if (importContent.days?.length) {
        await programService.importDays(importContent.days);
        console.log(`  - Days processed.`);
    }

    if (importContent.day_exercises?.length) {
        await programService.importDayExercises(importContent.day_exercises);
        console.log(`  - Day Exercises processed.`);
    }

    if (importContent.user_settings?.length) {
        await userService.importUserSettings(importContent.user_settings);
        console.log(`  - User Settings processed.`);
    }

    if (importContent.user_programs?.length) {
        await userService.importUserPrograms(importContent.user_programs);
        console.log(`  - User Programs processed.`);
    }

    if (importContent.workout_logs?.length) {
        // Fix dates
        const formattedLogs = importContent.workout_logs.map((log: any) => ({
            ...log,
            created_at: new Date(log.created_at),
            completed_at: log.completed_at ? new Date(log.completed_at) : null
        }));
        await workoutService.importWorkoutLogs(formattedLogs);
        console.log(`  - Workout Logs processed.`);
    }

    if (importContent.workout_set_logs?.length) {
        await workoutService.importWorkoutSetLogs(importContent.workout_set_logs);
        console.log(`  - Workout Set Logs processed.`);
    }

    console.log("\n✅ Import completed successfully.");
};

export const handleImportData = async (
    services: DataServices,
    askQuestion: (query: string) => Promise<string>
) => {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            console.error(`❌ Data directory not found at ${DATA_DIR}`);
            return;
        }

        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

        if (files.length === 0) {
            console.log("❌ No JSON files found in data directory.");
            return;
        }

        console.log("\n--- Available Files ---");
        files.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });

        const fileAnswer = await askQuestion("\nSelect file number to import (or 'c' to cancel): ");
        if (fileAnswer.toLowerCase() === 'c') return;

        const fileIndex = parseInt(fileAnswer) - 1;

        if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= files.length) {
            console.error("❌ Invalid selection.");
            return;
        }

        const fileName = files[fileIndex];
        const filePath = path.join(DATA_DIR, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        if (!fileContent.trim()) {
            console.error("❌ Selected file is empty.");
            return;
        }

        let parsedData;
        try {
            parsedData = JSON.parse(fileContent);
        } catch (e) {
            console.error("❌ Failed to parse JSON file.");
            return;
        }

        console.log("\n--- Import Modes ---");
        console.log("1. APPEND (Skip existing): Add new data only. Ignores records with existing IDs.");
        console.log("2. WIPE & RESTORE: ⚠️  DELETE ALL CURRENT DATA and replace with file data.");

        const modeAnswer = await askQuestion("Select import mode: ");

        if (modeAnswer === '1') {
            await processImport(services, parsedData, 'APPEND');
        } else if (modeAnswer === '2') {
            const confirm = await askQuestion("⚠️  DANGER: This will delete ALL data. Are you sure? (type 'yes' to confirm): ");
            if (confirm.toLowerCase() === 'yes') {
                // Optional: Force a backup?
                const backup = await askQuestion("Do you want to create a backup first? (y/n): ");
                if (backup.toLowerCase() === 'y') {
                    await handleExportData(services, askQuestion);
                }
                await processImport(services, parsedData, 'WIPE_RESTORE');
            } else {
                console.log("Import cancelled.");
            }
        } else {
            console.log("Invalid mode selected.");
        }

    } catch (error) {
        console.error("❌ Error importing data:", error);
    }
};

