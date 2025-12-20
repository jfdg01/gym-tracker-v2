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
| Offline-only | Warm-up Sets / RPE Tracking |
| CRUD exercise library | Search by body part / Category |

## 2. Domain Models

### Exercises
- **Definition**: Name, Description, Tracking Type (`REPS`/`TIME`), Resistance Type (`WEIGHT`/`DIFFICULTY`).
- **User Settings**: Current Weight OR Difficulty List (user-defined progression), Weight Increase Factor, Rest Time. These are initialized with defaults (0 or null) upon creation and can be configured before the first workout.

### Programs
- **Program**: Days collection. **Workouts require a program.**
- **Day**: Ordered exercises with targets. 
- **Suggested Day**: The system suggests the day following the `last_completed_day`. If the last day of the program was completed, it loops back to the first day (based on `orderIndex`). This logic relies on ID references to handle day deletions or reorders robustly.
- **Progress**: `last_completed_day` per program. NULL = never started.

### Workout Logging
- **Session**: Links to ProgramDay, `startedAt`, `completedAt`, `status`.
- **Set**: Actual reps/weight/difficulty, skipped flag.

## 3. Progression Logic

### Weight-Based
**All sets** (reps ≥ target OR time ≥ target) → `currentWeight += weightIncreaseFactor`.
- **Constraint**: Skipped sets are considered incomplete. Use of a skip in any targeted set prevents progression for that exercise.
- **Failure**: If targets are not met, `currentWeight` remains unchanged (Deloading logic is Out-of-Scope).
- **Manual Overrides**: If the user manually changes the weight during a workout, this value immediately becomes the new `currentWeight`. The progression logic (increase vs. maintain) is then applied to this *new* weight based on the set performance.
- **Logging Constraint**: Users input actual reps/time for the *prescribed* number of sets only. Logging extra sets beyond the target is not supported.

> **Note**: Exercise settings are global—the same exercise shares settings across all programs. Per-program settings are out of scope.

### Difficulty-Based
User defines an ordered list (e.g., `["Red Band", "Blue Band", "Green Band"]`). On success:
- Move to next item in list (`currentDifficultyIndex++`).
- If at end → alert user to extend list.
- **Validation**: Difficulty lists must contain unique, non-empty strings. UI alerts are shown if the user tries to save an invalid list.
- **List Changes**: If the user modifies the difficulty list (adds/removes items), the `currentDifficultyIndex` remains unchanged. The system points to the same *position* (index) in the list and advances to `index + 1` on success, regardless of list content changes.

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
| Difficulty Item | 1-50 chars, unique within list, non-empty |

## 6. User Stories

| # | Story | Acceptance |
|---|-------|------------|
| 1 | Start/complete workout | Select program → suggested day (last completed + 1) OR manually select any day → log sets → complete. Updates `last_completed_day`. |
| 2 | Auto-progression | Weight: increment on target. Difficulty: advance in list. |
| 3 | Abandon workout | User explicitly marks an IN_PROGRESS workout as `ABANDONED`. Alternatively, if a workout remains IN_PROGRESS for >20 hours, it is marked as `ABANDONED` on next app open. Sets are preserved. |
| 4 | Resume workout | If an IN_PROGRESS session exists, prompt user to resume on app open / Home screen. |
| 5 | Swap exercise mid-workout | During an active workout, user can reorder or replace an exercise. Changes are persisted immediately to the session snapshot. |
| 6 | Skip set | User can skip a set during an active workout. The flow advances but the user can navigate back to complete it later. Skipped sets block progression. |
| 7 | Rest timer | Countdown after set. Visual/audio alert on end (including when backgrounded). Skip available. |
| 8 | Export data | All data to JSON. |
| 9 | Import data | Full replacement. Refused if session `IN_PROGRESS`. |
| 10 | Manage exercises | CRUD exercise library. |
| 11 | Manage programs | CRUD programs/days. |
| 12 | Edit exercise settings | User can configure per-exercise settings: current weight, weight increase factor, difficulty list, and rest time. |
| 13 | View history | View list of past workouts with date, program name, and status. Tap an item to view details (exercises, sets, weights, reps). Filter by program or date range. |
| 14 | Manage archived exercises | User can view archived exercises and restore them to the active library. |
| 15 | Set weight unit preference | User can set a preferred weight unit label (e.g., "kg", "lbs") in Settings. **Note**: This is cosmetic only and rarely changed. No numerical conversion is performed on existing data. |
| 16 | Correct logged set | User can tap a completed set during an active workout to re-open it for editing (e.g., fix rep count). |
| 17 | Edit past workout | User can edit the details of a COMPLETED workout in the History view (e.g., add a forgotten set or fix a weight entry). |

## 7. Edge Cases

| Case | Behavior |
|------|----------|
| Program has 0 days | Cannot start; error message. |
| Log set on completed session | Rejected. |
| Difficulty list exhausted | Alert user to update. |
| Import with IN_PROGRESS session | Refused. |
| Delete exercise used in program | Archive exercise (soft-delete). Hidden from lists but preserved in history. |
| Delete program with history | Allowed; cascades to days. Workout history references preserved via snapshots (FK is set to null). |
| App backgrounded during rest timer | Local notification sent when timer ends. |
| Exercise in multiple programs (Strength vs Hypertrophy) | App suggests the last *globally* used weight. User must manually adjust. Accepted trade-off. |
| IN_PROGRESS workout exceeds 20 hours | Automatically marked as `ABANDONED` upon next app open. |
| Critical Operation Fails (e.g., Save) | Display native alert to user (not generic toast, actual alert). |