import React from "react";

interface SigmaBackgroundProps {
  density?: number;
  glyphs?: number;
  className?: string;
}

const MATH_SYMBOLS = ["∑", "∫", "π", "√", "∞", "Δ", "θ", "λ", "μ", "Ω", "≈", "≠"];

export const SigmaBackground: React.FC<SigmaBackgroundProps> = ({
  density = 20,
  glyphs = 8,
  className = "",
}) => {
  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Subtle grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Floating ambient math glyphs */}
      <div className="absolute inset-0 opacity-20 dark:opacity-25">
        {Array.from({ length: Math.min(glyphs, 12) }).map((_, i) => {
          const sym = MATH_SYMBOLS[i % MATH_SYMBOLS.length];
          const top = `${(i * 19 + 7) % 90}%`;
          const left = `${(i * 29 + 11) % 92}%`;
          const size = `${24 + (i % 3) * 12}px`;
          return (
            <span
              key={i}
              className="absolute font-mono text-cyan-400/40 select-none animate-pulse"
              style={{
                top,
                left,
                fontSize: size,
                animationDuration: `${4 + (i % 4) * 2}s`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              {sym}
            </span>
          );
        })}
      </div>
    </div>
  );
};
