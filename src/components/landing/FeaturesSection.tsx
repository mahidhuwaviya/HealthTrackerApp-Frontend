export const FeaturesSection = ({ features }) => {
    return (
        <section id="features" className="py-16 md:py-24 relative z-10">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-6">
                        <span className="text-sm text-primary">Features</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Everything You Need for a{" "}
                        <span className="gradient-text">Healthier You</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Powerful tools designed to make health tracking effortless and effective
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 2xl:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card group inner-glow 2xl:p-8"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                                <feature.icon className="w-6 h-6 2xl:w-8 2xl:h-8" />
                            </div>
                            <h3 className="text-xl 2xl:text-2xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground 2xl:text-lg">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
