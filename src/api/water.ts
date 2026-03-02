import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export const waterApi = {
    logWaterIntake: async (amountMl: number, userEmail?: string) => {
        const response = await apiClient.post(API_ROUTES.WATER.LOG, {
            amount: amountMl,
            date: new Date().toISOString().split('T')[0],
            userEmail: userEmail
        }, {
            withCredentials: true
        });
        return response.data;
    },

    deleteWaterLog: async (payload: { date: string; amount: number; unit?: string }): Promise<void> => {
        await apiClient.delete(API_ROUTES.WATER.DELETE, {
            data: {
                date: payload.date,
                amount: payload.amount,
                unit: payload.unit ?? "ml"
            }
        });
    }
};
