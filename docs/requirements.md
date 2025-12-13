# Gym Tracker Requirements

## 1. Scope

| In-Scope | Out-of-Scope |
|----------|--------------|
| Single-user, offline-only | Multi-user / Cloud |
| Mobile (React Native + TypeScript) | Web / Desktop |
| SQLite (expo-sqlite) | Free-form workouts (no program) |
| JSON import/export (full replacement) | Cloud sync |
| Linear workout execution | Supersets / Complex Set Grouping |
| Basic Error Alerts | Deloading / Failure Logic |

## 2. Domain Models

### Exercises
- **Definition**: Name, Description, Tracking Type (`REPS`/`TIME`), Resistance Type (`WEIGHT`/`DIFFICULTY`).
- **User Settings**: Current Weight OR Difficulty List (user-defined progression), Weight Increase Factor, Rest Time.

### Programs
- **Program**: Days collection. **Workouts require a program.**
- **Day**: Ordered exercises with targets. Suggested day is `(last_completed_day_order_index + 1) % total_days` (References loop back to start).
- **Progress**: `last_completed_day` per program. NULL = never started.

### Workout Logging
- **Session**: Links to ProgramDay, `startedAt`, `completedAt`, `status`.
- **Set**: Actual reps/weight/difficulty, skipped flag.

## 3. Progression Logic

### Weight-Based
**All sets** reps ≥ target → `currentWeight += weightIncreaseFactor`.
- **Constraint**: Skipped sets are considered incomplete. Use of a skip in any targeted set prevents progression for that exercise.

> **Note**: Exercise settings are global—the same exercise shares settings across all programs. Per-program settings are out of scope.

### Difficulty-Based
User defines an ordered list (e.g., `["Red Band", "Blue Band", "Green Band"]`). On success:
- Move to next item in list.
- If at end → alert user to extend list.

## 4. Rest Timer
- **Active countdown** starts **automatically** immediately after a set is logged (including the last set).
- **Notification**: Standard local notification if app is backgrounded.
- **Sound/Vibration**: Respects system silent/do-not-disturb modes. On Android, uses a dedicated notification channel.
- Can be skipped manually.

## 5. Data Validation
| Field | Rule |
|-------|------|
| Name (Program/Exercise) | Required, max 100 chars. |
| Description | Optional, max 200 chars. |
| Sets | 1-20 |
| Reps | 1-999 |
| Weight | 0-999 (Allows decimals. Unit agnostic. Label is cosmetic only.) |
| Time | 1-3600 seconds |
| Rest Time | 0-3600 seconds (0 = disabled) |

## 6. User Stories

| # | Story | Acceptance |
|---|-------|------------|
| 1 | Start/complete workout | Select program → suggested day (last completed + 1) → log sets → complete. Updates `last_completed_day`. |
| 2 | Auto-progression | Weight: increment on target. Difficulty: advance in list. |
| 3 | Abandon workout | User explicitly marks an IN_PROGRESS workout as `ABANDONED`. Alternatively, if a workout remains IN_PROGRESS for 20 hours, it is automatically marked as `ABANDONED`. Sets are preserved in both cases. |
| 4 | Resume workout | If an IN_PROGRESS session exists, prompt user to resume on app open / Home screen. |
| 5 | Swap exercise mid-workout | During an active workout, user can reorder or replace an exercise. Changes are persisted to the session snapshot. |
| 6 | Skip set | User can skip a set during an active workout. Skipped sets are marked but do not count toward progression. |
| 7 | Rest timer | Countdown after set. Visual/audio alert on end (including when backgrounded). Skip available. |
| 8 | Export data | All data to JSON. |
| 9 | Import data | Full replacement. Refused if session `IN_PROGRESS`. |
| 10 | Manage exercises | CRUD exercise library. |
| 11 | Manage programs | CRUD programs/days. |
| 12 | Edit exercise settings | User can configure per-exercise settings: current weight, weight increase factor, difficulty list, and rest time. |
| 13 | View history | View list of past workouts with date, program name, and status. Tap an item to view details (exercises, sets, weights, reps). Filter by program or date range. |
| 14 | Manage archived exercises | User can view archived exercises and restore them to the active library. |
| 15 | Set weight unit preference | User can set a preferred weight unit label (e.g., "kg", "lbs") in Settings for display purposes. Value is cosmetic only. |
| 16 | Correct logged set | User can tap a completed set during an active workout to re-open it for editing (e.g., fix rep count). |

## 7. Edge Cases

| Case | Behavior |
|------|----------|
| Program has 0 days | Cannot start; error message. |
| Log set on completed session | Rejected. |
| Difficulty list exhausted | Alert user to update. |
| Import with IN_PROGRESS session | Refused. |
| Delete exercise used in program | Archive exercise (soft-delete). Hidden from lists but preserved in history. |
| Delete program with history | Allowed; cascades to days. Workout history references preserved (via snapshots). |
| App backgrounded during rest timer | Local notification sent when timer ends. |
| Exercise in multiple programs (Strength vs Hypertrophy) | App suggests the last *globally* used weight. User must manually adjust. Accepted trade-off. |
| IN_PROGRESS workout exceeds 20 hours | Automatically marked as `ABANDONED`. 20 hours chosen to accommodate longest reasonable workout + overnight pause. |
| Critical Operation Fails (e.g., Save) | Display native alert to user (not generic toast, actual alert). |