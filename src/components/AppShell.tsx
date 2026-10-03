import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  LayoutDashboard,
  MessageSquare,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { useAuth, getUserDisplayName } from "../lib/auth";
import { useTheme, ThemeToggle } from "../lib/theme";
import { SigmaBackground } from "./SigmaBackground";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = profile?.role === "teacher";

  const studentNavItems = [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Sigma Hub", path: "/app/hub", icon: Compass },
    { label: "Forum Diskusi", path: "/app/discussions", icon: MessageSquare },
    { label: "Profil", path: "/app/profile", icon: User },
  ];

  const teacherNavItems = [
    { label: "Ringkasan Kelas", path: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "Moderasi Diskusi", path: "/teacher/moderation", icon: MessageSquare },
    { label: "Kelola Materi", path: "/teacher/content", icon: Layers },
    { label: "Mode Siswa", path: "/app/dashboard", icon: Compass },
  ];

  const currentNav = isTeacher ? teacherNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    navigate("/masuk");
  };

  const isDashboardView =
    location.pathname === "/app" ||
    location.pathname === "/app/" ||
    location.pathname === "/app/dashboard";

  const isSpatialView =
    !isTeacher &&
    (isDashboardView ||
      location.pathname === "/app/hub" ||
      location.pathname === "/app/hub/" ||
      location.pathname === "/app/discussions" ||
      location.pathname === "/app/discussions/" ||
      location.pathname === "/app/diskusi" ||
      location.pathname === "/app/diskusi/" ||
      location.pathname === "/app/profile" ||
      location.pathname === "/app/profile/" ||
      location.pathname === "/app/profil" ||
      location.pathname === "/app/profil/");

  const isNavActive = (itemPath: string) => {
    if (itemPath === "/app/dashboard") {
      return isDashboardView;
    }
    if (itemPath === "/app/hub") {
      return location.pathname === "/app/hub";
    }
    return location.pathname.startsWith(itemPath);
  };

  const displayName = getUserDisplayName(profile);

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-300 selection:bg-cyan-400/30 selection:text-cyan-400 ${
        isDark ? "bg-[#070913] text-slate-100" : "bg-[#f4f6fb] text-slate-900"
      }`}
    >
      <SigmaBackground density={18} glyphs={8} />

      {/* Top Navbar: Shown on standard/teacher views; on student spatial view it is merged into the main glass window */}
      {!isSpatialView && (
        <header
          className={`sticky top-0 z-50 border-b backdrop-blur-2xl transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-[#070a14]/90 text-white"
              : "border-slate-200/80 bg-white/90 text-slate-900 shadow-sm"
          }`}
        >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-5 lg:px-6">
          {/* Left: Brand Name & School Label */}
          <div className="flex items-center gap-2.5">
            <Link
              to={isTeacher ? "/teacher" : "/app/dashboard"}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <span
                className={`font-display text-lg sm:text-xl font-black tracking-wider transition-colors ${
                  isDark
                    ? "text-white group-hover:text-cyan-300"
                    : "text-slate-950 group-hover:text-cyan-600"
                }`}
              >
                SIGMA
              </span>
              <span
                className={`font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-colors ${
                  isDark
                    ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/10"
                    : "text-cyan-700 border-cyan-500/30 bg-cyan-50"
                }`}
              >
                MAS DARUNNAJAH 9
              </span>
            </Link>

            {isTeacher && (
              <span
                className={`ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  isDark
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    : "border-amber-500/30 bg-amber-50 text-amber-800"
                }`}
              >
                <ShieldCheck size={11} /> GURU
              </span>
            )}
          </div>

          {/* Center: Desktop Navigation Links (Only for Teacher view) */}
          {isTeacher && (
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? isDark
                          ? "bg-white/10 text-cyan-300 shadow-sm border border-cyan-400/30 font-bold"
                          : "bg-cyan-50 text-cyan-800 shadow-sm border border-cyan-300 font-bold"
                        : isDark
                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        active
                          ? isDark
                            ? "text-cyan-400"
                            : "text-cyan-600"
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
          )}

          {/* Right: User Status & Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button (Dark/Light) */}
            <ThemeToggle id="navbar-theme-toggle" variant="icon" />

            <Link
              to="/app/profile"
              className={`flex items-center gap-2.5 rounded-xl border py-1 px-3 transition-colors cursor-pointer ${
                isDark
                  ? "border-white/10 bg-[#0f1424] hover:border-cyan-400/40 text-white"
                  : "border-slate-200 bg-white hover:border-cyan-500/40 text-slate-800 shadow-sm"
              }`}
              title="Lihat Profil"
            >
              <div
                className={`h-7 w-7 rounded-lg border font-black grid place-items-center text-xs ${
                  isDark
                    ? "bg-cyan-950/80 border-cyan-400/40 text-cyan-300"
                    : "bg-cyan-100 border-cyan-300 text-cyan-800"
                }`}
              >
                <User size={14} />
              </div>
              <div className="text-left">
                <div
                  className={`text-xs font-bold truncate max-w-[130px] ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  {displayName}
                </div>
                <div
                  className={`text-[10px] font-mono font-semibold ${
                    isDark ? "text-cyan-400/90" : "text-cyan-700"
                  }`}
                >
                  {isTeacher ? "Pengajar" : profile?.class_name ? `Siswa • ${profile.class_name}` : "Siswa MA Darunnajah 9"}
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 shadow-sm"
              }`}
              title="Keluar"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden grid h-9 w-9 place-items-center rounded-xl border transition-colors ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm"
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden border-t px-4 py-3 space-y-2 ${
              isDark
                ? "border-white/10 bg-[#070a14]/95 text-white"
                : "border-slate-200 bg-white/95 text-slate-900 shadow-xl"
            }`}
          >
            {currentNav.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? isDark
                        ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30"
                        : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      active
                        ? isDark
                          ? "text-cyan-400"
                          : "text-cyan-700"
                        : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Mode Switcher Row */}
            <div
              className={`pt-2.5 border-t mt-2 flex items-center justify-between px-1 ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Tema Tampilan
              </span>
              <ThemeToggle
                id="mobile-nav-theme-toggle"
                variant="pill"
                showLabel={true}
              />
            </div>
          </div>
        )}
        </header>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 relative z-10 w-full ${
          isSpatialView ? "overflow-x-hidden" : "w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6"
        }`}
      >
        {children}
      </main>

      {/* Footer shown on non-spatial pages */}
      {!isSpatialView && (
        <footer
          className={`relative z-10 border-t py-6 text-center text-xs transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-[#070913]/60 text-slate-500"
              : "border-slate-200 bg-white/60 text-slate-600 shadow-sm"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 SIGMA Matematika · MA Darunnajah 9</p>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>
            </div>
            <p
              className={`font-mono text-[11px] ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Kurikulum Matematika Terintegrasi TKA Kelas 11
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
