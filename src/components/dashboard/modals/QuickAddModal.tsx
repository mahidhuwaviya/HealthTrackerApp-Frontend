import {
    Activity,
    Droplets,
    Utensils,
    Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QuickAddModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddMeal: () => void;
    onLogWorkout: () => void;
    onLogWater: () => void;
}

export const QuickAddModal = ({ open, onOpenChange, onAddMeal, onLogWorkout, onLogWater }: QuickAddModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-card border-primary/10 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="gradient-text">Log Daily Metric</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 border-primary/10 hover:bg-primary/5"
                        onClick={() => {
                            onAddMeal();
                            onOpenChange(false);
                        }}
                    >
                        <Utensils className="text-calories" /> <span>Meal</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 border-primary/10 hover:bg-primary/5"
                        onClick={() => {
                            onLogWater();
                            onOpenChange(false);
                        }}
                    >
                        <Droplets className="text-water" /> <span>Water</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2 border-primary/10 hover:bg-primary/5">
                        <Activity className="text-heart" /> <span>Weight</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-24 flex-col gap-2 border-primary/10 hover:bg-primary/5"
                        onClick={() => {
                            onLogWorkout();
                            onOpenChange(false);
                        }}
                    >
                        <Dumbbell className="text-primary" /> <span>Workout</span>
                    </Button>
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={() => onOpenChange(false)}>Done</Button>
            </DialogContent>
        </Dialog>
    );
};
