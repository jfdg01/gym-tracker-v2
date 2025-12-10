import { ExerciseRepository } from "../repositories/ExerciseRepository";
import { ProgramRepository } from "../repositories/ProgramRepository";
import { DayRepository } from "../repositories/DayRepository";
import { UserRepository } from "../repositories/UserRepository";
import { WorkoutRepository } from "../repositories/WorkoutRepository";
import { ExerciseService } from "../services/ExerciseService";
import { ProgramService } from "../services/ProgramService";
import { UserService } from "../services/UserService";
import { WorkoutService } from "../services/WorkoutService";
import * as readline from 'readline';


import { handleViewPrograms } from "./modules/ProgramMenu";
import { handleExportData, handleImportData, DataServices } from "./modules/DataTransfer";
import { handleWorkoutMenu } from "./modules/WorkoutMenu";
import { handleSettingsMenu } from "./modules/SettingsMenu";
import { clearScreen, waitForKey } from "./modules/ConsoleUI";


// Initialize Repositories
const exerciseRepo = new ExerciseRepository();
const programRepo = new ProgramRepository();
const dayRepo = new DayRepository();
const userRepo = new UserRepository();
const workoutRepo = new WorkoutRepository();

// Initialize Services
const exerciseService = new ExerciseService(exerciseRepo);
const programService = new ProgramService(programRepo, dayRepo);
const userService = new UserService(userRepo);
const workoutService = new WorkoutService(workoutRepo, dayRepo, exerciseRepo, userRepo);

const services: DataServices = {
    exerciseService,
    programService,
    userService,
    workoutService,
    programRepo
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

// Local importData/exportData removed - imported from modules/DataTransfer

// Local handleViewPrograms removed - imported from modules/ProgramMenu



async function main() {
    clearScreen();
    console.log("Welcome to the Gym Tracker Console App!");


    while (true) {
        clearScreen();
        console.log("\n--- Menu ---");
        console.log("1. Start Workout");
        console.log("2. View Exercises");
        console.log("3. View Programs (Interactive)");
        console.log("4. View Days");
        console.log("5. View Workout Logs");
        console.log("6. Settings & Data");
        console.log("7. Exit");

        const answer = await askQuestion("Select an option: ");

        try {
            switch (answer) {
                case '1':
                    await handleWorkoutMenu(services, askQuestion);
                    break;
                case '2':
                    clearScreen();
                    console.log("\n--- Exercises ---");
                    const allExercises = await exerciseService.getAllExercises();
                    const displayExercises = allExercises.map(ex => ({
                        ...ex,
                        description: ex.description && ex.description.length > 10
                            ? ex.description.substring(0, 10) + '...'
                            : ex.description
                    }));
                    console.table(displayExercises);
                    await waitForKey(askQuestion);
                    break;
                case '3':
                    await handleViewPrograms(programService, askQuestion);
                    break;
                case '4':
                    clearScreen();
                    console.log("\n--- Days ---");
                    const allDays = await programService.getAllDays();
                    console.table(allDays);
                    await waitForKey(askQuestion);
                    break;
                case '5':
                    while (true) {
                        clearScreen();
                        console.log("\n--- Workout Logs ---");
                        const logs = await workoutService.getAllWorkoutLogs();
                        console.table(logs);

                        const logIdStr = await askQuestion("\nEnter Workout ID to view details (or 0 to back): ");
                        if (logIdStr === '0' || logIdStr === '') break;

                        const logId = parseInt(logIdStr);
                        if (isNaN(logId)) {
                            console.log("Invalid ID.");
                            await waitForKey(askQuestion);
                            continue;
                        }

                        clearScreen();
                        console.log(`\n--- Details for Workout #${logId} ---`);
                        const details = await workoutService.getWorkoutDetails(logId);

                        if (!details) {
                            console.log("Workout not found.");
                            await waitForKey(askQuestion);
                            continue;
                        }

                        console.log("General Info:");
                        console.table([details.log]);

                        console.log("\nSets:");
                        if (details.sets.length === 0) {
                            console.log("No sets logged for this workout.");
                        } else {
                            const formattedSets = details.sets.map(s => ({
                                Set: s.set_number,
                                Exercise: s.exercise_name,
                                Reps: s.reps,
                                Time: s.time,
                                Weight: s.weight,
                                Difficulty: s.difficulty_qualitative,
                                Skipped: s.is_skipped ? 'Yes' : 'No'
                            }));
                            console.table(formattedSets);
                        }

                        await waitForKey(askQuestion, "Press Enter to go back to logs list...");
                    }
                    break;
                case '6':
                    await handleSettingsMenu(services, askQuestion);
                    break;
                case '7':
                    console.log("Goodbye!");
                    rl.close();
                    return;
                default:
                    console.log("Invalid option, please try again.");
                    await waitForKey(askQuestion, "Press Enter to try again...");
            }
        } catch (error) {
            console.error("An error occurred:", error);
            await waitForKey(askQuestion, "Press Enter to continue...");
        }
    }
}

main();
