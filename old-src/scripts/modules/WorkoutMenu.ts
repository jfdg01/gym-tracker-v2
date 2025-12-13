import { DataServices } from "./DataTransfer";
import { clearScreen, waitForKey, startTimer } from "./ConsoleUI";

export const handleWorkoutMenu = async (
    services: DataServices,
    askQuestion: (query: string) => Promise<string>
) => {
    while (true) {
        clearScreen();
        console.log("\n--- Workout Session ---");

        // 1. Get all active programs
        const allUserPrograms = await services.userService.getAllUserPrograms();
        const activeUserPrograms = allUserPrograms.filter(up => up.is_active);

        if (activeUserPrograms.length === 0) {
            console.log("You have 0 active programs.");
            await waitForKey(askQuestion);
            return;
        }

        console.log(`You have ${activeUserPrograms.length} active programs.\n`);

        // Map to store temporary info for selection
        // Index -> { userProgramId, programName }
        const selectionMap = new Map<number, any>();

        for (let i = 0; i < activeUserPrograms.length; i++) {
            const userProgram = activeUserPrograms[i];
            const program = await services.programService.getProgramById(userProgram.program_id);
            const days = await services.programService.getDaysByProgramId(userProgram.program_id);

            // Sort days by order
            days.sort((a, b) => a.order_index - b.order_index);

            let lastDayName = "None";
            let nextDayName = "Unknown";

            if (days.length > 0) {
                if (userProgram.last_completed_day_id) {
                    const lastDayIndex = days.findIndex(d => d.id === userProgram.last_completed_day_id);
                    if (lastDayIndex !== -1) {
                        lastDayName = days[lastDayIndex].name;
                        // Determine next day
                        const nextIndex = (lastDayIndex + 1) % days.length;
                        nextDayName = days[nextIndex].name;
                    } else {
                        // Last completed day ID invalid or not found in current program days
                        // Reset to first?
                        nextDayName = days[0].name;
                    }
                } else {
                    // No day completed yet
                    nextDayName = days[0].name;
                }
            } else {
                nextDayName = "No days in program";
            }

            console.log(`Program ${i + 1}: ${program ? program.name : 'Unknown Program'}`);
            console.log(`Today you need to complete: ${nextDayName}`);
            console.log(`Last day you did: ${lastDayName}`);
            console.log(""); // Empty line

            selectionMap.set(i + 1, {
                userProgram,
                program
            });
        }

        console.log("Back: 0");

        const answer = await askQuestion("Select the program you want to start a session: ");

        if (answer === '0') return;

        const selectionIndex = parseInt(answer);
        if (isNaN(selectionIndex) || !selectionMap.has(selectionIndex)) {
            console.log("Invalid selection. Please try again.");
            await waitForKey(askQuestion, "Press Enter to try again...");
            continue;
        }

        const selected = selectionMap.get(selectionIndex);
        console.log(`\nStarting session for ${selected.program?.name || 'Program'}...`);

        // Determine the day ID to start
        let nextDayId = -1;
        let nextDayName = "";

        const days = await services.programService.getDaysByProgramId(selected.userProgram.program_id);
        days.sort((a, b) => a.order_index - b.order_index);

        if (days.length > 0) {
            if (selected.userProgram.last_completed_day_id) {
                const lastDayIndex = days.findIndex(d => d.id === selected.userProgram.last_completed_day_id);
                if (lastDayIndex !== -1) {
                    const nextIndex = (lastDayIndex + 1) % days.length;
                    nextDayId = days[nextIndex].id;
                    nextDayName = days[nextIndex].name;
                } else {
                    nextDayId = days[0].id;
                    nextDayName = days[0].name;
                }
            } else {
                nextDayId = days[0].id;
                nextDayName = days[0].name;
            }
        }

        if (nextDayId === -1) {
            console.log("Could not determine the next day.");
            await waitForKey(askQuestion);
            continue;
        }

        console.log(`Loading exercises for: ${nextDayName}...`);
        const dayExercises = await services.programService.getDayExercisesWithDetails(nextDayId);

        // Find the day object to check properties
        const currentDay = days.find(d => d.id === nextDayId);

        if (dayExercises.length === 0) {
            if (currentDay && currentDay.is_rest_day) {
                console.log(`\n--- Rest Day: ${nextDayName} ---`);
                console.log("This is a planned Rest Day.");

                const confirm = await askQuestion("Mark this day as completed? (Y/n): ");

                if (confirm.toLowerCase() === 'y' || confirm === '') {
                    console.log("Marking as completed...");
                    const workoutLogId = await services.workoutService.startWorkout(nextDayId, selected.userProgram.program_id);
                    // Complete with empty set logs, marking as completed
                    await services.workoutService.completeWorkout(workoutLogId, [], true);
                    console.log("Rest Day completed successfully.");
                }
            } else {
                // Malformed Day: No exercises but NOT a rest day
                console.log(`\n⚠️  WARNING: Day '${nextDayName}' has 0 exercises but is NOT marked as a Rest Day.`);
                console.log("This might be a configuration error.");

                const confirm = await askQuestion("Do you want to force complete this empty day? (y/N): ");
                if (confirm.toLowerCase() === 'y') {
                    console.log("Force completing empty day...");
                    const workoutLogId = await services.workoutService.startWorkout(nextDayId, selected.userProgram.program_id);
                    await services.workoutService.completeWorkout(workoutLogId, [], true);
                    console.log("Day completed.");
                } else {
                    console.log("Action cancelled.");
                }
            }

            await waitForKey(askQuestion);
            continue;
        }

        // Start Workout Logging
        const workoutLogId = await services.workoutService.startWorkout(nextDayId, selected.userProgram.program_id);
        const exerciseSkippedStatus: { [key: number]: boolean } = {};

        // Session Loop
        let sessionExit = false;
        for (let i = 0; i < dayExercises.length; i++) {
            if (sessionExit) break;

            const exercise = dayExercises[i];
            const totalSets = exercise.sets;
            const setsStatus: { [key: number]: { completed: boolean, value?: string } } = {};

            // Initialize sets
            for (let s = 1; s <= totalSets; s++) {
                setsStatus[s] = { completed: false };
            }

            let exerciseCompleted = false;
            while (!exerciseCompleted) {
                clearScreen();
                console.log(`\n--- Exercise ${i + 1}/${dayExercises.length} ---`);
                console.log(`Name: ${exercise.name}`);
                console.log(`Target: ${exercise.tracking_type === 'reps' ? 'Reps' : 'Time'}: ${exercise.tracking_type === 'reps' ? exercise.max_reps : exercise.max_time} | Resistance: ${exercise.resistance_type === 'weight' ? exercise.current_weight + 'kg' : exercise.difficulty_qualitative}`);
                console.log(`Description: ${exercise.description || 'N/A'}`);
                console.log("\nSets:");

                let allDone = true;
                let nextSetNum = -1;
                for (let s = 1; s <= totalSets; s++) {
                    const status = setsStatus[s].completed ? `Done: ${setsStatus[s].value}` : "Not Completed";
                    console.log(`Set ${s}: ${status}`);
                    if (!setsStatus[s].completed) {
                        allDone = false;
                        if (nextSetNum === -1) nextSetNum = s;
                    }
                }

                console.log("\nOptions:");
                console.log("0: Exit Workout (Finish Early)");
                if (!allDone) {
                    console.log("s: Skip Exercise");
                }
                if (nextSetNum !== -1) {
                    console.log(`c: Complete Set ${nextSetNum}`);
                }

                if (allDone) {
                    console.log("Press Enter to continue to next exercise...");
                }

                const input = await askQuestion("Action: ");

                if (input === '0') {
                    sessionExit = true;
                    exerciseCompleted = true;
                } else if (input.toLowerCase() === 's' && !allDone) {
                    exerciseSkippedStatus[exercise.id] = true;
                    exerciseCompleted = true; // Skip to next

                    // Immediately save skipped log
                    console.log("Skipping exercise...");
                    await services.workoutService.saveSetLog(workoutLogId, {
                        exercise_id: exercise.id,
                        set_number: 1, // Generic set number for skipped exercise
                        is_skipped: true
                    });

                } else if (allDone && input === '') {
                    exerciseCompleted = true;
                } else if (input.toLowerCase() === 'c' && nextSetNum !== -1) {
                    const val = await askQuestion(`Enter ${exercise.tracking_type === 'reps' ? 'reps' : 'time'} completed: `);
                    setsStatus[nextSetNum] = { completed: true, value: val };

                    // Immediately save set log
                    await services.workoutService.saveSetLog(workoutLogId, {
                        exercise_id: exercise.id,
                        set_number: nextSetNum,
                        reps: exercise.tracking_type === 'reps' ? parseInt(val) : null,
                        time: exercise.tracking_type === 'time' ? parseInt(val) : null,
                        weight: exercise.resistance_type === 'weight' ? exercise.current_weight : null,
                        difficulty_qualitative: exercise.resistance_type === 'difficulty' ? exercise.difficulty_qualitative : null,
                        is_skipped: false
                    });

                    // Progressive Overload Logic
                    if (nextSetNum === totalSets) {
                        const performedVal = parseInt(val);
                        if (!isNaN(performedVal)) {
                            let overloadTriggered = false;

                            // Check max_reps or max_time
                            if (exercise.tracking_type === 'reps' && exercise.max_reps && performedVal >= exercise.max_reps) {
                                overloadTriggered = true;
                            } else if (exercise.tracking_type === 'time' && exercise.max_time && performedVal >= exercise.max_time) {
                                overloadTriggered = true;
                            }

                            if (overloadTriggered) {
                                console.log(`\n🎉 Max Performance reached! (${performedVal} >= ${exercise.tracking_type === 'reps' ? exercise.max_reps : exercise.max_time})`);

                                if (exercise.resistance_type === 'weight') {
                                    const currentW = exercise.current_weight ?? 0;
                                    const increase = exercise.weight_increase_rate ?? 0;

                                    if (increase > 0) {
                                        const newWeight = currentW + increase;
                                        console.log(`💪 Progressive Overload: Increasing weight to ${newWeight}kg for next session.`);

                                        // Update database using the real exercise ID
                                        await services.exerciseService.updateExercise(exercise.exercise_id, {
                                            current_weight: newWeight
                                        });
                                        // Update local object
                                        exercise.current_weight = newWeight;
                                    } else {
                                        console.log(`💪 Target reached, but "weight_increase_rate" is not set.`);
                                    }
                                } else {
                                    // Qualitative / Difficulty
                                    console.log(`💪 Progressive Overload: Limit reached! User needs to update the exercise difficulty/variation.`);
                                }
                                await waitForKey(askQuestion, "Press Enter to acknowledge...");
                            }
                        }
                    }
                }
            }
        }

        // Determine Completion Status
        let isWorkoutCompleted = !sessionExit;

        console.log("\nSaving workout final status...");
        // Pass empty array for setLogs because they are already saved incrementally
        await services.workoutService.completeWorkout(workoutLogId, [], isWorkoutCompleted);

        console.log(`\nWorkout ${isWorkoutCompleted ? 'Completed' : 'Saved (Incomplete)'}!`);
        await waitForKey(askQuestion);
        return; // Return to main menu
    }
};
