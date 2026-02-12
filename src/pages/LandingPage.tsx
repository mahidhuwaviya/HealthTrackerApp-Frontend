import { Activity, Droplets, Flame, Heart, Footprints, Calendar, TrendingUp, Users, Shield, Smartphone } from "lucide-react";
import { NavigationHeader } from "@/components/landing/NavigationHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
import { FooterSection } from "@/components/landing/FooterSection";

const LandingPage = () => {
  const features = [
    { icon: Flame, title: "Meal Logging", description: "Track your nutrition with our extensive food database. Log meals in seconds and monitor your daily intake.", color: "text-calories" },
    { icon: Activity, title: "Workout Tracker", description: "Record your exercises, sets, and reps. Get personalized workout recommendations based on your goals.", color: "text-primary" },
    { icon: Footprints, title: "Walking Tracker", description: "Monitor your daily steps automatically. Set goals and celebrate milestones as you stay active.", color: "text-steps" },
    { icon: Droplets, title: "Water Intake", description: "Stay hydrated with smart reminders. Track your daily water consumption and build healthy habits.", color: "text-water" },
    { icon: Heart, title: "Heart Rate Monitor", description: "Keep track of your heart health with real-time monitoring and historical data analysis.", color: "text-heart" },
    { icon: Calendar, title: "Health Checkups", description: "Schedule and manage your medical appointments. Never miss an important health checkup again.", color: "text-accent" },
  ];

  const benefits = [
    { icon: TrendingUp, title: "See Real Progress", description: "Visual charts and insights help you understand your health journey at a glance" },
    { icon: Users, title: "Join a Community", description: "Connect with millions of users on the same health and fitness journey" },
    { icon: Shield, title: "Privacy First", description: "Your health data is encrypted and secure. We never sell your information" },
    { icon: Smartphone, title: "Use Anywhere", description: "Seamlessly sync across all your devices with our mobile and web apps" },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "Fitness Enthusiast", quote: "HealthTrack completely transformed how I approach my fitness goals. The AI insights are incredibly helpful!", avatar: "SM" },
    { name: "James R.", role: "Marathon Runner", quote: "The step tracking and workout features are top-notch. Best health app I've ever used.", avatar: "JR" },
    { name: "Emily K.", role: "Nutritionist", quote: "I recommend HealthTrack to all my clients. The meal logging feature is comprehensive and easy to use.", avatar: "EK" },
  ];

  return (
    <div className="min-h-screen bg-background relative w-full">
      {/* Organic background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 organic-blob" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-accent/5 organic-blob" style={{ animationDelay: "-4s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 organic-blob" style={{ animationDelay: "-2s" }} />
      </div>

      <NavigationHeader />
      <HeroSection />
      <FeaturesSection features={features} />
      <BenefitsSection benefits={benefits} />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
