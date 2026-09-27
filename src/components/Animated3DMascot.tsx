import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";
import { MASCOTS } from "../lib/brand";

interface Animated3DMascotProps {
  className?: string;
}

export const Animated3DMascot: React.FC<Animated3DMascotProps> = ({
  className = "",
}) => {
  const [selectedKey, setSelectedKey] = useState<"alpha" | "beta" | "gamma">("alpha");
  const mascotKeys: ("alpha" | "beta" | "gamma")[] = ["alpha", "beta", "gamma"];
  const current = MASCOTS[selectedKey] || MASCOTS.alpha;

  const getThemeColor = () => {
    if (selectedKey === "alpha") return { hex: "#00F0FF", glow: "rgba(0, 240, 255, 0.4)" };
    if (selectedKey === "beta") return { hex: "#FF007A", glow: "rgba(255, 0, 122, 0.4)" };
    return { hex: "#FFD600", glow: "rgba(255, 214, 0, 0.4)" };
  };
  const theme = getThemeColor();

  return (
    <div className={`relative flex flex-col items-center max-w-sm select-none ${className}`}>
      {/* 3D Floating Mascot Card */}
      <div className="relative h-[280px] sm:h-[320px] w-[210px] sm:w-[240px] rounded-[2rem] border border-white/20 bg-gradient-to-b from-[#111e42]/80 to-[#070b18]/95 p-2 shadow-2xl backdrop-blur-md group">
        <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-[#090e21]">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedKey}
              src={current.img}
              alt={current.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="h-full w-full object-cover object-center filter brightness-105 contrast-105"
            />
          </AnimatePresence>

          {/* Vignette Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-black/20 opacity-80" />

          {/* District badge */}
          <div className="absolute top-2.5 left-2.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300 backdrop-blur-md flex items-center gap-1">
            <Shield size={10} />
            <span>HERO GUARDIAN</span>
          </div>

          {/* Bottom Info Banner */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#050814] via-[#050814]/90 to-transparent">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full animate-ping"
                style={{ backgroundColor: theme.hex }}
              />
              <span className="font-display text-xs font-black text-white truncate">
                {current.name}
              </span>
            </div>
            <p className="font-mono text-[9px] text-slate-300/90 mt-0.5 truncate">
              {current.role}
            </p>
          </div>
        </div>
      </div>

      {/* Hero Switcher Chips */}
      <div className="mt-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md">
        {mascotKeys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelectedKey(k)}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
              selectedKey === k
                ? "bg-[#00f0ff] text-slate-950 font-black shadow-sm shadow-cyan-400/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {MASCOTS[k].name.split("-")[0]}
          </button>
        ))}
        <span className="font-mono text-[8px] text-cyan-400/80 pr-1 flex items-center gap-0.5">
          <Sparkles size={8} /> 3D
        </span>
      </div>
    </div>
  );
};
