import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Droplets, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { waterApi } from "@/api/water";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { dashboardApi } from "@/api/dashboard"; // For fetching current state if needed, or pass prop

interface WaterLogPopupProps {
    isOpen: boolean;
    onClose: () => void;
    currentIntake?: number; // Optional, can fetch if not provided
    dailyGoal?: number; // Optional
}

export const WaterLogPopup = ({ isOpen, onClose, currentIntake: initialIntake, dailyGoal: initialGoal }: WaterLogPopupProps) => {
    const queryClient = useQueryClient();
    const [customAmount, setCustomAmount] = useState<string>("");

    // Fetch latest data if not passed or to ensure freshness when opening
    // Actually, optimistically updating the dashboard query is better, so we rely on the main dashboard query cache usually.
    // Let's rely on props or cache.
    // If we want to show current progress IN the popup, we need the data.

    // We can use the cached dashboard data
    const dashboardData: any = queryClient.getQueryData(["dashboard-summary"]);
    const currentIntake = dashboardData?.totalWaterToday || initialIntake || 0;
    const dailyGoal = dashboardData?.profile?.dailyWaterGoalMl || initialGoal || 2000;

    const { mutate: logWater, isPending } = useMutation({
        mutationFn: async (amount: number) => {
            return await waterApi.logWaterIntake(amount);
        },
        onMutate: async (amount) => {
            await queryClient.cancelQueries({ queryKey: ["dashboard-summary"] });
            const previousDashboardData = queryClient.getQueryData(["dashboard-summary"]);

            queryClient.setQueryData(["dashboard-summary"], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    totalWaterToday: (old.totalWaterToday || 0) + amount
                };
            });

            return { previousDashboardData };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(["dashboard-summary"], context?.previousDashboardData);
            toast.error("Failed to log water intake.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["today-logs"] });
            queryClient.invalidateQueries({ queryKey: ["user-stats"] });

            toast.success("Water logged!");
            onClose();
        },
    });

    const handleQuickAdd = (amount: number) => {
        logWater(amount);
    };

    const handleCustomAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(customAmount);
        if (amount > 0) {
            logWater(amount);
            setCustomAmount("");
        }
    };

    const percentage = dailyGoal > 0 ? Math.min((currentIntake / dailyGoal) * 100, 100) : 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass-card border-primary/10 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-water" /> Log Water Intake
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Current Status */}
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Today's Total</p>
                            <p className="text-3xl font-bold">{currentIntake} <span className="text-lg text-muted-foreground font-normal">ml</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Goal: {dailyGoal}ml</p>
                            <p className="text-xl font-medium text-water">{percentage.toFixed(0)}%</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 w-full bg-secondary/50 rounded-full overflow-hidden mb-6 relative">
                        {/* Background bubbling effect could go here */}
                        <div
                            className="h-full bg-water transition-all duration-500 ease-out relative"
                            style={{ width: `${percentage}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button
                            variant="outline"
                            className="h-16 border-water/20 hover:bg-water/10 hover:border-water/50 flex flex-col gap-1"
                            onClick={() => handleQuickAdd(250)}
                            disabled={isPending}
                        >
                            <Plus className="w-5 h-5 text-water" />
                            <span className="font-semibold">250 ml</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-16 border-water/20 hover:bg-water/10 hover:border-water/50 flex flex-col gap-1"
                            onClick={() => handleQuickAdd(500)}
                            disabled={isPending}
                        >
                            <Plus className="w-5 h-5 text-water" />
                            <span className="font-semibold">500 ml</span>
                        </Button>
                    </div>

                    {/* Custom Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Droplets className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <form onSubmit={handleCustomAdd} className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Custom amount (ml)"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="flex-1 bg-background/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-water/50"
                            />
                            <Button type="submit" disabled={!customAmount || isPending} className="bg-water hover:bg-water/90 text-white">
                                Add
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
