import { useState } from "react";
import { Link } from "wouter";
import { Activity, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NavigationHeader = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 bg-background/60 backdrop-blur-xl transition-all duration-300">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl 2xl:text-2xl font-bold">HealthTrack</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8 2xl:gap-10">
                        <a href="#features" className="nav-link 2xl:text-lg">Features</a>
                        <a href="#benefits" className="nav-link 2xl:text-lg">Benefits</a>
                        <a href="#testimonials" className="nav-link 2xl:text-lg">Testimonials</a>
                    </div>

                    <div className="hidden md:flex items-center gap-4 2xl:gap-6">
                        <Link to="/login">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground 2xl:text-lg">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 2xl:text-lg 2xl:px-6">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-primary/10 pt-4 animate-fade-in">
                        <div className="flex flex-col gap-4">
                            <a href="#features" className="nav-link py-2">Features</a>
                            <a href="#benefits" className="nav-link py-2">Benefits</a>
                            <a href="#testimonials" className="nav-link py-2">Testimonials</a>
                            <Link to="/login" className="w-full">
                                <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                            </Link>
                            <Link to="/login" className="w-full">
                                <Button className="w-full btn-glow">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
