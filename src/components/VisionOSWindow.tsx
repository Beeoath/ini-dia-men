import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
  Lock,
  Share2,
  RotateCw,
  LayoutDashboard,
  MessageSquare,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { useFullscreen } from "../lib/useFullscreen";

interface VisionOSWindowProps {
  children: React.ReactNode;
  activeDockItem?: string;
  role?: "student" | "teacher";
  urlPath?: string;
}

export const VisionOSWindow: React.FC<VisionOSWindowProps> = ({
  children,
  role = "student",
  urlPath,
}) => {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  // Full Screen layout via shared hook
  const { isFullScreen, toggleFullScreen } = useFullscreen(true);

  const isTeacher = role === "teacher" || profile?.role === "teacher";
  const defaultUrl = isTeacher ? "sigma.darunnajah9.sch.id/teacher" : "sigma.darunnajah9.sch.id/dashboard";
  const displayUrl = urlPath || defaultUrl;

  const dockLinks = isTeacher
    ? [
        { id: "home", label: "Ringkasan", path: "/teacher/dashboard", icon: LayoutDashboard },
        { id: "students", label: "Kelola Siswa", path: "/teacher/dashboard", icon: User },
        { id: "content", label: "Modul & Soal", path: "/teacher/content", icon: BookOpen },
        { id: "moderation", label: "Moderasi Diskusi", path: "/teacher/moderation", icon: MessageSquare },
        { id: "portal", label: "Mode Siswa", path: "/app", icon: Compass },
      ]
    : [
        { id: "home", label: "Dashboard", path: "/app/dashboard", icon: Compass },
        { id: "modules", label: "Semua Modul", path: "/app/hub", icon: BookOpen },
        { id: "profile", label: "Profil Akun", path: "/app/profile", icon: User },
        { id: "discussions", label: "Diskusi", path: "/app/discussions", icon: MessageSquare },
      ];

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${
        isFullScreen ? "py-1.5 sm:py-3 px-1.5 sm:px-4" : "py-4 sm:py-8 px-2 sm:px-6 lg:px-10"
      } flex flex-col items-center justify-start transition-all duration-300 ${
        isDark ? "bg-[#070b14] text-slate-100" : "bg-[#f1f5f9] text-slate-900"
      }`}
    >
      {/* 1. Ambient Background Room / Soft Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-slate-700/20 blur-[130px]" />
            <div className="absolute top-1/4 -right-40 h-[700px] w-[700px] rounded-full bg-cyan-900/15 blur-[150px]" />
            <div className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-indigo-950/25 blur-[140px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/70 via-[#070b14]/90 to-[#070b14]" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-sky-300/30 blur-[130px]" />
            <div className="absolute top-1/4 -right-40 h-[700px] w-[700px] rounded-full bg-indigo-200/30 blur-[150px]" />
            <div className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-cyan-100/40 blur-[140px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-100/90 to-slate-100" />
          </>
        )}
      </div>

      {/* 2. Top Simulated macOS / VisionOS Floating Browser Pill */}
      <div className={`relative z-20 w-full ${isFullScreen ? "max-w-none px-1 sm:px-2" : "max-w-6xl"} mb-2.5 sm:mb-4 transition-all`}>
        <div
          className={`mx-auto flex h-11 sm:h-12 w-full items-center justify-between gap-2 rounded-full px-3 sm:px-5 backdrop-blur-2xl transition-all ${
            isDark
              ? "border border-white/20 bg-slate-900/60 shadow-2xl text-white"
              : "border border-slate-300 bg-white/90 shadow-md text-slate-800"
          }`}
        >
          {/* Left Window & History Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-1.5 pr-1 sm:pr-2 border-r ${
                isDark ? "border-white/10" : "border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => window.history.back()}
                className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block shadow-sm hover:opacity-80 cursor-pointer"
                title="Tutup / Kembali"
              />
              <button
                type="button"
                onClick={toggleFullScreen}
                className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block shadow-sm hover:opacity-80 cursor-pointer"
                title={isFullScreen ? "Kecilkan Window" : "Perbesar Window"}
              />
              <button
                type="button"
                onClick={toggleFullScreen}
                className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block shadow-sm hover:opacity-80 cursor-pointer"
                title="Layar Penuh"
              />
            </div>
            <button
              type="button"
              onClick={() => window.history.back()}
              className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                isDark
                  ? "text-slate-200 hover:text-white hover:bg-white/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Kembali"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => window.history.forward()}
              className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Maju"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Center Address Pill */}
          <div
            className={`flex flex-1 max-w-xs sm:max-w-md items-center justify-center gap-2 rounded-full px-3.5 py-1 text-xs shadow-inner ${
              isDark
                ? "bg-black/50 border border-white/20 text-white"
                : "bg-slate-100 border border-slate-300 text-slate-800"
            }`}
          >
            <Lock
              size={13}
              className={`shrink-0 ${isDark ? "text-cyan-300" : "text-cyan-600"}`}
            />
            <span
              className={`truncate font-mono text-xs sm:text-sm font-semibold ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {displayUrl}
            </span>
          </div>

          {/* Right Browser Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleFullScreen}
              className={`grid h-7 w-7 place-items-center rounded-full transition-colors cursor-pointer ${
                isDark
                  ? "text-slate-200 hover:text-white hover:bg-white/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title={isFullScreen ? "Keluar Layar Penuh" : "Mode Layar Penuh"}
            >
              {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                isDark
                  ? "text-slate-200 hover:text-white hover:bg-white/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Muat Ulang"
            >
              <RotateCw size={15} />
            </button>
            <Link
              to="/"
              className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                isDark
                  ? "text-slate-200 hover:text-white hover:bg-white/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Halaman Depan"
            >
              <Share2 size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Main Stage: Floating Left Vertical Dock + Large Frosted Glass Canvas */}
      <div
        className={`relative z-20 w-full ${
          isFullScreen ? "max-w-none flex-1" : "max-w-7xl"
        } flex flex-col md:flex-row items-stretch gap-2.5 sm:gap-4 justify-center transition-all`}
      >
        {/* Left Floating Vertical Dock */}
        <aside
          className={`shrink-0 flex md:flex-col items-center justify-center gap-2 md:gap-3.5 rounded-full p-2 sm:p-2.5 shadow-2xl backdrop-blur-2xl mx-auto md:mx-0 md:sticky md:top-20 self-start transition-all ${
            isDark
              ? "border border-white/20 bg-slate-900/70"
              : "border border-slate-300 bg-white/90 shadow-lg"
          }`}
        >
          {dockLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.id === "home" &&
                (location.pathname === "/app/dashboard" ||
                  location.pathname === "/teacher/dashboard"));

            return (
              <Link
                key={item.id}
                to={item.path}
                title={item.label}
                className={`group relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full transition-all ${
                  isActive
                    ? isDark
                      ? "bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105"
                      : "bg-slate-950 text-white shadow-md scale-105"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-white/20 hover:scale-105"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200 hover:scale-105"
                }`}
              >
                <Icon size={19} className="transition-transform group-hover:scale-110" />
                {/* Tooltip on hover */}
                <span
                  className={`pointer-events-none absolute left-full ml-3 hidden md:group-hover:block whitespace-nowrap rounded-lg px-3 py-1 text-xs font-bold shadow-2xl z-50 ${
                    isDark
                      ? "bg-slate-950 border border-white/30 text-white"
                      : "bg-white border border-slate-300 text-slate-900 shadow-md"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </aside>

        {/* Main Frosted Glass Slab Container */}
        <main
          className={`flex-1 w-full rounded-[20px] sm:rounded-[28px] lg:rounded-[36px] p-3.5 sm:p-6 lg:p-8 backdrop-blur-3xl overflow-hidden relative transition-all ${
            isDark
              ? "border border-white/20 bg-slate-900/60 shadow-[0_30px_90px_rgba(0,0,0,0.85)] text-slate-100"
              : "border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] text-slate-900"
          }`}
        >
          {/* Subtle Inner Highlights */}
          {isDark ? (
            <>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/30" />
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </>
          ) : (
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          )}

          {/* Children content */}
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default VisionOSWindow;
