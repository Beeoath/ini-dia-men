import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { MathView } from "./MathView";

interface TrigoPdfSlideViewProps {
  slideIndex: number; // 0 to 12 (corresponding to pages 1 to 13 of the PDF)
  onNavigateToQuiz?: () => void;
}

export const TrigoPdfSlideView: React.FC<TrigoPdfSlideViewProps> = ({
  slideIndex,
  onNavigateToQuiz,
}) => {
  // Theme palette directly extracted from the PDF:
  // Background: #f4f3ec (warm ivory cream)
  // Dark Navy: #10223e
  // Mustard Gold: #d8a436
  // Lighter blue/border: #1a355e

  return (
    <div className="w-full bg-[#f4f3ec] text-[#10223e] rounded-2xl sm:rounded-3xl border-2 border-[#10223e]/20 p-5 sm:p-8 md:p-10 shadow-xl overflow-hidden font-sans select-text">
      {/* ============================================================== */}
      {/* PAGE 1: TITLE SLIDE                                            */}
      {/* ============================================================== */}
      {slideIndex === 0 && (
        <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center pl-6 sm:pl-12">
          {/* Vertical Timeline Line on Left with 4 Checkpoints */}
          <div className="absolute left-2 sm:left-4 top-4 bottom-4 w-1 bg-[#10223e] flex flex-col justify-between items-center py-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#10223e] -ml-[1px]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#10223e] -ml-[1px]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#10223e] -ml-[1px]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#10223e] -ml-[1px]" />
          </div>

          <div className="space-y-4 max-w-2xl ml-4 sm:ml-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#10223e] font-display">
              BAB 4: TRIGONOMETRI
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#183256] leading-snug">
              Navigasi Sudut, Dimensi, dan Ruang Koordinat.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 2: PETA JALAN NAVIGASI TRIGONOMETRI                       */}
      {/* ============================================================== */}
      {slideIndex === 1 && (
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
              Peta Jalan Navigasi Trigonometri
            </h2>

            {/* Top Right Amber Badge with Arrow pointing to step 4 */}
            <div className="relative self-start sm:self-auto bg-[#d8a436] text-[#10223e] p-3 rounded-xl border border-[#b88624] text-xs font-bold shadow-md max-w-xs text-center">
              <span className="block font-black">Tujuan Akhir:</span>
              <span>Menyelesaikan Soal UTBK Multi-Langkah.</span>
              <div className="hidden sm:block absolute -bottom-2 right-12 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#d8a436]" />
            </div>
          </div>

          {/* Stepper with Circles: 1 >> 2 >> 3 >> 4 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {[
              {
                num: 1,
                title: "Alat Ukur Dasar",
                desc: "(Derajat, Menit, Detik & Radian)",
              },
              {
                num: 2,
                title: "Komputasi Segitiga",
                desc: "(Perbandingan Sin, Cos, Tan)",
              },
              {
                num: 3,
                title: "Kompas Kuadran",
                desc: "(Relasi Sudut 90°, 180°, 270°, 360°)",
              },
              {
                num: 4,
                title: "Peta Translasi",
                desc: "(Konversi Koordinat Kutub & Kartesius)",
              },
            ].map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center space-y-3">
                {/* Circle & Arrow Row */}
                <div className="flex items-center justify-center w-full relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[5px] border-[#10223e] bg-white flex items-center justify-center shadow-md">
                    <span className="text-2xl sm:text-3xl font-black text-[#10223e]">
                      {step.num}
                    </span>
                  </div>
                  {idx < 3 && (
                    <span className="hidden md:inline absolute -right-4 text-[#10223e] font-black text-xl tracking-tighter">
                      »»
                    </span>
                  )}
                </div>

                {/* Box underneath */}
                <div className="w-full bg-white border-2 border-[#10223e] rounded-xl p-3 sm:p-4 text-center min-h-[90px] flex flex-col justify-center shadow-sm">
                  <h4 className="font-bold text-xs sm:text-sm text-[#10223e] leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#10223e]/80 mt-1 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 3: INSTRUMEN 1: MEMBACA SKALA SUDUT                       */}
      {/* ============================================================== */}
      {slideIndex === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Instrumen 1: Membaca Skala Sudut
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: Sistem Derajat */}
            <div className="border-2 border-[#10223e] rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="bg-[#10223e] text-white px-4 py-2 font-bold text-sm sm:text-base">
                Sistem Derajat
              </div>
              <div className="p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10223e]" />
                  <span><strong>1 putaran penuh</strong> = 360°</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10223e]" />
                  <span><strong>Skala Mikro:</strong> 1° = 60', dan 1' = 60"</span>
                </div>
              </div>
            </div>

            {/* Box 2: Sistem Radian */}
            <div className="border-2 border-[#10223e] rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="bg-[#10223e] text-white px-4 py-2 font-bold text-sm sm:text-base">
                Sistem Radian
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                {/* SVG Sector Circle */}
                <div className="relative w-28 h-28 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#10223e" strokeWidth="2.5" />
                    {/* Radius lines and sector */}
                    <line x1="50" y1="50" x2="88" y2="35" stroke="#10223e" strokeWidth="2" />
                    <line x1="50" y1="50" x2="88" y2="65" stroke="#10223e" strokeWidth="2" />
                    <path d="M 88,35 A 42,42 0 0,1 88,65" fill="none" stroke="#10223e" strokeWidth="3" />
                    <circle cx="50" cy="50" r="3" fill="#10223e" />
                    <text x="56" y="53" fontSize="11" fontWeight="bold" fill="#10223e">θ</text>
                    <text x="62" y="66" fontSize="10" fontWeight="bold" fill="#10223e">r</text>
                    <text x="92" y="52" fontSize="11" fontWeight="bold" fill="#10223e">s</text>
                  </svg>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-xs sm:text-sm font-semibold">Sudut dalam radian:</div>
                  <div className="text-lg sm:text-2xl font-bold font-serif">
                    <MathView math="\alpha\text{ rad} = \frac{s}{r}" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matriks Konversi Emas */}
          <div className="bg-[#d8a436] border-2 border-[#10223e] rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-sm sm:text-base text-[#10223e] mb-3">
              Matriks Konversi Emas
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-bold text-base sm:text-xl font-serif">
              <span className="bg-white/40 px-3 py-1.5 rounded-lg border border-[#10223e]/30">
                <MathView math="180^\circ = \pi\text{ rad}" />
              </span>
              <span className="text-[#10223e] font-black text-2xl font-sans">➔</span>
              <span className="bg-white/40 px-3 py-1.5 rounded-lg border border-[#10223e]/30">
                <MathView math="1\text{ rad} = \frac{180^\circ}{\pi}" />
              </span>
              <span className="text-[#10223e] font-black text-2xl font-sans">➔</span>
              <span className="bg-white/40 px-3 py-1.5 rounded-lg border border-[#10223e]/30">
                <MathView math="1^\circ = \frac{\pi}{180}\text{ rad}" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 4: INSTRUMEN 2: KOMPUTASI SEGITIGA SIKU-SIKU               */}
      {/* ============================================================== */}
      {slideIndex === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Instrumen 2: Komputasi Segitiga Siku-Siku
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left Diagram Card */}
            <div className="md:col-span-6 bg-white border-2 border-[#10223e] rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[260px] shadow-sm">
              <svg viewBox="0 0 260 200" className="w-full max-w-[280px]">
                {/* Right Triangle */}
                <polygon
                  points="40,160 210,160 210,40"
                  fill="none"
                  stroke="#10223e"
                  strokeWidth="3"
                />
                {/* Right angle marker at B */}
                <polyline
                  points="192,160 192,142 210,142"
                  fill="none"
                  stroke="#10223e"
                  strokeWidth="2.5"
                />
                {/* Angle alpha arc at A */}
                <path
                  d="M 75,160 A 35,35 0 0,0 67,138"
                  fill="none"
                  stroke="#10223e"
                  strokeWidth="2.5"
                />
                <text x="82" y="152" fill="#10223e" fontSize="16" fontWeight="bold">α</text>

                {/* Vertices */}
                <text x="22" y="166" fill="#10223e" fontSize="16" fontStyle="italic" fontWeight="bold">A</text>
                <text x="218" y="166" fill="#10223e" fontSize="16" fontStyle="italic" fontWeight="bold">B</text>
                <text x="204" y="32" fill="#10223e" fontSize="16" fontStyle="italic" fontWeight="bold">C</text>

                {/* Labels a, b, c */}
                <text x="222" y="102" fill="#10223e" fontSize="15" fontStyle="italic" fontWeight="bold">a</text>
                <text x="120" y="180" fill="#10223e" fontSize="15" fontStyle="italic" fontWeight="bold">b</text>
                <text x="110" y="92" fill="#10223e" fontSize="15" fontStyle="italic" fontWeight="bold">c</text>
              </svg>

              {/* Mustard Badges on Sides */}
              <div className="absolute left-4 top-24 bg-[#d8a436] text-[#10223e] px-2.5 py-1 rounded-md text-[11px] font-black border border-[#10223e] shadow-sm">
                MIRING<br />(Hipotenusa)
              </div>
              <div className="absolute right-4 top-24 bg-[#d8a436] text-[#10223e] px-2 py-0.5 rounded-md text-[11px] font-black border border-[#10223e] shadow-sm">
                DEPAN
              </div>
              <div className="absolute bottom-2 bg-[#d8a436] text-[#10223e] px-2.5 py-0.5 rounded-md text-[11px] font-black border border-[#10223e] shadow-sm">
                SAMPING
              </div>
            </div>

            {/* Right Formula Cards (Sin, Cos, Tan) */}
            <div className="md:col-span-6 space-y-3.5 flex flex-col justify-center">
              {/* Sin */}
              <div className="bg-white border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-sm">
                <div className="text-sm sm:text-base font-bold font-serif">
                  <MathView math="\sin\alpha = \frac{\text{sisi depan}}{\text{sisi miring}} = \frac{a}{c}" />
                </div>
                <div className="bg-[#d8a436] text-[#10223e] px-2.5 py-1.5 rounded-md text-xs font-black border border-[#10223e] shrink-0">
                  Mnemonik:<br />De-Mi
                </div>
              </div>

              {/* Cos */}
              <div className="bg-white border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-sm">
                <div className="text-sm sm:text-base font-bold font-serif">
                  <MathView math="\cos\alpha = \frac{\text{sisi samping}}{\text{sisi miring}} = \frac{b}{c}" />
                </div>
                <div className="bg-[#d8a436] text-[#10223e] px-2.5 py-1.5 rounded-md text-xs font-black border border-[#10223e] shrink-0">
                  Mnemonik:<br />Sa-Mi
                </div>
              </div>

              {/* Tan */}
              <div className="bg-white border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-sm">
                <div className="text-sm sm:text-base font-bold font-serif">
                  <MathView math="\tan\alpha = \frac{\text{sisi depan}}{\text{sisi samping}} = \frac{a}{b}" />
                </div>
                <div className="bg-[#d8a436] text-[#10223e] px-2.5 py-1.5 rounded-md text-xs font-black border border-[#10223e] shrink-0">
                  Mnemonik:<br />De-Sa
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 5: JALAN PINTAS: CUKUP BALIKKAN!                          */}
      {/* ============================================================== */}
      {slideIndex === 4 && (
        <div className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight text-center">
            Jalan Pintas: Jangan Hafalkan Ulang, Cukup Balikkan!
          </h2>

          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Row 1: sin -> cosec */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex-1 bg-white border-2 border-[#10223e] rounded-xl p-3 sm:p-4 text-center font-bold text-lg sm:text-xl font-serif shadow-sm">
                <MathView math="\sin\alpha" />
              </div>
              <div className="bg-[#d8a436] text-[#10223e] px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black border border-[#10223e] whitespace-nowrap shadow-sm">
                ➔ dibalik menjadi ➔
              </div>
              <div className="flex-[1.6] bg-white border-2 border-[#10223e] rounded-xl p-3 sm:p-4 text-center font-bold text-sm sm:text-lg font-serif shadow-sm">
                <MathView math="\csc\alpha = \frac{\text{miring}}{\text{depan}} = \frac{c}{a}" />
              </div>
            </div>

            {/* Row 2: cos -> sec */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex-1 bg-white border-2 border-[#10223e] rounded-xl p-3 sm:p-4 text-center font-bold text-lg sm:text-xl font-serif shadow-sm">
                <MathView math="\cos\alpha" />
              </div>
              <div className="bg-[#d8a436] text-[#10223e] px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black border border-[#10223e] whitespace-nowrap shadow-sm">
                ➔ dibalik menjadi ➔
              </div>
              <div className="flex-[1.6] bg-white border-2 border-[#10223e] rounded-xl p-3 sm:p-4 text-center font-bold text-sm sm:text-lg font-serif shadow-sm">
                <MathView math="\sec\alpha = \frac{\text{miring}}{\text{samping}} = \frac{c}{b}" />
              </div>
            </div>

            {/* Row 3: tan -> cotan */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex-1 bg-white border-2 border-[#10223e] rounded-xl p-3 sm:p-4 text-center font-bold text-lg sm:text-xl font-serif shadow-sm">
                <MathView math="\tan\alpha" />
              </div>
              <div className="bg-[#d8a436] text-[#10223e] px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black border border-[#10223e] whitespace-nowrap shadow-sm">
                ➔ dibalik menjadi ➔
              </div>
              <div className="flex-[1.6] bg-white border-2 border-[#10223e] rounded-xl p-3 sm:p-4 text-center font-bold text-sm sm:text-lg font-serif shadow-sm">
                <MathView math="\cot\alpha = \frac{\text{samping}}{\text{depan}} = \frac{b}{a}" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 6: INSTRUMEN 3: KOMPAS TERITORI (KUADRAN)                 */}
      {/* ============================================================== */}
      {slideIndex === 5 && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Instrumen 3: Kompas Teritori (Positif/Negatif)
          </h2>

          {/* Coordinate Quadrants Box */}
          <div className="relative bg-white border-2 border-[#10223e] rounded-xl p-6 sm:p-8 min-h-[300px] shadow-sm">
            {/* Center Axes Lines */}
            <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-[#10223e] -translate-x-1/2">
              <span className="absolute -top-3.5 -left-1 font-bold text-xs">Y ▲</span>
            </div>
            <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-[#10223e] -translate-y-1/2">
              <span className="absolute -right-3 -top-2.5 font-bold text-xs">► X</span>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center h-full">
              {/* Top-Left: Kuadran II */}
              <div className="space-y-1 p-2">
                <span className="text-xs sm:text-sm font-bold text-[#10223e] block">
                  Kuadran II | 90° &lt; α &lt; 180°
                </span>
                <span className="text-2xl sm:text-4xl font-black text-[#d8a436] block tracking-wide">
                  SIN
                </span>
                <span className="text-[11px] sm:text-xs text-[#10223e]/90 block">
                  (Hanya Sin &amp; Cosec yang Positif)
                </span>
              </div>

              {/* Top-Right: Kuadran I */}
              <div className="space-y-1 p-2">
                <span className="text-xs sm:text-sm font-bold text-[#10223e] block">
                  Kuadran I | 0° &lt; α &lt; 90°
                </span>
                <span className="text-2xl sm:text-4xl font-black text-[#d8a436] block tracking-wide">
                  ALL / SEMUA
                </span>
                <span className="text-[11px] sm:text-xs text-[#10223e]/90 block">
                  (Semua fungsi bernilai Positif)
                </span>
              </div>

              {/* Bottom-Left: Kuadran III */}
              <div className="space-y-1 p-2 pt-6">
                <span className="text-xs sm:text-sm font-bold text-[#10223e] block">
                  Kuadran III | 180° &lt; α &lt; 270°
                </span>
                <span className="text-2xl sm:text-4xl font-black text-[#d8a436] block tracking-wide">
                  TAN
                </span>
                <span className="text-[11px] sm:text-xs text-[#10223e]/90 block">
                  (Hanya Tan &amp; Cotan yang Positif)
                </span>
              </div>

              {/* Bottom-Right: Kuadran IV */}
              <div className="space-y-1 p-2 pt-6">
                <span className="text-xs sm:text-sm font-bold text-[#10223e] block">
                  Kuadran IV | 270° &lt; α &lt; 360°
                </span>
                <span className="text-2xl sm:text-4xl font-black text-[#d8a436] block tracking-wide">
                  COS
                </span>
                <span className="text-[11px] sm:text-xs text-[#10223e]/90 block">
                  (Hanya Cos &amp; Sec yang Positif)
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Alert Bar */}
          <div className="bg-[#d8a436] border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 flex items-center gap-3 text-[#10223e] shadow-sm">
            <AlertTriangle size={24} className="shrink-0 stroke-[2.5]" />
            <div className="text-xs sm:text-sm font-bold">
              Mentalitas Ujian: Ingat akronim <strong>SEMUA-SIN-TAN-COS</strong> atau <strong>ALL-SIN-TA-COS</strong> untuk mengecek tanda (±) dalam sedetik.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 7: MATRIKS KEPUTUSAN SUDUT BERELASI                       */}
      {/* ============================================================== */}
      {slideIndex === 6 && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Matriks Keputusan: Sudut Berelasi (k · 90° ± α)
          </h2>

          <div className="max-w-2xl mx-auto space-y-4">
            {/* Top Prompt Box */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-3 text-center text-xs sm:text-sm font-bold shadow-sm max-w-xs mx-auto">
              Periksa nilai pengali k pada:<br />
              <span className="font-serif text-base sm:text-lg">k · 90° ± α</span>
            </div>

            {/* Branching Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Branch 1: Ganjil */}
              <div className="space-y-2">
                <div className="bg-white border-2 border-[#10223e] rounded-xl p-2.5 text-center text-xs font-bold">
                  Jika <strong>k GANJIL</strong> (1, 3, 5...)
                </div>
                <div className="text-center text-sm font-bold">▼</div>
                <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 text-center space-y-2 shadow-sm min-h-[140px] flex flex-col justify-center">
                  <span className="font-bold text-xs sm:text-sm block">
                    Fungsi Trigonometri<br /><strong>BERUBAH BENTUK</strong>
                  </span>
                  <div className="font-mono text-xs sm:text-sm font-bold space-y-0.5">
                    <div>sin ↔ cos</div>
                    <div>tan ↔ cotan</div>
                    <div>sec ↔ cosec</div>
                  </div>
                </div>
              </div>

              {/* Branch 2: Genap */}
              <div className="space-y-2">
                <div className="bg-white border-2 border-[#10223e] rounded-xl p-2.5 text-center text-xs font-bold">
                  Jika <strong>k GENAP</strong> (2, 4, 6...)
                </div>
                <div className="text-center text-sm font-bold">▼</div>
                <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 text-center space-y-2 shadow-sm min-h-[140px] flex flex-col justify-center">
                  <span className="font-bold text-xs sm:text-sm block">
                    Fungsi Trigonometri<br /><strong>TETAP</strong>
                  </span>
                  <div className="font-mono text-xs sm:text-sm font-bold space-y-0.5">
                    <div>sin ➔ sin</div>
                    <div>cos ➔ cos</div>
                    <div>tan ➔ tan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Warning Bar */}
          <div className="bg-[#d8a436] border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 flex items-start gap-3 text-[#10223e] shadow-sm">
            <AlertTriangle size={24} className="shrink-0 stroke-[2.5] mt-0.5" />
            <div className="text-xs sm:text-sm leading-snug">
              <strong>AWAS! Jebakan Ujian yang Sering Terjadi.</strong><br />
              Tanda hasil akhir (+ atau -) <strong>SELALU ditentukan oleh KUADRAN AWAL</strong> tempat sudut berada, <strong>BUKAN</strong> dari fungsi yang baru diubah! Tentukan tanda (+/-) sebelum kalian membalik fungsinya.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 8: INSTRUMEN 4: ROSETTA STONE KOORDINAT                   */}
      {/* ============================================================== */}
      {slideIndex === 7 && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Instrumen 4: Rosetta Stone Koordinat
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left Card: Kutub -> Kartesius */}
            <div className="md:col-span-4 bg-white border-2 border-[#10223e] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#10223e] text-white px-3 py-2 text-xs sm:text-sm font-bold text-center">
                Kutub (r, α) ➔ Kartesius (x,y)
              </div>
              <div className="p-5 sm:p-6 text-center space-y-3 font-serif font-bold text-base sm:text-xl">
                <div>
                  <MathView math="x = r\cos\alpha" />
                </div>
                <div>
                  <MathView math="y = r\sin\alpha" />
                </div>
              </div>
            </div>

            {/* Center Diagram */}
            <div className="md:col-span-4 flex items-center justify-center p-2">
              <svg viewBox="0 0 200 160" className="w-full max-w-[220px]">
                {/* Axes */}
                <line x1="20" y1="130" x2="190" y2="130" stroke="#10223e" strokeWidth="2" />
                <line x1="40" y1="150" x2="40" y2="15" stroke="#10223e" strokeWidth="2" />
                <text x="35" y="10" fontSize="12" fontWeight="bold">Y</text>
                <text x="192" y="134" fontSize="12" fontWeight="bold">X</text>
                <text x="26" y="142" fontSize="12" fontWeight="bold">O</text>

                {/* Point B(x,y) and right triangle */}
                {/* O=(40, 130), A=(140, 130), B=(140, 40) */}
                <line x1="40" y1="130" x2="140" y2="40" stroke="#10223e" strokeWidth="2.5" />
                <line x1="140" y1="130" x2="140" y2="40" stroke="#10223e" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="140" cy="40" r="3.5" fill="#10223e" />
                <text x="135" y="32" fontSize="13" fontWeight="bold">B(x, y)</text>
                <text x="144" y="144" fontSize="13" fontWeight="bold">A</text>

                {/* angle arc */}
                <path d="M 65,130 A 25,25 0 0,0 60,113" fill="none" stroke="#10223e" strokeWidth="2" />
                <text x="68" y="124" fontSize="13" fontWeight="bold">α</text>

                <text x="85" y="80" fontSize="13" fontStyle="italic" fontWeight="bold">r</text>
                <text x="90" y="145" fontSize="13" fontStyle="italic" fontWeight="bold">x</text>
                <text x="146" y="90" fontSize="13" fontStyle="italic" fontWeight="bold">y</text>
              </svg>
            </div>

            {/* Right Card: Kartesius -> Kutub */}
            <div className="md:col-span-4 bg-white border-2 border-[#10223e] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#10223e] text-white px-3 py-2 text-xs sm:text-sm font-bold text-center">
                Kartesius (x,y) ➔ Kutub (r, α)
              </div>
              <div className="p-5 sm:p-6 text-center space-y-3 font-serif font-bold text-base sm:text-xl">
                <div>
                  <MathView math="r = \sqrt{x^2 + y^2}" />
                </div>
                <div>
                  <MathView math="\alpha = \tan^{-1}\left(\frac{y}{x}\right)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 9: TELAAH SOAL 1: DIMENSI PUTARAN (RADIAN)                */}
      {/* ============================================================== */}
      {slideIndex === 8 && (
        <div className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Telaah Soal 1: Dimensi Putaran (Radian)
          </h2>

          {/* Top Case Box */}
          <div className="bg-white border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-medium shadow-sm">
            <strong>Kasus:</strong> Mesin mencapai posisi stabil pada 1.000 rpm (rotasi per menit). Berapa besar sudut dalam Radian setelah mesin menyala selama 2 menit?
          </div>

          {/* 3 Step Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-3 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">1</span>
                <span>Langkah 1: Identifikasi Data</span>
              </div>
              <div className="text-xs sm:text-sm space-y-2 flex-1">
                <p>Kecepatan = 1.000 rotasi / menit.</p>
                <p>Waktu = 2 menit.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-3 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">2</span>
                <span>Langkah 2: Strategi</span>
              </div>
              <div className="text-xs sm:text-sm space-y-2 flex-1">
                <p>• Cari total putaran fisik (rotasi) terlebih dahulu.</p>
                <p>• Ubah putaran ke unit Radian.</p>
                <p className="text-[11px] text-[#10223e]/75">(Ingat Peta Ukur: 1 putaran = 360° = 2π rad).</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-3 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">3</span>
                <span>Langkah 3: Eksekusi</span>
              </div>
              <div className="text-xs sm:text-sm space-y-1.5 flex-1">
                <p>Total Putaran = 1.000 × 2 = 2.000 putaran.</p>
                <p>Konversi Radian = 2.000 × (2π) rad.</p>
                <p className="font-bold pt-1">Hasil =</p>
                <div className="bg-[#d8a436] border border-[#10223e] text-[#10223e] font-black text-center py-2 rounded-lg text-base sm:text-lg">
                  4.000π rad
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 10: TELAAH SOAL 2: MEMBEDAH IDENTITAS KUADRAN             */}
      {/* ============================================================== */}
      {slideIndex === 9 && (
        <div className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Telaah Soal 2: Membedah Identitas Kuadran
          </h2>

          {/* Top Case Box */}
          <div className="bg-white border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-medium shadow-sm">
            <strong>Kasus:</strong> Diketahui <MathView math="\sin A = -\frac{4}{5}" /> pada interval (180° ≤ A ≤ 270°). Berapa nilai <MathView math="\cos A + \tan A" />?
          </div>

          {/* 3 Step Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-2.5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">1</span>
                <span>Langkah 1: Segitiga Bantuan 2D</span>
              </div>
              {/* Helper Triangle */}
              <div className="flex justify-center py-1">
                <svg viewBox="0 0 160 100" className="w-36">
                  <polygon points="20,80 120,80 120,20" fill="none" stroke="#10223e" strokeWidth="2" />
                  <polyline points="108,80 108,68 120,68" fill="none" stroke="#10223e" strokeWidth="1.5" />
                  <text x="125" y="55" fontSize="10" fontWeight="bold">Depan 4</text>
                  <text x="50" y="94" fontSize="10" fontWeight="bold">3 Samping</text>
                  <text x="45" y="45" fontSize="10" fontWeight="bold">5 Miring</text>
                </svg>
              </div>
              <p className="text-[11px] sm:text-xs leading-snug flex-1">
                Abaikan minus sejenak. Jika sin A = 4/5 (De-Mi), maka Sisi Depan = 4, Miring = 5. Dengan Pythagoras, Sisi Samping = 3.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-3 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">2</span>
                <span>Langkah 2: Cek Kompas Kuadran</span>
              </div>
              <div className="text-xs sm:text-sm space-y-2 flex-1">
                <p>Sudut berada di antara 180° - 270° ➔ <strong>Kuadran III</strong>.</p>
                <div className="space-y-1 pt-1">
                  <p>Di Kuadran III:</p>
                  <p>• Nilai TAN positif (+)</p>
                  <p>• Nilai COS negatif (-)</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-2 shadow-sm flex flex-col font-serif">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm font-sans">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">3</span>
                <span>Langkah 3: Eksekusi</span>
              </div>
              <div className="text-xs sm:text-sm space-y-1.5 flex-1">
                <div>
                  <MathView math="\tan A = \frac{\text{Depan}}{\text{Samping}} = \frac{4}{3}" />
                </div>
                <div>
                  <MathView math="\cos A = -\frac{\text{Samping}}{\text{Miring}} = -\frac{3}{5}" />
                </div>
                <div>
                  <MathView math="\cos A + \tan A = \left(-\frac{3}{5}\right) + \frac{4}{3} = \left(-\frac{9}{15}\right) + \frac{20}{15}" />
                </div>
                <div className="pt-2 font-sans">
                  <div className="bg-[#d8a436] border border-[#10223e] text-[#10223e] font-black text-center py-2 rounded-lg text-lg">
                    11/15
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 11: TELAAH SOAL 3: TRIGONOMETRI DUNIA NYATA               */}
      {/* ============================================================== */}
      {slideIndex === 10 && (
        <div className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Telaah Soal 3: Trigonometri Dunia Nyata
          </h2>

          {/* Top Case Box */}
          <div className="bg-white border-2 border-[#10223e] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-medium shadow-sm">
            <strong>Kasus:</strong> Jarak horizontal pengamat ke kaki menara adalah s. Jika tinggi menara 90 m dan sudut elevasi 30°, tentukan persamaan jarak mendatar s.
          </div>

          {/* 3 Step Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-2.5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">1</span>
                <span>Langkah 1: Sketsa Visual</span>
              </div>
              <div className="flex justify-center py-2 flex-1">
                <svg viewBox="0 0 160 110" className="w-36">
                  <polygon points="20,90 130,90 130,20" fill="none" stroke="#10223e" strokeWidth="2" />
                  <polyline points="118,90 118,78 130,78" fill="none" stroke="#10223e" strokeWidth="1.5" />
                  <path d="M 50,90 A 30,30 0 0,0 45,77" fill="none" stroke="#10223e" strokeWidth="1.5" />
                  <text x="52" y="85" fontSize="10" fontWeight="bold">30°</text>
                  <text x="135" y="55" fontSize="10" fontWeight="bold">90 m</text>
                  <text x="135" y="68" fontSize="9">depan</text>
                  <text x="65" y="103" fontSize="10" fontStyle="italic" fontWeight="bold">s</text>
                  <text x="50" y="113" fontSize="9">samping</text>
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-3 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">2</span>
                <span>Langkah 2: Strategi</span>
              </div>
              <div className="text-xs sm:text-sm space-y-2 flex-1">
                <p>• Kita memiliki data Sisi Depan (90) dan butuh mencari Sisi Samping (s).</p>
                <p>Instrumen yang tepat dari dashboard kita adalah Tangen.</p>
                <div className="font-serif pt-1">
                  Ingat: <MathView math="\tan\alpha = \frac{\text{Depan}}{\text{Samping}}" /> (De-Sa)
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-2 border-[#10223e] rounded-xl p-4 space-y-2 shadow-sm flex flex-col font-serif">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm font-sans">
                <span className="w-6 h-6 rounded bg-[#10223e] text-white grid place-items-center font-bold">3</span>
                <span>Langkah 3: Eksekusi</span>
              </div>
              <div className="text-xs sm:text-sm space-y-1.5 flex-1">
                <div>
                  <MathView math="\tan 30^\circ = \frac{\text{depan}}{\text{samping}} = \frac{90}{s}" />
                </div>
                <div>
                  <MathView math="s = \frac{90}{\tan 30^\circ}" />
                </div>
                <div>
                  <MathView math="s = \frac{90}{\frac{1}{\sqrt{3}}}" />
                </div>
                <div className="pt-2 font-sans">
                  <div className="bg-[#d8a436] border border-[#10223e] text-[#10223e] font-black text-center py-2 rounded-lg text-lg">
                    90√3 meter
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 12: RANGKUMAN ESENSIAL: TOOLKIT NAVIGASI                  */}
      {/* ============================================================== */}
      {slideIndex === 11 && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#10223e] tracking-tight">
            Rangkuman Esensial: Toolkit Navigasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white border-2 border-[#10223e] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm flex flex-col">
              <div className="bg-[#10223e] text-white px-3 py-1.5 rounded-full text-center text-xs sm:text-sm font-bold">
                Skala &amp; Segitiga
              </div>
              <div className="space-y-3 text-xs sm:text-sm flex-1">
                <div>
                  <p className="font-bold">• Konversi Emas:</p>
                  <div className="font-serif pl-3 pt-1">
                    <MathView math="\pi\text{ rad} = 180^\circ" />
                  </div>
                </div>
                <div>
                  <p className="font-bold">• Siku-Siku (Mnemonik):</p>
                  <div className="font-serif pl-3 space-y-1 pt-1">
                    <div><MathView math="\text{Sin} = \text{De-Mi}" /></div>
                    <div><MathView math="\text{Cos} = \text{Sa-Mi}" /></div>
                    <div><MathView math="\text{Tan} = \text{De-Sa}" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border-2 border-[#10223e] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm flex flex-col">
              <div className="bg-[#10223e] text-white px-3 py-1.5 rounded-full text-center text-xs sm:text-sm font-bold">
                Kompas Kuadran
              </div>
              <div className="space-y-3 text-xs sm:text-sm flex-1">
                <div>
                  <p className="font-bold">• Positif berdasarkan Kuadran:</p>
                  <div className="pl-3 space-y-0.5 pt-1 text-xs">
                    <div>I: SEMUA</div>
                    <div>II: SIN</div>
                    <div>III: TAN</div>
                    <div>IV: COS</div>
                  </div>
                </div>
                <div>
                  <p className="font-bold">• Aturan Sudut Berelasi (k · 90°):</p>
                  <div className="pl-3 space-y-0.5 pt-1 text-xs">
                    <div>k Ganjil ➔ Fungsi Berubah</div>
                    <div>k Genap ➔ Fungsi Tetap</div>
                    <div className="text-[11px] text-[#10223e]/75">(Cek tanda +/- dari Kuadran Awal)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border-2 border-[#10223e] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm flex flex-col font-serif">
              <div className="bg-[#10223e] text-white px-3 py-1.5 rounded-full text-center text-xs sm:text-sm font-bold font-sans">
                Matriks Koordinat
              </div>
              <div className="space-y-3 text-xs sm:text-sm flex-1">
                <div>
                  <p className="font-bold font-sans">• Kutub ➔ Kartesius:</p>
                  <div className="pl-3 space-y-1 pt-1">
                    <div><MathView math="x = r\cos\alpha" /></div>
                    <div><MathView math="y = r\sin\alpha" /></div>
                  </div>
                </div>
                <div>
                  <p className="font-bold font-sans">• Kartesius ➔ Kutub:</p>
                  <div className="pl-3 space-y-1 pt-1">
                    <div><MathView math="r = \sqrt{x^2 + y^2}" /></div>
                    <div><MathView math="\alpha = \tan^{-1}\left(\frac{y}{x}\right)" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE 13: KONSEP DIKUASAI. SAATNYA BERAKSI.                     */}
      {/* ============================================================== */}
      {slideIndex === 12 && (
        <div className="text-center py-6 sm:py-10 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-[#10223e] font-display leading-tight">
            Konsep Dikuasai.<br />Saatnya Beraksi.
          </h2>

          <p className="text-sm sm:text-base text-[#183256] leading-relaxed max-w-lg mx-auto">
            Anda telah melengkapi Navigator's Toolkit Anda. Mulai dari mengukur sudut, mengekstrak sisi segitiga, menerjemahkan koordinat ruang, hingga selamat dari jebakan tanda kuadran.
          </p>

          <div className="pt-2">
            <Link
              to="/app/kuis/mod-trigo-1"
              onClick={onNavigateToQuiz}
              className="inline-flex items-center gap-2 bg-[#d8a436] hover:bg-[#c99528] text-[#10223e] font-black text-sm sm:text-base px-8 py-3.5 rounded-full border-2 border-[#10223e] shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Lanjut ke Latihan Soal</span>
              <ArrowRight size={18} className="stroke-[3]" />
            </Link>
          </div>

          <div className="pt-8 border-t-2 border-[#10223e]/20 text-[11px] sm:text-xs text-[#10223e] font-medium leading-relaxed">
            <strong>Mentalitas Ujian:</strong> Trigonometri bukan tentang menghafal 100 rumus berbeda, melainkan menggunakan 4 alat dasar dengan logika spasial yang benar.
          </div>
        </div>
      )}
    </div>
  );
};
