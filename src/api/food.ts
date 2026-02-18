import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export interface MealEntryDto {
    mealEntryId?: number; // Optional as it comes from backend
    foodName: string;
    quantity: number;
    type: "BREAKFAST" | "SNACK_1" | "LUNCH" | "SNACK_2" | "DINNER" | "EXTRA";
    date: string;
    entryTime?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

export const foodApi = {
    searchFood: async (query: string): Promise<string[]> => {
        if (!query) return [];
        const response = await apiClient.get<string[]>((API_ROUTES.MEALS.SEARCH), {
            params: { query }
        });
        return response.data;
    },

    addMeal: async (data: MealEntryDto): Promise<void> => {
        await apiClient.post(API_ROUTES.MEALS.LOG, data);
    }
};
