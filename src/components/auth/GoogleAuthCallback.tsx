import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";

export const GoogleAuthCallback = () => {
    const [, setLocation] = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            try {
                // Store token in cookie as requested
                // Using 'token' as the key to match common patterns, 
                // though the backend might expect something specific if strict HttpOnly wasn't used.
                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;

                // Decode user info
                const decoded: any = jwtDecode(token);
                const user = {
                    id: decoded.id || decoded.sub || "google-user",
                    email: decoded.email || decoded.sub || "",
                    name: decoded.name || decoded.email || "User"
                };

                login(user); // Updated signature: only user object needed
                setLocation("/dashboard");
            } catch (error) {
                console.error("Token processing failed", token, error);
                setLocation("/login?error=token_processing_failed");
            }
        } else {
            setLocation("/login?error=no_token");
        }
    }, [login, setLocation]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-lg text-muted-foreground">Processing Secure Login...</p>
            </div>
        </div>
    );
};
