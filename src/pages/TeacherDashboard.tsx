import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Plus,
  Edit,
  Clock,
  Timer,
  FileText,
  Eye,
  GraduationCap,
  Calendar,
  MoreHorizontal,
  Bell,
  Search,
  Check,
  Inbox,
  BookOpen,
  Trash2,
  X,
  Sparkles,
  MapPin,
  Pencil,
  ChevronRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { MODULES, DISTRICTS, SigmaModule } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import { EditMaterialModal } from "../components/EditMaterialModal";
import { getMaterialMetaSync } from "../lib/pdfStorage";
import { supabase } from "../lib/supabaseClient";

// Math visual artwork
const heroMathDark = "/src/assets/images/hero_math_spatial_dark_1790935716688.jpg";

interface StudentSubmission {
  id: string;
  name: string;
  grade: string;
  subject: string;
  topic: string;
  score: string;
  status: string;
  statusVariant: "cyan" | "amber";
}

export interface ClassSession {
  id: string;
  subject: string;
  topic: string;
  time: string;
  className: string;
  studentsCount: number;
  color: "sky" | "purple" | "emerald" | "amber" | "rose";
}

export interface MadrasahAgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

export interface DaySchedule {
  dayNumber: number;
  dayName: string;
  label: string;
  classes: string;
  hasTeaching: boolean;
}

export interface TeacherTask {
  id: number;
  text: string;
  done: boolean;
}

const DEFAULT_SESSIONS: ClassSession[] = [
  {
    id: "session-1",
    subject: "Matematika Wajib",
    topic: "Bab 1: 8 Sifat Eksponen Dasar",
    time: "09:00 - 10:00 WIB",
    className: "Kelas 11 IPA 1",
    studentsCount: 0,
    color: "sky",
  },
  {
    id: "session-2",
    subject: "Geometri & Dimensi Tiga",
    topic: "Jarak Titik ke Bidang Kubus",
    time: "13:00 - 14:00 WIB",
    className: "Kelas 11 IPA 2",
    studentsCount: 0,
    color: "purple",
  },
  {
    id: "session-3",
    subject: "Pendalaman TKA",
    topic: "SPLDV & Optimasi Program Linear",
    time: "15:30 - 16:30 WIB",
    className: "Kelas 11 Gabungan",
    studentsCount: 0,
    color: "emerald",
  },
];

const DEFAULT_SCHEDULE_DAYS: DaySchedule[] = [
  { dayNumber: 1, dayName: "Kam", label: "Tinjauan Materi Silabus", classes: "11 IPA 1", hasTeaching: true },
  { dayNumber: 2, dayName: "Jum", label: "Konsultasi Mandiri Siswa", classes: "11 IPS 2", hasTeaching: false },
  { dayNumber: 3, dayName: "Sab", label: "Latihan Soal Intensif", classes: "11 IPA 2", hasTeaching: true },
  { dayNumber: 4, dayName: "Min", label: "3 Sesi Utama Hari Ini", classes: "11 IPA & TKA", hasTeaching: true },
  { dayNumber: 5, dayName: "Sen", label: "Evaluasi Bab Eksponen", classes: "11 IPA 1", hasTeaching: true },
  { dayNumber: 6, dayName: "Sel", label: "Geometri Ruang Kubus", classes: "11 IPS 1", hasTeaching: true },
  { dayNumber: 7, dayName: "Rab", label: "Persiapan Ujian TKA", classes: "Kelas 11", hasTeaching: true },
];

const DEFAULT_MADRASAH_AGENDA: MadrasahAgendaItem[] = [
  {
    id: "agenda-1",
    title: "Simulasi Ujian Masuk PTN (TKA)",
    date: "15 Okt 2026",
    time: "16:00 - 17:00 WIB",
    location: "Lab Komputer 1",
  },
  {
    id: "agenda-2",
    title: "Workshop MGMP Matematika MA",
    date: "20 Okt 2026",
    time: "08:00 - 13:00 WIB",
    location: "Aula Pertemuan Utama",
  },
];

const DEFAULT_TASKS: TeacherTask[] = [
  { id: 1, text: "Menyiapkan bank soal kuis Bab 2 (Aljabar & SPLDV)", done: false },
  { id: 2, text: "Meninjau kriteria kelulusan KKM Bab 1 (Nilai 70)", done: false },
  { id: 3, text: "Mengunggah silabus PDF materi TKA Matematika", done: false },
  { id: 4, text: "Menyesuaikan batas timer kuis untuk Bab 3 Geometri", done: false },
];

export default function TeacherDashboard() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [modulesList] = useState<SigmaModule[]>(MODULES);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Student metrics & submissions
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [completedModulesCount, setCompletedModulesCount] = useState<number>(0);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmission[]>([]);

  // Teacher edit material & upload PDF modal state
  const [editModalModule, setEditModalModule] = useState<SigmaModule | null>(null);

  // 1. Teacher Tasks state (Agenda Pengajaran Guru)
  const [tasks, setTasks] = useState<TeacherTask[]>(() => {
    try {
      const saved = localStorage.getItem("teacher_agenda_tasks");
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });
  const [newTaskInput, setNewTaskInput] = useState("");
  const [editingTask, setEditingTask] = useState<TeacherTask | null>(null);

  // 2. Class Sessions state (Sesi Kelas Hari Ini)
  const [sessions, setSessions] = useState<ClassSession[]>(() => {
    try {
      const saved = localStorage.getItem("teacher_class_sessions");
      return saved ? JSON.parse(saved) : DEFAULT_SESSIONS;
    } catch {
      return DEFAULT_SESSIONS;
    }
  });
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

  // 3. Teaching Schedule state (Jadwal Mengajar)
  const [scheduleDays, setScheduleDays] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem("teacher_schedule_days");
      return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE_DAYS;
    } catch {
      return DEFAULT_SCHEDULE_DAYS;
    }
  });
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(4);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // 4. Madrasah Agenda state (Agenda Madrasah)
  const [madrasahAgenda, setMadrasahAgenda] = useState<MadrasahAgendaItem[]>(() => {
    try {
      const saved = localStorage.getItem("teacher_madrasah_agenda");
      return saved ? JSON.parse(saved) : DEFAULT_MADRASAH_AGENDA;
    } catch {
      return DEFAULT_MADRASAH_AGENDA;
    }
  });
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<MadrasahAgendaItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("teacher_agenda_tasks", JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("teacher_class_sessions", JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem("teacher_schedule_days", JSON.stringify(scheduleDays));
    } catch {}
  }, [scheduleDays]);

  useEffect(() => {
    try {
      localStorage.setItem("teacher_madrasah_agenda", JSON.stringify(madrasahAgenda));
    } catch {}
  }, [madrasahAgenda]);

  // Query real students and submissions from Supabase
  const loadTeacherMetrics = async () => {
    try {
      const [studentsRes, progressRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, class_name, role, xp, level")
          .eq("role", "student"),
        supabase
          .from("user_progress")
          .select("*"),
      ]);

      if (studentsRes.error) {
        console.error("[TeacherDashboard] Supabase error saat memuat profil siswa:", studentsRes.error);
      }
      if (progressRes.error) {
        console.error("[TeacherDashboard] Supabase error saat memuat user_progress:", progressRes.error);
      }

      const students = studentsRes.data || [];
      const progressRows = [...(progressRes.data || [])].sort((a: any, b: any) => {
        const timeA = new Date(a.last_studied_at || a.updated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.last_studied_at || b.updated_at || b.created_at || 0).getTime();
        return timeB - timeA;
      });

      const studentMap = new Map<string, { id: string; full_name: string; class_name: string; xp?: number }>();
      for (const s of students) {
        studentMap.set(s.id, {
          id: s.id,
          full_name: s.full_name || "Siswa",
          class_name: s.class_name || "Kelas 11",
          xp: s.xp ?? 0,
        });
      }

      // Hitung juga user_id unik yang ada di user_progress seandainya RLS profiles hanya mengembalikan sebagian
      const uniqueStudentIds = new Set<string>(students.map((s) => s.id));
      for (const p of progressRows) {
        if (p.user_id) {
          uniqueStudentIds.add(p.user_id);
        }
      }

      setTotalStudents(uniqueStudentIds.size);

      const completedCount = progressRows.filter((p: any) => {
        const sc = p.quiz_score ?? p.score;
        return p.completed || (typeof sc === "number" && sc >= 70);
      }).length;
      setCompletedModulesCount(completedCount);

      const submissions: StudentSubmission[] = [];
      const usersWithProgress = new Set<string>();

      for (const p of progressRows) {
        usersWithProgress.add(p.user_id);
        const st = studentMap.get(p.user_id);
        const mod = MODULES.find((m) => m.id === p.module_id);
        const rawScore = p.quiz_score ?? p.score;
        const hasQuizScore = rawScore !== null && rawScore !== undefined;
        const scoreNum = hasQuizScore ? Number(rawScore) : null;
        const isPassed = scoreNum !== null && scoreNum >= 70;
        const percentNum = Number(p.percent ?? (p.completed ? 100 : 0)) || 0;

        submissions.push({
          id: String(p.id || `${p.user_id}-${p.module_id}`),
          name: st?.full_name || `Siswa (${String(p.user_id).slice(0, 6)})`,
          grade: st?.class_name || "Kelas 11",
          subject: "Matematika",
          topic: mod?.displayTitle || mod?.title || p.module_id,
          score: hasQuizScore ? `${scoreNum}/100` : p.completed ? "Tuntas (100%)" : `Materi ${percentNum}%`,
          status: hasQuizScore
            ? isPassed
              ? "Lulus KKM (Terbuka)"
              : "Remedial KKM"
            : p.completed
            ? "Lulus / Selesai"
            : "Sedang Belajar",
          statusVariant: isPassed || p.completed ? "cyan" : "amber",
        });
      }

      // Tampilkan juga siswa yang sudah daftar akun tapi belum memiliki baris di user_progress
      for (const st of students) {
        if (!usersWithProgress.has(st.id)) {
          const hasXp = (st.xp ?? 0) > 0;
          submissions.push({
            id: `registered-${st.id}`,
            name: st.full_name || "Siswa Terdaftar",
            grade: st.class_name || "Kelas 11",
            subject: "Matematika",
            topic: "BAB 1: BILANGAN",
            score: hasXp ? `${st.xp} XP` : "Belum Kuis",
            status: hasXp ? "Sudah Aktivitas (XP Tercatat)" : "Terdaftar (Belum Mulai)",
            statusVariant: hasXp ? "cyan" : "amber",
          });
        }
      }

      setStudentSubmissions(submissions);
    } catch (err) {
      console.error("[TeacherDashboard] Exception saat memuat metrik guru:", err);
      setTotalStudents(0);
      setCompletedModulesCount(0);
      setStudentSubmissions([]);
    }
  };

  useEffect(() => {
    loadTeacherMetrics();

    const onProgressUpdated = () => {
      loadTeacherMetrics();
    };
    window.addEventListener("sigma_progress_updated", onProgressUpdated);

    const channel = supabase
      .channel("teacher-dashboard-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        loadTeacherMetrics();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_progress" }, () => {
        loadTeacherMetrics();
      })
      .subscribe();

    return () => {
      window.removeEventListener("sigma_progress_updated", onProgressUpdated);
      supabase.removeChannel(channel);
    };
  }, []);

  // Handlers for Tasks
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

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.info("Agenda dihapus");
  };

  const updateTask = (id: number, text: string) => {
    if (!text.trim()) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: text.trim() } : t)));
    setEditingTask(null);
    toast.success("Agenda berhasil diperbarui!");
  };

  // Handlers for Class Sessions
  const saveSession = (sessionData: Omit<ClassSession, "id">, id?: string) => {
    if (id) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...sessionData, id } : s))
      );
      toast.success("Sesi kelas berhasil diperbarui!");
    } else {
      const newSession: ClassSession = {
        ...sessionData,
        id: `session-${Date.now()}`,
      };
      setSessions((prev) => [...prev, newSession]);
      toast.success("Sesi kelas baru berhasil ditambahkan!");
    }
    setSessionModalOpen(false);
    setEditingSession(null);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.info("Sesi kelas dihapus");
  };

  // Handlers for Madrasah Agenda
  const saveMadrasahAgenda = (agendaData: Omit<MadrasahAgendaItem, "id">, id?: string) => {
    if (id) {
      setMadrasahAgenda((prev) =>
        prev.map((a) => (a.id === id ? { ...agendaData, id } : a))
      );
      toast.success("Agenda madrasah berhasil diperbarui!");
    } else {
      const newAgenda: MadrasahAgendaItem = {
        ...agendaData,
        id: `agenda-${Date.now()}`,
      };
      setMadrasahAgenda((prev) => [...prev, newAgenda]);
      toast.success("Agenda madrasah baru berhasil ditambahkan!");
    }
    setAgendaModalOpen(false);
    setEditingAgenda(null);
  };

  const deleteMadrasahAgenda = (id: string) => {
    setMadrasahAgenda((prev) => prev.filter((a) => a.id !== id));
    toast.info("Agenda madrasah dihapus");
  };

  // Handlers for Teaching Schedule
  const updateScheduleDay = (dayNumber: number, label: string, classes: string, hasTeaching: boolean) => {
    setScheduleDays((prev) =>
      prev.map((d) =>
        d.dayNumber === dayNumber
          ? { ...d, label: label.trim(), classes: classes.trim(), hasTeaching }
          : d
      )
    );
    setScheduleModalOpen(false);
    toast.success(`Jadwal tanggal ${dayNumber} Oktober berhasil diperbarui!`);
  };

  const activeDay = scheduleDays.find((d) => d.dayNumber === selectedDayNumber) || scheduleDays[3];

  return (
    <div className="w-full space-y-6">
      {/* ==================================================================== */}
      {/* TOP HEADER: DASHBOARD TITLE + NOTIFICATIONS + TEACHER PROFILE        */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-500 uppercase tracking-widest">
              TEACHER DASHBOARD
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-400 font-medium">MA Darunnajah 9</span>
          </div>
          <h1
            className={`font-display text-2xl sm:text-3xl font-black mt-1 ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Dashboard Guru
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Pusat pemantauan kelas, jadwal pengajaran, dan kurikulum matematika TKA.
          </p>
        </div>

        {/* Right side: Bell + Teacher Profile Pill */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div
            className={`grid h-10 w-10 place-items-center rounded-2xl border transition-all ${
              isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-700 shadow-sm"
            }`}
            title="Notifikasi Guru"
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
      {/* 1. TOP METRICS ROW: 4 WIDGETS (Siswa Clear ke 0)                     */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students (Cleared to 0) */}
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
              {totalStudents}
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
              0h
            </div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Jam Mengajar / Bulan
            </div>
          </div>
        </div>

        {/* Card 3: Modul Tuntas oleh Siswa (Cleared to 0) */}
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
              {completedModulesCount}
            </div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Modul Tuntas Siswa
            </div>
          </div>
        </div>

        {/* Card 4: Action Add Widget / Kelola Materi */}
        <button
          type="button"
          onClick={() => navigate("/teacher/content")}
          className={`p-4 sm:p-5 rounded-3xl border border-dashed flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? "border-cyan-400/40 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/15"
              : "border-cyan-400 bg-cyan-50/50 text-cyan-800 hover:bg-cyan-100"
          }`}
        >
          <Plus size={18} className="text-cyan-400" />
          <span>Kelola &amp; Upload Modul</span>
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
          {/* A. "PENDING HOMEWORK" TABLE: HASIL KUIS SISWA (Cleared to 0)       */}
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

              <span className="font-mono text-xs font-bold text-cyan-500 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30">
                {studentSubmissions.length} Data Siswa
              </span>
            </div>

            {/* Zero State for Student Submissions (Clear ke 0) */}
            {studentSubmissions.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-slate-400 mb-2">
                  <Inbox size={22} />
                </div>
                <div className={`font-bold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Belum Ada Penyerahan Tugas / Kuis Siswa
                </div>
                <p className={`text-xs max-w-sm mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Data hasil kuis dan kelulusan KKM siswa saat ini telah di-reset ke 0. Ketika siswa mengerjakan kuis di aplikasi, progres akan tercatat di sini secara otomatis.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 dark:divide-white/5 mt-2">
                {studentSubmissions.map((st) => (
                  <div
                    key={st.id}
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
            )}
          </div>

          {/* B. BOTTOM ROW: SPOTLIGHT COURSE CARD + TEACHER TASKS CHECKLIST     */}
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
                  <video
                    src="/assets/blue_galaxy_fluid.mp4"
                    poster="/assets/blue_galaxy_fluid_poster.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
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
                  <div className="flex items-center gap-2">
                    <h3 className={`font-display text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      Agenda Pengajaran Guru
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                    {tasks.filter((t) => t.done).length} / {tasks.length} Selesai
                  </span>
                </div>

                {/* Add new task input */}
                <form onSubmit={addTask} className="my-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tambah agenda pengajaran baru..."
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
                    className="h-8 w-8 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 grid place-items-center shrink-0 cursor-pointer font-bold transition-transform hover:scale-105"
                    title="Tambah Agenda"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                {/* Checklist stream */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {tasks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Belum ada agenda pengajaran. Tambahkan agenda baru di atas!
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`group p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs transition-all ${
                          task.done
                            ? isDark
                              ? "bg-white/5 border-white/5 text-slate-400"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                            : isDark
                            ? "bg-white/[0.03] border-white/10 text-slate-200 hover:bg-white/[0.06]"
                            : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                        }`}
                      >
                        <div
                          onClick={() => toggleTask(task.id)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                        >
                          <div
                            className={`h-4 w-4 rounded-full border grid place-items-center shrink-0 transition-colors ${
                              task.done
                                ? "border-cyan-400 bg-cyan-400 text-slate-950"
                                : "border-slate-500 hover:border-cyan-400"
                            }`}
                          >
                            {task.done && <Check size={10} className="stroke-[3]" />}
                          </div>
                          <span className={`leading-tight truncate ${task.done ? "line-through text-slate-400" : ""}`}>
                            {task.text}
                          </span>
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Edit Agenda"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Hapus Agenda"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: SCHEDULE + LESSONS + UPCOMING EVENTS                 */}
        {/* ================================================================== */}
        <div className="xl:col-span-4 space-y-6">
          {/* 1. SCHEDULE CALENDAR WIDGET (Jadwal Mengajar) */}
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
              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-400/20 transition-all hover:bg-cyan-500/20"
              >
                <Settings size={12} />
                <span>Atur Hari Ini</span>
              </button>
            </div>

            {/* Weekday Strip */}
            <div className="grid grid-cols-7 text-center text-[10px] font-mono text-slate-400 pt-3">
              {scheduleDays.map((d) => (
                <span key={d.dayNumber}>{d.dayName}</span>
              ))}
            </div>

            {/* Date Numbers Strip (Clickable Days) */}
            <div className="grid grid-cols-7 text-center pt-2">
              {scheduleDays.map((day) => {
                const isActive = day.dayNumber === selectedDayNumber;
                return (
                  <div key={day.dayNumber} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedDayNumber(day.dayNumber)}
                      className={`h-8 w-8 rounded-full grid place-items-center text-xs font-mono font-bold transition-all cursor-pointer relative ${
                        isActive
                          ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30 scale-105"
                          : isDark
                          ? "text-slate-300 hover:bg-white/10"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      title={`${day.dayName}, ${day.dayNumber} Okt: ${day.label}`}
                    >
                      {day.dayNumber}
                      {day.hasTeaching && !isActive && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Active Day Detail Banner */}
            <div className={`mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs`}>
              <div>
                <div className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {activeDay.dayName}, {activeDay.dayNumber} Oktober 2026
                </div>
                <div className="text-[11px] text-cyan-400 font-medium mt-0.5">
                  {activeDay.label} · <span className="text-slate-400">{activeDay.classes}</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                  activeDay.hasTeaching
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20"
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                }`}
              >
                {activeDay.hasTeaching ? "Ada Jadwal" : "Off / Mandiri"}
              </span>
            </div>
          </div>

          {/* 2. LESSONS / SESI KELAS HARI INI */}
          <div
            className={`rounded-3xl border p-5 transition-all shadow-sm space-y-3 ${
              isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className={`font-display text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                  Sesi Kelas Hari Ini
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">
                  {sessions.length} Sesi Terjadwal
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSession(null);
                  setSessionModalOpen(true);
                }}
                className="text-[11px] font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>Tambah Sesi</span>
              </button>
            </div>

            {/* Lesson Cards */}
            <div className="space-y-2.5">
              {sessions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada sesi kelas hari ini. Klik "+ Tambah Sesi" untuk menambahkan.
                </div>
              ) : (
                sessions.map((session) => {
                  const borderColors = {
                    sky: "border-l-sky-400 text-sky-400",
                    purple: "border-l-purple-400 text-purple-400",
                    emerald: "border-l-emerald-400 text-emerald-400",
                    amber: "border-l-amber-400 text-amber-400",
                    rose: "border-l-rose-400 text-rose-400",
                  };
                  const colorClass = borderColors[session.color] || borderColors.sky;

                  return (
                    <div
                      key={session.id}
                      className={`group p-3.5 rounded-2xl border border-l-4 transition-all ${
                        colorClass.split(" ")[0]
                      } ${
                        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className={`text-[10px] font-mono font-bold ${colorClass.split(" ")[1]}`}>
                            {session.subject}
                          </div>
                          <div className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                            {session.topic}
                          </div>
                        </div>

                        {/* Quick Edit / Delete Buttons */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSession(session);
                              setSessionModalOpen(true);
                            }}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Edit Sesi"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSession(session.id)}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Hapus Sesi"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-500" />
                          <span>{session.time}</span>
                        </span>
                        <span className="text-slate-400 font-medium">
                          {session.className} · {session.studentsCount} Siswa
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. UPCOMING EVENTS / AGENDA MADRASAH */}
          <div
            className={`rounded-3xl border p-5 transition-all shadow-sm space-y-3 ${
              isDark ? "border-white/10 bg-[#121629]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className={`font-display text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                  Agenda Madrasah
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">
                  {madrasahAgenda.length} Kegiatan Mendatang
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAgenda(null);
                  setAgendaModalOpen(true);
                }}
                className="text-[11px] font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>Tambah Agenda</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {madrasahAgenda.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada agenda madrasah. Klik "+ Tambah Agenda" untuk menambahkan.
                </div>
              ) : (
                madrasahAgenda.map((agenda) => (
                  <div
                    key={agenda.id}
                    className={`group p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                        {agenda.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{agenda.time} · {agenda.date}</span>
                        {agenda.location && (
                          <span className="text-cyan-400 flex items-center gap-0.5">
                            <MapPin size={10} />
                            {agenda.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAgenda(agenda);
                          setAgendaModalOpen(true);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Edit Agenda"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMadrasahAgenda(agenda.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Hapus Agenda"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: TAMBAH / EDIT SESI KELAS HARI INI                            */}
      {/* ==================================================================== */}
      {sessionModalOpen && (
        <SessionEditDialog
          session={editingSession}
          onClose={() => {
            setSessionModalOpen(false);
            setEditingSession(null);
          }}
          onSave={saveSession}
          isDark={isDark}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ATUR JADWAL MENGAJAR (HARI INI / TANGGAL TERPILIH)           */}
      {/* ==================================================================== */}
      {scheduleModalOpen && (
        <ScheduleEditDialog
          day={activeDay}
          onClose={() => setScheduleModalOpen(false)}
          onSave={updateScheduleDay}
          isDark={isDark}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: TAMBAH / EDIT AGENDA MADRASAH                                */}
      {/* ==================================================================== */}
      {agendaModalOpen && (
        <AgendaEditDialog
          agenda={editingAgenda}
          onClose={() => {
            setAgendaModalOpen(false);
            setEditingAgenda(null);
          }}
          onSave={saveMadrasahAgenda}
          isDark={isDark}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: EDIT AGENDA PENGAJARAN GURU (TASK)                          */}
      {/* ==================================================================== */}
      {editingTask && (
        <TaskEditDialog
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={updateTask}
          isDark={isDark}
        />
      )}

      {/* Teacher Edit Material & Upload PDF Modal */}
      <EditMaterialModal
        isOpen={Boolean(editModalModule)}
        onClose={() => setEditModalModule(null)}
        module={editModalModule}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// DIALOG COMPONENTS FOR ATUR SENDIRI (CRUD)
// -----------------------------------------------------------------------------

function SessionEditDialog({
  session,
  onClose,
  onSave,
  isDark,
}: {
  session: ClassSession | null;
  onClose: () => void;
  onSave: (data: Omit<ClassSession, "id">, id?: string) => void;
  isDark: boolean;
}) {
  const [subject, setSubject] = useState(session?.subject || "Matematika Wajib");
  const [topic, setTopic] = useState(session?.topic || "");
  const [time, setTime] = useState(session?.time || "09:00 - 10:00 WIB");
  const [className, setClassName] = useState(session?.className || "Kelas 11 IPA 1");
  const [color, setColor] = useState<ClassSession["color"]>(session?.color || "sky");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Materi / Bab tidak boleh kosong");
      return;
    }
    onSave(
      {
        subject: subject.trim(),
        topic: topic.trim(),
        time: time.trim(),
        className: className.trim(),
        studentsCount: session?.studentsCount || 0,
        color,
      },
      session?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-[#15192e] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-black text-lg">
            {session ? "Edit Sesi Kelas" : "Tambah Sesi Kelas Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              Kategori / Mata Pelajaran
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Matematika Wajib, Geometri, TKA"
              className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              Materi / Topik Bab <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Bab 1: Eksponen & Bentuk Akar"
              className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                Jam Mengajar
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 - 10:00 WIB"
                className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                  isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                Kelas / Rombel
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Kelas 11 IPA 1"
                className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                  isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5">
              Warna Garis Tag
            </label>
            <div className="flex items-center gap-2">
              {(["sky", "purple", "emerald", "amber", "rose"] as const).map((c) => {
                const bgMap = {
                  sky: "bg-sky-400",
                  purple: "bg-purple-400",
                  emerald: "bg-emerald-400",
                  amber: "bg-amber-400",
                  rose: "bg-rose-400",
                };
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full ${bgMap[c]} transition-all ${
                      color === c ? "ring-2 ring-white scale-110 shadow-lg" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-cyan-400/20"
            >
              Simpan Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScheduleEditDialog({
  day,
  onClose,
  onSave,
  isDark,
}: {
  day: DaySchedule;
  onClose: () => void;
  onSave: (dayNumber: number, label: string, classes: string, hasTeaching: boolean) => void;
  isDark: boolean;
}) {
  const [label, setLabel] = useState(day.label);
  const [classes, setClasses] = useState(day.classes);
  const [hasTeaching, setHasTeaching] = useState(day.hasTeaching);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(day.dayNumber, label, classes, hasTeaching);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-[#15192e] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-display font-black text-lg">
              Atur Jadwal: {day.dayName}, {day.dayNumber} Oktober
            </h3>
            <p className="text-xs text-slate-400">Sesuaikan agenda dan kelas mengajar untuk hari ini</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              Keterangan / Fokus Pengajaran
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: 3 Sesi Utama Hari Ini, Latihan Soal Intensif"
              className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              Rombel / Kelas Sasaran
            </label>
            <input
              type="text"
              value={classes}
              onChange={(e) => setClasses(e.target.value)}
              placeholder="Contoh: 11 IPA 1 & 11 IPA 2"
              className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hasTeachingCheckbox"
              checked={hasTeaching}
              onChange={(e) => setHasTeaching(e.target.checked)}
              className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
            />
            <label htmlFor="hasTeachingCheckbox" className="text-xs font-medium cursor-pointer">
              Ada jadwal tatap muka / mengajar aktif pada tanggal ini
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-cyan-400/20"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AgendaEditDialog({
  agenda,
  onClose,
  onSave,
  isDark,
}: {
  agenda: MadrasahAgendaItem | null;
  onClose: () => void;
  onSave: (data: Omit<MadrasahAgendaItem, "id">, id?: string) => void;
  isDark: boolean;
}) {
  const [title, setTitle] = useState(agenda?.title || "");
  const [date, setDate] = useState(agenda?.date || "15 Okt 2026");
  const [time, setTime] = useState(agenda?.time || "16:00 - 17:00 WIB");
  const [location, setLocation] = useState(agenda?.location || "Lab Komputer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Nama kegiatan tidak boleh kosong");
      return;
    }
    onSave(
      {
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
      },
      agenda?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-[#15192e] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-black text-lg">
            {agenda ? "Edit Agenda Madrasah" : "Tambah Agenda Madrasah"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              Nama Kegiatan / Acara <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Simulasi Ujian Masuk PTN (TKA)"
              className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                Tanggal
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="15 Okt 2026"
                className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                  isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                Waktu / Jam
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="16:00 - 17:00 WIB"
                className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                  isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              Lokasi / Tempat
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Lab Komputer 1, Aula Utama"
              className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-cyan-400/20"
            >
              Simpan Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskEditDialog({
  task,
  onClose,
  onSave,
  isDark,
}: {
  task: TeacherTask;
  onClose: () => void;
  onSave: (id: number, text: string) => void;
  isDark: boolean;
}) {
  const [text, setText] = useState(task.text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task.id, text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-[#15192e] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-black text-lg">Edit Agenda Pengajaran</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              Isi Agenda
            </label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2 text-xs border outline-none resize-none ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-cyan-400/20"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
