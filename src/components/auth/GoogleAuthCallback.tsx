import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { GlassLoader } from "@/components/ui/GlassLoader";

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

    return <GlassLoader state="fetching" message="Securing Connection..." />;
};
