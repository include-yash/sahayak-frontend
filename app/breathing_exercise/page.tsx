"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BreathingExercisePage() {
    const [phase, setPhase] = useState("Breathe In");
    const [isRunning, setIsRunning] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        if (!isRunning) return;

        function cyclePhases() {
            setPhase("Breathe In");
            const holdTimeout = setTimeout(() => setPhase("Hold"), 3000);
            const exhaleTimeout = setTimeout(() => setPhase("Breathe Out"), 7000);
            timeoutRefs.current.push(holdTimeout, exhaleTimeout);
        }

        cyclePhases();
        intervalRef.current = setInterval(cyclePhases, 14000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            timeoutRefs.current.forEach((t) => clearTimeout(t));
            timeoutRefs.current = [];
        };
    }, [isRunning]);

    const handleStop = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timeoutRefs.current.forEach((t) => clearTimeout(t));
    };

    const handleStart = () => {
        setPhase("Breathe In");
        setIsRunning(true);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className={cn(
            "h-screen flex flex-col items-center justify-center transition-colors duration-300 overflow-hidden",
            darkMode
                ? "bg-black"
                : "bg-gradient-to-br from-amber-50 via-orange-100 to-amber-100"
        )}>
            <div className="absolute top-4 right-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}
                >
                    {darkMode ? (
                        <Sun size={24} className="text-white" />
                    ) : (
                        <Moon size={24} />
                    )}
                </Button>
            </div>

            <div className="container mx-auto px-4 text-center mb-4">
                <h1 className={cn(
                    "mb-2 text-4xl font-bold md:text-5xl",
                    darkMode ? "text-white" : "text-gray-900"
                )}>
                    Breathing Exercise{" "}
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        Relax
                    </span>
                </h1>
                <p className={cn(
                    "mx-auto max-w-3xl text-lg",
                    darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                    Follow the rhythm of your breath and let your mind settle.
                </p>
            </div>

            {isRunning ? (
                <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                        "relative w-16 h-64 border rounded-full overflow-hidden",
                        darkMode
                            ? "bg-gray-800/40 border-orange-500/20"
                            : "bg-amber-100/40 border-orange-500/30"
                    )}>
                        <motion.div
                            key={phase}
                            className="absolute bottom-0 w-full h-full bg-gradient-to-t from-amber-500 to-orange-500"
                            style={{ transformOrigin: "bottom" }}
                            initial={{ scaleY: phase === "Breathe In" ? 0.2 : 1 }}
                            animate={{
                                scaleY:
                                    phase === "Breathe In" ? 1 :
                                        phase === "Hold" ? 1 :
                                            phase === "Breathe Out" ? 0.2 : 0.2,
                            }}
                            transition={{
                                duration:
                                    phase === "Breathe In" ? 3 :
                                        phase === "Hold" ? 4 :
                                            phase === "Breathe Out" ? 7 : 0,
                                ease: "easeInOut",
                            }}
                        />
                    </div>

                    <div>
                        <h2 className={cn(
                            "text-2xl font-bold",
                            darkMode ? "text-orange-400" : "text-orange-600"
                        )}>
                            {phase}
                        </h2>
                    </div>

                    <div>
                        <Button
                            onClick={handleStop}
                            className={cn(
                                "bg-gradient-to-r from-amber-500 to-orange-500",
                                "hover:from-amber-600 hover:to-orange-600 text-white"
                            )}
                        >
                            Stop Exercise
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <h2 className={cn(
                        "text-2xl font-bold",
                        darkMode ? "text-orange-400" : "text-orange-600"
                    )}>
                        Exercise Ended. Feel the calm!
                    </h2>
                    <div>
                        <Button
                            onClick={handleStart}
                            className={cn(
                                "bg-gradient-to-r from-amber-500 to-orange-500",
                                "hover:from-amber-600 hover:to-orange-600 text-white"
                            )}
                        >
                            Start Again
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}