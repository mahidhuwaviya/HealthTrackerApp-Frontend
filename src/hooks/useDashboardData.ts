
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, DashboardDTO } from "@/api/dashboard";
import { useAuth } from "./useAuth";

export const useDashboardData = () => {
    const { user } = useAuth();

    return useQuery<DashboardDTO>({
        queryKey: ["dashboard-summary"], // Centralized key for dashboard summary
        queryFn: dashboardApi.getSummary,
        enabled: !!user, // Only fetch if user is authenticated
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
    });
};
