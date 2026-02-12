import {
    Zap,
    Utensils,
    Dumbbell,
    Footprints,
    Droplets,
    Flame,
    Heart
} from "lucide-react";
import { Link } from "wouter";
import ProgressRing from "@/components/ui/ProgressRing";
import { DashboardDTO } from "@/api/dashboard";

interface OverviewViewProps {
    data?: DashboardDTO;
}

export const OverviewView = ({ data, targets }: OverviewViewProps & { targets: { workouts: number } }) => {
    // Recent Activity Logic
    const activities = [];

    // Latest Meal
    if (data?.dailyLog?.todaysMeals && data.dailyLog.todaysMeals.length > 0) {
        const lastMeal = data.dailyLog.todaysMeals[data.dailyLog.todaysMeals.length - 1];
        activities.push({
            icon: Utensils,
            title: `${lastMeal.type} Logged`,
            value: `${lastMeal.foodName}`,
            time: "Today",
            color: "bg-calories/20 text-calories"
        });
    }

    // Latest Workout
    const workoutLog = data?.workoutLog;
    const exercisesList = workoutLog?.exerciseEntries || workoutLog?.exercises || [];

    if (exercisesList.length > 0) {
        const lastWorkout = exercisesList[exercisesList.length - 1];
        activities.push({
            icon: Dumbbell,
            title: lastWorkout.exerciseName || lastWorkout.name || "Workout",
            value: `${lastWorkout.durationMinutes || lastWorkout.duration || 0} min`,
            time: "Today", // DTO has no timestamp for exercises yet
            color: "bg-primary/20 text-primary"
        });
    }

    // Fallback if empty
    if (activities.length === 0) {
        activities.push({ icon: Zap, title: "No activity yet", value: "-", time: "Today", color: "bg-gray-200 text-gray-500" });
    }

    // Metrics
    const rawWater: any = data?.totalWaterToday;
    const waterCurrent = (typeof rawWater === 'object' && rawWater !== null)
        ? (rawWater.totalamountMl || rawWater.waterTotal || 0)
        : (rawWater || 0);
    const waterGoal = data?.profile?.dailyWaterGoalMl || 2000;
    const waterProgress = waterGoal > 0 ? Math.min((waterCurrent / waterGoal) * 100, 100) : 0;

    const stepsCurrent = data?.walkingStats?.steps || 0;
    const stepsGoal = 10000;
    const stepsProgress = Math.min((stepsCurrent / stepsGoal) * 100, 100);

    const caloriesCurrent = data?.dailyLog?.totalDailyCalories || 0;
    const caloriesGoal = data?.profile?.dailyCalorieTarget || 2000;
    const caloriesProgress = Math.min((caloriesCurrent / caloriesGoal) * 100, 100);

    // Workout Metrics (New)
    // Calculate total duration from exercises list or use totalMinsWorkoutToday from backend
    const workoutsCurrent = data?.workoutLog?.totalMinsWorkoutToday || exercisesList.reduce((acc, curr) => acc + (curr.durationMinutes || curr.duration || 0), 0) || 0;
    const workoutsGoal = targets.workouts || 45;
    const workoutsProgress = Math.min((workoutsCurrent / workoutsGoal) * 100, 100);

    // Format duration for display (e.g. 90 -> 1h 30m)
    const hours = Math.floor(workoutsCurrent / 60);
    const minutes = workoutsCurrent % 60;
    const workoutDisplayValue = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`; // Simplified display logic or just always Hh Mm as requested? User asked for 1h 30m.

    return (
        <>
            {/* Recent Activity */}
            <section className="mb-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 gradient-text">
                    <Zap className="w-6 h-6 text-primary" />
                    Recent Activity
                </h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                    {activities.map((activity, index) => (
                        <div key={index} className="stat-card flex items-center gap-5 inner-glow p-6">
                            <div className={`w-14 h-14 rounded-2xl ${activity.color} flex items-center justify-center shadow-lg`}>
                                <activity.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="font-semibold text-lg">{activity.title}</div>
                                <div className="text-sm text-muted-foreground font-medium">{activity.value} • {activity.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Today's Progress */}
            <section className="mb-8 place-content-center">
                <h2 className="text-xl font-bold mb-6 gradient-text">Today's Progress</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
                    {[
                        { icon: Droplets, label: "Water", current: waterCurrent, goal: waterGoal, unit: "ml", progress: 100, displayValue: `${waterCurrent.toLocaleString()}`, displayUnit: 'ml', href: "/dashboard/water" },
                        { icon: Footprints, label: "Steps", current: stepsCurrent, goal: stepsGoal, unit: "", progress: stepsProgress, displayValue: stepsCurrent.toLocaleString(), displayUnit: '', href: "/dashboard/steps" },
                        { icon: Flame, label: "Calories", current: caloriesCurrent, goal: caloriesGoal, unit: "", progress: caloriesProgress, displayValue: caloriesCurrent.toLocaleString(), displayUnit: '', href: "/dashboard/meals" },
                        {
                            icon: Dumbbell,
                            label: "Workouts",
                            current: workoutsCurrent,
                            goal: workoutsGoal,
                            unit: "min",
                            progress: workoutsProgress,
                            displayValue: hours > 0 ? `${hours}h ${minutes}m` : `${workoutsCurrent}`,
                            displayUnit: hours > 0 ? '' : 'min',
                            href: "/dashboard/workouts"
                        },
                    ].map((stat, index) => {
                        // Mapping simplified logic back to render
                        const isWorkout = stat.label === "Workouts";
                        const color = stat.label === "Water" ? "hsl(var(--stat-water))" :
                            stat.label === "Steps" ? "hsl(var(--stat-steps))" :
                                stat.label === "Calories" ? "hsl(var(--stat-calories))" : "hsl(var(--primary))";
                        const bgColor = stat.label === "Water" ? "bg-water/10" :
                            stat.label === "Steps" ? "bg-steps/10" :
                                stat.label === "Calories" ? "bg-calories/10" : "bg-primary/10";
                        const textColor = stat.label === "Water" ? "text-water" :
                            stat.label === "Steps" ? "text-steps" :
                                stat.label === "Calories" ? "text-calories" : "text-primary";

                        // Actual progress calc correction for mapping
                        const progress = stat.label === "Water" ? waterProgress : stat.progress;

                        return (
                            <Link key={index} href={stat.href}>
                                <div className="stat-card inner-glow p-6 cursor-pointer hover:bg-muted/10 transition-colors group relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bgColor} opacity-20 group-hover:scale-150 transition-transform duration-500 blur-2xl`} />

                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                                <stat.icon className={`w-6 h-6 ${textColor}`} />
                                            </div>
                                            <span className="font-semibold text-lg">{stat.label}</span>
                                        </div>
                                        <span className={`text-lg font-bold ${textColor}`}>
                                            {stat.goal > 0 ? `${progress.toFixed(0)}%` : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <ProgressRing progress={progress} color={color} size={80} strokeWidth={6} className="transition-all duration-500">
                                            <span className={`text-sm font-bold ${textColor}`}>{progress.toFixed(0)}%</span>
                                        </ProgressRing>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold tracking-tight">
                                                {stat.displayValue}
                                                {stat.displayUnit && <span className="text-sm text-muted-foreground ml-1 font-medium">{stat.displayUnit}</span>}
                                            </div>
                                            {stat.goal > 0 &&
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    / {stat.goal.toLocaleString()} {stat.label === "Workouts" && hours > 0 ? "min" : ""}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>
        </>
    );
};
