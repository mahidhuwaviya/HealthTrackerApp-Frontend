export const API_ROUTES = {
    AUTH: {
        LOGIN: "/api/auth/userVerification",
        REGISTER: "/api/auth/userRegistration",
        GOOGLE_AUTH: "/oauth2/authorization/google",
        FORGOT_PASSWORD: "/api/auth/forgetpassword",
        LOGOUT: "/api/logout",
        GET_OTP: "/api/auth/getOtp",
        // VERIFY_OTP: "/api/auth/verifyOtp",
        UPDATE_PASSWORD: "/api/auth/UpdatePassword",
        UPDATE_EMAIL: "/api/auth/UpdateEmail",
    },
    ADMIN: {
        GET_ALL_USERS: "/api/admin/getAllUsers",
        GET_USER: "/api/admin/getUser",
        DELETE_USER: "/api/admin/deleteUserData",
    },
    USER: {
        INFO: "/api/userData",
        PROFILE_UPDATE: "/api/userProfileData/update",
        PROFILE_SAVE: "/api/userProfileData/submit",
        PROFILE_GET_PROFILE: "/api/userProfileData/getUserProfileData",
        UPDATE_USERNAME: "/api/updateUserName",
        DELETE_ACCOUNT: "/api/userAccountDelete",
    },
    STATS: {
        DAILY: "/api/stats/daily",
        WEEKLY: "/api/stats/weekly",
    },
    DASHBOARD: {
        SUMMARY: "/api/dashboard/summary/today",
        SUMMARY_PARTICULAR: "/api/dashboard/summary/getParticularSummary",
    },
    MEALS: {
        LOG: "/api/meal/logMeal",
        SEARCH: "/api/meal/search",
        // HISTORY: "/api/meal/mealLogSummary",
        DELETE: "/api/meal/deleteParticularEntry",
    },
    WORKOUTS: {
        LOG: "/api/workouts/logExercise",
        // HISTORY: "/api/workouts/history",
        SEARCH: "/api/workouts/search",
        DELETE: "/api/workouts/deleteParticularEntry",
    },
    WATER: {
        LOG: "/api/water/waterLog",
        // HISTORY: "/api/water/history",
        DELETE: "/api/water/deleteParticularEntry",
    },
    STEPS: {
        LOG: "/api/walking/sync",
        // HISTORY: "/api/steps/history",
    },
    // DeleteParticularEntry: {
    //     MEAL: "/api/meal/deleteParticularEntry",
    //     WORKOUT: "/api/workouts/deleteParticularEntry",
    //     WATER: "/api/water/deleteParticularEntry",
    //     STEPS: "/api/steps/deleteParticularEntry"
    // }
};
