import { AxiosError } from "axios";

// Helper to translate dry, technical backend errors into user-friendly justifying messages for toasts.
const getJustifyingMessage = (rawMessage: string, status?: number): string => {
    if (!rawMessage) return "We couldn't process your request right now. Please try again.";
    
    const lowerRaw = rawMessage.toLowerCase();
    
    // Profile & Auth
    if (lowerRaw.includes("profile not found")) return "We couldn't find your profile. Please complete your setup to continue.";
    if (lowerRaw.includes("bad credentials") || lowerRaw.includes("invalid password")) return "Incorrect email or password. Please try again.";
    if (lowerRaw.includes("user not found")) return "We couldn't find an account with that email.";
    if (lowerRaw.includes("jwt") || lowerRaw.includes("token") || lowerRaw.includes("expired")) return "Your session has expired. Please securely log in again.";
    
    // Verification
    if (lowerRaw.includes("invalid verification code") || lowerRaw.includes("otp") || lowerRaw.includes("verification code")) return "The verification code is incorrect or has expired.";
    
    // Data & Validation
    if (lowerRaw.includes("already exists") || lowerRaw.includes("duplicate")) return "This information is already registered in our system.";
    if (lowerRaw.includes("invalid") || lowerRaw.includes("validation")) return "Please check your form inputs for any missing or incorrect data.";
    
    // Server Exceptions and technical jargon
    if (
        status === 500 || 
        lowerRaw.includes("exception") || 
        lowerRaw.includes("internal server") || 
        lowerRaw.includes("sql") ||
        lowerRaw.includes("nullpointer")
    ) {
        return "We're experiencing a temporary service issue. Please try again in a moment.";
    }
    
    // If it's a short, moderately clean string without blatant java technicalities, show it.
    if (rawMessage.length < 60 && !lowerRaw.includes("java.") && !lowerRaw.includes("error")) {
        return rawMessage.replace(/Exception occured:/ig, "").trim();
    }
    
    return "Something went wrong while processing your request. Please try again.";
};

/**
 * Extracts a meaningful error message from an API response, AxiosError, or generic Error.
 * Translates backend technical details into user-friendly UI messages, whilst logging the true error down to the console.
 */
export const extractErrorMessage = (error: any): string => {
    // 1. If it's not an object (e.g. string or null), return stringified or fallback
    if (!error) return "An unknown error occurred.";
    if (typeof error === "string") return error;

    let exceptionName = "";
    let specificMessage = "";
    let statusCode: number | undefined;

    // 2. Check if it's an Axios Error with a response
    const axiosError = error as AxiosError<any>;

    if (axiosError.response) {
        // We have a response from the backend
        const data = axiosError.response.data;
        statusCode = axiosError.response.status;

        // Attempt to extract from standard Spring / REST formats
        if (data) {
             if (typeof data === "string") {
                 specificMessage = data;
             } else {
                 // Sometime backends nested it in 'error' or 'exception'
                 exceptionName = data.exception || data.error || "";
                 
                 // Look for specific message text
                 specificMessage = data.message || data.detail || data.trace || "";

                 // If this is a spring validation error 'errors' array
                 if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                     specificMessage = data.errors.map((e: any) => e.defaultMessage || e.msg).join(", ") || specificMessage;
                 }
             }
        }
    } else if (axiosError.request) {
        console.error("[Network Check] Request failed with no response", error);
        return "Could not connect to the server. Please check your internet connection.";
    }

    // 3. Fallbacks if data parsing failed but we still have an Error object
    if (!exceptionName && !specificMessage) {
        exceptionName = error.name || "";
        specificMessage = error.message || "Something went wrong.";
    }

    // 4. Formatting output wisely for the Developer Console
    let rawBackendString = "";
    
    if (exceptionName && specificMessage) {
        if (specificMessage.startsWith(exceptionName)) {
            rawBackendString = specificMessage;
        } else {
             rawBackendString = `${exceptionName} - ${specificMessage}`;
        }
    } else if (exceptionName) {
        rawBackendString = exceptionName;
    } else if (specificMessage) {
        rawBackendString = specificMessage;
    } else {
        rawBackendString = "An unknown backend error occurred.";
    }

    // Log the exact raw error and the backend string to the console for developers!
    console.error(`[API Exception] Backend reported: "${rawBackendString}"`, { 
        statusCode,
        fullErrorObject: error 
    });

    // Return a friendly, justifying message to the UI toast
    return getJustifyingMessage(rawBackendString, statusCode);
};
