import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

interface DateRangeSelectorProps {
    period: "WEEKLY" | "MONTHLY" | "CUSTOM";
    setPeriod: (period: "WEEKLY" | "MONTHLY" | "CUSTOM") => void;
    customStartDate?: string;
    setCustomStartDate: (date: string) => void;
    customEndDate?: string;
    setCustomEndDate: (date: string) => void;
}

export const DateRangeSelector = ({
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
}: DateRangeSelectorProps) => {

    // Calculate min and max dates for the native date pickers
    const today = new Date();
    const maxDateStr = today.toISOString().split('T')[0];

    const minDate = new Date();
    minDate.setDate(today.getDate() - 60); // 60 days lookback limit
    const minDateStr = minDate.toISOString().split('T')[0];

    // Initialize custom dates if they are empty
    useEffect(() => {
        if (!customStartDate) setCustomStartDate(minDateStr);
        if (!customEndDate) setCustomEndDate(maxDateStr);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
                <Button
                    variant={period === "WEEKLY" ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-9 px-4 rounded-md text-sm font-medium transition-all ${period === "WEEKLY" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setPeriod("WEEKLY")}
                >
                    <CalendarDays className="w-4 h-4 mr-2" /> Week
                </Button>
                <Button
                    variant={period === "MONTHLY" ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-9 px-4 rounded-md text-sm font-medium transition-all ${period === "MONTHLY" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setPeriod("MONTHLY")}
                >
                    <Calendar className="w-4 h-4 mr-2" /> Month
                </Button>
                <Button
                    variant={period === "CUSTOM" ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-9 px-4 rounded-md text-sm font-medium transition-all ${period === "CUSTOM" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setPeriod("CUSTOM")}
                >
                    <CalendarRange className="w-4 h-4 mr-2" /> Custom
                </Button>
            </div>

            {period === "CUSTOM" && (
                <div className="flex gap-3 items-center animate-in fade-in tracking-tight slide-in-from-left-4 duration-300">
                    <input
                        type="date"
                        min={minDateStr}
                        max={maxDateStr}
                        value={customStartDate || minDateStr}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="h-9 px-3 rounded-md border border-white/10 bg-black/20 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    />
                    <span className="text-muted-foreground font-medium">to</span>
                    <input
                        type="date"
                        min={customStartDate || minDateStr}
                        max={maxDateStr}
                        value={customEndDate || maxDateStr}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="h-9 px-3 rounded-md border border-white/10 bg-black/20 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    />
                </div>
            )}
        </div>
    );
};
