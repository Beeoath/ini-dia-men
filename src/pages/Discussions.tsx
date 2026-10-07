import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  CheckCircle2,
  MessageCircle,
  ThumbsUp,
  ShieldCheck,
  GraduationCap,
  X,
  Calculator,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { StudentSpatialLayout } from "../components/StudentSpatialLayout";
import { FormattedMathText } from "../components/MathView";
import { LatexInputModal } from "../components/LatexInputModal";
import {
  listThreads,
  createThread,
  formatRelativeTime,
  FORUM_CATEGORIES,
  ThreadWithStats,
} from "../lib/forumApi";

export default function Discussions() {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // State
  const [threads, setThreads] = useState<ThreadWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Topik Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLatexModalOpen, setIsLatexModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Aljabar");
  const [newContent, setNewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load threads from Supabase
  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listThreads(selectedCategory);
      setThreads(data);
    } catch (err: any) {
      console.error("[Discussions] Error fetching threads:", err);
      setError(err?.message || "Gagal memuat daftar topik diskusi.");
      toast.error("Gagal memuat topik diskusi dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [selectedCategory]);

  // Filter threads by search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        (t.author_name && t.author_name.toLowerCase().includes(q))
    );
  }, [threads, searchQuery]);

  // Handle Create Thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleTrimmed = newTitle.trim();
    const contentTrimmed = newContent.trim();

    if (titleTrimmed.length < 5 || titleTrimmed.length > 150) {
      toast.error("Judul topik harus antara 5 hingga 150 karakter.");
      return;
    }
    if (contentTrimmed.length < 1 || contentTrimmed.length > 5000) {
      toast.error("Isi pertanyaan tidak boleh kosong (maks. 5000 karakter).");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createThread({
        title: titleTrimmed,
        category: newCategory,
        content: contentTrimmed,
      });

      toast.success("Topik diskusi berhasil diterbitkan!");
      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setShowPreview(false);

      // Navigate to the newly created thread
      navigate(`/app/diskusi/${created.id}`);
    } catch (err: any) {
      console.error("[Discussions] Error creating thread:", err);
      toast.error(err?.message || "Gagal menerbitkan topik diskusi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentSpatialLayout
      activeDockItem="discussions"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari topik diskusi atau rumus..."
    >
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
        {/* Header Hero */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden transition-all duration-300 ${
            isDark
              ? "bg-gradient-to-r from-[#0d1430]/90 via-[#101b3d]/90 to-[#0d1430]/90 border-cyan-500/20 shadow-[0_10px_30px_rgba(6,182,212,0.08)]"
              : "bg-gradient-to-r from-cyan-50/90 via-sky-50/80 to-blue-50/90 border-cyan-200/60 shadow-md"
          }`}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles size={13} className="text-cyan-400" />
                <span>Forum Kolaborasi &amp; Tanya Jawab</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Forum Diskusi Matematika
              </h1>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Tanyakan soal yang membingungkan, diskusikan konsep materi bersama rekan sekelas,
                dan dapatkan verifikasi solusi langsung dari Guru Matematika.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus size={18} className="stroke-[2.5]" />
              <span>Buat Topik Baru</span>
            </button>
          </div>
        </div>

        {/* Category Pills & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FORUM_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/30"
                      : isDark
                      ? "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
                      : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={fetchThreads}
            disabled={loading}
            className={`self-end sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isDark
                ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"
            }`}
            title="Muat ulang topik"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Loading State: Skeleton Cards */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border animate-pulse space-y-4 ${
                  isDark ? "bg-[#0d1430]/40 border-white/5" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-700/40" />
                    <div className="space-y-1.5">
                      <div className="w-28 h-3.5 rounded bg-slate-700/40" />
                      <div className="w-16 h-2.5 rounded bg-slate-700/30" />
                    </div>
                  </div>
                  <div className="w-20 h-5 rounded-full bg-slate-700/30" />
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-5 rounded bg-slate-700/40" />
                  <div className="w-full h-3.5 rounded bg-slate-700/30" />
                  <div className="w-2/3 h-3.5 rounded bg-slate-700/30" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            className={`p-8 rounded-2xl border text-center space-y-4 ${
              isDark ? "bg-red-950/20 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <AlertCircle size={36} className="mx-auto text-red-400" />
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold">Terjadi Kendala Memuat Forum</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchThreads}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredThreads.length === 0 && (
          <div
            className={`p-12 rounded-3xl border text-center space-y-4 ${
              isDark
                ? "bg-[#0d1430]/50 border-white/10 text-slate-400"
                : "bg-white border-slate-200 text-slate-600 shadow-sm"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl mx-auto grid place-items-center ${
                isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600"
              }`}
            >
              <MessageSquare size={32} />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Belum Ada Topik Diskusi
              </h3>
              <p className="text-xs leading-relaxed">
                {searchQuery
                  ? `Tidak ada topik yang cocok dengan pencarian "${searchQuery}". Coba kata kunci lain.`
                  : `Belum ada pertanyaan pada kategori "${selectedCategory}". Jadilah yang pertama memulai diskusi!`}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus size={16} /> Buat Pertanyaan Pertama
              </button>
            </div>
          </div>
        )}

        {/* Threads List */}
        {!loading && !error && filteredThreads.length > 0 && (
          <div className="space-y-3.5">
            {filteredThreads.map((thread) => {
              const isTeacherAuthor = thread.author_role === "teacher";
              return (
                <Link
                  key={thread.id}
                  to={`/app/diskusi/${thread.id}`}
                  className={`group block p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${
                    thread.is_pinned
                      ? isDark
                        ? "bg-gradient-to-r from-amber-500/10 via-[#0d1430]/80 to-[#0d1430]/80 border-amber-500/40 hover:border-amber-400/60 shadow-lg shadow-amber-500/5"
                        : "bg-amber-50/60 border-amber-300 hover:border-amber-400 shadow-sm"
                      : isDark
                      ? "bg-[#0d1430]/60 hover:bg-[#111a3d]/80 border-white/10 hover:border-cyan-500/40 shadow-md"
                      : "bg-white hover:bg-slate-50/90 border-slate-200 hover:border-cyan-400/60 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Meta header: Pin, Answered, Category */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        {thread.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Pin size={11} className="fill-amber-400 text-amber-400" />
                            Disematkan
                          </span>
                        )}
                        {thread.is_answered && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} />
                            Terjawab
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-semibold ${
                            isDark
                              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                              : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                          }`}
                        >
                          {thread.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className={`text-base sm:text-lg font-bold group-hover:text-cyan-400 transition-colors line-clamp-2 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {thread.title}
                      </h2>

                      {/* Content Preview (with Math support) */}
                      <div
                        className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                          isDark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        <FormattedMathText text={thread.content} />
                      </div>

                      {/* Author & Timestamp */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] uppercase ${
                              isTeacherAuthor
                                ? "bg-amber-500 text-slate-950 font-black"
                                : "bg-cyan-500 text-slate-950"
                            }`}
                          >
                            {thread.author_name?.charAt(0) || "U"}
                          </div>
                          <span
                            className={`font-semibold ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            {thread.author_name || "Pengguna"}
                          </span>

                          {isTeacherAuthor ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <ShieldCheck size={10} /> Guru
                            </span>
                          ) : thread.author_class ? (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isDark
                                  ? "bg-white/5 text-slate-400 border border-white/5"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {thread.author_class}
                            </span>
                          ) : null}
                        </div>

                        <span>•</span>
                        <span>{formatRelativeTime(thread.created_at)}</span>
                      </div>
                    </div>

                    {/* Stats counters */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                      <div className="flex items-center gap-3 text-xs">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                            isDark
                              ? "bg-white/5 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={`${thread.replies_count} balasan`}
                        >
                          <MessageCircle size={14} className="text-cyan-400" />
                          <span className="font-semibold">{thread.replies_count}</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                            isDark
                              ? "bg-white/5 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={`${thread.likes_count} suka`}
                        >
                          <ThumbsUp size={14} className="text-rose-400" />
                          <span className="font-semibold">{thread.likes_count}</span>
                        </div>
                      </div>

                      <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Buka Diskusi</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Buat Topik Diskusi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
              isDark
                ? "bg-[#0d1430] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="space-y-0.5">
                <h3 className="text-lg sm:text-xl font-bold font-display">
                  Buat Topik Diskusi Baru
                </h3>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Gunakan notasi LaTeX untuk menulis rumus matematika seperti $x^2$ atau $\frac{"{a}"}{"{b}"}$.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateThread} className="mt-5 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Kategori Pembahasan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isDark
                      ? "bg-slate-900/80 border-white/10 text-white focus:border-cyan-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500"
                  }`}
                >
                  {FORUM_CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold">
                    Judul Topik <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      newTitle.length > 150 ? "text-rose-400" : isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {newTitle.length}/150 karakter
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bagaimana cara menentukan invers matriks berordo 3x3?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={150}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isDark
                      ? "bg-slate-900/80 border-white/10 text-white focus:border-cyan-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500"
                  }`}
                />
              </div>

              {/* Content / Question */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold">
                    Pertanyaan / Penjelasan Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLatexModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/25 transition-all cursor-pointer"
                    >
                      <Calculator size={12} />
                      <span>Sisipkan Rumus (LaTeX)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        showPreview
                          ? "bg-cyan-500 text-white border-cyan-400"
                          : isDark
                          ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {showPreview ? "Edit Teks" : "Preview Rumus"}
                    </button>
                  </div>
                </div>

                {showPreview ? (
                  <div
                    className={`p-4 rounded-xl min-h-[140px] max-h-[220px] overflow-y-auto border text-xs leading-relaxed ${
                      isDark
                        ? "bg-slate-900/90 border-cyan-500/30 text-slate-200"
                        : "bg-slate-50 border-cyan-300 text-slate-800"
                    }`}
                  >
                    {newContent.trim() ? (
                      <FormattedMathText text={newContent} />
                    ) : (
                      <span className="text-slate-400 italic">Belum ada konten untuk dipratinjau.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    required
                    rows={6}
                    placeholder="Tuliskan pertanyaan, langkah pengerjaan yang sudah dicoba, atau rumus matematika dengan apitan tanda $rumus$..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    maxLength={5000}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-normal border outline-none transition-all resize-y ${
                      isDark
                        ? "bg-slate-900/80 border-white/10 text-white focus:border-cyan-400"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500"
                    }`}
                  />
                )}
                <div className="flex justify-end mt-1">
                  <span className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {newContent.length}/5000 karakter
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? "hover:bg-white/10 text-slate-300"
                      : "hover:bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Menerbitkan...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Terbitkan Topik</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Latex Input Modal */}
      <LatexInputModal
        isOpen={isLatexModalOpen}
        onClose={() => setIsLatexModalOpen(false)}
        onInsert={(latexCode) => {
          setNewContent((prev) => (prev ? `${prev} ${latexCode}` : latexCode));
          setIsLatexModalOpen(false);
          toast.success("Rumus LaTeX berhasil disisipkan!");
        }}
        isDark={isDark}
      />
    </StudentSpatialLayout>
  );
}
