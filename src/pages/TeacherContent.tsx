import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Plus,
  Edit,
  Clock,
  Timer,
  X,
  Check,
  FileText,
  Eye,
  Sparkles,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  Bell,
  Search,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { MODULES, DISTRICTS, SigmaModule } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import { EditMaterialModal } from "../components/EditMaterialModal";
import { getMaterialMetaSync } from "../lib/pdfStorage";

// AI-generated math artwork
const heroMathDark = "/src/assets/images/hero_math_spatial_dark_1790935716688.jpg";

export default function TeacherContent() {
  const { isDark } = useTheme();
  const [modulesList] = useState<SigmaModule[]>(MODULES);
  const [selectedDistrict, setSelectedDistrict] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Teacher timer configuration modal state
  const [timerModalModule, setTimerModalModule] = useState<SigmaModule | null>(null);
  const [modalTimerEnabled, setModalTimerEnabled] = useState<boolean>(true);
  const [modalMinutes, setModalMinutes] = useState<number>(15);
  const [customInput, setCustomInput] = useState<string>("15");

  // Teacher edit material & upload PDF modal state
  const [editModalModule, setEditModalModule] = useState<SigmaModule | null>(null);

  // Teacher Tasks state (matching reference Tasks widget)
  const [tasks, setTasks] = useState([
    { id: 1, text: "Menyiapkan bank soal kuis Bab 2 (Aljabar & SPLDV)", done: true },
    { id: 2, text: "Meninjau nilai kuis remedi siswa Bab 1 (KKM 70)", done: false },
    { id: 3, text: "Memberikan feedback diskusi di Forum Tanya Guru", done: true },
    { id: 4, text: "Sesuaikan batas timer kuis untuk Bab 3 Geometri", done: false },
    { id: 5, text: "Upload modul PDF tambahan untuk latihan intensif TKA", done: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  // Helper to get configured timer info for a module
  const getModuleTimerInfo = (mod: SigmaModule) => {
    const savedEnabled = localStorage.getItem(`quiz_timer_enabled_${mod.id}`);
    const isEnabled = savedEnabled !== null ? savedEnabled === "true" : true;
    const savedLimit = localStorage.getItem(`quiz_timelimit_${mod.id}`);
    const minutes = savedLimit ? parseInt(savedLimit, 10) : mod.quizTimeLimitMinutes || 15;
    return { isEnabled, minutes };
  };

  const handleOpenTimerModal = (mod: SigmaModule) => {
    const info = getModuleTimerInfo(mod);
    setTimerModalModule(mod);
    setModalTimerEnabled(info.isEnabled);
    setModalMinutes(info.minutes);
    setCustomInput(String(info.minutes));
  };

  const handleSaveTimer = () => {
    if (!timerModalModule) return;
    const validMinutes = Math.max(1, Math.min(180, modalMinutes));
    localStorage.setItem(`quiz_timer_enabled_${timerModalModule.id}`, String(modalTimerEnabled));
    localStorage.setItem(`quiz_timelimit_${timerModalModule.id}`, String(validMinutes));

    toast.success(
      modalTimerEnabled
        ? `Batas waktu kuis ${timerModalModule.title} diatur ke ${validMinutes} menit!`
        : `Timer kuis ${timerModalModule.title} dinonaktifkan (tanpa batas waktu).`
    );
    setTimerModalModule(null);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: newTaskInput.trim(), done: false },
    ]);
    setNewTaskInput("");
    toast.success("Agenda pengajaran berhasil ditambahkan!");
  };

  const filtered =
    selectedDistrict === 0
      ? modulesList
      : modulesList.filter((m) => m.districtId === selectedDistrict);

  // Student progress rows (matching "Pending homework" in reference)
  const studentRows = [
    {
      name: "Ahmad Rizky Pratama",
      grade: "Kelas 11A",
      subject: "Aljabar",
      topic: "Eksponen & Bentuk Akar",
      score: "92%",
      status: "Lulus KKM",
      statusVariant: "cyan",
    },
    {
      name: "Siti Nurhaliza",
      grade: "Kelas 11B",
      subject: "Geometri",
      topic: "Sudut & Kesebangunan",
      score: "85%",
      status: "Lulus KKM",
      statusVariant: "cyan",
    },
    {
      name: "Budi Santoso",
      grade: "Kelas 11A",
      subject: "Bilangan",
      topic: "Rasionalisasi Penyebut",
      score: "65%",
      status: "Remedial",
      statusVariant: "amber",
    },
    {
      name: "Zaki Ramadhan",
      grade: "Kelas 11B",
      subject: "Trigonometri",
      topic: "Sudut Rangkap sin 2x",
      score: "80%",
      status: "Lulus KKM",
      statusVariant: "cyan",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* ==================================================================== */}
      {/* TOP HEADER: TITLE + NOTIFICATIONS + TEACHER PROFILE (Reference Match)*/}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-500 uppercase tracking-widest">
              PANEL KELOLA MATERI
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-400 font-medium">MA Darunnajah 9</span>
          </div>
          <h1
            className={`font-display text-2xl sm:text-3xl font-black mt-1 ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Dashboard Kelola Materi
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Atur kurikulum modul TKA, batas timer kuis, silabus PDF, dan pantau progres siswa.
          </p>
        </div>

        {/* Right side: Bell + Profile Pill */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div
            className={`grid h-10 w-10 place-items-center rounded-2xl border transition-all ${
              isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-700 shadow-sm"
            }`}
            title="Notifikasi Masuk"
          >
            <Bell size={16} />
          </div>

          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border ${
              isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900 shadow-sm"
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 grid place-items-center text-slate-950 font-black text-xs">
              AF
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight">Ust. Ahmad Fauzi, S.Pd.</div>
              <div className="text-[10px] text-cyan-500 font-mono">Guru Pengampu Matematika</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. TOP METRICS ROW: 4 WIDGETS (Matching Reference Top 4 Cards)       */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border flex items-center gap-4 transition-all shadow-sm ${
            isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 grid place-items-center shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className={`text-2xl font-black font-display ${isDark ? "text-white" : "text-slate-950"}`}>
              36
            </div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Total Siswa Terdaftar
            </div>
          </div>
        </div>

        {/* Card 2: Productivity / Jam Mengajar */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border flex items-center gap-4 transition-all shadow-sm ${
            isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 grid place-items-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className={`text-2xl font-black font-display ${isDark ? "text-white" : "text-slate-950"}`}>
              24h
            </div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Jam Mengajar / Bulan
            </div>
          </div>
        </div>

        {/* Card 3: Modul Aktif TKA */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border flex items-center gap-4 transition-all shadow-sm ${
            isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400 grid place-items-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className={`text-2xl font-black font-display ${isDark ? "text-white" : "text-slate-950"}`}>
              4 / 5
            </div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Modul Bab Aktif
            </div>
          </div>
        </div>

        {/* Card 4: Action Add Widget / Tambah Modul */}
        <button
          type="button"
          onClick={() => {
            if (modulesList.length > 0) {
              setEditModalModule(modulesList[0]);
            }
          }}
          className={`p-4 sm:p-5 rounded-3xl border border-dashed flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? "border-cyan-400/40 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/15"
              : "border-cyan-400 bg-cyan-50/50 text-cyan-800 hover:bg-cyan-100"
          }`}
        >
          <Plus size={18} className="text-cyan-400" />
          <span>Upload PDF / Buat Modul</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* MAIN TWO-COLUMN WORKSPACE: LEFT CONTENT (8 COLS) + RIGHT SCHEDULE (4 COLS) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ================================================================== */}
        {/* LEFT COLUMN: TABLE + COURSES + TASKS                                */}
        {/* ================================================================== */}
        <div className="xl:col-span-8 space-y-6">
          {/* A. "PENDING HOMEWORK" TABLE: HASIL KUIS & PENYERAHAN TUGAS SISWA   */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 transition-all shadow-sm ${
              isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 dark:border-white/10">
              <div>
                <h2 className={`font-display text-base sm:text-lg font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                  Hasil Kuis &amp; Progres Siswa
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Monitoring kelulusan KKM (Skor ≥ 70) untuk membuka bab selanjutnya
                </p>
              </div>

              <Link
                to="/teacher/dashboard"
                className={`text-xs font-bold transition-colors ${
                  isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-700 hover:text-cyan-800"
                }`}
              >
                Lihat Semua
              </Link>
            </div>

            {/* Horizontal Table Rows matching reference */}
            <div className="divide-y divide-white/5 dark:divide-white/5 mt-2">
              {studentRows.map((st, idx) => (
                <div
                  key={idx}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-slate-800 grid place-items-center text-cyan-300 font-bold shrink-0">
                      {st.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                        {st.name}
                      </div>
                      <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {st.grade} · {st.subject}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                    <div className="text-left sm:text-right">
                      <div className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {st.topic}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Topik Teruji</div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-cyan-400">
                        {st.score}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border ${
                        st.statusVariant === "cyan"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-400/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-400/30"
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. DISTRICT FILTER TABS & MODULES LIST */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 transition-all shadow-sm space-y-4 ${
              isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h2 className={`font-display text-base sm:text-lg font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                  Daftar Modul Bab Kurikulum
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Kelola dokumen PDF slide, batas timer kuis, dan soal evaluasi per distrik
                </p>
              </div>

              {/* District Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedDistrict(0)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedDistrict === 0
                      ? isDark
                        ? "bg-cyan-400 text-slate-950 font-black"
                        : "bg-slate-900 text-white font-black"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua ({modulesList.length})
                </button>
                {DISTRICTS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDistrict(d.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedDistrict === d.id
                        ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40"
                        : isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Distrik {d.id}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Modules */}
            <div className="space-y-3 pt-1">
              {filtered.map((mod) => {
                const timerInfo = getModuleTimerInfo(mod);
                const customMeta = getMaterialMetaSync(mod.id);
                const displayTitle = customMeta?.title || mod.title;
                const displayDesc = customMeta?.description || mod.description;
                const displayDuration = customMeta?.durationMinutes || mod.durationMinutes;
                const displayPages = customMeta?.pageCount || mod.slides.length;
                const isCustomPdf = customMeta?.isCustomPdf;

                return (
                  <div
                    key={`${mod.id}-${refreshKey}`}
                    className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isDark
                        ? "border-white/10 bg-[#161b33] hover:border-cyan-400/30"
                        : "border-slate-200 bg-slate-50/70 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                          {mod.districtName}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            timerInfo.isEnabled
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                              : "border-slate-400/30 bg-slate-400/10 text-slate-400"
                          }`}
                        >
                          <Timer size={10} />
                          {timerInfo.isEnabled ? `${timerInfo.minutes} Menit` : "Tanpa Batas Waktu"}
                        </span>
                        {isCustomPdf && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                            <FileText size={10} /> PDF Guru Aktif
                          </span>
                        )}
                      </div>

                      <h3 className={`font-display text-sm sm:text-base font-bold truncate ${isDark ? "text-white" : "text-slate-950"}`}>
                        {displayTitle}
                      </h3>

                      <p className={`text-xs line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {displayDesc}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                        <span>{displayDuration} Menit Belajar</span>
                        <span>•</span>
                        <span>{displayPages} Halaman Dokumen</span>
                        <span>•</span>
                        <span>{mod.quiz.length} Soal Evaluasi</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenTimerModal(mod)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isDark
                            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                            : "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                        }`}
                      >
                        <Timer size={13} /> Atur Waktu
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditModalModule(mod)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        <Edit size={13} /> Edit / Upload PDF
                      </button>

                      <Link
                        to={`/app/materi/${mod.id}`}
                        target="_blank"
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isDark
                            ? "border-white/10 text-slate-300 hover:text-white"
                            : "border-slate-200 text-slate-700 hover:text-slate-900"
                        }`}
                        title="Pratinjau Siswa"
                      >
                        <Eye size={13} /> Pratinjau ↗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. BOTTOM ROW: SPOTLIGHT COURSE CARD + TEACHER TASKS CHECKLIST (Reference Match) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left: Spotlight Course Card */}
            <div
              className={`md:col-span-6 rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-sm ${
                isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                  MODUL UTAMA KELAS 11
                </span>
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 mb-3">
                  <img
                    src={heroMathDark}
                    alt="Bab 1: Bilangan & Eksponen"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="text-xs font-black">BAB 1: BILANGAN &amp; EKSPONEN</div>
                    <div className="text-[10px] text-cyan-300 font-mono">Modul Prasyarat KKM ≥ 70</div>
                  </div>
                </div>

                <h4 className={`text-xs sm:text-sm font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Silabus Kurikulum Terintegrasi TKA
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Mencakup 8 sifat eksponen, penyederhanaan bentuk akar, dan rasionalisasi pecahan penyebut sekawan.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>14 Slide</span>
                <span>•</span>
                <span>20 Menit</span>
                <span>•</span>
                <span className="text-cyan-400 font-bold">15 Soal Kuis</span>
              </div>
            </div>

            {/* Right: Teacher Tasks Checklist (Tasks Card from reference) */}
            <div
              className={`md:col-span-6 rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-sm ${
                isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className={`font-display text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    Agenda Pengajaran Guru
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {tasks.filter((t) => t.done).length} / {tasks.length} Selesai
                  </span>
                </div>

                {/* Add new task input */}
                <form onSubmit={addTask} className="my-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tambah agenda pengajaran..."
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      className={`w-full rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none border transition-all ${
                        isDark
                          ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-cyan-400"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500"
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-8 w-8 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 grid place-items-center shrink-0 cursor-pointer font-bold"
                    title="Tambah Agenda"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                {/* Checklist stream */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs cursor-pointer transition-all ${
                        task.done
                          ? isDark
                            ? "bg-white/5 border-white/5 text-slate-400 line-through"
                            : "bg-slate-50 border-slate-200 text-slate-400 line-through"
                          : isDark
                          ? "bg-white/[0.03] border-white/10 text-slate-200 hover:bg-white/[0.06]"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border grid place-items-center shrink-0 ${
                          task.done
                            ? "border-cyan-400 bg-cyan-400 text-slate-950"
                            : "border-slate-500"
                        }`}
                      >
                        {task.done && <Check size={10} className="stroke-[3]" />}
                      </div>
                      <span className="leading-tight flex-1">{task.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: SCHEDULE + LESSONS + UPCOMING EVENTS (Reference Match)*/}
        {/* ================================================================== */}
        <div className="xl:col-span-4 space-y-6">
          {/* 1. SCHEDULE CALENDAR WIDGET */}
          <div
            className={`rounded-3xl border p-5 transition-all shadow-sm ${
              isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-cyan-400" />
                <h3 className={`font-display text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                  Jadwal Mengajar
                </h3>
              </div>
              <span className="font-mono text-xs text-cyan-400 font-bold">Oktober 2026</span>
            </div>

            {/* Weekday Strip */}
            <div className="grid grid-cols-7 text-center text-[10px] font-mono text-slate-400 pt-3">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Date Numbers Strip (Matching Reference) */}
            <div className="grid grid-cols-7 text-center pt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isActive = day === 4; // Highlighted day matching reference
                return (
                  <div key={day} className="flex justify-center">
                    <div
                      className={`h-8 w-8 rounded-full grid place-items-center text-xs font-mono font-bold transition-all ${
                        isActive
                          ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30 scale-105"
                          : isDark
                          ? "text-slate-300 hover:bg-white/5"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. LESSONS / SESI KELAS HARI INI (With color strips matching reference) */}
          <div
            className={`rounded-3xl border p-5 transition-all shadow-sm space-y-3 ${
              isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className={`font-display text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                Sesi Kelas Hari Ini
              </h3>
              <span className="text-[11px] font-bold text-cyan-400">3 Sesi</span>
            </div>

            {/* Lesson Cards with left border colors matching reference */}
            <div className="space-y-2.5">
              {/* Lesson 1: Blue Strip */}
              <div
                className={`p-3.5 rounded-2xl border border-l-4 border-l-sky-400 transition-all ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/80"
                }`}
              >
                <div className="text-[10px] font-mono text-sky-400 font-bold">Matematika Wajib</div>
                <div className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                  Bab 1: 8 Sifat Eksponen Dasar
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                  <span>09:00 - 10:00 WIB</span>
                  <span className="text-cyan-400 font-bold">Kelas 11A (+18 Siswa)</span>
                </div>
              </div>

              {/* Lesson 2: Purple Strip */}
              <div
                className={`p-3.5 rounded-2xl border border-l-4 border-l-purple-400 transition-all ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/80"
                }`}
              >
                <div className="text-[10px] font-mono text-purple-400 font-bold">Geometri &amp; Dimensi Tiga</div>
                <div className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                  Jarak Titik ke Bidang Kubus
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                  <span>13:00 - 14:00 WIB</span>
                  <span className="text-purple-400 font-bold">Kelas 11B (+16 Siswa)</span>
                </div>
              </div>

              {/* Lesson 3: Green Strip */}
              <div
                className={`p-3.5 rounded-2xl border border-l-4 border-l-emerald-400 transition-all ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/80"
                }`}
              >
                <div className="text-[10px] font-mono text-emerald-400 font-bold">Pendalaman TKA</div>
                <div className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                  SPLDV &amp; Optimasi Program Linear
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                  <span>15:30 - 16:30 WIB</span>
                  <span className="text-emerald-400 font-bold">Klub UTBK (+12 Siswa)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. UPCOMING EVENTS / AGENDA MADRASAH (Reference Match) */}
          <div
            className={`rounded-3xl border p-5 transition-all shadow-sm space-y-3 ${
              isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className={`font-display text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                Agenda Madrasah
              </h3>
              <span className={`text-xs font-bold ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>
                Lihat Semua
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div>
                  <div className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Simulasi Ujian Masuk PTN (TKA)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    16:00 - 17:00 WIB · 15 Okt
                  </div>
                </div>
                <MoreHorizontal size={16} className="text-slate-400 shrink-0" />
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div>
                  <div className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Workshop MGMP Matematika MA
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    08:00 - 13:00 WIB · 20 Okt
                  </div>
                </div>
                <MoreHorizontal size={16} className="text-slate-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TEACHER TIMER SETTINGS MODAL                                         */}
      {/* ==================================================================== */}
      {timerModalModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-5 transition-all ${
              isDark
                ? "bg-[#0b132b] border-white/15 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                  Pengaturan Evaluasi Guru
                </span>
                <h3 className="font-display text-lg font-bold mt-0.5">
                  Batas Waktu Kuis
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Modul: <strong className="text-white dark:text-cyan-300">{timerModalModule.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTimerModalModule(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Toggle Timer */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div>
                <div className="text-xs font-bold">Aktifkan Hitung Mundur</div>
                <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Siswa wajib menyelesaikan sebelum waktu habis
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalTimerEnabled}
                  onChange={(e) => setModalTimerEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Presets and Custom Input */}
            {modalTimerEnabled && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Pilih Durasi Waktu Kuis:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20, 30, 45, 60].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setModalMinutes(preset);
                        setCustomInput(String(preset));
                      }}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        modalMinutes === preset
                          ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                          : isDark
                          ? "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-400"
                      }`}
                    >
                      {preset} mnt
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customInput}
                      onChange={(e) => {
                        setCustomInput(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) setModalMinutes(val);
                      }}
                      placeholder="Kustom"
                      className={`w-full py-1.5 px-2 text-center rounded-xl border text-xs font-mono font-bold ${
                        isDark ? "bg-black/30 border-white/15 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
                <p className={`text-[11px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Durasi terpilih: <span className="text-cyan-400 font-bold">{modalMinutes} Menit</span> ({modalMinutes * 60} detik)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setTimerModalModule(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  isDark
                    ? "border-white/10 text-slate-300 hover:bg-white/5"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTimer}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 transition-all cursor-pointer"
              >
                <Check size={14} /> Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER EDIT MATERIAL & UPLOAD PDF MODAL */}
      <EditMaterialModal
        isOpen={Boolean(editModalModule)}
        onClose={() => setEditModalModule(null)}
        module={editModalModule}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
