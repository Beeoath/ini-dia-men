import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Play,
  ArrowRight,
  Shield,
  GraduationCap,
  Hexagon,
  Compass,
  Zap,
  Maximize2,
  Minimize2,
  Lock,
} from "lucide-react";
import { MASCOTS } from "../lib/brand";
import { JusticeLeagueTitle } from "../components/JusticeLeagueTitle";
import { IronManTitle } from "../components/IronManTitle";
import { SigmaBackground } from "../components/SigmaBackground";
import { useTheme, ThemeToggle } from "../lib/theme";
import { useLenis, scrollToTarget } from "../lib/useLenis";
import { useFullscreen } from "../lib/useFullscreen";
import { useAuth } from "../lib/auth";

export default function Landing() {
  useLenis();
  const { isDark } = useTheme();
  const { profile } = useAuth();
  const [activeMascotKey, setActiveMascotKey] = useState("alpha");

  // Section Refs for scroll-linked parallax
  const postersRef = useRef(null);
  const siapMasukRef = useRef(null);

  // Full Screen layout via shared hook
  const { isFullScreen, toggleFullScreen } = useFullscreen(true);

  // Global Page Scroll Parallax
  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });

  // 1. Atmospheric Ambient Lighting Parallax
  const ambientY = useTransform(scrollY, [0, 1400], [0, 280]);
  const ambientScale = useTransform(scrollY, [0, 1400], [1, 1.28]);

  // Floating Math Glyphs Multi-Depth Parallax (creates spatial floating depth)
  const floatGlyphSlowY = useTransform(scrollY, [0, 1800], [0, -180]);
  const floatGlyphFastY = useTransform(scrollY, [0, 1800], [0, -380]);
  const floatGlyphDownY = useTransform(scrollY, [0, 1800], [0, 240]);

  // 2. Section 1: Hero Card Parallax Layers
  const heroLeftY = useTransform(scrollY, [0, 700], [0, 60]);
  const heroCenterY = useTransform(scrollY, [0, 700], [0, 25]);
  const heroRightY = useTransform(scrollY, [0, 700], [0, 80]);
  const heroBgGlowY = useTransform(scrollY, [0, 700], [0, 140]);

  // 3. Section 2: Posters Section Scroll-Linked Parallax
  const { scrollYProgress: postersProgress } = useScroll({
    target: postersRef,
    offset: ["start end", "end start"],
  });
  const posterHeaderY = useTransform(postersProgress, [0, 1], [-20, 20]);
  const poster1Y = useTransform(postersProgress, [0, 1], [40, -40]);
  const poster2Y = useTransform(postersProgress, [0, 1], [5, -5]);
  const poster3Y = useTransform(postersProgress, [0, 1], [65, -45]);
  const posterImgY = useTransform(postersProgress, [0, 1], ["-6%", "6%"]);

  // 4. Section 3: "SIAP MASUK?" CTA Scroll-Linked Parallax
  const { scrollYProgress: siapProgress } = useScroll({
    target: siapMasukRef,
    offset: ["start end", "end start"],
  });
  const ctaTitleY = useTransform(siapProgress, [0, 1], [30, -20]);
  const ctaContentY = useTransform(siapProgress, [0, 1], [15, -10]);
  const ctaGlowY = useTransform(siapProgress, [0, 1], [-50, 50]);

  const currentMascot = MASCOTS[activeMascotKey] || MASCOTS.alpha;

  // Mascot theme colors
  const getThemeColor = () => {
    if (activeMascotKey === "alpha") return { hex: "#00F0FF", rgb: "0, 240, 255" };
    if (activeMascotKey === "beta") return { hex: "#FF007A", rgb: "255, 0, 122" };
    return { hex: "#FFD600", rgb: "255, 214, 0" };
  };
  const theme = getThemeColor();

  return (
    <div
      className={`relative min-h-screen w-full font-sans selection:bg-[#00f0ff] selection:text-black overflow-x-hidden transition-colors duration-300 ${
        isDark ? "bg-[#050814] text-slate-100" : "bg-[#f4f6fb] text-slate-900"
      }`}
    >
      {/* Sleek Parallax Scroll Indicator Line */}
      <motion.div
        style={{ scaleX: smoothProgress }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#00f0ff] via-sky-400 to-[#ff007a] origin-left z-50 pointer-events-none"
      />

      {/* Dynamic Background Matrix */}
      <SigmaBackground density={24} glyphs={10} />

      {/* Atmospheric Clean Ambient Lighting & Floating Math Glyphs with Multi-Layer Parallax */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          style={{ y: ambientY, scale: ambientScale }}
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[500px] blur-[130px] rounded-full ${
            isDark ? "bg-cyan-500/10" : "bg-sky-400/20"
          }`}
        />

        {/* Floating math parallax depth tokens that drift at different scroll speeds */}
        <motion.div
          style={{ y: floatGlyphFastY }}
          className="absolute top-[28%] left-[3%] text-cyan-400/20 text-2xl sm:text-3xl font-mono font-black select-none hidden lg:block"
        >
          ∫ f(x) dx
        </motion.div>
        <motion.div
          style={{ y: floatGlyphSlowY }}
          className="absolute top-[48%] right-[4%] text-amber-400/15 text-4xl sm:text-5xl font-serif select-none hidden lg:block"
        >
          ∑
        </motion.div>
        <motion.div
          style={{ y: floatGlyphDownY }}
          className="absolute top-[68%] left-[5%] text-pink-400/15 text-2xl sm:text-3xl font-mono font-bold select-none hidden lg:block"
        >
          [A]⁻¹ · B
        </motion.div>
        <motion.div
          style={{ y: floatGlyphFastY }}
          className="absolute top-[82%] right-[6%] text-cyan-400/20 text-3xl sm:text-4xl font-sans font-bold select-none hidden lg:block"
        >
          π ≈ 3.14159
        </motion.div>
      </div>

      {/* Main Content Layout Container - Full Screen Fluid Layout */}
      <main
        className={`relative z-10 w-full ${
          isFullScreen ? "max-w-none px-3 sm:px-6 lg:px-10 xl:px-14" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        } py-4 sm:py-6 lg:py-8 space-y-8 sm:space-y-12 transition-all duration-300`}
      >
        {/* ========================================================================= */}
        {/* 1. TOP HERO CARD CONTAINER                                                */}
        {/* ========================================================================= */}
        <motion.section
          id="hero-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full overflow-hidden rounded-[1.8rem] sm:rounded-[2.4rem] lg:rounded-[3rem] border transition-all duration-300 ${
            isDark
              ? "border-white/10 bg-gradient-to-b from-[#0d1630] via-[#090f23] to-[#0d1733] shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white"
              : "border-slate-300/80 bg-gradient-to-b from-white via-slate-50 to-sky-50 shadow-[0_20px_50px_rgba(15,23,42,0.08)] text-slate-900"
          }`}
        >
          {/* Clean Soft Sheen in Card Background with Parallax Depth */}
          <motion.div
            style={{ y: heroBgGlowY }}
            className={`pointer-events-none absolute inset-0 ${
              isDark
                ? "bg-[radial-gradient(ellipse_at_top,rgba(0,240,255,0.08)_0%,transparent_65%)]"
                : "bg-[radial-gradient(ellipse_at_top,rgba(2,132,199,0.08)_0%,transparent_65%)]"
            }`}
          />

          {/* --- A. CARD NAVIGATION BAR --- */}
          <nav className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-7">
            {/* Logo / Brand Name */}
            <Link to="/" className="flex items-center gap-2 group">
              <span
                className={`font-display text-lg sm:text-xl font-black uppercase tracking-tight transition-colors ${
                  isDark
                    ? "text-white group-hover:text-cyan-400"
                    : "text-slate-950 group-hover:text-cyan-600"
                }`}
              >
                SIGMA
              </span>
            </Link>

            {/* Middle Nav Links */}
            <div
              className={`hidden md:flex items-center gap-8 text-sm font-lexend font-medium ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <a
                href="#hero-card"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#hero-card");
                }}
                className={`transition-colors ${isDark ? "hover:text-cyan-300" : "hover:text-cyan-700"}`}
              >
                Home
              </a>
              <a
                href="#posters"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#posters");
                }}
                className={`transition-colors ${isDark ? "hover:text-cyan-300" : "hover:text-cyan-700"}`}
              >
                Distrik &amp; Misi
              </a>
              <Link
                to={profile ? "/app/hub" : `/masuk?redirect=${encodeURIComponent("/app/hub")}&notice=peta_belajar`}
                className={`transition-colors ${isDark ? "hover:text-cyan-300" : "hover:text-cyan-700"}`}
              >
                Peta Belajar
              </Link>
              <Link
                to="/teacher"
                className={`transition-colors flex items-center gap-1.5 ${
                  isDark ? "text-amber-300 hover:text-amber-200" : "text-amber-700 hover:text-amber-900"
                }`}
              >
                <GraduationCap size={15} /> Portal Guru
              </Link>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={toggleFullScreen}
                className={`grid h-9 w-9 place-items-center rounded-full border transition-all cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/15"
                    : "border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 shadow-sm"
                }`}
                title={isFullScreen ? "Keluar Layar Penuh" : "Mode Layar Penuh (Full Screen)"}
              >
                {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <ThemeToggle variant="icon" />

              <Link
                to={
                  profile
                    ? profile.role === "teacher"
                      ? "/teacher/dashboard"
                      : "/app/dashboard"
                    : "/masuk"
                }
                className={`inline-flex items-center gap-2.5 rounded-full font-bold text-xs px-4 py-2 sm:px-5 sm:py-2.5 shadow-md transition-all group ${
                  isDark
                    ? "bg-white hover:bg-slate-100 text-slate-950 shadow-white/10"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/15"
                }`}
              >
                <span>{profile ? "Masuk ke Dashboard" : "Mulai Belajar"}</span>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${
                    isDark
                      ? "bg-slate-900 text-white group-hover:bg-[#00f0ff] group-hover:text-black"
                      : "bg-white text-slate-950 group-hover:bg-[#00f0ff] group-hover:text-black"
                  }`}
                >
                  <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </nav>

          {/* --- B. HERO STAGE --- */}
          <div className="relative z-10 px-6 pt-4 pb-10 sm:px-10 sm:pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Welcome + Big Title */}
              <motion.div
                style={{ y: heroLeftY }}
                className="lg:col-span-5 flex flex-col items-start z-20 order-2 lg:order-1 pr-2"
              >
                <div className="inline-flex items-center text-xs font-lexend">
                  <span className="text-cyan-500 dark:text-cyan-400 font-semibold tracking-wide">
                    Selamat Datang
                  </span>
                </div>

                {/* 3D Metallic SIGMA Title */}
                <div className="relative my-2.5 w-full max-w-[320px] sm:max-w-[390px] lg:max-w-[450px] group">
                  <div
                    className="pointer-events-none absolute -inset-x-8 -inset-y-3 rounded-full blur-3xl opacity-30"
                    style={{
                      background: isDark
                        ? "linear-gradient(90deg, rgba(0, 240, 255, 0.28) 0%, rgba(56, 189, 248, 0.16) 100%)"
                        : "linear-gradient(90deg, rgba(2, 132, 199, 0.18) 0%, rgba(147, 197, 253, 0.12) 100%)",
                    }}
                  />
                  <JusticeLeagueTitle size="lg" className="origin-left" />
                </div>

                {/* Main Hero Display Title */}
                <h1
                  className={`mt-1 font-outfit text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-extrabold tracking-tight leading-[1.2] drop-shadow-md ${
                    isDark ? "text-white" : "text-slate-950"
                  }`}
                >
                  MAS{" "}
                  <span
                    className={`text-transparent bg-clip-text ${
                      isDark
                        ? "bg-gradient-to-r from-white via-slate-100 to-cyan-300"
                        : "bg-gradient-to-r from-slate-950 via-slate-800 to-cyan-700"
                    }`}
                  >
                    Darunnajah 9
                  </span>
                </h1>

                <p
                  className={`mt-3.5 text-sm sm:text-base font-lexend leading-relaxed max-w-sm ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Taklukkan aljabar, matriks, limit fungsi, hingga geometri dimensi tiga bersama tiga
                  superhero penjaga gerbang SIGMA.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={profile ? "/app/dashboard" : `/masuk?redirect=${encodeURIComponent("/app/hub")}&notice=peta_belajar`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00f0ff] hover:bg-cyan-300 text-slate-950 font-lexend font-bold text-sm px-6 py-2.5 tracking-normal shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    {!profile && <Lock size={14} className="text-slate-900" />}
                    <span>{profile ? "Lanjutkan Belajar" : "Jelajahi Distrik"}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>

              {/* Center Column: Mascot Card Container & 3D Guardian Switcher */}
              <motion.div
                style={{ y: heroCenterY }}
                className="lg:col-span-4 flex flex-col justify-center items-center z-10 order-1 lg:order-2"
              >
                <motion.div
                  key={activeMascotKey}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full max-w-[320px] sm:max-w-[340px] aspect-[4/5] group"
                >
                  <div
                    className="absolute -inset-2 rounded-[2rem] opacity-60 blur-xl transition-all duration-700"
                    style={{
                      background: `radial-gradient(circle, ${theme.hex} 0%, transparent 70%)`,
                    }}
                  />
                  <div
                    className={`relative h-full w-full rounded-[1.8rem] border p-2 backdrop-blur-xl transition-all duration-500 ${
                      isDark
                        ? "border-white/20 bg-gradient-to-b from-[#111936] to-[#070b18]"
                        : "border-slate-300 bg-gradient-to-b from-white to-slate-100 shadow-xl"
                    }`}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-[#070c1d]">
                      {/* District badge */}
                      <div className="absolute top-2.5 left-2.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300 backdrop-blur-md flex items-center gap-1 z-10">
                        <Shield size={10} />
                        <span>HERO GUARDIAN</span>
                      </div>

                      <img
                        src={currentMascot.img}
                        alt={currentMascot.name}
                        className="h-full w-full object-cover object-center filter brightness-105 contrast-105 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a18] via-transparent to-transparent opacity-85" />
                      <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-[#060a18] via-[#060a18]/90 to-transparent">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span
                              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                              style={{ backgroundColor: theme.hex }}
                            />
                            <span
                              className="relative inline-flex rounded-full h-2 w-2"
                              style={{ backgroundColor: theme.hex }}
                            />
                          </span>
                          <span className="font-outfit text-sm font-bold text-white tracking-normal">
                            {currentMascot.name}
                          </span>
                        </div>
                        <p className="font-lexend text-[11px] text-slate-300 mt-0.5">
                          {currentMascot.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Hero Switcher Chips (Alpha / Beta / Gamma) */}
                <div className="mt-3.5 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 p-1 backdrop-blur-md shadow-xl z-20">
                  {["alpha", "beta", "gamma"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActiveMascotKey(k)}
                      className={`rounded-full px-3.5 py-1 text-xs font-lexend font-medium transition-all cursor-pointer ${
                        activeMascotKey === k
                          ? "bg-[#00f0ff] text-slate-950 font-bold shadow-md shadow-cyan-400/40 scale-105"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {MASCOTS[k].name.split("-")[0]}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Right Column: Mission & Telemetry Layer Card */}
              <motion.div
                style={{ y: heroRightY }}
                className="lg:col-span-3 flex flex-col justify-center z-10 order-3"
              >
                <div
                  className={`relative w-full rounded-[1.8rem] border p-5 backdrop-blur-xl transition-all duration-500 shadow-xl ${
                    isDark
                      ? "border-white/15 bg-gradient-to-b from-[#111936]/90 via-[#0a1024]/80 to-[#070b18]/90 text-white"
                      : "border-slate-300/80 bg-gradient-to-b from-white/95 to-slate-50/90 text-slate-900 shadow-slate-900/5"
                  }`}
                >
                  {/* Subtle top accent seam */}
                  <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

                  <p
                    className={`font-outfit text-sm font-medium leading-relaxed italic ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    &ldquo;Dengan kekuatan logika matematika hadir ketajaman nalar tanpa batas.&rdquo;
                  </p>

                  <p
                    className={`mt-2.5 text-xs leading-relaxed font-lexend ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Tuntaskan 5 distrik matematika kurikulum kelas 11 MA Darunnajah 9 bersama pelindung gerbang SIGMA.
                  </p>

                  {/* Readiness Progress */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2 font-lexend">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isDark ? "text-slate-300" : "text-slate-600"}>Kesiapan Materi</span>
                      <span className="font-semibold text-cyan-400">88% Optimal</span>
                    </div>
                    <div
                      className={`h-2 w-full rounded-full overflow-hidden border p-0.5 ${
                        isDark ? "bg-slate-950/80 border-white/10" : "bg-slate-200 border-slate-300"
                      }`}
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-[#00f0ff] w-[88%] shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
                    </div>
                  </div>

                  {/* Badges footer */}
                  <div className="mt-3 flex items-center justify-between text-xs font-lexend text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                      <Shield size={12} /> 5 Distrik
                    </span>
                    <span className="text-[11px] text-slate-400">Target: Skor 75+</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* --- C. DOCKED LOWER FEATURE BAR --- */}
          <div
            className={`relative z-20 border-t px-6 py-4 sm:px-10 sm:py-5 backdrop-blur-md transition-colors ${
              isDark
                ? "border-white/10 bg-[#091124]/90 text-slate-300"
                : "border-slate-200 bg-slate-100/95 text-slate-700"
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#00f0ff]" />
                <span
                  className={`font-outfit text-sm font-semibold tracking-normal ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Pahlawan Matematika Sigma
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-lexend text-xs">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 transition-all cursor-pointer px-3 py-1.5 rounded-full ${
                    activeMascotKey === "alpha"
                      ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setActiveMascotKey("alpha")}
                >
                  <Zap size={14} className="text-[#00f0ff]" />
                  <span>Lingkaran Aljabar</span>
                </button>

                <button
                  type="button"
                  className={`flex items-center gap-1.5 transition-all cursor-pointer px-3 py-1.5 rounded-full ${
                    activeMascotKey === "beta"
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setActiveMascotKey("beta")}
                >
                  <Hexagon size={14} className="text-[#ffd600]" />
                  <span>Hexagon Fungsi</span>
                </button>

                <button
                  type="button"
                  className={`flex items-center gap-1.5 transition-all cursor-pointer px-3 py-1.5 rounded-full ${
                    activeMascotKey === "gamma"
                      ? "bg-pink-400/20 text-pink-300 border border-pink-400/40 font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setActiveMascotKey("gamma")}
                >
                  <Compass size={14} className="text-[#ff007a]" />
                  <span>Topeng Geometri</span>
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 2. SECOND SECTION: 3 VERTICAL POSTERS                                     */}
        {/* ========================================================================= */}
        <motion.section
          id="posters"
          ref={postersRef}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full overflow-hidden rounded-[1.8rem] sm:rounded-[2.4rem] lg:rounded-[3rem] border p-5 sm:p-8 lg:p-12 shadow-2xl transition-all ${
            isDark
              ? "border-white/10 bg-gradient-to-b from-[#0a1226] via-[#070d1d] to-[#0b1428]"
              : "border-slate-300 bg-gradient-to-b from-white via-slate-50 to-indigo-50/40 text-slate-900"
          }`}
        >
          {/* Header Row with Parallax Motion */}
          <motion.div
            style={{ y: posterHeaderY }}
            className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-end border-b pb-8 mb-8 ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div className="md:col-span-6">
              <h2
                className={`font-outfit text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.2] ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Setiap Rumus <br />
                Membuka Gerbang Baru
              </h2>
            </div>

            <div className="md:col-span-6 flex flex-col md:items-end justify-between gap-4">
              <p
                className={`text-sm leading-relaxed md:text-right max-w-md font-lexend ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Petualangan superhero matematika spektakuler yang dipenuhi aksi logika, ketelitian,
                dan pertempuran konsep kurikulum di seluruh penjuru kota.
              </p>

              <div className="flex items-center gap-3 font-lexend">
                <span
                  className={`text-xs hidden sm:inline ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Tersedia 5 Distrik Pembelajaran
                </span>
                <Link
                  to={profile ? "/app/hub" : `/masuk?redirect=${encodeURIComponent("/app/hub")}&notice=peta_belajar`}
                  className={`inline-flex items-center gap-2 rounded-full font-semibold text-xs px-4 py-2 shadow transition-all group ${
                    isDark
                      ? "bg-white hover:bg-slate-200 text-slate-950"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {!profile && <Lock size={12} className="text-cyan-600 dark:text-cyan-400" />}
                  <span>{profile ? "Buka Sigma Hub" : "Masuk ke Sigma Hub"}</span>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full transition-colors ${
                      isDark
                        ? "bg-slate-900 text-white group-hover:bg-[#00f0ff] group-hover:text-black"
                        : "bg-white text-slate-950 group-hover:bg-[#00f0ff] group-hover:text-black"
                    }`}
                  >
                    <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 3 Vertical Movie-Poster Cards with Staggered Parallax Float */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Poster 1 */}
            <motion.div
              style={{ y: poster1Y }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden rounded-[1.8rem] border shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#00f0ff]/50 ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <Link
                to={profile ? "/app/hub?module=mod-aljabar-1" : `/masuk?redirect=${encodeURIComponent("/app/hub?module=mod-aljabar-1")}&notice=peta_belajar`}
                className="relative aspect-[3/4] w-full overflow-hidden bg-black block cursor-pointer"
              >
                <motion.img
                  style={{ y: posterImgY, scale: 1.12 }}
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=700&auto=format&fit=crop&q=80"
                  alt="Distrik Aljabar"
                  className="h-full w-full object-cover filter brightness-90 group-hover:scale-115 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060914] via-[#060914]/40 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  <span className="rounded-full bg-cyan-400/90 px-3 py-1 font-lexend text-[10px] font-bold text-slate-950 backdrop-blur-sm shadow-md">
                    Distrik 01 &bull; Matrix Realm
                  </span>
                  {!profile && (
                    <span className="rounded-full bg-black/60 border border-white/20 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-300 backdrop-blur-md flex items-center gap-1 shadow">
                      <Lock size={9} /> Perlu Login
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 font-lexend">
                  <span className="text-[11px] font-semibold text-[#00f0ff]">
                    Aljabar &amp; Matriks
                  </span>
                  <h3 className="font-outfit text-lg font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                    Determinan &amp; Invers Matriks
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Kuasai operasi baris dasar, determinan metode Sarrus, dan aturan Cramer untuk SPLTV.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-2 font-medium">
                    <span>15 Soal &bull; 20 Menit</span>
                    <span className="text-white group-hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors">
                      {profile ? "Buka di Sigma Hub \u2192" : "Masuk ke Sigma Hub \u2192"}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Poster 2 */}
            <motion.div
              style={{ y: poster2Y }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden rounded-[1.8rem] border shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#ffd600]/50 ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <Link
                to={profile ? "/app/hub?module=mod-aljabar-2" : `/masuk?redirect=${encodeURIComponent("/app/hub?module=mod-aljabar-2")}&notice=peta_belajar`}
                className="relative aspect-[3/4] w-full overflow-hidden bg-black block cursor-pointer"
              >
                <motion.img
                  style={{ y: posterImgY, scale: 1.12 }}
                  src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=700&auto=format&fit=crop&q=80"
                  alt="Distrik Fungsi"
                  className="h-full w-full object-cover filter brightness-90 group-hover:scale-115 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060914] via-[#060914]/40 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  <span className="rounded-full bg-amber-400/90 px-3 py-1 font-lexend text-[10px] font-bold text-slate-950 backdrop-blur-sm shadow-md">
                    Distrik 02 &bull; Function Tower
                  </span>
                  {!profile && (
                    <span className="rounded-full bg-black/60 border border-white/20 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-300 backdrop-blur-md flex items-center gap-1 shadow">
                      <Lock size={9} /> Perlu Login
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 font-lexend">
                  <span className="text-[11px] font-semibold text-[#ffd600]">
                    Domain &amp; Invers
                  </span>
                  <h3 className="font-outfit text-lg font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                    Operasi Komposisi Fungsi
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Petakan domain, range, relasi, dan rumus fungsi invers dalam tantangan bertingkat.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-2 font-medium">
                    <span>Syarat: Distrik 01 Lulus</span>
                    <span className="text-white group-hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition-colors">
                      {profile ? "Buka di Sigma Hub \u2192" : "Masuk ke Sigma Hub \u2192"}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Poster 3 */}
            <motion.div
              style={{ y: poster3Y }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden rounded-[1.8rem] border shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#ff007a]/50 ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <Link
                to={profile ? "/app/hub?module=mod-stat-1" : `/masuk?redirect=${encodeURIComponent("/app/hub?module=mod-stat-1")}&notice=peta_belajar`}
                className="relative aspect-[3/4] w-full overflow-hidden bg-black block cursor-pointer"
              >
                <motion.img
                  style={{ y: posterImgY, scale: 1.12 }}
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop&q=80"
                  alt="Peluang & Statistika"
                  className="h-full w-full object-cover filter brightness-90 group-hover:scale-115 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060914] via-[#060914]/40 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  <span className="rounded-full bg-pink-500/90 px-3 py-1 font-lexend text-[10px] font-bold text-white backdrop-blur-sm shadow-md">
                    Distrik 04 &bull; Multiverse Data
                  </span>
                  {!profile && (
                    <span className="rounded-full bg-black/60 border border-white/20 px-2 py-0.5 font-mono text-[9px] font-bold text-pink-300 backdrop-blur-md flex items-center gap-1 shadow">
                      <Lock size={9} /> Perlu Login
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 font-lexend">
                  <span className="text-[11px] font-semibold text-[#ff007a]">
                    Peluang &amp; Statistik
                  </span>
                  <h3 className="font-outfit text-lg font-bold text-white mt-1 group-hover:text-pink-300 transition-colors">
                    Pertarungan Puncak TKA
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Permutasi, kombinasi, kaidah pencacahan, serta ukuran pemusatan dan penyebaran data.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-2 font-medium">
                    <span>Kunci Sertifikat Akhir</span>
                    <span className="text-white group-hover:text-pink-300 font-semibold inline-flex items-center gap-1 transition-colors">
                      {profile ? "Buka di Sigma Hub \u2192" : "Masuk ke Sigma Hub \u2192"}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 3. CALL TO ACTION SECTION: "SIAP MASUK?"                                  */}
        {/* ========================================================================= */}
        <motion.section
          id="siap-masuk"
          ref={siapMasukRef}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full overflow-hidden rounded-[1.8rem] sm:rounded-[2.4rem] lg:rounded-[3rem] border p-8 sm:p-12 lg:p-16 text-center shadow-2xl transition-all ${
            isDark
              ? "border-white/10 bg-gradient-to-b from-[#0b1530] via-[#080e22] to-[#060a18] text-white"
              : "border-slate-300 bg-gradient-to-b from-white via-slate-50 to-sky-100/60 text-slate-900"
          }`}
        >
          {/* Subtle Parallax Background Aura */}
          <motion.div
            style={{ y: ctaGlowY }}
            className={`pointer-events-none absolute -inset-24 rounded-full blur-3xl opacity-20 ${
              isDark ? "bg-cyan-500" : "bg-sky-400"
            }`}
          />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            {/* Preserved 3D Iron Man Render with Parallax */}
            <motion.div style={{ y: ctaTitleY }} className="w-full flex justify-center mb-6">
              <IronManTitle text="SIAP MASUK?" />
            </motion.div>

            <motion.div style={{ y: ctaContentY }} className="flex flex-col items-center">
              <p
                className={`max-w-2xl text-sm sm:text-base font-lexend leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Bergabunglah bersama ribuan siswa MA Darunnajah 9. Taklukkan 5 distrik kurikulum
                matematika SIGMA, raih lencana kejuaraan, dan mantapkan persiapan ujian TKA kelas 11.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                <Link
                  to="/masuk?mode=daftar"
                  className="inline-flex items-center gap-2 rounded-full bg-[#00f0ff] hover:bg-cyan-300 text-slate-950 font-lexend font-bold text-sm px-7 py-3 tracking-normal shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <span>Daftar Sebagai Siswa</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/masuk?mode=daftar&role=guru"
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-400/10 hover:bg-amber-400/20 text-amber-500 dark:text-amber-300 font-lexend font-bold text-sm px-6 py-3 tracking-normal hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <GraduationCap size={16} /> <span>Daftar Akun Guru</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* ========================================================================= */}
      {/* 4. CONSOLE & STUDIO FOOTER                                               */}
      {/* ========================================================================= */}
      <footer
        className={`relative z-10 border-t px-4 py-8 sm:px-8 font-mono text-xs transition-colors ${
          isDark
            ? "border-white/10 bg-[#04060f] text-slate-400"
            : "border-slate-200 bg-white text-slate-600 shadow-sm"
        }`}
      >
        <div className="w-full px-2 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span
              className={`font-display font-black text-sm tracking-tight ${
                isDark ? "text-white" : "text-slate-950"
              }`}
            >
              SIGMA LEAGUE &trade;
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              PkM Universitas Pamulang &times; MA Darunnajah 9
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
            <Link
              to={profile ? "/app/hub" : `/masuk?redirect=${encodeURIComponent("/app/hub")}&notice=peta_belajar`}
              className="hover:text-cyan-500 transition-colors"
            >
              Peta Belajar
            </Link>
            <Link
              to={profile ? "/app/discussions" : "/masuk?redirect=/app/discussions"}
              className="hover:text-cyan-400 transition-colors"
            >
              Forum
            </Link>
            <Link
              to="/teacher"
              className="hover:text-amber-500 text-amber-500 font-bold transition-colors"
            >
              Portal Guru
            </Link>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-600">|</span>
            <Link
              to="/privacy"
              className="hover:text-cyan-400 transition-colors text-slate-400 dark:text-slate-400"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-cyan-400 transition-colors text-slate-400 dark:text-slate-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
