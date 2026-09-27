import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  MessageSquare,
  User,
  Search,
  Bell,
  ChevronDown,
  X,
  GraduationCap,
  LogOut,
  Compass,
  LayoutDashboard,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useAuth, getUserDisplayName } from "../lib/auth";
import { useTheme, ThemeToggle } from "../lib/theme";
import { useFullscreen } from "../lib/useFullscreen";

export type StudentDockItem = "dashboard" | "hub" | "discussions" | "profile";

export interface StudentSpatialLayoutProps {
  activeDockItem: StudentDockItem;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  categoryTabs?: { key: string; label: string }[];
  activeCategory?: string;
  onSelectCategory?: (key: string) => void;
  children: React.ReactNode;
}

export const StudentSpatialLayout: React.FC<StudentSpatialLayoutProps> = ({
  activeDockItem,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cari materi, rumus, kuis...",
  children,
}) => {
  const { profile, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [showNotification, setShowNotification] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Fullscreen mode via shared hook
  const { isFullScreen, toggleFullScreen } = useFullscreen(true);

  const displayName = getUserDisplayName(profile, "Ahmad Rizky Pratama");
  const displayClass = profile?.class_name || "Kelas 11 A";

  const handleLogout = () => {
    logout();
    navigate("/masuk");
  };

  const dockLinks: { id: StudentDockItem; label: string; path: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard Utama", path: "/app/dashboard", icon: Home },
    { id: "hub", label: "Sigma Hub (Modul)", path: "/app/hub", icon: BookOpen },
    { id: "discussions", label: "Forum Diskusi", path: "/app/discussions", icon: MessageSquare },
    { id: "profile", label: "Profil Siswa", path: "/app/profile", icon: User },
  ];

  return (
    <div
      className={`relative min-h-screen w-full flex items-center justify-center ${
        isFullScreen ? "p-0 sm:p-1.5 lg:p-2.5 h-screen overflow-hidden" : "p-3 sm:p-5 lg:p-6 overflow-x-hidden"
      } font-sans select-none transition-all duration-300 ${
        isDark ? "bg-[#0d0e14] text-slate-100" : "bg-[#f1f5f9] text-slate-900"
      }`}
    >
      {/* ==================================================================== */}
      {/* 1. ROOM INTERIOR BACKGROUND (Apple VisionOS / Spatial Concept)       */}
      {/* ==================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop"
          alt="Room Ambient Background"
          className={`w-full h-full object-cover filter blur-[8px] scale-105 transition-opacity duration-500 ${
            isDark ? "opacity-20" : "opacity-10"
          }`}
          referrerPolicy="no-referrer"
        />
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isDark
              ? "bg-gradient-to-tr from-[#06080e]/95 via-[#0c0d16]/85 to-[#12131f]/80"
              : "bg-gradient-to-tr from-white/95 via-slate-100/90 to-sky-50/85"
          }`}
        />
        <div
          className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${
            isDark ? "bg-cyan-500/[0.04]" : "bg-sky-500/[0.07]"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${
            isDark ? "bg-amber-500/[0.04]" : "bg-amber-500/[0.06]"
          }`}
        />
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN SPATIAL CONTAINER (Detached Left Dock + Main Glass Window)   */}
      {/* ==================================================================== */}
      <div
        className={`relative z-10 w-full ${
          isFullScreen
            ? "max-w-none h-full min-h-0 gap-2 sm:gap-2.5"
            : "max-w-[1580px] min-h-[820px] gap-3 sm:gap-4 lg:gap-5"
        } flex items-stretch transition-all duration-300`}
      >
        {/* ================================================================== */}
        {/* A. DETACHED VERTICAL PILL DOCK (Left Floating Pill)                */}
        {/* ================================================================== */}
        <aside
          className={`w-13 sm:w-14 lg:w-[62px] ${
            isFullScreen
              ? "rounded-2xl sm:rounded-3xl h-full py-4 sm:py-5"
              : "rounded-full sticky top-6 py-6 sm:py-7"
          } backdrop-blur-2xl px-2 flex flex-col items-center justify-center gap-5 sm:gap-6 shrink-0 transition-all ${
            isDark
              ? "bg-[#181a24]/80 border border-white/[0.16] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)]"
              : "bg-white/85 border border-slate-300/80 shadow-[0_15px_35px_rgba(15,23,42,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)]"
          }`}
        >
          {dockLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeDockItem === item.id;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`grid h-10 w-10 place-items-center rounded-full transition-all cursor-pointer group relative ${
                  isActive
                    ? isDark
                      ? "text-white bg-white/15 shadow-inner scale-110 border border-white/20"
                      : "text-slate-950 bg-slate-900/10 shadow-sm scale-110 border border-slate-400/40 font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-cyan-400 hover:bg-white/10"
                    : "text-slate-500 hover:text-cyan-700 hover:bg-slate-100"
                }`}
                title={item.label}
              >
                <Icon
                  size={19}
                  className={
                    isActive
                      ? isDark
                        ? "stroke-[2.2] text-white"
                        : "stroke-[2.2] text-slate-950"
                      : ""
                  }
                />
                {/* Floating tooltip */}
                <span
                  className={`pointer-events-none absolute left-full ml-3 hidden group-hover:block whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold shadow-xl z-50 ${
                    isDark
                      ? "bg-slate-950/95 border border-white/20 text-white"
                      : "bg-white border border-slate-200 text-slate-900 shadow-md"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </aside>

        {/* ================================================================== */}
        {/* B. MAIN CURVED FROSTED GLASS WINDOW                                */}
        {/* ================================================================== */}
        <main
          className={`flex-1 backdrop-blur-3xl p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-x-hidden overflow-y-auto transition-all duration-300 ${
            isFullScreen
              ? "rounded-2xl sm:rounded-3xl h-full max-h-none min-h-0"
              : "rounded-[36px] sm:rounded-[42px] max-h-[92vh] min-h-[820px]"
          } ${
            isDark
              ? "bg-[#11131e]/75 border border-white/[0.14] shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.22)] text-slate-100"
              : "bg-white/85 border border-slate-200/90 shadow-[0_25px_60px_rgba(15,23,42,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] text-slate-900"
          }`}
        >
          <div className="space-y-6 sm:space-y-7">
            {/* -------------------------------------------------------------- */}
            {/* UNIFIED TOPBAR INSIDE MAIN GLASS WINDOW                        */}
            {/* -------------------------------------------------------------- */}
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-white/10 dark:border-white/10">
              {/* Left: Brand Logo + School Badge + Search */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to="/app/dashboard"
                  className="flex items-center gap-2.5 group cursor-pointer shrink-0"
                  title="Ke Dashboard SIGMA"
                >
                  <span
                    className={`font-display text-xl sm:text-2xl font-black tracking-wider transition-colors ${
                      isDark
                        ? "text-white group-hover:text-cyan-300"
                        : "text-slate-950 group-hover:text-cyan-600"
                    }`}
                  >
                    SIGMA
                  </span>
                  <span
                    className={`font-mono text-xs sm:text-[12px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border transition-colors ${
                      isDark
                        ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/10"
                        : "text-cyan-700 border-cyan-500/30 bg-cyan-50"
                    }`}
                  >
                    MAS DARUNNAJAH 9
                  </span>
                </Link>

                <div
                  className={`hidden sm:block h-5 w-px ${
                    isDark ? "bg-white/15" : "bg-slate-300"
                  }`}
                />

                {/* Search Bar */}
                <div className="relative w-full sm:w-56 md:w-64">
                  <Search
                    size={15}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery ?? ""}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery?.trim()) {
                        navigate(`/app/hub?q=${encodeURIComponent(searchQuery.trim())}`);
                      }
                    }}
                    className={`h-9.5 w-full rounded-full pl-9 pr-3 text-sm outline-none transition-all shadow-inner ${
                      isDark
                        ? "bg-[#1c1f2e]/80 border border-white/10 text-slate-200 placeholder-slate-400 focus:border-cyan-400/50 focus:bg-[#222638]"
                        : "bg-slate-100/90 border border-slate-300/80 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              {/* Center: Main Navigation Pills */}
              <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full justify-center">
                {[
                  { id: "dashboard", label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
                  { id: "hub", label: "Sigma Hub", path: "/app/hub", icon: Compass },
                  { id: "discussions", label: "Forum Diskusi", path: "/app/discussions", icon: MessageSquare },
                  { id: "profile", label: "Profil", path: "/app/profile", icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeDockItem === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? isDark
                            ? "bg-white text-slate-950 font-black shadow-md shadow-white/20 scale-[1.02]"
                            : "bg-slate-950 text-white font-black shadow-md shadow-slate-900/20 scale-[1.02]"
                          : isDark
                          ? "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                      }`}
                      title={item.label}
                    >
                      <Icon
                        size={15}
                        className={
                          isActive
                            ? isDark
                              ? "text-slate-950 stroke-[2.2]"
                              : "text-white stroke-[2.2]"
                            : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Right: Theme Switcher + Circular Bell + User Profile Pill + Logout */}
              <div className="flex items-center gap-2 sm:gap-2.5 self-end xl:self-auto shrink-0">
                {/* Dark / Light Mode Switcher in Top Navbar */}
                <ThemeToggle
                  id="spatial-navbar-theme-toggle"
                  variant="icon"
                />

                {/* Fullscreen Mode Toggle Button */}
                <button
                  type="button"
                  onClick={toggleFullScreen}
                  className={`grid h-9 w-9 place-items-center rounded-full transition-all cursor-pointer relative shadow-sm ${
                    isFullScreen
                      ? isDark
                        ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30"
                        : "bg-cyan-50 border border-cyan-300 text-cyan-700 hover:bg-cyan-100"
                      : isDark
                      ? "bg-[#1c1f2e]/80 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                      : "bg-white border border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                  title={isFullScreen ? "Tampilan Jendela (Keluar Layar Penuh)" : "Mode Layar Penuh (Full Screen)"}
                >
                  {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                {/* Circular Bell Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotification(!showNotification)}
                    className={`grid h-9 w-9 place-items-center rounded-full transition-all cursor-pointer relative shadow-sm ${
                      isDark
                        ? "bg-[#1c1f2e]/80 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                        : "bg-white border border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                    title="Pengumuman Guru Pengampu"
                  >
                    <Bell size={15} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  </button>

                  {/* Notification Popover */}
                  {showNotification && (
                    <div
                      className={`absolute right-0 top-12 z-50 w-72 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 ${
                        isDark
                          ? "border border-white/20 bg-[#161826]/95 text-slate-100"
                          : "border border-slate-200 bg-white/95 text-slate-900"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between border-b pb-2 mb-2 ${
                          isDark ? "border-white/10" : "border-slate-200"
                        }`}
                      >
                        <span
                          className={`text-xs font-black flex items-center gap-1.5 ${
                            isDark ? "text-cyan-300" : "text-cyan-700"
                          }`}
                        >
                          <Bell size={13} /> Pengumuman TKA
                        </span>
                        <button
                          onClick={() => setShowNotification(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div
                        className={`p-2.5 rounded-2xl text-xs border ${
                          isDark
                            ? "bg-white/5 border-white/10 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div
                          className={`font-bold flex items-center gap-1.5 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          <GraduationCap size={14} className="text-amber-500" /> Ust. Ahmad Fauzi, S.Pd.
                        </div>
                        <p className="text-[11px] mt-1 leading-relaxed">
                          Assalamu'alaikum siswa-siswi MAS Darunnajah 9. Sesi simulasi kuis Distrik 1 &amp; 2 siap dikerjakan. Target kelulusan skor 75+.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`rounded-full px-3.5 py-1.5 flex items-center gap-2.5 transition-all cursor-pointer shadow-sm ${
                      isDark
                        ? "bg-[#1c1f2e]/80 border border-white/10 hover:border-white/30"
                        : "bg-white border border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 grid place-items-center text-slate-950 font-black text-xs shadow">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-left pr-0.5 hidden sm:block">
                      <div
                        className={`text-sm font-bold leading-tight ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {displayName}
                      </div>
                      <div
                        className={`text-[10px] sm:text-[11px] font-mono leading-none mt-0.5 ${
                          isDark ? "text-cyan-300" : "text-cyan-700 font-semibold"
                        }`}
                      >
                        {displayClass} • Siswa Aktif
                      </div>
                    </div>

                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {showUserDropdown && (
                    <div
                      className={`absolute right-0 top-12 z-50 w-56 rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 ${
                        isDark
                          ? "border border-white/15 bg-[#141624]/95 text-slate-200"
                          : "border border-slate-200 bg-white/95 text-slate-800"
                      }`}
                    >
                      <Link
                        to="/app/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold ${
                          isDark
                            ? "text-slate-200 hover:bg-white/10 hover:text-white"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        <User size={15} className="text-cyan-500" /> Profil &amp; Statistik
                      </Link>
                      <Link
                        to="/app/discussions"
                        onClick={() => setShowUserDropdown(false)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold ${
                          isDark
                            ? "text-slate-200 hover:bg-white/10 hover:text-white"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        <MessageSquare size={15} className="text-purple-500" /> Forum Tanya Guru
                      </Link>
                      <div
                        className={`my-1 border-t ${
                          isDark ? "border-white/10" : "border-slate-200"
                        }`}
                      />
                      <div className="px-2 py-1 flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          Tema
                        </span>
                        <ThemeToggle
                          id="spatial-dropdown-theme-toggle"
                          variant="pill"
                          showLabel={true}
                        />
                      </div>
                      <div
                        className={`my-1 border-t ${
                          isDark ? "border-white/10" : "border-slate-200"
                        }`}
                      />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <LogOut size={15} /> Keluar Akun
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Logout Button */}
                <button
                  onClick={handleLogout}
                  className={`grid h-9 w-9 place-items-center rounded-full border transition-all cursor-pointer ${
                    isDark
                      ? "border-white/10 bg-[#1c1f2e]/80 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 shadow-sm"
                  }`}
                  title="Keluar Akun"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* 2. MAIN PAGE CONTENT INSIDE FROSTED GLASS WINDOW               */}
            {/* -------------------------------------------------------------- */}
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentSpatialLayout;
