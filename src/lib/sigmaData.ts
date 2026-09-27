export interface SigmaSlide {
  id?: string;
  title: string;
  content: string;
  formula?: string;
  example?: string;
  exampleProblem?: string;
  solution?: string;
  keyTakeaways?: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface SigmaModule {
  id: string;
  title: string;
  subtitle: string;
  displayTitle?: string;
  subTitle?: string;
  districtId: number;
  districtName: string;
  categories?: string[];
  xp: number;
  xpReward: number;
  estimatedMinutes: number;
  durationMinutes?: number;
  quizTimeLimitMinutes?: number;
  slides: SigmaSlide[];
  quiz: QuizQuestion[];
  difficulty: "Dasar" | "Menengah" | "Lanjut" | "TKA";
  tag?: string;
  description: string;
  fullDescription?: string;
  bgImage?: string;
  accentColor?: string;
  targetScore?: number;
}

export interface District {
  id: number;
  name: string;
  title: string;
  tag: string;
  description: string;
  color: string;
  accent: string;
  guardian: string;
  totalModules: number;
  badge: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  author?: string;
  authorName: string;
  authorRole: "student" | "teacher";
  authorClass?: string;
  category: string;
  repliesCount: number;
  upvotes: number;
  isPinned?: boolean;
  isAnswered?: boolean;
  createdAt: string;
}

export const DISTRICTS: District[] = [
  {
    id: 1,
    name: "Bilangan",
    title: "Distrik 1 • Bilangan",
    tag: "Number Realm",
    description: "Operasi bilangan real, sifat eksponen aljabar, bentuk akar sekawan, dan telaah TKA.",
    color: "#00F0FF",
    accent: "#00F0FF",
    guardian: "Al-Khwarizmi Protocol",
    totalModules: 1,
    badge: "Number Master",
  },
  {
    id: 2,
    name: "Aljabar",
    title: "Distrik 2 • Aljabar",
    tag: "Algebra Citadel",
    description: "Sistem persamaan (SPLDV & SPLTV), pertidaksamaan linear & program linear, konsep fungsi, komposisi & invers, serta barisan deret.",
    color: "#FFD600",
    accent: "#FFD600",
    guardian: "Newton-Leibniz Core",
    totalModules: 1,
    badge: "Algebra Master",
  },
  {
    id: 3,
    name: "Geometri dan pengukuran",
    title: "Distrik 3 • Geometri dan Pengukuran",
    tag: "Spatial Geometry",
    description: "Hubungan sudut transversal, kesebangunan & Pythagoras, dimensi tiga jarak ruang, dan matriks transformasi geometri.",
    color: "#FF007A",
    accent: "#FF007A",
    guardian: "Euclid Sentinel",
    totalModules: 1,
    badge: "Spatial Warden",
  },
  {
    id: 4,
    name: "Trigonometri",
    title: "Distrik 4 • Navigasi Sudut & Trigonometri",
    tag: "Trig Navigator",
    description: "Navigasi sudut putaran radian, komputasi segitiga siku-siku De-Sa-Mi, kompas kuadran, dan konversi koordinat kutub-kartesius.",
    color: "#38BDF8",
    accent: "#38BDF8",
    guardian: "Al-Battani Astral",
    totalModules: 1,
    badge: "Trigon Architect",
  },
  {
    id: 5,
    name: "Peluang & Data",
    title: "Distrik 5 • Peluang & Analisis Data",
    tag: "Multiverse Data",
    description: "Kaidah pencacahan, permutasi siklis, kombinasi binom, dan statistika desil kuartil data kelompok.",
    color: "#A855F7",
    accent: "#A855F7",
    guardian: "Gauss Nexus",
    totalModules: 1,
    badge: "Data Sovereign",
  },
];

export const MODULES: SigmaModule[] = [
  {
    id: "mod-aljabar-1",
    districtId: 1,
    districtName: "Distrik 1 • Bilangan, Eksponen & Akar",
    title: "BAB 1: BILANGAN (Bilangan Real, Berpangkat & Bentuk Akar)",
    subtitle: "Keluarga Bilangan Real, 8 Sifat Eksponen, Operasi Bentuk Akar & Rasionalisasi",
    displayTitle: "BAB 1: BILANGAN",
    subTitle: "Pahami Konsepnya di Sini, Taklukkan Soalnya Nanti",
    tag: "Distrik Unggulan",
    categories: ["Bilangan Real", "Eksponen", "Bentuk Akar", "Modul Inti"],
    xp: 350,
    xpReward: 350,
    estimatedMinutes: 20,
    durationMinutes: 20,
    quizTimeLimitMinutes: 15,
    difficulty: "Dasar",
    description: "Kuasai keluarga bilangan real, 8 sifat ajaib eksponen, operasi bentuk akar, teknik merasionalkan penyebut sekawan, dan telaah soal TKA.",
    fullDescription: "Modul resmi BAB 1 Bilangan: mengenal himpunan bilangan real, membongkar 8 sifat eksponen tanpa menghafal buta, menyederhanakan bentuk akar dengan presisi, dan merasionalkan penyebut pecahan sekawan.",
    bgImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#00F0FF",
    targetScore: 75,
    slides: [
      {
        id: "s-1",
        title: "BAB 1: BILANGAN (Real, Berpangkat, Bentuk Akar)",
        content: "Selamat datang di modul BAB 1 Bilangan. Modul ini membimbing kamu menguasai himpunan bilangan real, 8 sifat eksponen, bentuk akar kuadrat, dan teknik merasionalkan pecahan penyebut berakar.",
        formula: "P - Q = \\frac{4\\sqrt{5}}{2\\sqrt{5} - 4} - \\frac{20}{\\sqrt{5}} = 10",
        keyTakeaways: ["8 sifat eksponen mempermudah perhitungan", "Rasionalkan penyebut dengan mengalikan bentuk sekawannya"],
      },
    ],
    quiz: [
      {
        id: 1,
        question: "Hasil dari $15 : 2{,}5 + (-4)$ adalah . . . .",
        options: ["-1", "0", "1", "2", "3"],
        correctAnswer: 3,
        explanation: "Pembagian dikerjakan lebih dulu: $15 : 2{,}5 = 6$. Lalu $6 + (-4) = 2$.",
      },
      {
        id: 2,
        question: "Diketahui $x = \\frac{1}{3}$, $y = \\frac{1}{4}$, dan $z = \\frac{1}{12}$. Nilai $(x + y) : z$ adalah . . . .",
        options: ["7", "5", "6", "8", "12"],
        correctAnswer: 0,
        explanation: "$x + y = \\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}$. Maka $(x + y) : z = \\frac{7}{12} : \\frac{1}{12} = \\frac{7}{12} \\times 12 = 7$.",
      },
      {
        id: 3,
        question: "Diketahui $x = 4$, $y = \\frac{1}{2}$, dan $z = 2{,}25$. Nilai $\\frac{x + y}{z \\cdot x}$ adalah . . . .",
        options: ["\\frac{1}{4}", "\\frac{1}{2}", "1", "2", "4"],
        correctAnswer: 1,
        explanation: "$x + y = 4 + 0{,}5 = 4{,}5$ dan $z \\cdot x = 2{,}25 \\times 4 = 9$. Maka $\\frac{4{,}5}{9} = \\frac{1}{2}$.",
      },
      {
        id: 4,
        question: "Suatu bengkel membeli $4$ liter oli dengan harga $\\text{Rp}32.000{,}00$ per liter. Bengkel tersebut juga membeli $5$ unit filter oli dengan harga $\\text{Rp}18.500{,}00$ per unit. Biaya yang harus dibayar bengkel tersebut adalah . . . .",
        options: [
          "\\text{Rp}218.500{,}00",
          "\\text{Rp}219.000{,}00",
          "\\text{Rp}219.500{,}00",
          "\\text{Rp}220.000{,}00",
          "\\text{Rp}220.500{,}00",
        ],
        correctAnswer: 4,
        explanation: "Oli: $4 \\times 32.000 = 128.000$. Filter: $5 \\times 18.500 = 92.500$. Total $= 128.000 + 92.500 = \\text{Rp}220.500{,}00$.",
      },
      {
        id: 5,
        question: "Diketahui $Z = \\left(\\frac{1}{81}\\right)^{-\\frac{1}{4}} \\cdot 16^{\\frac{3}{4}} \\cdot 27^{-\\frac{2}{3}}$. Nilai $Z$ adalah . . . .",
        options: ["\\frac{2}{3}", "2", "\\frac{8}{3}", "3", "8"],
        correctAnswer: 2,
        explanation: "$\\left(\\frac{1}{81}\\right)^{-\\frac{1}{4}} = 81^{\\frac{1}{4}} = 3$, $16^{\\frac{3}{4}} = (\\sqrt[4]{16})^3 = 2^3 = 8$, dan $27^{-\\frac{2}{3}} = \\frac{1}{(\\sqrt[3]{27})^2} = \\frac{1}{9}$. Maka $Z = 3 \\cdot 8 \\cdot \\frac{1}{9} = \\frac{24}{9} = \\frac{8}{3}$.",
      },
      {
        id: 6,
        question: "Diketahui $A = \\frac{8x^2 y^{-4} z^3}{2x^7 y^{-1} z^{-2}}$. Bentuk pangkat positif dari $A$ adalah . . . .",
        options: [
          "\\frac{4z^5}{x^5 y^3}",
          "\\frac{4z}{x^5 y^3}",
          "\\frac{4z^5}{x^9 y^5}",
          "\\frac{4x^5 z^5}{y^3}",
          "\\frac{4z^5}{x^5 y^5}",
        ],
        correctAnswer: 0,
        explanation: "Bagi koefisien dan kurangkan pangkat:\n- Koefisien: $8 : 2 = 4$\n- $x$: $2 - 7 = -5$\n- $y$: $-4 - (-1) = -3$\n- $z$: $3 - (-2) = 5$\nDiperoleh $A = 4x^{-5} y^{-3} z^5$. Pangkat negatif dipindah ke penyebut, sehingga $A = \\frac{4z^5}{x^5 y^3}$.",
      },
      {
        id: 7,
        question: "Diketahui $P = \\frac{a^2 \\cdot b^3 \\cdot c^5}{a^{-1} \\cdot b^7 \\cdot c^2}$ dengan $a = \\frac{3}{2}$, $b = 3$, dan $c = 2$. Nilai $P$ adalah . . . .",
        options: ["\\frac{1}{27}", "\\frac{1}{9}", "\\frac{1}{6}", "\\frac{1}{3}", "3"],
        correctAnswer: 3,
        explanation: "Sederhanakan dulu:\n$P = a^{2+1} \\cdot b^{3-7} \\cdot c^{5-2} = a^3 \\cdot b^{-4} \\cdot c^3 = \\frac{(a \\cdot c)^3}{b^4}$.\nKarena $a \\cdot c = \\frac{3}{2} \\cdot 2 = 3$, maka $P = \\frac{3^3}{3^4} = \\frac{1}{3}$.",
      },
      {
        id: 8,
        question: "Diketahui $K = 3\\sqrt{12} + \\sqrt{75} - \\frac{1}{2}\\sqrt{48} + \\sqrt{27}$. Jika $K$ diubah menjadi $a\\sqrt{b}$ dengan $\\sqrt{b}$ bentuk akar paling sederhana, nilai $a \\cdot b$ adalah . . . .",
        options: ["15", "36", "42", "48", "60"],
        correctAnswer: 1,
        explanation: "$3\\sqrt{12} = 3 \\cdot 2\\sqrt{3} = 6\\sqrt{3}$, $\\sqrt{75} = 5\\sqrt{3}$, $\\frac{1}{2}\\sqrt{48} = \\frac{1}{2} \\cdot 4\\sqrt{3} = 2\\sqrt{3}$, $\\sqrt{27} = 3\\sqrt{3}$.\n$K = (6 + 5 - 2 + 3)\\sqrt{3} = 12\\sqrt{3}$, sehingga $a = 12$ dan $b = 3$. Maka $a \\cdot b = 12 \\cdot 3 = 36$.",
      },
      {
        id: 9,
        question: "Diketahui segitiga siku-siku dengan panjang sisi siku-sikunya $3 - \\sqrt{5}$ dan $3 + \\sqrt{5}$. Jika panjang sisi di depan sudut siku-sikunya adalah $h$, nilai $h$ adalah . . . .",
        options: ["\\sqrt{7}", "\\sqrt{14}", "2\\sqrt{5}", "2\\sqrt{6}", "2\\sqrt{7}"],
        correctAnswer: 4,
        explanation: "Dengan teorema Pythagoras:\n$h^2 = (3 - \\sqrt{5})^2 + (3 + \\sqrt{5})^2 = (9 - 6\\sqrt{5} + 5) + (9 + 6\\sqrt{5} + 5) = 14 + 14 = 28$.\nSuku $-6\\sqrt{5}$ dan $+6\\sqrt{5}$ saling menghapus.\n$h = \\sqrt{28} = \\sqrt{4 \\cdot 7} = 2\\sqrt{7}$.",
      },
      {
        id: 10,
        question: "Jika keliling segitiga siku-siku tersebut dinyatakan dalam $a + b\\sqrt{c}$ dengan $\\sqrt{c}$ bentuk akar paling sederhana, pernyataan yang benar adalah . . . .",
        options: [
          "a + b = 9",
          "a \\cdot b = 14",
          "a - b + c = 11",
          "b + 2c = 18",
          "c - a = 2",
        ],
        correctAnswer: 2,
        explanation: "Keliling $= (3 - \\sqrt{5}) + (3 + \\sqrt{5}) + 2\\sqrt{7} = 6 + 2\\sqrt{7}$. Jadi $a = 6, b = 2, c = 7$.\n- A: $6 + 2 = 8$ (salah)\n- B: $6 \\cdot 2 = 12$ (salah)\n- C: $a - b + c = 6 - 2 + 7 = 11$ (benar)\n- D: $2 + 14 = 16$ (salah)\n- E: $7 - 6 = 1$ (salah).",
      },
      {
        id: 11,
        question: "Diketahui $P = \\frac{6\\sqrt{3}}{2\\sqrt{3} - 3}$ dan $Q = \\frac{18}{\\sqrt{3}}$. Hasil $P - Q$ adalah . . . .",
        options: ["12", "6\\sqrt{3}", "12 + 6\\sqrt{3}", "12 + 12\\sqrt{3}", "24"],
        correctAnswer: 0,
        explanation: "Rasionalkan dengan bentuk sekawan:\n$P = \\frac{6\\sqrt{3}}{2\\sqrt{3} - 3} \\cdot \\frac{2\\sqrt{3} + 3}{2\\sqrt{3} + 3} = \\frac{36 + 18\\sqrt{3}}{12 - 9} = \\frac{36 + 18\\sqrt{3}}{3} = 12 + 6\\sqrt{3}$.\n$Q = \\frac{18}{\\sqrt{3}} \\cdot \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{18\\sqrt{3}}{3} = 6\\sqrt{3}$.\nMaka $P - Q = 12 + 6\\sqrt{3} - 6\\sqrt{3} = 12$.",
      },
      {
        id: 12,
        question: "Hubungan antara gaya suatu benda dengan massa dan percepatannya dirumuskan $F = ma$, dengan $F$ gaya dalam Newton, $m$ massa dalam $\\text{kg}$, dan $a$ percepatan dalam $\\text{m/s}^2$. Jika suatu benda diberi gaya $4\\sqrt{3}\\text{ N}$, percepatan benda yang timbul adalah $(\\sqrt{7} + \\sqrt{3})\\text{ m/s}^2$. Massa benda tersebut adalah . . . .",
        options: [
          "(\\sqrt{21} + 3)\\text{ kg}",
          "(\\sqrt{21} - 3)\\text{ kg}",
          "(4\\sqrt{21} + 12)\\text{ kg}",
          "(4\\sqrt{21} - 12)\\text{ kg}",
          "(\\sqrt{7} - \\sqrt{3})\\text{ kg}",
        ],
        correctAnswer: 1,
        explanation: "$m = \\frac{F}{a} = \\frac{4\\sqrt{3}}{\\sqrt{7} + \\sqrt{3}}$. Kalikan sekawan $(\\sqrt{7} - \\sqrt{3})$:\n$m = \\frac{4\\sqrt{3}(\\sqrt{7} - \\sqrt{3})}{7 - 3} = \\frac{4(\\sqrt{21} - 3)}{4} = (\\sqrt{21} - 3)\\text{ kg}$.",
      },
      {
        id: 13,
        question: "Diketahui $\\frac{(12^2)^3 \\cdot 25^2 \\cdot 49^2}{18^3 \\cdot 20^2 \\cdot 15^2 \\cdot 21^2} = 2^a \\cdot 3^b \\cdot 5^c \\cdot 7^d$. Nilai $a + b + 2c + 3d$ adalah . . . .",
        options: ["-1", "1", "3", "7", "9"],
        correctAnswer: 3,
        explanation: "Uraikan ke faktor prima:\n- Pembilang: $12^6 \\cdot 25^2 \\cdot 49^2 = 2^{12} \\cdot 3^6 \\cdot 5^4 \\cdot 7^4$.\n- Penyebut: $18^3 \\cdot 20^2 \\cdot 15^2 \\cdot 21^2 = (2^3 \\cdot 3^6)(2^4 \\cdot 5^2)(3^2 \\cdot 5^2)(3^2 \\cdot 7^2) = 2^7 \\cdot 3^{10} \\cdot 5^4 \\cdot 7^2$.\nHasil bagi $= 2^5 \\cdot 3^{-4} \\cdot 5^0 \\cdot 7^2$. Jadi $a = 5, b = -4, c = 0, d = 2$.\nMaka $a + b + 2c + 3d = 5 - 4 + 0 + 6 = 7$.",
      },
      {
        id: 14,
        question: "Berdasarkan informasi pada soal nomor 13 ($a = 5, b = -4, c = 0, d = 2$), pernyataan yang benar adalah . . . .",
        options: [
          "\\text{Nilai } a \\text{ bilangan negatif}",
          "\\text{Nilai } bc > d",
          "\\text{Nilai } d > ab",
          "\\text{Nilai } a < d",
          "\\text{Nilai } b + d > 0",
        ],
        correctAnswer: 2,
        explanation: "Dengan $a = 5, b = -4, c = 0, d = 2$:\n- A: $a = 5 > 0$ positif (salah)\n- B: $bc = 0$, dan $0 > 2$ (salah)\n- C: $ab = -20$, dan $2 > -20$ (benar)\n- D: $5 < 2$ (salah)\n- E: $-4 + 2 = -2$, dan $-2 > 0$ (salah).",
      },
      {
        id: 15,
        question: "Seorang peneliti mengamati pertumbuhan tanaman. Tinggi tanaman yang diharapkan pada minggu ke-$n$ memenuhi $T_n = 32 \\cdot \\left(\\frac{3}{2}\\right)^{n-1}\\text{ cm}$, dengan $n = 1$ adalah tinggi mula-mula. Pernyataan yang benar sesuai informasi tersebut adalah . . . .",
        options: [
          "\\text{Tinggi mula-mula tanaman adalah } 16\\text{ cm}",
          "T_n = 3^{n-1} \\cdot 2^{5-n}",
          "\\text{Minggu ke-}2\\text{ tinggi tanaman bertambah } 8\\text{ cm dari tinggi mula-mula}",
          "\\text{Minggu ke-}4\\text{ tinggi tanaman adalah } 3^3 \\cdot 2^3\\text{ cm}",
          "\\text{Minggu ke-}3\\text{ tinggi tanaman adalah } 3^2 \\cdot 2^3\\text{ cm}",
        ],
        correctAnswer: 4,
        explanation: "Ubah rumus: $T_n = 2^5 \\cdot \\frac{3^{n-1}}{2^{n-1}} = 3^{n-1} \\cdot 2^{6-n}$.\n- A: $T_1 = 32\\text{ cm}$ (salah)\n- B: Pangkat $2$ seharusnya $6 - n$, bukan $5 - n$ (salah)\n- C: $T_2 = 48\\text{ cm}$, bertambah $16\\text{ cm}$ (salah)\n- D: $T_4 = 3^3 \\cdot 2^2 = 108\\text{ cm}$, bukan $3^3 \\cdot 2^3$ (salah)\n- E: $T_3 = 3^2 \\cdot 2^3 = 9 \\cdot 8 = 72\\text{ cm}$ (benar).",
      },
    ],
  },
  {
    id: "mod-aljabar-2",
    districtId: 2,
    districtName: "Distrik 2 • Aljabar",
    title: "BAB 2: ALJABAR (Sistem Persamaan, Pertidaksamaan, Fungsi, Barisan & Deret)",
    subtitle: "Sistem Persamaan, Pertidaksamaan, Fungsi, Barisan & Deret",
    displayTitle: "BAB 2: ALJABAR",
    subTitle: "Sistem Persamaan, Pertidaksamaan, Fungsi, Barisan & Deret",
    tag: "Distrik Unggulan",
    categories: ["Aljabar", "SPLDV & SPLTV", "Fungsi", "Barisan & Deret", "Modul Inti"],
    xp: 400,
    xpReward: 400,
    estimatedMinutes: 25,
    durationMinutes: 25,
    quizTimeLimitMinutes: 15,
    difficulty: "Menengah",
    description: "Kuasai eliminasi SPLDV & SPLTV, daerah penyelesaian SPtLDV & program linear, konsep fungsi kuadrat & rasional, komposisi invers, serta barisan deret dan aplikasi keuangan.",
    fullDescription: "Modul komprehensif BAB 2 Aljabar: 16 slide materi terstruktur meliputi sistem persamaan linear dua & tiga variabel, program linear optimasi titik pojok, fungsi linear, kuadrat & rasional, trik invers matriks pecahan, notasi sigma, barisan & deret aritmetika/geometri, deret tak hingga, dan pemodelan keuangan eksponensial.",
    bgImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#FFD600",
    targetScore: 75,
    slides: [
      {
        id: "s-1",
        title: "BAB 2: ALJABAR",
        content: "Sistem Persamaan, Pertidaksamaan, Fungsi, Barisan & Deret. Selamat datang di modul resmi BAB 2 Aljabar! Di sini kamu akan membongkar seluruh pola aljabar mulai dari sistem persamaan multi-variabel, pemetaan daerah pertidaksamaan, karakteristik fungsi kuadrat dan asimtot rasional, komposisi invers cepat, hingga deret tak hingga dan kalkulasi bunga eksponensial.",
        formula: "\\text{Aljabar: Persamaan } \\rightarrow \\text{ Pertidaksamaan } \\rightarrow \\text{ Fungsi } \\rightarrow \\text{ Komposisi/Invers } \\rightarrow \\text{ Barisan & Deret}",
        keyTakeaways: [
          "Di aljabar, setiap variabel x pasti ada solusinya jika diproses secara runtut",
          "Kuasai 5 pilar aljabar untuk membuka skor maksimal TKA matematika",
        ],
      },
      {
        id: "s-2",
        title: "Peta Konsep Aljabar",
        content: "5 Cabang Utama Aljabar:\n1. Sistem Persamaan (SPLDV & SPLTV)\n2. Sistem Pertidaksamaan & Program Linear\n3. Konsep Fungsi (Linear, Kuadrat, Rasional)\n4. Komposisi & Invers Fungsi\n5. Barisan, Deret & Aplikasi Eksponensial",
        formula: "1.\\text{ SPLDV/SPLTV} \\longrightarrow 2.\\text{ SPtLDV} \\longrightarrow 3.\\text{ Fungsi} \\longrightarrow 4.\\text{ Komposisi/Invers} \\longrightarrow 5.\\text{ Barisan/Deret}",
        keyTakeaways: [
          "Peta konsep membantu memahami hubungan antar bab secara komprehensif",
          "Soal TKA bertingkat menggabungkan konsep fungsi dengan barisan dan deret",
        ],
      },
      {
        id: "s-3",
        title: "Sistem Persamaan Linear Dua Variabel (SPLDV)",
        content: "Bentuk Umum:\n$a_1 x + b_1 y = c_1$\n$a_2 x + b_2 y = c_2$\n\n3 Metode Penyelesaian:\n1. Eliminasi: Menyamakan koefisien satu variabel, lalu jumlahkan/kurangkan untuk menghilangkan variabel tersebut.\n2. Substitusi: Nyatakan satu variabel ke dalam bentuk variabel lain, lalu masukkan ke persamaan yang tersisa.\n3. Campuran (Cepat & Akurat): Langkah 1 eliminasi untuk mencari nilai variabel pertama, Langkah 2 substitusi hasil ke persamaan awal (cari variabel kedua).",
        formula: "\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases} \\quad \\Longrightarrow \\quad \\text{Metode Campuran: Eliminasi } \\rightarrow \\text{ Substitusi}",
        exampleProblem: "Selesaikan sistem: $2x + y = 9$ dan $x - y = 3$.",
        solution: "Jumlahkan kedua persamaan: $(2x + y) + (x - y) = 9 + 3 \\Rightarrow 3x = 12 \\Rightarrow x = 4$. Substitusikan $x = 4$ ke persamaan kedua: $4 - y = 3 \\Rightarrow y = 1$.",
        keyTakeaways: [
          "Metode campuran merupakan metode paling cepat dan paling aman dari kesalahan hitung",
        ],
      },
      {
        id: "s-4",
        title: "Sistem Persamaan Linear Tiga Variabel (SPLTV)",
        content: "Bentuk Umum:\n$a_1 x + b_1 y + c_1 z = d_1$\n$a_2 x + b_2 y + c_2 z = d_2$\n$a_3 x + b_3 y + c_3 z = d_3$\n\nAlur Solusi Emas:\n1. 3 Variabel (x, y, z): Eliminasi z dari dua pasang persamaan.\n2. 2 Variabel (SPLDV x, y): Selesaikan dengan metode campuran.\n3. 1 Variabel (Substitusi Balik): Dapatkan nilai z yang dicari.",
        formula: "\\text{3 Variabel (x, y, z)} \\xrightarrow{\\text{Eliminasi } z} \\text{2 Variabel (SPLDV)} \\xrightarrow{\\text{Campuran}} \\text{Substitusi Balik } z",
        keyTakeaways: [
          "Kunci SPLTV adalah konsistensi mengeliminasi variabel yang SAMA dari dua pasangan persamaan berbeda",
        ],
      },
      {
        id: "s-5",
        title: "Sistem Pertidaksamaan Linear (SPtLDV) & DHP",
        content: "Bentuk Umum: $ax + by < c$ (atau $>$, $\\le$, $\\ge$).\nDHP (Daerah Himpunan Penyelesaian) adalah area koordinat yang memenuhi semua syarat.\n\nLangkah Penentuan DHP:\n1. Ubah: Jadikan persamaan garis lurus ($ax + by = c$).\n2. Potong Sumbu: Cari titik potong sumbu X ($y = 0$) dan sumbu Y ($x = 0$).\n3. Uji Titik: Substitusi sembarang titik $P(x_1, y_1)$, misal titik asal $(0, 0)$.\n4. Gambar & Arsir: Garis Penuh ($\\le, \\ge$) vs Putus-putus ($<, >$).\n\nRumus Cepat Gambar Garis: Jika memotong sumbu X di $(a, 0)$ dan sumbu Y di $(0, b) \\Rightarrow bx + ay = ab$.",
        formula: "bx + ay = ab \\quad | \\quad \\text{Uji } (0,0) \\rightarrow \\text{Tentukan Daerah Bersih / Arsir}",
        keyTakeaways: [
          "Tanda pertidaksamaan dengan sama dengan ($\\le, \\ge$) digambar garis utuh/tegas",
          "Uji titik $(0,0)$ adalah cara tercepat menentukan arah arsiran",
        ],
      },
      {
        id: "s-6",
        title: "Program Linear: Optimasi (Maksimum / Minimum)",
        content: "Fungsi Kendala: Batasan sistem berupa pertidaksamaan linear (syarat non-negatif: $x \\ge 0, y \\ge 0$).\nFungsi Objektif: Target optimasi keuntungan/biaya: $Z = ax + by$.\n\n2 Metode Penentuan Nilai Optimum:\n• Metode Uji Titik Pojok (Ekstrim): 1. Gambar DHP. 2. Tentukan koordinat tiap titik sudut. 3. Substitusi ke $Z = ax + by$. Pilih nilai paling ekstrim.\n• Metode Garis Selidik: Geser garis $ax + by = k$. Geser Kanan/Atas $\\rightarrow$ Nilai Maksimum. Geser Kiri/Bawah $\\rightarrow$ Nilai Minimum.",
        formula: "Z = ax + by \\quad \\Longrightarrow \\quad \\text{Substitusi Titik-Titik Pojok DHP}",
        keyTakeaways: [
          "Nilai optimum maksimum atau minimum selalu terletak pada titik pojok (ekstrim) dari daerah DHP",
        ],
      },
      {
        id: "s-7",
        title: "Konsep Fungsi & Fungsi Linear",
        content: "Pemetaan $f: A \\rightarrow B$:\n• Domain ($D_f$): Daerah asal (Himpunan A)\n• Kodomain ($K_f$): Daerah kawan (Himpunan B)\n• Range ($R_f$): Daerah hasil (Anggota B yang punya pasangan)\n\nFungsi Linear: $f(x) = mx + c$\nGradien (kemiringan): $m = \\frac{y_2 - y_1}{x_2 - x_1}$\nPersamaan Garis: $y - y_1 = m(x - x_1)$\n\nHubungan Dua Garis:\n• Sejajar: $m_1 = m_2$\n• Tegak Lurus: $m_1 \\times m_2 = -1$\n• Berimpit: $m_1 = m_2$ & $c_1 = c_2$\n• Berpotongan: $m_1 \\ne m_2$",
        formula: "m = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad m_1 \\times m_2 = -1 \\text{ (Tegak Lurus)}, \\quad m_1 = m_2 \\text{ (Sejajar)}",
        keyTakeaways: [
          "Gradien dua garis yang saling tegak lurus memiliki hasil kali sama dengan -1",
        ],
      },
      {
        id: "s-8",
        title: "Fungsi Kuadrat & Fungsi Rasional",
        content: "1. Fungsi Kuadrat: $f(x) = ax^2 + bx + c$\n• Sifat a: $a > 0$ (Terbuka ke Atas), $a < 0$ (Terbuka ke Bawah).\n• Diskriminan ($D = b^2 - 4ac$): $D > 0$ memotong 2 titik sumbu X, $D = 0$ menyinggung sumbu X, $D < 0$ melayang di atas/bawah sumbu X.\n• Titik Puncak: $P\\left(-\\frac{b}{2a}, -\\frac{D}{4a}\\right)$.\n\n2. Fungsi Rasional (Pecahan): $f(x) = \\frac{ax + b}{cx + d}$\nGaris maya yang tidak pernah disentuh kurva:\n• Asimtot Tegak: Penyebut $= 0 \\Rightarrow x = -\\frac{d}{c}$\n• Asimtot Mendatar: Rasio koefisien $x \\Rightarrow y = \\frac{a}{c}$",
        formula: "P\\left(-\\frac{b}{2a}, -\\frac{D}{4a}\\right), \\quad x_{\\text{asimtot}} = -\\frac{d}{c}, \\quad y_{\\text{asimtot}} = \\frac{a}{c}",
        keyTakeaways: [
          "Asimtot tegak adalah nilai x pembuat nol penyebut",
          "Asimtot mendatar adalah limit rasio koefisien x saat menuju tak hingga",
        ],
      },
      {
        id: "s-9",
        title: "Komposisi & Invers Fungsi",
        content: "Komposisi Fungsi: $(f \\circ g)(x) = f(g(x))$\n• Konsep: Fungsi $g$ dikerjakan lebih dulu, hasilnya dimasukkan ke fungsi $f$.\n• Syarat: $\\text{Range}(g) \\cap \\text{Domain}(f) \\ne \\emptyset$.\n• Sifat: TIDAK Komutatif ($(f \\circ g) \\ne (g \\circ f)$).\n\nInvers Fungsi: Kebalikan pemetaan $y = f(x) \\iff x = f^{-1}(y)$.\n\nRumus Cepat Invers Rasional: Tukar posisi $a$ dan $d$, kalikan minus (-)!\nJika $f(x) = \\frac{ax + b}{cx + d} \\Rightarrow f^{-1}(x) = \\frac{-dx + b}{cx - a}$.",
        formula: "f(x) = \\frac{ax + b}{cx + d} \\quad \\Longrightarrow \\quad f^{-1}(x) = \\frac{-dx + b}{cx - a}",
        exampleProblem: "Jika $f(x) = \\frac{2x + 1}{x - 3}$, tentukan $f^{-1}(x)$.",
        solution: "Tukar $a=2$ dan $d=-3$ serta kalikan minus: $f^{-1}(x) = \\frac{-(-3)x + 1}{x - 2} = \\frac{3x + 1}{x - 2}$.",
        keyTakeaways: [
          "Tukar posisi diagonal utama dan ubah tandanya untuk invers pecahan aljabar",
        ],
      },
      {
        id: "s-10",
        title: "Notasi Sigma & Barisan Aritmetika",
        content: "Notasi Sigma ($\\Sigma$): Penjumlahan Ringkas $\\sum_{k=1}^n U_k = U_1 + U_2 + \\dots + U_n$.\n\nBarisan & Deret Aritmetika:\nPola bilangan dengan selisih/beda yang TETAP. Beda: $b = U_n - U_{n-1}$.\n• Suku ke-n: $U_n = a + (n - 1)b$\n• Jumlah n Suku Pertama ($S_n$): $S_n = \\frac{n}{2}(2a + (n - 1)b) = \\frac{n}{2}(a + U_n)$\n• Hubungan: $U_n = S_n - S_{n-1}$",
        formula: "U_n = a + (n - 1)b, \\quad S_n = \\frac{n}{2}(a + U_n), \\quad U_n = S_n - S_{n-1}",
        keyTakeaways: [
          "Rumus $U_n = S_n - S_{n-1}$ sangat sering digunakan pada soal TKA jika rumus $S_n$ diketahui",
        ],
      },
      {
        id: "s-11",
        title: "Suku Tengah & Sisipan Aritmetika",
        content: "1. Suku Tengah ($U_t$):\nJika jumlah suku barisan ganjil, suku tepat di tengah adalah:\n$U_t = \\frac{1}{2}(U_{\\text{awal}} + U_{\\text{akhir}})$\n\n2. Sisipan Bilangan:\nJika di antara dua bilangan ($p$ dan $q$) disisipkan $s$ bilangan baru sehingga membentuk barisan aritmetika baru:\n$b_{\\text{baru}} = \\frac{b_{\\text{lama}}}{s + 1} = \\frac{q - p}{s + 1}$\nBanyaknya suku baru: $n_{\\text{baru}} = n_{\\text{lama}} + (n_{\\text{lama}} - 1)s$.",
        formula: "U_t = \\frac{1}{2}(U_1 + U_n), \\quad b_{\\text{baru}} = \\frac{q - p}{s + 1}",
        keyTakeaways: [
          "Beda baru hasil sisipan selalu mengecil sebanding dengan banyaknya bilangan yang disisipkan + 1",
        ],
      },
      {
        id: "s-12",
        title: "Barisan & Deret Geometri",
        content: "Pola bilangan dengan rasio/pengali yang TETAP. Rasio: $r = \\frac{U_n}{U_{n-1}}$.\n• Suku ke-n: $U_n = a \\cdot r^{n-1}$\n• Jumlah n Suku Pertama ($S_n$):\n  - Untuk $r < 1$ (Rasio Pecahan): $S_n = \\frac{a(1 - r^n)}{1 - r}$\n  - Untuk $r > 1$ (Rasio Bulat/Besar): $S_n = \\frac{a(r^n - 1)}{r - 1}$",
        formula: "U_n = a \\cdot r^{n-1}, \\quad S_n = \\frac{a(1 - r^n)}{1 - r} \\text{ (untuk } r < 1\\text{)}",
        keyTakeaways: [
          "Pangkat pada rumus suku ke-n geometri adalah $n - 1$, bukan $n$",
        ],
      },
      {
        id: "s-13",
        title: "Deret Geometri Tak Hingga ($\\infty$)",
        content: "Menjumlahkan barisan yang ukurannya mengecil tanpa batas, atau membesar tanpa batas.\n\n1. Konvergen (Memusat):\n• Syarat: $-1 < r < 1$\n• Deret memiliki jumlah limit pasti: $S_\\infty = \\frac{a}{1 - r}$\n\n2. Divergen (Menyebar):\n• Syarat: $r \\le -1$ atau $r \\ge 1$\n• Deret membesar tanpa batas: $S_\\infty = \\pm \\infty$ (Tak Terhingga).",
        formula: "S_\\infty = \\frac{a}{1 - r} \\quad (-1 < r < 1 \\text{ Konvergen})",
        exampleProblem: "Hitung jumlah deret: $18 + 6 + 2 + \\frac{2}{3} + \\dots$",
        solution: "Suku awal $a = 18$, rasio $r = \\frac{6}{18} = \\frac{1}{3}$. Karena $|r| < 1$, maka $S_\\infty = \\frac{18}{1 - \\frac{1}{3}} = \\frac{18}{\\frac{2}{3}} = 18 \\times \\frac{3}{2} = 27$.",
        keyTakeaways: [
          "Hanya deret konvergen dengan rasio pecahan $|r| < 1$ yang memiliki nilai jumlah berhingga",
        ],
      },
      {
        id: "s-14",
        title: "Aplikasi Eksponensial & Aritmetika Keuangan",
        content: "1. Pertumbuhan (Bakteri, Populasi):\nPeningkatan konstan per periode: $A_n = A_0(1 + p)^n$\n\n2. Peluruhan (Radioaktif, Penyusutan):\nPenurunan konstan per periode: $A_n = A_0(1 - p)^n$ ($p$ = laju persentase, $n$ = periode)\n\n3. Keuangan (Bank & Investasi):\n• Bunga Majemuk: $M_n = M(1 + i)^n$\n• Bunga Tunggal: $M_n = M + (M \\cdot i \\cdot n)$\n• Nilai Tunai: $N_t = \\frac{M_n}{(1 + i)^n}$",
        formula: "A_n = A_0(1 + p)^n, \\quad A_n = A_0(1 - p)^n, \\quad M_n = M(1 + i)^n",
        keyTakeaways: [
          "Bunga majemuk menggunakan pola eksponensial (geometri)",
          "Bunga tunggal menggunakan pola pertambahan tetap linear (aritmetika)",
        ],
      },
      {
        id: "s-15",
        title: "Cheat Sheet: Master Formula Aljabar",
        content: "Rangkuman Cepat Ujian:\n• SPL & Program Linear: Garis cepat $bx + ay = ab$, objektif $Z = ax + by$, uji $(0,0)$ penentu arsiran.\n• Kuadrat & Rasional: Titik puncak $\\left(-\\frac{b}{2a}, -\\frac{D}{4a}\\right)$, Asimtot tegak $x = -\\frac{d}{c}$, mendatar $y = \\frac{a}{c}$.\n• Komposisi & Invers: $(f \\circ g)(x) = f(g(x))$, invers cepat $\\frac{ax+b}{cx+d} \\rightarrow \\frac{-dx+b}{cx-a}$.\n• Barisan Aritmetika: $U_n = a + (n - 1)b$, $S_n = \\frac{n}{2}(a + U_n)$, $b_{\\text{baru}} = \\frac{b_{\\text{lama}}}{s + 1}$.\n• Barisan Geometri: $U_n = a \\cdot r^{n-1}$, $S_n = \\frac{a(1 - r^n)}{1 - r}$, $S_\\infty = \\frac{a}{1 - r}$.\n• Aplikasi Eksponen: Pertumbuhan $A_0(1 + p)^n$, Peluruhan $A_0(1 - p)^n$, Bunga Majemuk $M(1 + i)^n$.",
        formula: "\\text{Master Formula: Linear } \\cdot \\text{ Kuadrat } \\cdot \\text{ Rasional } \\cdot \\text{ Deret } \\cdot \\text{ Finansial}",
        keyTakeaways: [
          "Simpan cheat sheet ini sebagai pegangan utama menghadapi seluruh variasi soal TKA aljabar",
        ],
      },
      {
        id: "s-16",
        title: "Bab 2 Beres! Saatnya Buktikan di Kuis",
        content: "\"Bab 2 beres! Kamu keren. Di aljabar, setiap 'x' pasti ada solusinya. Sama kayak perjuanganmu. Udah nemu polanya kan? Saatnya buktikan di kuis!\"\n\nKerjakan 10 soal evaluasi aljabar dengan tenang, gunakan trik cepat yang sudah dipelajari!",
        formula: "\\text{Konsep Aljabar Dikuasai } \\checkmark \\quad \\Longrightarrow \\quad \\text{Mulai Kuis Bab 2}",
        keyTakeaways: [
          "Siap uji kuis pemahaman",
          "Target capaian: skor minimal 75 untuk membuka badge Algebra Master",
        ],
      },
    ],
    quiz: [
      {
        id: 1,
        question: "Himpunan penyelesaian sistem persamaan linear $2x + 3y = 8$ dan $3x - y = 1$ adalah . . . .",
        options: ["(1, 2)", "(2, 1)", "(1, -2)", "(-1, 2)", "(2, -1)"],
        correctAnswer: 0,
        explanation: "Dari persamaan kedua: $y = 3x - 1$. Substitusikan ke persamaan pertama: $2x + 3(3x - 1) = 8 \\Rightarrow 2x + 9x - 3 = 8 \\Rightarrow 11x = 11 \\Rightarrow x = 1$. Maka $y = 3(1) - 1 = 2$. Jadi penyelesaiannya adalah $(1, 2)$.",
      },
      {
        id: 2,
        question: "Persamaan garis yang melalui titik potong sumbu $X$ di $(4, 0)$ dan sumbu $Y$ di $(0, 6)$ adalah . . . .",
        options: [
          "3x + 2y = 12",
          "2x + 3y = 12",
          "3x - 2y = 12",
          "2x - 3y = 12",
          "6x + 4y = 12",
        ],
        correctAnswer: 0,
        explanation: "Gunakan rumus cepat gambar garis $bx + ay = ab$ dengan $a = 4$ dan $b = 6$: $6x + 4y = 4 \\times 6 = 24$. Bagi kedua ruas dengan $2$: $3x + 2y = 12$.",
      },
      {
        id: 3,
        question: "Nilai maksimum dari fungsi objektif $Z = 4x + 5y$ pada daerah yang dibatasi oleh titik-titik pojok $(0,0)$, $(4,0)$, $(2,3)$, dan $(0,4)$ adalah . . . .",
        options: ["16", "20", "23", "25", "28"],
        correctAnswer: 2,
        explanation: "Uji nilai $Z = 4x + 5y$ pada setiap titik pojok:\n- Titik $(0,0) \\Rightarrow Z = 0$\n- Titik $(4,0) \\Rightarrow Z = 4(4) + 0 = 16$\n- Titik $(2,3) \\Rightarrow Z = 4(2) + 5(3) = 8 + 15 = 23$\n- Titik $(0,4) \\Rightarrow Z = 0 + 5(4) = 20$\nNilai maksimum adalah 23 pada titik $(2,3)$.",
      },
      {
        id: 4,
        question: "Jika garis $g_1: 2x - 4y + 5 = 0$ dan garis $g_2$ saling tegak lurus, maka gradien dari garis $g_2$ adalah . . . .",
        options: ["\\frac{1}{2}", "-\\frac{1}{2}", "2", "-2", "4"],
        correctAnswer: 3,
        explanation: "Gradien garis $g_1$: $m_1 = -\\frac{a}{b} = -\\frac{2}{-4} = \\frac{1}{2}$. Karena garis $g_2$ tegak lurus terhadap $g_1$, maka $m_1 \\times m_2 = -1 \\Rightarrow \\frac{1}{2} \\times m_2 = -1 \\Rightarrow m_2 = -2$.",
      },
      {
        id: 5,
        question: "Asimtot tegak dan asimtot mendatar dari fungsi rasional $f(x) = \\frac{3x - 5}{2x + 4}$ berturut-turut adalah . . . .",
        options: [
          "x = -2 \\text{ dan } y = \\frac{3}{2}",
          "x = 2 \\text{ dan } y = \\frac{3}{2}",
          "x = -2 \\text{ dan } y = -\\frac{5}{4}",
          "x = \\frac{5}{3} \\text{ dan } y = -2",
          "x = -4 \\text{ dan } y = 3",
        ],
        correctAnswer: 0,
        explanation: "Asimtot tegak didapat saat penyebut $= 0$: $2x + 4 = 0 \\Rightarrow x = -2$. Asimtot mendatar adalah perbandingan koefisien x: $y = \\frac{3}{2}$.",
      },
      {
        id: 6,
        question: "Diketahui $f(x) = \\frac{2x + 3}{x - 4}$ untuk $x \\ne 4$. Rumus fungsi invers $f^{-1}(x)$ adalah . . . .",
        options: [
          "\\frac{4x + 3}{x - 2}",
          "\\frac{-4x + 3}{x + 2}",
          "\\frac{4x - 3}{x + 2}",
          "\\frac{x - 4}{2x + 3}",
          "\\frac{2x - 3}{x - 4}",
        ],
        correctAnswer: 0,
        explanation: "Dengan rumus cepat $f(x) = \\frac{ax + b}{cx + d} \\Rightarrow f^{-1}(x) = \\frac{-dx + b}{cx - a}$, untuk $a = 2, b = 3, c = 1, d = -4$: $f^{-1}(x) = \\frac{-(-4)x + 3}{1x - 2} = \\frac{4x + 3}{x - 2}$.",
      },
      {
        id: 7,
        question: "Diketahui deret aritmetika dengan suku pertama $a = 5$ dan beda $b = 3$. Jumlah 20 suku pertama ($S_{20}$) adalah . . . .",
        options: ["670", "690", "710", "730", "750"],
        correctAnswer: 0,
        explanation: "Rumus $S_n = \\frac{n}{2}(2a + (n - 1)b)$. Untuk $n = 20$: $S_{20} = \\frac{20}{2}(2(5) + 19(3)) = 10(10 + 57) = 10(67) = 670$.",
      },
      {
        id: 8,
        question: "Antara bilangan 4 dan 28 disisipkan 5 bilangan sehingga terbentuk barisan aritmetika baru. Beda barisan aritmetika baru ($b_{\\text{baru}}$) tersebut adalah . . . .",
        options: ["2", "3", "4", "5", "6"],
        correctAnswer: 2,
        explanation: "Rumus sisipan: $b_{\\text{baru}} = \\frac{q - p}{s + 1} = \\frac{28 - 4}{5 + 1} = \\frac{24}{6} = 4$.",
      },
      {
        id: 9,
        question: "Jumlah deret geometri tak hingga $24 + 12 + 6 + 3 + \\dots$ adalah . . . .",
        options: ["36", "42", "48", "54", "60"],
        correctAnswer: 2,
        explanation: "Suku pertama $a = 24$, rasio $r = \\frac{12}{24} = \\frac{1}{2}$. Karena $|r| < 1$, maka $S_\\infty = \\frac{a}{1 - r} = \\frac{24}{1 - \\frac{1}{2}} = \\frac{24}{\\frac{1}{2}} = 48$.",
      },
      {
        id: 10,
        question: "Modal sebesar $\\text{Rp}10.000.000{,}00$ diinvestasikan dengan sistem bunga majemuk $10\\%$ per tahun. Besar modal tersebut pada akhir tahun ke-2 adalah . . . .",
        options: [
          "\\text{Rp}11.000.000{,}00",
          "\\text{Rp}12.000.000{,}00",
          "\\text{Rp}12.100.000{,}00",
          "\\text{Rp}12.200.000{,}00",
          "\\text{Rp}13.310.000{,}00",
        ],
        correctAnswer: 2,
        explanation: "Rumus bunga majemuk $M_n = M(1 + i)^n$. Untuk $M = 10.000.000, i = 0{,}10, n = 2$: $M_2 = 10.000.000(1 + 0{,}10)^2 = 10.000.000(1{,}1)^2 = 10.000.000 \\times 1{,}21 = \\text{Rp}12.100.000{,}00$.",
      },
    ],
  },
  {
    id: "mod-geometri-1",
    districtId: 3,
    districtName: "Distrik 3 • Geometri dan Pengukuran",
    title: "BAB 3: GEOMETRI DAN PENGUKURAN (Sudut, Pythagoras, Bangun Ruang & Transformasi)",
    subtitle: "Hubungan Sudut, Kesebangunan, Pythagoras, Bangun Datar/Ruang & Transformasi Geometri",
    displayTitle: "BAB 3: GEOMETRI DAN PENGUKURAN",
    subTitle: "Peta Jalan Geometri: Dari Garis Transversal Hingga Matriks Transformasi",
    tag: "Distrik Unggulan",
    categories: ["Geometri", "Dimensi Tiga", "Transformasi", "Pengukuran 2D & 3D", "Modul Inti"],
    xp: 400,
    xpReward: 400,
    estimatedMinutes: 25,
    durationMinutes: 25,
    quizTimeLimitMinutes: 15,
    difficulty: "Lanjut",
    description: "Kuasai sudut transversal, kesebangunan & Pythagoras, pengukuran 2D/3D kubus rusuk a, proyeksi tegak lurus dimensi tiga, dan komposisi matriks transformasi.",
    fullDescription: "Modul resmi BAB 3 Geometri dan Pengukuran: 15 slide interaktif membedah garis transversal sehadap/berseberangan/sepihak, kesebangunan vs kongruensi, dashboard luas & volume 2D/3D, jarak titik ke garis dan bidang kubus ABCD.EFGH, matriks translasi, refleksi, rotasi, dilatasi, tripel Pythagoras cepat, serta telaah soal TKA berbobot tinggi.",
    bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#FF007A",
    targetScore: 75,
    slides: [
      {
        id: "s-1",
        title: "BAB 3: GEOMETRI DAN PENGUKURAN",
        content: "3 Pilar Utama:\nA. Hubungan Sudut, Kesebangunan, dan Pythagoras\nB. Bangun Datar, Bangun Ruang, dan Pengukuran\nC. Transformasi Geometri\n\nSelamat datang di modul resmi BAB 3 Geometri dan Pengukuran! Di sini kamu akan mempelajari cara melihat bangun spasial secara visual sekaligus menghitungnya dengan presisi aljabar.",
        formula: "\\text{Pilar 1: Sudut & Pythagoras } \\longrightarrow \\text{ Pilar 2: 2D & 3D } \\longrightarrow \\text{ Pilar 3: Transformasi Geometri}",
        keyTakeaways: [
          "Geometri menghubungkan intuisi visual spasial dengan kalkulasi aljabar terstruktur",
          "Kuasai 3 pilar ini untuk menyelesaikan soal TKA dimensi tiga dan geometri",
        ],
      },
      {
        id: "s-2",
        title: "Peta Jalan Geometri",
        content: "Tahapan Pembelajaran Terstruktur:\n• Tahap 1: Dasar Geometri (Hubungan Sudut & Segitiga 1 Dimensi & 2 Dimensi)\n• Tahap 2: Pengukuran Ruang (Luas, Volume, & Jarak 3 Dimensi)\n• Tahap 3: Pergerakan (Matriks Transformasi & Komposisi)\n\nTujuan Akhir: Memecahkan Soal TKA Multi-Langkah.",
        formula: "\\text{Tahap 1: Sudut/Segitiga} \\longrightarrow \\text{Tahap 2: Volume/3D} \\longrightarrow \\text{Tahap 3: Matriks Transformasi}",
        keyTakeaways: [
          "Mulai dari fondasi garis dan sudut, meluas ke ruang 3D, hingga transformasi dinamis matriks",
        ],
      },
      {
        id: "s-3",
        title: "Garis Transversal & Relasi Sudut",
        content: "Dua Garis Sejajar Dipotong Garis Transversal:\n• Sehadap: Menghadap arah yang sama $\\rightarrow$ Besar SAMA (contoh $\\angle CGE = \\angle AHG = 60^\\circ$).\n• Berseberangan (Dalam/Luar): Silang dari garis transversal $\\rightarrow$ Besar SAMA.\n• Sepihak (Dalam/Luar): Di sisi transversal yang sama $\\rightarrow$ Jumlah $= 180^\\circ$.\n\nJebakan Umum: Ingat, HANYA sudut SEPIHAK yang dijumlahkan menjadi $180^\\circ$, sisanya bernilai SAMA BESAR.",
        formula: "\\text{Sehadap: } \\alpha = \\beta, \\quad \\text{Berseberangan: } \\alpha = \\beta, \\quad \\text{Sepihak: } \\alpha + \\beta = 180^\\circ",
        keyTakeaways: [
          "Sudut sepihak berjumlah 180°, sedangkan sudut sehadap dan berseberangan nilainya identik sama besar",
        ],
      },
      {
        id: "s-4",
        title: "Kesebangunan, Kongruensi & Pythagoras",
        content: "1. Sebangun (Kesebangunan):\n• Sudut sama besar, rasio perbandingan sisi proporsional.\n• Contoh: Dua segitiga dengan sudut $60^\\circ, 40^\\circ, 80^\\circ$ pasti sebangun meski ukurannya berbeda.\n\n2. Kongruen (Kekongruenan):\n• Bentuk persis sama, ukuran persis sama (Rasio 1:1).\n• Prinsip Emas: Semua yang KONGRUEN pasti SEBANGUN. Namun yang SEBANGUN, belum tentu KONGRUEN!\n\n3. Teorema Pythagoras:\n$a^2 + b^2 = c^2$. Sisi miring (hipotenusa $c$) adalah sisi terpanjang di seberang sudut siku-siku.",
        formula: "a^2 + b^2 = c^2, \\quad \\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} \\text{ (Sebangun)}",
        keyTakeaways: [
          "Semua bangun kongruen pasti sebangun, tetapi yang sebangun belum tentu kongruen",
          "Teorema Pythagoras adalah alat bantu utama memecah persoalan bangun datar dan ruang",
        ],
      },
      {
        id: "s-5",
        title: "Dashboard Pengukuran: 2D & 3D",
        content: "Bangun Datar (2 Dimensi):\n• Trapesium: $\\text{Luas} = \\frac{(a + b) \\times t}{2}$\n• Lingkaran: $\\text{Luas} = \\pi r^2$, $\\text{Keliling} = 2\\pi r$\n\nBangun Ruang (3 Dimensi):\n• Tabung: $\\text{Volume} = \\pi r^2 t$, $\\text{Luas Permukaan} = 2\\pi r(r + t)$\n• Pola Cepat Kubus (Rusuk $a$):\n  - $\\text{Volume} = a^3$\n  - $\\text{Luas Permukaan} = 6a^2$\n  - $\\text{Panjang Diagonal Sisi} = a\\sqrt{2}$\n  - $\\text{Panjang Diagonal Ruang} = a\\sqrt{3}$",
        formula: "\\text{Diagonal Sisi} = a\\sqrt{2}, \\quad \\text{Diagonal Ruang} = a\\sqrt{3}, \\quad V = a^3, \\quad L = 6a^2",
        keyTakeaways: [
          "Hafal pola kubus: diagonal sisi selalu $a\\sqrt{2}$ dan diagonal ruang selalu $a\\sqrt{3}$",
        ],
      },
      {
        id: "s-6",
        title: "Dimensi Tiga: Rahasia Mencari Jarak",
        content: "Jarak adalah lintasan terpendek. Kuncinya selalu mencari proyeksi tegak lurus dari titik asal ke target.\n\n1. Titik ke Garis: Tarik ruas garis dari titik $T$ tegak lurus garis $g$ di titik $T'$ ($TT' \\perp g$).\n2. Titik ke Bidang: Panjang ruas garis tegak lurus dari titik $T$ ke bidang $V$.\n3. Garis ke Garis (Bersilangan): Geser salah satu garis hingga memotong garis lainnya untuk mencari sudut atau jarak tegak lurusnya.\n\nStrategi Emas 3D: Proyeksi tegak lurus memecah masalah 3 Dimensi yang rumit menjadi segitiga 2 Dimensi (siku-siku) yang bisa diselesaikan dengan Pythagoras.",
        formula: "\\text{Jarak 3D} \\xrightarrow{\\text{Proyeksi Tegak Lurus}} \\text{Segitiga 2D Siku-Siku} \\xrightarrow{\\text{Pythagoras}} \\text{Hasil Jarak}",
        keyTakeaways: [
          "Jangan bayangkan ruang 3D secara abstrak; tarik garis proyeksi dan buat segitiga bantuan 2D",
        ],
      },
      {
        id: "s-7",
        title: "Matriks Transformasi (Bagian I)",
        content: "Tabel Matriks Pemetaan:\n• Translasi (Pergeseran): $T = \\begin{bmatrix} a \\\\ b \\end{bmatrix} \\rightarrow (x + a, y + b)$\n• Refleksi Sumbu X: $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix} \\rightarrow (x, -y)$\n• Refleksi Sumbu Y: $\\begin{bmatrix} -1 & 0 \\\\ 0 & 1 \\end{bmatrix} \\rightarrow (-x, y)$\n• Refleksi Garis $y = x$: $\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix} \\rightarrow (y, x)$\n• Refleksi Titik Asal $(0,0)$: $\\begin{bmatrix} -1 & 0 \\\\ 0 & -1 \\end{bmatrix} \\rightarrow (-x, -y)$",
        formula: "T_{\\text{sumbu } x} = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}, \\quad T_{\\text{sumbu } y} = \\begin{bmatrix} -1 & 0 \\\\ 0 & 1 \\end{bmatrix}, \\quad T_{y=x} = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}",
        keyTakeaways: [
          "Refleksi garis y = x membalik posisi variabel koordinat menjadi (y, x)",
        ],
      },
      {
        id: "s-8",
        title: "Matriks Transformasi (Bagian II) & Komposisi",
        content: "1. Rotasi (Perputaran) Pusat $(0,0)$ sebesar $\\theta$:\n$\\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}$\n($\\theta > 0$ berlawanan arah jarum jam, $\\theta < 0$ searah jarum jam).\n\n2. Dilatasi (Perkalian Ukuran) Pusat $(0,0)$ faktor skala $k$:\n$\\begin{bmatrix} k & 0 \\\\ 0 & k \\end{bmatrix}$\n\n3. Komposisi Matriks Transformasi:\nJika $T_1$ dilanjutkan $T_2$, maka rumusnya: $T_2 \\circ T_1 = T_2 \\times T_1$.\nHATI-HATI URUTAN! Komposisi $T_1$ lalu $T_2$ dikerjakan dengan mengalikan matriks secara TERBALIK dari kanan ke kiri: $[\\text{Matriks } T_2] \\times [\\text{Matriks } T_1]$.",
        formula: "T_2 \\circ T_1 = T_2 \\times T_1, \\quad R_\\theta = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}, \\quad D_k = \\begin{bmatrix} k & 0 \\\\ 0 & k \\end{bmatrix}",
        keyTakeaways: [
          "Urutan pengerjaan komposisi transformasi selalu dari kanan ke kiri ($T_2 \\times T_1$)",
        ],
      },
      {
        id: "s-9",
        title: "Tripel Pythagoras & Jalan Pintas Translasi",
        content: "Tripel Pythagoras Cepat:\nJangan buang waktu menghitung kuadrat jika menemui pasangan:\n• $(3, 4, 5)$ dan kelipatannya $(6, 8, 10), (9, 12, 15)$\n• $(5, 12, 13)$ dan kelipatannya $(10, 24, 26)$\n• $(7, 24, 25)$ dan $(8, 15, 17)$\nContoh: $\\triangle ABC$ siku-siku memiliki sisi tegak $5\\text{ cm}$ dan $12\\text{ cm}$. Tanpa menghitung, sisi miring $AC$ pasti $13\\text{ cm}$.\n\nJalan Pintas Komposisi Translasi:\nTidak perlu pusing mengalikan matriks! Jika $T_1$ dilanjutkan $T_2$, cukup dijumlahkan biasa:\n$T_1 + T_2 = \\begin{bmatrix} a_1 + a_2 \\\\ b_1 + b_2 \\end{bmatrix}$\n\nMentalitas Ujian: Menguasai jalan pintas ini akan menghemat 2-3 menit per soal saat ujian.",
        formula: "T_1 + T_2 = \\begin{bmatrix} a_1 + a_2 \\\\ b_1 + b_2 \\end{bmatrix}, \\quad \\text{Tripel: } (3,4,5), (5,12,13), (7,24,25)",
        keyTakeaways: [
          "Menghafal tripel Pythagoras menghemat banyak waktu berhitung di ujian",
          "Translasi berurutan cukup dijumlahkan masing-masing komponen x dan y",
        ],
      },
      {
        id: "s-10",
        title: "AWAS! Jebakan Ujian yang Sering Terjadi",
        content: "Nilai aljabar ($x$) yang ditemukan TIDAK SELALU menjadi jawaban final yang masuk akal di dunia nyata geometri.\n\nKasus 1: Sudut Negatif\nFaktorisasi persamaan sudut menghasilkan $x = 6$ atau $x = -24$.\nJika kita masukkan $x = -24$ ke dalam persamaan sudut, hasilnya menjadi NEGATIF.\nKesimpulan: Sudut fisik tidak mungkin negatif $\\Rightarrow x = -24$ WAJIB ditolak!\n\nKasus 2: Panjang Sisi Negatif\nFaktorisasi persamaan sisi segitiga menghasilkan $x = 3$ atau $x = -2$.\nJika $x = -2$ dimasukkan, panjang sisi bernilai nol atau negatif.\nKesimpulan: Panjang tidak mungkin $\\le 0 \\Rightarrow x = -2$ WAJIB ditolak.\n\nSelalu substitusikan kembali nilai $x$ yang kamu temukan ke variabel asli untuk memastikan logikanya berjalan.",
        formula: "\\text{Panjang Sisi } > 0, \\quad \\text{Besar Sudut } > 0^\\circ \\quad \\Longrightarrow \\quad \\text{Tolak Solusi Negatif}",
        keyTakeaways: [
          "Selalu uji kembali nilai variabel aljabar ke kondisi geometri nyata (panjang dan sudut selalu positif)",
        ],
      },
      {
        id: "s-11",
        title: "Telaah Soal: Kesebangunan dalam Kehidupan Nyata",
        content: "Kasus: Sebuah tiang bendera membentuk bayangan $4{,}5\\text{ m}$. Pada saat bersamaan, tongkat $1{,}2\\text{ m}$ membentuk bayangan $1{,}5\\text{ m}$. Berapa tinggi bendera?\n\n• Langkah 1: Visualisasi (Kedua segitiga siku-siku sebangun)\n• Langkah 2: Strategi (Gunakan rasio perbandingan sisi tegak dan sisi mendatar):\n  $\\frac{\\text{Tinggi Bendera}}{\\text{Tinggi Tongkat}} = \\frac{\\text{Bayangan Bendera}}{\\text{Bayangan Tongkat}}$\n• Langkah 3: Eksekusi:\n  $\\frac{T}{1{,}2} = \\frac{4{,}5}{1{,}5} \\Rightarrow T = \\frac{4{,}5 \\times 1{,}2}{1{,}5} = 3 \\times 1{,}2 = 3{,}6\\text{ meter}$!",
        formula: "\\frac{T}{1{,}2} = \\frac{4{,}5}{1{,}5} \\quad \\Longrightarrow \\quad T = 3{,}6\\text{ meter}",
        exampleProblem: "Sebuah pohon menghasilkan bayangan 12 meter saat tongkat 2 meter menghasilkan bayangan 3 meter. Berapa tinggi pohon?",
        solution: "T/2 = 12/3 = 4 => T = 4 x 2 = 8 meter.",
        keyTakeaways: [
          "Sketsa segitiga siku-siku sebangun menyederhanakan soal cerita tinggi dan bayangan",
        ],
      },
      {
        id: "s-12",
        title: "Telaah Soal: Membedah Jarak Dimensi Tiga",
        content: "Kasus: Kubus $ABCD.EFGH$ dengan rusuk $9\\text{ cm}$. Tentukan jarak titik $E$ ke diagonal ruang $AG$.\n\n• Langkah 1: Identifikasi 3D\n  Jarak $E$ ke $AG$ adalah proyeksi tegak lurus garis $EO$.\n• Langkah 2: Bantuan 2D & Eksekusi\n  Lihat segitiga siku-siku $AEG$ (siku-siku di $E$):\n  - $AE = 9\\text{ cm}$ (rusuk)\n  - $EG = 9\\sqrt{2}\\text{ cm}$ (diagonal sisi)\n  - $AG = 9\\sqrt{3}\\text{ cm}$ (diagonal ruang)\n  Gunakan perbandingan luas segitiga $AEG$:\n  $\\frac{1}{2} \\times AG \\times EO = \\frac{1}{2} \\times AE \\times EG$\n  $EO = \\frac{AE \\times EG}{AG} = \\frac{9 \\times 9\\sqrt{2}}{9\\sqrt{3}} = \\frac{9\\sqrt{2}}{\\sqrt{3}} \\times \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{9\\sqrt{6}}{3} = 3\\sqrt{6}\\text{ cm}$.",
        formula: "EO = \\frac{AE \\times EG}{AG} = \\frac{9 \\times 9\\sqrt{2}}{9\\sqrt{3}} = 3\\sqrt{6}\\text{ cm}",
        keyTakeaways: [
          "Gunakan kesamaan luas segitiga siku-siku: $\\frac{1}{2} \\times c \\times t = \\frac{1}{2} \\times a \\times b$",
        ],
      },
      {
        id: "s-13",
        title: "Telaah Soal: Rahasia Substitusi Transformasi Garis",
        content: "Kasus: Refleksi terhadap $y = -3$ dilanjutkan rotasi $270^\\circ$ menghasilkan bayangan $6x - 3y + 9 = 0$. Cari gradien persamaan semula!\n\n1. Temukan Matriks Bayangan:\n   $(x, y) \\xrightarrow{\\text{Refleksi } y=-3} (x, -(y + 3) + (-3)) = (x, -y - 6) \\xrightarrow{\\text{Rotasi } 270^\\circ} (y'', -x'') = (-y - 6, -x)$.\n   Maka $x'' = y + 6$ dan $y'' = -x$.\n2. Isolasi Variabel Awal (The Trick!):\n   $y = x'' - 6$ dan $x = -y''$.\n3. Substitusi Terbalik ke Persamaan Bayangan:\n   $6(-y'') - 3(x'' - 6) + 9 = 0$\n   $-6y'' - 3x'' + 18 + 9 = 0 \\Rightarrow -3x'' - 6y'' + 27 = 0$.\n   Gradien semula $m = -\\frac{\\text{Koefisien } x}{\\text{Koefisien } y} = -\\frac{-3}{-6} = -\\frac{1}{2}$!",
        formula: "x'' = y + 6, \\quad y'' = -x \\quad \\Longrightarrow \\quad \\text{Gradien } m = -\\frac{1}{2}",
        keyTakeaways: [
          "Selalu selesaikan persamaan untuk mencari x dan y polos terlebih dahulu, lalu substitusikan",
        ],
      },
      {
        id: "s-14",
        title: "Rangkuman Esensial",
        content: "3 Pilar Utama:\n1. Fondasi 2D:\n   • Tripel Pythagoras Cepat: $(3,4,5), (5,12,13), (7,24,25)$\n   • Aturan Transversal: Sudut sepihak $= 180^\\circ$, sisanya (sehadap/berseberangan) sama besar.\n2. Proyeksi 3D:\n   • Pola Kubus Rusuk a: Diagonal sisi $a\\sqrt{2}$, Diagonal ruang $a\\sqrt{3}$.\n   • Kunci 3D: Selalu cari Segitiga Bantuan 2D dan tarik garis proyeksi tegak lurus ($90^\\circ$).\n3. Matriks Transformasi:\n   • Rumus Komposisi: $T_2 \\circ T_1 = T_2 \\times T_1$ (kerjakan dari sisi kanan!).\n   • Rotasi $90^\\circ$: $\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$.",
        formula: "\\text{Pilar: Tripel Pythagoras } \\cdot \\text{ Pola Kubus } (a\\sqrt{2}, a\\sqrt{3}) \\cdot \\text{ Komposisi Matriks } T_2 \\times T_1",
        keyTakeaways: [
          "Kuasai 3 pilar ini untuk menjawab soal UTBK/TKA geometri dalam waktu kurang dari 90 detik per soal",
        ],
      },
      {
        id: "s-15",
        title: "Konsep Dikuasai. Saatnya Beraksi!",
        content: "Selamat! Anda telah memahami hubungan sudut, cara menembus dimensi tiga, dan logika di balik matriks transformasi. Jangan biarkan konsep ini menguap.\n\nIngat: Matematika bukan tentang menjadi cepat, tapi tentang menjadi terstruktur. Gambarlah sketsamu, dan biarkan logikamu bekerja. Saatnya uji kemampuanmu di kuis evaluasi!",
        formula: "\\text{Geometri Dikuasai } \\checkmark \\quad \\Longrightarrow \\quad \\text{Mulai Kuis Bab 3}",
        keyTakeaways: [
          "Siap uji kuis pemahaman",
          "Target capaian: skor minimal 75 untuk membuka badge Spatial Geometry Master",
        ],
      },
    ],
    quiz: [
      {
        id: 1,
        question: "Dua garis sejajar dipotong oleh garis transversal. Jika salah satu sudut sepihak dalam bernilai $75^\\circ$, maka besar sudut sepihak pasangannya adalah . . . .",
        options: ["75^\\circ", "105^\\circ", "115^\\circ", "125^\\circ", "150^\\circ"],
        correctAnswer: 1,
        explanation: "Sifat sudut sepihak (dalam maupun luar) adalah jumlah kedua sudut sama dengan $180^\\circ$. Maka besar pasangannya $= 180^\\circ - 75^\\circ = 105^\\circ$.",
      },
      {
        id: 2,
        question: "Diberikan segitiga siku-siku dengan panjang sisi tegak $7\\text{ cm}$ dan sisi miring $25\\text{ cm}$. Panjang sisi alas segitiga tersebut adalah . . . .",
        options: ["18\\text{ cm}", "20\\text{ cm}", "24\\text{ cm}", "22\\text{ cm}", "26\\text{ cm}"],
        correctAnswer: 2,
        explanation: "Berdasarkan tripel Pythagoras $(7, 24, 25)$ atau dengan rumus Pythagoras: alas $= \\sqrt{25^2 - 7^2} = \\sqrt{625 - 49} = \\sqrt{576} = 24\\text{ cm}$.",
      },
      {
        id: 3,
        question: "Sebuah gedung memiliki bayangan sepanjang $18\\text{ m}$. Pada waktu yang sama, sebuah tiang listrik setinggi $4\\text{ m}$ menghasilkan bayangan $3\\text{ m}$. Tinggi gedung tersebut adalah . . . .",
        options: ["20\\text{ m}", "24\\text{ m}", "27\\text{ m}", "30\\text{ m}", "32\\text{ m}"],
        correctAnswer: 1,
        explanation: "Gunakan konsep kesebangunan segitiga:\n$\\frac{\\text{Tinggi Gedung}}{\\text{Tinggi Tiang}} = \\frac{\\text{Bayangan Gedung}}{\\text{Bayangan Tiang}} \\Rightarrow \\frac{T}{4} = \\frac{18}{3} = 6 \\Rightarrow T = 6 \\times 4 = 24\\text{ meter}$.",
      },
      {
        id: 4,
        question: "Panjang diagonal ruang kubus $ABCD.EFGH$ dengan panjang rusuk $6\\text{ cm}$ adalah . . . .",
        options: ["6\\sqrt{2}\\text{ cm}", "6\\sqrt{3}\\text{ cm}", "12\\text{ cm}", "3\\sqrt{6}\\text{ cm}", "9\\text{ cm}"],
        correctAnswer: 1,
        explanation: "Untuk kubus dengan panjang rusuk $a$, panjang diagonal sisi adalah $a\\sqrt{2}$ dan panjang diagonal ruang adalah $a\\sqrt{3}$. Dengan $a = 6\\text{ cm}$, maka diagonal ruang $= 6\\sqrt{3}\\text{ cm}$.",
      },
      {
        id: 5,
        question: "Diketahui kubus $ABCD.EFGH$ memiliki rusuk $6\\text{ cm}$. Jarak titik $A$ ke bidang $BDHF$ adalah . . . .",
        options: ["3\\text{ cm}", "3\\sqrt{2}\\text{ cm}", "6\\text{ cm}", "3\\sqrt{3}\\text{ cm}", "6\\sqrt{2}\\text{ cm}"],
        correctAnswer: 1,
        explanation: "Proyeksi tegak lurus titik $A$ ke bidang $BDHF$ jatuh pada titik perpotongan diagonal alas $AC$ dan $BD$, yaitu titik tengah $AC$. Jaraknya $= \\frac{1}{2} \\times \\text{panjang diagonal sisi } AC = \\frac{1}{2} \\times 6\\sqrt{2} = 3\\sqrt{2}\\text{ cm}$.",
      },
      {
        id: 6,
        question: "Pada kubus $ABCD.EFGH$ dengan panjang rusuk $9\\text{ cm}$, jarak titik $E$ ke diagonal ruang $AG$ adalah . . . .",
        options: ["3\\sqrt{3}\\text{ cm}", "3\\sqrt{6}\\text{ cm}", "6\\sqrt{2}\\text{ cm}", "4\\sqrt{3}\\text{ cm}", "9\\sqrt{2}\\text{ cm}"],
        correctAnswer: 1,
        explanation: "Perhatikan segitiga siku-siku $AEG$ dengan siku-siku di $E$. Jarak titik $E$ ke diagonal ruang $AG$ adalah tinggi $EO$:\n$EO = \\frac{AE \\times EG}{AG} = \\frac{9 \\times 9\\sqrt{2}}{9\\sqrt{3}} = \\frac{9\\sqrt{2}}{\\sqrt{3}} \\times \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{9\\sqrt{6}}{3} = 3\\sqrt{6}\\text{ cm}$.",
      },
      {
        id: 7,
        question: "Bayangan titik $P(3, -5)$ oleh translasi $T = \\begin{bmatrix} -2 \\\\ 7 \\end{bmatrix}$ adalah . . . .",
        options: ["(1, 2)", "(5, -12)", "(1, -12)", "(-1, 2)", "(5, 2)"],
        correctAnswer: 0,
        explanation: "Translasi menambahkan setiap komponen koordinat: $x' = 3 + (-2) = 1$ dan $y' = -5 + 7 = 2$. Jadi bayangannya adalah $P'(1, 2)$.",
      },
      {
        id: 8,
        question: "Bayangan titik $Q(-4, 2)$ setelah direfleksikan terhadap garis $y = x$ adalah . . . .",
        options: ["(2, -4)", "(-2, 4)", "(4, -2)", "(-4, -2)", "(2, 4)"],
        correctAnswer: 0,
        explanation: "Refleksi terhadap garis $y = x$ membalikkan posisi koordinat $(x, y) \\rightarrow (y, x)$. Maka $(-4, 2) \\rightarrow (2, -4)$.",
      },
      {
        id: 9,
        question: "Titik $A(2, 1)$ dirotasikan sebesar $90^\\circ$ berlawanan arah jarum jam dengan pusat $(0,0)$. Koordinat bayangan titik $A$ adalah . . . .",
        options: ["(-1, 2)", "(1, -2)", "(-2, 1)", "(2, -1)", "(-1, -2)"],
        correctAnswer: 0,
        explanation: "Matriks rotasi $90^\\circ$ dengan pusat $(0,0)$ adalah $\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$. Maka bayangannya: $(x', y') = (-y, x) = (-1, 2)$.",
      },
      {
        id: 10,
        question: "Jika translasi $T_1 = \\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix}$ dilanjutkan dengan translasi $T_2 = \\begin{bmatrix} -1 \\\\ 5 \\end{bmatrix}$, maka matriks translasi tunggal pengganti komposisi tersebut adalah . . . .",
        options: [
          "\\begin{bmatrix} 2 \\\\ 4 \\end{bmatrix}",
          "\\begin{bmatrix} 4 \\\\ 4 \\end{bmatrix}",
          "\\begin{bmatrix} -2 \\\\ 6 \\end{bmatrix}",
          "\\begin{bmatrix} 2 \\\\ -6 \\end{bmatrix}",
          "\\begin{bmatrix} -3 \\\\ -5 \\end{bmatrix}",
        ],
        correctAnswer: 0,
        explanation: "Komposisi translasi bertingkat dihitung dengan menjumlahkan elemen yang bersesuaian: $T = T_1 + T_2 = \\begin{bmatrix} 3 + (-1) \\\\ -1 + 5 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 4 \\end{bmatrix}$.",
      },
    ],
  },
  {
    id: "mod-trigo-1",
    districtId: 4,
    districtName: "Distrik 4 • Navigasi Sudut & Trigonometri",
    title: "BAB 4: Navigasi Sudut, Dimensi & Ruang Koordinat",
    subtitle: "Skala Sudut, Komputasi Segitiga, Kompas Kuadran & Koordinat Kutub",
    displayTitle: "BAB 4: Navigasi Sudut & Trigonometri",
    subTitle: "Navigator's Toolkit: Dari Skala Sudut Hingga Soal UTBK Multi-Langkah",
    tag: "Distrik Unggulan",
    categories: ["Trigonometri", "Level 4", "Modul Inti", "Navigator's Toolkit"],
    xp: 450,
    xpReward: 450,
    estimatedMinutes: 25,
    durationMinutes: 25,
    difficulty: "TKA",
    description: "Kuasai 4 instrumen inti trigonometri: konversi derajat-radian, perbandingan De-Mi Sa-Mi De-Sa, kompas teritori kuadran, aturan sudut berelasi k·90°, dan konversi koordinat kutub-kartesius.",
    fullDescription: "Modul interaktif lengkap BAB 4 Trigonometri yang menyajikan peta navigasi matematis: membaca skala sudut putaran, mnemonik segitiga siku-siku, jembatan keledai kuadran SEMUA-SIN-TAN-COS, matriks keputusan sudut berelasi, dan telaah soal UTBK multi-langkah.",
    bgImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#38BDF8",
    targetScore: 75,
    slides: [
      {
        id: "s-1",
        title: "BAB 4: TRIGONOMETRI (Navigasi Sudut, Dimensi & Ruang Koordinat)",
        content: "Selamat datang di modul BAB 4 Trigonometri. Modul ini membekali kamu dengan Navigator's Toolkit untuk memahami sudut dari tingkat rotasi mikro, perbandingan segitiga siku-siku, kompas teritori kuadran, hingga koordinat kutub-kartesius untuk menyelesaikan soal UTBK & TKA multi-langkah.",
        formula: "\\text{Peta Sudut } \\rightarrow \\text{ Segitiga } \\rightarrow \\text{ Kompas Kuadran } \\rightarrow \\text{ Koordinat Kutub}",
        keyTakeaways: [
          "Trigonometri bukan sekadar hafalan rumus, melainkan navigasi logika spasial yang runtut",
          "Kuasai 4 instrumen inti untuk membuka skor maksimal TKA matematika",
        ],
      },
      {
        id: "s-2",
        title: "Peta Jalan Navigasi Trigonometri",
        content: "4 Pilar Navigasi Belajar:\n1. Alat Ukur Dasar (Derajat, Menit, Detik & Radian)\n2. Komputasi Segitiga (Perbandingan Sin, Cos, Tan)\n3. Kompas Kuadran (Relasi Sudut 90°, 180°, 270°, 360°)\n4. Peta Translasi (Konversi Koordinat Kutub & Kartesius)\n\nTujuan Akhir: Menyelesaikan Soal UTBK & TKA Multi-Langkah.",
        formula: "1.\\text{ Alat Ukur} \\longrightarrow 2.\\text{ Segitiga} \\longrightarrow 3.\\text{ Kuadran} \\longrightarrow 4.\\text{ Translasi Koordinat}",
        keyTakeaways: [
          "Alat Ukur Dasar mengonversi putaran fisik ke radian",
          "Kompas kuadran menentukan tanda positif/negatif dalam 1 detik",
          "Koordinat kutub menerjemahkan jarak dan arah ke posisi kartesius",
        ],
      },
      {
        id: "s-3",
        title: "Instrumen 1: Membaca Skala Sudut & Matriks Konversi Emas",
        content: "Sistem Derajat: 1 putaran penuh = 360°. Skala Mikro: 1° = 60' (menit busur) dan 1' = 60\" (detik busur).\n\nSistem Radian: Mengukur perbandingan panjang busur (s) terhadap jari-jari lingkaran (r), dengan formula: α rad = s / r.\n\nMatriks Konversi Emas: 180° = π rad  =>  1 rad = 180°/π  =>  1° = π/180 rad.",
        formula: "180^\\circ = \\pi\\text{ rad} \\quad \\Longleftrightarrow \\quad 1\\text{ rad} = \\frac{180^\\circ}{\\pi} \\quad \\Longleftrightarrow \\quad 1^\\circ = \\frac{\\pi}{180}\\text{ rad}",
        keyTakeaways: [
          "1 putaran penuh = 360° = 2π radian",
          "Untuk mengubah derajat ke radian: kalikan dengan π/180",
          "Untuk mengubah radian ke derajat: kalikan dengan 180/π",
        ],
      },
      {
        id: "s-4",
        title: "Instrumen 2: Komputasi Segitiga Siku-Siku (De-Mi, Sa-Mi, De-Sa)",
        content: "Pada segitiga siku-siku ABC dengan sudut acuan α di titik A, sisi depan sudut adalah a, sisi samping alas adalah b, dan sisi miring terpanjang (hipotenusa) adalah c.\n\nMnemonik Emas:\n• sin α = Sisi Depan / Sisi Miring = a / c (De - Mi)\n• cos α = Sisi Samping / Sisi Miring = b / c (Sa - Mi)\n• tan α = Sisi Depan / Sisi Samping = a / b (De - Sa)",
        formula: "\\sin\\alpha = \\frac{\\text{Depan}}{\\text{Miring}}, \\quad \\cos\\alpha = \\frac{\\text{Samping}}{\\text{Miring}}, \\quad \\tan\\alpha = \\frac{\\text{Depan}}{\\text{Samping}}",
        keyTakeaways: [
          "De-Mi, Sa-Mi, De-Sa adalah fondasi terpenting trigonometri",
          "Teorema Pythagoras selalu berlaku: a² + b² = c²",
        ],
      },
      {
        id: "s-5",
        title: "Jalan Pintas: Jangan Hafalkan Ulang, Cukup Balikkan!",
        content: "Ketiga perbandingan kebalikan (resiprokal) tidak perlu dihafalkan sebagai rumus baru, cukup balikkan pecahan dari sin, cos, dan tan:\n\n• sin α dibalik menjadi ➔ cosec α = miring / depan = c / a (Mi-De)\n• cos α dibalik menjadi ➔ sec α = miring / samping = c / b (Mi-Sa)\n• tan α dibalik menjadi ➔ cotan α = samping / depan = b / a (Sa-De)",
        formula: "\\csc\\alpha = \\frac{1}{\\sin\\alpha} = \\frac{c}{a}, \\quad \\sec\\alpha = \\frac{1}{\\cos\\alpha} = \\frac{c}{b}, \\quad \\cot\\alpha = \\frac{1}{\\tan\\alpha} = \\frac{b}{a}",
        keyTakeaways: [
          "Cosec adalah kebalikan dari Sin",
          "Secan adalah kebalikan dari Cos",
          "Cotangen adalah kebalikan dari Tan",
        ],
      },
      {
        id: "s-6",
        title: "Instrumen 3: Kompas Teritori (Positif/Negatif Kuadran)",
        content: "Kompas 4 Kuadran dalam bidang koordinat Kartesius:\n• Kuadran I (0° < α < 90°): ALL / SEMUA fungsi bernilai Positif (+)\n• Kuadran II (90° < α < 180°): SIN Positif (+) [Hanya Sin & Cosec yang positif]\n• Kuadran III (180° < α < 270°): TAN Positif (+) [Hanya Tan & Cotan yang positif]\n• Kuadran IV (270° < α < 360°): COS Positif (+) [Hanya Cos & Sec yang positif]\n\nMentalitas Ujian: Ingat akronim SEMUA-SIN-TAN-COS atau ALL-SIN-TA-COS untuk mengecek tanda (+/-) dalam sedetik!",
        formula: "\\text{Kuadran I: ALL (+)} \\quad|\\quad \\text{II: SIN (+)} \\quad|\\quad \\text{III: TAN (+)} \\quad|\\quad \\text{IV: COS (+)}",
        keyTakeaways: [
          "Akronim: SEMUA - SIN - TAN - COS",
          "Hanya fungsi yang sesuai dengan teritori kuadrannya yang bertanda positif, sisanya negatif",
        ],
      },
      {
        id: "s-7",
        title: "Matriks Keputusan: Sudut Berelasi (k · 90° ± α)",
        content: "Untuk menyederhanakan sudut besar, periksa nilai pengali k pada bentuk k · 90° ± α:\n\n1. Jika k GANJIL (1, 3, 5, ...):\n   Fungsi Trigonometri BERUBAH BENTUK ke pasangannya:\n   sin ↔ cos, tan ↔ cotan, sec ↔ cosec\n\n2. Jika k GENAP (2, 4, 6, ...):\n   Fungsi Trigonometri TETAP SAMA:\n   sin → sin, cos → cos, tan → tan\n\nAWAS! Jebakan Ujian yang Sering Terjadi: Tanda hasil akhir (+ atau -) SELALU ditentukan oleh KUADRAN AWAL tempat sudut berada, BUKAN dari fungsi yang baru diubah! Tentukan tanda (+/-) sebelum kalian membalik fungsinya.",
        formula: "k\\text{ ganjil} \\rightarrow \\text{Berubah (}\\sin \\leftrightarrow \\cos\\text{)}, \\quad k\\text{ genap} \\rightarrow \\text{Tetap (}\\sin \\rightarrow \\sin\\text{)}",
        keyTakeaways: [
          "Cek k ganjil atau genap untuk tahu apakah fungsinya berubah atau tetap",
          "Tanda +/- mengacu pada kuadran asal sudut semula",
        ],
      },
      {
        id: "s-8",
        title: "Instrumen 4: Rosetta Stone Koordinat (Kutub & Kartesius)",
        content: "Jembatan penerjemah antara Koordinat Kutub (r, α) dan Koordinat Kartesius (x, y):\n\n1. Kutub (r, α) ➔ Kartesius (x, y):\n   x = r · cos α\n   y = r · sin α\n\n2. Kartesius (x, y) ➔ Kutub (r, α):\n   r = √(x² + y²)\n   α = tan⁻¹(y / x)\n\nPerhatikan tanda x dan y untuk memastikan posisi kuadran dari sudut α.",
        formula: "x = r\\cos\\alpha, \\quad y = r\\sin\\alpha \\quad \\Longleftrightarrow \\quad r = \\sqrt{x^2 + y^2}, \\quad \\alpha = \\arctan\\left(\\frac{y}{x}\\right)",
        keyTakeaways: [
          "r adalah jarak radial dari titik pangkal (0,0)",
          "Gunakan x = r cos α dan y = r sin α untuk dekomposisi vektor koordinat",
        ],
      },
      {
        id: "s-9",
        title: "Telaah Soal 1: Dimensi Putaran (Radian & Kecepatan Mesin)",
        content: "Kasus: Mesin mencapai posisi stabil pada 1.000 rpm (rotasi per menit). Berapa besar sudut dalam Radian setelah mesin menyala selama 2 menit?\n\n• Langkah 1: Identifikasi Data\n  Kecepatan = 1.000 rotasi/menit, Waktu = 2 menit.\n• Langkah 2: Strategi\n  Cari total putaran fisik terlebih dahulu, lalu ubah ke radian (1 putaran = 360° = 2π rad).\n• Langkah 3: Eksekusi\n  Total Putaran = 1.000 × 2 = 2.000 putaran.\n  Konversi Radian = 2.000 × (2π) rad = 4.000π rad.",
        formula: "\\text{Sudut } \\theta = 2.000 \\times 2\\pi\\text{ rad} = 4.000\\pi\\text{ rad}",
        exampleProblem: "Sebuah roda berputar 600 rpm selama 30 detik. Berapa total sudut putarannya dalam radian?",
        solution: "30 detik = 0.5 menit. Total putaran = 600 × 0.5 = 300 putaran. Sudut = 300 × 2π = 600π rad.",
        keyTakeaways: [
          "1 rotasi / putaran penuh = 2π radian",
          "Selalu samakan satuan waktu rotasi (menit ke detik atau sebaliknya)",
        ],
      },
      {
        id: "s-10",
        title: "Telaah Soal 2: Membedah Identitas Kuadran",
        content: "Kasus: Diketahui sin A = -4/5 pada interval (180° ≤ A ≤ 270°). Berapa nilai cos A + tan A?\n\n• Langkah 1: Segitiga Bantuan 2D\n  Abaikan minus sejenak. Jika sin A = 4/5 (De-Mi), maka Sisi Depan = 4, Sisi Miring = 5. Dengan Pythagoras, Sisi Samping = √(5² - 4²) = 3.\n• Langkah 2: Cek Kompas Kuadran\n  Sudut berada di antara 180° - 270° ➔ Kuadran III. Di Kuadran III: Nilai TAN positif (+), Nilai COS negatif (-).\n• Langkah 3: Eksekusi\n  tan A = Depan / Samping = 4/3.\n  cos A = -Samping / Miring = -3/5.\n  cos A + tan A = (-3/5) + 4/3 = (-9/15) + (20/15) = 11/15.",
        formula: "\\cos A + \\tan A = \\left(-\\frac{3}{5}\\right) + \\frac{4}{3} = \\frac{11}{15}",
        exampleProblem: "Jika cos B = -5/13 di Kuadran II (90° ≤ B ≤ 180°), hitung nilai sin B × tan B.",
        solution: "Di Kuadran II: sin positif, tan negatif. Depan = √(13² - 5²) = 12. sin B = 12/13, tan B = -12/5. Maka sin B × tan B = (12/13) × (-12/5) = -144/65.",
        keyTakeaways: [
          "Gambar segitiga pembantu terlebih dahulu tanpa tanda minus",
          "Tentukan tanda kuadran di akhir menggunakan kompas SEMUA-SIN-TAN-COS",
        ],
      },
      {
        id: "s-11",
        title: "Telaah Soal 3: Trigonometri Dunia Nyata (Sudut Elevasi Menara)",
        content: "Kasus: Jarak horizontal pengamat ke kaki menara adalah s. Jika tinggi menara 90 m dan sudut elevasi 30°, tentukan persamaan jarak mendatar s.\n\n• Langkah 1: Sketsa Visual\n  Segitiga siku-siku dengan tinggi depan = 90 m, sisi samping mendatar = s, dan sudut elevasi = 30°.\n• Langkah 2: Strategi\n  Kita memiliki data Sisi Depan (90) dan butuh mencari Sisi Samping (s). Instrumen yang tepat adalah Tangen (tan = De/Sa).\n• Langkah 3: Eksekusi\n  tan 30° = depan / samping = 90 / s.\n  s = 90 / tan 30° = 90 / (1/√3) = 90√3 meter.",
        formula: "s = \\frac{90}{\\tan 30^\\circ} = \\frac{90}{\\frac{1}{\\sqrt{3}}} = 90\\sqrt{3}\\text{ meter}",
        exampleProblem: "Jika sudut elevasi 45° dan tinggi gedung 50 m, berapa jarak pengamat ke kaki gedung?",
        solution: "tan 45° = 1 = 50 / s ➔ s = 50 meter.",
        keyTakeaways: [
          "Gunakan Tangen untuk menghubungkan tinggi obyek tegak dengan jarak horizontal mendatar",
          "Nilai istimewa: tan 30° = 1/√3, tan 45° = 1, tan 60° = √3",
        ],
      },
      {
        id: "s-12",
        title: "Rangkuman Esensial: Toolkit Navigasi Trigonometri",
        content: "3 Pilar Formula Emas Navigator:\n\n1. Skala & Segitiga:\n• Konversi: π rad = 180°\n• Siku-siku: sin = De-Mi, cos = Sa-Mi, tan = De-Sa\n• Kebalikan: csc = 1/sin, sec = 1/cos, cot = 1/tan\n\n2. Kompas Kuadran:\n• Positif Kuadran: I (SEMUA), II (SIN), III (TAN), IV (COS)\n• Sudut Berelasi (k · 90°): k ganjil ➔ berubah bentuk, k genap ➔ tetap (cek tanda +/- dari kuadran awal)\n\n3. Matriks Koordinat:\n• Kutub ➔ Kartesius: x = r cos α, y = r sin α\n• Kartesius ➔ Kutub: r = √(x² + y²), α = tan⁻¹(y/x)",
        formula: "\\text{Pilar 1: De-Mi/Sa-Mi} \\quad|\\quad \\text{Pilar 2: ALL-SIN-TA-COS} \\quad|\\quad \\text{Pilar 3: } x=r\\cos\\alpha, y=r\\sin\\alpha",
        keyTakeaways: [
          "Kuasai 3 pilar ini untuk menjawab soal UTBK/TKA dalam waktu kurang dari 90 detik per soal",
        ],
      },
      {
        id: "s-13",
        title: "Konsep Dikuasai. Saatnya Beraksi!",
        content: "Selamat! Anda telah melengkapi Navigator's Toolkit Anda. Mulai dari mengukur sudut putaran, mengekstrak sisi segitiga, menerjemahkan koordinat ruang, hingga selamat dari jebakan tanda kuadran.\n\nMentalitas Ujian:\n\"Trigonometri bukan tentang menghafal 100 rumus berbeda, melainkan menggunakan 4 alat dasar dengan logika spasial yang benar.\"\n\nSekarang, uji pemahaman Anda pada evaluasi kuis TKA untuk memvalidasi penguasaan materi!",
        formula: "\\text{Navigator's Toolkit Lengkap } \\checkmark \\quad \\Longrightarrow \\quad \\text{Uji Kuis & Raih Skor 75+}",
        keyTakeaways: [
          "Siap uji kuis pemahaman",
          "Target capaian: skor minimal 75 untuk membuka badge Trigon Architect",
        ],
      },
    ],
    quiz: [
      {
        id: 1,
        question: "Sebuah mesin stabil berputar pada kecepatan 1.000 rpm (rotasi per menit). Berapa besar sudut dalam Radian setelah mesin menyala selama 2 menit?",
        options: ["2.000π rad", "4.000π rad", "1.000π rad", "6.000π rad"],
        correctAnswer: 1,
        explanation: "Total putaran = 1.000 rpm × 2 menit = 2.000 putaran. Karena 1 putaran = 2π rad, maka sudut = 2.000 × 2π = 4.000π rad.",
      },
      {
        id: 2,
        question: "Diketahui sin A = -4/5 pada interval 180° ≤ A ≤ 270° (Kuadran III). Berapakah nilai dari cos A + tan A?",
        options: ["-7/15", "11/15", "7/15", "-11/15"],
        correctAnswer: 1,
        explanation: "Di Kuadran III: Tan bernilai positif (+4/3) dan Cos bernilai negatif (-3/5). Maka cos A + tan A = (-3/5) + 4/3 = (-9/15) + (20/15) = 11/15.",
      },
      {
        id: 3,
        question: "Pada aturan sudut berelasi k · 90° ± α, jika k bernilai GANJIL (misal k = 1 atau k = 3), maka fungsi sinus berubah menjadi...",
        options: ["tetap sinus", "cosinus", "tangen", "cotangen"],
        correctAnswer: 1,
        explanation: "Jika pengali k bernilai ganjil, fungsi trigonometri berubah bentuk: sin ↔ cos, tan ↔ cotan, sec ↔ cosec.",
      },
      {
        id: 4,
        question: "Seorang pengamat melihat puncak menara setinggi 90 m dengan sudut elevasi 30°. Persamaan jarak horizontal s dari pengamat ke kaki menara adalah...",
        options: ["90 meter", "45√3 meter", "90√3 meter", "180 meter"],
        correctAnswer: 2,
        explanation: "tan 30° = depan / samping = 90 / s. Maka s = 90 / tan 30° = 90 / (1/√3) = 90√3 meter.",
      },
    ],
  },
  {
    id: "mod-stat-1",
    districtId: 5,
    districtName: "Distrik 5 • Peluang & Analisis Data",
    title: "Permutasi, Kombinasi & Kuartil Data Berkelompok",
    subtitle: "Peluang Kejadian Majemuk & Penyebaran Data TKA",
    displayTitle: "Peluang & Statistika",
    subTitle: "Peluang Kejadian Majemuk & Penyebaran Data TKA",
    tag: "Distrik Unggulan",
    categories: ["Peluang & Statistika", "Level 5", "Modul Inti"],
    xp: 500,
    xpReward: 500,
    estimatedMinutes: 25,
    durationMinutes: 25,
    difficulty: "TKA",
    description: "Kuasai kaidah pencacahan, permutasi siklis, kombinasi pemilihan panitia, peluang kejadian bersyarat, dan perhitungan desil kuartil data berbobot.",
    fullDescription: "Modul penutup tingkat tinggi untuk persiapan TKA Matematika MA Darunnajah 9, memadukan penalaran analitis peluang diskrit dan statistik deskriptif data berkelompok.",
    bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#A855F7",
    targetScore: 75,
    slides: [
      {
        id: "s-1",
        title: "1. Permutasi vs Kombinasi",
        content: "Permutasi memperhatikan urutan susunan (misal: juara 1, 2, 3 atau pengurus inti), sedangkan kombinasi tidak memperhatikan urutan (misal: memilih 3 orang delegasi dari 10 siswa).",
        formula: "P(n, k) = \\frac{n!}{(n-k)!}, \\quad C(n, k) = \\frac{n!}{k!(n-k)!}",
        example: "Dari 6 siswa akan dipilih 2 siswa untuk mewakili olimpiade. Ada berapa cara pemilihan?",
        exampleProblem: "Dari 6 siswa akan dipilih 2 siswa untuk mewakili olimpiade. Ada berapa cara pemilihan?",
        solution: "C(6, 2) = 6! / (2! 4!) = (6 × 5) / 2 = 15 cara.",
        keyTakeaways: ["Urutan diperhatikan = Permutasi", "Urutan tidak penting = Kombinasi"],
      },
    ],
    quiz: [
      {
        id: 1,
        question: "Banyak susunan berbeda yang dapat dibentuk dari kata 'SIGMA' adalah...",
        options: ["60", "120", "24", "720"],
        correctAnswer: 1,
        explanation: "Ada 5 huruf berbeda: 5! = 5 × 4 × 3 × 2 × 1 = 120 cara.",
      },
    ],
  },
];

export const INITIAL_DISCUSSIONS: DiscussionThread[] = [];

