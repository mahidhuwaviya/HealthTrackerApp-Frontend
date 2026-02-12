import axios from 'axios';
import { toast } from "sonner"; // Using Sonner as configured in App.tsx

// Default to environment variable. Fail if not set.
const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Critical for HttpOnly Cookies
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally
        if (error.response?.status === 401) {
            // Check if the request explicitly opted out of global auth redirect
            // We use 'any' cast because the config property is custom
            const skipRedirect = (error.config as any)?.skipRedirect;

            if (skipRedirect) {
                // Do not redirect, just reject
                return Promise.reject(error);
            }

            console.warn('Unauthorized access - potential session expiry.');

            // Clear any client-side leftovers (though authoritative state is in cookies)
            localStorage.removeItem("user");

            // Only redirect if not already at login to prevent loops
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        // Handle 403 Forbidden
        else if (error.response?.status === 403) {
            toast.error("You do not have permission to perform this action.");
        }

        // Handle 500 Server Errors
        else if (error.response?.status >= 500) {
            toast.error("Server error. Please try again later.");
        }

        // Handle other 4xx errors (e.g. 400 Bad Request) - show specific message if available
        else if (error.response?.status >= 400) {
            const message = error.response?.data?.message || "An error occurred.";
            toast.error(message);
        }

        return Promise.reject(error);
    }
);
