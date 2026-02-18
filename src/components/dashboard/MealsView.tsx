import { Utensils, MoreHorizontal, Clock } from "lucide-react";
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

interface MealsViewProps {
    targets: { calories: number };
    onOpenTargetModal: () => void;
    chartTimeRange: string;
    setChartTimeRange: (range: string) => void;
    onLogMeal: () => void;
    data?: DashboardDTO;
}


export const MealsView = ({
    targets,
    onOpenTargetModal,
    chartTimeRange,
    setChartTimeRange,
    onLogMeal,
    data
}: MealsViewProps) => {

    const dailyLog = data?.dailyLog;
    const mealLogs = data?.dailyLog?.todaysMeals || [];
    console.log(mealLogs);

    const caloriesConsumed = dailyLog?.totalDailyCalories || 0;
    const progress = Math.min((caloriesConsumed / targets.calories) * 100, 100);

    const macros = [
        { label: "Protein", value: Math.round(dailyLog?.totalDailyProtein || 0), unit: "g", color: "bg-blue-500" },
        { label: "Carbs", value: Math.round(dailyLog?.totalDailyCarbs || 0), unit: "g", color: "bg-green-500" },
        { label: "Fats", value: Math.round(dailyLog?.totalDailyFats || 0), unit: "g", color: "bg-yellow-500" },
    ];

    return (
        <div className="space-y-6">
            {/* Main Stats Card */}
            <div className="p-6 md:p-8 glass-card inner-glow relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-calories/10 rounded-full blur-3xl point-events-none" />
                <div className="absolute top-1/2 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl point-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3 gradient-text">
                        <div className="p-2 bg-calories/20 rounded-xl"><Utensils className="w-6 h-6 text-calories" /></div>
                        Meal Tracking
                    </h2>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-calories hover:bg-calories/10 rounded-xl transition-all">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-calories/20">
                            <DropdownMenuItem onClick={onOpenTargetModal} className="cursor-pointer focus:bg-calories/20 focus:text-calories">
                                Update Daily Goal
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-6">
                        {/* Calories Progress */}
                        <div className="p-6 rounded-3xl bg-secondary/30 border border-white/5 shadow-inner backdrop-blur-sm">
                            <div className="flex items-center justify-between text-sm mb-4">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Goal</span>
                                    <span className="font-bold text-xl">{targets.calories}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Eaten</span>
                                    <span className="font-bold text-xl text-calories">{Math.round(caloriesConsumed)}</span>
                                </div>
                            </div>

                            <div className="flex justify-center py-2 relative group">
                                <div className="absolute inset-0 bg-calories/20 blur-2xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                                <ProgressRing
                                    progress={progress}
                                    color="hsl(var(--stat-calories))"
                                    size={150}
                                    strokeWidth={12}
                                    className="drop-shadow-lg"
                                >
                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-foreground">{Math.round(progress)}%</span>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Consumed</p>
                                    </div>
                                </ProgressRing>
                            </div>
                        </div>

                        {/* Macros Breakdown */}
                        <div className="grid grid-cols-3 gap-4">
                            {macros.map((macro) => (
                                <div key={macro.label} className="p-4 rounded-2xl bg-secondary/40 border border-white/5 text-center hover:bg-secondary/60 transition-colors">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">{macro.label}</p>
                                    <p className="font-bold text-lg mb-2">{macro.value}<span className="text-xs text-muted-foreground ml-1">{macro.unit}</span></p>
                                    <div className={`h-1.5 w-12 mx-auto rounded-full ${macro.color} opacity-80`} />
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full h-12 text-lg bg-gradient-to-r from-calories to-orange-600 hover:to-orange-700 text-white font-bold shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all rounded-xl"
                            onClick={onLogMeal}
                        >
                            <Utensils className="w-5 h-5 mr-2" /> Log Meal
                        </Button>
                    </div>

                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {/* Weekly Chart Placeholder or Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Weekly Intake</h3>
                                <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
                                    <Button
                                        variant={chartTimeRange === "weekly" ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`h-8 rounded-md text-xs font-medium ${chartTimeRange === "weekly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        onClick={() => setChartTimeRange("weekly")}
                                    >
                                        Weekly
                                    </Button>
                                    <Button
                                        variant={chartTimeRange === "monthly" ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`h-8 rounded-md text-xs font-medium ${chartTimeRange === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        onClick={() => setChartTimeRange("monthly")}
                                    >
                                        Monthly
                                    </Button>
                                </div>
                            </div>
                            {/* <WeeklyProgressChart
                                // Mock data for chart - backend API likely needed for specific chart data if not in summary
                                data={[]}
                                barColor="hsl(var(--stat-calories))"
                                unit="kcal"
                            /> */}
                        </div>

                        {/* Recent Meals Table */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">Today's Meals</h3>
                            <div className="glass-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-calories/5">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5">Time</th>
                                                <th className="px-5 py-3 text-left font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5">Food</th>
                                                <th className="px-5 py-3 text-left font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5 w-[100px]">Type</th>
                                                <th className="px-5 py-3 text-right font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5">Qty</th>
                                                <th className="px-5 py-3 text-right font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5">Cals</th>
                                                <th className="px-5 py-3 text-right font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5">P (g)</th>
                                                <th className="px-5 py-3 text-right font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5">C (g)</th>
                                                <th className="px-5 py-3 text-right font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5">F (g)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {mealLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Utensils className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                                            <p>No meals logged today.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                mealLogs.map((meal, index) => (
                                                    <tr key={index} className="hover:bg-calories/5 transition-colors group">
                                                        <td className="px-5 py-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3 h-3 text-calories" />
                                                                {meal.date}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 font-medium text-foreground">{meal.foodName}</td>
                                                        <td className="px-5 py-3">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-calories/10 text-calories capitalize border border-calories/20">
                                                                {meal.type.toLowerCase().replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium">{Math.round(meal.quantity)}</td>
                                                        <td className="px-5 py-3 text-right font-medium text-calories">{meal.calories ? Math.round(meal.calories) : '-'}</td>
                                                        <td className="px-5 py-3 text-right text-muted-foreground">{meal.protein ? Math.round(meal.protein) : '-'}</td>
                                                        <td className="px-5 py-3 text-right text-muted-foreground">{meal.carbs ? Math.round(meal.carbs) : '-'}</td>
                                                        <td className="px-5 py-3 text-right text-muted-foreground">{meal.fats ? Math.round(meal.fats) : '-'}</td>
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
