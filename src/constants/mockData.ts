// Centralized mock data for the application

export const LANDING_FEATURES = [
    { icon: "Flame", title: "Meal Logging", description: "Track your nutrition with our extensive food database. Log meals in seconds and monitor your daily intake.", color: "text-calories" },
    { icon: "Activity", title: "Workout Tracker", description: "Record your exercises, sets, and reps. Get personalized workout recommendations based on your goals.", color: "text-primary" },
    { icon: "Footprints", title: "Walking Tracker", description: "Monitor your daily steps automatically. Set goals and celebrate milestones as you stay active.", color: "text-steps" },
    { icon: "Droplets", title: "Water Intake", description: "Stay hydrated with smart reminders. Track your daily water consumption and build healthy habits.", color: "text-water" },
    { icon: "Heart", title: "Heart Rate Monitor", description: "Keep track of your heart health with real-time monitoring and historical data analysis.", color: "text-heart" },
    { icon: "Calendar", title: "Health Checkups", description: "Schedule and manage your medical appointments. Never miss an important health checkup again.", color: "text-accent" },
];

export const LANDING_BENEFITS = [
    { icon: "TrendingUp", title: "See Real Progress", description: "Visual charts and insights help you understand your health journey at a glance" },
    { icon: "Users", title: "Join a Community", description: "Connect with millions of users on the same health and fitness journey" },
    { icon: "Shield", title: "Privacy First", description: "Your health data is encrypted and secure. We never sell your information" },
    { icon: "Smartphone", title: "Use Anywhere", description: "Seamlessly sync across all your devices with our mobile and web apps" },
];

export const LANDING_TESTIMONIALS = [
    { name: "Sarah M.", role: "Fitness Enthusiast", quote: "HealthTrack completely transformed how I approach my fitness goals. The AI insights are incredibly helpful!", avatar: "SM" },
    { name: "James R.", role: "Marathon Runner", quote: "The step tracking and workout features are top-notch. Best health app I've ever used.", avatar: "JR" },
    { name: "Emily K.", role: "Nutritionist", quote: "I recommend HealthTrack to all my clients. The meal logging feature is comprehensive and easy to use.", avatar: "EK" },
];

export const APP_NAV_ITEMS = [
    { icon: "LayoutDashboard", label: "Dashboard", href: "/dashboard" },
    { icon: "Utensils", label: "Meals", href: "/dashboard/meals" },
    { icon: "Droplets", label: "Water Intake", href: "/dashboard/water" },
    { icon: "Dumbbell", label: "Workouts", href: "/dashboard/workouts" },
    { icon: "Footprints", label: "Step Counter", href: "/dashboard/steps" },
    { icon: "HeartPulse", label: "Health Overview", href: "/dashboard/health" },
];

export const MOCK_HEALTH_DATA = {
    bloodPressure: "120/80",
    bodyFat: "15%",
    workoutEnvironment: "Commercial Gym"
};
