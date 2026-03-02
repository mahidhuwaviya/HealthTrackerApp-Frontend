/**
 * Calculates the scaled goal based on the active period.
 *
 * - TODAY: dailyGoal × 1
 * - WEEKLY: dailyGoal × (number of days from last Monday up to and including today)
 * - MONTHLY: dailyGoal × (current date number, i.e., day of month)
 * - CUSTOM: dailyGoal × (number of days between customStart and customEnd inclusive)
 */
export function computeScaledGoal(
    dailyGoal: number,
    period: "TODAY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | "",
    customStartDate?: string,
    customEndDate?: string
): number {
    const now = new Date();

    switch (period) {
        case "TODAY":
        case "": {
            return dailyGoal;
        }
        case "WEEKLY": {
            // JS getDay(): 0=Sun, 1=Mon ... 6=Sat. We want Monday = day 1.
            const jsDay = now.getDay(); // 0=Sun
            const daysSinceMonday = jsDay === 0 ? 6 : jsDay - 1; // Mon=0, Tue=1, ... Sun=6
            const dayCount = daysSinceMonday + 1; // inclusive of today
            return dailyGoal * Math.max(dayCount, 1);
        }
        case "MONTHLY": {
            const dayOfMonth = now.getDate(); // 1-31
            return dailyGoal * Math.max(dayOfMonth, 1);
        }
        case "CUSTOM": {
            if (!customStartDate || !customEndDate) return dailyGoal;
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            const diffMs = end.getTime() - start.getTime();
            const diffDays = Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1, 1);
            return dailyGoal * diffDays;
        }
        default:
            return dailyGoal;
    }
}

/** Returns true if the given ISO or YYYY-MM-DD date string is today */
export function isToday(dateStr?: string): boolean {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
    );
}
