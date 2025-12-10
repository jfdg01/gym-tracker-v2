import { ProgramService } from "../../services/ProgramService";
import { clearScreen, waitForKey } from "./ConsoleUI";

export const handleViewPrograms = async (
    programService: ProgramService,
    askQuestion: (query: string) => Promise<string>
) => {
    while (true) {
        clearScreen();
        console.log("\n--- Programs ---");
        const allPrograms = await programService.getAllPrograms();

        if (allPrograms.length === 0) {
            console.log("No programs found.");
            await waitForKey(askQuestion);
            return;
        }

        console.table(allPrograms.map(p => ({ id: p.id, name: p.name, description: p.description })));
        console.log("0. Back");

        const answer = await askQuestion("Select Program ID to view details: ");

        if (answer === '0') return;

        const programId = parseInt(answer);
        if (isNaN(programId)) {
            console.log("Invalid Input");
            await waitForKey(askQuestion);
            continue;
        }

        const selectedProgram = allPrograms.find(p => p.id === programId);
        if (!selectedProgram) {
            console.log("Program not found.");
            continue;
        }

        // Program Level
        while (true) {
            clearScreen();
            console.log(`\n--- Program: ${selectedProgram.name} ---`);
            console.log(`Description: ${selectedProgram.description}`);

            const days = await programService.getDaysByProgramId(programId);
            if (days.length === 0) {
                console.log("No days defined for this program.");
            } else {
                console.table(days.map(d => ({
                    id: d.id,
                    name: d.name,
                    type: d.is_rest_day ? 'Rest Day' : 'Workout',
                    order: d.order_index
                })));
            }
            console.log("0. Back");

            const dayAnswer = await askQuestion("Select Day ID to view exercises: ");
            if (dayAnswer === '0') break;

            const dayId = parseInt(dayAnswer);
            if (isNaN(dayId)) {
                console.log("Invalid Input");
                await waitForKey(askQuestion);
                continue;
            }

            const selectedDay = days.find(d => d.id === dayId);
            if (!selectedDay) {
                console.log("Day not found in this program.");
                continue;
            }

            // Day Level
            console.log(`\n--- Day: ${selectedDay.name} (${selectedDay.is_rest_day ? 'Rest' : 'Workout'}) ---`);
            const exercises = await programService.getDayExercisesWithDetails(dayId);

            if (exercises.length === 0) {
                console.log("No exercises scheduled for this day.");
            } else {
                console.table(exercises.map(e => ({
                    order: e.order_index,
                    name: e.name,
                    sets: e.sets,
                    reps: e.tracking_type === 'reps' ? e.max_reps : 'N/A',
                    time: e.tracking_type === 'time' ? `${e.max_time}s` : 'N/A',
                    weight: e.current_weight || 'BW',
                    rest: `${e.rest_time_seconds}s`
                })));
            }

            await waitForKey(askQuestion, "Press Enter to return to program details...");
        }
    }
};
