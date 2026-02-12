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

import { WelcomeModal } from "@/components/dashboard/modals/WelcomeModal";

import { useAuth } from "@/hooks/useAuth";

import { MealEntryPopup } from "@/components/dashboard/MealEntryPopup";
import { WorkoutLogPopup } from "@/components/dashboard/WorkoutLogPopup";
import { WaterLogPopup } from "@/components/dashboard/WaterLogPopup";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2 } from "lucide-react";

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
    calories: 2000,
    water: 2000,
    steps: 10000,
    workouts: 45
  });

  // Update targets from dashboard data if available
  useEffect(() => {
    if (dashboardData?.profile) {
      setTargets({
        calories: dashboardData.profile.dailyCalorieTarget || 2000,
        // Use ml directly as backend sends ml and logging is in ml
        water: dashboardData.profile.dailyWaterGoalMl || 2000,
        steps: 10000,
        // Prioritize dailyGoalWorkoutTarget if available, else derive from weekly
        workouts: dashboardData.profile.dailyGoalWorkoutTarget ??
          (dashboardData.profile.weeklyGoalWorkoutTarget ? Math.round(dashboardData.profile.weeklyGoalWorkoutTarget / 7) : 45)
      });
    }
  }, [dashboardData]);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenWelcomeModal");
    if (!hasSeenModal) {
      setTimeout(() => setShowWelcomeModal(true), 1000);
    }
  }, []);

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
    }

    const commonProps = {
      targets,
      onOpenTargetModal: () => setShowTargetModal(true),
      chartTimeRange,
      setChartTimeRange,
      data: dashboardData
    };

    switch (subpage) {
      case "meals":
        return <MealsView {...commonProps} onLogMeal={() => setShowMealPopup(true)} />;
      case "water":
        return <WaterView {...commonProps} />;
      case "workouts":
        return <WorkoutsView {...commonProps} onLogWorkout={() => setShowWorkoutPopup(true)} />;
      case "steps":
        return <StepsView {...commonProps} />;
      case "health":
        return <HealthView onUpdateProfile={() => setShowProfileModal(true)} data={dashboardData} />;
      default:
        return <OverviewView data={dashboardData} targets={targets} />;
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
        />

        {/* Main Content */}
        <main className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full relative z-10 animate-fade-in-up">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl 2xl:text-5xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{user?.name || "User"}</span>!
            </h1>
            <p className="text-muted-foreground 2xl:text-xl">Here's your health summary for today</p>
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
