import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
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
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground animate-pulse">Verifying session...</p>
            </div>
        );
    }

    return isAuthenticated ? <Component {...rest} /> : null;
};
