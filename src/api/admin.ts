import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export interface AdminUser {
    userId: string;
    userName: string;
    role: string;
    createdAt: string;
    email: string;
}

export interface AdminUserDetails {
    age: number;
    currentHeightCm: number;
    heightUnit: string;
    currentWeightKg: number;
    weightUnit: string;
    bmi: number;
    targetDailyCalorie: number;
    targetDailyWalk: number;
    dailyWaterGoalMl: number;
    targetWeightKg: number;
    dailyGoalWorkoutTarget: number;
    heartRate: number | null;
    goal: string;
    activityLevel: string;
    exerciseTypes: string[];
    dietaryPreferences: string[];
    healthConditions: string[];
    isOnboardingComplete: boolean;
    gender: string;
}

export const adminApi = {
    getAllUsers: async (): Promise<AdminUser[]> => {
        const response = await apiClient.get<AdminUser[]>(API_ROUTES.ADMIN.GET_ALL_USERS);
        return response.data;
    },
    getUser: async (email: string): Promise<AdminUserDetails> => {
        const response = await apiClient.post<AdminUserDetails>(
            API_ROUTES.ADMIN.GET_USER,
            email, 
            { headers: { "Content-Type": "text/plain" } }
        );
        return response.data;
    },
    deleteUser: async (email: string): Promise<string> => {
        const response = await apiClient.delete<string>(
            API_ROUTES.ADMIN.DELETE_USER,
            { 
                data: email,
                headers: { "Content-Type": "text/plain" } 
            }
        );
        return response.data;
    }
};
