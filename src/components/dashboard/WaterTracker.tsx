import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Droplets, Minus } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, or maybe generic toast
import { waterApi } from "../../api/water";

interface WaterTrackerProps {
    currentIntake: number;
    dailyGoal: number;
    userEmail?: string;
}

export const WaterTracker = ({ currentIntake, dailyGoal, userEmail }: WaterTrackerProps) => {
    const queryClient = useQueryClient();
    const [customAmount, setCustomAmount] = useState<string>("");

    const { mutate: logWater, isPending } = useMutation({
        mutationFn: async (amount: number) => {
            return await waterApi.logWaterIntake(amount, userEmail);
        },
        onMutate: async (amount) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["dashboard-summary"] });

            // Snapshot the previous value
            const previousDashboardData = queryClient.getQueryData(["dashboard-summary"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["dashboard-summary"], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    totalWaterToday: (old.totalWaterToday || 0) + amount
                };
            });

            // Return a context object with the snapshotted value
            return { previousDashboardData };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(["dashboard-summary"], context?.previousDashboardData);
            toast.error("Failed to log water intake. Please try again.");
            console.error("Water log error:", err);
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["today-logs"] });
            queryClient.invalidateQueries({ queryKey: ["user-stats"] });
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
        <div className="stat-card inner-glow p-6 relative overflow-hidden group">
            {/* Background Animation Effect - simplified implementation */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-blue-500/10 transition-all duration-1000 ease-out"
                style={{ height: `${percentage}%` }}
            />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                            <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium">Water Intake</h3>
                            <p className="text-sm text-muted-foreground">Daily Goal: {dailyGoal}ml</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold block">{currentIntake} <span className="text-sm font-normal text-muted-foreground">ml</span></span>
                        <span className="text-sm font-medium text-blue-500">{percentage.toFixed(0)}%</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleQuickAdd(250)}
                            disabled={isPending}
                            className="btn-outline flex items-center justify-center gap-2 py-2 text-sm hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> 250ml
                        </button>
                        <button
                            onClick={() => handleQuickAdd(500)}
                            disabled={isPending}
                            className="btn-outline flex items-center justify-center gap-2 py-2 text-sm hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> 500ml
                        </button>
                    </div>

                    <form onSubmit={handleCustomAdd} className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Amount (ml)"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                            type="submit"
                            disabled={!customAmount || isPending}
                            className="btn-primary px-4 py-2 text-sm"
                        >
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
