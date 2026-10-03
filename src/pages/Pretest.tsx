import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Send,
  User,
  Hash,
  GraduationCap,
  HeartHandshake,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import {
  PRETEST_FORM_DATA,
  saveSurveyResult,
  getSurveyResult,
  submitToGoogleForm,
  StudentSurveyResult,
} from "../lib/testAssessmentData";

export default function Pretest() {
  const { id } = useParams();
  const moduleId = id || "mod-aljabar-1";
  const { isDark } = useTheme();
  const { profile } = useAuth();

  const data = PRETEST_FORM_DATA;

  // Form input states
  const [nama, setNama] = useState(profile?.full_name || "");
  const [nomorAbsen, setNomorAbsen] = useState("");
  const [kelas, setKelas] = useState("XI. 1");
  const [ratings, setRatings] = useState<Record<number, number>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [surveyResult, setSurveyResult] = useState<StudentSurveyResult | null>(null);

  // Check if previously completed
  useEffect(() => {
    const existing = getSurveyResult(moduleId, "pretest");
    if (existing) {
      setNama(existing.nama || "");
      setNomorAbsen(existing.nomorAbsen || "");
      setKelas(existing.kelas || "XI. 1");
      setRatings(existing.ratings || {});
      setSurveyResult(existing);
      setIsSubmitted(true);
    }
  }, [moduleId]);

  // Sync profile name when loaded
  useEffect(() => {
    if (!nama && profile?.full_name) {
      setNama(profile.full_name);
    }
  }, [profile, nama]);

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

    // Calculate average score (1-5) and percentage index (0-100)
    const values = Object.values(ratings);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = values.length > 0 ? sum / values.length : 3;
    const percentIndex = Math.round(((average - 1) / 4) * 100);

    // 1. Submit to Google Form in background
    let submittedGoogle = false;
    try {
      submittedGoogle = await submitToGoogleForm(data, nama, nomorAbsen, kelas, ratings);
    } catch {
      // ignore
    }

    // 2. Save result locally and to platform state
    const result: StudentSurveyResult = {
      moduleId,
      type: "pretest",
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
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline"
        >
          <span>Buka di Google Form</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {!isSubmitted ? (
        /* ================= PRE-TEST SURVEY FORM VIEW ================= */
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
              <HeartHandshake size={15} />
              <span>{data.badge} • Bab 1: Bilangan</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
              {data.title}
            </h1>
            <p className="text-xs font-mono text-cyan-400 mt-0.5">
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
              <div className="font-mono text-[11px] text-cyan-400 font-semibold pt-1 border-t border-current/10">
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
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <User size={15} />
              <span>Identitas Siswa</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1 sm:col-span-1.5">
                <label className="text-xs font-medium block">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Raihan"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className={`w-full text-xs font-medium py-2.5 px-3 rounded-xl border transition-all outline-none ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white focus:border-cyan-400 focus:bg-white/10"
                        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-500 focus:bg-white"
                    }`}
                  />
                </div>
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
                      ? "border-white/10 bg-white/5 text-white focus:border-cyan-400 focus:bg-white/10"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-500 focus:bg-white"
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
                            ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-sm"
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
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sparkles size={15} />
                <span>Pernyataan Persepsi & Pengalaman Belajar</span>
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
                        ? "border-cyan-500/30 bg-[#0c1430]/80"
                        : "border-cyan-200 bg-cyan-50/20"
                      : isDark
                      ? "border-white/10 bg-[#0d1430]/90"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-xl font-mono text-xs font-black shrink-0 ${
                        currentRating !== undefined
                          ? "bg-cyan-400 text-slate-950 font-bold"
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
                                ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                : "border-cyan-500 bg-cyan-100/80 text-cyan-950 ring-2 ring-cyan-500 shadow-sm"
                              : isDark
                              ? "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 text-slate-300"
                              : "border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-white text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-mono font-bold grid place-items-center transition-colors ${
                              isSelected
                                ? "bg-cyan-400 text-slate-950"
                                : isDark
                                ? "bg-white/10 text-slate-400 group-hover:text-cyan-300"
                                : "bg-slate-200 text-slate-600 group-hover:text-cyan-700"
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
                  ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                  : "border border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send size={15} />
              <span>
                {isSubmitting
                  ? "Mengirimkan Survei Pre-Test..."
                  : "Kirim Jawaban Pre-Test & Buka Modul"}
              </span>
            </button>
          </div>
        </form>
      ) : (
        /* ================= PRE-TEST COMPLETED SUMMARY VIEW ================= */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div
            className={`p-8 sm:p-10 rounded-3xl border shadow-2xl text-center space-y-6 relative overflow-hidden backdrop-blur-xl ${
              isDark
                ? "border-cyan-500/30 bg-gradient-to-b from-[#0e1738] to-[#080d1f] text-white"
                : "border-cyan-200 bg-white text-slate-900 shadow-xl"
            }`}
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/40 bg-cyan-400/15 text-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
              <CheckCircle2 size={40} />
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-bold">
                Pre-Test Berhasil Disimpan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display mt-1">
                Terima Kasih Telah Mengisi Pre-Test!
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Jawaban kamu telah dicatat untuk memetakan kesiapan awal sebelum mempelajari Bab 1 Bilangan di SIGMA.
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
                <span className="font-bold text-cyan-400 text-xs">{surveyResult?.kelas}</span>
              </div>
            </div>

            {/* Average Perception Index */}
            <div className="py-1">
              <div
                className={`font-display text-4xl sm:text-5xl font-black ${
                  isDark
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400"
                    : "text-slate-900"
                }`}
              >
                {surveyResult?.averageScore}
                <span className="text-lg sm:text-xl font-normal text-slate-400 ml-1">/5.0</span>
              </div>
              <p className="font-mono text-xs text-slate-400 mt-1">
                Indeks Kesiapan & Minat Awal (Skala 1 - 5) • Baseline untuk Post-Test
              </p>
            </div>

            {/* Status Sync Info */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 font-mono text-xs font-bold text-emerald-400 shadow-sm">
              <Sparkles size={14} /> Terhubung ke Formulir Google & Tersimpan di SIGMA
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to={`/app/materi/${moduleId}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                <BookOpen size={16} />
                <span>Lanjut Buka Modul Bab 1 Sekarang</span>
                <ChevronRight size={14} />
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
                to={`/app/modul/${moduleId}`}
                className={`inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark
                    ? "border-white/10 text-slate-400 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Halaman Detail Bab 1</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
