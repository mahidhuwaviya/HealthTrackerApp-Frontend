import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export interface MealEntryDto {
    foodName: string;
    quantity: number;
    type: "BREAKFAST" | "SNACK_1" | "LUNCH" | "SNACK_2" | "DINNER" | "EXTRA";
    date: string;
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
