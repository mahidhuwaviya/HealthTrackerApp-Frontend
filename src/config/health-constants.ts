/**
 * Global Health & Fitness Constants
 * Centralized source of truth for all fallback values, goals, and static mappings.
 */

export const HEALTH_DEFAULTS = {
    CALORIES_GOAL: 2000,
    WATER_GOAL_ML: 2000,
    STEPS_GOAL: 10000,
    WORKOUT_GOAL_MINS: 45,
};

export const UI_STRINGS = {
    AUTH: {
        FORGOT_PASSWORD_TOAST: "Password reset instructions have been sent to your email.",
        LOGIN_WELCOME: "Welcome back!",
        SIGNUP_SUCCESS: "Account created! Start your journey now.",
    },
    DASHBOARD: {
        NO_ACTIVITY: "No activity yet today.",
    }
};

export const AUTH_VALIDATION = {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Enum Mappings for display labels to avoid hardcoding in components
export const ENUM_LABELS = {
    HEALTH_CONDITIONS: {
        NONE: "None",
        DIABETES: "Diabetes",
        HYPERTENSION: "Hypertension",
        ASTHMA: "Asthma",
        HEART_DISEASE: "Heart Disease",
        KIDNEY_DISEASE: "Kidney Disease",
        ARTHRITIS: "Arthritis",
        PREGNANCY: "Pregnancy",
        OTHER: "Other"
    },
    DIETARY_PREFERENCES: {
        NO_PREFERENCE: "Classic",
        VEGETARIAN: "Vegetarian",
        VEGAN: "Vegan",
        KETO: "Keto",
        PALEO: "Paleo",
        GLUTEN_FREE: "Gluten-Free",
        PESCATARIAN: "Pescatarian"
    },
    WORKOUT_ENVIRONMENTS: {
        GYM: "Commercial Gym",
        HOME: "Home (No Equipment)",
        HOME_GYM: "Home (Dumbbells)",
        OUTDOOR: "Outdoor / Park",
        PILATES: "Pilates"
    },
    GOALS: {
        WEIGHT_LOSS: "Weight Loss",
        MUSCLE_GAIN: "Muscle Gain",
        MAINTENANCE: "Maintenance",
        ATHLETIC_PERFORMANCE: "Athletic Performance"
    },
    ACTIVITY_LEVELS: {
        SEDENTARY: { label: "Sedentary", desc: "Little to no exercise" },
        LIGHTLY_ACTIVE: { label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
        MODERATELY_ACTIVE: { label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
        VERY_ACTIVE: { label: "Very Active", desc: "Hard exercise 6-7 days/week" }
    }
};
