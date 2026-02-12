import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

export interface AuthResponse {
    token: string;
    user: BackendUser;
}

export interface BackendUser {
    id?: string;
    userId?: string;
    email?: string;
    userEmail?: string;
    name?: string;
    userName?: string;
}

export interface DecodedToken {
    id?: string;
    sub: string;
    email?: string;
    name?: string;
    exp: number;
    iat: number;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export const authApi = {
    // Path for Sign Up
    register: async (data: RegisterRequest) => {
        console.log(data)
        const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);
        return response.data;
    },

    // Path for Sign In
    login: async (data: LoginRequest) => {
        const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data);
        return response.data;
    },
    // Get User Data
    getUser: async () => {
        // We pass 'skipRedirect: true' so that if the user is a guest (401),
        // we handle it cleanly in the UI (AuthContext) instead of forcing a redirect.
        const response = await apiClient.get<BackendUser>(API_ROUTES.USER.INFO, {
            skipRedirect: true
        } as any);
        console.log("Raw User Data from Backend:", response.data);
        return response.data;
    },

    // Logout
    logout: async () => {
        try {
            await apiClient.post(API_ROUTES.AUTH.LOGOUT);
        } catch (error) {
            console.error("Logout API failed", error);
            // Ignore error, proceed to clear frontend session
        }
    }
};
