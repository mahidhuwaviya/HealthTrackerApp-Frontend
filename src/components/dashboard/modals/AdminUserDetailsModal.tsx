import { adminApi, AdminUser, AdminUserDetails } from "@/api/admin";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { RefreshCcw, ShieldAlert, Activity, HeartPulse, Scale, Navigation, Utensils, Droplets, Target, Award } from "lucide-react";

interface AdminUserDetailsModalProps {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdminUserDetailsModal({ user, open, onOpenChange }: AdminUserDetailsModalProps) {
    // Only fetch details if the modal is open and we have a selected user
    const { data: details, isLoading, isError, error, refetch } = useQuery<AdminUserDetails, Error>({
        queryKey: ["adminUserDetails", user?.email],
        queryFn: () => adminApi.getUser(user!.email),
        enabled: open && !!user?.email, 
        retry: false,
        refetchOnWindowFocus: false,
    });

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 min-h-[30vh]">
                    <RefreshCcw className="w-8 h-8 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium">Fetching complete profile...</p>
                </div>
            );
        }

        if (isError) {
            // Check if it's a 404 Not Found (user hasn't created a profile yet)
            // or if the backend returns specific messages indicating no profile
            const status = (error as any)?.response?.status;
            
            // Handle both { message: "..." } JSON objects and raw string responses
            const responseData = (error as any)?.response?.data;
            const message = typeof responseData === 'string' 
                ? responseData 
                : (responseData?.message || (error as any)?.message || "");

            const isNoProfile = status === 404 || 
                message.toLowerCase().includes("not found") || 
                message.toLowerCase().includes("no profile") ||
                message.toLowerCase().includes("hasn't created") ||
                message.toLowerCase().includes("exception occured user dosen't exist");

            if (isNoProfile) {
                return (
                    <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-2xl border border-primary/10 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Utensils className="w-8 h-8 text-primary opacity-50" />
                        </div>
                        <h3 className="font-bold text-foreground mb-1 text-lg">No Profile Linked</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                            <span className="font-medium text-foreground">{user?.userName}</span> hasn't created an account yet.
                        </p>
                    </div>
                );
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 rounded-2xl border border-destructive/20 text-center animate-in zoom-in-95 duration-300">
                    <ShieldAlert className="w-10 h-10 text-destructive mb-3" />
                    <h3 className="font-bold text-destructive mb-1">Retrieval Failed</h3>
                    <p className="text-sm text-muted-foreground mb-4">Could not load the detailed profile for {user?.email}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 text-sm bg-background border border-border shadow-sm rounded-lg hover:bg-secondary transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (!details) {
            return null;
        }

        return (
            <div className="space-y-6 mt-4 animate-in fade-in duration-300">
                {/* Identification Banner */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                     <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0 text-xl font-bold text-primary">
                         {user?.userName?.slice(0, 2).toUpperCase() || "U"}
                     </div>
                     <div className="flex-1 min-w-0">
                         <h3 className="text-lg font-bold truncate">{user?.userName}</h3>
                         <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                     </div>
                     <div className="text-right shrink-0 pr-2">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                             details.isOnboardingComplete 
                             ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                             : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                         }`}>
                             {details.isOnboardingComplete ? "Onboarded" : "Incomplete"}
                         </span>
                     </div>
                </div>

                {/* Core Vitals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="glass-card p-3 rounded-xl border border-primary/10 bg-secondary/30 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Scale className="w-5 h-5 text-primary mx-auto mb-1 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground font-medium">Weight</p>
                        <p className="text-sm font-bold">{details.currentWeightKg} <span className="text-xs font-normal">{details.weightUnit}</span></p>
                    </div>
                    <div className="glass-card p-3 rounded-xl border border-primary/10 bg-secondary/30 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Navigation className="w-5 h-5 text-primary mx-auto mb-1 flex-shrink-0 rotate-45" />
                        <p className="text-xs text-muted-foreground font-medium">Height</p>
                        <p className="text-sm font-bold">{details.currentHeightCm} <span className="text-xs font-normal">{details.heightUnit}</span></p>
                    </div>
                    <div className="glass-card p-3 rounded-xl border border-primary/10 bg-secondary/30 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Activity className="w-5 h-5 text-primary mx-auto mb-1 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground font-medium">BMI</p>
                        <p className="text-sm font-bold">{details.bmi?.toFixed(1) || "--"}</p>
                    </div>
                    <div className="glass-card p-3 rounded-xl border border-primary/10 bg-secondary/30 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <HeartPulse className="w-5 h-5 text-primary mx-auto mb-1 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground font-medium">Age</p>
                        <p className="text-sm font-bold">{details.age} <span className="text-xs font-normal">yo</span></p>
                    </div>
                </div>

                {/* Goals & Targets Grid */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <Target className="w-4 h-4 text-primary" /> Daily Targets & Goals
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-background">
                            <div className="flex items-center gap-2 text-sm">
                                <Utensils className="w-4 h-4 text-orange-500" /> Calories
                            </div>
                            <span className="font-bold">{details.targetDailyCalorie} kcal</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-background">
                            <div className="flex items-center gap-2 text-sm">
                                <Droplets className="w-4 h-4 text-blue-500" /> Water
                            </div>
                            <span className="font-bold">{details.dailyWaterGoalMl} ml</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-background">
                            <div className="flex items-center gap-2 text-sm">
                                <Navigation className="w-4 h-4 text-emerald-500" /> Steps
                            </div>
                            <span className="font-bold">{details.targetDailyWalk}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-background">
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="w-4 h-4 text-purple-500" /> Workout
                            </div>
                            <span className="font-bold">{details.dailyGoalWorkoutTarget} mins</span>
                        </div>
                    </div>
                </div>

                {/* Demographics & Lifestyle block */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                        <Award className="w-4 h-4 text-primary" /> Lifestyle & Preferences
                    </h4>
                    <div className="glass-card p-4 rounded-xl border border-primary/10 space-y-3 font-medium text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-primary/5">
                            <span className="text-muted-foreground">Main Goal</span>
                            <span className="capitalize">{details.goal?.toLowerCase().replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-primary/5">
                            <span className="text-muted-foreground">Activity Level</span>
                            <span className="capitalize">{details.activityLevel?.toLowerCase().replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-primary/5">
                            <span className="text-muted-foreground">Dietary Config</span>
                            <span className="capitalize text-right max-w-[50%] truncate">{details.dietaryPreferences?.join(", ")?.toLowerCase() || "None"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-primary/5">
                            <span className="text-muted-foreground">Exercise Types</span>
                            <span className="capitalize text-right max-w-[50%] truncate">{details.exerciseTypes?.join(", ")?.toLowerCase() || "None"}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Existing Conditions</span>
                            <span className="capitalize text-right max-w-[50%] truncate text-destructive">
                                {details.healthConditions?.join(", ")?.toLowerCase() || "None"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-6 bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-bold">In-Depth Profile Data</DialogTitle>
                    <DialogDescription>
                        Complete health records and target details corresponding to user ID <span className="font-mono text-xs">{user?.userId?.split('-')[0]}...</span>
                    </DialogDescription>
                </DialogHeader>
                
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
