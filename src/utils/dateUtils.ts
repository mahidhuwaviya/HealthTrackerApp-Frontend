export const formatDashboardDate = (dateVal: any, timeVal?: any): string => {
    try {
        let d: Date | null = null;

        // Handle Spring Boot LocalDateTime array format: [YYYY, MM, DD, HH, mm, ss, ...]
        if (Array.isArray(dateVal)) {
            if (dateVal.length >= 3) {
                d = new Date(
                    dateVal[0], 
                    dateVal[1] - 1, 
                    dateVal[2], 
                    dateVal[3] || 0, 
                    dateVal[4] || 0, 
                    dateVal[5] || 0
                );
            }
        } else if (dateVal) {
            d = new Date(dateVal);
        }

        // If time is provided separately (e.g., WaterView sometimes uses separate logDate and logTime strings)
        if (d && !isNaN(d.getTime()) && timeVal && typeof timeVal === 'string') {
            const timeParts = timeVal.split(':');
            if (timeParts.length >= 2) {
                d.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10));
            }
        }

        if (d && !isNaN(d.getTime())) {
            return d.toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Fallback to raw string concatenation if parsing fails nicely
        if (dateVal && typeof dateVal === 'string' && timeVal && typeof timeVal === 'string') {
            return `${dateVal} ${timeVal}`;
        }
        if (dateVal && typeof dateVal === 'string') {
            return dateVal;
        }

    } catch (e) {
        console.error("Error formatting date:", e);
    }
    return '-';
};
