import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
    return (
        <section className="py-16 md:py-24 relative z-10">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="ai-card p-12 md:p-16 text-center">
                    <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-bold mb-4">
                        Ready to Start Your{" "}
                        <span className="gradient-text-ai">Health Journey</span>?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 2xl:text-xl">
                        Join over 500,000 users who are already tracking their way to a healthier, happier life. Start your free 14-day trial today—no credit card required.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Link to="/login">
                            <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5 text-lg px-8">
                            Learn More
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            14-day free trial
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            No credit card required
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            Cancel anytime
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
