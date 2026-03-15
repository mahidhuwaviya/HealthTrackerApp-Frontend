import { AxiosError } from "axios";

/**
 * Extracts a meaningful error message from an API response, AxiosError, or generic Error.
 * Prioritizes backend-provided details and exception names over generic fallback strings.
 */
export const extractErrorMessage = (error: any): string => {
    // 1. If it's not an object (e.g. string or null), return stringified or fallback
    if (!error) return "An unknown error occurred.";
    if (typeof error === "string") return error;

    let exceptionName = "";
    let specificMessage = "";
    let statusCode = "";

    // 2. Check if it's an Axios Error with a response
    const axiosError = error as AxiosError<any>;

    if (axiosError.response) {
        // We have a response from the backend
        const data = axiosError.response.data;
        const status = axiosError.response.status;

        if (status) {
            statusCode = `[Error ${status}]`;
        }
        
        // Attempt to extract from standard Spring / REST formats
        if (data) {
             if (typeof data === "string") {
                 specificMessage = data;
                 exceptionName = status ? `HTTP ${status}` : "";
             } else {
                 // Sometime backends nested it in 'error' or 'exception'
                 exceptionName = data.exception || data.error || (status ? `HTTP ${status}` : "");
                 
                 // Look for specific message text
                 specificMessage = data.message || data.detail || data.trace || "";

                 // If this is a spring validation error 'errors' array
                 if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                     specificMessage = data.errors.map((e: any) => e.defaultMessage || e.msg).join(", ") || specificMessage;
                 }
             }
        }
    } else if (axiosError.request) {
        // Request was made but no response received (Network Error)
        return "Network Error: Could not connect to the server. Please check your connection.";
    }

    // 3. Fallbacks if data parsing failed but we still have an Error object
    if (!exceptionName && !specificMessage) {
        exceptionName = error.name || "";
        specificMessage = error.message || "Something went wrong.";
    }

    // 4. Formatting output wisely
    let finalMessage = "";
    
    // Attempt to string things up cleanly. We don't want "Error: Error"
    if (exceptionName && specificMessage) {
        // If the message already starts with the exception name, avoid duplicate
        if (specificMessage.startsWith(exceptionName)) {
            finalMessage = specificMessage;
        } else {
             finalMessage = `${exceptionName} - ${specificMessage}`;
        }
    } else if (exceptionName) {
        finalMessage = exceptionName;
    } else if (specificMessage) {
        finalMessage = specificMessage;
    } else {
        finalMessage = "An unknown error occurred.";
    }

    // Only prepend status code if we ONLY have standard HTTP fallbacks,
    // otherwise if we know the true Exception message, don't clutter it with "HTTP 500".
    if (statusCode && finalMessage === "An unknown error occurred.") {
         finalMessage = `${statusCode} Server Error`;
    }

    const cleanMessage = finalMessage.replace("HTTP 500 - ", "").replace("HTTP 500", "").trim();

    // Log the extracted error so the user can debug the exact string being returned to the UI toasts
    console.error(`[extractErrorMessage] Final output sent to UI: "${cleanMessage}"`, { 
        rawError: error 
    });

    return cleanMessage;
};
