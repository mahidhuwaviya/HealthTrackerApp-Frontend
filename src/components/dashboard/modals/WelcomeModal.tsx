import { useState, useEffect } from "react";
import { X, Activity, Zap, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartSetup: () => void;
}

export const WelcomeModal = ({ isOpen, onClose, onStartSetup }: WelcomeModalProps) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Modal Content */}
            <div className="relative w-[90%] md:w-full md:max-w-5xl bg-card rounded-3xl shadow-2xl p-6 md:p-12 animate-in fade-in zoom-in-95 duration-300 border border-border/50 max-h-[90vh] overflow-y-auto custom-scrollbar">

                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground/90">
                        Unlock Personalized Insights!
                    </h2>
                    <p className="text-xl text-red-500 font-medium">
                        Please complete your profile for accurate data
                    </p>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

                    {/* Card 1: Biometrics */}
                    <div className="flex flex-col items-center p-8 rounded-[2rem] bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300">
                        <div className="w-20 h-20 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                            <Activity className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground/80 mb-8 text-center">
                            Complete Biometrics
                        </h3>
                        <Button
                            onClick={onStartSetup}
                            className="w-full py-6 text-lg bg-[#2D3648] hover:bg-[#2D3648]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Start Now
                        </Button>
                    </div>

                    {/* Card 2: Goals */}
                    <div className="flex flex-col items-center p-8 rounded-[2rem] bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300">
                        <div className="w-20 h-20 rounded-3xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                            <Zap className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground/80 mb-8 text-center">
                            Set Your Goal
                        </h3>
                        <Button
                            onClick={onStartSetup}
                            className="w-full py-6 text-lg bg-[#2D3648] hover:bg-[#2D3648]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Start Now
                        </Button>
                    </div>

                    {/* Card 3: Health */}
                    <div className="flex flex-col items-center p-8 rounded-[2rem] bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300">
                        <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6">
                            <Plus className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground/80 mb-8 text-center">
                            Health & Preferences
                        </h3>
                        <Button
                            onClick={onStartSetup}
                            className="w-full py-6 text-lg bg-[#2D3648] hover:bg-[#2D3648]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Start Now
                        </Button>
                    </div>

                </div>

                {/* Info Banner */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl mb-8">
                    <Info className="w-5 h-5 shrink-0" />
                    <p className="font-medium">
                        Skipping may lead to less accurate recommendations.
                    </p>
                </div>

                {/* Footer Action */}
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        onClick={onClose}
                        className="bg-[#1A202C] hover:bg-[#1A202C]/90 text-white px-8 py-6 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        Skip For Now
                    </Button>
                </div>

            </div>
        </div>
    );
};
