import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Award,
  Save,
  LogOut,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Lock,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { StudentSpatialLayout } from "../components/StudentSpatialLayout";
import { useTheme } from "../lib/theme";

export default function Profile() {
  const { profile, updateProfile, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("Biodata & Akun");
  const [fullName, setFullName] = useState(profile?.full_name || "Ahmad Rizky Pratama");
  const [className, setClassName] = useState(profile?.class_name || "Kelas 11");
  const [nisn, setNisn] = useState("0068192341");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tabs = [
    { key: "Biodata & Akun", label: "Biodata & Akun" },
    { key: "Lencana Pahlawan", label: "Lencana Prestasi" },
    { key: "Statistik Belajar", label: "Statistik Performa TKA" },
  ];

  const badges = [
    {
      title: "Cyber Algebraist",
      desc: "Menyelesaikan modul Matriks & Determinan 3x3 dengan nilai sempurna di Distrik 1.",
      icon: "Σ",
      color: "#00f0ff",
      unlocked: true,
      date: "12 Mar 2026",
    },
    {
      title: "Vector Scout",
      desc: "Menyelesaikan eksplorasi koordinat 3D & perkalian silang vektor dengan akurasi 85%+.",
      icon: "Δ",
      color: "#10b981",
      unlocked: true,
      date: "14 Mar 2026",
    },
    {
      title: "Calculus Dynamo",
      desc: "Menuntaskan limit trigonometri dan turunan fungsi tingkat lanjut di Distrik 2.",
      icon: "∫",
      color: "#8b5cf6",
      unlocked: false,
      date: "Proses (65%)",
    },
    {
      title: "TKA Grandmaster",
      desc: "Lulus simulasi akbar komprehensif 50 soal dengan skor TKA melampaui 80.",
      icon: "Ω",
      color: "#f59e0b",
      unlocked: false,
      date: "Terkunci",
    },
    {
      title: "Probability Wizard",
      desc: "Menguasai kaidah pencacahan, permutasi, kombinasi, dan distribusi peluang di Distrik 5.",
      icon: "θ",
      color: "#ec4899",
      unlocked: false,
      date: "Terkunci",
    },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      class_name: className,
      avatar_url: profile?.avatar_url,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/masuk");
  };

  const displayName = profile?.full_name || fullName;
  const displayClass = profile?.class_name || className;
  const displayLevel = profile?.level || 1;

  return (
    <StudentSpatialLayout
      activeDockItem="profile"
      categoryTabs={tabs}
      activeCategory={activeTab}
      onSelectCategory={setActiveTab}
      searchPlaceholder="Cari riwayat kuis, pencapaian..."
    >
      <div className="space-y-6 sm:space-y-7">
        {/* ================================================================== */}
        {/* 1. STUDENT PROFILE HERO HEADER                                     */}
        {/* ================================================================== */}
        <div
          className={`relative overflow-hidden rounded-[28px] sm:rounded-[34px] border p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all ${
            isDark
              ? "border-white/[0.14] bg-gradient-to-r from-[#0d162d]/95 via-[#101b38]/85 to-[#0b1024]/90 text-white"
              : "border-slate-300 bg-gradient-to-r from-sky-50 via-white to-blue-50 text-slate-900 shadow-md"
          }`}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 grid place-items-center text-slate-950 font-black text-3xl shadow-xl shadow-cyan-500/20 border-2 border-white/30">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md border-2 ${
                    isDark ? "border-[#101b38]" : "border-white"
                  }`}
                >
                  ✓
                </span>
              </div>

              {/* Identity details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-300">
                    <Sparkles size={11} /> LEVEL {displayLevel} GUARDIAN
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono ${
                      isDark ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    NISN: {nisn}
                  </span>
                </div>

                <h1
                  className={`font-display text-2xl sm:text-3xl font-black ${
                    isDark ? "text-white" : "text-slate-950"
                  }`}
                >
                  {displayName}
                </h1>

                <p
                  className={`text-xs font-mono ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {displayClass} • MAS Darunnajah 9
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs font-mono">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                    Target UTBK 2026
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-amber-600 dark:text-amber-300 font-bold">
                    Modul Matematika TKA
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="flex sm:flex-col items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut size={14} /> Keluar Akun
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 2. TAB CONTENT: BIODATA & AKUN                                     */}
        {/* ================================================================== */}
        {activeTab === "Biodata & Akun" && (
          <div
            className={`rounded-[28px] border p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 ${
              isDark
                ? "border-white/10 bg-[#161928]/70 text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-4 ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}
            >
              <div>
                <h3
                  className={`font-display text-lg font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <User size={18} className="text-cyan-500" /> Pengaturan Identitas Siswa
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Informasi ini digunakan pada sertifikat capaian TKA dan laporan evaluasi belajar
                  guru.
                </p>
              </div>

              {savedSuccess && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300 animate-in fade-in">
                  <CheckCircle2 size={13} /> Data berhasil disimpan!
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    className={`text-[11px] font-mono uppercase tracking-wider mb-1.5 block ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Nama Lengkap Siswa
                  </label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap sesuai raport"
                    className={`h-11 w-full rounded-xl border px-3.5 text-xs outline-none ${
                      isDark
                        ? "border-white/15 bg-black/40 text-white placeholder-slate-500 focus:border-cyan-400/50"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-cyan-600"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`text-[11px] font-mono uppercase tracking-wider mb-1.5 block ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Tingkat / Kelas Belajar
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className={`h-11 w-full rounded-xl border px-3 text-xs outline-none cursor-pointer ${
                      isDark
                        ? "border-white/15 bg-black/40 text-white focus:border-cyan-400/50"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-cyan-600"
                    }`}
                  >
                    <option value="Kelas 11">Kelas 11</option>
                    <option value="Kelas 11 IPA">Kelas 11 IPA</option>
                    <option value="Kelas 11 IPS">Kelas 11 IPS</option>
                    <option value="Kelas 11-A">Kelas 11-A</option>
                    <option value="Kelas 11-B">Kelas 11-B</option>
                    <option value="Kelas 10">Kelas 10</option>
                    <option value="Kelas 12">Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`text-[11px] font-mono uppercase tracking-wider mb-1.5 block ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Nomor Induk Siswa Nasional (NISN)
                  </label>
                  <input
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="NISN resmi Kemdikbud / Kemenag"
                    className={`h-11 w-full rounded-xl border px-3.5 text-xs outline-none ${
                      isDark
                        ? "border-white/15 bg-black/40 text-white placeholder-slate-500 focus:border-cyan-400/50"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-cyan-600"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`text-[11px] font-mono uppercase tracking-wider mb-1.5 block ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Email Akun Terdaftar
                  </label>
                  <input
                    disabled
                    value={profile?.email || "siswa@darunnajah9.sch.id"}
                    className={`h-11 w-full rounded-xl border px-3.5 text-xs cursor-not-allowed ${
                      isDark
                        ? "border-white/10 bg-black/20 text-slate-400"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  />
                </div>
              </div>

              <div
                className={`flex items-center justify-end pt-3 border-t ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-black shadow-lg transition-all cursor-pointer ${
                    isDark
                      ? "bg-white text-slate-950 shadow-white/20 hover:bg-slate-200 hover:scale-105"
                      : "bg-slate-950 text-white shadow-slate-950/20 hover:bg-slate-800 hover:scale-105"
                  }`}
                >
                  <Save size={14} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================== */}
        {/* 3. TAB CONTENT: LENCANA PRESTASI                                   */}
        {/* ================================================================== */}
        {activeTab === "Lencana Pahlawan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`font-display text-lg font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <Award size={18} className="text-amber-500" /> Lencana Pahlawan Matematika SIGMA
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Dapatkan lencana digital eksklusif dengan menyelesaikan tantangan distrik dan kuis
                  berpredikat lulus.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-300">
                2 dari 5 Terbuka
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges.map((b, idx) => (
                <div
                  key={idx}
                  className={`rounded-[24px] border p-5 backdrop-blur-xl transition-all duration-300 flex items-start gap-4 ${
                    b.unlocked
                      ? isDark
                        ? "border-white/15 bg-[#161928]/80 shadow-xl hover:border-cyan-400/40 text-slate-100"
                        : "border-slate-200 bg-white shadow-md hover:border-cyan-500 text-slate-900"
                      : isDark
                      ? "border-white/5 bg-[#10121e]/50 opacity-55 text-slate-400"
                      : "border-slate-200 bg-slate-50 opacity-60 text-slate-500"
                  }`}
                >
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-mono text-xl font-black shadow-lg"
                    style={{
                      backgroundColor: b.unlocked ? `${b.color}25` : "rgba(100,116,139,0.1)",
                      color: b.unlocked ? b.color : "#64748b",
                      border: `1px solid ${b.unlocked ? `${b.color}50` : "rgba(100,116,139,0.2)"}`,
                    }}
                  >
                    {b.unlocked ? b.icon : <Lock size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {b.title}
                      </h4>
                      <span
                        className={`font-mono text-[10px] shrink-0 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {b.date}
                      </span>
                    </div>

                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {b.desc}
                    </p>

                    <div className="mt-2.5">
                      {b.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-500">
                          <CheckCircle2 size={12} /> Terverifikasi
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] font-mono ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          Belum Memenuhi Syarat
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 4. TAB CONTENT: STATISTIK PERFORMA TKA                             */}
        {/* ================================================================== */}
        {activeTab === "Statistik Belajar" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`rounded-2xl border p-4.5 backdrop-blur-xl ${
                  isDark ? "border-white/10 bg-[#161928]/70" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <span
                  className={`text-[11px] font-mono block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Rata-rata Skor TKA
                </span>
                <span className="font-display text-2xl font-black text-amber-500 dark:text-amber-300 mt-1 block">
                  85.0
                </span>
                <span className="text-[10px] text-emerald-500 font-mono mt-1 block">
                  ✓ Di atas target (75+)
                </span>
              </div>
              <div
                className={`rounded-2xl border p-4.5 backdrop-blur-xl ${
                  isDark ? "border-white/10 bg-[#161928]/70" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <span
                  className={`text-[11px] font-mono block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Akurasi Jawaban
                </span>
                <span className="font-display text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 block">
                  88.4%
                </span>
                <span
                  className={`text-[10px] font-mono mt-1 block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Dari 45 soal dikerjakan
                </span>
              </div>
              <div
                className={`rounded-2xl border p-4.5 backdrop-blur-xl ${
                  isDark ? "border-white/10 bg-[#161928]/70" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <span
                  className={`text-[11px] font-mono block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Modul Tuntas
                </span>
                <span
                  className={`font-display text-2xl font-black mt-1 block ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  6 / 15
                </span>
                <span
                  className={`text-[10px] font-mono mt-1 block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  40% silabus kurikulum
                </span>
              </div>
              <div
                className={`rounded-2xl border p-4.5 backdrop-blur-xl ${
                  isDark ? "border-white/10 bg-[#161928]/70" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <span
                  className={`text-[11px] font-mono block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Waktu Belajar
                </span>
                <span className="font-display text-2xl font-black text-purple-600 dark:text-purple-300 mt-1 block">
                  14.5 Jam
                </span>
                <span
                  className={`text-[10px] font-mono mt-1 block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Minggu ini: +3.2 Jam
                </span>
              </div>
            </div>

            {/* Recent Quiz History */}
            <div
              className={`rounded-[28px] border p-6 backdrop-blur-xl shadow-xl space-y-4 ${
                isDark
                  ? "border-white/10 bg-[#161928]/70 text-slate-100"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <h4
                className={`font-display text-base font-bold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <TrendingUp size={16} className="text-cyan-500" /> Riwayat Kuis &amp; Simulasi
                Terakhir
              </h4>

              <div className="space-y-2.5">
                {[
                  {
                    title: "Kuis Distrik 1: Invers & Determinan Matriks 3x3",
                    date: "12 Mar 2026",
                    score: 90,
                    status: "LULUS",
                  },
                  {
                    title: "Kuis Distrik 2: Komposisi & Invers Fungsi",
                    date: "10 Mar 2026",
                    score: 80,
                    status: "LULUS",
                  },
                  {
                    title: "Simulasi Mini TKA Paket A (25 Soal)",
                    date: "05 Mar 2026",
                    score: 85,
                    status: "LULUS",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 text-xs ${
                      isDark
                        ? "bg-white/[0.03] border-white/5"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <h5
                        className={`font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </h5>
                      <span
                        className={`text-[11px] font-mono mt-0.5 block ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Dikerjakan pada {item.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`font-display text-base font-black block ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {item.score}
                        </span>
                        <span
                          className={`text-[9px] font-mono block ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          SKOR
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentSpatialLayout>
  );
}
