import React from "react";

interface ProgressBarProps {
  value?: number;
  progress?: number;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  progress,
  color,
  className = "",
}) => {
  const actualValue = progress !== undefined ? progress : (value ?? 0);
  const clamped = Math.min(100, Math.max(0, actualValue));
  return (
    <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden h-2 ${className}`}>
      <div
        className={`h-full transition-all duration-300 rounded-full ${color ? "" : "bg-cyan-400"}`}
        style={{
          width: `${clamped}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "destructive" | "success" | "warning" | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  let variantStyles = "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30";
  if (variant === "secondary") {
    variantStyles = "bg-slate-500/10 text-slate-300 border border-slate-500/20";
  } else if (variant === "destructive") {
    variantStyles = "bg-rose-500/10 text-rose-400 border border-rose-500/30";
  } else if (variant === "success") {
    variantStyles = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
  } else if (variant === "warning") {
    variantStyles = "bg-amber-500/10 text-amber-400 border border-amber-500/30";
  } else if (variant === "outline") {
    variantStyles = "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
