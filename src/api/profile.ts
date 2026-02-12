import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

// Enums matching Java Backend
export enum HealthCondition {
    NONE = "NONE",
    DIABETES = "DIABETES",
    HYPERTENSION = "HYPERTENSION",
    ASTHMA = "ASTHMA",
    HEART_DISEASE = "HEART_DISEASE",
    KIDNEY_DISEASE = "KIDNEY_DISEASE",
    ARTHRITIS = "ARTHRITIS",
    PREGNANCY = "PREGNANCY",
    OTHER = "OTHER"
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

export enum Goal {
    WEIGHT_LOSS = "WEIGHT_LOSS",
    MUSCLE_GAIN = "MUSCLE_GAIN",
    MAINTENANCE = "MAINTENANCE",
    ATHLETIC_PERFORMANCE = "ATHLETIC_PERFORMANCE"
}

export enum ActivityLevel {
    SEDENTARY = "SEDENTARY",
    LIGHTLY_ACTIVE = "LIGHTLY_ACTIVE",
    MODERATELY_ACTIVE = "MODERATELY_ACTIVE",
    VERY_ACTIVE = "VERY_ACTIVE"
}

export enum ExerciseType {
    PILATES = "PILATES",
    GYM = "GYM",
    HOME = "HOME",
    HOME_GYM = "HOME_GYM",
    OUTDOOR = "OUTDOOR"
}

export enum DietaryPreference {
    VEGAN = "VEGAN",
    KETO = "KETO",
    PALEO = "PALEO",
    VEGETARIAN = "VEGETARIAN",
    GLUTEN_FREE = "GLUTEN_FREE",
    NO_PREFERENCE = "NO_PREFERENCE",
    PESCATARIAN = "PESCATARIAN" // Note: Java enum didn't have this, but frontend does. Be careful or update backend.
}

// Interface matching UserProfileData Entity
export interface UserProfileData {
    userProfileDataId?: number;
    age: number;
    height: number;
    currentHeightCm?: number; // Backend compatibility
    heightUnit: 'cm' | 'ft' | 'in';
    weight: number;
    currentWeightKg?: number; // Backend compatibility
    weightUnit: 'kg' | 'lbs';
    bmi?: number;
    targetWeightKg?: number;
    dailyWaterGoalMl?: number;
    weeklyGoalWorkoutTarget?: number;
    dailyGoalWorkoutTarget?: number; // Frontend-Backend sync field
    dailyCalorieTarget?: number;
    mainGoal: Goal;
    gender: Gender;
    activityLevel: ActivityLevel;
    workoutEnv: ExerciseType[];
    dietary: DietaryPreference[];
    heartRate?: number;
    conditions: HealthCondition[];
    isOnboardingComplete?: boolean;

    // Backend DTO Alignments (Incoming)
    goal?: Goal; // Maps to mainGoal
    exerciseTypes?: ExerciseType[]; // Maps to workoutEnv
    dietaryPreferences?: DietaryPreference[]; // Maps to dietary
    healthConditions?: HealthCondition[]; // Maps to conditions
    targetDailyCalorie?: number; // Maps to dailyCalorieTarget
    // dailyGoalWorkoutTarget already defined above match backend
}

export const profileApi = {
    // GET: Fetch existing profile
    getProfile: async () => {
        const response = await apiClient.get<UserProfileData>(API_ROUTES.USER.PROFILE_GET_PROFILE);
        return response.data;
    },

    // POST: Create new profile
    createProfile: async (data: UserProfileData) => {
        try {
            const response = await apiClient.post<UserProfileData>(API_ROUTES.USER.PROFILE_SAVE, data, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = 'http://localhost:8080/oauth2/authorization/google';
            }
            throw error;
        }
    },

    // PUT: Update existing profile
    updateProfile: async (data: UserProfileData) => {
        try {
            const response = await apiClient.put<UserProfileData>(API_ROUTES.USER.PROFILE_UPDATE, data, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = 'http://localhost:8080/oauth2/authorization/google';
            }
            throw error;
        }
    }
};
