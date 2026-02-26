import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { GlassLoader } from "@/components/ui/GlassLoader";
import { useEffect } from "react";

interface ProtectedRouteProps {
    component: React.ComponentType<any>;
    [key: string]: any;
}

export const ProtectedRoute = ({ component: Component, ...rest }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setLocation("/login");
        }
    }, [isAuthenticated, isLoading, setLocation]);

    if (isLoading) {
        return <GlassLoader state="fetching" message="Syncing Health Data..." />;
    }

    return isAuthenticated ? <Component {...rest} /> : null;
};
