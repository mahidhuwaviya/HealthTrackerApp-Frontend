import {
    HeartPulse,
    Activity,
    Scale,
    Utensils,
    Dumbbell,
    Zap,
    ChevronRight,
    Edit,
    Droplets,
    Footprints
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardDTO } from "@/api/dashboard";
import { Goal, ActivityLevel } from "@/api/profile";

interface HealthViewProps {
    onUpdateProfile: () => void;
    data?: DashboardDTO;
}

export const HealthView = ({ onUpdateProfile, data }: HealthViewProps) => {
    const profile = data?.profile;

    // Body measurements
    const weightKg = profile?.currentWeightKg || profile?.weight || 0;
    const heightCm = profile?.currentHeightCm || profile?.height || 0;
    const age = profile?.age || 0;
    const gender = profile?.gender
        ? (profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase())
        : "N/A";

    // BMI Calculation (always from kg/cm for accuracy)
    const heightM = heightCm / 100;
    const bmiVal = (heightM > 0 && weightKg > 0) ? (weightKg / (heightM * heightM)) : 0;
    const bmi = bmiVal.toFixed(1);

    // Vitals from profile
    const heartRate = profile?.heartRate || 0;

    // Goals from profile
    const targetWeightKg = profile?.targetWeightKg || 0;
    const dailyCalorieTarget = profile?.targetDailyCalorie || profile?.dailyCalorieTarget || 0;
    const dailyWaterGoalMl = profile?.dailyWaterGoalMl || 0;
    const targetDailyWalk = (profile as any)?.targetDailyWalk || 0;
    const dailyWorkoutMins = profile?.dailyGoalWorkoutTarget || 0;
    const weeklyWorkoutMins = profile?.weeklyGoalWorkoutTarget || (dailyWorkoutMins * 7) || 0;

    // Workout environment — format EnumValue → "Enum Value"
    const workoutEnvLabel = profile?.workoutEnv && profile.workoutEnv.length > 0
        ? profile.workoutEnv.map(e => e.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase())).join(", ")
        : "Not set";

    // Activity level
    const activityMap: Record<string, string> = {
        [ActivityLevel.SEDENTARY]: "Sedentary",
        [ActivityLevel.LIGHTLY_ACTIVE]: "Lightly Active",
        [ActivityLevel.MODERATELY_ACTIVE]: "Moderately Active",
        [ActivityLevel.VERY_ACTIVE]: "Very Active"
    };
    const activityLabel = profile?.activityLevel ? activityMap[profile.activityLevel] : "N/A";

    // Dietary preferences
    const dietLabel = profile?.dietary && profile.dietary.length > 0
        ? profile.dietary.map(d => d.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase())).join(", ")
        : "No Preference";

    // Health conditions
    const conditionsLabel = profile?.conditions && profile.conditions.length > 0
        ? profile.conditions
            .filter(c => c !== "NONE")
            .map(c => c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()))
            .join(", ") || "None"
        : "None";

    // Main goal
    const goalMap: Record<string, string> = {
        [Goal.WEIGHT_LOSS]: "Weight Loss",
        [Goal.MUSCLE_GAIN]: "Muscle Gain",
        [Goal.MAINTENANCE]: "Maintenance",
        [Goal.ATHLETIC_PERFORMANCE]: "Athletic Performance"
    };
    const mainGoal = profile?.mainGoal || (profile as any)?.goal;
    const mainGoalLabel = mainGoal ? goalMap[mainGoal] : "General Health";

    // BMI Category
    const getBMICategory = (bmi: number) => {
        if (bmi === 0) return { label: "N/A", color: "text-gray-400" };
        if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
        if (bmi < 25) return { label: "Healthy Weight", color: "text-green-500" };
        if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
        return { label: "Obese", color: "text-red-500" };
    };
    const bmiCategory = getBMICategory(parseFloat(bmi));

    const StatCard = ({ icon: Icon, title, value, subtext, colorClass }: any) => (
        <div className="p-4 rounded-xl bg-background/50 border border-primary/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <h4 className="text-2xl font-bold">{value}</h4>
                {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 glass-card inner-glow">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-heart">
                        <HeartPulse className="w-6 h-6" /> Health Overview
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Your comprehensive health profile and vital statistics.
                    </p>
                </div>
                <Button onClick={onUpdateProfile} className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                    <Edit className="w-4 h-4 mr-2" /> Update Details
                </Button>
            </div>

            {/* BMI & Vitals */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* BMI Card */}
                <div className="md:col-span-1 p-6 glass-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-primary" /> Body Mass Index
                    </h3>
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full border-8 border-secondary flex items-center justify-center relative">
                                <div className="text-center">
                                    <span className="text-4xl font-bold block">{bmi}</span>
                                    <span className="text-xs text-muted-foreground">kg/m²</span>
                                </div>
                            </div>
                            <svg className="absolute inset-0 rotate-[-90deg]" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8"
                                    className="text-primary opacity-20" />
                                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8"
                                    className={cn("transition-all duration-1000", bmiCategory.color)}
                                    strokeDasharray="289"
                                    strokeDashoffset={289 - (289 * (Math.min(parseFloat(bmi), 40) / 40))}
                                />
                            </svg>
                        </div>
                        <div className={cn("px-3 py-1 rounded-full text-sm font-medium bg-secondary", bmiCategory.color)}>
                            {bmiCategory.label}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 w-full text-center">
                            <div className="p-2 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground">Weight</p>
                                <p className="font-bold">{weightKg > 0 ? `${weightKg} kg` : "—"}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground">Height</p>
                                <p className="font-bold">{heightCm > 0 ? `${heightCm} cm` : "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vitals */}
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                    <StatCard
                        icon={Activity}
                        title="Resting Heart Rate"
                        value={heartRate > 0 ? `${heartRate} bpm` : "N/A"}
                        subtext="Healthy Range: 60–100 bpm"
                        colorClass="bg-red-500/10 text-red-500"
                    />
                    <StatCard
                        icon={Scale}
                        title="Weight Trend"
                        value={weightKg > 0 ? `${weightKg} kg` : "N/A"}
                        subtext={targetWeightKg > 0 ? `Target: ${targetWeightKg} kg` : "No target set"}
                        colorClass="bg-blue-500/10 text-blue-500"
                    />
                    <StatCard
                        icon={Zap}
                        title="Age & Gender"
                        value={age > 0 ? `${age} yrs` : "N/A"}
                        subtext={gender !== "N/A" ? gender : undefined}
                        colorClass="bg-yellow-500/10 text-yellow-500"
                    />
                    <StatCard
                        icon={HeartPulse}
                        title="Health Conditions"
                        value={conditionsLabel}
                        subtext={conditionsLabel === "None" ? "No known conditions" : undefined}
                        colorClass="bg-pink-500/10 text-pink-500"
                    />
                </div>
            </div>

            {/* Lifestyle & Goals */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Lifestyle */}
                <div className="p-6 glass-card">
                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Lifestyle Profile
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: "Activity Level", value: activityLabel, icon: Dumbbell },
                            { label: "Dietary Preference", value: dietLabel, icon: Utensils },
                            { label: "Workout Environment", value: workoutEnvLabel, icon: Zap },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <span className="text-sm text-primary capitalize">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goals */}
                <div className="p-6 glass-card bg-gradient-to-br from-primary/5 to-transparent">
                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-primary" /> Current Goals
                    </h3>
                    <div className="space-y-4">
                        {/* Main Goal */}
                        <div className="p-3 rounded-lg bg-background/60 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Main Objective</span>
                            <span className="text-sm font-bold text-primary">{mainGoalLabel}</span>
                        </div>

                        {/* Goal grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-background/60">
                                <p className="text-xs text-muted-foreground">Target Weight</p>
                                <p className="text-xl font-bold">
                                    {targetWeightKg > 0 ? targetWeightKg : "—"}
                                    <span className="text-xs font-normal text-muted-foreground"> kg</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/60">
                                <p className="text-xs text-muted-foreground">Daily Calories</p>
                                <p className="text-xl font-bold">
                                    {dailyCalorieTarget > 0 ? dailyCalorieTarget.toLocaleString() : "—"}
                                    <span className="text-xs font-normal text-muted-foreground"> kcal</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/60">
                                <Droplets className="w-3.5 h-3.5 text-blue-400 mb-1" />
                                <p className="text-xs text-muted-foreground">Water Goal</p>
                                <p className="text-xl font-bold">
                                    {dailyWaterGoalMl > 0 ? dailyWaterGoalMl.toLocaleString() : "—"}
                                    <span className="text-xs font-normal text-muted-foreground"> ml</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/60">
                                <Footprints className="w-3.5 h-3.5 text-green-400 mb-1" />
                                <p className="text-xs text-muted-foreground">Daily Steps</p>
                                <p className="text-xl font-bold">
                                    {targetDailyWalk > 0 ? targetDailyWalk.toLocaleString() : "—"}
                                    <span className="text-xs font-normal text-muted-foreground"> steps</span>
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/60 col-span-2">
                                <p className="text-xs text-muted-foreground">Workout Target</p>
                                <p className="text-xl font-bold">
                                    {dailyWorkoutMins > 0 ? `${dailyWorkoutMins} min/day` : weeklyWorkoutMins > 0 ? `${weeklyWorkoutMins} min/wk` : "—"}
                                </p>
                            </div>
                        </div>

                        <Button onClick={onUpdateProfile} variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                            Adjust Goals <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
