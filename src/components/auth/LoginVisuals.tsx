import { Check, Zap, Shield } from "lucide-react";

export const LoginVisuals = () => {
    const features = [
        { icon: Check, title: "Track Everything", description: "Meals, workouts, steps, calories, and medical appointments in one place" },
        { icon: Zap, title: "Lightning Fast", description: "Designed for efficiency - log your data in seconds, not minutes" },
        { icon: Shield, title: "Private & Secure", description: "Your health data is encrypted and never shared with third parties" },
    ];

    return (
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop&q=80')"
                }}
            />

            {/* Organic shapes overlay */}
            <div className="absolute inset-0">
                <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 organic-blob" />
                <div className="absolute bottom-40 left-20 w-24 h-24 bg-accent/10 organic-blob" style={{ animationDelay: "-2s" }} />
            </div>

            <div className="relative z-10 flex flex-col justify-center p-16 max-w-xl">
                <h2 className="text-4xl font-bold mb-4">
                    Your Health Journey <span className="gradient-text">Starts Here</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-12">
                    Join thousands of users who are transforming their lives with personalized health tracking.
                </p>

                <div className="space-y-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
