import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface GlassLoaderProps {
    state?: "fetching" | "processing";
    message?: string;
    className?: string;
}

export const GlassLoader: React.FC<GlassLoaderProps> = ({
    state = "fetching",
    message = "Loading...",
    className,
}) => {
    const [particles, setParticles] = useState<{ id: number; tx: string; ty: string; delay: string }[]>([]);

    useEffect(() => {
        // Generate random particle trajectories for the 'emit' effect
        const newParticles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            tx: `${(Math.random() - 0.5) * 300}px`,
            ty: `${(Math.random() - 0.5) * 300}px`,
            delay: `${Math.random() * 2}s`,
        }));
        setParticles(newParticles);
    }, [state]);

    useEffect(() => {
        // Body Overflow Management
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const loaderContent = (
        <div
            className={cn(
                "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1A1A15] backdrop-blur-md",
                className
            )}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <div className="nucleus-wrapper">
                {/* 3D Wireframe Mesh */}
                <div className={cn("wireframe-mesh", state === "processing" && "processing")} />

                {/* Central Glowing Orb - The 'Nucleus Glow' pulse (#D4C555) */}
                <div className="nucleus-orb" />

                {/* Golden Particles (only during processing) */}
                {state === "processing" && (
                    <div className="nucleus-particles">
                        {particles.map((p) => (
                            <div
                                key={p.id}
                                className="golden-particle"
                                style={
                                    {
                                        "--tx": p.tx,
                                        "--ty": p.ty,
                                        animationDelay: p.delay,
                                        left: "50%",
                                        top: "50%",
                                    } as React.CSSProperties
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Loading Text */}
            <div className="loading-text">
                {message}
            </div>
        </div>
    );

    return createPortal(loaderContent, document.body);
};

export default GlassLoader;
