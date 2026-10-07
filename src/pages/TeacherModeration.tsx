import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  ShieldCheck,
  Pin,
  Trash2,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Filter,
  AlertCircle,
  MessageCircle,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/Primitives";
import { useTheme } from "../lib/theme";
import { FormattedMathText } from "../components/MathView";
import {
  listThreads,
  setPinned,
  setAnswered,
  deleteThread,
  formatRelativeTime,
  FORUM_CATEGORIES,
  ThreadWithStats,
} from "../lib/forumApi";

export default function TeacherModeration() {
  const { isDark } = useTheme();

  // State
  const [threads, setThreads] = useState<ThreadWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "unanswered" | "answered" | "pinned">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");

  // Deletion Modal
  const [threadToDelete, setThreadToDelete] = useState<ThreadWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch threads from Supabase
  const fetchModerationThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listThreads();
      setThreads(data);
    } catch (err: any) {
      console.error("[TeacherModeration] Error fetching threads:", err);
      setError(err?.message || "Gagal memuat topik untuk moderasi.");
      toast.error("Gagal memuat data forum guru.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationThreads();
  }, []);

  // Filtered threads
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // Category filter
      if (categoryFilter !== "Semua" && t.category !== categoryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === "unanswered" && t.is_answered) return false;
      if (statusFilter === "answered" && !t.is_answered) return false;
      if (statusFilter === "pinned" && !t.is_pinned) return false;

      return true;
    });
  }, [threads, statusFilter, categoryFilter]);

  // Toggle Pin
  const handleTogglePin = async (t: ThreadWithStats) => {
    const newStatus = !t.is_pinned;
    try {
      await setPinned(t.id, newStatus);
      setThreads((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, is_pinned: newStatus } : item))
      );
      toast.success(newStatus ? "Topik berhasil disematkan!" : "Sematkan topik dilepas.");
    } catch (err: any) {
      console.error("[TeacherModeration] Error toggle pin:", err);
      toast.error(err?.message || "Gagal memperbarui status pin.");
    }
  };

  // Toggle Answered
  const handleToggleAnswered = async (t: ThreadWithStats) => {
    const newStatus = !t.is_answered;
    try {
      await setAnswered(t.id, newStatus);
      setThreads((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, is_answered: newStatus } : item))
      );
      toast.success(newStatus ? "Topik ditandai sebagai terjawab!" : "Status terjawab dibatalkan.");
    } catch (err: any) {
      console.error("[TeacherModeration] Error toggle answered:", err);
      toast.error(err?.message || "Gagal memperbarui status terjawab.");
    }
  };

  // Confirm and Execute Delete Thread
  const handleConfirmDelete = async () => {
    if (!threadToDelete) return;
    try {
      setIsDeleting(true);
      await deleteThread(threadToDelete.id);
      setThreads((prev) => prev.filter((item) => item.id !== threadToDelete.id));
      toast.success("Thread diskusi berhasil dihapus.");
    } catch (err: any) {
      console.error("[TeacherModeration] Error delete thread:", err);
      toast.error(err?.message || "Gagal menghapus thread diskusi.");
    } finally {
      setIsDeleting(false);
      setThreadToDelete(null);
    }
  };

  return (
    <div className="space-y-6 w-full py-2 sm:py-4 px-1 sm:px-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="yellow">
            <ShieldCheck size={12} /> MODERASI FORUM GURU
          </Badge>
          <h1
            className={`mt-2 font-display text-2xl sm:text-3xl font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Moderasi &amp; Verifikasi Pertanyaan
          </h1>
          <p
            className={`mt-0.5 text-xs sm:text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Kelola pertanyaan siswa dari Supabase, sematkan pengumuman penting, dan verifikasi jawaban matematika yang tepat.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchModerationThreads}
          disabled={loading}
          className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isDark
              ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
          }`}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? "bg-[#0d1430]/70 border-white/10" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold mr-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Status:
            </span>
            {[
              { id: "all", label: "Semua Pertanyaan" },
              { id: "unanswered", label: "Belum Terjawab" },
              { id: "answered", label: "Sudah Terjawab" },
              { id: "pinned", label: "Disematkan" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? "bg-cyan-500 text-white shadow-sm"
                    : isDark
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-white/10 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              {FORUM_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Kategori: {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border animate-pulse space-y-3 ${
                isDark ? "bg-[#0d1430]/40 border-white/5" : "bg-white border-slate-200"
              }`}
            >
              <div className="w-1/3 h-5 rounded bg-slate-700/30" />
              <div className="w-full h-4 rounded bg-slate-700/20" />
              <div className="w-1/2 h-4 rounded bg-slate-700/20" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          className={`p-8 rounded-2xl border text-center space-y-3 ${
            isDark ? "bg-red-950/20 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <AlertCircle size={32} className="mx-auto text-red-400" />
          <p className="text-sm font-bold">{error}</p>
          <button
            type="button"
            onClick={fetchModerationThreads}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredThreads.length === 0 && (
        <div
          className={`rounded-2xl border p-12 text-center space-y-2 ${
            isDark
              ? "border-white/10 bg-[#0d1430]/60 text-slate-400"
              : "border-slate-200 bg-white text-slate-600 shadow-sm"
          }`}
        >
          <MessageSquare size={32} className="mx-auto opacity-60" />
          <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Tidak Ada Pertanyaan untuk Dimoderasi
          </p>
          <p className={`text-xs max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Tidak ditemukan topik yang cocok dengan filter yang dipilih.
          </p>
        </div>
      )}

      {/* Threads List */}
      {!loading && !error && filteredThreads.length > 0 && (
        <div className="space-y-4">
          {filteredThreads.map((thr) => (
            <div
              key={thr.id}
              className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-lg transition-all ${
                thr.is_pinned
                  ? isDark
                    ? "border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[#0d1430] to-[#0d1430]"
                    : "border-amber-300 bg-amber-50/50"
                  : isDark
                  ? "border-white/10 bg-[#0d1430]/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Header: Author info, badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {thr.is_pinned && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                      <Pin size={10} className="fill-amber-300" /> Disematkan
                    </span>
                  )}
                  {thr.is_answered ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 size={10} /> Terjawab
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/20 px-2 py-0.5 text-[11px] font-bold text-yellow-300 border border-yellow-500/30">
                      Belum Terjawab
                    </span>
                  )}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      isDark
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                        : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                    }`}
                  >
                    {thr.category}
                  </span>
                </div>

                <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Oleh <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{thr.author_name}</strong>
                  {thr.author_class ? ` (${thr.author_class})` : ""} · {formatRelativeTime(thr.created_at)}
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-base sm:text-lg font-bold font-display ${isDark ? "text-white" : "text-slate-900"}`}>
                {thr.title}
              </h2>

              {/* Content with LaTeX */}
              <div
                className={`text-xs sm:text-sm leading-relaxed p-4 rounded-xl border ${
                  isDark ? "bg-black/30 border-white/5 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <FormattedMathText text={thr.content} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={13} className="text-cyan-400" />
                    {thr.replies_count} Balasan
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp size={13} className="text-rose-400" />
                    {thr.likes_count} Disukai
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Pin Toggle */}
                  <button
                    type="button"
                    onClick={() => handleTogglePin(thr)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      thr.is_pinned
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                        : isDark
                        ? "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <Pin size={12} className={thr.is_pinned ? "fill-amber-300" : ""} />
                    <span>{thr.is_pinned ? "Lepas Pin" : "Sematkan"}</span>
                  </button>

                  {/* Answered Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleAnswered(thr)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      thr.is_answered
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : isDark
                        ? "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>{thr.is_answered ? "Tandai Belum Terjawab" : "Tandai Terjawab"}</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setThreadToDelete(thr)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Hapus</span>
                  </button>

                  {/* Go to Thread Detail */}
                  <Link
                    to={`/app/diskusi/${thr.id}`}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer ml-1"
                  >
                    <span>Buka &amp; Beri Jawaban Guru</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {threadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 ${
              isDark ? "bg-[#0d1430] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold">Hapus Topik Siswa?</h3>
            </div>
            <div className="space-y-1">
              <p className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                "{threadToDelete.title}"
              </p>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Apakah Anda yakin ingin menghapus topik ini sebagai Guru? Seluruh balasan dan statistik diskusi akan ikut terhapus secara permanen dari database Supabase.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setThreadToDelete(null)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Hapus Topik"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
