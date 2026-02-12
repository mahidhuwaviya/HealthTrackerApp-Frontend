import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UpdateGoalsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targets: {
        calories: number;
        water: number;
        steps: number;
        workouts: number;
    };
    setTargets: (targets: {
        calories: number;
        water: number;
        steps: number;
        workouts: number;
    }) => void;
}

export const UpdateGoalsModal = ({ open, onOpenChange, targets, setTargets }: UpdateGoalsModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-card border-primary/10 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="gradient-text">Update Goals</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="calories" className="text-sm font-medium">Daily Calories (kcal)</label>
                        <input
                            id="calories"
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={targets.calories}
                            onChange={(e) => setTargets({ ...targets, calories: Number(e.target.value) })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="water" className="text-sm font-medium">Water Goal (ml)</label>
                        <input
                            id="water"
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={targets.water}
                            onChange={(e) => setTargets({ ...targets, water: Number(e.target.value) })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="steps" className="text-sm font-medium">Daily Steps</label>
                        <input
                            id="steps"
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={targets.steps}
                            onChange={(e) => setTargets({ ...targets, steps: Number(e.target.value) })}
                        />
                    </div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={() => onOpenChange(false)}>Save Changes</Button>
            </DialogContent>
        </Dialog>
    );
};
