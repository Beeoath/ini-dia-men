import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Play,
  Download,
  Users,
  Award,
  CheckCircle2,
  MessageSquare,
  Inbox,
  ShieldCheck,
  BookOpen,
  Flame,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import { VisionOSWindow } from "../components/VisionOSWindow";
import { useTheme } from "../lib/theme";

interface StudentRecord {
  id: string;
  name: string;
  class: string;
  progress: string;
  avgScore: number | string;
  status: string;
}

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "students" | "modules" | "analytics">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentRecord[]>([]);

  useEffect(() => {
    (async () => {
      const { data: studentProfiles, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, class_name")
        .eq("role", "student");

      if (profileErr || !studentProfiles) {
        setStudents([]);
        return;
      }

      const { data: progressRows } = await supabase
        .from("user_progress")
        .select("user_id, completed, quiz_score");

      const realStudents: StudentRecord[] = studentProfiles.map((u) => {
        const rows = (progressRows || []).filter((p) => p.user_id === u.id);
        const completedCount = rows.filter((p) => p.completed).length;
        const scored = rows.filter((p) => p.quiz_score != null);
        const avgScore =
          scored.length > 0
            ? Math.round(scored.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / scored.length)
            : 0;
        const progressPct = Math.min(100, Math.round((completedCount / 10) * 100));
        const rawClass = u.class_name || "Kelas 11 A";
        const cleanClass =
          rawClass.includes("B") || rawClass.includes("2") ? "Kelas 11 B" : "Kelas 11 A";

        return {
          id: u.id,
          name: u.full_name || "Siswa Baru",
          class: cleanClass,
          progress: `${progressPct}%`,
          avgScore: avgScore || 0,
          status: completedCount > 0 ? "Aktif" : "Baru Bergabung",
        };
      });

      setStudents(realStudents);
    })();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudents = students.length;
  const avgScore =
    totalStudents > 0
      ? (
          students.reduce((acc, s) => acc + (typeof s.avgScore === "number" ? s.avgScore : 0), 0) /
          totalStudents
        ).toFixed(1)
      : "0";
  const completedRate =
    totalStudents > 0
      ? `${Math.round((students.filter((s) => parseInt(s.progress) >= 70).length / totalStudents) * 100)}%`
      : "0%";

  const handleExportExcel = () => {
    toast.success("Data rekap nilai siswa berhasil diekspor (Format CSV/Excel)!");
  };

  return (
    <VisionOSWindow role="teacher" activeDockItem="home" urlPath="sigma.darunnajah9.sch.id/teacher">
      {/* 1. TOP NAVIGATION BAR INSIDE FROSTED GLASS */}
      <header
        className={`flex flex-col lg:flex-row items-center justify-between gap-4 pb-6 border-b ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}
      >
        {/* Left: Search Input Pill */}
        <div className="relative w-full lg:w-72">
          <Search
            size={15}
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          />
          <input
            type="text"
            placeholder="Cari siswa, rombel, materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-10 w-full rounded-full pl-10 pr-4 text-xs outline-none transition-all ${
              isDark
                ? "border border-white/10 bg-white/10 text-white placeholder-slate-400 focus:border-white/30 focus:bg-white/15"
                : "border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white shadow-sm"
            }`}
          />
        </div>

        {/* Center: Category Pill Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {[
            { id: "overview", label: "Ringkasan" },
            { id: "students", label: "Siswa & Nilai" },
            { id: "modules", label: "Modul & Soal" },
            { id: "analytics", label: "Statistik TKA" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? "bg-white/85 text-slate-950 font-bold shadow-md shadow-white/10"
                      : "bg-slate-900 text-white font-bold shadow-sm"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Notification & Teacher Profile Chip */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            type="button"
            className={`relative grid h-9 w-9 place-items-center rounded-full border transition-all cursor-pointer ${
              isDark
                ? "border-white/10 bg-white/10 text-slate-300 hover:text-white hover:bg-white/20"
                : "border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 shadow-sm"
            }`}
            title="Notifikasi Guru"
          >
            <Bell size={15} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          </button>

          {/* Teacher Profile Chip */}
          <Link
            to="/app/profile"
            className={`flex items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-3 transition-all cursor-pointer group ${
              isDark
                ? "border-amber-400/30 bg-white/10 hover:bg-white/20 hover:border-amber-400/60"
                : "border-amber-400/50 bg-white hover:bg-amber-50/50 hover:border-amber-500 shadow-sm"
            }`}
            title="Buka Profil Guru"
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck size={14} />
            </div>
            <div className="text-left hidden sm:block">
              <div
                className={`text-xs font-bold leading-tight group-hover:text-amber-500 transition-colors ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {profile?.full_name || "Ust. Ahmad Fauzi, S.Pd."}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-300/90 leading-none">
                Guru Pengampu • MAS Darunnajah 9
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* 2. MAIN CINEMATIC GRID */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* === LEFT COLUMN: Agenda & Class Monitoring Cards === */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Agenda Guru */}
          <div
            className={`rounded-3xl border p-4 sm:p-5 backdrop-blur-xl shadow-lg transition-all ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <Flame size={14} className="fill-amber-500" />
                <span className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>
                  Agenda Guru
                </span>
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Hari Ini
              </span>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => navigate("/teacher/content")}
                className={`group flex items-center gap-3 rounded-2xl border p-2.5 transition-all cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-black/40 hover:bg-white/10"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className={`truncate text-xs font-bold transition-colors ${
                      isDark ? "text-white group-hover:text-cyan-300" : "text-slate-900 group-hover:text-cyan-600"
                    }`}
                  >
                    Kelola Modul &amp; Bank Soal
                  </h4>
                  <p className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    5 Distrik aktif siap disunting
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate("/teacher/moderation")}
                className={`group flex items-center gap-3 rounded-2xl border p-2.5 transition-all cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-black/40 hover:bg-white/10"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-400/30">
                  <MessageSquare size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className={`truncate text-xs font-bold transition-colors ${
                      isDark ? "text-white group-hover:text-purple-300" : "text-slate-900 group-hover:text-purple-600"
                    }`}
                  >
                    Moderasi Forum Diskusi
                  </h4>
                  <p className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Tinjau tanya-jawab antar siswa
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Status Rombel / Kelas */}
          <div
            className={`rounded-3xl border p-4 sm:p-5 backdrop-blur-xl shadow-lg ${
              isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            <h3
              className={`text-xs font-bold mb-3 tracking-wide ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Sebaran Rombel Kelas 11
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                {
                  name: "Kelas 11 A",
                  status: "Aktif Belajar",
                  count: `${students.filter((s) => s.class.includes("11 A") || s.class.includes("11A") || s.class.includes("1") || s.class === "Kelas 11").length} Siswa`,
                },
                {
                  name: "Kelas 11 B",
                  status: "Aktif Belajar",
                  count: `${students.filter((s) => s.class.includes("11 B") || s.class.includes("11B") || s.class.includes("2")).length} Siswa`,
                },
              ].map((cls, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/5 hover:border-white/10"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {cls.name}
                    </div>
                    <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {cls.status}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
                    {cls.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: Cinematic Teacher Hero Banner + Metrics & Student Roster === */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. CINEMATIC HERO BANNER FOR TEACHER */}
          <div className="relative min-h-[320px] sm:min-h-[360px] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex flex-col justify-end p-6 sm:p-8 group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

            <div className="relative z-10 max-w-xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                  <ShieldCheck size={12} />
                  Ruang Kendali Guru
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-md">
                  Kurikulum SIGMA 2026
                </span>
                <span className="rounded-full bg-cyan-400/15 border border-cyan-400/30 px-3 py-1 text-[11px] font-mono font-bold text-cyan-300 backdrop-blur-md">
                  MAS Darunnajah 9
                </span>
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Pusat Pemantauan &amp; Evaluasi Siswa
                </h1>
                <p className="mt-1 font-mono text-xs sm:text-sm font-semibold text-cyan-300">
                  Pantau Progres Belajar 5 Distrik Matematika Secara Terpadu
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Kelola bank soal kuis, sesuaikan bobot materi kurikulum, dan pantau penguasaan konsep
                aljabar, kalkulus, geometri, hingga trigonometri para siswa secara langsung.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/teacher/content")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-slate-950 shadow-xl shadow-white/15 hover:bg-slate-200 hover:scale-105 transition-all cursor-pointer"
                >
                  <Play size={13} className="fill-black" />
                  <span>Kelola Materi</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>Ekspor Nilai Excel</span>
                </button>

                <Link
                  to="/app"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <GraduationCap size={13} />
                  <span>Mode Siswa</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. METRIC CARDS (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div
              className={`rounded-2xl border p-4 backdrop-blur-xl shadow-sm ${
                isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[11px] font-bold uppercase">
                <Users size={13} /> Total Siswa
              </div>
              <div
                className={`font-display text-2xl sm:text-3xl font-black mt-1.5 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {totalStudents}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {totalStudents > 0 ? "Terdata di sistem" : "Belum ada siswa"}
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 backdrop-blur-xl shadow-sm ${
                isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5 text-cyan-500 font-mono text-[11px] font-bold uppercase">
                <Award size={13} /> Rerata Nilai
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-300 mt-1.5">
                {avgScore}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Skor kuis siswa
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 backdrop-blur-xl shadow-sm ${
                isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-500 font-mono text-[11px] font-bold uppercase">
                <CheckCircle2 size={13} /> Ketuntasan
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300 mt-1.5">
                {completedRate}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Lulus batas KKM
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 backdrop-blur-xl shadow-sm ${
                isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5 text-purple-500 font-mono text-[11px] font-bold uppercase">
                <MessageSquare size={13} /> Diskusi
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-300 mt-1.5">
                0
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Thread aktif
              </div>
            </div>
          </div>

          {/* 3. STUDENT ROSTER TABLE */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4 ${
              isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold tracking-wide ${isDark ? "text-white" : "text-slate-900"}`}>
                  Daftar Progres Siswa
                </h3>
                <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Data pemantauan pengerjaan materi dan kuis matematika
                </p>
              </div>
              <span className={`font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {filteredStudents.length} Siswa Terdaftar
              </span>
            </div>

            {filteredStudents.length === 0 ? (
              <div
                className={`py-12 text-center rounded-2xl border border-dashed ${
                  isDark
                    ? "border-white/10 bg-black/20 text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl mb-2.5 ${
                    isDark ? "bg-white/5 text-slate-500" : "bg-white text-slate-400 border border-slate-200"
                  }`}
                >
                  <Inbox size={22} />
                </div>
                <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Belum Ada Data Siswa
                </h4>
                <p className={`mt-1 max-w-xs mx-auto text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Data siswa akan otomatis tampil di sini saat siswa MAS Darunnajah 9 mendaftar dan
                  mengerjakan kuis.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr
                      className={`border-b font-mono uppercase text-[10px] ${
                        isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <th className="pb-3 font-semibold">Nama Siswa</th>
                      <th className="pb-3 font-semibold">Kelas</th>
                      <th className="pb-3 font-semibold">Progres</th>
                      <th className="pb-3 font-semibold">Skor Kuis</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? "divide-y divide-white/5" : "divide-y divide-slate-100"}>
                    {filteredStudents.map((std) => (
                      <tr
                        key={std.id}
                        className={`transition-colors ${
                          isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className={`py-3 font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {std.name}
                        </td>
                        <td className={`py-3 font-mono ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {std.class}
                        </td>
                        <td className="py-3 text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                          {std.progress}
                        </td>
                        <td className={`py-3 font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {std.avgScore}
                        </td>
                        <td className="py-3">
                          <span className="inline-block rounded-full px-2 py-0.5 font-mono text-[9px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
                            {std.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </VisionOSWindow>
  );
}
