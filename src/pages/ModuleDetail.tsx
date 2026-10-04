import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Play,
  CheckCircle,
  ArrowLeft,
  Clock,
  Zap,
  Sparkles,
  ChevronRight,
  Compass,
  FileText,
  Lock,
  AlertCircle,
  Award,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { MODULES } from "../lib/sigmaData";
import { Badge } from "../components/Primitives";
import { useTheme } from "../lib/theme";
import { getMaterialMetaSync } from "../lib/pdfStorage";
import { useStudentProgress, getModuleUnlockStatus, MIN_PASSING_SCORE } from "../lib/userProgress";
import {
  getAssessmentResult,
  calculateNGain,
} from "../lib/testAssessmentData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ModuleDetail() {
  const { id, moduleId } = useParams();
  const currentId = moduleId || id;
  const { isDark } = useTheme();
  const moduleData = MODULES.find((m) => m.id === currentId) || MODULES[0];
  const customMeta = getMaterialMetaSync(moduleData.id);
  const displayTitle = customMeta?.title || moduleData.title;
  const displayDesc = customMeta?.description || moduleData.description;
  const displayDuration = customMeta?.durationMinutes || moduleData.durationMinutes;
  const displayPages = customMeta?.pageCount || moduleData.slides.length;
  const isCustomPdf = customMeta?.isCustomPdf;
  const { userProgress } = useStudentProgress();
  const lockStatus = getModuleUnlockStatus(moduleData.id, userProgress);
  const isLocked = !lockStatus.isUnlocked;

  // Pre-test & Post-test state for Bab 1
  const isBab1 = moduleData.id === "mod-aljabar-1" || moduleData.districtId === 1;
  const [assessmentUpdated, setAssessmentUpdated] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setAssessmentUpdated((v) => v + 1);
    window.addEventListener("sigma_assessment_updated", handleUpdate);
    return () => window.removeEventListener("sigma_assessment_updated", handleUpdate);
  }, []);

  const pretest = isBab1 ? getAssessmentResult("mod-aljabar-1", "pretest") : null;
  const posttest = isBab1 ? getAssessmentResult("mod-aljabar-1", "posttest") : null;
  const quizScore = userProgress[moduleData.id]?.quizScore ?? 0;
  const isQuizPassed = Boolean(quizScore >= MIN_PASSING_SCORE);
  const nGain = pretest && posttest ? calculateNGain(pretest.score, posttest.score) : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-0"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/app/dashboard"
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer group ${
            isDark ? "text-slate-300 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600"
          }`}
        >
          <motion.span
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </motion.span>
        </Link>

        <Link
          to="/app/hub"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            isDark ? "text-slate-400 hover:text-cyan-300" : "text-slate-500 hover:text-cyan-700"
          }`}
        >
          <Compass size={14} className="text-cyan-500" />
          <span>Koleksi Modul di Sigma Hub</span>
        </Link>
      </motion.div>

      {/* Main Glass Card */}
      <motion.div
        variants={itemVariants}
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-xl transition-all ${
          isDark
            ? "border-white/15 bg-gradient-to-br from-[#0d1430]/95 via-[#0c1228]/90 to-[#070a16]/95 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            : "border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/30 text-slate-900 shadow-xl"
        }`}
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="cyan">{moduleData.districtName}</Badge>
            {isLocked && (
              <span className="rounded-full border border-rose-500/50 bg-rose-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-rose-300 flex items-center gap-1.5 shadow-sm">
                <Lock size={12} /> Modul Terkunci (Butuh Nilai Bab 1 ≥ 70)
              </span>
            )}
            {isCustomPdf ? (
              <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <Sparkles size={11} /> Dokumen PDF Guru Aktif
              </span>
            ) : (
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-300"
                    : "border-slate-300 bg-white text-slate-700 shadow-sm"
                }`}
              >
                Target TKA: Skor 70+
              </span>
            )}
          </div>

          <h1
            className={`mt-4 font-display text-2xl sm:text-4xl font-black leading-tight ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            {displayTitle}
          </h1>
          <p
            className={`mt-2.5 text-sm sm:text-base leading-relaxed max-w-2xl ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {displayDesc}
          </p>

          {/* Locked Notice Banner */}
          {isLocked && (
            <div className="mt-5 p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase tracking-wider">
                <Lock size={15} className="stroke-[2.5]" />
                <span>Akses Bab Ini Masih Terkunci</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lockStatus.reason}
              </p>
              <div className="text-[11px] font-mono text-amber-300 font-semibold pt-1 border-t border-rose-500/20 flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0" />
                <span>Syarat Kelulusan: Tuntaskan Bab 1 (Bilangan) dan raih nilai kuis minimal 70 (nilai 7)</span>
              </div>
            </div>
          )}

          <div
            className={`mt-6 flex flex-wrap items-center gap-4 text-xs font-mono border-y py-3.5 ${
              isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-cyan-500" /> {displayDuration} Menit Estimasi
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-400" /> {displayPages} Halaman Dokumen
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" /> {moduleData.quiz.length} Soal Evaluasi
            </span>
          </div>

          {/* Action Buttons with Micro-interactions */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            {isLocked ? (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/app/materi/mod-aljabar-1"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                  >
                    <Play size={15} className="fill-black" />
                    <span>Kerjakan Bab 1 Sekarang</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/app/kuis/mod-aljabar-1"
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                        : "border-cyan-500/40 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 shadow-sm"
                    }`}
                  >
                    <span>Kuis Bab 1 (Nilai ≥ 70)</span>
                  </Link>
                </motion.div>
              </>
            ) : isBab1 && !pretest ? (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/app/pretest/mod-aljabar-1"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                  >
                    <Zap size={15} className="fill-black" />
                    <span>Wajib: Isi Pre-Test Dulu</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/app/pretest/mod-aljabar-1"
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isDark
                        ? "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-500 hover:text-slate-900 shadow-sm"
                    }`}
                  >
                    <Lock size={13} />
                    <span>Modul PDF (Terkunci)</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/app/pretest/mod-aljabar-1"
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isDark
                        ? "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-500 hover:text-slate-900 shadow-sm"
                    }`}
                  >
                    <Lock size={13} />
                    <span>Kuis TKA (Terkunci)</span>
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={`/app/materi/${moduleData.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                  >
                    <FileText size={15} />
                    <span>Buka Modul PDF ({displayPages} Halaman)</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={`/app/kuis/${moduleData.id}`}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                        : "border-cyan-500/40 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 shadow-sm"
                    }`}
                  >
                    <Play size={15} fill="currentColor" />
                    <span>Mulai Kuis TKA</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={`/app/kuis/${moduleData.id}`}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isDark
                        ? "border-white/15 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    <span>Langsung Uji Kuis</span>
                    <ChevronRight size={14} />
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3-Stage Assessment Journey for Bab 1 */}
      {isBab1 && (
        <motion.div
          variants={itemVariants}
          className={`rounded-3xl border p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-5 transition-all ${
            isDark
              ? "border-cyan-500/25 bg-gradient-to-br from-[#0c1430] via-[#090e24] to-[#060a17] text-white"
              : "border-cyan-100 bg-gradient-to-br from-white via-cyan-50/30 to-slate-50 text-slate-900 shadow-md"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-white/10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <Sparkles size={13} />
                Alur Evaluasi Terpadu Bab 1 (Pre-Test & Post-Test)
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                Alur Belajar: Pre-Test $\to$ Modul/Kuis $\to$ Post-Test
              </h2>
            </div>
            {nGain && (
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <TrendingUp size={13} /> N-Gain: {nGain.nGain} ({nGain.category})
              </span>
            )}
          </div>

          {/* 3 Interactive Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Pre-Test */}
            <div
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                pretest
                  ? isDark
                    ? "border-emerald-500/30 bg-emerald-500/10 text-white"
                    : "border-emerald-200 bg-emerald-50/60 text-slate-900"
                  : isDark
                  ? "border-cyan-400/40 bg-cyan-400/10 text-white ring-1 ring-cyan-400/30"
                  : "border-cyan-400 bg-cyan-50 text-slate-900 ring-1 ring-cyan-300"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-400">
                    Tahap 1 • Sebelum Modul
                  </span>
                  {pretest ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Skor: {pretest.score}/100
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold">
                      Wajib Diikuti
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                  <Zap size={15} className="text-cyan-400" />
                  Pre-Test Diagnostik
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {pretest
                    ? "Kamu telah menyelesaikan pemetaan kemampuan awal sebelum membaca materi."
                    : "Ukur penguasaan dasar bilangan dan eksponen sebelum mempelajari 14 slide materi."}
                </p>
              </div>

              <div className="pt-4">
                <Link
                  to="/app/pretest/mod-aljabar-1"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    pretest
                      ? isDark
                        ? "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  }`}
                >
                  <span>{pretest ? "Lihat Review Pre-Test" : "Mulai Pre-Test Sekarang"}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Step 2: Learning & Quiz */}
            <div
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isDark
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-400">
                    Tahap 2 • Materi & Latihan
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      !pretest
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"
                        : isQuizPassed
                        ? "bg-emerald-500/20 text-emerald-300"
                        : quizScore > 0
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {!pretest ? (
                      <>
                        <Lock size={10} /> Butuh Pre-Test
                      </>
                    ) : isQuizPassed ? (
                      `Lolos Kuis (${quizScore}/100)`
                    ) : quizScore > 0 ? (
                      `Kuis: ${quizScore} (KKM 70)`
                    ) : (
                      "Belum Kuis"
                    )}
                  </span>
                </div>
                <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                  <BookOpen size={15} className="text-blue-400" />
                  Modul PDF & Kuis Bab 1
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {!pretest
                    ? "Materi modul dan kuis evaluasi terkunci. Selesaikan Pre-Test terlebih dahulu untuk membuka akses."
                    : "Pelajari 14 slide materi bilangan dan kerjakan kuis TKA dengan batas kelulusan minimal nilai 70."}
                </p>
              </div>

              <div className="pt-4 flex gap-2">
                {!pretest ? (
                  <Link
                    to="/app/pretest/mod-aljabar-1"
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 transition-all cursor-pointer"
                  >
                    <Lock size={13} />
                    <span>Wajib Isi Pre-Test Terlebih Dahulu</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/app/materi/mod-aljabar-1"
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        isDark
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                          : "border-cyan-500/40 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                      }`}
                    >
                      <FileText size={13} />
                      <span>Modul</span>
                    </Link>
                    <Link
                      to="/app/kuis/mod-aljabar-1"
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        isDark
                          ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Play size={13} />
                      <span>Kuis</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Step 3: Post-Test */}
            <div
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                posttest
                  ? isDark
                    ? "border-purple-500/40 bg-purple-500/10 text-white"
                    : "border-purple-200 bg-purple-50/70 text-slate-900"
                  : isQuizPassed
                  ? isDark
                    ? "border-purple-400 bg-purple-500/15 text-white ring-1 ring-purple-400/30"
                    : "border-purple-400 bg-purple-50 text-slate-900 ring-1 ring-purple-300"
                  : isDark
                  ? "border-white/5 bg-black/20 text-slate-500 opacity-60"
                  : "border-slate-200 bg-slate-100 text-slate-400 opacity-70"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-400">
                    Tahap 3 • Setelah Lolos Kuis
                  </span>
                  {posttest ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                      Skor: {posttest.score}/100
                    </span>
                  ) : isQuizPassed ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold animate-pulse">
                      Terbuka!
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 flex items-center gap-1 font-bold">
                      <Lock size={10} /> Butuh Kuis ≥ 70
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                  <Award size={15} className="text-purple-400" />
                  Post-Test Akhir
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {posttest
                    ? "Evaluasi retensi pemahaman tuntas. Skor siap dikomparasi dengan pre-test."
                    : isQuizPassed
                    ? "Kuis Bab 1 sudah lolos! Uji retensi akhir untuk melihat kenaikan kompetensi."
                    : "Post-test otomatis terbuka setelah kamu menyelesaikan kuis Bab 1 dengan nilai ≥ 70."}
                </p>
              </div>

              <div className="pt-4">
                {isQuizPassed ? (
                  <Link
                    to="/app/posttest/mod-aljabar-1"
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      posttest
                        ? isDark
                          ? "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        : "bg-gradient-to-r from-purple-500 to-cyan-400 hover:opacity-95 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    }`}
                  >
                    <span>{posttest ? "Lihat Hasil Post-Test" : "Mulai Post-Test Sekarang"}</span>
                    <ChevronRight size={14} />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 border border-white/5 bg-white/5 text-slate-500 cursor-not-allowed"
                  >
                    <Lock size={13} />
                    <span>Terkunci</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Curriculum Breakdown with Staggered Items */}
      <motion.div variants={itemVariants} className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3
            className={`font-display text-lg font-bold flex items-center gap-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <BookOpen size={18} className="text-cyan-500" />
            <span>Sub-Topik Pembelajaran</span>
          </h3>
          <span
            className={`text-xs font-mono ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {moduleData.slides.length} Bagian
          </span>
        </div>

        <motion.div variants={containerVariants} className="space-y-2.5">
          {moduleData.slides.map((s, idx) => (
            <motion.div
              key={s.id}
              variants={itemVariants}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`flex items-center justify-between rounded-2xl border p-4 transition-all shadow-sm ${
                isDark
                  ? "border-white/10 bg-[#0a0f24]/70 hover:border-cyan-400/40 hover:bg-[#0e1533]/80"
                  : "border-slate-200/90 bg-white hover:border-cyan-500/60 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-xl font-mono text-xs font-black shrink-0 ${
                    isDark ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/20" : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {s.title}
                  </h4>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Bagian {idx + 1} dari silabus terintegrasi
                  </p>
                </div>
              </div>

              <Link
                to={`/app/materi/${moduleData.id}?slide=${idx}`}
                className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-full transition-all shrink-0 ${
                  isDark
                    ? "bg-white/5 text-cyan-300 hover:bg-cyan-400/20 hover:text-cyan-200"
                    : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:text-cyan-800"
                }`}
              >
                <span>Baca Slide</span>
                <ChevronRight size={12} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Tip Guidance Card */}
      <motion.div
        variants={itemVariants}
        className={`rounded-2xl border p-4 text-xs flex items-start gap-3 ${
          isDark
            ? "border-cyan-500/20 bg-cyan-500/5 text-slate-300"
            : "border-cyan-200 bg-cyan-50/60 text-slate-700"
        }`}
      >
        <Sparkles size={16} className="text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <span className={`font-bold ${isDark ? "text-cyan-300" : "text-cyan-900"}`}>
            Tips Belajar Mandiri:
          </span>{" "}
          Pahami konsep kunci pada tiap slide dan selesaikan kuis dengan nilai minimal 75 untuk membuka sertifikasi capaian distrik matematika ini.
        </div>
      </motion.div>
    </motion.div>
  );
}
