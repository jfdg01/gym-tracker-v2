# Gym Tracker Requirements

## 1. Scope

| In-Scope | Out-of-Scope |
|----------|--------------|
| Single-user, local-only | Multi-user / Cloud |
| Terminal (CLI) | GUI / Web |
| SQLite | Free-form workouts (no program) |
| JSON import/export (full replacement) | Edit/delete completed sessions |

## 2. Domain Models

### Exercises
- **Definition**: Name, Description, Tracking Type (`REPS`/`TIME`), Resistance Type (`WEIGHT`/`DIFFICULTY`).
- **User Settings**: Current Weight OR Difficulty List (user-defined progression), Weight Increase Rate, Rest Time.

### Programs
- **Program**: Days collection. **Workouts require a program.**
- **Day**: Ordered exercises with targets. First incomplete day or first day if new.
- **Progress**: `last_completed_day` per program. NULL = never started.

### Workout Logging
- **Session**: Links to ProgramDay, `startedAt`, `completedAt`, `status`.
- **Set**: Actual reps/weight/difficulty, skipped flag.

## 3. Progression Logic

### Weight-Based
Last set reps ≥ target → `currentWeight += weightIncreaseFactor`.

### Difficulty-Based
User defines an ordered list (e.g., `["Red Band", "Blue Band", "Green Band"]`). On success:
- Move to next item in list.
- If at end → alert user to extend list.

## 4. Rest Timer
- **Active countdown** starts after each set (except last set of last exercise).
- **Visual/audio alert** when time ends.
- Can be skipped manually.

## 5. User Stories

| # | Story | Acceptance |
|---|-------|------------|
| 1 | Start/complete workout | Select program → suggested day → log sets → complete. Updates `last_completed_day`. |
| 2 | Auto-progression | Weight: increment on target. Difficulty: advance in list. |
| 3 | Abandon workout | Exit mid-session → status = `ABANDONED`. Sets preserved. |
| 4 | Rest timer | Countdown after set. Alert on end. Skip available. |
| 5 | Export data | All data to JSON. |
| 6 | Import data | Full replacement. Refused if session `IN_PROGRESS`. |
| 7 | Manage exercises | CRUD exercise library. |
| 8 | Manage programs | CRUD programs/days. |
| 9 | View history | *TBD: Simple per-session list with date + status.* |

## 6. Edge Cases

| Case | Behavior |
|------|----------|
| Program has 0 days | Cannot start; error message. |
| Log set on completed session | Rejected. |
| Difficulty list exhausted | Alert user to update. |
| Import with IN_PROGRESS session | Refused. |