import { useState, useEffect } from "react";
import {
    MemoCheck as Check,
    MemoChevronRight as ChevronRight,
    MemoChevronLeft as ChevronLeft,
    MemoActivity as Activity,
} from "@/components/ui/MemoizedIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { GlassLoader } from "@/components/ui/GlassLoader";
import { Button } from "@/components/ui/button";
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
import { ProfileStepFoundation } from "./profile-steps/ProfileStepFoundation";
import { ProfileStepGoals } from "./profile-steps/ProfileStepGoals";
import { ProfileStepLifestyle } from "./profile-steps/ProfileStepLifestyle";

interface DetailedProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 1 | 2 | 3;

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
    dailyGoalWorkoutTarget: string;
}

const DetailedProfileModal = ({ isOpen, onClose }: DetailedProfileModalProps) => {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<Step>(1);

    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

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

    const [isEditing, setIsEditing] = useState(true);
    const [isNewUser, setIsNewUser] = useState(true);

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ['user-profile'],
        queryFn: profileApi.getProfile,
        enabled: isOpen,
        retry: false,
        refetchOnWindowFocus: false
    });

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
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
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
            if (err.response?.status >= 500) {
                toast.error("Server error. Please try again later.");
            } else {
                toast.error("Failed to save profile. Please check your inputs.");
            }
        }
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            return;
        }

        if (profileData) {
            setIsNewUser(false);
            setIsEditing(false);

            const p = profileData;
            const hUnit = (p.heightUnit as 'cm' | 'ft') || 'cm';
            const wUnit = (p.weightUnit as 'kg' | 'lbs') || 'kg';

            const rawH_Cm = p.currentHeightCm || p.height || 0;
            const rawW_Kg = p.currentWeightKg || p.weight || 0;

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

            let defaultCalories = "";
            const backendCalories = p.dailyCalorieTarget || p.targetDailyCalorie;

            if (backendCalories) {
                defaultCalories = backendCalories.toString();
            } else if (displayH && displayW && ageVal && activityVal) {
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

            let targetW = "";
            if (p.targetWeightKg) {
                if (wUnit === 'lbs') {
                    targetW = (p.targetWeightKg / 0.453592).toFixed(1);
                } else {
                    targetW = p.targetWeightKg.toString();
                }
            } else {
                targetW = displayW;
            }

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

        } else if (!isLoading) {
            setIsNewUser(true);
            setIsEditing(true);
        }
    }, [isOpen, profileData, isLoading]);

    const calculateDefaultCalories = () => {
        const weightToUse = data.targetWeight || data.weight;
        if (!weightToUse || !data.height || !data.age || !data.gender || !data.activityLevel) return "";

        const w = parseFloat(weightToUse) * (weightUnit === 'lbs' ? 0.453592 : 1);
        const h = parseFloat(data.height) * (heightUnit === 'ft' ? 30.48 : 1);
        const a = parseInt(data.age);

        let bmr = (10 * w) + (6.25 * h) - (5 * a) + (data.gender === "MALE" ? 5 : -161);

        let multiplier = 1.2;
        if (data.activityLevel === ActivityLevel.LIGHTLY_ACTIVE) multiplier = 1.375;
        if (data.activityLevel === ActivityLevel.MODERATELY_ACTIVE) multiplier = 1.55;
        if (data.activityLevel === ActivityLevel.VERY_ACTIVE) multiplier = 1.725;

        return Math.round(bmr * multiplier).toString();
    };

    useEffect(() => {
        if (step === 2 && (data.targetWeight || data.weight) && data.height && data.age && data.activityLevel) {
            const calculated = calculateDefaultCalories();
            if (calculated && calculated !== data.dailyCalorieTarget) {
                setData(prev => ({ ...prev, dailyCalorieTarget: calculated }));
            }
        }
    }, [step, data.targetWeight, data.weight, data.height, data.age, data.gender, data.activityLevel]);

    const updateData = (key: keyof ProfileData, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const toggleArrayItem = (key: 'conditions' | 'dietary' | 'workoutEnv', item: string) => {
        setData(prev => {
            const current = prev[key] as string[];
            const exists = current.includes(item);
            return {
                ...prev,
                [key]: exists ? current.filter(i => i !== item) : [...current, item]
            };
        });
    };

    const isStep1Valid = data.age.length > 0 && data.weight.length > 0 && data.height.length > 0 && data.activityLevel !== "";
    const isStep2Valid = data.mainGoal !== "" && data.dailyGoalWorkoutTarget !== "";
    const isStep3Valid = data.dietary.length > 0 && data.workoutEnv.length > 0;

    const handleNext = async () => {
        if (!isEditing) {
            if (step === 1) setStep(2);
            else if (step === 2) setStep(3);
            return;
        }

        if (step === 1 && isStep1Valid) setStep(2);
        else if (step === 2 && isStep2Valid) setStep(3);
        else if (step === 3 && isStep3Valid) {
            const rawWeight = parseFloat(data.weight);
            const rawHeight = parseFloat(data.height);
            const heightInCm = heightUnit === 'ft' ? rawHeight * 30.48 : rawHeight;
            const weightInKg = weightUnit === 'lbs' ? rawWeight * 0.453592 : rawWeight;

            const targetWeightVal = data.targetWeight ? parseFloat(data.targetWeight) : rawWeight;
            const targetWeightKg = weightUnit === 'lbs' ? targetWeightVal * 0.453592 : targetWeightVal;

            const payload: UserProfileData = {
                ...(profileData || {}),
                userProfileDataId: profileData?.userProfileDataId,
                age: parseInt(data.age),
                gender: data.gender as Gender,
                activityLevel: data.activityLevel as ActivityLevel,
                heartRate: data.heartRate ? parseInt(data.heartRate) : undefined,
                weight: rawWeight,
                currentWeightKg: weightInKg,
                weightUnit: weightUnit,
                height: rawHeight,
                currentHeightCm: heightInCm,
                heightUnit: heightUnit === 'ft' ? 'ft' : 'cm',
                targetWeightKg: targetWeightKg,
                mainGoal: data.mainGoal as Goal,
                goal: data.mainGoal as Goal,
                dailyCalorieTarget: data.dailyCalorieTarget ? parseInt(data.dailyCalorieTarget) : undefined,
                targetDailyCalorie: data.dailyCalorieTarget ? parseInt(data.dailyCalorieTarget) : undefined,
                dailyGoalWorkoutTarget: data.dailyGoalWorkoutTarget ? parseInt(data.dailyGoalWorkoutTarget) : 30,
                weeklyGoalWorkoutTarget: data.dailyGoalWorkoutTarget ? parseInt(data.dailyGoalWorkoutTarget) * 7 : 210,
                conditions: data.conditions || [],
                healthConditions: data.conditions || [],
                dietary: data.dietary || [],
                dietaryPreferences: data.dietary || [],
                workoutEnv: data.workoutEnv || [],
                exerciseTypes: data.workoutEnv || [],
            };

            (payload as any).DailyGoalWorkoutTarget = payload.dailyGoalWorkoutTarget;
            (payload as any).Gender = payload.gender;
            (payload as any).Goal = payload.goal;

            saveMutation.mutate(payload);
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
    };

    if (!isOpen) return null;

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
                                        step === s ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-110" :
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

                    {/* INITIAL LOADING OVERLAY */}
                    {isLoading && (
                        <GlassLoader state="fetching" message="Syncing Health Profile..." />
                    )}

                    {/* SUBMISSION OVERLAY */}
                    {saveMutation.isPending && (
                        <GlassLoader state="processing" message="Updating Health Insights..." />
                    )}

                    <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">

                        {/* Top Action Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold gradient-text">
                                {step === 1 && "Your Foundation"}
                                {step === 2 && "Main Goal & Health"}
                                {step === 3 && "Habits & Limits"}
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

                        {step === 1 && (
                            <ProfileStepFoundation
                                data={data}
                                updateData={updateData}
                                weightUnit={weightUnit}
                                setWeightUnit={setWeightUnit}
                                heightUnit={heightUnit}
                                setHeightUnit={setHeightUnit}
                                isEditing={isEditing}
                            />
                        )}

                        {step === 2 && (
                            <ProfileStepGoals
                                data={data}
                                updateData={updateData}
                                toggleArrayItem={toggleArrayItem}
                                weightUnit={weightUnit}
                                isEditing={isEditing}
                            />
                        )}

                        {step === 3 && (
                            <ProfileStepLifestyle
                                data={data}
                                toggleArrayItem={toggleArrayItem}
                                isEditing={isEditing}
                            />
                        )}
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="p-6 border-t border-primary/10 bg-secondary/20 flex justify-between items-center shrink-0">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={handleBack} disabled={saveMutation.isPending} className="text-muted-foreground hover:text-foreground">
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        ) : <div />}

                        {(!isEditing && step === 3) ? (
                            <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
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
                                    "px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300",
                                    step === 3 ? "btn-glow shadow-lg shadow-primary/20" : ""
                                )}
                            >
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
