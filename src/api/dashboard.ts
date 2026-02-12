import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";
import { UserProfileData } from "./profile";
import { MealEntryDto } from "./food";

export interface DailyLog {
    totalDailyCalories: number;
    totalDailyProtein: number;
    totalDailyCarbs: number;
    totalDailyFats: number;
    waterIntake: number;
    todaysMeals: MealEntryDto[];
}

export interface WalkingLog {
    steps: number;
    distance: number;
    caloriesBurned: number;
}

export interface ExerciseEntry {
    exerciseName?: string; // Backend sends this
    name?: string; // Old frontend Type fallback
    durationMinutes?: number; // Backend likely sends this
    duration?: number; // Old frontend Type fallback
    sets: number;
    reps: number;
    weightKg?: number;
    weight?: number;
    caloriesBurned?: number;
}

export interface WorkoutResponseDTO {
    totalCaloriesBurned?: number;
    totalHrsWorkoutToday?: number;
    totalMinsWorkoutToday?: number;
    exerciseEntries?: ExerciseEntry[];
    exercises?: ExerciseEntry[]; // Helper in case of alias
}

export interface WaterLogEntry {
    id?: number;
    waterLogId?: number; // Backend field
    amount: number;
    amountMl?: number; // Backend field
    time: string; // "HH:mm" or ISO
    loggedAt?: string; // Backend field
}

export interface WaterTotalDTO {
    totalamountMl?: number;
    waterTotal?: WaterLogEntry[]; // Backend sends list here
}

export interface DashboardDTO {
    dailyLog: DailyLog;
    profile: UserProfileData;
    totalWaterToday: number | WaterTotalDTO;
    waterLogs?: WaterLogEntry[]; // Added based on user feedback
    workoutLog: WorkoutResponseDTO;
    walkingStats: WalkingLog;
}

export const dashboardApi = {
    getSummary: async (): Promise<DashboardDTO> => {
        const response = await apiClient.get<DashboardDTO>(API_ROUTES.DASHBOARD.SUMMARY);
        console.log(response.data);
        return response.data;
    }
};
