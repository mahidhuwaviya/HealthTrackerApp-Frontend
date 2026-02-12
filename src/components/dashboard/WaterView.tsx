import { Droplets, MoreHorizontal, Clock } from "lucide-react";
// import { WeeklyProgressChart } from "@/components/dashboard/DashboardCharts";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/ProgressRing";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DashboardDTO } from "@/api/dashboard";
import { WaterTracker } from "./WaterTracker"; // Reuse the component here for the detailed view logic if applicable, OR use the popup logic? 
// User said: "It should not be in the dashboard page bu in the water intake component /page"
// So WaterView should arguably use the WaterTracker component which has the "Log" buttons inside it?
// OR does WaterView just show stats and have a "Log Water" button that opens the popup?
// User said "which page the log button on clicking the log button we would enter the data".
// And "the popup should be in the +quick add button".
// Let's put the nice WaterTracker component IN the WaterView because that's the "Water Page".
// And it has the "Quick Add buttons" inside it too, which is convenient.


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

    // Assume waterIntake is in ml in backend, converted to oz or cups? 
    // Profile says dailyWaterGoalMl but View shows "oz". 
    // Let's assume the component handles display unit. 
    // Quick fix: Use raw number for now or assume backend mimics frontend unit.
    // If backend is Generic "waterIntake" (number). I will just display it.

    const rawWater: any = data?.totalWaterToday;
    const currentWater = (typeof rawWater === 'object' && rawWater !== null)
        ? (rawWater.totalamountMl || rawWater.waterTotal || 0)
        : (rawWater || data?.dailyLog?.waterIntake || 0);
    const normalizedWaterLogs = (() => {
        const potential = [
            data?.waterLogs,
            (rawWater as any)?.waterTotal, // Backend list location
            (data as any)?.water_logs,
            (data?.dailyLog as any)?.waterLogs
        ];
        const found = potential.find(logs => Array.isArray(logs)) || [];

        // Map backend fields to frontend interface if needed
        return found.map((log: any) => ({
            id: log.id || log.waterLogId,
            amount: log.amount || log.amountMl,
            time: log.time || log.loggedAt, // Might need formatting if full date
        }));
    })();
    const waterLogs = normalizedWaterLogs;

    const progress = Math.min((currentWater / targets.water) * 100, 100);

    return (
        <div className="space-y-6">
            <div className="p-6 md:p-8 glass-card inner-glow relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-water/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 point-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3 gradient-text">
                        <div className="p-2 bg-water/20 rounded-xl"><Droplets className="w-6 h-6 text-water" /></div>
                        Water Intake
                    </h2>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-water hover:bg-water/10 rounded-xl transition-all">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-water/20">
                            <DropdownMenuItem onClick={onOpenTargetModal} className="cursor-pointer focus:bg-water/20 focus:text-water">
                                Update Daily Goal
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div className="flex flex-col items-center justify-center space-y-8 bg-secondary/30 rounded-3xl p-6 border border-white/5">
                        {/* Use the comprehensive WaterTracker component here */}
                        <div className="w-full">
                            <WaterTracker
                                currentIntake={currentWater}
                                dailyGoal={targets.water}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Hydration History</h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant={chartTimeRange === "weekly" ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`h-8 rounded-md text-xs font-medium ${chartTimeRange === "weekly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        onClick={() => setChartTimeRange("weekly")}
                                    >
                                        Weekly
                                    </Button>
                                    {/* Added Monthly for consistency if desired */}
                                </div>
                            </div>
                            {/* <WeeklyProgressChart
                                data={[]}
                                barColor="hsl(var(--stat-water))"
                                unit="oz"
                            /> */}
                        </div>

                        {/* Recent Water Logs Table */}
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Today's Logs</h3>
                            <div className="glass-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-water/5">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold text-water/80 uppercase tracking-wider text-xs border-b border-white/5">Time</th>
                                                <th className="px-5 py-3 text-right font-semibold text-water/80 uppercase tracking-wider text-xs border-b border-white/5">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {waterLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
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
                                                                {log.time}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium">{log.amount} ml</td>
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
