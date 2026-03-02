import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export interface WalkingEntryRequest {
    date: string;       // YYYY-MM-DD
    disCovered: number; // steps count
    unit: string;       // e.g. "steps"
}

export const stepsApi = {
    logSteps: async (payload: WalkingEntryRequest): Promise<void> => {
        await apiClient.post(API_ROUTES.STEPS.LOG, payload, { withCredentials: true });
    }
};
