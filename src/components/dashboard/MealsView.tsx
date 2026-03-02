import { Utensils, Clock, Trash2 } from "lucide-react";
// import { WeeklyProgressChart } from "@/components/dashboard/DashboardCharts";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/ProgressRing";
import { DashboardDTO } from "@/api/dashboard";
import { useState } from "react";
import { DateRangeSelector } from "./DateRangeSelector";
import { useParticularSummary } from "@/hooks/useParticularSummary";
import { computeScaledGoal } from "@/utils/periodGoal";
import { foodApi } from "@/api/food";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HEALTH_DEFAULTS } from "@/config/health-constants";
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

    const queryClient = useQueryClient();

    const [period, setPeriod] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | "">("TODAY");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: particularData, loading } = useParticularSummary({
        type: "FOOD",
        period: period as any,
        customStartDate: period === "CUSTOM" ? customStartDate : undefined,
        customEndDate: period === "CUSTOM" ? customEndDate : undefined,
    });

    const isValidFoodData = particularData?.foodData && Object.keys(particularData.foodData).length > 0;

    const displayData = period === "TODAY"
        ? (isValidFoodData ? particularData.foodData : data?.dailyLog)
        : (period && particularData ? particularData.foodData : data?.dailyLog);

    const mealLogs = (displayData as any)?.mealEntries || (displayData as any)?.todaysMeals || [];

    // Dynamic scaled goal: multiply base daily target by days in the period
    const baseCalorieGoal = targets.calories || data?.profile?.dailyCalorieTarget || data?.profile?.targetDailyCalorie || 0;
    const scaledCalorieGoal = computeScaledGoal(baseCalorieGoal, period, customStartDate, customEndDate);

    // Actual: sum calories from table rows for accuracy
    const caloriesConsumed = mealLogs.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        || (displayData as any)?.totalDailyCalories || 0;
    const progress = scaledCalorieGoal > 0 ? Math.min((caloriesConsumed / scaledCalorieGoal) * 100, 100) : 0;

    const macros = [
        { label: "Protein", value: Math.round(mealLogs.reduce((s: number, m: any) => s + (m.protein || 0), 0) || (displayData as any)?.totalDailyProtein || 0), unit: "g", color: "bg-blue-500" },
        { label: "Carbs", value: Math.round(mealLogs.reduce((s: number, m: any) => s + (m.carbs || 0), 0) || (displayData as any)?.totalDailyCarbs || 0), unit: "g", color: "bg-green-500" },
        { label: "Fats", value: Math.round(mealLogs.reduce((s: number, m: any) => s + (m.fats || 0), 0) || (displayData as any)?.totalDailyFats || 0), unit: "g", color: "bg-yellow-500" },
    ];

    const handleDeleteMeal = async (meal: any) => {
        if (!meal?.mealEntryId) return;
        setDeletingId(meal.mealEntryId);
        try {
            await foodApi.deleteMeal(meal);
            toast.success("Meal entry deleted");
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["particular-summary"] });
        } catch {
            toast.error("Failed to delete meal entry");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Card */}
            <div className="p-6 md:p-8 glass-card inner-glow relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-calories/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3 gradient-text">
                        <div className="p-2 bg-calories/20 rounded-xl"><Utensils className="w-6 h-6 text-calories" /></div>
                        Meal Tracking
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

                <div className={`grid md:grid-cols-2 gap-8 relative z-10 ${loading ? 'opacity-50' : ''}`}>
                    <div className="space-y-6">
                        {/* Calories Progress */}
                        <div className="p-6 rounded-3xl bg-secondary/30 border border-white/5 shadow-inner backdrop-blur-sm">
                            <div className="flex items-center justify-between text-sm mb-4">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Goal</span>
                                    <span className="font-bold text-xl">{Math.round(scaledCalorieGoal)}</span>
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
                                                {period === "TODAY" && <th className="px-5 py-3 text-center font-semibold text-calories/80 uppercase tracking-wider text-xs border-b border-white/5"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {mealLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={period === "TODAY" ? 9 : 8} className="px-6 py-12 text-center text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Utensils className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                                            <p>No meals logged today.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                mealLogs.map((meal: any, index: number) => (
                                                    <tr key={index} className="hover:bg-calories/5 transition-colors group">
                                                        <td className="px-5 py-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3 h-3 text-calories" />
                                                                {meal.date || meal.entryTime || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 font-medium text-foreground">{meal.foodName}</td>
                                                        <td className="px-5 py-3">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-calories/10 text-calories capitalize border border-calories/20">
                                                                {meal.type?.toLowerCase().replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium">{Math.round(meal.quantity)}</td>
                                                        <td className="px-5 py-3 text-right font-medium text-calories">{meal.calories ? Math.round(meal.calories) : '-'}</td>
                                                        <td className="px-5 py-3 text-right text-muted-foreground">{meal.protein ? Math.round(meal.protein) : '-'}</td>
                                                        <td className="px-5 py-3 text-right text-muted-foreground">{meal.carbs ? Math.round(meal.carbs) : '-'}</td>
                                                        <td className="px-5 py-3 text-right text-muted-foreground">{meal.fats ? Math.round(meal.fats) : '-'}</td>
                                                        {period === "TODAY" && (
                                                            <td className="px-3 py-3 text-center">
                                                                <button
                                                                    title="Delete entry"
                                                                    disabled={deletingId === meal.mealEntryId}
                                                                    onClick={() => handleDeleteMeal(meal)}
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
