import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export const waterApi = {
    logWaterIntake: async (amountMl: number, userEmail?: string) => {
        // The backend expects a POST to the water log endpoint
        // It likely accepts a RequestBody with amount and potentially email if not inferred from context
        const response = await apiClient.post(API_ROUTES.WATER.LOG, {
            amount: amountMl,
            date: new Date().toISOString().split('T')[0], // Sending today's date just in case
            userEmail: userEmail
        }, {
            withCredentials: true
        });
        return response.data;
    }
};
