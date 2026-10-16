import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  Eye,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Info,
  Code,
  Radio,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { MODULES, SigmaModule, QuizQuestion } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { FormattedMathText } from "../components/MathView";
import { LatexInputModal } from "../components/LatexInputModal";
import {
  QuizQuestionRow,
  getTeacherQuizQuestions,
  importBuiltinQuizQuestions,
  upsertQuizQuestion,
  deleteQuizQuestion,
  toggleQuizQuestionActive,
  swapQuizQuestionOrders,
} from "../lib/quizApi";

export default function TeacherQuizEditor() {
  const { isDark } = useTheme();
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Role check: Hanya guru yang diizinkan
  useEffect(() => {
    if (!authLoading && profile && profile.role !== "teacher") {
      navigate("/app/dashboard", { replace: true });
    }
  }, [profile, authLoading, navigate]);

  // Modul terpilih (dari URL atau default ke Bab 1)
  const initialModuleId = searchParams.get("moduleId") || MODULES[0].id;
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId);

  const currentModule = MODULES.find((m) => m.id === selectedModuleId) || MODULES[0];

  // State soal kuis
  const [questions, setQuestions] = useState<QuizQuestionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);

  // State Modal Form (Tambah / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionRow | null>(null);
  const [questionText, setQuestionText] = useState<string>("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanationText, setExplanationText] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // State Modal Hapus
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestionRow | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // State LaTeX Input Modal
  const [isLatexOpen, setIsLatexOpen] = useState<boolean>(false);
  const [latexTarget, setLatexTarget] = useState<
    { field: "question" | "explanation" | "option"; optIdx?: number }
  >({ field: "question" });

  // Update URL param saat modul berubah
  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSearchParams({ moduleId });
  };

  // Muat data soal dari tabel Supabase
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getTeacherQuizQuestions(selectedModuleId);
      setQuestions(data);
    } catch (err: any) {
      console.error("[TeacherQuizEditor] Error saat memuat soal kuis:", err);
      toast.error("Gagal memuat soal kuis dari server: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedModuleId]);

  // Buka modal tambah soal baru
  const handleOpenAddForm = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setExplanationText("");
    setIsActive(true);
    setIsFormOpen(true);
  };

  // Buka modal edit soal
  const handleOpenEditForm = (q: QuizQuestionRow) => {
    setEditingQuestion(q);
    setQuestionText(q.question);
    setOptions(q.options.length >= 2 ? [...q.options] : ["", ""]);
    setCorrectIndex(q.correct_answer ?? 0);
    setExplanationText(q.explanation || "");
    setIsActive(Boolean(q.is_active));
    setIsFormOpen(true);
  };

  // Tutup form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
  };

  // Tambah opsi jawaban (maksimal 5)
  const handleAddOption = () => {
    if (options.length >= 5) {
      toast.info("Maksimal 5 pilihan jawaban (A sampai E).");
      return;
    }
    setOptions((prev) => [...prev, ""]);
  };

  // Hapus opsi jawaban (minimal 2)
  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) {
      toast.info("Minimal harus ada 2 pilihan jawaban.");
      return;
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (correctIndex === indexToRemove) {
      setCorrectIndex(0);
    } else if (correctIndex > indexToRemove) {
      setCorrectIndex((prev) => prev - 1);
    }
  };

  // Update teks opsi
  const handleOptionChange = (idx: number, val: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  // Buka Latex modal untuk target tertentu
  const handleOpenLatex = (
    field: "question" | "explanation" | "option",
    optIdx?: number
  ) => {
    setLatexTarget({ field, optIdx });
    setIsLatexOpen(true);
  };

  // Saat rumus LaTeX diinsert dari modal
  const handleInsertLatex = (latexCode: string) => {
    if (latexTarget.field === "question") {
      setQuestionText((prev) => (prev ? `${prev} ${latexCode}` : latexCode));
    } else if (latexTarget.field === "explanation") {
      setExplanationText((prev) => (prev ? `${prev} ${latexCode}` : latexCode));
    } else if (latexTarget.field === "option" && latexTarget.optIdx !== undefined) {
      const targetIdx = latexTarget.optIdx;
      setOptions((prev) => {
        const copy = [...prev];
        copy[targetIdx] = copy[targetIdx] ? `${copy[targetIdx]} ${latexCode}` : latexCode;
        return copy;
      });
    }
    toast.success("Rumus matematika berhasil disisipkan!");
  };

  // Validasi dan simpan soal (Tambah / Edit)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      toast.error("Teks soal tidak boleh kosong.");
      return;
    }

    if (options.length < 2 || options.length > 5) {
      toast.error("Jumlah pilihan jawaban harus antara 2 sampai 5 pilihan.");
      return;
    }

    const hasEmptyOption = options.some((opt) => !opt.trim());
    if (hasEmptyOption) {
      toast.error("Semua pilihan jawaban harus terisi (tidak boleh ada yang kosong).");
      return;
    }

    if (correctIndex < 0 || correctIndex >= options.length) {
      toast.error("Silakan pilih salah satu jawaban benar.");
      return;
    }

    try {
      setSaving(true);
      const nextOrderIndex =
        editingQuestion?.order_index ??
        (questions.length > 0 ? Math.max(...questions.map((q) => q.order_index)) + 1 : 1);

      await upsertQuizQuestion({
        id: editingQuestion?.id,
        moduleId: selectedModuleId,
        question: questionText.trim(),
        options: options.map((opt) => opt.trim()),
        correctAnswer: correctIndex,
        explanation: explanationText.trim() || null,
        isActive,
        orderIndex: nextOrderIndex,
        userId: profile?.id,
      });

      toast.success(
        editingQuestion ? "Soal berhasil diperbarui!" : "Soal baru berhasil ditambahkan!"
      );
      handleCloseForm();
      await loadQuestions();
    } catch (err: any) {
      console.error("[TeacherQuizEditor] Gagal menyimpan soal:", err);
      toast.error("Gagal menyimpan soal: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setSaving(false);
    }
  };

  // Hapus soal dengan konfirmasi
  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      setDeleting(true);
      await deleteQuizQuestion(questionToDelete.id);
      toast.success("Soal berhasil dihapus.");
      setQuestionToDelete(null);
      await loadQuestions();
    } catch (err: any) {
      console.error("[TeacherQuizEditor] Gagal menghapus soal:", err);
      toast.error("Gagal menghapus soal: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setDeleting(false);
    }
  };

  // Toggle status aktif
  const handleToggleActive = async (q: QuizQuestionRow) => {
    try {
      const updated = await toggleQuizQuestionActive(q.id, q.is_active);
      toast.success(updated ? "Soal diaktifkan untuk kuis siswa." : "Soal dinonaktifkan.");
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, is_active: updated } : item))
      );
    } catch (err: any) {
      console.error("[TeacherQuizEditor] Gagal toggle status soal:", err);
      toast.error("Gagal mengubah status soal: " + (err.message || "Error"));
    }
  };

  // Atur urutan soal (Naik / Turun)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const qCurrent = questions[index];
    const qTarget = questions[targetIndex];

    try {
      // Optimistic update
      const newQuestions = [...questions];
      const tempOrder = qCurrent.order_index;
      qCurrent.order_index = qTarget.order_index;
      qTarget.order_index = tempOrder;
      newQuestions[index] = qTarget;
      newQuestions[targetIndex] = qCurrent;
      setQuestions(newQuestions);

      await swapQuizQuestionOrders(
        { id: qCurrent.id, order_index: qCurrent.order_index },
        { id: qTarget.id, order_index: qTarget.order_index }
      );

      toast.success("Urutan soal berhasil diperbarui.");
    } catch (err: any) {
      console.error("[TeacherQuizEditor] Gagal mengubah urutan:", err);
      toast.error("Gagal memperbarui urutan soal.");
      await loadQuestions(); // Rollback jika gagal
    }
  };

  // Impor soal bawaan di kode ke tabel quiz_questions
  const handleImportBuiltin = async () => {
    if (!profile?.id) {
      toast.error("Sesi login guru tidak terdeteksi.");
      return;
    }

    if (questions.length > 0) {
      toast.info("Modul ini sudah memiliki soal di database.");
      return;
    }

    const defaultQuestions = currentModule.quiz;
    if (!defaultQuestions || defaultQuestions.length === 0) {
      toast.error("Tidak ada soal bawaan di kode untuk modul ini.");
      return;
    }

    try {
      setImporting(true);
      await importBuiltinQuizQuestions(selectedModuleId, profile.id, defaultQuestions);
      toast.success(`Berhasil mengimpor ${defaultQuestions.length} soal bawaan ke database!`);
      await loadQuestions();
    } catch (err: any) {
      console.error("[TeacherQuizEditor] Gagal mengimpor soal bawaan:", err);
      toast.error("Gagal mengimpor soal bawaan: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setImporting(false);
    }
  };

  const activeQuestionsCount = questions.filter((q) => q.is_active).length;
  const optionLetters = ["A", "B", "C", "D", "E"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Halaman */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all shadow-sm ${
          isDark
            ? "border-white/10 bg-[#0d1430]/90 text-white"
            : "border-slate-200 bg-white text-slate-900 shadow-xl"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-400/40 bg-cyan-400/10 text-cyan-400">
                PANEL GURU • EVALUASI PEMBELAJARAN
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  questions.length > 0
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {questions.length > 0 ? "Bank Soal Database Aktif" : "Mode Fallback Bawaan Kode"}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black">
              Editor Soal Kuis
            </h1>

            <p
              className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Kelola dan susun bank soal kuis untuk setiap modul materi. Soal yang aktif akan
              langsung ditampilkan pada kuis siswa dengan standar ketuntasan KKM 70.
            </p>
          </div>

          {/* Action Buttons Top */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {questions.length === 0 && (
              <button
                type="button"
                onClick={handleImportBuiltin}
                disabled={importing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download size={14} className={importing ? "animate-bounce" : ""} />
                {importing ? "Mengimpor..." : "Impor Soal Bawaan"}
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <Plus size={15} /> Tambah Soal
            </button>

            <Link
              to={`/app/kuis/${selectedModuleId}`}
              target="_blank"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
              title="Pratinjau tampilan pengerjaan kuis siswa"
            >
              <Eye size={14} /> Pratinjau Kuis ↗
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[11px] font-mono text-slate-400 block">Modul Terpilih</span>
            <span className="font-display font-bold text-sm truncate block mt-0.5">
              {currentModule.title}
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[11px] font-mono text-slate-400 block">Total Soal Database</span>
            <span className="font-display font-bold text-base text-cyan-400 block mt-0.5">
              {questions.length} Soal
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[11px] font-mono text-slate-400 block">Soal Aktif Siswa</span>
            <span className="font-display font-bold text-base text-emerald-400 block mt-0.5">
              {activeQuestionsCount} Soal
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[11px] font-mono text-slate-400 block">KKM Kelulusan</span>
            <span className="font-display font-bold text-base text-purple-400 block mt-0.5">
              70 / 100
            </span>
          </div>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="space-y-2">
        <label
          className={`text-xs font-mono font-bold uppercase tracking-wider block ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Pilih Modul Pembelajaran:
        </label>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? isDark
                      ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20 font-black"
                      : "bg-slate-950 text-white shadow-md font-black"
                    : isDark
                    ? "bg-[#121629] text-slate-300 border border-white/10 hover:border-cyan-400/40 hover:text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-cyan-500/50 hover:bg-slate-50"
                }`}
              >
                <BookOpen size={13} />
                <span>{mod.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daftar Soal / Empty State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="font-mono text-xs text-slate-400">
            Memuat soal kuis dari database...
          </span>
        </div>
      ) : questions.length === 0 ? (
        /* Empty State */
        <div
          className={`rounded-3xl border p-8 sm:p-12 text-center space-y-6 ${
            isDark
              ? "border-white/10 bg-[#0d1430]/60 text-slate-300"
              : "border-slate-200 bg-white text-slate-700 shadow-sm"
          }`}
        >
          <div
            className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border ${
              isDark
                ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                : "bg-amber-50 border-amber-200 text-amber-600"
            }`}
          >
            <HelpCircle size={32} />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3
              className={`font-display text-lg sm:text-xl font-bold ${
                isDark ? "text-white" : "text-slate-950"
              }`}
            >
              Belum Ada Soal di Database untuk Modul Ini
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Saat ini kuis siswa pada modul ini secara otomatis menggunakan{" "}
              <strong>{currentModule.quiz.length} soal bawaan kode</strong> aplikasi.
              Anda dapat mengimpor soal bawaan tersebut agar dapat langsung diedit atau disesuaikan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleImportBuiltin}
              disabled={importing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={14} className={importing ? "animate-bounce" : ""} />
              {importing ? "Mengimpor Soal..." : "Salin / Impor Soal Bawaan ke Database"}
            </button>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-md shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <Plus size={14} /> Buat Soal dari Nol
            </button>
          </div>

          {/* Pratinjau Soal Bawaan Kode */}
          <div className="pt-6 border-t border-white/10 text-left max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info size={13} /> Pratinjau Soal Bawaan di Kode ({currentModule.quiz.length} Soal):
            </span>
            <div className="space-y-2">
              {currentModule.quiz.map((bq, bIdx) => (
                <div
                  key={bq.id}
                  className={`p-3.5 rounded-xl border text-xs ${
                    isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between text-slate-400 mb-1">
                    <span>Soal #{bIdx + 1}</span>
                    <span className="text-[11px] text-emerald-500">
                      Kunci: {optionLetters[bq.correctAnswer]}
                    </span>
                  </div>
                  <FormattedMathText text={bq.question} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List Soal */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>
              Menampilkan {questions.length} soal (Urutan berdasarkan posisi pengerjaan siswa)
            </span>
            <span>KKM Minimal: 70%</span>
          </div>

          <div className="space-y-3.5">
            {questions.map((q, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === questions.length - 1;

              return (
                <div
                  key={q.id}
                  className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                    isDark
                      ? q.is_active
                        ? "border-white/10 bg-[#121629] hover:border-cyan-400/30 text-slate-200"
                        : "border-white/5 bg-[#0a0d1d] opacity-65 text-slate-400"
                      : q.is_active
                      ? "border-slate-200 bg-white hover:border-cyan-500/50 text-slate-900 shadow-sm"
                      : "border-slate-200 bg-slate-50 opacity-65 text-slate-600"
                  }`}
                >
                  {/* Top Bar Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center h-7 w-7 rounded-xl font-mono text-xs font-black bg-cyan-400/20 text-cyan-400 border border-cyan-400/30">
                        #{idx + 1}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          q.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {q.is_active ? (
                          <>
                            <CheckCircle2 size={11} /> Aktif (Tampil di Kuis)
                          </>
                        ) : (
                          <>
                            <XCircle size={11} /> Nonaktif (Disembunyikan)
                          </>
                        )}
                      </span>

                      <span className="text-[11px] font-mono text-slate-400">
                        {q.options.length} Pilihan Jawaban
                      </span>
                    </div>

                    {/* Action Tools */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Tombol Urutan Naik */}
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={isFirst}
                        className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isDark
                            ? "border-white/10 text-slate-300 hover:bg-white/10"
                            : "border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Geser Urutan Naik"
                      >
                        <ArrowUp size={14} />
                      </button>

                      {/* Tombol Urutan Turun */}
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={isLast}
                        className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isDark
                            ? "border-white/10 text-slate-300 hover:bg-white/10"
                            : "border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Geser Urutan Turun"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Tombol Toggle Aktif / Nonaktif */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(q)}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          q.is_active
                            ? isDark
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : isDark
                            ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                            : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                        title={q.is_active ? "Nonaktifkan Soal" : "Aktifkan Soal"}
                      >
                        {q.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>

                      {/* Tombol Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(q)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit size={12} /> Edit
                      </button>

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        onClick={() => setQuestionToDelete(q)}
                        className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          isDark
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        }`}
                        title="Hapus Soal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-4">
                    <div className="text-sm sm:text-base font-medium leading-relaxed">
                      <FormattedMathText text={q.question} />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correct_answer;
                        const letter = optionLetters[optIdx] || String(optIdx + 1);

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 transition-all ${
                              isCorrect
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm"
                                : isDark
                                ? "border-white/5 bg-white/[0.02] text-slate-300"
                                : "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center h-6 w-6 rounded-lg text-xs font-mono font-bold shrink-0 mt-0.5 ${
                                isCorrect
                                  ? "bg-emerald-500 text-slate-950"
                                  : isDark
                                  ? "bg-white/10 text-slate-300"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {letter}
                            </span>

                            <div className="flex-1 min-w-0">
                              <FormattedMathText text={opt} />
                            </div>

                            {isCorrect && (
                              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                                <Check size={11} /> Kunci
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                          isDark
                            ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-200"
                            : "border-cyan-200 bg-cyan-50/70 text-cyan-900"
                        }`}
                      >
                        <div className="font-mono text-[11px] font-bold text-cyan-400 uppercase flex items-center gap-1">
                          <Sparkles size={12} /> Pembahasan / Penjelasan:
                        </div>
                        <FormattedMathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL FORM SOAL (TAMBAH / EDIT) ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 my-auto transition-all ${
              isDark
                ? "border-white/15 bg-[#0d1430] text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  {editingQuestion ? "EDIT SOAL #" + editingQuestion.order_index : "TAMBAH SOAL BARU"}
                </span>
                <h3 className="font-display text-xl font-bold">
                  {editingQuestion ? "Perbarui Soal Kuis" : "Buat Soal Kuis Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              {/* Field 1: Teks Soal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Teks Soal <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenLatex("question")}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border border-cyan-400/40 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-all cursor-pointer"
                  >
                    <Code size={12} /> Sisipkan Rumus (LaTeX)
                  </button>
                </div>

                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ketik teks soal kuis di sini. Gunakan $...$ untuk rumus inline atau $$...$$ untuk rumus blok..."
                  rows={3}
                  className={`w-full rounded-2xl border p-3.5 text-sm transition-all outline-none resize-y ${
                    isDark
                      ? "border-white/10 bg-[#121629] text-white focus:border-cyan-400"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-500"
                  }`}
                  required
                />

                {/* Pratinjau Teks Soal */}
                {questionText.trim() && (
                  <div
                    className={`p-3 rounded-2xl border text-xs sm:text-sm space-y-1 ${
                      isDark
                        ? "border-white/5 bg-white/[0.03] text-slate-200"
                        : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                      Pratinjau Teks Soal (KaTeX):
                    </span>
                    <FormattedMathText text={questionText} />
                  </div>
                )}
              </div>

              {/* Field 2: Pilihan Jawaban (2 sampai 5 pilihan) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Pilihan Jawaban (2-5 Opsi) <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Pilih radio button di sebelah kiri untuk menandai kunci jawaban yang benar.
                    </span>
                  </div>

                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-400/40 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-all cursor-pointer"
                    >
                      <Plus size={12} /> Tambah Opsi
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, oIdx) => {
                    const letter = optionLetters[oIdx] || String(oIdx + 1);
                    const isCorrect = correctIndex === oIdx;

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-2xl border transition-all space-y-2 ${
                          isCorrect
                            ? "border-emerald-500/50 bg-emerald-500/5 shadow-sm"
                            : isDark
                            ? "border-white/5 bg-[#121629]"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Radio Button untuk Jawaban Benar */}
                          <label
                            className="flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Tandai sebagai jawaban benar"
                          >
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={isCorrect}
                              onChange={() => setCorrectIndex(oIdx)}
                              className="accent-emerald-500 h-4 w-4 cursor-pointer"
                            />
                            <span
                              className={`h-6 w-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                                isCorrect
                                  ? "bg-emerald-500 text-slate-950"
                                  : isDark
                                  ? "bg-white/10 text-slate-300"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {letter}
                            </span>
                          </label>

                          {/* Input Teks Pilihan */}
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                            placeholder={`Pilihan ${letter}...`}
                            className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-all ${
                              isDark
                                ? "border-white/10 bg-[#0a0f24] text-white focus:border-cyan-400"
                                : "border-slate-200 bg-white text-slate-900 focus:border-cyan-500"
                            }`}
                            required
                          />

                          {/* Tombol Rumus LaTeX untuk Opsi */}
                          <button
                            type="button"
                            onClick={() => handleOpenLatex("option", oIdx)}
                            className="p-2 rounded-xl border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all cursor-pointer"
                            title="Sisipkan Rumus ke Opsi"
                          >
                            <Code size={13} />
                          </button>

                          {/* Tombol Hapus Opsi (jika > 2) */}
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(oIdx)}
                              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Hapus pilihan ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Pratinjau Math Jika ada Rumus */}
                        {opt.includes("$") && (
                          <div className="pl-9 text-xs text-slate-300">
                            <FormattedMathText text={opt} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Pembahasan / Penjelasan (Opsional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Pembahasan / Penjelasan (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenLatex("explanation")}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border border-cyan-400/40 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-all cursor-pointer"
                  >
                    <Code size={12} /> Sisipkan Rumus (LaTeX)
                  </button>
                </div>

                <textarea
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  placeholder="Ketik pembahasan langkah demi langkah untuk ditampilkan kepada siswa setelah menyelesaikan kuis..."
                  rows={2}
                  className={`w-full rounded-2xl border p-3.5 text-sm transition-all outline-none resize-y ${
                    isDark
                      ? "border-white/10 bg-[#121629] text-white focus:border-cyan-400"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-500"
                  }`}
                />

                {/* Pratinjau Penjelasan */}
                {explanationText.trim() && (
                  <div
                    className={`p-3 rounded-2xl border text-xs sm:text-sm space-y-1 ${
                      isDark
                        ? "border-white/5 bg-white/[0.03] text-slate-200"
                        : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold">
                      Pratinjau Pembahasan:
                    </span>
                    <FormattedMathText text={explanationText} />
                  </div>
                )}
              </div>

              {/* Field 4: Status Aktif */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-cyan-400 h-4 w-4 cursor-pointer"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs sm:text-sm font-semibold cursor-pointer select-none"
                >
                  Aktifkan soal ini langsung untuk kuis siswa
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? "text-slate-300 hover:bg-white/5"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-400/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} />
                  {saving ? "Menyimpan..." : editingQuestion ? "Simpan Perubahan" : "Tambah Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 transition-all ${
              isDark
                ? "border-rose-500/30 bg-[#0d1430] text-slate-100"
                : "border-rose-200 bg-white text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Hapus Soal Kuis?</h3>
                <span className="text-xs text-slate-400 font-mono">
                  Urutan #{questionToDelete.order_index}
                </span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-slate-50"
              }`}
            >
              <FormattedMathText text={questionToDelete.question} />
            </div>

            <p className="text-xs text-slate-400">
              Tindakan ini akan menghapus soal dari database secara permanen. Apakah Anda yakin?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "text-slate-300 hover:bg-white/5"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                {deleting ? "Menghapus..." : "Ya, Hapus Soal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL SISIPKAN RUMUS LATEX ================= */}
      <LatexInputModal
        isOpen={isLatexOpen}
        onClose={() => setIsLatexOpen(false)}
        onInsert={handleInsertLatex}
        isDark={isDark}
        title="Sisipkan Rumus Matematika (LaTeX)"
      />
    </div>
  );
}
