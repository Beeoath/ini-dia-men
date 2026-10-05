import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, Clock, Lock, AlertCircle, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MODULES } from "../lib/sigmaData";
import { ProgressBar } from "../components/Primitives";
import { useTheme } from "../lib/theme";
import { recordQuizCompletion, useStudentProgress, getModuleUnlockStatus } from "../lib/userProgress";
import { FormattedMathText } from "../components/MathView";
import { useAuth } from "../lib/auth";
import { getAssessmentResult } from "../lib/testAssessmentData";
import { supabase } from "../lib/supabaseClient";

export default function Quiz() {
  const { id, moduleId } = useParams();
  const currentId = moduleId || id;
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { profile, addXp } = useAuth();

  const moduleData = MODULES.find((m) => m.id === currentId) || MODULES[0];
  const { userProgress } = useStudentProgress();
  const lockStatus = getModuleUnlockStatus(moduleData.id, userProgress);
  const isLocked = !lockStatus.isUnlocked;
  const questions = moduleData.quiz;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  // Countdown timer configurations from Supabase quiz_settings
  const [timerLoading, setTimerLoading] = useState<boolean>(true);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  useEffect(() => {
    let active = true;

    const loadTimerSettings = async () => {
      setTimerLoading(true);
      try {
        const { data, error } = await supabase
          .from("quiz_settings")
          .select("timer_enabled, time_limit")
          .eq("module_id", moduleData.id)
          .maybeSingle();

        if (error) {
          console.error("[Quiz] Gagal memuat quiz_settings:", error);
          toast.error("Gagal memuat pengaturan timer kuis dari server.");
          if (active) {
            setTimerEnabled(false);
            setTimerLoading(false);
          }
          return;
        }

        if (active) {
          if (data) {
            const enabled = Boolean(data.timer_enabled);
            const limit =
              typeof data.time_limit === "number" && data.time_limit > 0
                ? data.time_limit
                : moduleData.quizTimeLimitMinutes || 15;
            setTimerEnabled(enabled);
            setTimeLimitMinutes(limit);
            setTimeLeft(limit * 60);
          } else {
            // Kalau tidak ada baris, anggap timer nonaktif
            setTimerEnabled(false);
            setTimeLimitMinutes(moduleData.quizTimeLimitMinutes || 15);
            setTimeLeft((moduleData.quizTimeLimitMinutes || 15) * 60);
          }
          setTimerLoading(false);
        }
      } catch (err) {
        console.error("[Quiz] Exception saat memuat quiz_settings:", err);
        toast.error("Terjadi kesalahan saat memuat konfigurasi kuis.");
        if (active) {
          setTimerEnabled(false);
          setTimerLoading(false);
        }
      }
    };

    loadTimerSettings();

    return () => {
      active = false;
    };
  }, [moduleData.id, moduleData.quizTimeLimitMinutes]);

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isLast = currentIdx === questions.length - 1;

  const handleSelect = (optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleSubmit = async (isTimeout = false) => {
    let correctCount = 0;
    questions.forEach((question, idx) => {
      if (selectedAnswers[idx] === question.correctAnswer) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    sessionStorage.setItem(
      `quiz_result_${moduleData.id}`,
      JSON.stringify({
        score,
        correctCount,
        total: questions.length,
        selectedAnswers,
        isTimeout,
        timeLimitMinutes: timerEnabled ? timeLimitMinutes : null,
        completedAt: new Date().toISOString(),
      })
    );

    if (profile) {
      await recordQuizCompletion(profile.id, moduleData.id, score);
      if (score > 0) {
        // Tambah XP melalui RPC add_xp(amount) maksimal 100 per panggilan
        const earnedXp = Math.min(100, Math.max(10, score));
        addXp(earnedXp);
      }
    }

    navigate(`/app/hasil-kuis/${moduleData.id}`);
  };

  // Countdown interval
  useEffect(() => {
    if (!timerEnabled) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, timeLeft]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isBab1 = moduleData.id === "mod-aljabar-1" || moduleData.districtId === 1;
  const pretest = isBab1 ? getAssessmentResult("mod-aljabar-1", "pretest") : null;
  const isPretestMissing = isBab1 && !pretest;

  if (isPretestMissing) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div
          className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl border shadow-lg ${
            isDark
              ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.25)]"
              : "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-cyan-100"
          }`}
        >
          <Lock size={38} className="stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold border border-cyan-400/40 bg-cyan-400/10 text-cyan-400 uppercase tracking-wider">
            Pre-Test Wajib Diisi Terlebih Dahulu
          </span>
          <h1
            className={`font-display text-2xl sm:text-3xl font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Kuis {moduleData.title}
          </h1>
          <p
            className={`text-sm leading-relaxed max-w-md mx-auto pt-2 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Sebelum mengerjakan kuis evaluasi Bab 1, kamu <strong>wajib mengisi Pre-Test Persepsi & Pengalaman Belajar</strong> terlebih dahulu.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app/pretest/mod-aljabar-1"
            className="px-7 py-3 rounded-full text-xs font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/30 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Isi Pre-Test Sekarang</span>
          </Link>
          <Link
            to={`/app/modul/${moduleData.id}`}
            className={`px-5 py-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isDark ? "border-white/10 text-slate-300 hover:text-white" : "border-slate-300 text-slate-600 hover:text-slate-900"
            }`}
          >
            Kembali ke Detail Bab
          </Link>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div
          className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl border shadow-lg ${
            isDark
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-rose-50 border-rose-200 text-rose-600"
          }`}
        >
          <Lock size={38} className="stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold border border-rose-500/30 bg-rose-500/10 text-rose-400 uppercase">
            Kuis Terkunci
          </span>
          <h1
            className={`font-display text-2xl sm:text-3xl font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            {moduleData.title}
          </h1>
          <p
            className={`text-sm leading-relaxed max-w-md mx-auto pt-2 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {lockStatus.reason}
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium space-y-1.5 max-w-md mx-auto ${
            isDark
              ? "bg-amber-400/10 border-amber-400/30 text-amber-200"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 font-bold font-mono">
            <AlertCircle size={15} />
            <span>Syarat Kelulusan KKM</span>
          </div>
          <p className="text-xs">
            Kamu harus menyelesaikan Bab 1 (Bilangan) dan meraih nilai kuis minimal 70 (nilai 7) terlebih dahulu sebelum dapat mengikuti kuis bab ini.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app/materi/mod-aljabar-1"
            className="px-6 py-3 rounded-full text-xs font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20 flex items-center gap-2 cursor-pointer"
          >
            <Play size={14} className="fill-black" />
            <span>Kerjakan Bab 1 Sekarang</span>
          </Link>
          <Link
            to="/app/kuis/mod-aljabar-1"
            className={`px-5 py-3 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isDark
                ? "border-white/15 bg-white/5 text-slate-200 hover:text-white"
                : "border-slate-300 bg-white text-slate-700 hover:text-slate-950"
            }`}
          >
            <span>Kuis Bab 1 (Nilai ≥ 70)</span>
          </Link>
          <Link
            to="/app/dashboard"
            className={`px-5 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (timerLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <span className="font-mono text-xs text-slate-400">Memuat konfigurasi kuis...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 sm:py-6 px-3 sm:px-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/app/modul/${moduleData.id}`}
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
            isDark ? "text-slate-300 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600"
          }`}
        >
          <ArrowLeft size={16} /> Batal Kuis
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Timer Display for Student */}
          {timerEnabled ? (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition-all ${
                timeLeft <= 60
                  ? "border-rose-500/50 bg-rose-500/15 text-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                  : timeLeft <= 180
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                  : isDark
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                  : "border-cyan-300 bg-cyan-50 text-cyan-800"
              }`}
            >
              <Clock size={13} className={timeLeft <= 60 ? "animate-spin" : ""} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-mono ${
                isDark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              <Clock size={12} />
              <span>Tanpa Batas Waktu</span>
            </div>
          )}

          <span
            className={`font-mono text-xs font-bold pl-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Soal {currentIdx + 1}/{questions.length}
          </span>
        </div>
      </div>

      <ProgressBar progress={progress} color="#00F0FF" />

      <div
        className={`rounded-3xl border p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 transition-all ${
          isDark
            ? "border-white/15 bg-[#0d1430]/90 text-slate-100"
            : "border-slate-200 bg-white text-slate-900 shadow-xl"
        }`}
      >
        <div>
          <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
            {moduleData.title}
          </span>
          <h2
            className={`mt-2 text-base sm:text-lg font-bold leading-relaxed ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            <FormattedMathText text={q.question} />
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentIdx] === optIdx;
            const letters = ["A", "B", "C", "D", "E"];

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelect(optIdx)}
                className={`w-full text-left flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? "border-cyan-400 bg-cyan-400/15 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      : "border-cyan-600 bg-cyan-50 text-cyan-950 font-medium shadow-sm"
                    : isDark
                    ? "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold ${
                    isSelected
                      ? "bg-cyan-400 text-slate-950 font-black"
                      : isDark
                      ? "bg-white/10 text-slate-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {letters[optIdx]}
                </span>
                <span className="text-sm font-medium">
                  <FormattedMathText text={opt} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div
          className={`flex items-center justify-between pt-6 border-t ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark
                ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                : "border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Sebelumnya
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={selectedAnswers[currentIdx] === undefined}
              className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-400/20"
                  : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-600/20"
              }`}
            >
              <Send size={15} /> Selesaikan Kuis
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => prev + 1)}
              disabled={selectedAnswers[currentIdx] === undefined}
              className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-400/20"
                  : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-600/20"
              }`}
            >
              Soal Selanjutnya
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
