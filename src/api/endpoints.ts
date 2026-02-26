export const API_ROUTES = {
    AUTH: {
        LOGIN: "/api/auth/userVerification",
        REGISTER: "/api/auth/userRegistration",
        GOOGLE_AUTH: "/oauth2/authorization/google",
        FORGOT_PASSWORD: "/api/auth/forgetpassword",
        LOGOUT: "/api/logout",
    },
    USER: {
        INFO: "/api/userData",
        PROFILE_UPDATE: "/api/userProfileData/update",
        PROFILE_SAVE: "/api/userProfileData/submit",
        PROFILE_GET_PROFILE: "/api/userProfileData/getUserProfileData",
    },
    STATS: {
        DAILY: "/api/stats/daily", // Returns consolidated dashboard stats
        WEEKLY: "/api/stats/weekly",
    },
    DASHBOARD: {
        SUMMARY: "/api/dashboard/summary/today",
        SUMMARY_PARTICULAR: "/api/dashboard/summary/getParticularSummary",
    },
    MEALS: {
        LOG: "/api/meal/logMeal", // POST to log, GET to list today's
        SEARCH: "/api/meal/search",
        HISTORY: "/api/meal/mealLogSummary",
    },
    WORKOUTS: {
        LOG: "/api/workouts/logExercise",
        HISTORY: "/api/workouts/history",
        SEARCH: "/api/workouts/search"
    },
    WATER: {
        LOG: "/api/water/waterLog",
        HISTORY: "/api/water/history",
    },
    STEPS: {
        LOG: "/api/steps",
        HISTORY: "/api/steps/history",
    }
};
