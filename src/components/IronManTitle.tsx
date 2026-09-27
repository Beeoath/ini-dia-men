import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../lib/theme";

interface IronManTitleProps {
  text?: string;
  className?: string;
}

export const IronManTitle: React.FC<IronManTitleProps> = ({
  text = "SIAP MASUK?",
  className = "",
}) => {
  const { isDark } = useTheme();
  const [fallbackToJpg, setFallbackToJpg] = useState(false);

  return (
    <div
      className={`relative w-full max-w-[880px] mx-auto flex flex-col items-center justify-center select-none ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full flex items-center justify-center group cursor-default"
      >
        {/* Accessible semantic heading */}
        <h2 className="sr-only">{text}</h2>

        {/* Atmospheric Ambient Glow behind the 3D Titanium Plate */}
        <div
          className={`absolute -inset-4 sm:-inset-8 rounded-full blur-2xl pointer-events-none transition-opacity duration-500 ${
            isDark
              ? "bg-slate-700/30 opacity-70"
              : "bg-slate-400/20 opacity-40"
          }`}
          style={{ transform: "translateY(8px)" }}
        />

        {/* Authentic Dredd 3D Chiseled Titanium Master Render */}
        <div className="relative flex items-center justify-center w-full">
          <img
            src={fallbackToJpg ? "/assets/siap_masuk_dredd_v2_trimmed.jpg" : "/assets/siap_masuk_dredd_v2_transparent.png"}
            alt={text}
            onError={() => {
              if (!fallbackToJpg) {
                setFallbackToJpg(true);
              }
            }}
            className="w-auto max-w-[320px] sm:max-w-[480px] md:max-w-[640px] lg:max-w-[760px] max-h-[85px] sm:max-h-[120px] md:max-h-[155px] lg:max-h-[185px] object-contain select-none filter contrast-[1.12] brightness-[1.04] drop-shadow-[0_14px_30px_rgba(0,0,0,0.88)] transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-[1.1]"
            loading="eager"
            decoding="async"
          />
        </div>
      </motion.div>
    </div>
  );
};

export const LaCasaPapelTitle = IronManTitle;
export const DreddTitle = IronManTitle;

