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
import { foodApi, MealEntryDto } from '@/api/food';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';


// Wait, I didn't check if Select exists in UI components. 
// List from step 10: ... separator.tsx, sheet.tsx ... NO select.tsx
// I must use native select or a simple custom dropdown for Meal Type if Select is missing.
// Or better, I should check if I can quickly implement Select or use native.
// Native select is safer if I don't want to create too many files.
// But requirements say "Dropdown with options".
// I will use native <select> for now to keep it simple and robust, or check if I missed `select.tsx`.
// Let me double check step 10. `sonner.tsx`, `tabs.tsx`... NO `select.tsx`.
// I will use native <select> for Meal Type to avoid dependency issues, styled with Tailwind.

interface MealEntryPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const MEAL_TYPES = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'SNACK_1', label: 'Snack 1' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'SNACK_2', label: 'Snack 2' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'EXTRA', label: 'Extra' },
];

export const MealEntryPopup: React.FC<MealEntryPopupProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [foodQuery, setFoodQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Form State
    const [selectedFood, setSelectedFood] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [mealType, setMealType] = useState<MealEntryDto['type']>('BREAKFAST');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const searchDebounceRef = useRef<NodeJS.Timeout | null>(null); // Removed in favor of useEffect
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounced Search Effect
    useEffect(() => {
        // Clear results if query is too short
        if (foodQuery.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await foodApi.searchFood(foodQuery);
                setSearchResults(results);
                setShowResults(true);
            } catch (error) {
                console.error("Search failed", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [foodQuery]);

    // Close results on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFoodQuery(e.target.value);
        // Clear selected food logic? Requirements say "Once a user selects... it should auto-fill".
        // If they type after selecting, should we clear selectedFood?
        // Usually yes, to force valid selection.
        if (selectedFood) {
            setSelectedFood('');
        }
    };

    const handleSelectFood = (food: string) => {
        setFoodQuery(food);
        setSelectedFood(food);
        setShowResults(false);
    };

    const handleSubmit = async () => {
        if (!selectedFood) {
            toast.error("Please select a food");
            return;
        }
        if (quantity <= 0) {
            toast.error("Quantity must be positive");
            return;
        }

        setIsSubmitting(true);
        try {
            await foodApi.addMeal({
                foodName: selectedFood,
                quantity,
                type: mealType,
                date,
            });
            toast.success("Meal logged successfully");

            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            queryClient.invalidateQueries({ queryKey: ["today-logs"] });
            queryClient.invalidateQueries({ queryKey: ["user-stats"] });

            onClose();
            // Reset form?
            setFoodQuery('');
            setSelectedFood('');
            setQuantity(1);
        } catch (error) {
            console.error(error);
            toast.error("Failed to log meal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Meal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Food Search */}
                    <div className="grid gap-2 relative" ref={wrapperRef}>
                        <Label htmlFor="food">Search Food</Label>
                        <Input
                            id="food"
                            placeholder="Type to search (e.g. Banana)"
                            value={foodQuery}
                            onChange={handleSearchChange}
                            autoComplete="off"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-9">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {showResults && searchResults.length > 0 && (
                            <ul className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-auto top-[70px]">
                                {searchResults.map((result, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                                        onClick={() => handleSelectFood(result)}
                                    >
                                        {result}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        />
                    </div>

                    {/* Meal Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="mealType">Meal Type</Label>
                        <select
                            id="mealType"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value as MealEntryDto['type'])}
                        >
                            {MEAL_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
