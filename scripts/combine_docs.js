const fs = require('fs');
const path = require('path');

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str 
 * @returns {string}
 */
function titleCase(str) {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Combines all markdown files in the docs directory into a single file.
 */
function combineMdFiles() {
    const docsDir = path.resolve(__dirname, '../docs');
    const outputFile = path.join(docsDir, 'combined_docs.md');

    if (!fs.existsSync(docsDir)) {
        console.error(`Error: Docs folder not found at ${docsDir}`);
        process.exit(1);
    }

    console.log(`Generating ${path.basename(outputFile)}...`);

    // Get all .md files, excluding the output file itself
    const files = fs.readdirSync(docsDir)
        .filter(file => file.endsWith('.md') && path.resolve(docsDir, file) !== path.resolve(outputFile))
        .sort();

    let combinedContent = '';

    files.forEach((file, index) => {
        const filePath = path.join(docsDir, file);
        const filename = path.basename(file);
        const title = titleCase(filename.replace('.md', '').replace(/-/g, ' '));

        if (index > 0) {
            combinedContent += '\n\n---\n\n';
        }

        combinedContent += `# ${title}\n\n`;
        combinedContent += fs.readFileSync(filePath, 'utf-8');

        console.log(`Merged: ${filename}`);
    });

    fs.writeFileSync(outputFile, combinedContent, 'utf-8');
    console.log(`\nDone! All files merged into ${outputFile}`);
}

combineMdFiles();
