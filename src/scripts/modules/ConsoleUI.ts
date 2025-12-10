
export const clearScreen = () => {
    // console.clear() works in most modern terminals (Windows Terminal, VS Code, etc.)
    // console.clear();
    console.log("------------------------ 'mocked clear' ---------------------------");
};

export const printHeader = (text: string) => {
    console.log(`\n===== ${text} =====`);
};

export const waitForKey = async (
    askQuestion: (q: string) => Promise<string>,
    message: string = "Press Enter to return to menu..."
) => {
    await askQuestion(`\n${message}`);
};

export const startTimer = async (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
        let remaining = seconds;
        let interval: NodeJS.Timeout;

        const onData = (key: Buffer) => {
            // Check for ctrl+c (exit) - standard hex is 03
            if (key.toString('hex') === '03') {
                cleanup();
                process.exit();
            }

            cleanup();
            process.stdout.write("\nSkipped.\n");
            resolve();
        };

        const cleanup = () => {
            clearInterval(interval);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }
            process.stdin.removeListener('data', onData);
        };

        // Setup input for skipping
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.resume(); // Ensure it's flowing

        process.stdin.on('data', onData);

        // Initial draw
        process.stdout.write(`\nResting: ${remaining}s (Press any key to skip)...`);

        interval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                cleanup();
                process.stdout.write("\nTime's up!\n");
                resolve();
            } else {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`Resting: ${remaining}s (Press any key to skip)...`);
            }
        }, 1000);
    });
};
