export const BenefitsSection = ({ benefits }) => {
    return (
        <section id="benefits" className="py-16 md:py-24 relative z-10">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="glass-card p-8 rounded-3xl inner-glow">
                            <img
                                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80"
                                alt="Smart fitness tracking"
                                loading="lazy"
                                className="rounded-2xl w-full"
                            />
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30">
                            <span className="text-sm text-primary">Why Choose Us</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-bold">
                            The Smart Way to Track{" "}
                            <span className="gradient-text">Your Health</span>
                        </h2>

                        <p className="text-lg text-muted-foreground 2xl:text-xl">
                            HealthTrack is designed for real people with real goals. We combine powerful features with an intuitive interface that makes staying healthy feel effortless.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <benefit.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold">{benefit.title}</h3>
                                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
