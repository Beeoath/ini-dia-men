import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  RotateCw,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Calculator,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface TrigoProps {
  isDark: boolean;
}

// 1. Interactive Visual Roadmap (Page 2)
export const TrigoRoadmapVisual: React.FC<TrigoProps> = ({ isDark }) => {
  const steps = [
    {
      num: 1,
      title: "Alat Ukur Dasar",
      desc: "Derajat, Menit, Detik & Radian",
      color: "from-cyan-400 to-blue-500",
    },
    {
      num: 2,
      title: "Komputasi Segitiga",
      desc: "Perbandingan Sin, Cos, Tan (De-Sa-Mi)",
      color: "from-blue-400 to-indigo-500",
    },
    {
      num: 3,
      title: "Kompas Kuadran",
      desc: "Relasi Sudut 90°, 180°, 270°, 360°",
      color: "from-amber-400 to-orange-500",
    },
    {
      num: 4,
      title: "Peta Translasi",
      desc: "Konversi Koordinat Kutub & Kartesius",
      color: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <div className="space-y-4 my-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
              isDark
                ? "bg-[#0b1226]/80 border-cyan-500/20 text-slate-200 hover:border-cyan-400/50"
                : "bg-white border-slate-200 text-slate-800 shadow-sm hover:border-cyan-500"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`h-9 w-9 rounded-xl grid place-items-center font-display font-black text-sm text-slate-950 bg-gradient-to-tr ${step.color} shadow-md`}
              >
                {step.num}
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight size={14} className="text-slate-400 hidden lg:block" />
              )}
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-cyan-500 dark:text-cyan-400">
              {step.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isDark
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <span className="font-bold flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          Tujuan Akhir Pelajaran:
        </span>
        <span className="font-mono font-semibold">
          Menyelesaikan Soal UTBK &amp; TKA Multi-Langkah dengan Cepat &amp; Akurat
        </span>
      </div>
    </div>
  );
};

// 2. Interactive Angle Scale & Conversion Matrix (Page 3)
export const TrigoAngleScaleVisual: React.FC<TrigoProps> = ({ isDark }) => {
  const [degreeInput, setDegreeInput] = useState<number>(180);

  const radValue = (degreeInput / 180).toFixed(2);

  return (
    <div className="space-y-4 my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sistem Derajat */}
        <div
          className={`p-4 rounded-2xl border space-y-2.5 ${
            isDark ? "bg-[#091124] border-white/10" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <RotateCw size={14} /> Sistem Derajat (°)
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span><strong>1 Putaran Penuh</strong> = 360°</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span><strong>Skala Mikro:</strong> 1° = 60' (menit), dan 1' = 60" (detik)</span>
            </li>
          </ul>
        </div>

        {/* Sistem Radian */}
        <div
          className={`p-4 rounded-2xl border space-y-2.5 ${
            isDark ? "bg-[#091124] border-white/10" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Compass size={14} /> Sistem Radian (rad)
          </div>
          <div className="text-xs space-y-1">
            <p>Radian mengukur perbandingan panjang busur lingkaran (s) terhadap jari-jari (r):</p>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 font-mono font-bold text-center text-indigo-300 text-sm">
              α rad = s / r
            </div>
          </div>
        </div>
      </div>

      {/* Matriks Konversi Emas */}
      <div
        className={`p-5 rounded-3xl border text-center space-y-3 ${
          isDark
            ? "bg-gradient-to-r from-amber-500/15 via-[#131b33] to-amber-500/15 border-amber-400/40 text-amber-200"
            : "bg-amber-50/90 border-amber-300 text-amber-950 shadow-md"
        }`}
      >
        <div className="font-mono text-xs font-black uppercase tracking-widest text-amber-500 dark:text-amber-300">
          MATRIKS KONVERSI EMAS
        </div>
        <div className="font-mono text-base sm:text-lg font-black tracking-wide flex flex-wrap items-center justify-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-black/20 border border-amber-400/30">
            180° = π rad
          </span>
          <ArrowRight size={16} />
          <span className="px-3 py-1 rounded-xl bg-black/20 border border-amber-400/30">
            1 rad = 180° / π
          </span>
          <ArrowRight size={16} />
          <span className="px-3 py-1 rounded-xl bg-black/20 border border-amber-400/30">
            1° = π / 180 rad
          </span>
        </div>
      </div>

      {/* Interactive Quick Converter */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <Calculator size={15} className="text-cyan-400" />
          <span className="font-semibold">Simulasi Sudut Cepat:</span>
          <input
            type="number"
            value={degreeInput}
            onChange={(e) => setDegreeInput(Number(e.target.value))}
            className="w-20 px-2 py-1 rounded-lg border border-cyan-400/40 bg-black/20 text-center font-mono font-bold text-xs"
          />
          <span>derajat (°)</span>
        </div>
        <div className="font-mono font-bold text-cyan-400">
          = ({degreeInput}/180) π rad ≈ {radValue} π rad ({((degreeInput * Math.PI) / 180).toFixed(3)} rad)
        </div>
      </div>
    </div>
  );
};

// 3. Interactive Right Triangle & Mnemonics (Page 4 & 5)
export const TrigoTriangleVisual: React.FC<TrigoProps> = ({ isDark }) => {
  const [activeSide, setActiveSide] = useState<"depan" | "samping" | "miring" | null>(null);

  return (
    <div className="space-y-4 my-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Triangle Diagram */}
        <div
          className={`md:col-span-5 p-5 rounded-3xl border flex flex-col items-center justify-center relative ${
            isDark ? "bg-[#091124] border-white/10" : "bg-slate-50 border-slate-200"
          }`}
        >
          <svg viewBox="0 0 240 180" className="w-56 h-44 drop-shadow-md">
            {/* Right Angle Triangle ABC */}
            {/* Vertices: A=(30, 150), B=(200, 150), C=(200, 30) */}
            <polygon
              points="30,150 200,150 200,30"
              fill={isDark ? "rgba(56, 189, 248, 0.08)" : "rgba(14, 165, 233, 0.08)"}
              stroke={isDark ? "#38bdf8" : "#0284c7"}
              strokeWidth="2.5"
            />

            {/* Right Angle Marker at B */}
            <polyline
              points="185,150 185,135 200,135"
              fill="none"
              stroke={isDark ? "#94a3b8" : "#64748b"}
              strokeWidth="2"
            />

            {/* Angle alpha arc at A */}
            <path
              d="M 60,150 A 30,30 0 0,0 55,132"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <text x="68" y="140" fill="#f59e0b" fontSize="13" fontWeight="bold">
              α
            </text>

            {/* Vertex labels */}
            <text x="14" y="156" fill={isDark ? "#fff" : "#000"} fontSize="14" fontWeight="bold">
              A
            </text>
            <text x="208" y="156" fill={isDark ? "#fff" : "#000"} fontSize="14" fontWeight="bold">
              B
            </text>
            <text x="208" y="28" fill={isDark ? "#fff" : "#000"} fontSize="14" fontWeight="bold">
              C
            </text>

            {/* Sides with interactive coloring */}
            {/* Depan (BC) */}
            <text
              x="212"
              y="94"
              fill={activeSide === "depan" ? "#22c55e" : "#f43f5e"}
              fontSize="12"
              fontWeight="bold"
            >
              a (DEPAN)
            </text>

            {/* Samping (AB) */}
            <text
              x="95"
              y="170"
              fill={activeSide === "samping" ? "#22c55e" : "#3b82f6"}
              fontSize="12"
              fontWeight="bold"
            >
              b (SAMPING)
            </text>

            {/* Miring (AC) */}
            <text
              x="90"
              y="80"
              fill={activeSide === "miring" ? "#22c55e" : "#eab308"}
              fontSize="12"
              fontWeight="bold"
            >
              c (MIRING / Hipotenusa)
            </text>
          </svg>
          <div className="text-[11px] text-slate-400 font-mono mt-2">
            Segitiga Siku-Siku di B dengan Sudut Acuan di A (α)
          </div>
        </div>

        {/* Mnemonics Cards (De-Mi, Sa-Mi, De-Sa) */}
        <div className="md:col-span-7 space-y-2.5">
          <div
            onMouseEnter={() => setActiveSide("depan")}
            onMouseLeave={() => setActiveSide(null)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              isDark ? "bg-[#0c142b] border-white/10" : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-rose-400">sin α = sisi depan / sisi miring = a / c</span>
              <p className="text-[11px] text-slate-400">Perbandingan tinggi tegak terhadap garis miring</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-400/30">
              De - Mi
            </span>
          </div>

          <div
            onMouseEnter={() => setActiveSide("samping")}
            onMouseLeave={() => setActiveSide(null)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              isDark ? "bg-[#0c142b] border-white/10" : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-blue-400">cos α = sisi samping / sisi miring = b / c</span>
              <p className="text-[11px] text-slate-400">Perbandingan alas mendatar terhadap garis miring</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Sa - Mi
            </span>
          </div>

          <div
            onMouseEnter={() => setActiveSide("depan")}
            onMouseLeave={() => setActiveSide(null)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              isDark ? "bg-[#0c142b] border-white/10" : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-amber-400">tan α = sisi depan / sisi samping = a / b</span>
              <p className="text-[11px] text-slate-400">Perbandingan tinggi terhadap alas (Gradien kemiringan)</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
              De - Sa
            </span>
          </div>
        </div>
      </div>

      {/* Jalan Pintas: Perbandingan Kebalikan */}
      <div
        className={`p-4 rounded-3xl border space-y-3 ${
          isDark ? "bg-[#0a0f21] border-cyan-500/30" : "bg-cyan-50/50 border-cyan-200"
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Sparkles size={14} /> Jalan Pintas: Jangan Hafalkan Ulang, Cukup Balikkan!
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-center">
            <span className="text-slate-400">sin α dibalik ➔</span>
            <div className="font-bold text-cyan-300 mt-0.5">cosec α = c / a (Mi-De)</div>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-center">
            <span className="text-slate-400">cos α dibalik ➔</span>
            <div className="font-bold text-cyan-300 mt-0.5">sec α = c / b (Mi-Sa)</div>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-center">
            <span className="text-slate-400">tan α dibalik ➔</span>
            <div className="font-bold text-cyan-300 mt-0.5">cotan α = b / a (Sa-De)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Interactive Quadrant Compass (Page 6)
export const TrigoQuadrantVisual: React.FC<TrigoProps> = ({ isDark }) => {
  const [selectedQuad, setSelectedQuad] = useState<number>(1);

  const quadData = [
    {
      q: 1,
      name: "Kuadran I",
      angle: "0° < α < 90°",
      positive: "ALL / SEMUA",
      details: "Semua fungsi (Sin, Cos, Tan, Csc, Sec, Cot) bernilai Positif (+)",
      color: "border-cyan-400 bg-cyan-500/10 text-cyan-300",
    },
    {
      q: 2,
      name: "Kuadran II",
      angle: "90° < α < 180°",
      positive: "SIN (+)",
      details: "Hanya Sinus & Cosecan bernilai Positif (+). Cosinus & Tangen bernilai Negatif (-)",
      color: "border-emerald-400 bg-emerald-500/10 text-emerald-300",
    },
    {
      q: 3,
      name: "Kuadran III",
      angle: "180° < α < 270°",
      positive: "TAN (+)",
      details: "Hanya Tangen & Cotangen bernilai Positif (+). Sinus & Cosinus bernilai Negatif (-)",
      color: "border-amber-400 bg-amber-500/10 text-amber-300",
    },
    {
      q: 4,
      name: "Kuadran IV",
      angle: "270° < α < 360°",
      positive: "COS (+)",
      details: "Hanya Cosinus & Secan bernilai Positif (+). Sinus & Tangen bernilai Negatif (-)",
      color: "border-rose-400 bg-rose-500/10 text-rose-300",
    },
  ];

  return (
    <div className="space-y-4 my-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Kuadran II (Top-Left) */}
        <button
          type="button"
          onClick={() => setSelectedQuad(2)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedQuad === 2
              ? "border-emerald-400 bg-emerald-500/15 shadow-md shadow-emerald-500/20"
              : isDark
              ? "bg-[#091124] border-white/10 hover:border-emerald-400/40"
              : "bg-white border-slate-200 hover:border-emerald-500 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">Kuadran II (90° - 180°)</span>
            <span className="font-black text-sm text-emerald-400 font-mono">SIN (+)</span>
          </div>
          <p className="text-xs font-semibold mt-1">Hanya Sin &amp; Cosec yang Positif</p>
        </button>

        {/* Kuadran I (Top-Right) */}
        <button
          type="button"
          onClick={() => setSelectedQuad(1)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedQuad === 1
              ? "border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-500/20"
              : isDark
              ? "bg-[#091124] border-white/10 hover:border-cyan-400/40"
              : "bg-white border-slate-200 hover:border-cyan-500 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">Kuadran I (0° - 90°)</span>
            <span className="font-black text-sm text-cyan-400 font-mono">ALL / SEMUA</span>
          </div>
          <p className="text-xs font-semibold mt-1">Semua Fungsi Bernilai Positif (+)</p>
        </button>

        {/* Kuadran III (Bottom-Left) */}
        <button
          type="button"
          onClick={() => setSelectedQuad(3)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedQuad === 3
              ? "border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/20"
              : isDark
              ? "bg-[#091124] border-white/10 hover:border-amber-400/40"
              : "bg-white border-slate-200 hover:border-amber-500 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">Kuadran III (180° - 270°)</span>
            <span className="font-black text-sm text-amber-400 font-mono">TAN (+)</span>
          </div>
          <p className="text-xs font-semibold mt-1">Hanya Tan &amp; Cotan yang Positif</p>
        </button>

        {/* Kuadran IV (Bottom-Right) */}
        <button
          type="button"
          onClick={() => setSelectedQuad(4)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedQuad === 4
              ? "border-rose-400 bg-rose-500/15 shadow-md shadow-rose-500/20"
              : isDark
              ? "bg-[#091124] border-white/10 hover:border-rose-400/40"
              : "bg-white border-slate-200 hover:border-rose-500 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">Kuadran IV (270° - 360°)</span>
            <span className="font-black text-sm text-rose-400 font-mono">COS (+)</span>
          </div>
          <p className="text-xs font-semibold mt-1">Hanya Cos &amp; Sec yang Positif</p>
        </button>
      </div>

      {/* Mnemonic Golden Bar */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          isDark
            ? "bg-gradient-to-r from-amber-500/15 to-transparent border-amber-400/30 text-amber-200"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold">Mentalitas Ujian (Jembatan Keledai 1 Detik):</strong>
            Ingat akronim <strong>SEMUA - SIN - TAN - COS</strong> (atau <strong>ALL - SIN - TA - COS</strong>) searah jarum jam dari Kuadran I ke IV!
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Interactive Decision Matrix for Related Angles (Page 7)
export const TrigoDecisionMatrixVisual: React.FC<TrigoProps> = ({ isDark }) => {
  return (
    <div className="space-y-4 my-4">
      <div className="text-center font-mono text-xs font-bold text-cyan-400 mb-2">
        BENTUK UMUM SUDUT BERELASI: k · 90° ± α
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jika k Ganjil */}
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? "bg-[#091124] border-cyan-400/30" : "bg-cyan-50/50 border-cyan-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs font-mono text-cyan-400">Jika k GANJIL (1, 3, 5...)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950">
              BERUBAH
            </span>
          </div>
          <p className="text-xs text-slate-300 dark:text-slate-300">
            Fungsi Trigonometri <strong>BERUBAH BENTUK</strong> pasangannya:
          </p>
          <div className="space-y-1 font-mono text-xs font-bold text-cyan-300">
            <div>• sin ↔ cos</div>
            <div>• tan ↔ cotan</div>
            <div>• sec ↔ cosec</div>
          </div>
        </div>

        {/* Jika k Genap */}
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? "bg-[#091124] border-indigo-400/30" : "bg-indigo-50/50 border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs font-mono text-indigo-400">Jika k GENAP (2, 4, 6...)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-400 text-white">
              TETAP
            </span>
          </div>
          <p className="text-xs text-slate-300 dark:text-slate-300">
            Fungsi Trigonometri <strong>TETAP SAMA</strong>:
          </p>
          <div className="space-y-1 font-mono text-xs font-bold text-indigo-300">
            <div>• sin → sin</div>
            <div>• cos → cos</div>
            <div>• tan → tan</div>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div
        className={`p-4 rounded-2xl border space-y-1.5 ${
          isDark
            ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
            : "bg-rose-50 border-rose-200 text-rose-900"
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400 uppercase tracking-wider">
          <AlertTriangle size={15} /> AWAS! Jebakan Ujian yang Paling Sering Terjadi:
        </div>
        <p className="text-xs leading-relaxed">
          Tanda hasil akhir (+ atau -) <strong>SELALU ditentukan oleh KUADRAN AWAL</strong> tempat sudut berada, <strong>BUKAN</strong> dari fungsi yang baru diubah! Tentukan tanda (+/-) terlebih dahulu sebelum membalik fungsinya.
        </p>
      </div>
    </div>
  );
};

// 6. Interactive Rosetta Stone Polar - Cartesian (Page 8)
export const TrigoRosettaStoneVisual: React.FC<TrigoProps> = ({ isDark }) => {
  return (
    <div className="space-y-4 my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kutub -> Kartesius */}
        <div
          className={`p-5 rounded-3xl border space-y-3 ${
            isDark ? "bg-[#091124] border-cyan-500/30" : "bg-cyan-50/60 border-cyan-200"
          }`}
        >
          <span className="font-mono text-xs font-black uppercase text-cyan-400 block">
            Kutub (r, α) ➔ Kartesius (x, y)
          </span>
          <div className="space-y-2 font-mono text-sm font-bold text-center py-2 bg-black/20 rounded-2xl border border-white/10">
            <div>x = r · cos α</div>
            <div>y = r · sin α</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Dipakai untuk menguraikan vektor atau posisi sudut ke sumbu mendatar (x) dan vertikal (y).
          </p>
        </div>

        {/* Kartesius -> Kutub */}
        <div
          className={`p-5 rounded-3xl border space-y-3 ${
            isDark ? "bg-[#091124] border-indigo-500/30" : "bg-indigo-50/60 border-indigo-200"
          }`}
        >
          <span className="font-mono text-xs font-black uppercase text-indigo-400 block">
            Kartesius (x, y) ➔ Kutub (r, α)
          </span>
          <div className="space-y-2 font-mono text-sm font-bold text-center py-2 bg-black/20 rounded-2xl border border-white/10">
            <div>r = √(x² + y²)</div>
            <div>α = tan⁻¹(y / x)</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Perhatikan kuadran tanda x dan y untuk menentukan besaran sudut α yang valid.
          </p>
        </div>
      </div>
    </div>
  );
};

// 7. Stepper Case Studies (Pages 9, 10, 11)
export const TrigoCaseStudyVisual: React.FC<{
  isDark: boolean;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  finalResult: string;
}> = ({
  isDark,
  step1Title,
  step1Desc,
  step2Title,
  step2Desc,
  step3Title,
  step3Desc,
  finalResult,
}) => {
  return (
    <div className="space-y-3 my-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Langkah 1 */}
        <div
          className={`p-4 rounded-2xl border space-y-1.5 ${
            isDark ? "bg-[#091124] border-white/10" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-cyan-400/20 text-cyan-300 font-mono font-bold text-xs grid place-items-center">
              1
            </span>
            <span className="font-bold text-xs">{step1Title}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{step1Desc}</p>
        </div>

        {/* Langkah 2 */}
        <div
          className={`p-4 rounded-2xl border space-y-1.5 ${
            isDark ? "bg-[#091124] border-white/10" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-indigo-400/20 text-indigo-300 font-mono font-bold text-xs grid place-items-center">
              2
            </span>
            <span className="font-bold text-xs">{step2Title}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{step2Desc}</p>
        </div>

        {/* Langkah 3 */}
        <div
          className={`p-4 rounded-2xl border space-y-1.5 ${
            isDark ? "bg-[#091124] border-white/10" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-emerald-400/20 text-emerald-300 font-mono font-bold text-xs grid place-items-center">
              3
            </span>
            <span className="font-bold text-xs">{step3Title}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{step3Desc}</p>
        </div>
      </div>

      {/* Final Result Highlight */}
      <div
        className={`p-4 rounded-2xl border text-center font-mono font-black text-base sm:text-lg ${
          isDark
            ? "bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
            : "bg-amber-100 border-amber-400 text-amber-950 shadow-md"
        }`}
      >
        Hasil Akhir = {finalResult}
      </div>
    </div>
  );
};
