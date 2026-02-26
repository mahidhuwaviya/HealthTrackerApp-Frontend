import { Link } from "wouter";
import { Sparkles, ArrowRight, Droplets, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-athlete.jpg";

export const HeroSection = () => {
    return (
        <section className="relative pt-24 pb-16 md:pt-40 md:pb-24 2xl:pt-48 2xl:pb-32 overflow-hidden">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary">Your Personal Health Companion</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl 2xl:text-8xl font-bold leading-tight tracking-tight">
                            Track Your Health,{" "}
                            <span className="gradient-text">Transform</span> Your Life
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-lg 2xl:max-w-2xl 2xl:text-xl">
                            Log meals, track workouts, monitor steps, count calories, and schedule medical checkups—all in one efficient, easy-to-use platform.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/login">
                                <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5 text-lg px-8">
                                Watch Demo
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex -space-x-3">
                                {["SM", "JR", "EK", "MK"].map((initials, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs font-medium">
                                        {initials}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="text-primary font-semibold">500K+</span> users tracking their health
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="relative z-10">
                            <img
                                src={heroImage}
                                alt="Fitness athlete"
                                loading="lazy"
                                className="rounded-3xl shadow-2xl animate-float"
                            />
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl -z-10" />
                        </div>

                        {/* Floating stat cards */}
                        <div className="absolute -left-8 top-1/4 glass-card p-4 animate-fade-in inner-glow" style={{ animationDelay: "0.2s" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-water/20 flex items-center justify-center">
                                    <Droplets className="w-5 h-5 text-water" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Water</div>
                                    <div className="font-semibold">2.4L / 3L</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-4 bottom-1/4 glass-card p-4 animate-fade-in inner-glow" style={{ animationDelay: "0.4s" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-steps/20 flex items-center justify-center">
                                    <Footprints className="w-5 h-5 text-steps" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Steps</div>
                                    <div className="font-semibold">8,432</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
