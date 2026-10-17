import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ChevronRight,
  Send,
  User,
  GraduationCap,
  HelpCircle,
  XCircle,
  AlertCircle,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import {
  PRETEST_QUESTIONS,
  fetchUserAssessmentResult,
  insertPretestAssessmentResult,
  AssessmentResultRow,
} from "../lib/testAssessmentData";

export default function Pretest() {
  const { id } = useParams();
  const moduleId = id || "mod-aljabar-1";
  const { isDark } = useTheme();
  const { user, profile } = useAuth();

  // Loading state
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [existingResult, setExistingResult] = useState<AssessmentResultRow | null>(null);

  // Form answer states: { 1: "C", 2: "C", ... }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if student has already completed the pretest in database
  useEffect(() => {
    let active = true;

    const checkExisting = async () => {
      if (!user) {
        setLoadingInitial(false);
        return;
      }
      try {
        const result = await fetchUserAssessmentResult(user.id, moduleId, "pretest");
        if (active && result) {
          setExistingResult(result);
          // Pre-populate answers from database record
          const mapped: Record<number, string> = {};
          Object.entries(result.answers || {}).forEach(([k, v]) => {
            mapped[Number(k)] = v;
          });
          setSelectedAnswers(mapped);
        }
      } catch (err) {
        console.error("[Pretest] Error checking existing pretest:", err);
      } finally {
        if (active) setLoadingInitial(false);
      }
    };

    checkExisting();

    return () => {
      active = false;
    };
  }, [user, moduleId]);

  const allAnswered =
    PRETEST_QUESTIONS.length > 0 &&
    PRETEST_QUESTIONS.every((q) => Boolean(selectedAnswers[q.id]));

  const canSubmit = allAnswered && !isSubmitting && !existingResult;

  const handleSelectOption = (questionId: number, letter: string) => {
    if (existingResult || isSubmitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: letter,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sesi pengguna tidak valid. Silakan masuk kembali.");
      return;
    }
    if (!allAnswered) {
      toast.error("Harap jawab semua soal sebelum mengirimkan jawaban.");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedResult = await insertPretestAssessmentResult({
        userId: user.id,
        moduleId,
        answers: selectedAnswers,
      });

      toast.success("Pre-Test berhasil dikirim dan disimpan!");
      setExistingResult(savedResult);
    } catch (err: any) {
      console.error("[Pretest] Gagal menyimpan pretest:", {
        code: err?.code || "PRETEST_INSERT_ERROR",
        message: err?.message,
        details: err?.details || err,
      });
      toast.error(
        `Gagal menyimpan hasil Pre-Test: ${err?.message || "Terjadi kesalahan pada server."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto" />
        <p className="font-mono text-xs text-slate-400">
          Memeriksa status Pre-Test dari database server...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-6">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-white/10">
        <Link
          to={`/app/modul/${moduleId}`}
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
            isDark ? "text-slate-400 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600"
          }`}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Detail Modul Bab 1</span>
        </Link>

        <span className="font-mono text-xs font-bold text-cyan-400">
          {existingResult ? "STATUS: SUDAH SELESAI" : "STATUS: BELUM SELESAI"}
        </span>
      </div>

      {/* ================= COMPLETED REVIEW VIEW ================= */}
      {existingResult ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Summary Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden backdrop-blur-xl ${
              isDark
                ? "border-cyan-500/30 bg-gradient-to-b from-[#0e1738] to-[#080d1f] text-white"
                : "border-cyan-200 bg-white text-slate-900 shadow-xl"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Pre-Test Diagnostik Selesai Disimpan di Database</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
                  Review Hasil Pre-Test Bab 1: Bilangan
                </h1>
                <p className={`text-xs max-w-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Hasil telah dicatat untuk memetakan pemahaman awal. Pre-test ini hanya dapat dikerjakan sekali. Akses modul Bab 1 telah terbuka penuh!
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                  <span className="text-slate-400">
                    Siswa: <strong className="text-white">{profile?.full_name || "Siswa"}</strong>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">
                    Kelas: <strong className="text-cyan-400">{profile?.class_name || "XI"}</strong>
                  </span>
                </div>
              </div>

              {/* Score Display Card */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 shrink-0 min-w-[160px]">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">
                  Skor Pre-Test
                </span>
                <span className="font-display text-4xl sm:text-5xl font-black text-cyan-400 mt-1">
                  {existingResult.score}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-300 mt-1">
                  {existingResult.correct_count} / {existingResult.total_questions} Benar
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <Sparkles size={14} /> Modul &amp; Kuis Terbuka
              </div>
              <Link
                to={`/app/materi/${moduleId}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/25 transition-all cursor-pointer"
              >
                <BookOpen size={15} />
                <span>Lanjut Buka Modul Bab 1 Sekarang</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <HelpCircle size={16} />
                <span>Ulasan Jawaban Siswa (5 Soal)</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">
                Kunci Jawaban Resmi Bab 1
              </span>
            </div>

            {PRETEST_QUESTIONS.map((q, idx) => {
              const studentAnswer = existingResult.answers?.[String(q.id)];
              const isCorrect = studentAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-3xl border shadow-md transition-all ${
                    isCorrect
                      ? isDark
                        ? "border-emerald-500/30 bg-[#0d1c2a]/80"
                        : "border-emerald-200 bg-emerald-50/40"
                      : isDark
                      ? "border-rose-500/30 bg-[#24101d]/80"
                      : "border-rose-200 bg-rose-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-xl font-mono text-xs font-black shrink-0 ${
                          isCorrect
                            ? "bg-emerald-400 text-slate-950 font-black"
                            : "bg-rose-400 text-slate-950 font-black"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <p className="text-sm font-bold leading-relaxed pt-0.5">
                        {q.question}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        isCorrect
                          ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                          : "bg-rose-400/20 text-rose-300 border border-rose-400/30"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check size={12} className="stroke-[3]" /> Benar (+20)
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Salah (0)
                        </>
                      )}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 mt-3 pt-2 border-t border-white/10">
                    {q.options.map((opt) => {
                      const isChosen = studentAnswer === opt.letter;
                      const isTargetCorrect = q.correctAnswer === opt.letter;

                      let rowClass = isDark
                        ? "border-white/10 bg-white/5 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-700";

                      if (isTargetCorrect) {
                        rowClass = isDark
                          ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200 font-semibold"
                          : "border-emerald-400 bg-emerald-50 text-emerald-950 font-semibold";
                      } else if (isChosen && !isCorrect) {
                        rowClass = isDark
                          ? "border-rose-400/50 bg-rose-400/15 text-rose-200 font-semibold"
                          : "border-rose-400 bg-rose-50 text-rose-950 font-semibold";
                      }

                      return (
                        <div
                          key={opt.letter}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${rowClass}`}
                        >
                          <span
                            className={`w-5 h-5 rounded-lg grid place-items-center font-mono font-bold text-[10px] shrink-0 mt-0.5 ${
                              isTargetCorrect
                                ? "bg-emerald-400 text-slate-950 font-black"
                                : isChosen
                                ? "bg-rose-400 text-slate-950 font-black"
                                : isDark
                                ? "bg-white/10 text-slate-400"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {opt.letter}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isTargetCorrect && (
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-400/20 shrink-0">
                              Kunci
                            </span>
                          )}
                          {isChosen && !isTargetCorrect && (
                            <span className="text-[10px] font-mono font-bold uppercase text-rose-400 px-1.5 py-0.5 rounded bg-rose-400/20 shrink-0">
                              Jawaban Siswa
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <Link
              to={`/app/modul/${moduleId}`}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? "border-white/10 text-slate-400 hover:text-white"
                  : "border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Halaman Detail Bab 1</span>
            </Link>

            <Link
              to={`/app/materi/${moduleId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/25 transition-all cursor-pointer"
            >
              <BookOpen size={16} />
              <span>Buka Modul Pembelajaran Bab 1</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>
      ) : (
        /* ================= PRE-TEST QUESTIONS FORM VIEW ================= */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Title Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
              isDark
                ? "border-cyan-500/25 bg-gradient-to-br from-[#0c1430] via-[#090f24] to-[#060a17] text-white"
                : "border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-slate-50 text-slate-900 shadow-md"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
              <Sparkles size={15} />
              <span>TES DIAGNOSTIK AWAL • Bab 1: Bilangan</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
              Pre-Test Diagnostik Pengetahuan Awal
            </h1>
            <p className="text-xs font-mono text-cyan-400 mt-0.5">
              5 Soal Pilihan Ganda (A sampai E) • Waktu Bebas
            </p>

            <div
              className={`mt-4 p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                isDark
                  ? "border-white/10 bg-black/30 text-slate-300"
                  : "border-slate-200 bg-white/80 text-slate-700"
              }`}
            >
              <p>
                Pre-test ini bertujuan untuk <strong>memetakan pemahaman konsep awal</strong> mengenai bilangan real, sifat-sifat operasi aljabar, dan pengertian bilangan.
              </p>
              <div className="font-mono text-[11px] text-cyan-400 font-semibold pt-1 border-t border-current/10 flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0" />
                <span>
                  Bersifat diagnostik (tanpa syarat KKM/lulus). Selesaikan seluruh 5 soal untuk membuka modul Bab 1. Pre-test hanya bisa dikerjakan sekali.
                </span>
              </div>
            </div>
          </div>

          {/* Student Info Summary */}
          <div
            className={`p-4 rounded-2xl border text-xs font-mono flex flex-wrap items-center justify-between gap-3 ${
              isDark
                ? "border-white/10 bg-[#0d1430]/90 text-slate-300"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={14} className="text-cyan-400" />
              <span>
                Nama Siswa: <strong className="text-white">{profile?.full_name || "Siswa"}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap size={14} className="text-cyan-400" />
              <span>
                Kelas: <strong className="text-cyan-400">{profile?.class_name || "XI"}</strong>
              </span>
            </div>
            <div className="text-slate-400">
              Progres Jawaban:{" "}
              <strong className="text-cyan-400">
                {Object.keys(selectedAnswers).length}/{PRETEST_QUESTIONS.length}
              </strong>
            </div>
          </div>

          {/* 5 Questions List */}
          <div className="space-y-4">
            {PRETEST_QUESTIONS.map((q, idx) => {
              const currentChoice = selectedAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-3xl border shadow-md transition-all ${
                    currentChoice
                      ? isDark
                        ? "border-cyan-500/30 bg-[#0c1430]/90"
                        : "border-cyan-200 bg-cyan-50/20"
                      : isDark
                      ? "border-white/10 bg-[#0d1430]/90"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-xl font-mono text-xs font-black shrink-0 ${
                        currentChoice
                          ? "bg-cyan-400 text-slate-950 font-bold"
                          : isDark
                          ? "bg-white/10 text-slate-300"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm sm:text-base font-bold leading-relaxed pt-0.5">
                      {q.question}
                    </p>
                  </div>

                  {/* Options (A to E, keep order) */}
                  <div className="space-y-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isSelected = currentChoice === opt.letter;

                      return (
                        <button
                          type="button"
                          key={opt.letter}
                          onClick={() => handleSelectOption(q.id, opt.letter)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group ${
                            isSelected
                              ? isDark
                                ? "border-cyan-400 bg-cyan-400/20 text-cyan-100 ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                                : "border-cyan-500 bg-cyan-100 text-cyan-950 ring-2 ring-cyan-500 shadow-sm"
                              : isDark
                              ? "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 text-slate-300"
                              : "border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-white text-slate-800"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-mono font-bold grid place-items-center shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? "bg-cyan-400 text-slate-950 font-black"
                                : isDark
                                ? "bg-white/10 text-slate-400 group-hover:text-cyan-300"
                                : "bg-slate-200 text-slate-600 group-hover:text-cyan-700"
                            }`}
                          >
                            {opt.letter}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5 flex-1">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                canSubmit
                  ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                  : "border border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send size={15} className={canSubmit ? "text-slate-950" : "text-slate-500"} />
              <span className={canSubmit ? "text-slate-950 font-black" : "text-slate-500"}>
                {isSubmitting
                  ? "Menyimpan Hasil ke Database..."
                  : canSubmit
                  ? "Kirim Jawaban Pre-Test & Buka Modul"
                  : `Jawab Seluruh Soal (${Object.keys(selectedAnswers).length}/${PRETEST_QUESTIONS.length}) untuk Mengirim`}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
