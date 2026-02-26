import { useState, useEffect } from 'react';
import { dashboardApi, ParticularTimeRequestDTO, ParticularTimeResponseDTO } from '@/api/dashboard';

export const useParticularSummary = (req: ParticularTimeRequestDTO) => {
    const [data, setData] = useState<ParticularTimeResponseDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dashboardApi.getParticularSummary(req);
                setData(response);
            } catch (err: any) {
                console.error("Error fetching particular summary", err);
                setError(err.message || "Failed to fetch summary data");
            } finally {
                setLoading(false);
            }
        };

        if (req.period) {
            fetchData();
        }
    }, [req.type, req.period, req.customStartDate, req.customEndDate]);

    return { data, loading, error };
};
