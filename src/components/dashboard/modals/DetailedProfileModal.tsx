import { useState, useEffect } from "react";
import {
    Check,
    ChevronRight,
    ChevronLeft,
    Activity,
    Utensils,
    Dumbbell,
    Heart,
    Scale,
    Zap,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    profileApi,
    UserProfileData,
    Goal,
    ActivityLevel,
    HealthCondition,
    DietaryPreference,
    ExerciseType,
    Gender
} from "@/api/profile";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

interface DetailedProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 1 | 2 | 3;

// State Interface - Matches keys of UserProfileData but keeps them friendly for binding
interface ProfileData {
    age: string;
    weight: string;
    height: string;
    activityLevel: ActivityLevel | "";
    mainGoal: Goal | "";
    conditions: HealthCondition[];
    heartRate: string;
    dietary: DietaryPreference[];
    workoutEnv: ExerciseType[];
    targetWeight: string;
    gender: string;
    dailyCalorieTarget: string;
    dailyGoalWorkoutTarget: string; // Updated Field
}

// ------ ENUM MAPPINGS (Display Labels) ------

const CONDITION_LABELS: Record<HealthCondition, string> = {
    [HealthCondition.NONE]: "None",
    [HealthCondition.DIABETES]: "Diabetes",
    [HealthCondition.HYPERTENSION]: "Hypertension",
    [HealthCondition.ASTHMA]: "Asthma",
    [HealthCondition.HEART_DISEASE]: "Heart Disease",
    [HealthCondition.KIDNEY_DISEASE]: "Kidney Disease",
    [HealthCondition.ARTHRITIS]: "Arthritis",
    [HealthCondition.PREGNANCY]: "Pregnancy",
    [HealthCondition.OTHER]: "Other"
};

const DIETARY_LABELS: Record<DietaryPreference, string> = {
    [DietaryPreference.NO_PREFERENCE]: "Classic",
    [DietaryPreference.VEGETARIAN]: "Vegetarian",
    [DietaryPreference.VEGAN]: "Vegan",
    [DietaryPreference.KETO]: "Keto",
    [DietaryPreference.PALEO]: "Paleo",
    [DietaryPreference.GLUTEN_FREE]: "Gluten-Free",
    [DietaryPreference.PESCATARIAN]: "Pescatarian"
};

const WORKOUT_LABELS: Record<ExerciseType, string> = {
    [ExerciseType.GYM]: "Commercial Gym",
    [ExerciseType.HOME]: "Home (No Equipment)",
    [ExerciseType.HOME_GYM]: "Home (Dumbbells)",
    [ExerciseType.OUTDOOR]: "Outdoor / Park",
    [ExerciseType.PILATES]: "Pilates" // Handling all enum cases just in case
};

const GOAL_OPTIONS = [
    { value: Goal.WEIGHT_LOSS, label: "Weight Loss", icon: Scale },
    { value: Goal.MUSCLE_GAIN, label: "Muscle Gain", icon: Dumbbell },
    { value: Goal.MAINTENANCE, label: "Maintenance", icon: Activity },
    { value: Goal.ATHLETIC_PERFORMANCE, label: "Athletic Performance", icon: Heart }, // Updated to match enum better, or map "general_health" if needed. backend has ATHLETIC_PERFORMANCE.
];

const ACTIVITY_OPTIONS = [
    { value: ActivityLevel.SEDENTARY, label: "Sedentary", desc: "Little to no exercise" },
    { value: ActivityLevel.LIGHTLY_ACTIVE, label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
    { value: ActivityLevel.MODERATELY_ACTIVE, label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
    { value: ActivityLevel.VERY_ACTIVE, label: "Very Active", desc: "Hard exercise 6-7 days/week" }
];


const DetailedProfileModal = ({ isOpen, onClose }: DetailedProfileModalProps) => {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<Step>(1);

    // Units
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

    // Form Data
    const [data, setData] = useState<ProfileData>({
        age: "",
        weight: "",
        height: "",
        activityLevel: "",
        mainGoal: "",
        conditions: [],
        heartRate: "",
        dietary: [],
        workoutEnv: [],
        targetWeight: "",
        gender: "MALE",
        dailyCalorieTarget: "",
        dailyGoalWorkoutTarget: ""
    });

    // UI States
    const [isEditing, setIsEditing] = useState(true);
    const [isNewUser, setIsNewUser] = useState(true);

    // --- QUERY: Fetch Profile ---
    const { data: profileData, isLoading, isError, error } = useQuery({
        queryKey: ['user-profile'], // Standardized key
        queryFn: profileApi.getProfile,
        enabled: isOpen, // Only fetch when modal opens
        retry: false, // Don't retry on 401/404, fail fast to let user create
        refetchOnWindowFocus: false
    });

    // --- MUTATION: Save/Update ---
    const saveMutation = useMutation({
        mutationFn: async (payload: UserProfileData) => {
            if (isNewUser) {
                return await profileApi.createProfile(payload);
            } else {
                return await profileApi.updateProfile(payload);
            }
        },
        onSuccess: () => {
            toast.success(isNewUser ? "Profile created successfully!" : "Profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['user-profile'] }); // Standardized key
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }); // To update goals/targets instantly
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });

            setIsEditing(false);
            if (isNewUser) {
                setIsNewUser(false);
            } else {
                onClose();
            }
        },
        onError: (err: any) => {
            console.error("Failed to save profile", err);
            // Check for 500 explicitly if needed, but axios interceptor might catch it globally
            if (err.response?.status >= 500) {
                toast.error("Server error. Please try again later.");
            } else {
                toast.error("Failed to save profile. Please check your inputs.");
            }
        }
    });

    // --- EFFECT: Sync Query Data to State ---
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            return;
        }

        if (profileData) {
            // Condition A: Existing User
            setIsNewUser(false);
            setIsEditing(false);

            // Helper to safe parse
            const p = profileData;

            // 1. Determine Units First
            const hUnit = (p.heightUnit as 'cm' | 'ft') || 'cm';
            const wUnit = (p.weightUnit as 'kg' | 'lbs') || 'kg';

            // 2. Parse Raw Backend Values
            const rawH_Cm = p.currentHeightCm || p.height || 0;
            const rawW_Kg = p.currentWeightKg || p.weight || 0;

            // 3. Convert to Display Units
            let displayH = "";
            let displayW = "";

            if (hUnit === 'ft' && rawH_Cm) {
                displayH = (rawH_Cm / 30.48).toFixed(1);
            } else if (rawH_Cm) {
                displayH = rawH_Cm.toString();
            }

            if (wUnit === 'lbs' && rawW_Kg) {
                displayW = (rawW_Kg / 0.453592).toFixed(1);
            } else if (rawW_Kg) {
                displayW = rawW_Kg.toString();
            }

            const ageVal = p.age?.toString() || "";
            const genderVal = p.gender || "MALE";
            const activityVal = p.activityLevel || "";

            // Calculate default calories if missing
            let defaultCalories = "";
            const backendCalories = p.dailyCalorieTarget || p.targetDailyCalorie;

            if (backendCalories) {
                defaultCalories = backendCalories.toString();
            } else if (displayH && displayW && ageVal && activityVal) {
                // BMR Calculation logic duplicated for initialization
                // Use KG/CM internally for BMR
                const w = rawW_Kg || parseFloat(displayW);
                const h = rawH_Cm || parseFloat(displayH);
                const a = parseInt(ageVal);
                let bmr = (10 * w) + (6.25 * h) - (5 * a) + (genderVal === "MALE" ? 5 : -161);

                let mult = 1.2;
                if (activityVal === ActivityLevel.LIGHTLY_ACTIVE) mult = 1.375;
                if (activityVal === ActivityLevel.MODERATELY_ACTIVE) mult = 1.55;
                if (activityVal === ActivityLevel.VERY_ACTIVE) mult = 1.725;

                defaultCalories = Math.round(bmr * mult).toString();
            }

            // Target Weight: Use backend value or current weight
            let targetW = "";
            if (p.targetWeightKg) {
                // Convert stored KG to display unit if needed
                if (wUnit === 'lbs') {
                    targetW = (p.targetWeightKg / 0.453592).toFixed(1);
                } else {
                    targetW = p.targetWeightKg.toString();
                }
            } else {
                targetW = displayW; // Default to current weight if target is missing
            }

            // Populate Form - Checking both Frontend and Backend keys
            setData({
                age: ageVal,
                weight: displayW,
                height: displayH,
                activityLevel: activityVal,
                mainGoal: p.mainGoal || p.goal || "",
                conditions: p.conditions || p.healthConditions || [],
                heartRate: p.heartRate?.toString() || "",
                dietary: p.dietary || p.dietaryPreferences || [],
                workoutEnv: p.workoutEnv || p.exerciseTypes || [],
                targetWeight: targetW,
                gender: genderVal,
                dailyCalorieTarget: defaultCalories,
                dailyGoalWorkoutTarget: p.dailyGoalWorkoutTarget?.toString() || (p.weeklyGoalWorkoutTarget ? Math.round(p.weeklyGoalWorkoutTarget / 7).toString() : "30")
            });

            setWeightUnit(wUnit);
            setHeightUnit(hUnit);

        } else if (isError || !profileData) {
            // Condition B: New User (or failed fetch treated as new for now, unless 500)
            if (!isLoading) { // Don't reset while loading
                setIsNewUser(true);
                setIsEditing(true);
                // Keep defaults
            }
        }
    }, [isOpen, profileData, isError, isLoading]);


    useEffect(() => {
        // Calculate dynamically if we have data. 
        // User wants to see the goal. So if target weight is updated, we update calories.
        // We shouldn't overwrite if user manually set it?
        // But user said "calculate dynamically".
        // I'll overwrite IF the calculation yields a different result AND (it was empty OR it matches the previous auto-calc? Hard to track).
        // Safest approach for "dynamic": just update it. If they want manual, they type it, but if they change weight again, it resets.
        // That's acceptable behavior for "dynamic calculator".
        if (step === 2 && (data.targetWeight || data.weight) && data.height && data.age && data.activityLevel) {
            const calculated = calculateDefaultCalories();
            if (calculated && calculated !== data.dailyCalorieTarget) {
                setData(prev => ({ ...prev, dailyCalorieTarget: calculated }));
            }
        }
    }, [step, data.targetWeight, data.weight, data.height, data.age, data.gender, data.activityLevel]);


    if (!isOpen) return null;

    // --- Handlers ---

    const updateData = (key: keyof ProfileData, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    // Auto-calculate calories if weight/gender/age/activity/height changes and target is empty?
    // Or just provide a "Calculate" button?
    // User said "by default calculated".
    // I'll leave it as a manual input that defaults to empty for now, unless I want to be fancy.
    // "default val would be calculated by you".
    // Okay, I will calculate it when Step 2 opens if it's empty.

    const calculateDefaultCalories = () => {
        // Use targetWeight if available, else current weight
        const weightToUse = data.targetWeight || data.weight;

        if (!weightToUse || !data.height || !data.age || !data.gender || !data.activityLevel) return "";

        const w = parseFloat(weightToUse) * (weightUnit === 'lbs' ? 0.453592 : 1);
        const h = parseFloat(data.height) * (heightUnit === 'ft' ? 30.48 : 1);
        const a = parseInt(data.age);

        let bmr = 0;
        if (data.gender === "MALE") {
            bmr = 10 * w + 6.25 * h - 5 * a + 5;
        } else {
            // Female or Other
            bmr = 10 * w + 6.25 * h - 5 * a - 161;
        }

        let multiplier = 1.2;
        if (data.activityLevel === ActivityLevel.LIGHTLY_ACTIVE) multiplier = 1.375;
        if (data.activityLevel === ActivityLevel.MODERATELY_ACTIVE) multiplier = 1.55;
        if (data.activityLevel === ActivityLevel.VERY_ACTIVE) multiplier = 1.725;

        return Math.round(bmr * multiplier).toString();
    };

    const toggleArrayItem = (key: 'conditions' | 'dietary' | 'workoutEnv', item: string) => {
        setData(prev => {
            const current = prev[key] as string[];
            const exists = current.includes(item);
            return {
                ...prev,
                [key]: exists
                    ? current.filter(i => i !== item)
                    : [...current, item]
            };
        });
    };

    const handleNext = async () => {
        if (!isEditing) {
            // View Mode: Allow navigation freely
            if (step === 1) setStep(2);
            if (step === 2) setStep(3);
            return;
        }

        if (step === 1 && isStep1Valid) setStep(2);
        if (step === 2 && isStep2Valid) setStep(3);
        if (step === 3 && isStep3Valid) {
            // Final Submit

            // Unit Conversions AND Backend Mapping
            const rawWeight = parseFloat(data.weight);
            const rawHeight = parseFloat(data.height);
            // Height logic: if ft, convert to cm for storage
            const heightInCm = heightUnit === 'ft' ? rawHeight * 30.48 : rawHeight;
            // Weight logic: if lbs, convert to kg for storage
            const weightInKg = weightUnit === 'lbs' ? rawWeight * 0.453592 : rawWeight;

            // Target Weight Logic:
            const targetWeightVal = data.targetWeight ? parseFloat(data.targetWeight) : rawWeight;
            const targetWeightKg = weightUnit === 'lbs' ? targetWeightVal * 0.453592 : targetWeightVal;

            console.log("Submitting Profile Payload:", data);

            const payload: UserProfileData = {
                // 1. Inherit all existing fields (CRITICAL for updates)
                ...(profileData || {}),

                // 2. Explicitly ensure ID is present if it exists
                userProfileDataId: profileData?.userProfileDataId,

                // 3. Overwrite with New/Updated Values
                // Core Fields
                age: parseInt(data.age),
                gender: data.gender as Gender,
                activityLevel: data.activityLevel as ActivityLevel,
                heartRate: data.heartRate ? parseInt(data.heartRate) : undefined,

                // Height & Weight (Frontend + Backend keys)
                weight: rawWeight,
                currentWeightKg: weightInKg, // Explicit Backend Field
                weightUnit: weightUnit,

                height: rawHeight,
                currentHeightCm: heightInCm, // Explicit Backend Field
                heightUnit: heightUnit === 'ft' ? 'ft' : 'cm',

                targetWeightKg: targetWeightKg,

                // Goals (Frontend + Backend keys)
                mainGoal: data.mainGoal as Goal,
                goal: data.mainGoal as Goal, // Explicit Backend Field

                dailyCalorieTarget: data.dailyCalorieTarget ? parseInt(data.dailyCalorieTarget) : undefined,
                targetDailyCalorie: data.dailyCalorieTarget ? parseInt(data.dailyCalorieTarget) : undefined, // Explicit Backend Field

                // Unified Field Name
                dailyGoalWorkoutTarget: data.dailyGoalWorkoutTarget ? parseInt(data.dailyGoalWorkoutTarget) : 30,
                weeklyGoalWorkoutTarget: data.dailyGoalWorkoutTarget ? parseInt(data.dailyGoalWorkoutTarget) * 7 : 210,

                // Arrays (Frontend + Backend keys)
                conditions: data.conditions || [],
                healthConditions: data.conditions || [], // Explicit Backend Field

                dietary: data.dietary || [],
                dietaryPreferences: data.dietary || [], // Explicit Backend Field

                workoutEnv: data.workoutEnv || [],
                exerciseTypes: data.workoutEnv || [], // Explicit Backend Field
            };

            // 4. PascalCase Fallbacks (Based on user debug output suggestion: DailyGoalWorkoutTarget=...)
            // Just in case the backend JSON deserializer is case sensitive or uses these property names
            (payload as any).DailyGoalWorkoutTarget = payload.dailyGoalWorkoutTarget;
            (payload as any).Gender = payload.gender;
            (payload as any).Goal = payload.goal;

            console.log("%c FINAL PAYLOAD TO SEND:", "color: green; font-weight: bold;", payload);
            // alert("Debug: Sending " + JSON.stringify(payload, null, 2)); 

            saveMutation.mutate(payload);
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
    };

    // Validation
    const isStep1Valid = data.age.length > 0 && data.weight.length > 0 && data.height.length > 0 && data.activityLevel !== "";
    const isStep2Valid = data.mainGoal !== "" && data.dailyGoalWorkoutTarget !== "";
    const isStep3Valid = data.dietary.length > 0 && data.workoutEnv.length > 0;

    const disabledClass = !isEditing ? "opacity-70 pointer-events-none" : "";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

            <div className="relative w-[90%] md:w-full md:max-w-4xl h-auto max-h-[85vh] md:h-[600px] glass-card flex flex-col md:flex-row overflow-hidden shadow-2xl animate-scale-in">

                {/* --- LEFT SIDE --- */}
                <div className="w-1/3 bg-secondary/30 border-r border-primary/10 p-8 flex flex-col justify-between hidden md:flex">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Activity className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">HealthTrack</span>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">Step {step} of 3</h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            {step === 1 && "Foundation: Body metrics & Activity."}
                            {step === 2 && "Goals: What do you want to achieve?"}
                            {step === 3 && "Habits: Lifestyle & preferences."}
                        </p>

                        <div className="space-y-4">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center gap-3 transition-all duration-300">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300",
                                        step === s ? "bg-primary text-primary-foreground border-primary" :
                                            step > s ? "bg-primary/20 text-primary border-primary" :
                                                "border-muted-foreground text-muted-foreground"
                                    )}>
                                        {step > s ? <Check className="w-4 h-4" /> : s}
                                    </div>
                                    <span className={cn(
                                        "font-medium transition-colors duration-300",
                                        step === s ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {s === 1 && "Foundation"}
                                        {s === 2 && "Goals"}
                                        {s === 3 && "Habits"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE --- */}
                <div className="flex-1 flex flex-col bg-background/50 relative">

                    {/* LOADING OVERLAY */}
                    {isLoading && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Loading profile...</p>
                        </div>
                    )}

                    <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">

                        {/* Top Action Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold gradient-text">
                                {step === 1 && "Your Foundation"}
                                {step === 2 && "Main Goal & Health"}
                                {step === 3 && "Lifestyle & Limits"}
                            </h3>

                            {!isNewUser && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        className="text-muted-foreground hover:text-foreground"
                                        disabled={saveMutation.isPending}
                                    >
                                        Close
                                    </Button>
                                    {!isEditing && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                            className="text-primary border-primary/20 hover:bg-primary/10"
                                        >
                                            Update Details
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- STEP 1 --- */}
                        {step === 1 && (
                            <div className={cn("space-y-6 animate-fade-in", disabledClass)}>
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        placeholder="e.g. 25"
                                        className="h-12 bg-secondary/50"
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
                                                // @ts-ignore
                                                onClick={() => updateData("gender", g)}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg border cursor-pointer capitalize",
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
                                                <button onClick={() => setWeightUnit('kg')} className={cn("px-2 py-0.5 text-xs rounded-md", weightUnit === 'kg' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>kg</button>
                                                <button onClick={() => setWeightUnit('lbs')} className={cn("px-2 py-0.5 text-xs rounded-md", weightUnit === 'lbs' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>lbs</button>
                                            </div>
                                        </div>
                                        <Input
                                            id="weight"
                                            type="number"
                                            placeholder={weightUnit === 'kg' ? "e.g. 75" : "e.g. 165"}
                                            className="h-12 bg-secondary/50"
                                            value={data.weight}
                                            onChange={(e) => updateData("weight", e.target.value)}
                                        />
                                    </div>

                                    {/* HEIGHT */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="height">Height</Label>
                                            <div className="flex bg-secondary/50 rounded-lg p-1">
                                                <button onClick={() => setHeightUnit('cm')} className={cn("px-2 py-0.5 text-xs rounded-md", heightUnit === 'cm' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>cm</button>
                                                <button onClick={() => setHeightUnit('ft')} className={cn("px-2 py-0.5 text-xs rounded-md", heightUnit === 'ft' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>ft</button>
                                            </div>
                                        </div>
                                        <Input
                                            id="height"
                                            type="number"
                                            placeholder={heightUnit === 'cm' ? "e.g. 180" : "e.g. 5.9"}
                                            className="h-12 bg-secondary/50"
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
                                                    "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                                                    data.activityLevel === level.value
                                                        ? "bg-primary/10 border-primary"
                                                        : "bg-secondary/30 border-transparent hover:border-primary/30"
                                                )}
                                            >
                                                <div>
                                                    <p className={cn("font-medium", data.activityLevel === level.value ? "text-primary" : "text-foreground")}>{level.label}</p>
                                                    <p className="text-sm text-muted-foreground">{level.desc}</p>
                                                </div>
                                                {data.activityLevel === level.value && <Check className="w-4 h-4 text-primary" />}
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
                                        className="h-12 bg-secondary/50"
                                        value={data.heartRate}
                                        onChange={(e) => updateData("heartRate", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* --- STEP 2 --- */}
                        {step === 2 && (
                            <div className={cn("space-y-6 animate-fade-in", disabledClass)}>
                                <div className="space-y-3">
                                    <Label>What is your main goal?</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {GOAL_OPTIONS.map((goal) => (
                                            <div
                                                key={goal.value}
                                                onClick={() => updateData("mainGoal", goal.value)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all aspect-video",
                                                    data.mainGoal === goal.value
                                                        ? "bg-primary/10 border-primary"
                                                        : "bg-secondary/30 border-transparent hover:border-primary/30"
                                                )}
                                            >
                                                <goal.icon className={cn("w-6 h-6 mb-2", data.mainGoal === goal.value ? "text-primary" : "text-muted-foreground")} />
                                                <p className={cn("font-medium text-center", data.mainGoal === goal.value ? "text-primary" : "text-foreground")}>{goal.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Pre-existing Conditions</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(Object.keys(CONDITION_LABELS) as HealthCondition[]).map((cond) => (
                                            <div
                                                key={cond}
                                                onClick={() => toggleArrayItem("conditions", cond)}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm border cursor-pointer text-center",
                                                    data.conditions.includes(cond)
                                                        ? "bg-primary/20 border-primary text-primary-foreground"
                                                        : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                                                )}
                                            >
                                                {CONDITION_LABELS[cond]}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="targetWeight">Target Weight</Label>
                                        <span className="text-xs text-muted-foreground">Default: Current Weight</span>
                                    </div>
                                    <Input
                                        id="targetWeight"
                                        type="number"
                                        placeholder={weightUnit === 'kg' ? "e.g. 70" : "e.g. 154"}
                                        className="h-12 bg-secondary/50"
                                        value={data.targetWeight}
                                        onChange={(e) => updateData("targetWeight", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dailyGoalWorkoutTarget">Daily Exercise Goal (Minutes)</Label>
                                    <Input
                                        id="dailyGoalWorkoutTarget"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 45"
                                        className="h-12 bg-secondary/50"
                                        value={data.dailyGoalWorkoutTarget}
                                        onChange={(e) => updateData("dailyGoalWorkoutTarget", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dailyCalorieTarget">Daily Calorie Target (kcal)</Label>
                                    <Input
                                        id="dailyCalorieTarget"
                                        type="number"
                                        placeholder="e.g. 2000"
                                        className="h-12 bg-secondary/50"
                                        value={data.dailyCalorieTarget}
                                        onChange={(e) => updateData("dailyCalorieTarget", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Default calculated based on your target weight and gender.</p>
                                </div>
                            </div>
                        )}

                        {/* --- STEP 3 --- */}
                        {step === 3 && (
                            <div className={cn("space-y-8 animate-fade-in", disabledClass)}>
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2">Dietary Preferences</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {(Object.keys(DIETARY_LABELS) as DietaryPreference[]).map((diet) => (
                                            <div
                                                key={diet}
                                                onClick={() => toggleArrayItem("dietary", diet)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full border cursor-pointer",
                                                    data.dietary.includes(diet)
                                                        ? "bg-primary/20 border-primary text-primary"
                                                        : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                                                )}
                                            >
                                                {DIETARY_LABELS[diet]}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2">Workout Environment</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(Object.keys(WORKOUT_LABELS) as ExerciseType[]).map((env) => (
                                            <div
                                                key={env}
                                                onClick={() => toggleArrayItem("workoutEnv", env)}
                                                className={cn(
                                                    "p-4 rounded-xl border cursor-pointer text-center",
                                                    data.workoutEnv.includes(env)
                                                        ? "bg-primary/20 border-primary text-primary font-medium"
                                                        : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                                                )}
                                            >
                                                {WORKOUT_LABELS[env]}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* --- FOOTER --- */}
                    <div className="p-6 border-t border-primary/10 bg-secondary/20 flex justify-between items-center shrink-0">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={handleBack} disabled={saveMutation.isPending}>
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        ) : <div />}

                        {/* Show Next/Submit unless we are in ReadOnly mode at the end */}
                        {(!isEditing && step === 3) ? (
                            <Button variant="ghost" onClick={onClose}>
                                Close
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    isEditing && (
                                        (step === 1 && !isStep1Valid) ||
                                        (step === 2 && !isStep2Valid) ||
                                        (step === 3 && !isStep3Valid) ||
                                        saveMutation.isPending
                                    )
                                }
                                className={cn(
                                    "px-8",
                                    step === 3 ? "bg-gradient-to-r from-primary to-accent" : "bg-primary"
                                )}
                            >
                                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {step === 3
                                    ? (isNewUser ? "Complete Setup" : "Update Profile")
                                    : "Next Step"
                                }
                                {step !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DetailedProfileModal;
