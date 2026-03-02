import { Activity, Droplets, Flame, Heart, Footprints, Calendar, TrendingUp, Users, Shield, Smartphone } from "lucide-react";
import { NavigationHeader } from "@/components/landing/NavigationHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
import { FooterSection } from "@/components/landing/FooterSection";

import { LANDING_FEATURES, LANDING_BENEFITS, LANDING_TESTIMONIALS } from "@/constants/mockData";

const LandingPage = () => {
  const mapIcon = (iconStr: string) => {
    switch (iconStr) {
      case "Flame": return Flame;
      case "Activity": return Activity;
      case "Footprints": return Footprints;
      case "Droplets": return Droplets;
      case "Heart": return Heart;
      case "Calendar": return Calendar;
      case "TrendingUp": return TrendingUp;
      case "Users": return Users;
      case "Shield": return Shield;
      case "Smartphone": return Smartphone;
      default: return Activity;
    }
  };

  const features = LANDING_FEATURES.map(f => ({ ...f, icon: mapIcon(f.icon) }));
  const benefits = LANDING_BENEFITS.map(b => ({ ...b, icon: mapIcon(b.icon) }));
  const testimonials = LANDING_TESTIMONIALS;

  return (
    <div className="min-h-screen bg-background relative w-full">
      {/* Organic background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[clamp(300px,80vw,500px)] h-[clamp(300px,80vw,500px)] bg-primary/5 organic-blob" />
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
