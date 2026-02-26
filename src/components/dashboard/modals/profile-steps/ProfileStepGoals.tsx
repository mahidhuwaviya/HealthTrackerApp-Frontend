import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Goal, HealthCondition } from "@/api/profile";
import { ENUM_LABELS } from "@/config/health-constants";
import { MemoScale as Scale, MemoDumbbell as Dumbbell, MemoActivity as Activity, MemoHeart as Heart, MemoCheck as Check } from "@/components/ui/MemoizedIcons";

interface ProfileStepGoalsProps {
    data: any;
    updateData: (key: string, value: any) => void;
    toggleArrayItem: (key: any, item: string) => void;
    weightUnit: 'kg' | 'lbs';
    isEditing: boolean;
}

const GOAL_OPTIONS = [
    { value: Goal.WEIGHT_LOSS, label: ENUM_LABELS.GOALS.WEIGHT_LOSS, icon: Scale },
    { value: Goal.MUSCLE_GAIN, label: ENUM_LABELS.GOALS.MUSCLE_GAIN, icon: Dumbbell },
    { value: Goal.MAINTENANCE, label: ENUM_LABELS.GOALS.MAINTENANCE, icon: Activity },
    { value: Goal.ATHLETIC_PERFORMANCE, label: ENUM_LABELS.GOALS.ATHLETIC_PERFORMANCE, icon: Heart },
];

export const ProfileStepGoals = ({
    data,
    updateData,
    toggleArrayItem,
    weightUnit,
    isEditing
}: ProfileStepGoalsProps) => {
    const disabledClass = !isEditing ? "opacity-70 pointer-events-none" : "";

    return (
        <div className={cn("space-y-6 animate-fade-in", disabledClass)}>
            <div className="space-y-3">
                <Label className="text-lg font-semibold">What is your main goal?</Label>
                <div className="grid grid-cols-2 gap-4">
                    {GOAL_OPTIONS.map((goal) => (
                        <div
                            key={goal.value}
                            onClick={() => updateData("mainGoal", goal.value)}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden group",
                                data.mainGoal === goal.value
                                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(212,197,85,0.15)]"
                                    : "bg-secondary/30 border-transparent hover:border-primary/30"
                            )}
                        >
                            <goal.icon className={cn("w-8 h-8 mb-3 transition-transform duration-500 group-hover:scale-110", data.mainGoal === goal.value ? "text-primary" : "text-muted-foreground")} />
                            <p className={cn("font-bold text-center transition-colors", data.mainGoal === goal.value ? "text-primary" : "text-foreground")}>{goal.label}</p>
                            {data.mainGoal === goal.value && <div className="absolute top-2 right-2 p-1 bg-primary rounded-full"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Pre-existing Conditions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(ENUM_LABELS.HEALTH_CONDITIONS) as HealthCondition[]).map((cond) => (
                        <div
                            key={cond}
                            onClick={() => toggleArrayItem("conditions", cond)}
                            className={cn(
                                "px-3 py-3 rounded-xl text-xs font-bold border cursor-pointer text-center transition-all",
                                data.conditions.includes(cond)
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                            )}
                        >
                            {/* @ts-ignore */}
                            {ENUM_LABELS.HEALTH_CONDITIONS[cond]}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="targetWeight">Target Weight</Label>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Default: Current</span>
                    </div>
                    <Input
                        id="targetWeight"
                        type="number"
                        placeholder={weightUnit === 'kg' ? "e.g. 70" : "e.g. 154"}
                        className="h-12 bg-secondary/50 focus:border-primary/50"
                        value={data.targetWeight}
                        onChange={(e) => updateData("targetWeight", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dailyGoalWorkoutTarget">Daily Exercise (Mins)</Label>
                    <Input
                        id="dailyGoalWorkoutTarget"
                        type="number"
                        min="1"
                        placeholder="e.g. 45"
                        className="h-12 bg-secondary/50 focus:border-primary/50"
                        value={data.dailyGoalWorkoutTarget}
                        onChange={(e) => updateData("dailyGoalWorkoutTarget", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="dailyCalorieTarget">Daily Calorie Target (kcal)</Label>
                <Input
                    id="dailyCalorieTarget"
                    type="number"
                    placeholder="e.g. 2000"
                    className="h-12 bg-secondary/50 border-primary/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                    value={data.dailyCalorieTarget}
                    onChange={(e) => updateData("dailyCalorieTarget", e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    * By default, we calculate this based on your BMR, activity level, and targets. You can manually adjust it here.
                </p>
            </div>
        </div>
    );
};
