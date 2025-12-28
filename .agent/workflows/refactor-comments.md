---
description: Refactor Project Comments and TODOs
---

This workflow standardizes the comments across the codebase to maintain a clean and professional documentation style.

## Rules

### 1. Standardize Action Items
Convert any comment implying a future task, fix, or improvement into a standard format.
- **Format**: `// TODO: <Current Action Verb> <Clear Description>`
- **Example**: `// TODO: Add null check for user object.`

### 2. Remove Internal Monologue & Redundancy
- Remove "what" comments for structurally obvious code (e.g., `// loop through items`).
- Remove "stream of consciousness" comments (e.g., `// I decided to do it this way because...`). Move to robust documentation if necessary.
- Remove commented-out code unless it is a meaningful example or critical fallback.

### 3. Preserve Meaningful Documentation
- **DO NOT** remove JSDoc/TSDoc comments (`/** ... */`).
- **DO NOT** remove comments explaining the **"Why"** behind complex or non-obvious logic.
- **DO NOT** remove region markers or separator comments if used consistently.

### 4. Consolidation
Consolidate multiple lines referring to the same task into a single concise `TODO` block.

## Steps

1. **Search**: Find files containing `//` or `/*` comments in the target directory.
2. **Analyze**: Categorize comments into TODOs, redundant notes, or essential documentation.
3. **Refactor**: Apply the rules above to transform the comments.
4. **Verify**: Ensure the code still compiles and readability is improved.
