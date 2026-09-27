import React, { useState } from "react";
import { motion } from "framer-motion";

interface JusticeLeagueTitleProps {
  initialMode?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const JusticeLeagueTitle: React.FC<JusticeLeagueTitleProps> = ({
  initialMode = "SIGMA",
  size = "md",
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const [currentText] = useState(initialMode);

  // Size styling maps
  const sizeStyles = {
    sm: "max-h-[52px] sm:max-h-[64px] max-w-[220px] sm:max-w-[270px]",
    md: "max-h-[74px] sm:max-h-[92px] max-w-[310px] sm:max-w-[380px]",
    lg: "max-h-[110px] sm:max-h-[140px] max-w-[420px] sm:max-w-[500px]",
  };

  return (
    <div
      className={`relative inline-flex flex-col items-start justify-center select-none ${className}`}
      aria-label="SIGMA 3D Title"
    >
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center group"
      >
        {!imgError ? (
          /* 3D Rendered Metallic SIGMA Title with Transparent Background */
          <img
            src="/assets/sigma_justice_title.png"
            alt={currentText}
            onError={() => setImgError(true)}
            className={`w-full h-auto object-contain select-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] drop-shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-transform duration-300 group-hover:scale-105 ${sizeStyles[size]}`}
          />
        ) : (
          /* High-Fidelity 3D Metallic Justice League Font Fallback */
          <div className="relative flex items-center py-1">
            <span
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text select-none"
              style={{
                fontFamily: "'Russo One', 'Outfit', sans-serif",
                backgroundImage:
                  "linear-gradient(180deg, #ffffff 0%, #e2e8f0 18%, #94a3b8 42%, #475569 50%, #cbd5e1 52%, #64748b 78%, #1e293b 100%)",
                filter: "drop-shadow(0 2px 0 #000) drop-shadow(0 4px 10px rgba(0,0,0,0.9)) drop-shadow(0 0 15px rgba(0,240,255,0.3))",
                letterSpacing: "-0.02em",
                transform: "scaleY(1.15)",
                display: "inline-block",
              }}
            >
              {currentText}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};


