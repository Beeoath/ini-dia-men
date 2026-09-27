import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, ShieldCheck, Pin, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { INITIAL_DISCUSSIONS, DiscussionThread } from "../lib/sigmaData";
import { Badge } from "../components/Primitives";
import { useTheme } from "../lib/theme";

const STORAGE_KEY = "sigma_discussion_threads_v3";

export default function TeacherModeration() {
  const { isDark } = useTheme();
  const [threads, setThreads] = useState<DiscussionThread[]>(() => {
    try {
      localStorage.removeItem("sigma_discussion_threads");
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DISCUSSIONS;
  });

  const saveUpdatedThreads = (newThreads: DiscussionThread[]) => {
    setThreads(newThreads);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newThreads));
    } catch {
      // ignore
    }
  };

  const clearAllThreads = () => {
    saveUpdatedThreads([]);
    toast.success("Seluruh forum diskusi telah dikosongkan.");
  };

  const togglePin = (id: string) => {
    const updated = threads.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    saveUpdatedThreads(updated);
    toast.success("Status pin berhasil diperbarui!");
  };

  const deleteThread = (id: string) => {
    const updated = threads.filter((t) => t.id !== id);
    saveUpdatedThreads(updated);
    toast.success("Thread diskusi berhasil dihapus.");
  };

  return (
    <div className="space-y-6 w-full py-2 sm:py-4 px-1 sm:px-2">
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
          className={`mt-0.5 text-sm ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Kelola pertanyaan siswa, sematkan pengumuman penting, dan verifikasi jawaban matematika yang
          tepat.
        </p>
      </div>

      <div className="space-y-3">
        {threads.length === 0 ? (
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
            <p
              className={`text-xs max-w-sm mx-auto ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Forum diskusi masih kosong. Pertanyaan baru dari siswa akan muncul di sini untuk dikelola
              oleh guru.
            </p>
          </div>
        ) : (
          threads.map((thr) => (
            <div
              key={thr.id}
              className={`rounded-2xl border p-5 space-y-3 shadow-lg transition-all ${
                isDark
                  ? "border-white/10 bg-[#0d1430]/80 text-slate-100"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-cyan-400/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-300">
                    {thr.category}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    oleh {thr.authorName} ({thr.authorClass})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePin(thr.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      thr.isPinned
                        ? "border-amber-400 bg-amber-400/20 text-amber-600 dark:text-amber-300"
                        : isDark
                        ? "border-white/10 text-slate-400 hover:text-white"
                        : "border-slate-300 text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                    }`}
                    title={thr.isPinned ? "Lepas Pin" : "Sematkan"}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteThread(thr.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isDark
                        ? "border-white/10 text-slate-400 hover:border-rose-500 hover:bg-rose-500/20 hover:text-rose-400"
                        : "border-slate-300 text-slate-600 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3
                className={`text-base font-bold ${
                  isDark ? "text-white" : "text-slate-950"
                }`}
              >
                {thr.title}
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {thr.content}
              </p>

              <div
                className={`flex items-center justify-between pt-3 border-t text-xs font-mono ${
                  isDark ? "border-white/5 text-slate-400" : "border-slate-100 text-slate-500"
                }`}
              >
                <span>{thr.repliesCount} Balasan Siswa</span>
                <Link
                  to={`/app/diskusi/${thr.id}`}
                  className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Buka &amp; Beri Jawaban Guru <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
