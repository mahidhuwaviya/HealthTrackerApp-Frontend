import { formatDashboardDate } from "@/utils/dateUtils";
import { useState } from "react";
import { Footprints, Clock, Plus } from "lucide-react";
import { TrendLineChart } from "@/components/dashboard/DashboardCharts";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/ProgressRing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardDTO } from "@/api/dashboard";
import { DateRangeSelector } from "./DateRangeSelector";
import { useParticularSummary } from "@/hooks/useParticularSummary";
import { stepsApi } from "@/api/steps";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface StepsViewProps {
    targets: { steps: number };
    onOpenTargetModal: () => void;
    chartTimeRange: string;
    setChartTimeRange: (range: string) => void;
    data?: DashboardDTO;
}

export const StepsView = ({
    targets,
    data
}: StepsViewProps) => {

    const queryClient = useQueryClient();
    const [period, setPeriod] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | "">("TODAY");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");

    // Log steps dialog state
    const [logOpen, setLogOpen] = useState(false);
    const [stepInput, setStepInput] = useState<string>("");
    const [isLogging, setIsLogging] = useState(false);

    const { data: particularData, loading } = useParticularSummary({
        type: "STEPCOUNTER",
        period: period as any,
        customStartDate: period === "CUSTOM" ? customStartDate : undefined,
        customEndDate: period === "CUSTOM" ? customEndDate : undefined,
    });

    // WalkingResponseDTO has .list (array of WalkingLog)
    const stepLogs: any[] = particularData?.stepData?.list || [];

    // Total steps: sum from the particular summary list, fallback to walkingStats.list for today ring
    const todayStepsFromSummary = (data?.walkingStats?.list || []).reduce(
        (sum: number, l: any) => sum + (l.steps || l.disCovered || 0), 0
    );
    const steps = stepLogs.length > 0
        ? stepLogs.reduce((sum: number, l: any) => sum + (l.disCovered || l.steps || 0), 0)
        : todayStepsFromSummary;
    const stepsGoal = targets.steps || 0;
    const progress = stepsGoal > 0 ? Math.min((steps / stepsGoal) * 100, 100) : 0;

    const handleLogSteps = async () => {
        const val = parseInt(stepInput);
        if (!val || val <= 0) {
            toast.error("Please enter a valid step count");
            return;
        }
        setIsLogging(true);
        try {
            const today = new Date().toISOString().split("T")[0];
            await stepsApi.logSteps({ date: today, disCovered: val, unit: "steps" });
            toast.success("Steps logged!");
            setStepInput("");
            setLogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["particular-summary"] });
        } catch {
            toast.error("Failed to log steps. Please try again.");
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 md:p-8 glass-card inner-glow relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-steps/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3 gradient-text">
                        <div className="p-2 bg-steps/20 rounded-xl"><Footprints className="w-6 h-6 text-steps" /></div>
                        Step Tracking
                    </h2>
                    <Button
                        onClick={() => setLogOpen(true)}
                        className="flex items-center gap-2 bg-steps/20 hover:bg-steps/30 text-steps border border-steps/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                        variant="ghost"
                    >
                        <Plus className="w-4 h-4" />
                        Log Steps
                    </Button>
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
                                    <span className="font-bold text-xl">{stepsGoal > 0 ? stepsGoal.toLocaleString() : '—'}</span>
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
                                <h3 className="text-lg font-bold">Trends</h3>
                            </div>
                            <TrendLineChart
                                data={[]}
                                lineColor="hsl(var(--stat-steps))"
                                unit="steps"
                            />
                        </div>

                        {/* Steps History Table */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">
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
                                                return `Data from ${lastMonday.toLocaleDateString()} to ${now.toLocaleDateString()}`;
                                            }
                                            case "MONTHLY": {
                                                const now = new Date();
                                                const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                                                return `Data from ${firstOfMonth.toLocaleDateString()} to ${now.toLocaleDateString()}`;
                                            }
                                            case "CUSTOM":
                                                return `Data for period: ${customStartDate || 'Start Date'} to ${customEndDate || 'End Date'}`;
                                            default:
                                                return "Showing data for Today";
                                        }
                                    })()}
                                </h3>
                            </div>
                            <div className="glass-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-steps/5">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold text-steps/80 uppercase tracking-wider text-xs border-b border-white/5">Date</th>
                                                <th className="px-5 py-3 text-right font-semibold text-steps/80 uppercase tracking-wider text-xs border-b border-white/5">Steps</th>
                                                <th className="px-5 py-3 text-right font-semibold text-steps/80 uppercase tracking-wider text-xs border-b border-white/5">Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {stepLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Footprints className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                                            <p>No activity recorded.</p>
                                                            <Button variant="link" onClick={() => setLogOpen(true)} className="text-steps">Log your steps</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                stepLogs.map((log: any, index: number) => (
                                                    <tr key={index} className="hover:bg-steps/5 transition-colors group">
                                                        <td className="px-5 py-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3 h-3 text-steps" />
                                                                {log.date || log.logDate ? formatDashboardDate(log.date || log.logDate) : "—"}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium text-steps">
                                                            {(log.disCovered || log.steps || 0).toLocaleString()}
                                                        </td>
                                                        <td className="px-5 py-3 text-right text-muted-foreground text-xs">
                                                            {log.unit || "steps"}
                                                        </td>
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

            {/* Log Steps Dialog */}
            <Dialog open={logOpen} onOpenChange={setLogOpen}>
                <DialogContent className="glass-card border-steps/20 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="gradient-text flex items-center gap-2">
                            <Footprints className="w-5 h-5 text-steps" />
                            Log Steps
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Step Count</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 3000"
                                value={stepInput}
                                onChange={(e) => setStepInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogSteps()}
                                className="flex h-12 w-full rounded-xl border border-steps/30 bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-steps/40"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                Logs today's date (<b>{new Date().toLocaleDateString()}</b>) with unit: steps
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setLogOpen(false)}>Cancel</Button>
                            <Button
                                className="flex-1 bg-steps/20 hover:bg-steps/30 text-steps border border-steps/30"
                                variant="ghost"
                                disabled={isLogging || !stepInput}
                                onClick={handleLogSteps}
                            >
                                {isLogging ? "Saving..." : "Log Steps"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
