import { ExerciseRepository } from "../repositories/ExerciseRepository";
import { ProgramRepository } from "../repositories/ProgramRepository";
import { DayRepository } from "../repositories/DayRepository";
import { WorkoutRepository } from "../repositories/WorkoutRepository";
import { UserRepository } from "../repositories/UserRepository";

import { ExerciseService } from "./ExerciseService";
import { ProgramService } from "./ProgramService";
import { WorkoutService } from "./WorkoutService";
import { UserService } from "./UserService";

// Repositories
const exerciseRepository = new ExerciseRepository();
const programRepository = new ProgramRepository();
const dayRepository = new DayRepository();
const workoutRepository = new WorkoutRepository();
const userRepository = new UserRepository();

// Services
export const exerciseService = new ExerciseService(exerciseRepository);
export const programService = new ProgramService(programRepository, dayRepository);
export const workoutService = new WorkoutService(workoutRepository, dayRepository, exerciseRepository, userRepository);
export const userService = new UserService(userRepository);
