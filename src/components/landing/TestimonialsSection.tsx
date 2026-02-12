export const TestimonialsSection = ({ testimonials }) => {
    return (
        <section id="testimonials" className="py-16 md:py-24 relative z-10">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-6">
                        <span className="text-sm text-primary">Testimonials</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-bold mb-4">
                        Loved by <span className="gradient-text">Thousands</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto 2xl:text-xl">
                        See what our community has to say about their experience with HealthTrack
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="glass-card p-6 inner-glow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-semibold text-primary-foreground">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold">{testimonial.name}</div>
                                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                </div>
                            </div>
                            <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
