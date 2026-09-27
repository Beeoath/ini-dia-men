import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  BookOpen,
  Calculator,
  Compass,
  Box,
  Layers,
  TrendingUp,
  HelpCircle,
  Eye,
  CornerDownLeft,
} from "lucide-react";
import { MathView } from "./MathView";

interface LatexInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (latexCode: string) => void;
  isDark: boolean;
  initialValue?: string;
  title?: string;
}

export const LatexInputModal: React.FC<LatexInputModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  isDark,
  initialValue = "",
  title = "Input Rumus Matematika (LaTeX)",
}) => {
  const [latexInput, setLatexInput] = useState(initialValue || "\\frac{a}{b}");
  const [mode, setMode] = useState<"inline" | "block">("inline");
  const [activeCategory, setActiveCategory] = useState<
    "dasar" | "trigo" | "matriks" | "kalkulus" | "simbol" | "preset"
  >("dasar");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleInsertSnippet = (snippet: string) => {
    setLatexInput((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  const handleCopy = () => {
    const formatted = mode === "inline" ? `$${latexInput.trim()}$` : `$$${latexInput.trim()}$$`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConfirmInsert = () => {
    if (!latexInput.trim()) return;
    const formatted = mode === "inline" ? `$${latexInput.trim()}$` : `$$${latexInput.trim()}$$`;
    onInsert(formatted);
    onClose();
  };

  const categories = [
    { id: "dasar", label: "Dasar & Pecahan", icon: Calculator },
    { id: "trigo", label: "Trigonometri", icon: Compass },
    { id: "matriks", label: "Matriks & Vektor", icon: Box },
    { id: "kalkulus", label: "Aljabar & Limit", icon: TrendingUp },
    { id: "simbol", label: "Simbol & Yunani", icon: Layers },
    { id: "preset", label: "Rumus Siap Pakai", icon: Sparkles },
  ];

  const snippetsMap = {
    dasar: [
      { label: "Pecahan", code: "\\frac{a}{b}", preview: "\\frac{a}{b}" },
      { label: "Akar Kuadrat", code: "\\sqrt{x}", preview: "\\sqrt{x}" },
      { label: "Akar Ordo n", code: "\\sqrt[n]{x}", preview: "\\sqrt[n]{x}" },
      { label: "Pangkat", code: "x^{2}", preview: "x^2" },
      { label: "Indeks Bawah", code: "x_{1}", preview: "x_1" },
      { label: "Plus Minus", code: "\\pm", preview: "\\pm" },
      { label: "Kali (Titik)", code: "\\cdot", preview: "\\cdot" },
      { label: "Kali (Silang)", code: "\\times", preview: "\\times" },
      { label: "Bagi", code: "\\div", preview: "\\div" },
      { label: "Kurung Besar", code: "\\left( \\frac{x}{y} \\right)", preview: "\\left(\\frac{x}{y}\\right)" },
      { label: "Kurung Siku", code: "\\left[ a + b \\right]", preview: "\\left[a+b\\right]" },
      { label: "Harga Mutlak", code: "\\left| x \\right|", preview: "|x|" },
    ],
    trigo: [
      { label: "sin α", code: "\\sin\\alpha", preview: "\\sin\\alpha" },
      { label: "cos α", code: "\\cos\\alpha", preview: "\\cos\\alpha" },
      { label: "tan α", code: "\\tan\\alpha", preview: "\\tan\\alpha" },
      { label: "cosec α", code: "\\csc\\alpha", preview: "\\csc\\alpha" },
      { label: "sec α", code: "\\sec\\alpha", preview: "\\sec\\alpha" },
      { label: "cotan α", code: "\\cot\\alpha", preview: "\\cot\\alpha" },
      { label: "Identitas Sin²+Cos²", code: "\\sin^2\\alpha + \\cos^2\\alpha = 1", preview: "\\sin^2\\alpha + \\cos^2\\alpha = 1" },
      { label: "Sudut Rangkap Sin", code: "\\sin(2A) = 2\\sin A \\cos A", preview: "\\sin(2A) = 2\\sin A\\cos A" },
      { label: "Sudut Rangkap Cos", code: "\\cos(2A) = \\cos^2 A - \\sin^2 A", preview: "\\cos(2A) = \\cos^2 A - \\sin^2 A" },
      { label: "Aturan De-Mi", code: "\\sin\\alpha = \\frac{\\text{Depan}}{\\text{Miring}}", preview: "\\sin\\alpha = \\frac{\\text{De}}{\\text{Mi}}" },
      { label: "Aturan Sa-Mi", code: "\\cos\\alpha = \\frac{\\text{Samping}}{\\text{Miring}}", preview: "\\cos\\alpha = \\frac{\\text{Sa}}{\\text{Mi}}" },
      { label: "Aturan De-Sa", code: "\\tan\\alpha = \\frac{\\text{Depan}}{\\text{Samping}}", preview: "\\tan\\alpha = \\frac{\\text{De}}{\\text{Sa}}" },
      { label: "Arctan", code: "\\arctan\\left(\\frac{y}{x}\\right)", preview: "\\arctan\\left(\\frac{y}{x}\\right)" },
      { label: "Derajat ke Radian", code: "180^\\circ = \\pi\\text{ rad}", preview: "180^\\circ = \\pi\\text{ rad}" },
    ],
    matriks: [
      {
        label: "Matriks 2x2",
        code: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
        preview: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
      },
      {
        label: "Matriks Siku 2x2",
        code: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
        preview: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
      },
      {
        label: "Determinan 2x2",
        code: "\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc",
        preview: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc",
      },
      {
        label: "Invers Matriks 2x2",
        code: "A^{-1} = \\frac{1}{\\det(A)} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}",
        preview: "A^{-1} = \\frac{1}{\\det} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}",
      },
      {
        label: "Vektor 2D",
        code: "\\vec{v} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}",
        preview: "\\vec{v} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}",
      },
      {
        label: "Vektor 3D",
        code: "\\vec{u} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}",
        preview: "\\vec{u} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}",
      },
      {
        label: "Panjang Vektor",
        code: "|\\vec{v}| = \\sqrt{x^2 + y^2 + z^2}",
        preview: "|\\vec{v}| = \\sqrt{x^2 + y^2}",
      },
      {
        label: "Matriks 3x3",
        code: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
        preview: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
      },
    ],
    kalkulus: [
      { label: "Limit x mendekati 0", code: "\\lim_{x \\to 0} f(x)", preview: "\\lim_{x \\to 0} f(x)" },
      { label: "Limit x mendekati c", code: "\\lim_{x \\to c} \\frac{f(x)}{g(x)}", preview: "\\lim_{x \\to c}" },
      { label: "Turunan Pertama", code: "f'(x) = \\frac{df}{dx}", preview: "f'(x) = \\frac{df}{dx}" },
      { label: "Turunan Parsial", code: "\\frac{\\partial f}{\\partial x}", preview: "\\frac{\\partial f}{\\partial x}" },
      { label: "Integral Tak Tentu", code: "\\int f(x)\\,dx", preview: "\\int f(x)\\,dx" },
      { label: "Integral Tentu", code: "\\int_{a}^{b} f(x)\\,dx", preview: "\\int_a^b f(x)\\,dx" },
      { label: "Sigma Deret", code: "\\sum_{i=1}^{n} a_i", preview: "\\sum_{i=1}^n a_i" },
      { label: "Perkalian Pi", code: "\\prod_{i=1}^{n} x_i", preview: "\\prod_{i=1}^n x_i" },
      { label: "Tak Hingga", code: "\\infty", preview: "\\infty" },
    ],
    simbol: [
      { label: "alpha", code: "\\alpha", preview: "\\alpha" },
      { label: "beta", code: "\\beta", preview: "\\beta" },
      { label: "gamma", code: "\\gamma", preview: "\\gamma" },
      { label: "theta", code: "\\theta", preview: "\\theta" },
      { label: "pi", code: "\\pi", preview: "\\pi" },
      { label: "lambda", code: "\\lambda", preview: "\\lambda" },
      { label: "Delta", code: "\\Delta", preview: "\\Delta" },
      { label: "Sigma", code: "\\Sigma", preview: "\\Sigma" },
      { label: "omega", code: "\\omega", preview: "\\omega" },
      { label: "Kurang dari sama", code: "\\le", preview: "\\le" },
      { label: "Lebih dari sama", code: "\\ge", preview: "\\ge" },
      { label: "Tidak sama dengan", code: "\\neq", preview: "\\neq" },
      { label: "Mendekati / Kira-kira", code: "\\approx", preview: "\\approx" },
      { label: "Elemen dari", code: "\\in", preview: "\\in" },
      { label: "Untuk setiap", code: "\\forall", preview: "\\forall" },
      { label: "Ada / Terdapat", code: "\\exists", preview: "\\exists" },
    ],
    preset: [
      {
        label: "Rumus Kuadratik (ABC)",
        code: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        preview: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      },
      {
        label: "Translasi Kutub ke Kartesius",
        code: "x = r\\cos\\alpha, \\quad y = r\\sin\\alpha",
        preview: "x = r\\cos\\alpha, \\; y = r\\sin\\alpha",
      },
      {
        label: "Translasi Kartesius ke Kutub",
        code: "r = \\sqrt{x^2 + y^2}, \\quad \\alpha = \\arctan\\left(\\frac{y}{x}\\right)",
        preview: "r = \\sqrt{x^2 + y^2}",
      },
      {
        label: "Kombinasi n dari k",
        code: "C(n, k) = \\frac{n!}{k!(n-k)!}",
        preview: "C(n, k) = \\frac{n!}{k!(n-k)!}",
      },
      {
        label: "Permutasi n dari k",
        code: "P(n, k) = \\frac{n!}{(n-k)!}",
        preview: "P(n, k) = \\frac{n!}{(n-k)!}",
      },
      {
        label: "Teorema Pythagoras",
        code: "a^2 + b^2 = c^2",
        preview: "a^2 + b^2 = c^2",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl backdrop-blur-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark
            ? "border-cyan-500/30 bg-[#0d1020]/95 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
            : "border-slate-300 bg-white text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 sm:p-5 border-b shrink-0 ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-black tracking-tight">
                {title}
              </h3>
              <p
                className={`text-[11px] ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Ketik kode LaTeX matematika atau pilih template visual di bawah
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? "border-white/10 hover:bg-white/10 text-slate-400 hover:text-white"
                : "border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-950"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* 1. REAL-TIME KATEX LIVE PREVIEW BOX */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Eye size={13} /> Pratinjau Formula Real-Time (KaTeX)
              </span>
              <span
                className={`text-[10px] ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Mode: {mode === "inline" ? "Baris ($...$)" : "Blok Tengah ($$...$$)"}
              </span>
            </div>

            <div
              className={`p-4 sm:p-5 rounded-2xl border min-h-[90px] flex items-center justify-center text-center transition-all overflow-x-auto ${
                isDark
                  ? "bg-[#080a15] border-cyan-500/30 text-white shadow-inner"
                  : "bg-cyan-50/50 border-cyan-300 text-slate-950 shadow-inner"
              }`}
            >
              {latexInput.trim() ? (
                <div className="text-base sm:text-xl font-medium tracking-wide">
                  <MathView math={latexInput.trim()} block={mode === "block"} />
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-mono italic">
                  Formula masih kosong. Ketik LaTeX atau klik tombol rumus di bawah...
                </span>
              )}
            </div>
          </div>

          {/* 2. LATEX CODE EDITOR TEXTAREA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                className={`font-mono font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Kode LaTeX:
              </label>

              {/* Format Switcher: Inline ($) vs Block ($$) */}
              <div
                className={`p-0.5 rounded-xl border flex items-center text-[10px] font-bold ${
                  isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMode("inline")}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    mode === "inline"
                      ? "bg-cyan-400 text-slate-950 font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Format inline: $formula$"
                >
                  $ Inline
                </button>
                <button
                  type="button"
                  onClick={() => setMode("block")}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    mode === "block"
                      ? "bg-cyan-400 text-slate-950 font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Format display block: $$formula$$"
                >
                  $$ Blok
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder="Contoh: \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} atau \sin^2 x + \cos^2 x = 1"
                className={`w-full p-3 font-mono text-xs sm:text-sm rounded-2xl outline-none transition-all shadow-inner resize-none ${
                  isDark
                    ? "bg-[#090b18] border border-white/15 text-cyan-300 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
                    : "bg-white border border-slate-300 text-cyan-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30"
                }`}
              />

              <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLatexInput("")}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-rose-400 bg-white/5 border border-white/10 transition-colors"
                  title="Kosongkan"
                >
                  <RotateCcw size={11} className="inline mr-1" /> Reset
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-cyan-300 bg-cyan-400/15 border border-cyan-400/30 hover:bg-cyan-400/25 transition-colors"
                  title="Salin kode LaTeX"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="inline mr-1 text-emerald-400" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="inline mr-1" /> Salin
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3. VISUAL MATH CATEGORY TABS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                      isActive
                        ? isDark
                          ? "bg-cyan-400 text-slate-950 border-cyan-400 font-black shadow-md shadow-cyan-400/20"
                          : "bg-slate-950 text-white border-slate-950 font-black shadow-md"
                        : isDark
                        ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Snippets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
              {snippetsMap[activeCategory]?.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertSnippet(item.code)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer group hover:scale-[1.02] ${
                    isDark
                      ? "bg-white/[0.04] border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 text-slate-200"
                      : "bg-slate-50 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 text-slate-800"
                  }`}
                  title={`Klik untuk menyisipkan ${item.label}`}
                >
                  <span className="text-[10px] font-mono text-slate-400 truncate block">
                    {item.label}
                  </span>
                  <div className="py-1 text-center font-bold text-xs truncate">
                    <MathView math={item.preview} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tip / Panduan */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 text-[11px] ${
              isDark
                ? "bg-white/[0.02] border-white/10 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400 shrink-0" />
              <span>
                Tips: Bungkus formula dengan tanda <code>$rumus$</code> saat mengetik langsung di pesan chat.
              </span>
            </div>
            <span className="font-mono font-bold text-cyan-400 shrink-0">KaTeX Ready ✓</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 shrink-0 ${
            isDark ? "border-white/10 bg-[#0a0d1c]" : "border-slate-200 bg-slate-50"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirmInsert}
            disabled={!latexInput.trim()}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-400/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CornerDownLeft size={14} className="stroke-[2.5]" />
            <span>Sisipkan ke Pesan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
