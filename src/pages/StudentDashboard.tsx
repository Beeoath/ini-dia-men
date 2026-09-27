import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Sparkles,
  Award,
  Clock,
  Compass,
  LayoutDashboard,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { MODULES } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import { StudentSpatialLayout } from "../components/StudentSpatialLayout";
import {
  setLastActiveModule,
  useStudentProgress,
  StudentModuleProgress,
} from "../lib/userProgress";

// User provided math artwork & photography
const mathBrainImg = "/assets/chalkboard_math_brain.jpg";
const neonPhysicsImg = "/assets/aljabar_study_desk.jpg";
const darkPendantImg = "/assets/dark_pendant_papers.jpg";
const ipadCalculusImg = "/assets/ipad_calculus_notes.jpg";

// Featured District Hero items with authentic SIGMA TKA Math Content
const SIGMA_HERO_FEATURED = [
  {
    id: "mod-aljabar-1",
    districtId: 1,
    tag: "Distrik Unggulan",
    districtName: "Distrik 1 • Bilangan, Eksponen & Akar",
    categories: ["Bilangan Real", "Eksponen", "Bentuk Akar", "Modul Inti"],
    title: "BAB 1: BILANGAN (Real, Pangkat, Bentuk Akar)",
    displayTitle: "BAB 1: BILANGAN",
    subTitle: "8 Sifat Eksponen, Operasi Bentuk Akar & Rasionalisasi",
    description:
      "Kuasai keluarga bilangan real, 8 sifat ajaib eksponen, operasi bentuk akar, teknik merasionalkan penyebut sekawan, dan telaah soal TKA.",
    fullDescription:
      "Modul resmi BAB 1 Bilangan: mengenal himpunan bilangan real, membongkar 8 sifat eksponen tanpa menghafal buta, menyederhanakan bentuk akar dengan presisi, dan merasionalkan penyebut pecahan sekawan.",
    bgImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1400&auto=format&fit=crop",
    gradient: "from-[#081726]/95 via-[#0b1d30]/80 to-[#050d17]/90",
    accentColor: "#00F0FF",
    targetScore: 75,
  },
  {
    id: "mod-aljabar-2",
    districtId: 2,
    tag: "Distrik Unggulan",
    districtName: "Distrik 2 • Aljabar",
    categories: ["Aljabar", "SPLDV & SPLTV", "Fungsi", "Barisan & Deret", "Modul Inti"],
    title: "BAB 2: ALJABAR (Sistem Persamaan, Fungsi & Deret)",
    displayTitle: "BAB 2: ALJABAR",
    subTitle: "Sistem Persamaan, Pertidaksamaan, Fungsi, Barisan & Deret",
    description:
      "Kuasai eliminasi SPLDV & SPLTV, daerah penyelesaian SPtLDV & program linear, konsep fungsi kuadrat & rasional, komposisi invers, serta barisan deret dan aplikasi keuangan.",
    fullDescription:
      "Modul komprehensif BAB 2 Aljabar: 16 slide materi terstruktur meliputi sistem persamaan linear dua & tiga variabel, program linear optimasi titik pojok, fungsi linear, kuadrat & rasional, trik invers matriks pecahan, notasi sigma, barisan & deret aritmetika/geometri, deret tak hingga, dan pemodelan keuangan eksponensial.",
    bgImage:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1400&auto=format&fit=crop",
    gradient: "from-[#241a06]/95 via-[#1a1304]/80 to-[#0e0a02]/90",
    accentColor: "#FFD600",
    targetScore: 75,
  },
  {
    id: "mod-geometri-1",
    districtId: 3,
    tag: "Distrik Unggulan",
    districtName: "Distrik 3 • Geometri dan Pengukuran",
    categories: ["Geometri", "Dimensi Tiga", "Transformasi", "Modul Inti"],
    title: "BAB 3: GEOMETRI DAN PENGUKURAN",
    displayTitle: "BAB 3: GEOMETRI DAN PENGUKURAN",
    subTitle: "Hubungan Sudut, Kesebangunan, Pythagoras, Bangun Ruang & Transformasi",
    description:
      "Kuasai sudut transversal, kesebangunan & Pythagoras, pengukuran 2D/3D kubus rusuk a, proyeksi tegak lurus dimensi tiga, dan komposisi matriks transformasi.",
    fullDescription:
      "Modul resmi BAB 3 Geometri dan Pengukuran: 15 slide interaktif membedah garis transversal sehadap/berseberangan/sepihak, kesebangunan vs kongruensi, dashboard luas & volume 2D/3D, jarak titik ke garis dan bidang kubus ABCD.EFGH, matriks translasi, refleksi, rotasi, dilatasi, tripel Pythagoras cepat, serta telaah soal TKA berbobot tinggi.",
    bgImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop",
    gradient: "from-[#240615]/95 via-[#19040e]/80 to-[#0f0208]/90",
    accentColor: "#FF007A",
    targetScore: 75,
  },
  {
    id: "mod-trigo-1",
    districtId: 4,
    tag: "Distrik Unggulan",
    districtName: "Distrik 4 • Trigonometri Lanjut",
    categories: ["Trigonometri", "Level 4", "Modul Inti"],
    title: "Sudut Rangkap & Persamaan Kuadrat Sinus",
    displayTitle: "Trigonometri Lanjut",
    subTitle: "Identitas sin 2A, cos 2A, & Penyelesaian Kuadran",
    description:
      "Urai rumus sudut rangkap trigonometri, pemfaktoran persamaan kuadratik bentuk trigonometri, serta himpunan penyelesaian pada interval sudut [0, 2π].",
    fullDescription:
      "Pendalaman formula sudut ganda sin 2x = 2 sin x cos x, rumus cos 2x dalam 3 variasi, manipulasi aljabar persamaan kuadrat trigonometri dan verifikasi sudut kuadran I hingga IV.",
    bgImage:
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1400&auto=format&fit=crop",
    gradient: "from-[#0d1629]/95 via-[#091122]/80 to-[#040812]/90",
    accentColor: "#38BDF8",
    targetScore: 75,
  },
  {
    id: "mod-stat-1",
    districtId: 5,
    tag: "Distrik Unggulan",
    districtName: "Distrik 5 • Peluang & Analisis Data",
    categories: ["Peluang & Statistika", "Level 5", "Modul Inti"],
    title: "Permutasi, Kombinasi & Kuartil Data Berkelompok",
    displayTitle: "Peluang & Statistika",
    subTitle: "Kaidah Pencacahan, Peluang Kejadian Majemuk & Ogive",
    description:
      "Kombinasikan nCr dan nPr pada soal cerita bersyarat, serta hitung median, kuartil bawah, dan ragam simpangan baku dari tabel distribusi frekuensi berkelompok.",
    fullDescription:
      "Materi pamungkas TKA Matematika: permutasi siklis, kombinasi pemilihan objek, hukum penjumlahan dan perkalian peluang majemuk, serta interpolasi kuartil dan desil data berkelompok.",
    bgImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop",
    gradient: "from-[#1a1205]/95 via-[#120c03]/80 to-[#080501]/90",
    accentColor: "#F59E0B",
    targetScore: 75,
  },
];

// Continuous modules left list
const NEW_LEARNING_MODULES = [
  {
    id: "mod-aljabar-1",
    title: "BAB 1: Bilangan & Akar",
    topic: "Eksponen & Rasionalisasi",
    tag: "Distrik 1",
    duration: "20 Menit",
    img: mathBrainImg,
  },
  {
    id: "mod-aljabar-2",
    title: "BAB 2: Aljabar",
    topic: "Sistem Persamaan, Fungsi & Deret",
    tag: "Distrik 2",
    duration: "25 Menit",
    img: neonPhysicsImg,
  },
];

// Recommendations
const RECOMMENDATIONS = [
  {
    id: "mod-aljabar-1",
    districtId: 1,
    tag: "Distrik 01",
    match: "98% Sesuai",
    title: "BAB 1: Bilangan",
    displayTopic: "Eksponen & Bentuk Akar",
    img: mathBrainImg,
  },
  {
    id: "mod-aljabar-2",
    districtId: 2,
    tag: "Distrik 02",
    match: "95% Sesuai",
    title: "BAB 2: Aljabar",
    displayTopic: "Sistem Persamaan & Fungsi",
    img: neonPhysicsImg,
  },
  {
    id: "mod-geometri-1",
    districtId: 3,
    tag: "Distrik 03",
    match: "91% Sesuai",
    title: "BAB 3: Geometri",
    displayTopic: "Dimensi Tiga & Transformasi",
    img: darkPendantImg,
  },
  {
    id: "mod-trigo-1",
    districtId: 4,
    tag: "Distrik 04",
    match: "89% Sesuai",
    title: "BAB 4: Trigonometri",
    displayTopic: "Sudut Rangkap",
    img: ipadCalculusImg,
  },
];

export default function StudentDashboard() {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [heroIdx, setHeroIdx] = useState(0);
  const [showModalDetail, setShowModalDetail] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { progressMap: userProgress } = useStudentProgress();

  const currentHero = SIGMA_HERO_FEATURED[heroIdx];

  const handleNextHero = () => {
    setHeroIdx((prev) => (prev + 1) % SIGMA_HERO_FEATURED.length);
  };

  const handlePrevHero = () => {
    setHeroIdx((prev) => (prev - 1 + SIGMA_HERO_FEATURED.length) % SIGMA_HERO_FEATURED.length);
  };

  // Dynamic continue learning list based on real stored progress
  const continueLearningList = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      topic: string;
      progress: number;
      subtitle: string;
    }> = [];

    // Map through progress records
    Object.entries(userProgress).forEach(([modId, val]) => {
      const prog = val as StudentModuleProgress;
      const mod = MODULES.find((m) => m.id === modId);
      if (mod && prog) {
        items.push({
          id: mod.id,
          title: mod.title.split(":")[0],
          topic: `${mod.districtName} • Slide ${prog.slideIdx + 1} dari ${prog.totalSlides}`,
          progress: prog.percent,
          subtitle: prog.completed ? "Selesai (Skor 75+)" : `Progres: ${prog.percent}%`,
        });
      }
    });

    if (items.length === 0) {
      return [
        {
          id: "mod-aljabar-1",
          title: "Operasi & Determinan Matriks",
          topic: "Distrik 1 • Titik Awal Perjalanan",
          progress: 0,
          subtitle: "Mulai Belajar (0%)",
        },
      ];
    }

    return items;
  }, [userProgress]);

  // Filter recommendations based on search
  const filteredRecommendations = useMemo(() => {
    let list = RECOMMENDATIONS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.displayTopic.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery]);

  return (
    <StudentSpatialLayout
      activeDockItem="dashboard"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari topik atau rumus TKA (Enter untuk buka Hub)..."
    >
      <div className="space-y-6">
        {/* ================================================================== */}
        {/* TOP BAR: INTEGRATED VIEW SWITCHER (DASHBOARD <-> SIGMA HUB)         */}
        {/* ================================================================== */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
          <div
            className={`inline-flex items-center p-1 rounded-full border backdrop-blur-xl ${
              isDark ? "bg-[#141726]/80 border-white/10" : "bg-white/85 border-slate-300 shadow-sm"
            }`}
          >
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black shadow-sm ${
                isDark ? "bg-white text-slate-950" : "bg-slate-900 text-white"
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Ringkasan Dashboard</span>
            </div>
            <Link
              to="/app/hub"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <BookOpen size={15} />
              <span>Katalog Sigma Hub</span>
            </Link>
          </div>

          {/* Quick Hub Shortcut Pill */}
          <Link
            to="/app/hub"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              isDark
                ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                : "border-cyan-600/30 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
            }`}
          >
            <Sparkles size={14} />
            <span>Jelajahi Bank Modul di Sigma Hub</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ================================================================== */}
        {/* MAIN 2-COLUMN DASHBOARD GRID                                       */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* LEFT COLUMN: Materi Terkini & Lanjutkan Belajar */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-5">
            {/* 1. Materi Terkini */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs sm:text-sm font-bold tracking-wide ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Materi Terkini
                </h3>
                <Link
                  to="/app/hub"
                  className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-700 hover:text-cyan-800"
                  }`}
                >
                  Lihat di Hub <ChevronRight size={12} />
                </Link>
              </div>

              <div className="space-y-2.5">
                {NEW_LEARNING_MODULES.map((mod) => (
                  <div
                    key={mod.title}
                    onClick={() => {
                      setLastActiveModule(mod.id);
                      navigate(`/app/materi/${mod.id}`);
                    }}
                    className={`group relative rounded-2xl overflow-hidden border p-3 flex items-center justify-between transition-all cursor-pointer shadow-sm hover:shadow-md min-h-[95px] ${
                      isDark
                        ? "border-white/10 bg-[#161826] hover:border-cyan-400/40"
                        : "border-slate-200/90 bg-white hover:border-cyan-500/70"
                    }`}
                  >
                    <img
                      src={mod.img}
                      alt={mod.title}
                      className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                        isDark
                          ? "opacity-35 group-hover:opacity-45"
                          : "opacity-25 group-hover:opacity-35"
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        isDark
                          ? "from-[#0d0f1a]/95 via-[#0d0f1a]/85 to-transparent"
                          : "from-white/98 via-white/92 to-white/70"
                      }`}
                    />

                    <div className="relative z-10 min-w-0 pr-2">
                      <h4
                        className={`text-xs sm:text-sm font-black transition-colors ${
                          isDark
                            ? "text-white group-hover:text-cyan-300"
                            : "text-slate-900 group-hover:text-cyan-700"
                        }`}
                      >
                        {mod.title}
                      </h4>
                      <p
                        className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${
                          isDark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {mod.topic}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            isDark
                              ? "text-cyan-400 bg-cyan-500/15 border-cyan-400/25"
                              : "text-cyan-800 bg-cyan-50 border-cyan-200/90"
                          }`}
                        >
                          {mod.tag}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            isDark
                              ? "text-amber-300 bg-amber-500/15 border-amber-400/25"
                              : "text-amber-800 bg-amber-50 border-amber-200/90"
                          }`}
                        >
                          {mod.duration}
                        </span>
                      </div>
                    </div>

                    {/* Circular Play Button */}
                    <div
                      className={`relative z-10 h-9 w-9 rounded-full grid place-items-center shrink-0 shadow-md group-hover:scale-110 transition-transform ${
                        isDark
                          ? "bg-white text-slate-950 shadow-white/20"
                          : "bg-slate-900 text-white shadow-slate-900/20"
                      }`}
                    >
                      <Play size={14} className="fill-current ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Lanjutkan Belajar */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs sm:text-sm font-bold tracking-wide ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Lanjutkan Belajar
                </h3>
                <span
                  className={`font-mono text-[10px] ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Tersinkron dengan Hub
                </span>
              </div>

              <div className="space-y-2">
                {continueLearningList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setLastActiveModule(item.id);
                      navigate(`/app/materi/${item.id}`);
                    }}
                    className={`group rounded-2xl border p-3 flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                      isDark
                        ? "bg-[#151724]/85 border-white/10 hover:border-cyan-400/30 hover:bg-[#1a1c2c]"
                        : "bg-white/95 border-slate-200/90 hover:border-cyan-500/60 hover:bg-cyan-50/20"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                          isDark
                            ? "text-white group-hover:text-cyan-300"
                            : "text-slate-900 group-hover:text-cyan-700"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <div
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {item.topic}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div
                          className={`h-1.5 w-20 sm:w-28 rounded-full overflow-hidden ${
                            isDark ? "bg-white/10" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Circular Play Button */}
                    <div
                      className={`h-8 w-8 rounded-full border grid place-items-center shrink-0 ml-2 transition-all ${
                        isDark
                          ? "bg-white/10 border-white/15 text-white group-hover:bg-white group-hover:text-black"
                          : "bg-slate-100 border-slate-200/90 text-slate-700 group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white"
                      }`}
                    >
                      <Play size={12} className="fill-current ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Cinematic Hero Banner + Rekomendasi Modul TKA */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            {/* 1. CINEMATIC HERO BANNER */}
            <div
              className={`relative rounded-3xl overflow-hidden border min-h-[320px] p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all ${
                isDark
                  ? "border-white/15 bg-[#171927]"
                  : "border-slate-800/20 bg-slate-950 shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
              }`}
            >
              <img
                src={currentHero.bgImage}
                alt={currentHero.displayTitle}
                className="absolute inset-0 w-full h-full object-cover opacity-45"
                referrerPolicy="no-referrer"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${currentHero.gradient}`} />

              {/* Top Tags Strip */}
              <div className="relative z-10 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-[11px] font-bold text-white">
                  {currentHero.tag}
                </span>
                {currentHero.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-medium text-slate-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Center Big Title & Description */}
              <div className="relative z-10 max-w-xl my-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                  {currentHero.displayTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed font-normal">
                  {currentHero.description}
                </p>
                <p className="text-[11px] text-cyan-300 font-mono mt-1 font-semibold">
                  {currentHero.subTitle} • Target Lulus: Skor ≥ {currentHero.targetScore}
                </p>
              </div>

              {/* Bottom Action Strip */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLastActiveModule(currentHero.id);
                      navigate(`/app/materi/${currentHero.id}`);
                    }}
                    className="rounded-full bg-white text-slate-950 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-black hover:bg-slate-200 transition-all flex items-center gap-2 shadow-xl shadow-white/20 hover:scale-105 cursor-pointer"
                  >
                    <Play size={14} className="fill-black" />
                    <span>Mulai Belajar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLastActiveModule(currentHero.id);
                      navigate(`/app/kuis/${currentHero.id}`);
                    }}
                    className="rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Award size={14} />
                    <span>Uji Kuis (75+)</span>
                  </button>

                  <Link
                    to={`/app/hub?module=${currentHero.id}&category=${encodeURIComponent(
                      currentHero.categories[0]
                    )}`}
                    className="rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/30 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Buka silabus lengkap di Sigma Hub"
                  >
                    <BookOpen size={14} />
                    <span className="hidden sm:inline">Buka di Sigma Hub</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowModalDetail(currentHero)}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-slate-200 hover:text-white transition-all cursor-pointer"
                    title="Rincian Silabus Singkat"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>

                {/* Carousel Navigation Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevHero}
                    className="grid h-9 w-9 place-items-center rounded-full bg-black/40 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Distrik Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextHero}
                    className="grid h-9 w-9 place-items-center rounded-full bg-black/40 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Distrik Selanjutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. REKOMENDASI MODUL TKA */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`text-xs sm:text-sm font-bold tracking-wide ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Rekomendasi Modul TKA
                  </h3>
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Kurikulum adaptif sesuai kesiapan ujian masuk perguruan tinggi
                  </p>
                </div>

                <Link
                  to="/app/hub"
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all flex items-center gap-1 ${
                    isDark
                      ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                      : "bg-slate-100/90 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-white hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <span>Lihat Semua di Hub</span>
                  <ChevronRight size={12} />
                </Link>
              </div>

              {/* 4 Poster Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
                {filteredRecommendations.map((card) => (
                  <div
                    key={card.title}
                    onClick={() => setShowModalDetail(card)}
                    className={`group relative rounded-2xl overflow-hidden border aspect-[3/4] p-3 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all duration-300 ${
                      isDark
                        ? "border-white/10 bg-[#161826] hover:border-cyan-400/40 shadow-lg"
                        : "border-slate-200/90 bg-slate-950 hover:border-cyan-400/60 shadow-md hover:shadow-xl"
                    }`}
                  >
                    <img
                      src={card.img}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-black/20" />

                    {/* Top Category Tag */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-0.5 text-[10px] font-medium text-slate-200">
                        {card.tag}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">
                        {card.match}
                      </span>
                    </div>

                    {/* Bottom Title & Actions */}
                    <div className="relative z-10 flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-white leading-tight group-hover:text-cyan-300 transition-colors truncate">
                          {card.title}
                        </h4>
                        <p className="text-[10px] text-slate-300 truncate mt-0.5">
                          {card.displayTopic}
                        </p>
                      </div>

                      <div className="h-7 w-7 rounded-full bg-white text-slate-950 grid place-items-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={11} className="fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* MODAL DETAIL POPUP                                                 */}
        {/* ================================================================== */}
        {showModalDetail && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
              isDark ? "bg-black/75 backdrop-blur-xl" : "bg-slate-900/45 backdrop-blur-md"
            }`}
          >
            <div
              className={`relative w-full max-w-lg rounded-3xl border p-6 shadow-2xl overflow-hidden ${
                isDark
                  ? "border-white/20 bg-[#161826] text-slate-100"
                  : "border-slate-200/90 bg-white/95 text-slate-900 backdrop-blur-xl"
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModalDetail(null)}
                className={`absolute top-4 right-4 h-8 w-8 rounded-full grid place-items-center cursor-pointer transition-colors ${
                  isDark
                    ? "bg-white/10 text-slate-300 hover:text-white hover:bg-white/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-950 hover:bg-slate-200"
                }`}
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${
                    isDark
                      ? "bg-cyan-400/20 text-cyan-300 border-cyan-400/40"
                      : "bg-cyan-50 text-cyan-700 border-cyan-200"
                  }`}
                >
                  {showModalDetail.tag || "Modul TKA"}
                </span>
                <span
                  className={`text-xs font-mono ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  MAS Darunnajah 9
                </span>
              </div>

              <h3
                className={`text-xl sm:text-2xl font-black leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {showModalDetail.title || showModalDetail.displayTitle}
              </h3>
              <p
                className={`text-xs sm:text-sm mt-2.5 leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {showModalDetail.fullDescription ||
                  showModalDetail.description ||
                  `Pelajari materi pembelajaran dan selesaikan tantangan kuis untuk topik ${
                    showModalDetail.displayTopic || showModalDetail.title
                  }.`}
              </p>

              <div
                className={`mt-6 flex flex-wrap items-center gap-3 pt-3 border-t ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    const targetId = showModalDetail.id || "mod-aljabar-1";
                    setLastActiveModule(targetId);
                    navigate(`/app/materi/${targetId}`);
                  }}
                  className={`flex-1 rounded-full font-black py-2.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isDark
                      ? "bg-white text-slate-950 hover:bg-slate-200"
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
                  }`}
                >
                  <Play size={14} className="fill-current" />
                  <span>Mulai Belajar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetId = showModalDetail.id || "mod-aljabar-1";
                    setLastActiveModule(targetId);
                    navigate(`/app/kuis/${targetId}`);
                  }}
                  className={`rounded-full border font-bold py-2.5 px-4 text-xs sm:text-sm transition-all cursor-pointer ${
                    isDark
                      ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                  }`}
                >
                  Uji Kuis
                </button>

                <Link
                  to={`/app/hub?module=${showModalDetail.id || "mod-aljabar-1"}`}
                  className={`rounded-full border font-bold py-2.5 px-4 text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDark
                      ? "bg-cyan-500/15 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25"
                      : "bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100"
                  }`}
                >
                  <BookOpen size={14} />
                  <span>Buka di Hub</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentSpatialLayout>
  );
}
