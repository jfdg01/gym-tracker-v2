import { DataServices } from "./DataTransfer";
import { clearScreen, waitForKey } from "./ConsoleUI";
import { handleExportData, handleImportData } from "./DataTransfer";
import { db } from "../../db/client";
import {
    workout_logs,
    workout_set_logs,
    user_programs,
    day_exercises,
    days,
    programs,
    exercises,
    user_settings
} from "../../db/schema";

const resetDatabase = async (askQuestion: (query: string) => Promise<string>) => {
    clearScreen();
    const confirmation = await askQuestion("Are you sure you want to DELETE ALL DATA? (y/n): ");
    if (confirmation.toLowerCase() !== 'y') {
        console.log("Operation cancelled.");
        await waitForKey(askQuestion);
        return;
    }

    try {
        console.log("Deleting workout logs...");
        await db.delete(workout_set_logs);
        await db.delete(workout_logs);
        console.log("Deleting user programs...");
        await db.delete(user_programs);
        console.log("Deleting day exercises...");
        await db.delete(day_exercises);
        console.log("Deleting days...");
        await db.delete(days);
        console.log("Deleting programs...");
        await db.delete(programs);
        console.log("Deleting exercises...");
        await db.delete(exercises);
        console.log("Deleting user settings...");
        await db.delete(user_settings);

        console.log("Database reset successfully.");
    } catch (error) {
        console.error("Error resetting database:", error);
    }
    await waitForKey(askQuestion);
};

export const handleSettingsMenu = async (
    services: DataServices,
    askQuestion: (query: string) => Promise<string>
) => {
    while (true) {
        clearScreen();
        console.log("\n--- Settings & Data Management ---");
        console.log("1. View User Settings");
        console.log("2. Export Data");
        console.log("3. Import Data");
        console.log("4. Reset Database");
        console.log("0. Back to Main Menu");

        const answer = await askQuestion("Select an option: ");

        switch (answer) {
            case '1':
                clearScreen();
                console.log("\n--- User Settings ---");
                const settings = await services.userService.getAllUserSettings();
                console.table(settings);
                await waitForKey(askQuestion);
                break;
            case '2':
                await handleExportData(services, askQuestion);
                await waitForKey(askQuestion);
                break;
            case '3':
                await handleImportData(services, askQuestion);
                await waitForKey(askQuestion);
                break;
            case '4':
                await resetDatabase(askQuestion);
                break;
            case '0':
                return;
            default:
                console.log("Invalid option, please try again.");
                await waitForKey(askQuestion, "Press Enter to try again...");
        }
    }
};
