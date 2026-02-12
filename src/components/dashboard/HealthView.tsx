import {
    HeartPulse,
    Activity,
    Scale,
    Utensils,
    Dumbbell,
    Zap,
    ChevronRight,
    Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardDTO } from "@/api/dashboard";
import { Goal, ActivityLevel, DietaryPreference } from "@/api/profile";

interface HealthViewProps {
    onUpdateProfile: () => void;
    data?: DashboardDTO;
}

export const HealthView = ({ onUpdateProfile, data }: HealthViewProps) => {
    const profile = data?.profile;

    // Derived Health Data
    const weight = profile?.weight || 0;
    const height = profile?.height || 0;
    const age = profile?.age || 0;
    const gender = profile?.gender ? (profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()) : "N/A";

    // BMI Calculation
    const heightInMeters = height / 100;
    const bmiVal = (height > 0 && weight > 0) ? (weight / (heightInMeters * heightInMeters)) : 0;
    const bmi = bmiVal.toFixed(1);

    // Vitals 
    const heartRate = profile?.heartRate || 72; // Default if not set
    const bloodPressure = "120/80"; // Mock
    const bodyFat = "15%"; // Mock

    // Lifestyle
    const activityMap: Record<string, string> = {
        [ActivityLevel.SEDENTARY]: "Sedentary",
        [ActivityLevel.LIGHTLY_ACTIVE]: "Lightly Active",
        [ActivityLevel.MODERATELY_ACTIVE]: "Moderately Active",
        [ActivityLevel.VERY_ACTIVE]: "Very Active"
    };
    const activityLabel = profile?.activityLevel ? activityMap[profile.activityLevel] : "N/A";

    const dietLabel = profile?.dietary && profile.dietary.length > 0
        ? profile.dietary.map(d => d.replace('_', ' ').toLowerCase()).join(", ")
        : "No Preference";

    // Goals
    const goalMap: Record<string, string> = {
        [Goal.WEIGHT_LOSS]: "Weight Loss",
        [Goal.MUSCLE_GAIN]: "Muscle Gain",
        [Goal.MAINTENANCE]: "Maintenance",
        [Goal.ATHLETIC_PERFORMANCE]: "Athletic Performance"
    };
    const mainGoal = profile?.mainGoal ? goalMap[profile.mainGoal] : "General Health";
    const targetWeight = profile?.targetWeightKg || 0;

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
            {/* Header Section */}
            Hardcoded
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

            {/* BMI & Key Metrics */}
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
                    </div>
                </div>

                {/* Vitals Grid */}
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                    <StatCard
                        icon={Activity}
                        title="Resting Heart Rate"
                        value={`${heartRate} bpm`}
                        subtext="Healthy Range: 60-100 bpm"
                        colorClass="bg-red-500/10 text-red-500"
                    />
                    <StatCard
                        icon={HeartPulse}
                        title="Blood Pressure"
                        value={bloodPressure}
                        subtext="Last check: 2 days ago"
                        colorClass="bg-pink-500/10 text-pink-500"
                    />
                    <StatCard
                        icon={Zap}
                        title="Body Fat %"
                        value={bodyFat}
                        subtext="Athletic Range"
                        colorClass="bg-yellow-500/10 text-yellow-500"
                    />
                    <StatCard
                        icon={Scale}
                        title="Weight Trend"
                        value={`${weight} kg`}
                        subtext={`Target: ${targetWeight} kg`}
                        colorClass="bg-blue-500/10 text-blue-500"
                    />
                </div>
            </div>

            {/* Lifestyle & Goals Section */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Lifestyle Details */}
                <div className="p-6 glass-card">
                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Lifestyle Profile
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Activity Level", value: activityLabel, icon: Dumbbell },
                            { label: "Dietary Preference", value: dietLabel, icon: Utensils },
                            { label: "Workout Environment", value: "Commercial Gym", icon: Zap }, // Mock
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

                {/* Goals Summary */}
                <div className="p-6 glass-card bg-gradient-to-br from-primary/5 to-transparent">
                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-primary" /> Current Goals
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Main Objective</span>
                                <span className="font-bold text-primary">{mainGoal}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-3/4 rounded-full" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-right">75% on track</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-background/60">
                                <p className="text-xs text-muted-foreground">Target Weight</p>
                                <p className="text-xl font-bold">{targetWeight} <span className="text-xs font-normal text-muted-foreground">kg</span></p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/60">
                                <p className="text-xs text-muted-foreground">Weekly Workouts</p>
                                <p className="text-xl font-bold">4 <span className="text-xs font-normal text-muted-foreground">sessions</span></p>
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
