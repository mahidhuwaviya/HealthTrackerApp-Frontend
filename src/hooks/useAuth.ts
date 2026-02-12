import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, login, logout, isLoading: contextLoading } = context;

    // Optional: React Query to re-validate session on specific actions/intervals if needed
    // But primarily we rely on the AuthContext's initial load.
    // We can expose a refetch function if we want to manually check auth status.
    const { refetch: checkAuth } = useQuery({
        queryKey: ["auth-check"],
        queryFn: authApi.getUser,
        enabled: false, // Don't auto-run, rely on Context init
        retry: false
    });

    return {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading: contextLoading,
        checkAuth
    };
};
