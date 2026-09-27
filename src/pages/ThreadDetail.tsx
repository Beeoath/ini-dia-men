import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, ThumbsUp, Send, User, ShieldCheck, Calculator } from "lucide-react";
import { INITIAL_DISCUSSIONS } from "../lib/sigmaData";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { FormattedMathText } from "../components/MathView";
import { LatexInputModal } from "../components/LatexInputModal";

export default function ThreadDetail() {
  const { id, threadId } = useParams();
  const currentId = threadId || id;
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const [showLatexModal, setShowLatexModal] = useState(false);

  const threads = (() => {
    try {
      const saved = localStorage.getItem("sigma_discussion_threads_v3") || localStorage.getItem("sigma_discussion_threads");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DISCUSSIONS;
  })();

  const thread = threads.find((t: any) => t.id === currentId);

  const [replies, setReplies] = useState<
    Array<{
      id: string;
      author: string;
      role: "teacher" | "student";
      content: string;
      createdAt: string;
    }>
  >([]);
  const [newReply, setNewReply] = useState("");
  const [likes, setLikes] = useState(thread?.upvotes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  if (!thread) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12 text-center px-4">
        <div
          className={`grid h-16 w-16 place-items-center rounded-2xl mx-auto ${
            isDark ? "bg-white/5 border border-white/10 text-slate-400" : "bg-slate-100 border border-slate-200 text-slate-500"
          }`}
        >
          <MessageSquare size={32} />
        </div>
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Topik Diskusi Tidak Ditemukan
        </h2>
        <p className={`text-xs max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Topik diskusi ini mungkin telah dihapus, masih kosong, atau tautan yang Anda buka tidak valid.
        </p>
        <div>
          <Link
            to="/app/diskusi"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 text-slate-950 px-5 py-2.5 text-xs font-bold hover:bg-cyan-300 transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft size={14} /> Kembali ke Forum Diskusi
          </Link>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((l: number) => l + 1);
      setHasLiked(true);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setReplies([
      ...replies,
      {
        id: `rep-${Date.now()}`,
        author: profile?.full_name || "Siswa MA Darunnajah 9",
        role: profile?.role || "student",
        content: newReply.trim(),
        createdAt: "Baru saja",
      },
    ]);
    setNewReply("");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-0">
      <Link
        to="/app/diskusi"
        className={`inline-flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
          isDark ? "text-slate-400 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600"
        }`}
      >
        <ArrowLeft size={15} />
        <span>Kembali ke daftar forum</span>
      </Link>

      {/* Main Post Card */}
      <div
        className={`rounded-xl border p-6 sm:p-7 space-y-4 transition-colors ${
          isDark
            ? "border-white/[0.08] bg-[#141724] text-slate-100"
            : "border-slate-200 bg-white text-slate-900 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-normal ${
              isDark
                ? "bg-white/[0.06] border border-white/[0.08] text-slate-300"
                : "bg-slate-100 border border-slate-200 text-slate-600"
            }`}
          >
            {thread.category}
          </span>
          {thread.isPinned && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                isDark
                  ? "bg-amber-400/10 border border-amber-400/25 text-amber-300"
                  : "bg-amber-50 border border-amber-200 text-amber-800"
              }`}
            >
              <span>Pinned</span>
            </span>
          )}
          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            • Ditulis oleh {thread.authorName} ({thread.authorClass})
          </span>
        </div>

        <h1
          className={`text-xl sm:text-2xl font-medium tracking-tight ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          {thread.title}
        </h1>

        <div
          className={`text-sm leading-[1.6] select-text ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <FormattedMathText text={thread.content} />
        </div>

        <div
          className={`pt-4 border-t flex items-center justify-between text-xs ${
            isDark ? "border-white/[0.08]" : "border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              hasLiked
                ? "text-cyan-400 bg-cyan-400/10 border border-cyan-400/30"
                : isDark
                ? "text-slate-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.04]"
                : "text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ThumbsUp size={13} className={hasLiked ? "fill-cyan-400 stroke-cyan-400" : "stroke-[1.6]"} />
            <span>{likes} dukungan</span>
          </button>
          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {thread.createdAt}
          </span>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-3">
        <h2
          className={`text-sm font-medium flex items-center gap-2 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          <MessageSquare size={15} className="text-cyan-400 stroke-[1.6]" />
          <span>Tanggapan ({replies.length})</span>
        </h2>

        {replies.length === 0 ? (
          <div
            className={`rounded-xl border p-6 text-center space-y-1.5 ${
              isDark ? "border-white/[0.08] bg-[#141724]" : "border-slate-200 bg-white"
            }`}
          >
            <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Belum ada tanggapan untuk topik ini
            </p>
            <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Jadilah yang pertama memberikan solusi atau pembahasan matematika!
            </p>
          </div>
        ) : (
          replies.map((rep) => (
            <div
              key={rep.id}
              className={`rounded-xl border p-5 space-y-2 transition-colors ${
                rep.role === "teacher"
                  ? isDark
                    ? "border-amber-400/25 bg-[#171b29]"
                    : "border-amber-200 bg-amber-50/50"
                  : isDark
                  ? "border-white/[0.08] bg-[#141724]"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    {rep.author}
                  </span>
                  {rep.role === "teacher" && (
                    <span className="flex items-center gap-1 rounded bg-amber-500/15 border border-amber-400/20 px-1.5 py-0.5 text-[11px] font-medium text-amber-300">
                      <ShieldCheck size={11} /> Guru pengampu
                    </span>
                  )}
                </div>
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {rep.createdAt}
                </span>
              </div>
              <div
                className={`text-[13px] leading-[1.6] select-text ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <FormattedMathText text={rep.content} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply input */}
      <form onSubmit={handleSendReply} className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Tulis Tanggapan atau Jawaban:
          </label>
          <button
            type="button"
            onClick={() => setShowLatexModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
          >
            <Calculator size={13} />
            <span>+ Input Rumus LaTeX</span>
          </button>
        </div>

        <textarea
          required
          rows={3}
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Tuliskan jawaban atau rumus ($...$) Anda..."
          className={`w-full rounded-xl border p-4 text-xs sm:text-sm leading-[1.6] resize-none outline-none transition-colors ${
            isDark
              ? "border-white/[0.08] bg-[#0f111a] text-white placeholder-slate-500 focus:border-cyan-400/50"
              : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-600 shadow-sm"
          }`}
        />

        {newReply && (newReply.includes("$") || newReply.includes("\\")) && (
          <div className="p-2.5 rounded-xl border border-cyan-400/30 bg-black/20 text-xs">
            <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
              Pratinjau KaTeX:
            </span>
            <FormattedMathText text={newReply} />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
          >
            <Send size={14} className="stroke-[1.8]" />
            <span>Kirim balasan</span>
          </button>
        </div>
      </form>

      {/* LaTeX Input Modal */}
      <LatexInputModal
        isOpen={showLatexModal}
        onClose={() => setShowLatexModal(false)}
        onInsert={(code) => {
          setNewReply((prev) => (prev ? `${prev} ${code} ` : `${code} `));
        }}
        isDark={isDark}
        title="Input Rumus LaTeX ke Balasan Forum"
      />
    </div>
  );
}
