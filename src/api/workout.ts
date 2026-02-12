import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export enum WorkoutType {
    STRENGTH_TRAINING = "STRENGTH_TRAINING",
    CARDIO_VIGOROUS = "CARDIO_VIGOROUS",
    CARDIO_LIGHT = "CARDIO_LIGHT",
    YOGA = "YOGA",
    HIIT = "HIIT",
    WALKING = "WALKING"
}

export interface ExerciseLog {
    exerciseName: string;
    sets: number;
    reps: number;
    weightKg: number;
    durationMinutes: number;
    gifUrl?: string;
    type: WorkoutType;

}

export interface WorkoutLogRequest {
    type: WorkoutType;
    date: string;
    exercises: ExerciseLog[];
}

export interface ExerciseSearchResult {
    name: string;
    imageUrl?: string; // Optional image/gif url if available
}

export const workoutApi = {
    searchExercises: async (query: string): Promise<ExerciseSearchResult[]> => {
        // Backend expects ?name={value}
        const response = await apiClient.get<ExerciseSearchResult[]>(API_ROUTES.WORKOUTS.SEARCH, {
            params: { name: query }
        });
        return response.data;
    },

    logWorkout: async (data: WorkoutLogRequest) => {
        const response = await apiClient.post(API_ROUTES.WORKOUTS.LOG, data);
        return response.data;
    }
};
