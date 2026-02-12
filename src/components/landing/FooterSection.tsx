import { Link } from "wouter";
import { Activity } from "lucide-react";

export const FooterSection = () => {
    return (
        <footer className="border-t border-primary/10 py-12 relative z-10">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">HealthTrack</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Your all-in-one platform for tracking meals, workouts, steps, calories, and medical checkups.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Mobile App</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 HealthTrack. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            Twitter
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            LinkedIn
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
