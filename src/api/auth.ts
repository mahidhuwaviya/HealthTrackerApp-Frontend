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
    userRole?: string;
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

export interface OtpVerifyDto {
    email: string;
    otp: string;
    verificationToken?: string;   // sent automatically as OtpVerifyToken cookie via withCredentials
    newPassword: string;
}

export const authApi = {
    // Path for Sign Up
    register: async (data: RegisterRequest) => {
        // Map frontend RegisterRequest to backend UserInfoRequestDTO format
        const payload = {
            userEmail: data.email,
            userName: data.name || data.email.split('@')[0], 
            password: data.password,
            role: "ROLE_USER" // Default role for new signups
        };
        console.log("Registering with payload:", payload);
        const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, payload);
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
    },

    // --- Forgot Password / Email Verification OTP Flow ---

    // Step 1: Request OTP to be sent to email.
    // Now a POST request sending the OtpVerificationRequestDTO format 
    // with 'val' enum to specify the context (verifyEmail or ForgotPassword).
    getOtp: async (email: string, type: "verifyEmail" | "ForgotPassword" = "verifyEmail") => {
        const payload = {
            email: email,
            val: type
        };
        const response = await apiClient.post(API_ROUTES.AUTH.GET_OTP, payload);
        return { data: response.data, headers: response.headers };
    },

    // Step 2: Verify OTP
    verifyOtp: async (dto: OtpVerifyDto, type: "verifyEmail" | "ForgotPassword" = "verifyEmail") => {
        const payload = {
            email: dto.email,
            otp: dto.otp,
            val: type,
            password: dto.newPassword // The backend DTO expects this, even if empty initially
        };
        const response = await apiClient.post(API_ROUTES.AUTH.VERIFY_OTP, payload);
        return response.data;
    },

    // Step 3: Set new password using the same DTO (newPassword filled)
    updatePassword: async (dto: OtpVerifyDto) => {
        const payload = {
            email: dto.email,
            otp: dto.otp,
            val: "ForgotPassword",
            password: dto.newPassword
        };
        const response = await apiClient.put(API_ROUTES.AUTH.UPDATE_PASSWORD, payload);
        return response.data;
    },

    // --- Update Email Flow ---
    // Sends the exact same OtpVerifyDto, but to /UpdateEmail, adding `oldEmail` query parameter.
    updateEmail: async (dto: OtpVerifyDto, oldEmail: string) => {
        const payload = {
            email: dto.email,
            otp: dto.otp,
            val: "verifyEmail",      // Enum used for email verifications
            password: dto.newPassword // Usually empty/ignored per backend expectations here
        };
        const response = await apiClient.put(`${API_ROUTES.AUTH.UPDATE_EMAIL}?oldEmail=${encodeURIComponent(oldEmail)}`, payload);
        return response.data;
    },

    // --- Update Username ---
    updateUsername: async (newUsername: string) => {
        // Backend expects text/plain or minimal body structure based on typical Spring string handlers
        const response = await apiClient.put(API_ROUTES.USER.UPDATE_USERNAME, newUsername, {
            headers: {
                "Content-Type": "text/plain"
            }
        });
        return response.data;
    },

    // --- Delete Account ---
    deleteAccount: async (email: string) => {
        // Equivalent to the ADMIN delete method structure, targeting the USER context
        const response = await apiClient.delete(API_ROUTES.USER.DELETE_ACCOUNT, {
            headers: {
                "Content-Type": "text/plain",
            },
            data: email, // Axios way of passing body contents inside a DELETE request
        });
        return response.data;
    },
};
