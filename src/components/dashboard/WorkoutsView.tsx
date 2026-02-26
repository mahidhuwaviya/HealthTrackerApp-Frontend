import { Dumbbell, MoreHorizontal, Plus, Clock, Flame } from "lucide-react";
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
import { useState } from "react";
import { DateRangeSelector } from "./DateRangeSelector";
import { useParticularSummary } from "@/hooks/useParticularSummary";
interface WorkoutsViewProps {
    targets: { workouts: number };
    onOpenTargetModal: () => void;
    chartTimeRange: string;
    setChartTimeRange: (range: string) => void;
    data?: DashboardDTO;
    onLogWorkout: () => void;
}

export const WorkoutsView = ({
    targets,
    onOpenTargetModal,
    chartTimeRange,
    setChartTimeRange,
    data,
    onLogWorkout
}: WorkoutsViewProps) => {

    const [period, setPeriod] = useState<"WEEKLY" | "MONTHLY" | "CUSTOM" | "">("");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");

    const { data: particularData, loading } = useParticularSummary({
        type: "EXERCISE",
        period: period as "WEEKLY" | "MONTHLY" | "CUSTOM",
        customStartDate: period === "CUSTOM" ? customStartDate : undefined,
        customEndDate: period === "CUSTOM" ? customEndDate : undefined,
    });

    const displayData = period && particularData
        ? particularData.exerciseData
        : data?.workoutLog;

    const workoutData = displayData;
    const exercises = (workoutData as any)?.exerciseEntries || (workoutData as any)?.exercises || [];
    const workoutsCount = exercises.length;

    // Calculate totals if not provided.
    const totalCaloriesBurned = workoutData?.caloriesBurned || 0;

    // Calculate duration from exercises
    const totalDuration = exercises.reduce((acc, log) => acc + (log.durationMinutes || log.duration || 0), 0);

    return (
        <div className="space-y-6">
            {/* ... keeping the same structure ... */}
            {/* Main Stats Card */}
            <div className="p-6 md:p-8 glass-card inner-glow relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 point-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3 gradient-text">
                        <div className="p-2 bg-primary/20 rounded-xl"><Dumbbell className="w-6 h-6 text-primary" /></div>
                        Workout Tracking
                    </h2>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-primary/20">
                            <DropdownMenuItem onClick={onOpenTargetModal} className="cursor-pointer focus:bg-primary/20 focus:text-primary">
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
                    {/* Ring Section */}
                    <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-3xl border border-white/5 shadow-inner">
                        {(() => {
                            const dailyGoal = targets.workouts || 45;
                            const currentDailyMins = data?.workoutLog?.totalMinsWorkoutToday || totalDuration;
                            const dailyProgress = Math.min((totalDuration / dailyGoal) * 100, 100);
                            const isGoalAchieved = currentDailyMins >= dailyGoal;

                            return (
                                <div className="relative flex flex-col items-center">
                                    <div className="relative group cursor-default">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700" />
                                        <ProgressRing
                                            progress={dailyProgress}
                                            size={160}
                                            strokeWidth={12}
                                            color="hsl(var(--primary))"
                                            className="drop-shadow-lg"
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl font-bold tracking-tighter">{Math.round(dailyProgress)}%</span>
                                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Goal</span>
                                            </div>
                                        </ProgressRing>
                                        {isGoalAchieved && (
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-in fade-in zoom-in border border-white/20 whitespace-nowrap">
                                                <Flame className="w-3 h-3 fill-current" /> GOAL CRUSHED!
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="text-3xl font-bold text-primary">{Math.round(totalDuration)}</span>
                                        <span className="text-muted-foreground text-lg ml-1">/ {dailyGoal} min</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Stats Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/5">
                            <span className="text-muted-foreground font-medium">Completed (Today)</span>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <span className="font-bold text-2xl text-foreground">{Math.round(totalDuration)} <span className="text-sm text-muted-foreground font-normal">min</span></span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="stat-card p-5 rounded-3xl bg-primary/5 border-primary/10 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
                                <span className="text-3xl font-bold text-primary">{workoutsCount}</span>
                                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Exercises</span>
                            </div>
                            <div className="stat-card p-5 rounded-3xl bg-orange-500/5 border-orange-500/10 flex flex-col items-center justify-center gap-2 hover:bg-orange-500/10 transition-colors">
                                <span className="text-3xl font-bold text-orange-500">{Math.round(totalCaloriesBurned)}</span>
                                <span className="text-xs font-bold text-orange-500/60 uppercase tracking-widest">Calories</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-amber-500 hover:to-amber-600 text-primary-foreground font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all rounded-xl"
                            onClick={onLogWorkout}
                        >
                            <Plus className="w-6 h-6 mr-2" /> Log Workout
                        </Button>
                    </div>
                </div>
            </div>

            <div className={`space-y-6 animate-fade-in-up ${loading ? 'opacity-50' : ''}`} style={{ animationDelay: '0.1s' }}>
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold gradient-text">{period ? 'Workout History' : `Today's Exercises`}</h3>

                        {/* Optional Toggle if needed later
                        <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
                            <Button variant="ghost" size="sm" className="h-8 rounded-md bg-background shadow-sm text-foreground">List</Button>
                            <Button variant="ghost" size="sm" className="h-8 rounded-md text-muted-foreground hover:text-foreground">Chart</Button>
                        </div>
                        */}
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-primary/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-white/5">Name</th>
                                        <th className="px-6 py-4 text-right font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-white/5">Sets</th>
                                        <th className="px-6 py-4 text-right font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-white/5">Reps</th>
                                        <th className="px-6 py-4 text-right font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-white/5">Calories</th>
                                        <th className="px-6 py-4 text-right font-semibold text-primary/80 uppercase tracking-wider text-xs border-b border-white/5">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {exercises.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                                                        <Dumbbell className="w-6 h-6 text-muted-foreground/50" />
                                                    </div>
                                                    <p>No exercises logged today.</p>
                                                    <Button variant="link" onClick={onLogWorkout} className="text-primary">Log your first workout</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        exercises.map((log, index) => (
                                            <tr key={index} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-foreground">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                            <Dumbbell className="w-4 h-4" />
                                                        </div>
                                                        {log.exerciseName || log.name || "Workout"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-muted-foreground">{log.sets || 0}</td>
                                                <td className="px-6 py-4 text-right text-muted-foreground">{log.reps || 0}</td>
                                                <td className="px-6 py-4 text-right font-medium text-orange-500">
                                                    {log.caloriesBurned ? Math.round(log.caloriesBurned) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">{Math.round(log.durationMinutes ?? log.duration ?? 0)} min</td>
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
    );
};
