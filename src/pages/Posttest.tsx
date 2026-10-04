import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Send,
  User,
  Hash,
  GraduationCap,
  HeartHandshake,
  RotateCcw,
  Lock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import {
  POSTTEST_FORM_DATA,
  saveSurveyResult,
  getSurveyResult,
  submitToGoogleForm,
  calculatePerceptionGain,
  StudentSurveyResult,
} from "../lib/testAssessmentData";
import { useStudentProgress, MIN_PASSING_SCORE } from "../lib/userProgress";
import { FormattedMathText } from "../components/MathView";

export default function Posttest() {
  const { id } = useParams();
  const moduleId = id || "mod-aljabar-1";
  const { isDark } = useTheme();
  const { profile } = useAuth();

  const data = POSTTEST_FORM_DATA;
  const { userProgress, loading: progressLoading } = useStudentProgress();

  // Check if student has passed Quiz Bab 1 (from userProgress or current session quiz_result)
  const bab1Progress =
    userProgress[moduleId] ||
    userProgress["mod-aljabar-1"] ||
    userProgress["mod-bilangan-1"];

  const sessionQuizScore = (() => {
    try {
      const saved =
        sessionStorage.getItem(`quiz_result_${moduleId}`) ||
        sessionStorage.getItem("quiz_result_mod-aljabar-1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.score === "number") return parsed.score;
      }
    } catch {
      // ignore
    }
    return 0;
  })();

  const quizScore = Math.max(bab1Progress?.quizScore ?? 0, sessionQuizScore);
  const isQuizPassed = Boolean(quizScore >= MIN_PASSING_SCORE);

  // Retrieve pre-test result to autofill student info & calculate gain
  const pretestSurvey = getSurveyResult(moduleId, "pretest");

  // Form input states
  const [nama, setNama] = useState(
    pretestSurvey?.nama || profile?.full_name || ""
  );
  const [nomorAbsen, setNomorAbsen] = useState(pretestSurvey?.nomorAbsen || "");
  const [kelas, setKelas] = useState(pretestSurvey?.kelas || "XI. 1");
  const [ratings, setRatings] = useState<Record<number, number>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [surveyResult, setSurveyResult] = useState<StudentSurveyResult | null>(null);

  // Check if post-test was already completed
  useEffect(() => {
    const existing = getSurveyResult(moduleId, "posttest");
    if (existing) {
      setNama(existing.nama || "");
      setNomorAbsen(existing.nomorAbsen || "");
      setKelas(existing.kelas || "XI. 1");
      setRatings(existing.ratings || {});
      setSurveyResult(existing);
      setIsSubmitted(true);
    }
  }, [moduleId]);

  const allStatementsAnswered =
    data.statements.length > 0 &&
    data.statements.every((s) => ratings[s.id] !== undefined);

  const canSubmit =
    nama.trim().length > 0 &&
    nomorAbsen.trim().length > 0 &&
    allStatementsAnswered &&
    !isSubmitting;

  const handleSelectRating = (statementId: number, value: number) => {
    if (isSubmitted) return;
    setRatings((prev) => ({
      ...prev,
      [statementId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);

    const values = Object.values(ratings);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = values.length > 0 ? sum / values.length : 4;
    const percentIndex = Math.round(((average - 1) / 4) * 100);

    let submittedGoogle = false;
    try {
      submittedGoogle = await submitToGoogleForm(data, nama, nomorAbsen, kelas, ratings);
    } catch {
      // ignore
    }

    const result: StudentSurveyResult = {
      moduleId,
      type: "posttest",
      nama,
      nomorAbsen,
      kelas,
      ratings,
      averageScore: Math.round(average * 10) / 10,
      percentIndex,
      completedAt: new Date().toISOString(),
      submittedToGoogleForm: submittedGoogle,
    };

    saveSurveyResult(result);
    setSurveyResult(result);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleRetake = () => {
    setIsSubmitted(false);
    setSurveyResult(null);
  };

  if (progressLoading && !isQuizPassed) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="font-mono text-xs text-slate-400">Memeriksa status kelulusan kuis...</span>
        </div>
      </div>
    );
  }

  // If Quiz Bab 1 is not passed yet, render locked notice
  if (!isQuizPassed) {
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
            Post-Test Terkunci
          </span>
          <h1
            className={`font-display text-2xl sm:text-3xl font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            {data.title}
          </h1>
          <p
            className={`text-sm leading-relaxed max-w-md mx-auto pt-2 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Post-Test merupakan evaluasi akhir pengalaman belajar. Kamu wajib menyelesaikan materi Bab 1 dan lolos kuis dengan nilai minimal 70 (lulus KKM) terlebih dahulu.
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium space-y-2 max-w-md mx-auto ${
            isDark
              ? "border-amber-400/30 bg-amber-400/5 text-amber-300"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="flex items-center justify-between font-mono text-xs">
            <span>Status Kuis Bab 1:</span>
            <span className="font-bold">
              {quizScore > 0 ? `Nilai: ${quizScore}/100 (Belum Lolos)` : "Belum Mengerjakan Kuis"}
            </span>
          </div>
          <p className="text-xs text-left leading-relaxed">
            <FormattedMathText text="Silakan buka kuis Bab 1 dan raih nilai $\ge 70$ untuk secara otomatis membuka evaluasi Post-Test ini." />
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to={`/app/kuis/${moduleId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <span>Buka Kuis Bab 1 Sekarang</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to={`/app/modul/${moduleId}`}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              isDark
                ? "border-white/10 text-slate-300 hover:text-white"
                : "border-slate-200 text-slate-700 hover:text-slate-900"
            }`}
          >
            <span>Kembali ke Detail Modul</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate comparative perception gain if pre-test survey exists
  const gainData =
    pretestSurvey && surveyResult
      ? calculatePerceptionGain(pretestSurvey.percentIndex, surveyResult.percentIndex)
      : null;

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

        <a
          href={data.googleFormViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 hover:underline"
        >
          <span>Buka di Google Form</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {!isSubmitted ? (
        /* ================= POST-TEST SURVEY FORM VIEW ================= */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Title Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
              isDark
                ? "border-purple-500/25 bg-gradient-to-br from-[#170e30] via-[#0f0d26] to-[#070b18] text-white"
                : "border-purple-100 bg-gradient-to-br from-white via-purple-50/40 to-slate-50 text-slate-900 shadow-md"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
              <HeartHandshake size={15} />
              <span>{data.badge} • Bab 1: Bilangan</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
              {data.title}
            </h1>
            <p className="text-xs font-mono text-purple-400 mt-0.5">
              {data.subtitle}
            </p>

            <div
              className={`mt-4 p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                isDark
                  ? "border-white/10 bg-black/30 text-slate-300"
                  : "border-slate-200 bg-white/80 text-slate-700"
              }`}
            >
              <p>{data.description}</p>
              <div className="font-mono text-[11px] text-purple-400 font-semibold pt-1 border-t border-current/10">
                💡 Skala Pilihan: 1 (Sangat Tidak Setuju) s/d 5 (Sangat Setuju)
              </div>
            </div>
          </div>

          {/* Student Identity Card */}
          <div
            className={`p-6 rounded-3xl border shadow-lg backdrop-blur-xl space-y-4 ${
              isDark
                ? "border-white/10 bg-[#0d1430]/90 text-white"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <User size={15} />
              <span>Identitas Siswa</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1 sm:col-span-1.5">
                <label className="text-xs font-medium block">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Raihan"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={`w-full text-xs font-medium py-2.5 px-3 rounded-xl border transition-all outline-none ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white focus:border-purple-400 focus:bg-white/10"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500 focus:bg-white"
                  }`}
                />
              </div>

              {/* Nomor Absen */}
              <div className="space-y-1">
                <label className="text-xs font-medium block flex items-center gap-1">
                  <Hash size={12} />
                  <span>Nomor Absen</span> <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 14"
                  value={nomorAbsen}
                  onChange={(e) => setNomorAbsen(e.target.value)}
                  className={`w-full text-xs font-medium py-2.5 px-3 rounded-xl border transition-all outline-none ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white focus:border-purple-400 focus:bg-white/10"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500 focus:bg-white"
                  }`}
                />
              </div>

              {/* Kelas */}
              <div className="space-y-1">
                <label className="text-xs font-medium block flex items-center gap-1">
                  <GraduationCap size={13} />
                  <span>Kelas</span> <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {data.kelasOptions.map((k) => {
                    const isSelected = kelas === k;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setKelas(k)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-500 text-white border-purple-500 shadow-sm"
                            : isDark
                            ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Statements Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Sparkles size={15} />
                <span>Pernyataan Evaluasi Pengalaman Belajar</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {Object.keys(ratings).length}/{data.statements.length} Terisi
              </span>
            </div>

            {data.statements.map((stmt, idx) => {
              const currentRating = ratings[stmt.id];

              return (
                <div
                  key={stmt.id}
                  className={`p-5 rounded-3xl border shadow-md transition-all ${
                    currentRating !== undefined
                      ? isDark
                        ? "border-purple-500/30 bg-[#140f2e]/80"
                        : "border-purple-200 bg-purple-50/20"
                      : isDark
                      ? "border-white/10 bg-[#0d1430]/90"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-xl font-mono text-xs font-black shrink-0 ${
                        currentRating !== undefined
                          ? "bg-purple-500 text-white font-bold"
                          : isDark
                          ? "bg-white/10 text-slate-300"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm sm:text-base font-medium leading-relaxed pt-0.5">
                      {stmt.label}
                    </p>
                  </div>

                  {/* 5-Point Likert Scale Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                    {data.scaleOptions.map((opt) => {
                      const isSelected = currentRating === opt.value;

                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => handleSelectRating(stmt.id, opt.value)}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group ${
                            isSelected
                              ? isDark
                                ? "border-purple-400 bg-purple-500/20 text-purple-200 ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                : "border-purple-500 bg-purple-100/80 text-purple-950 ring-2 ring-purple-500 shadow-sm"
                              : isDark
                              ? "border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-white/10 text-slate-300"
                              : "border-slate-200 bg-slate-50 hover:border-purple-400 hover:bg-white text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-mono font-bold grid place-items-center transition-colors ${
                              isSelected
                                ? "bg-purple-500 text-white"
                                : isDark
                                ? "bg-white/10 text-slate-400 group-hover:text-purple-300"
                                : "bg-slate-200 text-slate-600 group-hover:text-purple-700"
                            }`}
                          >
                            {opt.value}
                          </span>
                          <span className="text-[11px] font-semibold leading-tight">
                            {opt.label}
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
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 hover:opacity-95 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                  : "border border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send size={15} />
              <span>
                {isSubmitting
                  ? "Mengirimkan Survei Post-Test..."
                  : "Kirim Jawaban Post-Test & Lihat Hasil"}
              </span>
            </button>
          </div>
        </form>
      ) : (
        /* ================= POST-TEST COMPLETED SUMMARY VIEW ================= */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div
            className={`p-8 sm:p-10 rounded-3xl border shadow-2xl text-center space-y-6 relative overflow-hidden backdrop-blur-xl ${
              isDark
                ? "border-purple-500/30 bg-gradient-to-b from-[#180f33] to-[#090b1c] text-white"
                : "border-purple-200 bg-white text-slate-900 shadow-xl"
            }`}
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-purple-400/40 bg-purple-500/15 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <CheckCircle2 size={40} />
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-purple-400 font-bold">
                Post-Test Berhasil Disimpan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display mt-1">
                Evaluasi Akhir Selesai!
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Jawaban kamu telah dicatat dan disinkronkan dengan formulir evaluasi pembelajaran Bab 1 Bilangan.
              </p>
            </div>

            {/* Respondent Profile Badge */}
            <div
              className={`max-w-md mx-auto p-4 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                isDark
                  ? "border-white/10 bg-black/40 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <div>
                <span className="text-slate-400 block text-[10px]">Siswa:</span>
                <span className="font-bold text-white text-xs">{surveyResult?.nama}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Absen:</span>
                <span className="font-bold text-white text-xs">{surveyResult?.nomorAbsen}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kelas:</span>
                <span className="font-bold text-purple-400 text-xs">{surveyResult?.kelas}</span>
              </div>
            </div>

            {/* Comparative Perception Matrix */}
            <div
              className={`p-5 rounded-2xl border text-left space-y-4 max-w-xl mx-auto ${
                isDark
                  ? "border-white/10 bg-black/40 text-slate-200"
                  : "border-slate-200 bg-slate-50 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2.5 border-current/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <TrendingUp size={15} />
                  Perkembangan Persepsi Belajar
                </span>
                {gainData && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {gainData.category}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-xl border text-center space-y-1 ${
                    isDark
                      ? "border-cyan-500/20 bg-cyan-500/5"
                      : "border-cyan-200 bg-cyan-50/70"
                  }`}
                >
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
                    Pre-Test (Sebelum Modul)
                  </span>
                  <div className="text-2xl font-black font-display text-cyan-400">
                    {pretestSurvey ? `${pretestSurvey.averageScore}/5.0` : "—"}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Indeks: {pretestSurvey?.percentIndex ?? 0}%
                  </span>
                </div>

                <div
                  className={`p-3.5 rounded-xl border text-center space-y-1 ${
                    isDark
                      ? "border-purple-500/20 bg-purple-500/5"
                      : "border-purple-200 bg-purple-50/70"
                  }`}
                >
                  <span className="text-[11px] font-mono text-purple-400 font-semibold block">
                    Post-Test (Setelah Lolos)
                  </span>
                  <div className="text-2xl font-black font-display text-purple-400">
                    {surveyResult?.averageScore}/5.0
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Indeks: {surveyResult?.percentIndex}%
                  </span>
                </div>
              </div>

              {gainData && (
                <div className="text-xs leading-relaxed pt-1 text-slate-300 dark:text-slate-400 border-t border-current/10">
                  {gainData.gainPoints > 0 ? (
                    <span className="text-emerald-400 font-semibold">
                      🎉 Peningkatan Persepsi Positif (+{gainData.gainPoints}%):{" "}
                    </span>
                  ) : (
                    <span className="text-cyan-400 font-semibold">
                      Tingkat Kesiapan Stabil:{" "}
                    </span>
                  )}
                  Tingkat efektivitas pembelajaran visual, kuis bertahap, dan simulasi interaktif SIGMA dinilai sangat membantu pemahamanmu dalam menghadapi TKA!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/app/materi/mod-aljabar-2"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 hover:opacity-95 text-slate-950 shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
              >
                <span>Lanjut ke Bab 2: Aljabar</span>
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={handleRetake}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                <RotateCcw size={14} />
                <span>Edit Jawaban Survei</span>
              </button>

              <Link
                to="/app/dashboard"
                className={`inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark
                    ? "border-white/10 text-slate-400 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Kembali ke Dashboard</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
