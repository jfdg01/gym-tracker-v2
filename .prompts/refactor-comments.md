# Refactor Comments and TODOs

for the .tsx files int the app folder, please analyze the comments in the specified files (or the entire codebase if not specified) and refactor them according to the following rules:

## 1. Standardize Action Items

- Convert any comment that implies a future task, fix, or improvement into a standard `// TODO:` or `// FIXME:` format.
- **Format**: `// TODO: <Current Action Verb> <Clear Description>`
- Example:
  - *Before*: `// we should probably check for null here`
  - *After*: `// TODO: Add null check for user object.`

## 2. Remove Internal Monologue & Redundancy

- Remove comments that describe "what" the code is doing if it is structurally obvious (e.g., `// declaring variable`, `// loop through items`).
- Remove "internal monologue" or "stream of consciousness" comments (e.g., `// I decided to do it this way because...` -> Move to a robust documentation comment or remove if transient).
- Remove commented-out code unless it is a meaningful example or critical fallback.

## 3. Preserve Meaningful Documentation

- **Do NOT** remove JSDoc/TSDoc comments (starting with `/**`).
- **Do NOT** remove comments that explain **"Why"** a complex or non-obvious logic was implemented.
- **Do NOT** remove region markers or separator comments if used consistently in the project.

## 4. Consolidation

- If multiple lines of comments refer to the same logical task, consolidate them into a single concise TODO block.

## Execution

- Apply these changes directly to the code.
- If a comment is ambiguous, leave it as is or mark it with `// NOTE:` for review.
