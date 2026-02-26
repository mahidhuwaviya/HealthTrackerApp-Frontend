import { Footprints, MoreHorizontal, Clock } from "lucide-react";
import { TrendLineChart } from "@/components/dashboard/DashboardCharts";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/ProgressRing";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DashboardDTO } from "@/api/dashboard";
import { useState } from "react";
import { DateRangeSelector } from "./DateRangeSelector";
import { useParticularSummary } from "@/hooks/useParticularSummary";
interface StepsViewProps {
    targets: { steps: number };
    onOpenTargetModal: () => void;
    chartTimeRange: string;
    setChartTimeRange: (range: string) => void;
    data?: DashboardDTO;
}

export const StepsView = ({
    targets,
    onOpenTargetModal,
    chartTimeRange,
    setChartTimeRange,
    data
}: StepsViewProps) => {

    const [period, setPeriod] = useState<"WEEKLY" | "MONTHLY" | "CUSTOM" | "">("");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");

    const { data: particularData, loading } = useParticularSummary({
        type: "STEPCOUNTER",
        period: period as "WEEKLY" | "MONTHLY" | "CUSTOM",
        customStartDate: period === "CUSTOM" ? customStartDate : undefined,
        customEndDate: period === "CUSTOM" ? customEndDate : undefined,
    });

    // Use particular data if a period is selected, else fallback to today's data
    const displayData = period && particularData
        ? particularData.stepData
        : data?.walkingStats;

    const steps = displayData?.steps || 0;
    const progress = Math.min((steps / targets.steps) * 100, 100);
    const stepLogs = [];

    return (
        <div className="space-y-6">
            <div className="p-6 md:p-8 glass-card inner-glow relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-steps/10 rounded-full blur-3xl point-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3 gradient-text">
                        <div className="p-2 bg-steps/20 rounded-xl"><Footprints className="w-6 h-6 text-steps" /></div>
                        Step Tracking
                    </h2>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-steps hover:bg-steps/10 rounded-xl transition-all">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-steps/20">
                            <DropdownMenuItem onClick={onOpenTargetModal} className="cursor-pointer focus:bg-steps/20 focus:text-steps">
                                Update Daily Goal
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

                <div className={`grid md:grid-cols-2 gap-8 relative z-10 ${loading ? 'opacity-50' : ''}`}>
                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl bg-secondary/30 border border-white/5 shadow-inner backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-steps/5 blur-xl group-hover:bg-steps/10 transition-colors duration-500" />
                            <div className="flex items-center justify-between relative z-10 mb-8">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Goal</span>
                                    <span className="font-bold text-xl">{targets.steps.toLocaleString()}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Current</span>
                                    <span className="font-bold text-xl text-steps">{steps.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-center relative z-10">
                                <ProgressRing progress={progress} color="hsl(var(--stat-steps))" size={180} strokeWidth={15} className="drop-shadow-2xl">
                                    <div className="text-center">
                                        <span className="text-4xl font-bold tracking-tighter">{steps.toLocaleString()}</span>
                                        <span className="text-xs block text-muted-foreground mt-1 uppercase tracking-wider font-semibold">steps</span>
                                    </div>
                                </ProgressRing>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Weekly Trends</h3>
                                <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
                                    <Button
                                        variant={chartTimeRange === "weekly" ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`h-8 rounded-md text-xs font-medium ${chartTimeRange === "weekly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        onClick={() => setChartTimeRange("weekly")}
                                    >
                                        Weekly
                                    </Button>
                                </div>
                            </div>
                            <TrendLineChart
                                data={[]}
                                lineColor="hsl(var(--stat-steps))"
                                unit="steps"
                            />
                        </div>

                        {/* Steps History Table */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">{period ? 'Activity Log' : `Today's Activity`}</h3>
                            <div className="glass-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-steps/5">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold text-steps/80 uppercase tracking-wider text-xs border-b border-white/5">Time</th>
                                                <th className="px-5 py-3 text-right font-semibold text-steps/80 uppercase tracking-wider text-xs border-b border-white/5">Steps</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {stepLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Footprints className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                                            <p>No activity recorded today.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                stepLogs.map((log: any, index: number) => (
                                                    <tr key={index} className="hover:bg-steps/5 transition-colors group">
                                                        <td className="px-5 py-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3 h-3 text-steps" />
                                                                {log.timestamp}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium">{log.count}</td>
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
