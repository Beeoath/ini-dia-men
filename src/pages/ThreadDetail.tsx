import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Send,
  Pin,
  CheckCircle2,
  ShieldCheck,
  Calculator,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { FormattedMathText } from "../components/MathView";
import { LatexInputModal } from "../components/LatexInputModal";
import { supabase } from "../lib/supabaseClient";
import {
  getThread,
  listReplies,
  createReply,
  toggleLike,
  checkUserLiked,
  setPinned,
  setAnswered,
  setReplyVerified,
  deleteThread,
  deleteReply,
  formatRelativeTime,
  ThreadWithStats,
  ReplyWithAuthor,
} from "../lib/forumApi";

export default function ThreadDetail() {
  const { id, threadId } = useParams<{ id?: string; threadId?: string }>();
  const currentId = id || threadId;
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // State
  const [thread, setThread] = useState<ThreadWithStats | null>(null);
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Likes
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // New Reply Form
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showPreviewReply, setShowPreviewReply] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);

  // Delete confirmations
  const [deleteThreadConfirm, setDeleteThreadConfirm] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);

  // CATATAN KEAMANAN: isTeacher pada client ini HANYA untuk kenyamanan tampilan antarmuka (UI/UX).
  // Keamanan sesungguhnya ditegakkan di database Supabase melalui RLS policy dan trigger check_thread_update_privileges().
  const isTeacher = profile?.role === "teacher";
  const currentUserId = profile?.id;

  // Fetch thread & replies
  const loadThreadAndReplies = async () => {
    if (!currentId) return;
    try {
      setLoading(true);
      setError(null);

      const [threadData, repliesData] = await Promise.all([
        getThread(currentId),
        listReplies(currentId),
      ]);

      if (!threadData) {
        setThread(null);
        return;
      }

      setThread(threadData);
      setLikeCount(threadData.likes_count);
      setReplies(repliesData);

      if (currentUserId) {
        const liked = await checkUserLiked(currentId, currentUserId);
        setHasLiked(liked);
      }
    } catch (err: any) {
      console.error("[ThreadDetail] Error loading:", err);
      setError(err?.message || "Gagal memuat detail diskusi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreadAndReplies();
  }, [currentId, currentUserId]);

  // Realtime subscription for replies & thread updates
  useEffect(() => {
    if (!currentId) return;

    const channel = supabase
      .channel(`realtime_thread_${currentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "replies",
          filter: `thread_id=eq.${currentId}`,
        },
        async () => {
          try {
            const updatedReplies = await listReplies(currentId);
            setReplies(updatedReplies);
          } catch (e) {
            console.error("[Realtime] Error reloading replies:", e);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "threads",
          filter: `id=eq.${currentId}`,
        },
        async () => {
          try {
            const updatedThread = await getThread(currentId);
            if (updatedThread) {
              setThread(updatedThread);
              setLikeCount(updatedThread.likes_count);
            }
          } catch (e) {
            console.error("[Realtime] Error reloading thread:", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentId]);

  // Handle Like / Unlike dengan Optimistic Update & Rollback
  const handleToggleLike = async () => {
    if (!currentId) return;
    if (!currentUserId) {
      toast.error("Silakan masuk terlebih dahulu untuk menyukai topik.");
      return;
    }
    if (likeLoading) return;

    // Simpan state sebelumnya untuk rollback jika gagal
    const prevLiked = hasLiked;
    const prevCount = likeCount;

    // Optimistic update: langsung ubah UI seketika
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);
    setHasLiked(nextLiked);
    setLikeCount(nextCount);
    setLikeLoading(true);

    try {
      const res = await toggleLike(currentId, currentUserId);
      // Sinkronkan status akhir dari server
      setHasLiked(res.liked);
      if (res.liked) {
        toast.success("Anda menyukai topik ini");
      }
    } catch (err: any) {
      // Rollback jika terjadi kesalahan
      setHasLiked(prevLiked);
      setLikeCount(prevCount);
      console.error("[ThreadDetail] Error toggling like:", err);
      toast.error(err?.message || "Gagal memperbarui status like.");
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle Send Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentId) return;
    const trimmed = replyContent.trim();
    if (!trimmed) {
      toast.error("Isi balasan tidak boleh kosong.");
      return;
    }
    if (trimmed.length > 5000) {
      toast.error("Isi balasan terlalu panjang (maks. 5000 karakter).");
      return;
    }

    try {
      setIsSubmittingReply(true);
      const created = await createReply({
        thread_id: currentId,
        content: trimmed,
      });

      setReplies((prev) => [...prev, created]);
      setReplyContent("");
      setShowPreviewReply(false);
      toast.success("Balasan berhasil dikirim!");

      // Update local replies count on thread
      setThread((prev) => (prev ? { ...prev, replies_count: prev.replies_count + 1 } : null));
    } catch (err: any) {
      console.error("[ThreadDetail] Error sending reply:", err);
      toast.error(err?.message || "Gagal mengirim balasan.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Teacher actions on thread
  const handleTogglePin = async () => {
    if (!thread || !isTeacher) return;
    const newStatus = !thread.is_pinned;
    try {
      await setPinned(thread.id, newStatus);
      setThread({ ...thread, is_pinned: newStatus });
      toast.success(newStatus ? "Topik berhasil disematkan!" : "Sematkan topik dilepas.");
    } catch (err: any) {
      console.error("[ThreadDetail] Error pin:", err);
      toast.error(err?.message || "Gagal mengubah status pin.");
    }
  };

  const handleToggleAnswered = async () => {
    if (!thread || !isTeacher) return;
    const newStatus = !thread.is_answered;
    try {
      await setAnswered(thread.id, newStatus);
      setThread({ ...thread, is_answered: newStatus });
      toast.success(newStatus ? "Topik ditandai sebagai terjawab!" : "Status terjawab dibatalkan.");
    } catch (err: any) {
      console.error("[ThreadDetail] Error answered:", err);
      toast.error(err?.message || "Gagal mengubah status terjawab.");
    }
  };

  // Teacher verify reply
  const handleToggleVerifyReply = async (replyId: string, currentStatus: boolean) => {
    if (!isTeacher) return;
    try {
      await setReplyVerified(replyId, !currentStatus);
      setReplies((prev) =>
        prev.map((r) => (r.id === replyId ? { ...r, is_verified: !currentStatus } : r))
      );
      toast.success(!currentStatus ? "Jawaban berhasil diverifikasi sebagai solusi tepat!" : "Verifikasi solusi dicabut.");
    } catch (err: any) {
      console.error("[ThreadDetail] Error verify reply:", err);
      toast.error(err?.message || "Gagal memverifikasi balasan.");
    }
  };

  // Delete Thread
  const handleDeleteThread = async () => {
    if (!thread) return;
    try {
      await deleteThread(thread.id);
      toast.success("Topik diskusi berhasil dihapus.");
      navigate("/app/diskusi", { replace: true });
    } catch (err: any) {
      console.error("[ThreadDetail] Error delete thread:", err);
      toast.error(err?.message || "Gagal menghapus topik diskusi.");
    } finally {
      setDeleteThreadConfirm(false);
    }
  };

  // Delete Reply
  const handleDeleteReply = async (replyId: string) => {
    try {
      await deleteReply(replyId);
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
      setThread((prev) => (prev ? { ...prev, replies_count: Math.max(0, prev.replies_count - 1) } : null));
      toast.success("Balasan berhasil dihapus.");
    } catch (err: any) {
      console.error("[ThreadDetail] Error delete reply:", err);
      toast.error(err?.message || "Gagal menghapus balasan.");
    } finally {
      setDeleteReplyId(null);
    }
  };

  // Loading view
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <div className="h-6 w-32 bg-slate-700/30 rounded animate-pulse" />
        <div className={`p-8 rounded-3xl border animate-pulse space-y-5 ${isDark ? "bg-[#0d1430]/60 border-white/5" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700/40" />
            <div className="space-y-1.5">
              <div className="w-32 h-4 rounded bg-slate-700/40" />
              <div className="w-20 h-3 rounded bg-slate-700/30" />
            </div>
          </div>
          <div className="w-3/4 h-7 rounded bg-slate-700/40" />
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-slate-700/30" />
            <div className="w-5/6 h-4 rounded bg-slate-700/30" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found view
  if (!thread) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center px-4 space-y-6">
        <div
          className={`grid h-16 w-16 place-items-center rounded-2xl mx-auto ${
            isDark ? "bg-white/5 border border-white/10 text-slate-400" : "bg-slate-100 border border-slate-200 text-slate-500"
          }`}
        >
          <MessageSquare size={32} />
        </div>
        <div className="space-y-1.5">
          <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Topik Diskusi Tidak Ditemukan
          </h2>
          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Topik ini mungkin telah dihapus oleh penulis atau guru, atau tautan yang Anda buka tidak valid.
          </p>
        </div>
        <div>
          <Link
            to="/app/diskusi"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-slate-950 px-5 py-2.5 text-xs font-bold hover:bg-cyan-300 transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft size={14} /> Kembali ke Forum Diskusi
          </Link>
        </div>
      </div>
    );
  }

  const isThreadAuthor = currentUserId === thread.author_id;
  const canDeleteThread = isThreadAuthor || isTeacher;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6 space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/diskusi"
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
            isDark ? "text-slate-400 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600"
          }`}
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Semua Topik</span>
        </Link>

        {/* Teacher Moderation Bar if Teacher */}
        {isTeacher && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                thread.is_pinned
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : isDark
                  ? "bg-white/5 text-amber-400 border border-amber-500/30 hover:bg-amber-500/10"
                  : "bg-white text-amber-600 border border-amber-300 hover:bg-amber-50"
              }`}
            >
              <Pin size={13} className={thread.is_pinned ? "fill-slate-950" : ""} />
              <span>{thread.is_pinned ? "Lepas Pin" : "Sematkan"}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleAnswered}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                thread.is_answered
                  ? "bg-emerald-500 text-white shadow-sm"
                  : isDark
                  ? "bg-white/5 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
                  : "bg-white text-emerald-600 border border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>{thread.is_answered ? "Tandai Belum Terjawab" : "Tandai Terjawab"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Thread Card */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xl transition-all ${
          thread.is_pinned
            ? isDark
              ? "bg-gradient-to-b from-[#101b3d] to-[#0d1430] border-amber-500/40 shadow-amber-500/5"
              : "bg-gradient-to-b from-amber-50/50 to-white border-amber-300"
            : isDark
            ? "bg-[#0d1430]/80 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Meta badges & actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {thread.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px]">
                <Pin size={11} className="fill-amber-400 text-amber-400" />
                Disematkan Guru
              </span>
            )}
            {thread.is_answered && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px]">
                <CheckCircle2 size={11} />
                Sudah Terjawab
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                isDark
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "bg-cyan-50 text-cyan-700 border border-cyan-200"
              }`}
            >
              {thread.category}
            </span>
          </div>

          {/* Delete Button for Author or Teacher */}
          {canDeleteThread && (
            <button
              type="button"
              onClick={() => setDeleteThreadConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Hapus Topik</span>
            </button>
          )}
        </div>

        {/* Title */}
        <h1
          className={`text-xl sm:text-2xl font-black font-display tracking-tight leading-snug ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {thread.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm uppercase ${
              thread.author_role === "teacher"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
            }`}
          >
            {thread.author_name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {thread.author_name || "Pengguna"}
              </span>
              {thread.author_role === "teacher" ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldCheck size={11} /> Guru Pengampu
                </span>
              ) : thread.author_class ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isDark ? "bg-white/5 text-slate-400 border border-white/5" : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {thread.author_class}
                </span>
              ) : null}
            </div>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Ditanyakan {formatRelativeTime(thread.created_at)}
            </p>
          </div>
        </div>

        {/* Content with LaTeX formatting */}
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap py-2 ${
            isDark ? "text-slate-200" : "text-slate-800"
          }`}
        >
          <FormattedMathText text={thread.content} />
        </div>

        {/* Bottom stats: Like Button */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={likeLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hasLiked
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                : isDark
                ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <ThumbsUp size={14} className={hasLiked ? "fill-white" : ""} />
            <span>{hasLiked ? "Disukai" : "Sukai Topik"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[11px]">
              {likeCount}
            </span>
          </button>

          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {replies.length} Balasan
          </span>
        </div>
      </div>

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className={`text-base sm:text-lg font-bold font-display ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Diskusi &amp; Solusi ({replies.length})
          </h3>
          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Diurutkan dari yang terlama
          </span>
        </div>

        {replies.length === 0 ? (
          <div
            className={`p-10 rounded-2xl border text-center space-y-2 ${
              isDark ? "bg-[#0d1430]/40 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600 shadow-sm"
            }`}
          >
            <MessageSquare size={28} className="mx-auto opacity-50" />
            <p className="text-xs font-semibold">Belum ada balasan untuk topik ini.</p>
            <p className="text-[11px] opacity-80">Jadilah yang pertama membantu menjawab pertanyaan di atas!</p>
          </div>
        ) : (
          replies.map((rep) => {
            const author = rep.author;
            const authorName = author?.full_name || "Pengguna";
            const isRepTeacher = author?.role === "teacher";
            const authorClass = author?.class_name;
            const isReplyAuthor = currentUserId === rep.author_id;
            const canDeleteReply = isReplyAuthor || isTeacher;

            return (
              <div
                key={rep.id}
                className={`rounded-2xl border p-5 sm:p-6 space-y-3.5 transition-all ${
                  rep.is_verified
                    ? isDark
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                      : "bg-emerald-50/70 border-emerald-300"
                    : isDark
                    ? "bg-[#0d1430]/60 border-white/10"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                {/* Header: Author & Verified Solution Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                        isRepTeacher
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "bg-cyan-500 text-slate-950"
                      }`}
                    >
                      {authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {authorName}
                        </span>
                        {isRepTeacher ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <ShieldCheck size={10} /> Guru
                          </span>
                        ) : authorClass ? (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              isDark ? "bg-white/5 text-slate-400 border border-white/5" : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {authorClass}
                          </span>
                        ) : null}
                      </div>
                      <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {formatRelativeTime(rep.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Verified Solution indicator / Teacher Button */}
                  <div className="flex items-center gap-2">
                    {rep.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Check size={12} className="stroke-[3]" /> Solusi Terverifikasi Guru
                      </span>
                    )}

                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => handleToggleVerifyReply(rep.id, rep.is_verified)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          rep.is_verified
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                        }`}
                      >
                        {rep.is_verified ? "Batal Verifikasi" : "Verifikasi Jawaban"}
                      </button>
                    )}

                    {canDeleteReply && (
                      <button
                        type="button"
                        onClick={() => setDeleteReplyId(rep.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Hapus balasan"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply Content with KaTeX */}
                <div
                  className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pl-1 ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  <FormattedMathText text={rep.content} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Reply Box */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 space-y-4 shadow-xl ${
          isDark ? "bg-[#0d1430]/90 border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className={`text-sm font-bold font-display ${isDark ? "text-white" : "text-slate-900"}`}>
              Beri Tanggapan atau Solusi
            </h4>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Sertakan langkah pengerjaan atau rumus dengan format LaTeX agar mudah dipahami.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLatexModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/25 transition-all cursor-pointer"
            >
              <Calculator size={13} />
              <span className="hidden sm:inline">Sisipkan Rumus</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPreviewReply(!showPreviewReply)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showPreviewReply
                  ? "bg-cyan-500 text-white border-cyan-400"
                  : isDark
                  ? "bg-white/5 text-slate-300 border-white/10"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {showPreviewReply ? "Edit Teks" : "Preview Rumus"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSendReply} className="space-y-3">
          {showPreviewReply ? (
            <div
              className={`p-4 rounded-2xl min-h-[120px] max-h-[220px] overflow-y-auto border text-xs sm:text-sm leading-relaxed ${
                isDark
                  ? "bg-slate-900/90 border-cyan-500/30 text-slate-200"
                  : "bg-slate-50 border-cyan-300 text-slate-800"
              }`}
            >
              {replyContent.trim() ? (
                <FormattedMathText text={replyContent} />
              ) : (
                <span className="text-slate-400 italic">Belum ada konten balasan untuk dipratinjau.</span>
              )}
            </div>
          ) : (
            <textarea
              required
              rows={4}
              placeholder="Tuliskan jawaban Anda... gunakan $rumus$ untuk rumus matematika dalam baris atau $$rumus$$ untuk baris terpisah."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              maxLength={5000}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm outline-none border transition-all resize-y ${
                isDark
                  ? "bg-slate-900/80 border-white/10 text-white focus:border-cyan-400"
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500"
              }`}
            />
          )}

          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {replyContent.length}/5000 karakter
            </span>

            <button
              type="submit"
              disabled={isSubmittingReply}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmittingReply ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Kirim Balasan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Thread Confirmation Modal */}
      {deleteThreadConfirm && (
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
              <h3 className="text-base font-bold">Hapus Topik Diskusi?</h3>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Apakah Anda yakin ingin menghapus topik ini? Seluruh balasan dan diskusi yang terkait akan terhapus secara permanen.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteThreadConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteThread}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Hapus Topik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reply Confirmation Modal */}
      {deleteReplyId && (
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
              <h3 className="text-base font-bold">Hapus Balasan?</h3>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Apakah Anda yakin ingin menghapus balasan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteReplyId(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReply(deleteReplyId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Hapus Balasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Latex Input Modal */}
      <LatexInputModal
        isOpen={showLatexModal}
        onClose={() => setShowLatexModal(false)}
        onInsert={(latex) => {
          setReplyContent((prev) => (prev ? `${prev} ${latex}` : latex));
          setShowLatexModal(false);
          toast.success("Rumus LaTeX berhasil disisipkan!");
        }}
        isDark={isDark}
      />
    </div>
  );
}
