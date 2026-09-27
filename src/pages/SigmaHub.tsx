import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  BookOpen,
  ChevronRight,
  Play,
  Shield,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  X,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lock,
  Check,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { DISTRICTS, MODULES, SigmaModule } from "../lib/sigmaData";
import { StudentSpatialLayout } from "../components/StudentSpatialLayout";
import { useTheme } from "../lib/theme";
import { getLastActiveModule, setLastActiveModule, useStudentProgress } from "../lib/userProgress";

export default function SigmaHub() {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState<string>("Semua Distrik");
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [selectedModule, setSelectedModule] = useState<SigmaModule | null>(null);
  const { progressMap: userProgress } = useStudentProgress();

  const categoryTabs = [
    { key: "Semua Distrik", label: "Semua Distrik" },
    ...DISTRICTS.map((d) => ({ key: d.name, label: d.name })),
  ];

  // Handle URL search params from Dashboard or deep links
  useEffect(() => {
    const catParam = searchParams.get("category");
    const distParam = searchParams.get("district");
    const modParam = searchParams.get("module");
    const queryParam = searchParams.get("q");

    if (queryParam) {
      setSearchQuery(queryParam);
    }

    if (catParam) {
      const match = categoryTabs.find(
        (t) =>
          t.key.toLowerCase() === catParam.toLowerCase() ||
          t.key.toLowerCase().includes(catParam.toLowerCase())
      );
      if (match) {
        setActiveCategory(match.key);
      }
    } else if (distParam) {
      const distId = parseInt(distParam, 10);
      const foundDist = DISTRICTS.find((d) => d.id === distId);
      if (foundDist) {
        setActiveCategory(foundDist.name);
      }
    }

    if (modParam) {
      const found = MODULES.find((m) => m.id === modParam);
      if (found) {
        setSelectedModule(found);
        setLastActiveModule(found.id);
        // Also ensure appropriate district category tab is active
        const targetDist = DISTRICTS.find((d) => d.id === found.districtId);
        if (targetDist && activeCategory === "Semua Distrik") {
          // keep or focus
        }
      }
    }
  }, [searchParams]);

  const handleSelectCategory = (newCat: string) => {
    if (newCat === activeCategory) return;
    const currentIdx = categoryTabs.findIndex((t) => t.key === activeCategory);
    const newIdx = categoryTabs.findIndex((t) => t.key === newCat);
    setSlideDirection(newIdx > currentIdx ? 1 : -1);
    setActiveCategory(newCat);
  };

  // Filter modules based on search and district category
  const filteredDistricts = useMemo(() => {
    return DISTRICTS.filter((dist) => {
      // Category filter
      if (activeCategory !== "Semua Distrik") {
        if (dist.name !== activeCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const distMatch =
          dist.name.toLowerCase().includes(q) ||
          dist.guardian.toLowerCase().includes(q) ||
          dist.description.toLowerCase().includes(q);
        const modMatch = MODULES.some(
          (m) =>
            m.districtId === dist.id &&
            (m.title.toLowerCase().includes(q) ||
              m.subtitle.toLowerCase().includes(q) ||
              m.description.toLowerCase().includes(q))
        );
        return distMatch || modMatch;
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  const activeModule = getLastActiveModule();

  const completedDistrictsCount = useMemo(() => {
    let count = 0;
    for (let dId = 1; dId <= 5; dId++) {
      const dMods = MODULES.filter((m) => m.districtId === dId);
      const isCompleted = dMods.some(
        (m) => userProgress[m.id]?.completed || profile?.completed_modules?.includes(m.id)
      );
      if (isCompleted) {
        count++;
      } else {
        break;
      }
    }
    return Math.max(count, profile?.completed_modules?.length ?? 0);
  }, [userProgress, profile]);
  const progressPercent = Math.min(100, Math.round((completedDistrictsCount / 5) * 100));
  const isNewUser = completedDistrictsCount === 0;

  return (
    <StudentSpatialLayout
      activeDockItem="hub"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari modul, topik matematika, rumus TKA..."
      categoryTabs={categoryTabs}
      activeCategory={activeCategory}
      onSelectCategory={handleSelectCategory}
    >
      <div className="space-y-6 sm:space-y-7">
        {/* ================================================================== */}
        {/* INTEGRATED VIEW SWITCHER: DASHBOARD <-> SIGMA HUB                   */}
        {/* ================================================================== */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-0.5">
          <div
            className={`inline-flex items-center p-1 rounded-full border backdrop-blur-xl ${
              isDark ? "bg-[#141726]/80 border-white/10" : "bg-white/85 border-slate-300 shadow-sm"
            }`}
          >
            <Link
              to="/app/dashboard"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Ringkasan Dashboard</span>
            </Link>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black shadow-sm ${
                isDark ? "bg-white text-slate-950" : "bg-slate-900 text-white"
              }`}
            >
              <BookOpen size={15} />
              <span>Katalog Sigma Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-mono ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Sinkronisasi Progres Siswa
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* ================================================================== */}
        {/* 1. HERO BANNER: SPATIAL LEARNING HUB WELCOME                       */}
        {/* ================================================================== */}
        <div
          className={`relative overflow-hidden rounded-[28px] sm:rounded-[34px] border p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all ${
            isDark
              ? "border-white/[0.14] bg-gradient-to-r from-[#0d162d]/95 via-[#101b38]/85 to-[#0b1024]/90 text-white"
              : "border-slate-300 bg-gradient-to-r from-sky-100 via-white to-indigo-50 text-slate-900 shadow-md"
          }`}
        >
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3.5 py-1 font-mono text-xs sm:text-[13px] font-black text-cyan-600 dark:text-cyan-300 shadow-sm">
                  <Sparkles size={14} /> LEVEL {profile?.level || 1} GUARDIAN
                </span>
                <span
                  className={`rounded-full border px-3.5 py-1 font-mono text-xs sm:text-[13px] font-semibold ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-slate-300 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {profile?.class_name || "Kelas 11 A"} • MAS Darunnajah 9
                </span>
              </div>

              <h1
                className={`font-display text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight ${
                  isDark ? "text-white" : "text-slate-950"
                }`}
              >
                SIGMA{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500">
                  Learning Hub
                </span>
              </h1>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Pusat kurikulum dan bank modul matematika berorientasi Tes Kemampuan Akademik (TKA).
                Pelajari materi teoritis, diskusikan rumus esensial, dan tuntaskan simulasi kuis dengan
                target nilai kelulusan 75+.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to={`/app/materi/${activeModule.id}`}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black shadow-lg transition-all cursor-pointer ${
                    isDark
                      ? "bg-white text-slate-950 shadow-white/20 hover:bg-slate-200 hover:scale-105"
                      : "bg-slate-950 text-white shadow-slate-950/20 hover:bg-slate-800 hover:scale-105"
                  }`}
                >
                  <Play size={16} fill="currentColor" />
                  Lanjut Belajar: {activeModule.title.split(":")[0]}
                </Link>
                <Link
                  to="/app/dashboard"
                  className={`inline-flex items-center gap-2 rounded-full border px-4.5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                    isDark
                      ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm"
                  }`}
                >
                  <Home size={16} /> Dashboard Siswa
                </Link>
              </div>
            </div>

            {/* User XP & Milestone Stat Card */}
            <div
              className={`w-full lg:w-84 rounded-2xl border p-5 backdrop-blur-xl shadow-xl space-y-4 shrink-0 ${
                isDark
                  ? "border-white/15 bg-black/40 text-slate-100"
                  : "border-slate-200 bg-white/95 text-slate-900 shadow-md"
              }`}
            >
              {isNewUser ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-sm font-bold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Kemajuan Belajar
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30">
                      <Sparkles size={12} /> Siswa Baru
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark
                        ? "bg-white/[0.04] border-white/10"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <h4
                      className={`text-base font-bold flex items-center gap-2 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Compass size={17} className="text-cyan-500 shrink-0" />
                      Mulai distrik pertamamu
                    </h4>
                    <p
                      className={`text-sm mt-1.5 leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Jelajahi Distrik 01: Aljabar &amp; Matriks untuk memulai pembelajaran materi dan membuka distrik berikutnya.
                    </p>
                  </div>

                  <Link
                    to="/app/materi/mod-aljabar-1"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm py-2.5 px-4 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Play size={14} className="fill-current" />
                    <span>Mulai Distrik 01 Sekarang</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-sm font-bold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Kemajuan Belajar
                    </span>
                    <span className="font-mono text-sm text-cyan-600 dark:text-cyan-400 font-black">
                      {progressPercent}% Selesai
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className={`w-full rounded-full h-2.5 overflow-hidden ${
                      isDark ? "bg-white/10" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 shadow-[0_0_12px_#00f0ff]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div
                    className={`grid grid-cols-2 gap-2 pt-2 border-t text-center ${
                      isDark ? "border-white/10" : "border-slate-200"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div
                        className={`font-display text-xl sm:text-2xl font-black ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {completedDistrictsCount} / 5
                      </div>
                      <div
                        className={`text-xs font-mono mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Distrik Dikuasai
                      </div>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div
                        className={`font-display text-xl sm:text-2xl font-black ${
                          isDark ? "text-slate-300" : "text-slate-800"
                        }`}
                      >
                        {progressPercent}%
                      </div>
                      <div
                        className={`text-xs font-mono mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Tuntas Kurikulum
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 2. DISTRICT & MODULES CATALOG                                     */}
        {/* ================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`font-display text-xl sm:text-2xl font-black flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <Target size={20} className="text-cyan-500" /> 5 Distrik Pembelajaran SIGMA
              </h2>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Pilih distrik untuk meninjau silabus materi pembelajaran, trik cepat rumus, dan paket
                kuis TKA.
              </p>
            </div>
          </div>

          {/* Smooth Sliding Category Navigation Bar */}
          <div
            className={`relative p-1.5 rounded-2xl sm:rounded-full border backdrop-blur-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-sm ${
              isDark
                ? "bg-[#141726]/80 border-white/10"
                : "bg-slate-100/90 border-slate-200"
            }`}
          >
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSelectCategory(tab.key)}
                  className={`relative rounded-full px-4.5 py-2 text-sm font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap select-none flex items-center gap-2 ${
                    isActive
                      ? isDark
                        ? "text-slate-950 font-black"
                        : "text-white font-black"
                      : isDark
                      ? "text-slate-300 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-slate-950 hover:bg-white/70"
                  }`}
                >
                  {/* Sliding Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sigmaHubCategorySlidePill"
                      className={`absolute inset-0 rounded-full ${
                        isDark
                          ? "bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.45)]"
                          : "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 shadow-[0_4px_16px_rgba(8,145,178,0.35)]"
                      }`}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Smooth Sliding Content Transition */}
          <div className="relative overflow-hidden min-h-[360px]">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={activeCategory}
                custom={slideDirection}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? 55 : dir < 0 ? -55 : 0,
                    opacity: 0,
                    filter: "blur(4px)",
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    transition: {
                      x: { type: "spring", stiffness: 360, damping: 32 },
                      opacity: { duration: 0.25 },
                      filter: { duration: 0.25 },
                    },
                  },
                  exit: (dir: number) => ({
                    x: dir > 0 ? -55 : dir < 0 ? 55 : 0,
                    opacity: 0,
                    filter: "blur(4px)",
                    transition: {
                      x: { type: "spring", stiffness: 360, damping: 32 },
                      opacity: { duration: 0.18 },
                      filter: { duration: 0.18 },
                    },
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((dist, idx) => {
                    const districtModules = MODULES.filter((m) => m.districtId === dist.id);
                    const isCompleted = completedDistrictsCount >= dist.id;
                    const isUnlocked = dist.id === 1 || completedDistrictsCount >= dist.id - 1;
                    const isActive = isUnlocked && !isCompleted;
                    const isLocked = !isUnlocked;

                    return (
                      <motion.div
                        key={dist.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: isLocked ? 0.55 : 1, y: 0 }}
                        transition={{
                          delay: idx * 0.04,
                          duration: 0.26,
                          ease: "easeOut",
                        }}
                        className={`group relative flex flex-col justify-between rounded-[28px] p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 ${
                          isLocked
                            ? isDark
                              ? "opacity-55 border border-white/10 bg-[#121422]/60 shadow-[0_4px_16px_rgba(0,0,0,0.35)] text-slate-400"
                              : "opacity-55 border border-slate-300/70 bg-slate-100/70 shadow-[0_4px_12px_rgba(15,23,42,0.04)] text-slate-500"
                            : isDark
                            ? "opacity-100 border border-white/20 bg-[#16192a] shadow-[0_12px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-cyan-400/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] text-slate-100"
                            : "opacity-100 border border-slate-300 bg-white shadow-[0_8px_25px_rgba(15,23,42,0.08)] hover:border-cyan-600/50 hover:shadow-xl text-slate-900"
                        }`}
                      >
                        {/* Card Header */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            <span
                              className={`font-mono text-sm font-bold ${
                                isLocked
                                  ? isDark
                                    ? "text-slate-400"
                                    : "text-slate-500"
                                  : "text-cyan-600 dark:text-cyan-400"
                              }`}
                            >
                              DISTRIK 0{dist.id}
                            </span>

                            {isCompleted && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-[11px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                <Check size={12} className="stroke-[2.5]" />
                                <span>SELESAI</span>
                              </span>
                            )}
                            {isActive && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3 py-0.5 text-[11px] sm:text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                                <Play size={10} className="fill-current" />
                                <span>AKTIF</span>
                              </span>
                            )}
                            {isLocked && (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] sm:text-xs font-mono font-bold ${
                                  isDark
                                    ? "bg-white/5 border-white/10 text-slate-400"
                                    : "bg-slate-200/80 border-slate-300 text-slate-500"
                                }`}
                              >
                                <Lock size={11} />
                                <span>TERKUNCI</span>
                              </span>
                            )}
                          </div>

                          <h3
                            className={`font-display text-lg sm:text-xl font-bold transition-colors ${
                              isLocked
                                ? isDark
                                  ? "text-slate-400"
                                  : "text-slate-600"
                                : isDark
                                ? "text-white group-hover:text-cyan-300"
                                : "text-slate-900 group-hover:text-cyan-600"
                            }`}
                          >
                            {dist.name}
                          </h3>

                          {/* Description: Locked cards show unlock requirement; active cards show normal description */}
                          {isLocked ? (
                            <p
                              className={`text-sm mt-1.5 leading-relaxed font-medium ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              Selesaikan Distrik 0{dist.id - 1} untuk membuka.
                            </p>
                          ) : (
                            <p
                              className={`text-sm mt-1.5 leading-relaxed line-clamp-2 ${
                                isDark ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              {dist.description}
                            </p>
                          )}

                          {/* Guardian info: neutral in locked, unified cyan/slate in active */}
                          <div
                            className={`mt-3.5 flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-[13px] font-mono ${
                              isLocked
                                ? isDark
                                  ? "bg-white/[0.02] border-white/5 text-slate-500"
                                  : "bg-slate-100/50 border-slate-200 text-slate-400"
                                : isDark
                                ? "bg-white/[0.03] border-white/5 text-slate-300"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <Shield
                              size={14}
                              className={
                                isLocked
                                  ? "text-slate-500 dark:text-slate-500"
                                  : "text-cyan-500 dark:text-cyan-400"
                              }
                            />
                            <span>
                              Guardian:{" "}
                              <strong
                                className={
                                  isLocked
                                    ? isDark
                                      ? "text-slate-400"
                                      : "text-slate-600"
                                    : isDark
                                    ? "text-white"
                                    : "text-slate-900"
                                }
                              >
                                {dist.guardian}
                              </strong>
                            </span>
                          </div>

                          {/* Sub-modules or Locked Requirement Box (Rule 5) */}
                          {isLocked ? (
                            <div
                              className={`mt-4 rounded-xl border p-3.5 flex items-start gap-3 ${
                                isDark
                                  ? "bg-white/[0.02] border-white/5 text-slate-400"
                                  : "bg-slate-200/50 border-slate-300/70 text-slate-500"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-lg shrink-0 ${
                                  isDark ? "bg-white/5 text-slate-400" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                <Lock size={15} />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <span
                                  className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                                    isDark ? "text-slate-400" : "text-slate-500"
                                  }`}
                                >
                                  Syarat Akses Materi
                                </span>
                                <p
                                  className={`text-sm font-semibold ${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                  }`}
                                >
                                  Selesaikan Distrik 0{dist.id - 1} untuk membuka.
                                </p>
                                <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                                  Tuntaskan modul &amp; raih skor kelulusan kuis minimal 75 pada distrik sebelumnya untuk membuka akses.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 space-y-2">
                              <span
                                className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                Modul &amp; Bahasan:
                              </span>
                              {districtModules.length > 0 ? (
                                districtModules.slice(0, 3).map((mod) => {
                                  const prog = userProgress[mod.id];
                                  return (
                                    <div
                                      key={mod.id}
                                      onClick={() => setSelectedModule(mod)}
                                      className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all cursor-pointer group/mod ${
                                        isDark
                                          ? "bg-white/[0.03] border-white/5 hover:border-cyan-400/40 hover:bg-white/[0.07]"
                                          : "bg-slate-50 border-slate-200 hover:border-cyan-500/60 hover:bg-cyan-50/40"
                                      }`}
                                    >
                                      <div className="truncate pr-2">
                                        <span
                                          className={`font-semibold block truncate transition-colors ${
                                            isDark
                                              ? "text-white group-hover/mod:text-cyan-300"
                                              : "text-slate-900 group-hover/mod:text-cyan-700"
                                          }`}
                                        >
                                          {mod.title.split(":")[0]}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span
                                            className={`text-xs block truncate ${
                                              isDark ? "text-slate-400" : "text-slate-500"
                                            }`}
                                          >
                                            {mod.subtitle}
                                          </span>
                                          {prog && prog.percent > 0 && (
                                            <span className="text-[11px] font-mono font-bold text-cyan-500">
                                              • {prog.percent}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {prog?.completed ? (
                                          <CheckCircle2 size={15} className="text-emerald-500" />
                                        ) : (
                                          <span className="font-mono text-xs text-slate-400 font-medium">
                                            {mod.durationMinutes} mnt
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-xs text-slate-500 italic py-1">
                                  Modul sedang disiapkan dewan guru.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div
                          className={`mt-5 pt-4 border-t flex items-center justify-between gap-2 ${
                            isDark ? "border-white/10" : "border-slate-200"
                          }`}
                        >
                          <span
                            className={`text-xs sm:text-sm font-mono ${
                              isLocked
                                ? isDark
                                  ? "text-slate-500"
                                  : "text-slate-400"
                                : isDark
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            Target Skor:{" "}
                            <strong
                              className={
                                isLocked
                                  ? isDark
                                    ? "text-slate-400"
                                    : "text-slate-500"
                                  : isDark
                                  ? "text-white"
                                  : "text-slate-900"
                              }
                            >
                              75+
                            </strong>
                          </span>

                          {isLocked ? (
                            /* Rule 4: Tombol kartu terkunci outline tipis, teks abu-abu, cursor not-allowed, label "Terkunci" dengan ikon gembok */
                            <button
                              type="button"
                              disabled
                              aria-disabled="true"
                              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold cursor-not-allowed select-none transition-none ${
                                isDark
                                  ? "border-white/10 bg-transparent text-slate-500"
                                  : "border-slate-300 bg-transparent text-slate-400"
                              }`}
                            >
                              <Lock size={13} className="shrink-0" />
                              <span>Terkunci</span>
                            </button>
                          ) : districtModules.length > 0 ? (
                            /* Rule 3: Satu warna accent konsisten untuk semua tombol aktif */
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedModule(districtModules[0])}
                                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                                  isDark
                                    ? "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                                    : "border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                                }`}
                              >
                                Detail
                              </button>
                              <Link
                                to={`/app/materi/${districtModules[0].id}`}
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-black text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-all hover:scale-105 cursor-pointer shadow-md shadow-cyan-500/20"
                              >
                                Buka Materi <ChevronRight size={15} />
                              </Link>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">Segera Hadir</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Tidak ada distrik matematika yang cocok dengan filter pencarian &amp; kategori ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        handleSelectCategory("Semua Distrik");
                      }}
                      className="mt-4 px-4 py-2 rounded-full text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-md"
                    >
                      Reset Filter &amp; Tampilkan Semua Distrik
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. MODAL DETAIL POPUP                                             */}
        {/* ================================================================== */}
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
            <div
              className={`relative w-full max-w-lg rounded-3xl border p-6 shadow-2xl backdrop-blur-2xl ${
                isDark
                  ? "border-white/20 bg-[#141726]/95 text-slate-100"
                  : "border-slate-300 bg-white/95 text-slate-900"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className={`absolute top-5 right-5 cursor-pointer ${
                  isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-950"
                }`}
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-400/15 border border-cyan-400/30 px-3 py-0.5 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-300">
                  MODUL TKA
                </span>
                <span
                  className={`font-mono text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {selectedModule.durationMinutes} Menit Pembelajaran
                </span>
              </div>

              <h3
                className={`font-display text-xl sm:text-2xl font-black mt-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {selectedModule.title}
              </h3>
              <p className="text-sm text-cyan-600 dark:text-cyan-300 font-mono mt-0.5">
                {selectedModule.subtitle}
              </p>

              <div
                className={`mt-4 p-4 rounded-2xl border text-sm leading-relaxed ${
                  isDark
                    ? "bg-white/5 border-white/10 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {selectedModule.description}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-xs font-mono block ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Estimasi Waktu
                  </span>
                  <span
                    className={`font-bold mt-0.5 flex items-center gap-1.5 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    <Clock size={14} className="text-cyan-500" /> {selectedModule.durationMinutes} Menit
                  </span>
                </div>
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-xs font-mono block ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Target Kelulusan
                  </span>
                  <span
                    className={`font-bold mt-0.5 flex items-center gap-1.5 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    <CheckCircle2 size={14} className="text-emerald-500" /> Skor 75+
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedModule(null)}
                  className={`rounded-full border px-4.5 py-2 text-sm font-semibold cursor-pointer ${
                    isDark
                      ? "border-white/15 text-slate-300 hover:text-white"
                      : "border-slate-300 text-slate-700 hover:text-slate-950"
                  }`}
                >
                  Tutup
                </button>
                <Link
                  to={`/app/materi/${selectedModule.id}`}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black shadow-lg transition-all cursor-pointer ${
                    isDark
                      ? "bg-white text-slate-950 hover:bg-slate-200"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  <Play size={15} fill="currentColor" /> Masuk Belajar
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentSpatialLayout>
  );
}
