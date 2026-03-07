import { dashboardApi, ParticularTimeRequestDTO, ParticularTimeResponseDTO } from '@/api/dashboard';
import { useQuery } from '@tanstack/react-query';

export const useParticularSummary = (req: ParticularTimeRequestDTO) => {
    const query = useQuery<ParticularTimeResponseDTO, Error>({
        queryKey: ["particular-summary", req.type, req.period, req.customStartDate, req.customEndDate],
        queryFn: () => dashboardApi.getParticularSummary(req),
        enabled: !!req.period,
        staleTime: 1000 * 60 * 5, // Cache for 5 mins to prevent spam
        refetchOnWindowFocus: false,
        retry: false
    });

    return {
        data: query.data || null,
        loading: query.isLoading,
        error: query.error?.message || null
    };
};
