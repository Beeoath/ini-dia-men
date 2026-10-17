import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import { PRETEST_QUESTIONS, PretestQuestion } from "../lib/testAssessmentData";

export interface StudentPretestItem {
  id: string;
  userId: string;
  name: string;
  className: string;
  avatarUrl: string | null;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: Record<string, string>;
  createdAt: string;
}

export default function TeacherPretestRecap() {
  const { isDark } = useTheme();
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<StudentPretestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [sortBy, setSortBy] = useState<"name" | "score" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Protect route for teacher role only
  useEffect(() => {
    if (!authLoading && profile && profile.role !== "teacher") {
      navigate("/app/dashboard", { replace: true });
    }
  }, [profile, authLoading, navigate]);

  // Load assessment_results (kind = pretest) and profiles via 2 queries, merge on client
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Query assessment_results for pretest
      const { data: resultsData, error: resultsError } = await supabase
        .from("assessment_results")
        .select("id, user_id, module_id, kind, score, correct_count, total_questions, answers, created_at")
        .eq("kind", "pretest")
        .eq("module_id", "mod-aljabar-1")
        .order("created_at", { ascending: false });

      if (resultsError) {
        console.error("[TeacherPretestRecap] Gagal mengambil assessment_results:", {
          code: resultsError.code,
          message: resultsError.message,
          details: resultsError.details,
          hint: resultsError.hint,
        });
        toast.error("Gagal memuat data pre-test dari server.");
        setLoading(false);
        return;
      }

      // 2. Query profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, class_name, avatar_url, role");

      if (profilesError) {
        console.error("[TeacherPretestRecap] Gagal mengambil profiles:", {
          code: profilesError.code,
          message: profilesError.message,
          details: profilesError.details,
        });
      }

      const profileMap: Record<string, { name: string; className: string; avatarUrl: string | null }> = {};
      (profilesData || []).forEach((p) => {
        profileMap[p.id] = {
          name: p.full_name || "Siswa (" + p.id.slice(0, 6) + ")",
          className: p.class_name || "XI",
          avatarUrl: p.avatar_url,
        };
      });

      // 3. Merge results on client
      const merged: StudentPretestItem[] = (resultsData || []).map((row) => {
        const prof = profileMap[row.user_id];
        return {
          id: row.id,
          userId: row.user_id,
          name: prof?.name || "Siswa (" + row.user_id.slice(0, 6) + ")",
          className: prof?.className || "-",
          avatarUrl: prof?.avatarUrl || null,
          score: Number(row.score) || 0,
          correctCount: Number(row.correct_count) || 0,
          totalQuestions: Number(row.total_questions) || 5,
          answers: (row.answers as Record<string, string>) || {},
          createdAt: row.created_at || new Date().toISOString(),
        };
      });

      setSubmissions(merged);
    } catch (err: any) {
      console.error("[TeacherPretestRecap] Exception saat loadData:", err);
      toast.error("Terjadi kesalahan saat memuat rekap pre-test.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Summary statistics
  const summary = useMemo(() => {
    const total = submissions.length;
    if (total === 0) {
      return { total: 0, avg: 0, max: 0, min: 0 };
    }
    const scores = submissions.map((s) => s.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    return {
      total,
      avg: Math.round((sum / total) * 10) / 10,
      max: Math.max(...scores),
      min: Math.min(...scores),
    };
  }, [submissions]);

  // Per-question item analysis
  const itemAnalysis = useMemo(() => {
    const total = submissions.length;

    return PRETEST_QUESTIONS.map((q) => {
      const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, UNANSWERED: 0 };
      let correct = 0;

      submissions.forEach((sub) => {
        const ans = sub.answers?.[String(q.id)];
        if (ans && counts[ans] !== undefined) {
          counts[ans] += 1;
        } else {
          counts.UNANSWERED += 1;
        }

        if (ans === q.correctAnswer) {
          correct += 1;
        }
      });

      const correctPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      return {
        question: q,
        correctCount: correct,
        correctPercentage,
        counts,
      };
    });
  }, [submissions]);

  // Available classes for filter
  const classList = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.className && s.className !== "-") set.add(s.className);
    });
    return Array.from(set).sort();
  }, [submissions]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    let list = submissions.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === "ALL" || s.className === selectedClass;
      return matchesSearch && matchesClass;
    });

    list.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === "score") {
        return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
      }
      // date
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return list;
  }, [submissions, searchQuery, selectedClass, sortBy, sortOrder]);

  // Download CSV with UTF-8 BOM
  const handleDownloadCsv = () => {
    if (submissions.length === 0) {
      toast.error("Belum ada data siswa untuk diunduh.");
      return;
    }

    const headers = [
      "Nama Siswa",
      "Kelas",
      "Skor Pre-Test",
      "Jumlah Benar",
      "Tanggal Selesai",
      "Jawaban Soal 1",
      "Jawaban Soal 2",
      "Jawaban Soal 3",
      "Jawaban Soal 4",
      "Jawaban Soal 5",
    ];

    const escapeCsv = (str: string | number) => {
      const val = String(str ?? "").replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = submissions.map((s) => {
      const dateStr = s.createdAt
        ? new Date(s.createdAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "-";

      return [
        escapeCsv(s.name),
        escapeCsv(s.className),
        s.score,
        escapeCsv(`${s.correctCount}/${s.totalQuestions}`),
        escapeCsv(dateStr),
        escapeCsv(s.answers?.["1"] || "-"),
        escapeCsv(s.answers?.["2"] || "-"),
        escapeCsv(s.answers?.["3"] || "-"),
        escapeCsv(s.answers?.["4"] || "-"),
        escapeCsv(s.answers?.["5"] || "-"),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    // Add UTF-8 BOM (\uFEFF) so Excel on Windows properly detects Unicode
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Rekap_Pretest_Bab_1_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("File CSV Rekap Pre-Test berhasil diunduh!");
  };

  const toggleSort = (field: "name" | "score" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="w-full space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              DIAGNOSTIK AWAL MATEMATIKA
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-400 font-medium">Bab 1: Bilangan</span>
          </div>
          <h1
            className={`font-display text-2xl sm:text-3xl font-black mt-1 ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Rekap Hasil Pre-Test Siswa
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Hasil asesmen diagnostik 5 soal penguasaan konsep bilangan real untuk memetakan kesiapan awal kelas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
            title="Segarkan data"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-400/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={15} />
            <span>Unduh CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Siswa */}
        <div
          className={`p-5 rounded-3xl border shadow-sm space-y-1 transition-all ${
            isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Total Mengerjakan
            </span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black pt-1">
            {summary.total} <span className="text-xs font-mono font-normal text-slate-400">Siswa</span>
          </div>
          <p className="text-[11px] text-slate-400">Asesmen diagnostik Bab 1</p>
        </div>

        {/* Rata-rata Skor */}
        <div
          className={`p-5 rounded-3xl border shadow-sm space-y-1 transition-all ${
            isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Rata-rata Skor
            </span>
            <TrendingUp size={16} className="text-indigo-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-indigo-400 pt-1">
            {summary.avg} <span className="text-xs font-mono font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">Rerata pemahaman awal</p>
        </div>

        {/* Skor Tertinggi */}
        <div
          className={`p-5 rounded-3xl border shadow-sm space-y-1 transition-all ${
            isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Skor Tertinggi
            </span>
            <Award size={16} className="text-emerald-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400 pt-1">
            {summary.max} <span className="text-xs font-mono font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">Capaian skor maksimal</p>
        </div>

        {/* Skor Terendah */}
        <div
          className={`p-5 rounded-3xl border shadow-sm space-y-1 transition-all ${
            isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Skor Terendah
            </span>
            <TrendingDown size={16} className="text-amber-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-amber-400 pt-1">
            {summary.min} <span className="text-xs font-mono font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[11px] text-slate-400">Titik intervensi remedial</p>
        </div>
      </div>

      {/* Item Analysis Section (Analisis Per Soal) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-5 ${
          isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h2 className="font-display text-base sm:text-lg font-black flex items-center gap-2">
              <HelpCircle size={18} className="text-cyan-400" />
              <span>Analisis Butir Soal Pre-Test (5 Soal)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tingkat keberhasilan tiap konsep dan distribusi pemilih opsi (A sampai E) untuk mengidentifikasi materi yang paling lemah.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-cyan-400 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 self-start sm:self-auto">
            {summary.total} Responden
          </span>
        </div>

        <div className="space-y-4">
          {itemAnalysis.map((item, idx) => {
            const { question, correctCount, correctPercentage, counts } = item;
            const isWeakest =
              summary.total > 0 &&
              correctPercentage === Math.min(...itemAnalysis.map((i) => i.correctPercentage));

            return (
              <div
                key={question.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isWeakest && summary.total > 0
                    ? isDark
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-amber-300 bg-amber-50/50"
                    : isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-xl font-mono text-xs font-black bg-cyan-400 text-slate-950 shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold leading-relaxed">
                        {question.question}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          Kunci Benar: {question.correctAnswer}
                        </span>
                        {isWeakest && summary.total > 0 && (
                          <span className="px-2 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle size={11} /> Butuh Penguatan Materi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Percentage Correct */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 pl-10 sm:pl-0">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Tingkat Menjawab Benar
                    </span>
                    <span
                      className={`text-lg font-black font-mono ${
                        correctPercentage >= 70
                          ? "text-emerald-400"
                          : correctPercentage >= 40
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {correctPercentage}%{" "}
                      <span className="text-[11px] font-normal text-slate-400">
                        ({correctCount}/{summary.total})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Accuracy Progress Bar */}
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      correctPercentage >= 70
                        ? "bg-emerald-400"
                        : correctPercentage >= 40
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                    style={{ width: `${correctPercentage}%` }}
                  />
                </div>

                {/* Option Breakdown (A - E) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5">
                  {(["A", "B", "C", "D", "E"] as const).map((letter) => {
                    const count = counts[letter] || 0;
                    const percent = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                    const isKey = question.correctAnswer === letter;

                    return (
                      <div
                        key={letter}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isKey
                            ? isDark
                              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                              : "border-emerald-400 bg-emerald-50 text-emerald-950 font-semibold"
                            : isDark
                            ? "border-white/5 bg-black/20 text-slate-400"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                          <span
                            className={`w-4 h-4 rounded grid place-items-center text-[10px] ${
                              isKey
                                ? "bg-emerald-400 text-slate-950 font-black"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {letter}
                          </span>
                          {isKey && <span className="text-[9px] uppercase tracking-wider text-emerald-400">Kunci</span>}
                        </div>
                        <div className="font-mono text-xs font-bold">
                          {count} <span className="text-[10px] font-normal opacity-70">siswa ({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student List & Search / Filters */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="font-display text-base sm:text-lg font-black flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              <span>Daftar Nilai Pre-Test Siswa ({filteredStudents.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Cari nama siswa, filter berdasarkan kelas, dan unduh data ke Excel.
            </p>
          </div>

          {/* Search Input & Class Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-3 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                  isDark
                    ? "border-white/15 bg-white/5 text-white placeholder-slate-500 focus:border-cyan-400"
                    : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-cyan-500"
                }`}
              />
            </div>

            {/* Filter Kelas */}
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`py-2 pl-3 pr-8 text-xs font-bold rounded-xl border outline-none appearance-none cursor-pointer transition-all ${
                  isDark
                    ? "border-white/15 bg-[#0b132b] text-white"
                    : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              >
                <option value="ALL">Semua Kelas</option>
                {classList.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-3 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-cyan-400" />
            <span className="font-mono text-xs text-slate-400">Memuat rekap pre-test...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users size={32} className="mx-auto text-slate-500 opacity-60" />
            <p className="text-xs font-bold text-slate-400">
              {submissions.length === 0
                ? "Belum ada siswa yang menyelesaikan Pre-Test Bab 1."
                : "Tidak ditemukan siswa dengan kata kunci pencarian tersebut."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead
                className={`font-mono text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
                }`}
              >
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nama Siswa</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-3 px-4">Kelas</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => toggleSort("score")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Skor Pre-Test</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-3 px-4">Jumlah Benar</th>
                  <th className="py-3 px-4">Jawaban (S1 - S5)</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Waktu Selesai</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student, sIdx) => {
                  const dateStr = student.createdAt
                    ? new Date(student.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400">{sIdx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-200 dark:text-slate-100">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-400">
                          {student.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-sm font-black ${
                            student.score >= 80
                              ? "text-emerald-400"
                              : student.score >= 60
                              ? "text-cyan-400"
                              : student.score >= 40
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {student.score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {student.correctCount} / {student.totalQuestions} Soal
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {PRETEST_QUESTIONS.map((q) => {
                            const ans = student.answers?.[String(q.id)] || "-";
                            const isCorrect = ans === q.correctAnswer;
                            return (
                              <span
                                key={q.id}
                                className={`h-5 w-5 rounded font-mono text-[10px] font-bold grid place-items-center ${
                                  ans === "-"
                                    ? "bg-white/5 text-slate-500"
                                    : isCorrect
                                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                                    : "bg-rose-400/20 text-rose-300 border border-rose-400/40"
                                }`}
                                title={`Soal ${q.id}: ${ans} (${isCorrect ? "Benar" : "Salah"})`}
                              >
                                {ans}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
