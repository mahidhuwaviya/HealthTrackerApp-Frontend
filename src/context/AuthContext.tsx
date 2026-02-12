import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authApi, BackendUser } from "@/api/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ... inside component

export interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const queryClient = useQueryClient();

    // Map Backend User to Frontend User
    const mapUser = (rawData: BackendUser): User => ({
        id: rawData.id || rawData.userId || "user",
        email: rawData.email || rawData.userEmail || "",
        name: rawData.name || rawData.userName || "User"
    });

    // Check Session on Mount using React Query
    const { data: userData, isLoading, error } = useQuery({
        queryKey: ["user-session"],
        queryFn: async () => {
            const data = await authApi.getUser();
            return mapUser(data);
        },
        retry: false, // Don't retry if 401
        refetchOnWindowFocus: true, // Re-check if user focuses window (good for security)
        staleTime: 1000 * 60 * 5 // Consider session fresh for 5 mins
    });

    // Sync Query Data with Local State
    useEffect(() => {
        if (userData) {
            setUser(userData);
        } else if (error) {
            // Only clear user on 401 Unauthorized
            // @ts-ignore - Axios error typing fallback
            if (error.response?.status === 401) {
                setUser(null);
            }
            // For 404/500, we do NOT log the user out to prevent "ghost logouts"
        }
    }, [userData, error]);


    const login = useCallback((newUser: User) => {
        setUser(newUser);
        queryClient.setQueryData(["user-session"], newUser);
    }, [queryClient]);

    const logout = useCallback(async () => {
        // Optimistic update
        setUser(null);
        queryClient.setQueryData(["user-session"], null);

        // Call backend logout if endpoint exists (optional but recommended)
        try {
            await authApi.logout();
        } catch (e) {
            console.error("Logout failed", e);
        }

        // Cleanup local storage if we used it for other things
        localStorage.removeItem("user");

        if (window.location.pathname !== "/") {
            window.location.href = "/";
        }
    }, [queryClient]);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
