import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ActivityLevel, Gender } from "@/api/profile";
import { ENUM_LABELS } from "@/config/health-constants";
import { MemoCheck as Check } from "@/components/ui/MemoizedIcons";

interface ProfileStepFoundationProps {
    data: any;
    updateData: (key: string, value: any) => void;
    weightUnit: 'kg' | 'lbs';
    setWeightUnit: (unit: 'kg' | 'lbs') => void;
    heightUnit: 'cm' | 'ft';
    setHeightUnit: (unit: 'cm' | 'ft') => void;
    isEditing: boolean;
}

const ACTIVITY_OPTIONS = [
    { value: ActivityLevel.SEDENTARY, ...ENUM_LABELS.ACTIVITY_LEVELS.SEDENTARY },
    { value: ActivityLevel.LIGHTLY_ACTIVE, ...ENUM_LABELS.ACTIVITY_LEVELS.LIGHTLY_ACTIVE },
    { value: ActivityLevel.MODERATELY_ACTIVE, ...ENUM_LABELS.ACTIVITY_LEVELS.MODERATELY_ACTIVE },
    { value: ActivityLevel.VERY_ACTIVE, ...ENUM_LABELS.ACTIVITY_LEVELS.VERY_ACTIVE }
];

export const ProfileStepFoundation = ({
    data,
    updateData,
    weightUnit,
    setWeightUnit,
    heightUnit,
    setHeightUnit,
    isEditing
}: ProfileStepFoundationProps) => {
    const disabledClass = !isEditing ? "opacity-70 pointer-events-none" : "";

    return (
        <div className={cn("space-y-6 animate-fade-in", disabledClass)}>
            <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                    id="age"
                    type="number"
                    placeholder="e.g. 25"
                    className="h-12 bg-secondary/50 focus:border-primary/50 transition-all"
                    value={data.age}
                    onChange={(e) => updateData("age", e.target.value)}
                />
            </div>

            {/* GENDER */}
            <div className="space-y-3">
                <Label>Gender</Label>
                <div className="flex gap-4">
                    {["MALE", "FEMALE", "OTHER"].map((g) => (
                        <div
                            key={g}
                            onClick={() => updateData("gender", g)}
                            className={cn(
                                "px-4 py-2 rounded-lg border cursor-pointer capitalize transition-all",
                                data.gender === g
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                            )}
                        >
                            {g.toLowerCase()}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* WEIGHT */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="weight">Weight</Label>
                        <div className="flex bg-secondary/50 rounded-lg p-1">
                            <button onClick={() => setWeightUnit('kg')} className={cn("px-2 py-0.5 text-xs rounded-md transition-all", weightUnit === 'kg' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground")}>kg</button>
                            <button onClick={() => setWeightUnit('lbs')} className={cn("px-2 py-0.5 text-xs rounded-md transition-all", weightUnit === 'lbs' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground")}>lbs</button>
                        </div>
                    </div>
                    <Input
                        id="weight"
                        type="number"
                        placeholder={weightUnit === 'kg' ? "e.g. 75" : "e.g. 165"}
                        className="h-12 bg-secondary/50 focus:border-primary/50"
                        value={data.weight}
                        onChange={(e) => updateData("weight", e.target.value)}
                    />
                </div>

                {/* HEIGHT */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="height">Height</Label>
                        <div className="flex bg-secondary/50 rounded-lg p-1">
                            <button onClick={() => setHeightUnit('cm')} className={cn("px-2 py-0.5 text-xs rounded-md transition-all", heightUnit === 'cm' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground")}>cm</button>
                            <button onClick={() => setHeightUnit('ft')} className={cn("px-2 py-0.5 text-xs rounded-md transition-all", heightUnit === 'ft' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground")}>ft</button>
                        </div>
                    </div>
                    <Input
                        id="height"
                        type="number"
                        placeholder={heightUnit === 'cm' ? "e.g. 180" : "e.g. 5.9"}
                        className="h-12 bg-secondary/50 focus:border-primary/50"
                        value={data.height}
                        onChange={(e) => updateData("height", e.target.value)}
                    />
                </div>
            </div>

            {/* ACTIVITY LEVEL */}
            <div className="space-y-3">
                <Label>Activity Level</Label>
                <div className="space-y-3">
                    {ACTIVITY_OPTIONS.map((level) => (
                        <div
                            key={level.value}
                            onClick={() => updateData("activityLevel", level.value)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300",
                                data.activityLevel === level.value
                                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,197,85,0.1)]"
                                    : "bg-secondary/30 border-transparent hover:border-primary/30"
                            )}
                        >
                            <div>
                                <p className={cn("font-medium transition-colors", data.activityLevel === level.value ? "text-primary text-lg" : "text-foreground")}>{level.label}</p>
                                <p className="text-sm text-muted-foreground">{level.desc}</p>
                            </div>
                            {data.activityLevel === level.value && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in"><Check className="w-4 h-4 text-primary-foreground" /></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* HEART RATE */}
            <div className="space-y-2">
                <Label htmlFor="heartRate">Resting Heart Rate (bpm) <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input
                    id="heartRate"
                    type="number"
                    placeholder="e.g. 70"
                    className="h-12 bg-secondary/50 focus:border-primary/50"
                    value={data.heartRate}
                    onChange={(e) => updateData("heartRate", e.target.value)}
                />
            </div>
        </div>
    );
};
