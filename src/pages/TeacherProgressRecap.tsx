import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  RefreshCw,
  ChevronRight,
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MODULES } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import { formatRelativeTime } from "../lib/forumApi";
import { ProgressBar } from "../components/Primitives";

export interface StudentProfileRow {
  id: string;
  full_name: string | null;
  role: string;
  class_name: string | null;
  avatar_url: string | null;
  xp?: number | null;
  level?: number | null;
  created_at?: string | null;
}

export interface UserProgressRow {
  user_id: string;
  module_id: string;
  slide_idx: number;
  total_slides: number;
  percent: number;
  completed: boolean;
  quiz_score: number | null;
  last_studied_at: string | null;
}

export interface StudentProgressSummary {
  id: string;
  name: string;
  className: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  completedModulesCount: number;
  totalModulesCount: number;
  overallPercent: number;
  avgQuizScore: number | null;
  hasBelowKkmQuiz: boolean;
  quizzesCount: number;
  lastStudiedAt: string | null;
  status: "below_kkm" | "not_started" | "safe";
  moduleProgressMap: Record<string, UserProgressRow>;
}

const KKM_SCORE = 70;

export default function TeacherProgressRecap() {
  const { isDark } = useTheme();
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressSummary | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "progress" | "score" | "activity">("progress");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Keamanan: Hanya untuk role teacher
  useEffect(() => {
    if (!authLoading && profile && profile.role !== "teacher") {
      navigate("/app/dashboard", { replace: true });
    }
  }, [profile, authLoading, navigate]);

  // Load data dari Supabase via query terpisah
  const loadRecapData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profilesRes, progressRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, role, class_name, avatar_url, xp, level, created_at")
          .order("full_name", { ascending: true }),
        supabase
          .from("user_progress")
          .select("user_id, module_id, slide_idx, total_slides, percent, completed, quiz_score, last_studied_at"),
      ]);

      if (profilesRes.error) {
        console.error("[TeacherProgressRecap] Error memuat data profiles:", profilesRes.error);
        throw new Error(profilesRes.error.message || "Gagal memuat daftar profil siswa");
      }

      if (progressRes.error) {
        console.error("[TeacherProgressRecap] Error memuat data user_progress:", progressRes.error);
        throw new Error(progressRes.error.message || "Gagal memuat rekap aktivitas progres siswa");
      }

      // Ambil profiles lewat query terpisah dan filter di client (hanya profiles.role === 'student')
      const allProfiles: StudentProfileRow[] = profilesRes.data || [];
      const studentProfiles = allProfiles.filter((p) => p.role === "student");
      const studentMap = new Map<string, StudentProfileRow>();
      for (const p of studentProfiles) {
        studentMap.set(p.id, p);
      }

      // Sembunyikan baris user_progress milik user ber-role 'teacher' atau yang profilnya tidak ditemukan
      const rawProgressRows: UserProgressRow[] = progressRes.data || [];
      const progressRows = rawProgressRows.filter((row) => row.user_id && studentMap.has(row.user_id));

      // Grouping user_progress per user_id di sisi client (hanya untuk siswa yang valid)
      const progressByUser = new Map<string, UserProgressRow[]>();
      for (const row of progressRows) {
        const current = progressByUser.get(row.user_id) || [];
        current.push(row);
        progressByUser.set(row.user_id, current);
      }

      const totalModules = MODULES.length;

      // Gabungkan profil dan progres hanya untuk akun ber-role 'student'
      const summaries: StudentProgressSummary[] = studentProfiles.map((st) => {
        const records = progressByUser.get(st.id) || [];
        const moduleProgressMap: Record<string, UserProgressRow> = {};

        let completedCount = 0;
        let sumScore = 0;
        let quizCount = 0;
        let hasBelowKkm = false;
        let sumPercent = 0;
        let latestTimestamp: string | null = null;

        for (const rec of records) {
          moduleProgressMap[rec.module_id] = rec;

          // Cek kelulusan modul
          const rawScore = rec.quiz_score;
          const hasScore = rawScore !== null && rawScore !== undefined;
          const scoreNum = hasScore ? Number(rawScore) : null;

          const isCompleted = rec.completed || (scoreNum !== null && scoreNum >= KKM_SCORE);
          if (isCompleted) {
            completedCount++;
          }

          if (scoreNum !== null) {
            quizCount++;
            sumScore += scoreNum;
            if (scoreNum < KKM_SCORE) {
              hasBelowKkm = true;
            }
          }

          const pct = Math.min(100, Math.max(0, Number(rec.percent || (isCompleted ? 100 : 0))));
          sumPercent += pct;

          if (rec.last_studied_at) {
            if (!latestTimestamp || new Date(rec.last_studied_at) > new Date(latestTimestamp)) {
              latestTimestamp = rec.last_studied_at;
            }
          }
        }

        // Rata-rata progres keseluruhan terhadap total modul kurikulum
        const overallPercent = totalModules > 0 ? Math.round(sumPercent / totalModules) : 0;
        const avgQuizScore = quizCount > 0 ? Number((sumScore / quizCount).toFixed(1)) : null;

        // Penentuan Status:
        // 1. "Di bawah KKM" (merah) jika ada skor kuis < 70
        // 2. "Belum mulai" (abu) jika belum ada progres sama sekali
        // 3. Selain itu "Aman" (hijau)
        let status: "below_kkm" | "not_started" | "safe";
        if (hasBelowKkm) {
          status = "below_kkm";
        } else if (records.length === 0 || (completedCount === 0 && quizCount === 0 && sumPercent === 0)) {
          status = "not_started";
        } else {
          status = "safe";
        }

        return {
          id: st.id,
          name: st.full_name?.trim() || "Siswa",
          className: st.class_name?.trim() || "Belum ada kelas",
          avatarUrl: st.avatar_url,
          xp: st.xp || 0,
          level: st.level || 1,
          completedModulesCount: completedCount,
          totalModulesCount: totalModules,
          overallPercent,
          avgQuizScore,
          hasBelowKkmQuiz: hasBelowKkm,
          quizzesCount: quizCount,
          lastStudiedAt: latestTimestamp,
          status,
          moduleProgressMap,
        };
      });

      setStudents(summaries);
    } catch (err: any) {
      console.error("[TeacherProgressRecap] Exception saat memuat rekap:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data rekapitulasi siswa.");
      toast.error(err?.message || "Gagal memuat rekapitulasi progres siswa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecapData();
  }, []);

  // Daftar opsi kelas dinamis
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.className && s.className !== "Belum ada kelas") {
        set.add(s.className);
      }
    }
    return Array.from(set).sort();
  }, [students]);

  // Ringkasan metrik statistik atas
  const stats = useMemo(() => {
    const totalCount = students.length;
    if (totalCount === 0) {
      return {
        totalStudents: 0,
        avgProgress: 0,
        avgScore: 0,
        belowKkmCount: 0,
      };
    }

    const totalProgress = students.reduce((acc, s) => acc + s.overallPercent, 0);
    const avgProgress = Math.round(totalProgress / totalCount);

    const studentsWithScore = students.filter((s) => s.avgQuizScore !== null);
    const totalScore = studentsWithScore.reduce((acc, s) => acc + (s.avgQuizScore || 0), 0);
    const avgScore =
      studentsWithScore.length > 0 ? Number((totalScore / studentsWithScore.length).toFixed(1)) : 0;

    const belowKkmCount = students.filter((s) => s.status === "below_kkm").length;

    return {
      totalStudents: totalCount,
      avgProgress,
      avgScore,
      belowKkmCount,
    };
  }, [students]);

  // Filtering & Sorting
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
      );
    }

    // Class filter
    if (selectedClass !== "ALL") {
      result = result.filter((s) => s.className === selectedClass);
    }

    // Status filter
    if (selectedStatus !== "ALL") {
      result = result.filter((s) => s.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "id");
      } else if (sortBy === "progress") {
        comparison = a.overallPercent - b.overallPercent;
      } else if (sortBy === "score") {
        const scoreA = a.avgQuizScore ?? -1;
        const scoreB = b.avgQuizScore ?? -1;
        comparison = scoreA - scoreB;
      } else if (sortBy === "activity") {
        const timeA = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
        const timeB = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
        comparison = timeA - timeB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [students, searchQuery, selectedClass, selectedStatus, sortBy, sortOrder]);

  // Unduh CSV
  const handleDownloadCsv = () => {
    if (filteredStudents.length === 0) {
      toast.error("Tidak ada data untuk diunduh.");
      return;
    }

    const headers = ["Nama", "Kelas", "Modul Selesai", "Rata-rata Skor", "Status"];
    const rows = filteredStudents.map((s) => {
      const statusLabel =
        s.status === "below_kkm"
          ? "Di bawah KKM"
          : s.status === "not_started"
          ? "Belum mulai"
          : "Aman";
      const scoreLabel = s.avgQuizScore !== null ? s.avgQuizScore.toString() : "-";
      const moduleDone = `${s.completedModulesCount} dari ${s.totalModulesCount}`;

      return [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.className.replace(/"/g, '""')}"`,
        `"${moduleDone}"`,
        `"${scoreLabel}"`,
        `"${statusLabel}"`,
      ].join(",");
    });

    // Tambahkan BOM UTF-8 (\uFEFF) agar Microsoft Excel membuka dengan rapi
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `rekap_progres_siswa_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Berhasil mengunduh rekap untuk ${filteredStudents.length} siswa!`);
  };

  const toggleSort = (column: "name" | "progress" | "score" | "activity") => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder(column === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-6 w-full py-2 sm:py-4 px-1 sm:px-2 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
            <ShieldCheck size={13} />
            <span>PORTAL GURU • REKAPITULASI PROGRES</span>
          </div>
          <h1
            className={`mt-2 font-display text-2xl sm:text-3xl font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Rekap Progres Siswa
          </h1>
          <p
            className={`mt-1 text-xs sm:text-sm max-w-2xl ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Pantau ketuntasan modul, evaluasi nilai kuis, dan deteksi dini siswa yang membutuhkan
            pendampingan khusus di bawah KKM 70.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadRecapData}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
            }`}
            title="Muat ulang data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-cyan-400" : ""} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={loading || filteredStudents.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Kartu Ringkasan Metrik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Siswa */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border transition-all ${
            isDark
              ? "bg-[#0a0d18] border-white/10"
              : "bg-white border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Jumlah Siswa
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 grid place-items-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-black font-display ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {loading ? "..." : stats.totalStudents}
            </span>
            <span className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              terdaftar
            </span>
          </div>
          <p className={`mt-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Siswa aktif MA Darunnajah 9
          </p>
        </div>

        {/* Rata-rata Progres */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border transition-all ${
            isDark
              ? "bg-[#0a0d18] border-white/10"
              : "bg-white border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Rata-rata Progres
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 grid place-items-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-black font-display ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {loading ? "..." : `${stats.avgProgress}%`}
            </span>
            <span className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              kurikulum
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={stats.avgProgress} color="#00F0FF" className="h-1.5" />
          </div>
        </div>

        {/* Rata-rata Skor Kuis */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border transition-all ${
            isDark
              ? "bg-[#0a0d18] border-white/10"
              : "bg-white border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Rata-rata Skor Kuis
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 grid place-items-center">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-black font-display ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {loading ? "..." : stats.avgScore > 0 ? stats.avgScore : "-"}
            </span>
            <span className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              / 100
            </span>
          </div>
          <p className={`mt-1.5 text-[11px] ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            Standar KKM: 70 poin
          </p>
        </div>

        {/* Siswa Di Bawah KKM */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border transition-all ${
            stats.belowKkmCount > 0
              ? isDark
                ? "bg-rose-950/20 border-rose-500/30"
                : "bg-rose-50/60 border-rose-200"
              : isDark
              ? "bg-[#0a0d18] border-white/10"
              : "bg-white border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                stats.belowKkmCount > 0
                  ? isDark
                    ? "text-rose-300"
                    : "text-rose-700"
                  : isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Di Bawah KKM
            </span>
            <div
              className={`w-8 h-8 rounded-xl grid place-items-center ${
                stats.belowKkmCount > 0
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-slate-500/10 text-slate-400"
              }`}
            >
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-black font-display ${
                stats.belowKkmCount > 0
                  ? isDark
                    ? "text-rose-400"
                    : "text-rose-600"
                  : isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {loading ? "..." : stats.belowKkmCount}
            </span>
            <span className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              siswa
            </span>
          </div>
          <p
            className={`mt-1.5 text-[11px] ${
              stats.belowKkmCount > 0
                ? isDark
                  ? "text-rose-400/90"
                  : "text-rose-600"
                : isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {stats.belowKkmCount > 0 ? "Perlu remedial materi" : "Semua siswa tuntas KKM"}
          </p>
        </div>
      </div>

      {/* Pesan Error jika query gagal */}
      {error && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark
              ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
              : "bg-rose-50 border-rose-300 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-rose-500 shrink-0" />
            <div>
              <p className="text-xs font-bold">Gagal memuat rekapitulasi data siswa</p>
              <p className="text-[11px] opacity-90">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadRecapData}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 4. Filter, Pencarian, & Sort Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 ${
          isDark ? "bg-[#0a0d18] border-white/10" : "bg-white border-slate-200/80 shadow-sm"
        }`}
      >
        {/* Kolom Pencarian */}
        <div className="relative flex-1">
          <Search
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa atau kelas..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-cyan-400/50"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filter Kelas & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Kelas:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border outline-none transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0e1220] border-white/10 text-white focus:border-cyan-400/50"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-600"
              }`}
            >
              <option value="ALL">Semua Kelas ({students.length})</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border outline-none transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0e1220] border-white/10 text-white focus:border-cyan-400/50"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-600"
              }`}
            >
              <option value="ALL">Semua Status</option>
              <option value="below_kkm">Di bawah KKM ({stats.belowKkmCount})</option>
              <option value="not_started">Belum mulai</option>
              <option value="safe">Aman</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
              title={`Urutkan: ${sortOrder === "asc" ? "Menaik (A-Z / Rendah ke Tinggi)" : "Menurun (Z-A / Tinggi ke Rendah)"}`}
            >
              <ArrowUpDown size={14} className={sortOrder === "desc" ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border outline-none transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0e1220] border-white/10 text-white focus:border-cyan-400/50"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-600"
              }`}
            >
              <option value="progress">Urut: Progres</option>
              <option value="score">Urut: Skor Kuis</option>
              <option value="name">Urut: Nama Siswa</option>
              <option value="activity">Urut: Aktivitas Terbaru</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Tabel Per Siswa */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isDark ? "bg-[#0a0d18] border-white/10" : "bg-white border-slate-200/80 shadow-sm"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark
                    ? "border-white/10 bg-white/[0.02] text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <th
                  onClick={() => toggleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Siswa</span>
                    {sortBy === "name" && (
                      <span className="text-cyan-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4">Kelas</th>
                <th
                  onClick={() => toggleSort("progress")}
                  className="py-3.5 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Modul Selesai</span>
                    {sortBy === "progress" && (
                      <span className="text-cyan-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("score")}
                  className="py-3.5 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rata-rata Skor Kuis</span>
                    {sortBy === "score" && (
                      <span className="text-cyan-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("activity")}
                  className="py-3.5 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Aktivitas Terakhir</span>
                    {sortBy === "activity" && (
                      <span className="text-cyan-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 dark:divide-white/5 divide-slate-100">
              {loading ? (
                // 6. Loading Skeleton
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-white/10 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 rounded bg-slate-300 dark:bg-white/10" />
                          <div className="w-20 h-2.5 rounded bg-slate-200 dark:bg-white/5" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-3 rounded bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-28 h-3 rounded bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-3 rounded bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-3 rounded bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-5 rounded-full bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                // State Kosong
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto grid place-items-center">
                        <BookOpen size={24} />
                      </div>
                      <h3
                        className={`text-sm font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {searchQuery || selectedClass !== "ALL" || selectedStatus !== "ALL"
                          ? "Tidak ada siswa yang sesuai filter"
                          : "Belum ada data progres"}
                      </h3>
                      <p
                        className={`text-xs ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {searchQuery || selectedClass !== "ALL" || selectedStatus !== "ALL"
                          ? "Coba ubah kata kunci pencarian atau reset filter kelas dan status."
                          : "Data progres siswa akan muncul setelah siswa mulai membaca materi atau mengerjakan kuis."}
                      </p>
                      {(searchQuery || selectedClass !== "ALL" || selectedStatus !== "ALL") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedClass("ALL");
                            setSelectedStatus("ALL");
                          }}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`group transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-cyan-500/[0.04] active:bg-cyan-500/[0.08]"
                          : "hover:bg-cyan-50/60 active:bg-cyan-100/60"
                      }`}
                    >
                      {/* Nama & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {s.avatarUrl ? (
                            <img
                              src={s.avatarUrl}
                              alt={s.name}
                              className="w-8 h-8 rounded-full object-cover border border-cyan-400/20 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-400 font-bold text-xs grid place-items-center uppercase shrink-0 border border-cyan-400/25">
                              {s.name.slice(0, 1)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span
                              className={`font-semibold text-xs block truncate group-hover:text-cyan-400 transition-colors ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {s.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono block ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              Level {s.level} • {s.xp} XP
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-medium text-xs ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {s.className}
                        </span>
                      </td>

                      {/* Modul Selesai */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold">
                              {s.completedModulesCount} dari {s.totalModulesCount} modul
                            </span>
                            <span
                              className={`font-mono text-[10px] ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {s.overallPercent}%
                            </span>
                          </div>
                          <ProgressBar
                            value={s.overallPercent}
                            color={s.overallPercent === 100 ? "#10b981" : "#00F0FF"}
                            className="h-1.5"
                          />
                        </div>
                      </td>

                      {/* Rata-rata Skor Kuis */}
                      <td className="py-3.5 px-4">
                        {s.avgQuizScore !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono font-bold text-xs ${
                                s.avgQuizScore >= KKM_SCORE
                                  ? isDark
                                    ? "text-emerald-400"
                                    : "text-emerald-600"
                                  : isDark
                                  ? "text-rose-400"
                                  : "text-rose-600"
                              }`}
                            >
                              {s.avgQuizScore}
                            </span>
                            <span
                              className={`text-[10px] font-mono ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              ({s.quizzesCount} kuis)
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`font-mono text-[11px] ${
                              isDark ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            Belum ikut kuis
                          </span>
                        )}
                      </td>

                      {/* Aktivitas Terakhir */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {formatRelativeTime(s.lastStudiedAt)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {s.status === "below_kkm" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertCircle size={12} />
                            <span>Di bawah KKM</span>
                          </span>
                        ) : s.status === "not_started" ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isDark
                                ? "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            <Clock size={12} />
                            <span>Belum mulai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={12} />
                            <span>Aman</span>
                          </span>
                        )}
                      </td>

                      {/* Detail Button */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isDark
                              ? "bg-white/5 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10"
                              : "bg-slate-100 text-slate-500 group-hover:text-cyan-700 group-hover:bg-cyan-50"
                          }`}
                        >
                          <ChevronRight size={14} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info total baris */}
        {!loading && filteredStudents.length > 0 && (
          <div
            className={`py-3 px-4 border-t flex items-center justify-between text-[11px] ${
              isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
            }`}
          >
            <span>
              Menampilkan <strong>{filteredStudents.length}</strong> dari{" "}
              <strong>{students.length}</strong> siswa
            </span>
            <span className="font-mono">SIGMA Learning Management System</span>
          </div>
        )}
      </div>

      {/* 3. Modal Detail Progres Siswa */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl transition-all my-auto max-h-[90vh] flex flex-col ${
              isDark
                ? "bg-[#0b0e1b] border-cyan-500/30 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3.5">
                {selectedStudent.avatarUrl ? (
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/30 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 font-bold text-base grid place-items-center uppercase shrink-0 border border-cyan-400/30">
                    {selectedStudent.name.slice(0, 1)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold font-display">
                      {selectedStudent.name}
                    </h3>
                    {selectedStudent.status === "below_kkm" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Di bawah KKM
                      </span>
                    ) : selectedStudent.status === "not_started" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                        Belum mulai
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Aman
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {selectedStudent.className} • Level {selectedStudent.level} ({selectedStudent.xp} XP)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Quick Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5 p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] shrink-0 text-center">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <span className={`text-[10px] block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Modul Tuntas
                </span>
                <span className="text-lg font-black font-display text-cyan-400">
                  {selectedStudent.completedModulesCount} / {selectedStudent.totalModulesCount}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <span className={`text-[10px] block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Rata-rata Skor
                </span>
                <span
                  className={`text-lg font-black font-display ${
                    selectedStudent.avgQuizScore !== null
                      ? selectedStudent.avgQuizScore >= KKM_SCORE
                        ? "text-emerald-400"
                        : "text-rose-400"
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {selectedStudent.avgQuizScore !== null ? selectedStudent.avgQuizScore : "-"}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <span className={`text-[10px] block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Aktivitas Terakhir
                </span>
                <span className="text-xs font-semibold block truncate mt-1">
                  {formatRelativeTime(selectedStudent.lastStudiedAt)}
                </span>
              </div>
            </div>

            {/* Modal Body: Daftar Modul Detail */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Rincian Progres &amp; Evaluasi Per Modul
              </h4>

              <div className="space-y-3">
                {MODULES.map((mod, idx) => {
                  const progress = selectedStudent.moduleProgressMap[mod.id];
                  const percent = progress
                    ? Math.min(100, Math.max(0, Number(progress.percent || (progress.completed ? 100 : 0))))
                    : 0;
                  const rawScore = progress?.quiz_score;
                  const hasQuiz = rawScore !== null && rawScore !== undefined;
                  const quizScore = hasQuiz ? Number(rawScore) : null;
                  const isCompleted = Boolean(
                    progress?.completed || (quizScore !== null && quizScore >= KKM_SCORE)
                  );

                  return (
                    <div
                      key={mod.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDark
                          ? "bg-white/[0.02] border-white/10 hover:border-cyan-400/30"
                          : "bg-slate-50/80 border-slate-200 hover:border-cyan-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 font-bold border border-cyan-400/20">
                              Bab {idx + 1}
                            </span>
                            <h5
                              className={`text-xs sm:text-sm font-bold truncate ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {mod.title}
                            </h5>
                          </div>
                          <p
                            className={`text-[11px] truncate mt-1 ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {mod.subtitle || mod.districtName}
                          </p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 size={11} /> Modul Selesai
                            </span>
                          ) : percent > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                              <BookOpen size={11} /> Sedang Belajar
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                isDark
                                  ? "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              <Clock size={11} /> Belum Dibuka
                            </span>
                          )}

                          {/* Skor Kuis */}
                          {quizScore !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                                quizScore >= KKM_SCORE
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              <Award size={11} /> Kuis: {quizScore}/100{" "}
                              {quizScore >= KKM_SCORE ? "(Lolos)" : "(Remedial)"}
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono ${
                                isDark
                                  ? "bg-white/5 text-slate-500 border border-white/5"
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}
                            >
                              Kuis: Belum
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Baris Progres Belajar */}
                      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                              Kelengkapan Slide: {progress ? progress.slide_idx + 1 : 0} dari{" "}
                              {progress?.total_slides || mod.slides?.length || 14} slide
                            </span>
                            <span className="font-mono font-bold text-cyan-400">{percent}%</span>
                          </div>
                          <ProgressBar
                            value={percent}
                            color={isCompleted ? "#10b981" : "#00F0FF"}
                            className="h-1.5"
                          />
                        </div>

                        {progress?.last_studied_at && (
                          <span
                            className={`text-[10px] shrink-0 font-mono ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {formatRelativeTime(progress.last_studied_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Standar Kriteria Ketuntasan Minimal (KKM): Nilai 70
              </span>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 dark:bg-white/10 dark:hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
