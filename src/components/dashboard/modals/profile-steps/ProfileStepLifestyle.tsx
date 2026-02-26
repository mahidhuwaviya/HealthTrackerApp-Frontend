import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DietaryPreference, ExerciseType } from "@/api/profile";
import { ENUM_LABELS } from "@/config/health-constants";
import { MemoCheck as Check, MemoInfo as Info } from "@/components/ui/MemoizedIcons";

interface ProfileStepLifestyleProps {
    data: any;
    toggleArrayItem: (key: any, item: string) => void;
    isEditing: boolean;
}

export const ProfileStepLifestyle = ({
    data,
    toggleArrayItem,
    isEditing
}: ProfileStepLifestyleProps) => {
    const disabledClass = !isEditing ? "opacity-70 pointer-events-none" : "";

    return (
        <div className={cn("space-y-8 animate-fade-in", disabledClass)}>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Label className="text-lg font-semibold">Dietary Preferences</Label>
                    <div className="group relative">
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-secondary text-[10px] text-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
                            Selecting these helps us suggest better meals aligned with your lifestyle.
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {(Object.keys(ENUM_LABELS.DIETARY_PREFERENCES) as DietaryPreference[]).map((diet) => (
                        <div
                            key={diet}
                            onClick={() => toggleArrayItem("dietary", diet)}
                            className={cn(
                                "px-5 py-2.5 rounded-full border cursor-pointer transition-all duration-300 flex items-center gap-2",
                                data.dietary.includes(diet)
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                    : "bg-secondary/30 border-primary/10 text-muted-foreground hover:bg-secondary/50 hover:border-primary/30"
                            )}
                        >
                            {/* @ts-ignore */}
                            <span className="font-medium">{ENUM_LABELS.DIETARY_PREFERENCES[diet]}</span>
                            {data.dietary.includes(diet) && <Check className="w-3 h-3" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Label className="text-lg font-semibold">Workout Environment</Label>
                <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(ENUM_LABELS.WORKOUT_ENVIRONMENTS) as ExerciseType[]).map((env) => (
                        <div
                            key={env}
                            onClick={() => toggleArrayItem("workoutEnv", env)}
                            className={cn(
                                "group p-5 rounded-2xl border cursor-pointer text-center transition-all duration-300 relative",
                                data.workoutEnv.includes(env)
                                    ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(212,197,85,0.1)]"
                                    : "bg-secondary/30 border-transparent hover:border-primary/30"
                            )}
                        >
                            {/* @ts-ignore */}
                            <p className={cn("font-bold transition-colors", data.workoutEnv.includes(env) ? "text-primary" : "text-muted-foreground")}>{ENUM_LABELS.WORKOUT_ENVIRONMENTS[env]}</p>
                            {data.workoutEnv.includes(env) && <div className="absolute -top-1 -right-1 p-1 bg-primary rounded-full animate-in zoom-in"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-primary">Pro Tip</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        You can update these preferences anytime from your profile settings as your lifestyle evolves.
                    </p>
                </div>
            </div>
        </div>
    );
};
