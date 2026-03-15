import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { AppSidebar } from "@/components/layout/AppSidebar";
import DetailedProfileModal from "@/components/dashboard/modals/DetailedProfileModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MealsView } from "@/components/dashboard/MealsView";
import { WaterView } from "@/components/dashboard/WaterView";
import { WorkoutsView } from "@/components/dashboard/WorkoutsView";
import { StepsView } from "@/components/dashboard/StepsView";
import { HealthView } from "@/components/dashboard/HealthView";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { QuickAddModal } from "@/components/dashboard/modals/QuickAddModal";
import { UpdateGoalsModal } from "@/components/dashboard/modals/UpdateGoalsModal";
import { AdminView } from "@/components/dashboard/AdminView";

import { WelcomeModal } from "@/components/dashboard/modals/WelcomeModal";

import { useAuth } from "@/hooks/useAuth";

import { MealEntryPopup } from "@/components/dashboard/MealEntryPopup";
import { WorkoutLogPopup } from "@/components/dashboard/WorkoutLogPopup";
import { WaterLogPopup } from "@/components/dashboard/WaterLogPopup";
import { useDashboardData } from "@/hooks/useDashboardData";
import { GlassLoader } from "@/components/ui/GlassLoader";
import { HEALTH_DEFAULTS } from "@/config/health-constants";
import { Lock } from "lucide-react";

const DashboardPage = () => {
    const { user } = useAuth();
    const [, params] = useRoute("/dashboard/:subpage*") as [boolean, { subpage: string } | null];
    const subpage = params ? params.subpage : "overview";
    const { data: dashboardData, isLoading } = useDashboardData();

    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [showMealPopup, setShowMealPopup] = useState(false);
    const [showWorkoutPopup, setShowWorkoutPopup] = useState(false);
    const [showWaterPopup, setShowWaterPopup] = useState(false);
    const [chartTimeRange, setChartTimeRange] = useState("weekly");

    const [targets, setTargets] = useState({
        calories: 0,
        water: 0,
        steps: 0,
        workouts: 0
    });

    // Update targets from dashboard data if available
    useEffect(() => {
        if (dashboardData?.profile) {
            setTargets({
                calories: dashboardData.profile.targetDailyCalorie || dashboardData.profile.dailyCalorieTarget || 0,
                water: dashboardData.profile.dailyWaterGoalMl || 0,
                steps: (dashboardData.profile as any).targetDailyWalk || 0,
                workouts: dashboardData.profile.dailyGoalWorkoutTarget ??
                    (dashboardData.profile.weeklyGoalWorkoutTarget ? Math.round(dashboardData.profile.weeklyGoalWorkoutTarget / 7) : 0)
            });
        }
    }, [dashboardData]);

    useEffect(() => {
        if (isLoading) return;

        const hasSeenModal = localStorage.getItem("hasSeenWelcomeModal");
        
        if (!hasCompletedProfile && !hasSeenModal) {
            const timer = setTimeout(() => setShowWelcomeModal(true), 1000);
            return () => clearTimeout(timer);
        } else if (hasCompletedProfile && !hasSeenModal) {
            localStorage.setItem("hasSeenWelcomeModal", "true");
        }
    }, [dashboardData, isLoading]);

    const handleSkipWelcome = () => {
        setShowWelcomeModal(false);
        localStorage.setItem("hasSeenWelcomeModal", "true");
    };

    const handleStartSetup = () => {
        setShowWelcomeModal(false);
        setShowProfileModal(true);
        localStorage.setItem("hasSeenWelcomeModal", "true");
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    // Use the backend's explicit onboarding flag if available, otherwise fallback to checking core metrics
    const hasCompletedProfile = !!(
        dashboardData?.profile?.isOnboardingComplete ||
        (dashboardData?.profile?.age && dashboardData?.profile?.currentWeightKg) ||
        (dashboardData?.profile?.age && dashboardData?.profile?.weight)
    );

    const renderContent = () => {
        const commonProps = {
            targets,
            onOpenTargetModal: () => setShowTargetModal(true),
            chartTimeRange,
            setChartTimeRange,
            data: dashboardData
        };

        const renderLockedState = (title: string) => (
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center glass-card border border-primary/10 rounded-2xl animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-primary opacity-80" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{title} Locked</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    You must complete your health profile setup before you can access this feature and start tracking your progress.
                </p>
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-full font-semibold shadow-lg shadow-primary/25"
                >
                    Setup Health Profile Now
                </button>
            </div>
        );

        switch (subpage) {
            case "meals":
                return hasCompletedProfile ? <MealsView {...commonProps} onLogMeal={() => setShowMealPopup(true)} /> : renderLockedState("Meal Tracking");
            case "water":
                return hasCompletedProfile ? <WaterView {...commonProps} /> : renderLockedState("Water Tracking");
            case "workouts":
                return hasCompletedProfile ? <WorkoutsView {...commonProps} onLogWorkout={() => setShowWorkoutPopup(true)} /> : renderLockedState("Workout Tracking");
            case "steps":
                return hasCompletedProfile ? <StepsView {...commonProps} /> : renderLockedState("Step Tracking");
            case "health":
                return <HealthView onUpdateProfile={() => setShowProfileModal(true)} data={dashboardData} />;
            case "admin":
                return user?.role === "ROLE_ADMIN" ? <AdminView /> : <OverviewView data={dashboardData} targets={targets} hasCompletedProfile={hasCompletedProfile} onUpdateProfile={() => setShowProfileModal(true)} />;
            default:
                return <OverviewView data={dashboardData} targets={targets} hasCompletedProfile={hasCompletedProfile} onUpdateProfile={() => setShowProfileModal(true)} />;
        }
    };
    // ... keep return ...


    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <AppSidebar />

            <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto">
                {/* Organic background elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 organic-blob" />
                    <div className="absolute top-1/2 -left-20 w-64 h-64 bg-accent/5 organic-blob" style={{ animationDelay: "-4s" }} />
                    <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-primary/3 organic-blob" style={{ animationDelay: "-2s" }} />
                </div>

                {/* Top Header */}
                <DashboardHeader
                    subpage={subpage}
                    onQuickAdd={() => setShowQuickAdd(true)}
                    onUpdateProfile={() => setShowProfileModal(true)}
                    isProfileComplete={hasCompletedProfile}
                />

                {/* Main Content */}
                <main className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full relative z-10 animate-fade-in-up">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl 2xl:text-5xl font-bold mb-2 font-instrument">
                            Welcome back, <span className="gradient-text">{user?.name || "User"}</span>!
                        </h1>
                        <p className="text-muted-foreground 2xl:text-xl font-instrument">
                            Here's your health summary for <span className="font-semibold text-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                    </div>

                    {renderContent()}
                </main>
            </div>

            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={handleSkipWelcome}
                onStartSetup={handleStartSetup}
            />

            <DetailedProfileModal isOpen={showProfileModal} onClose={handleCloseProfileModal} />
            <MealEntryPopup isOpen={showMealPopup} onClose={() => setShowMealPopup(false)} />

            <QuickAddModal
                open={showQuickAdd}
                onOpenChange={setShowQuickAdd}
                onAddMeal={() => setShowMealPopup(true)}
                onLogWorkout={() => setShowWorkoutPopup(true)}
                onLogWater={() => setShowWaterPopup(true)}
            />
            <UpdateGoalsModal open={showTargetModal} onOpenChange={setShowTargetModal} targets={targets} setTargets={setTargets} />
            <WorkoutLogPopup isOpen={showWorkoutPopup} onClose={() => setShowWorkoutPopup(false)} />
            <WaterLogPopup isOpen={showWaterPopup} onClose={() => setShowWaterPopup(false)} />
        </div>
    );
};

export default DashboardPage;
