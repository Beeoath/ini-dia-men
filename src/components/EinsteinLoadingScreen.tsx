import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface EinsteinLoadingScreenProps {
  label?: string;
  duration?: number; // duration in ms for progress (e.g. 2500ms)
  onComplete?: () => void;
  fullscreen?: boolean;
  allowSkip?: boolean;
  className?: string;
}

export const EinsteinLoadingScreen: React.FC<EinsteinLoadingScreenProps> = ({
  label = "LOADING",
  duration = 2600,
  onComplete,
  fullscreen = true,
  allowSkip = true,
  className = "",
}) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  // Animated dots: . -> .. -> ...
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(dotTimer);
  }, []);

  // Smooth progress bar counter
  useEffect(() => {
    const stepTime = 30;
    const totalSteps = duration / stepTime;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        if (onComplete) {
          const t = setTimeout(() => {
            onComplete();
          }, 350);
          return () => clearTimeout(t);
        }
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  // Optional skip handler (requires explicit button click or keypress)
  const handleSkip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (allowSkip && onComplete) {
      onComplete();
    }
  };

  return (
    <div
      id="einstein-loading-screen"
      className={`relative w-full h-full overflow-hidden select-none flex flex-col items-center justify-between ${
        fullscreen ? "fixed inset-0 z-[99999] w-screen h-screen bg-[#070b10]" : "min-h-[600px] bg-[#070b10] rounded-2xl"
      } ${className}`}
    >
      {/* 1. BACKGROUND: Clean 16:9 Einstein Chalkboard Image (NO Korean text) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/assets/einstein_loading_screen.jpg"
          alt="Albert Einstein Physics Chalkboard Loading Screen"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Subtle cinematic vignette at borders to focus gaze on Einstein portrait */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* TOP: Subtle skip button */}
      <div className="relative z-10 w-full pt-6 px-8 flex justify-end">
        {allowSkip && (
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-3.5 py-1 text-[11px] font-mono tracking-widest text-white/60 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            [LEWATI] &rarr;
          </button>
        )}
      </div>

      {/* MIDDLE: Space for Einstein's portrait in the center (unobscured) */}
      <div className="relative z-10 flex-1 w-full" />

      {/* BOTTOM: EXACT POSITION OF THE ORIGINAL KOREAN TEXT REPLACED BY CLEAN LOADING ANIMATION */}
      {/* In the original image: directly below the wooden frame, there is a small vertical cyan tick, then "철학자", then "알버트 아인슈타인" */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center pb-10 sm:pb-14 px-4 pointer-events-none">
        <div className="flex flex-col items-center text-center">
          
          {/* 1. Small Cyan Tick Mark (Faithfully matching the original UI mark) */}
          <div className="w-0.5 h-3.5 bg-cyan-400/80 rounded-full mb-2 shadow-[0_0_8px_#38bdf8] animate-pulse" />

          {/* 2. Top Label (Replaces "철학자" with animated glowing LOADING indicator) */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs tracking-[0.28em] text-cyan-300 font-semibold uppercase">
            <span>{label}</span>
            <span className="inline-block w-4 text-left font-bold text-amber-300">{dots}</span>
          </div>

          {/* 3. Main Loading Animation (Replaces "알버트 아인슈타인" with sleek progress bar + percentage) */}
          <div className="mt-2.5 flex flex-col items-center gap-2">
            {/* Sleek, glowing thin progress line */}
            <div className="w-48 sm:w-64 h-1.5 bg-black/50 border border-white/15 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-sm p-[1px]">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-400 rounded-full relative shadow-[0_0_10px_#f59e0b]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.15 }}
              >
                {/* Shimmer line */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
              </motion.div>
            </div>

            {/* Subtle percentage & relativistic indicator */}
            <div className="flex items-center justify-between w-48 sm:w-64 font-mono text-[10px] text-amber-200/60 tracking-wider">
              <span>E = mc²</span>
              <span className="font-semibold text-white/80">{progress}%</span>
              <span>ΔxΔp ≥ ℏ/2</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
