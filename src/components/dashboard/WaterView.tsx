import { Droplets, Clock, Trash2 } from "lucide-react";
// import { WeeklyProgressChart } from "@/components/dashboard/DashboardCharts";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/ProgressRing";
import { HEALTH_DEFAULTS } from "@/config/health-constants";
import { DashboardDTO } from "@/api/dashboard";
import { useState } from "react";
import { DateRangeSelector } from "./DateRangeSelector";
import { useParticularSummary } from "@/hooks/useParticularSummary";
import { WaterTracker } from "./WaterTracker";
import { computeScaledGoal } from "@/utils/periodGoal";
import { waterApi } from "@/api/water";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


interface WaterViewProps {
    targets: { water: number };
    onOpenTargetModal: () => void;
    chartTimeRange: string;
    setChartTimeRange: (range: string) => void;
    data?: DashboardDTO;
}

export const WaterView = ({
    targets,
    onOpenTargetModal,
    chartTimeRange,
    setChartTimeRange,
    data
}: WaterViewProps) => {

    const queryClient = useQueryClient();
    const [period, setPeriod] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | "">("TODAY");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: particularData, loading } = useParticularSummary({
        type: "WATER",
        period: period as any,
        customStartDate: period === "CUSTOM" ? customStartDate : undefined,
        customEndDate: period === "CUSTOM" ? customEndDate : undefined,
    });

    const displayData = period === "TODAY"
        ? (particularData?.waterData || data?.totalWaterToday)
        : (period && particularData ? particularData.waterData : data?.totalWaterToday);

    const rawWater: any = displayData;
    const currentWater = (typeof rawWater === 'object' && rawWater !== null)
        ? (rawWater.totalamountMl || (Array.isArray(rawWater.waterTotal) ? rawWater.waterTotal.reduce((acc: number, curr: any) => acc + (curr.amount || curr.amountMl || 0), 0) : 0))
        : (rawWater || 0);

    const waterLogsSource = period && particularData?.waterData?.waterTotal
        ? particularData.waterData.waterTotal
        : (!period && typeof rawWater === 'object' && rawWater?.waterTotal)
            ? rawWater.waterTotal
            : data?.waterLogs || (data as any)?.water_logs || [];


    const waterLogs = waterLogsSource.map((log: any) => ({
        id: log.id || log.waterLogId,
        amount: log.amount || log.amountMl,
        logDate: log.logDate || "N/A",
        logTime: log.logTime || "N/A",
    }));

    // Dynamic scaled water goal
    const baseWaterGoal = targets.water || data?.profile?.dailyWaterGoalMl || 0;
    const scaledWaterGoal = computeScaledGoal(baseWaterGoal, period, customStartDate, customEndDate);
    const progress = scaledWaterGoal > 0 ? Math.min((currentWater / scaledWaterGoal) * 100, 100) : 0;

    const handleDeleteWater = async (log: { id: number; amount: number; logDate: string }) => {
        if (!log.amount && !log.logDate) return;
        setDeletingId(log.id);
        try {
            await waterApi.deleteWaterLog({
                date: log.logDate,
                amount: log.amount,
                unit: "ml"
            });
            toast.success("Water entry deleted");
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["particular-summary"] });
        } catch {
            toast.error("Failed to delete water entry");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 md:p-8 glass-card inner-glow relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-water/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3 gradient-text">
                        <div className="p-2 bg-water/20 rounded-xl"><Droplets className="w-6 h-6 text-water" /></div>
                        Water Intake
                    </h2>

                </div>

                <div className="mb-6">
                    <DateRangeSelector
                        period={period as any}
                        setPeriod={setPeriod as any}
                        customStartDate={customStartDate}
                        setCustomStartDate={setCustomStartDate}
                        customEndDate={customEndDate}
                        setCustomEndDate={setCustomEndDate}
                    />
                </div>

                <div className={`grid md: grid - cols - 2 gap - 8 relative z - 10 ${loading ? 'opacity-50' : ''} `}>
                    <div className="flex flex-col items-center justify-center space-y-8 bg-secondary/30 rounded-3xl p-6 border border-white/5">
                        {/* Use the comprehensive WaterTracker component here */}
                        <div className="w-full">
                            <WaterTracker
                                currentIntake={currentWater}
                                dailyGoal={scaledWaterGoal}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Hydration History</h3>

                            </div>
                            {/* <WeeklyProgressChart
                                data={[]}
                                barColor="hsl(var(--stat-water))"
                                unit="oz"
                            /> */}
                        </div>

                        {/* Recent Water Logs Table */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    {(() => {
                                        switch (period) {
                                            case "TODAY":
                                            case "":
                                                return "Showing data for Today";
                                            case "WEEKLY": {
                                                const now = new Date();
                                                const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
                                                const lastMonday = new Date(now);
                                                lastMonday.setDate(now.getDate() - dayOfWeek);
                                                return `Data from ${lastMonday.toLocaleDateString()} to ${now.toLocaleDateString()} `;
                                            }
                                            case "MONTHLY": {
                                                const now = new Date();
                                                const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                                                return `Data from ${firstOfMonth.toLocaleDateString()} to ${now.toLocaleDateString()} `;
                                            }
                                            case "CUSTOM":
                                                return `Data for period: ${customStartDate || 'Start Date'} to ${customEndDate || 'End Date'} `;
                                            default:
                                                return "Showing data for Today";
                                        }
                                    })()}
                                </h3>
                            </div>
                            <div className="glass-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-water/5">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold text-water/80 uppercase tracking-wider text-xs border-b border-white/5">Date / Time</th>
                                                <th className="px-5 py-3 text-right font-semibold text-water/80 uppercase tracking-wider text-xs border-b border-white/5">Amount</th>
                                                {period === "TODAY" && <th className="px-5 py-3 text-center border-b border-white/5"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {waterLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={period === "TODAY" ? 3 : 2} className="px-6 py-12 text-center text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Droplets className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                                            <p>No water logged today.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                waterLogs.map((log: any, index: number) => (
                                                    <tr key={index} className="hover:bg-water/5 transition-colors group">
                                                        <td className="px-5 py-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3 h-3 text-water" />
                                                                {log.logDate} {log.logTime}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium">{log.amount} ml</td>
                                                        {period === "TODAY" && (
                                                            <td className="px-3 py-3 text-center">
                                                                <button
                                                                    title="Delete entry"
                                                                    disabled={deletingId === log.id}
                                                                    onClick={() => handleDeleteWater({ id: log.id, amount: log.amount, logDate: log.logDate })}
                                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
