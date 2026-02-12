import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Plus, Loader2, Dumbbell } from 'lucide-react';
import { WorkoutType, ExerciseLog, workoutApi } from '@/api/workout';
import { useQueryClient } from '@tanstack/react-query';

interface WorkoutLogPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ExerciseRow extends ExerciseLog {
    id: string; // Internal ID for React keys
    isSearching: boolean;
    searchResults: any[];
    showResults: boolean;
}

// Workout Type Display Labels
const WORKOUT_LABELS: Record<WorkoutType, string> = {
    [WorkoutType.STRENGTH_TRAINING]: 'Strength Training',
    [WorkoutType.CARDIO_VIGOROUS]: 'Cardio (Vigorous)',
    [WorkoutType.CARDIO_LIGHT]: 'Cardio (Light)',
    [WorkoutType.YOGA]: 'Yoga',
    [WorkoutType.HIIT]: 'HIIT',
    [WorkoutType.WALKING]: 'Walking',
};

export const WorkoutLogPopup: React.FC<WorkoutLogPopupProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [workoutType, setWorkoutType] = useState<WorkoutType>(WorkoutType.STRENGTH_TRAINING);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [exercises, setExercises] = useState<ExerciseRow[]>([
        { id: '1', exerciseName: '', sets: 0, reps: 0, weightKg: 0, durationMinutes: 0, isSearching: false, searchResults: [], showResults: false, gifUrl: '', type: WorkoutType.STRENGTH_TRAINING }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add new row
    const addExerciseRow = () => {
        setExercises([...exercises, {
            id: crypto.randomUUID(),
            exerciseName: '',
            sets: 0,
            reps: 0,
            weightKg: 0,
            durationMinutes: 0,
            isSearching: false,
            searchResults: [],
            showResults: false,
            gifUrl: '',
            type: workoutType
        }]);
    };

    // Remove row
    const removeExerciseRow = (id: string) => {
        if (exercises.length === 1) {
            toast.error("At least one exercise is required");
            return;
        }
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    // Update row field
    const updateRow = (id: string, field: keyof ExerciseLog, value: any) => {
        setExercises(exercises.map(ex => {
            if (ex.id === id) {
                return { ...ex, [field]: value };
            }
            return ex;
        }));
    };

    // Handle Search Input Change
    const handleSearchChange = async (id: string, value: string) => {
        // Update name immediately
        updateRow(id, 'exerciseName', value);

        // Debounced search logic could go here, or simple direct call
        // For simplicity, let's trigger search if length > 2

        setExercises(prev => prev.map(ex => {
            if (ex.id === id) {
                return { ...ex, showResults: value.length > 2 };
            }
            return ex;
        }));

        if (value.length > 2) {
            try {
                // Set loading state for this row
                setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, isSearching: true } : ex));

                const results = await workoutApi.searchExercises(value);

                setExercises(prev => prev.map(ex =>
                    ex.id === id
                        ? { ...ex, searchResults: results, isSearching: false, showResults: true }
                        : ex
                ));
            } catch (error) {
                console.error("Search failed", error);
                setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, isSearching: false } : ex));
            }
        } else {
            setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, searchResults: [], showResults: false } : ex));
        }
    };

    // Select Search Result
    const selectExercise = (id: string, name: string, imageUrl?: string) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id === id) {
                return { ...ex, exerciseName: name, showResults: false, gifUrl: imageUrl || '' };
            }
            return ex;
        }));
    };


    const handleSubmit = async () => {
        // Validate
        const invalidRow = exercises.find(ex => !ex.exerciseName || ex.durationMinutes < 0);
        if (invalidRow) {
            toast.error("Please fill in all exercise names and ensuring duration is positive.");
            return;
        }

        setIsSubmitting(true);
        try {
            await workoutApi.logWorkout({
                type: workoutType,
                date,
                exercises: exercises.map(({ id, isSearching, searchResults, showResults, ...rest }) => rest)
            });
            toast.success("Workout logged successfully!");

            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["today-logs"] });
            queryClient.invalidateQueries({ queryKey: ["user-stats"] });

            onClose();
            // Reset
            setExercises([{ id: '1', exerciseName: '', sets: 0, reps: 0, weightKg: 0, durationMinutes: 0, isSearching: false, searchResults: [], showResults: false, gifUrl: '', type: workoutType }]);
        } catch (error) {
            console.error("Log failed", error);
            toast.error("Failed to log workout");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-primary" /> Log Workout
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Workout Type */}
                    <div className="grid gap-2">
                        <Label>Workout Type</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={workoutType}
                            onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
                        >
                            {Object.values(WorkoutType).map((type) => (
                                <option key={type} value={type}>
                                    {WORKOUT_LABELS[type]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Exercises</Label>
                            <Button variant="outline" size="sm" onClick={addExerciseRow} className="gap-2">
                                <Plus className="w-4 h-4" /> Add Exercise
                            </Button>
                        </div>

                        {exercises.map((exercise, index) => (
                            <div key={exercise.id} className="grid gap-4 p-4 rounded-lg border bg-muted/20 relative">
                                <div className="absolute right-2 top-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-6 w-6"
                                        onClick={() => removeExerciseRow(exercise.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Search Input */}
                                    <div className="grid gap-2 relative">
                                        <Label>Exercise Name</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Search exercise..."
                                                value={exercise.exerciseName}
                                                onChange={(e) => handleSearchChange(exercise.id, e.target.value)}
                                            />
                                            {exercise.isSearching && (
                                                <div className="absolute right-3 top-2.5">
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        {exercise.showResults && exercise.searchResults.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-lg mt-1 max-h-60 overflow-auto top-[70px]">
                                                {exercise.searchResults.map((result, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="px-4 py-2 hover:bg-muted cursor-pointer text-sm flex items-center justify-between"
                                                        onClick={() => selectExercise(exercise.id, result.name, result.imageUrl)}
                                                    >
                                                        <span>{result.name}</span>
                                                        {result.imageUrl && <img src={result.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Minutes</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={exercise.durationMinutes || ''}
                                            onChange={(e) => updateRow(exercise.id, 'durationMinutes', parseInt(e.target.value) || 0)}
                                        />
                                        {exercise.durationMinutes > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                This is approx. {(exercise.durationMinutes / 60).toFixed(1)} hours
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Sets</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={exercise.sets || ''}
                                            onChange={(e) => updateRow(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Reps</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={exercise.reps || ''}
                                            onChange={(e) => updateRow(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Weight (kg)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={exercise.weightKg || ''}
                                            onChange={(e) => updateRow(exercise.id, 'weightKg', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Workout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
