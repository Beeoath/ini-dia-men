import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Play,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { MODULES } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import { PdfFullscreenModal } from "../components/PdfFullscreenModal";
import { getModulePdfUrl } from "../lib/pdfStorage";

export default function Material() {
  const { id, moduleId } = useParams();
  const currentId = moduleId || id;
  const { isDark } = useTheme();

  const moduleData = MODULES.find((m) => m.id === currentId) || MODULES[0];

  // Default system fallback deck based on districtId
  let defaultPdfUrl = "/modul_bilangan.html";
  let defaultPdfTitle = "BAB 1: BILANGAN - Bilangan Real, Bilangan Berpangkat, dan Bentuk Akar";
  let defaultBadge = "MODUL RESMI · 14 HALAMAN";
  let defaultDescription = "Menampilkan 14 slide resmi Bab 1 Bilangan: keluarga bilangan real, 8 sifat eksponen, penyederhanaan bentuk akar, merasionalkan penyebut sekawan, dan telaah soal TKA.";

  if (moduleData.districtId === 2 || moduleData.id === "mod-aljabar-2") {
    defaultPdfUrl = "/modul_aljabar.html";
    defaultPdfTitle = "BAB 2: ALJABAR - Sistem Persamaan, Pertidaksamaan, Fungsi, Barisan & Deret";
    defaultBadge = "MODUL RESMI · 16 HALAMAN";
    defaultDescription = "Menampilkan 16 slide resmi Bab 2 Aljabar: SPLDV & SPLTV, daerah pertidaksamaan & optimasi titik pojok, fungsi kuadrat & rasional, komposisi invers cepat, barisan deret, hingga aplikasi keuangan.";
  } else if (moduleData.districtId === 3 || moduleData.id === "mod-geometri-1") {
    defaultPdfUrl = "/modul_geometri.html";
    defaultPdfTitle = "BAB 3: GEOMETRI DAN PENGUKURAN - Hubungan Sudut, Pythagoras, Bangun Ruang & Transformasi";
    defaultBadge = "MODUL RESMI · 15 HALAMAN";
    defaultDescription = "Menampilkan 15 slide resmi Bab 3 Geometri dan Pengukuran: relasi sudut transversal, kesebangunan & Pythagoras, pengukuran 2D/3D kubus rusuk a, proyeksi tegak lurus dimensi tiga, dan komposisi matriks transformasi.";
  } else if (moduleData.districtId === 4 || moduleData.id === "mod-trigo-1") {
    defaultPdfUrl = "/modul_trigonometri.html";
    defaultPdfTitle = "BAB 4: TRIGONOMETRI - Navigasi Sudut, Dimensi, dan Ruang Koordinat";
    defaultBadge = "MODUL RESMI · 13 HALAMAN";
    defaultDescription = "Menampilkan 13 slide resmi Bab 4 Trigonometri: skala sudut, perbandingan segitiga siku-siku, kompas kuadran, dan telaah soal UTBK.";
  }

  // Dynamic states with support for teacher-uploaded PDF
  const [activePdfUrl, setActivePdfUrl] = useState<string>(defaultPdfUrl);
  const [isCustomPdf, setIsCustomPdf] = useState<boolean>(false);
  const [pdfTitle, setPdfTitle] = useState<string>(defaultPdfTitle);
  const [pdfDescription, setPdfDescription] = useState<string>(defaultDescription);
  const [pageCountBadge, setPageCountBadge] = useState<string>(defaultBadge);

  // Fullscreen PDF Modal State - opened by default so user immediately sees the PDF
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(true);

  // Load custom PDF or fallback to system
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const res = await getModulePdfUrl(moduleData.id, defaultPdfUrl);
        if (active) {
          if (res.isCustom && res.url) {
            setActivePdfUrl(res.url);
            setIsCustomPdf(true);
            if (res.data?.title) setPdfTitle(res.data.title);
            if (res.data?.description) setPdfDescription(res.data.description);
            setPageCountBadge(
              res.fileName
                ? `PDF GURU · ${res.fileName.toUpperCase()}`
                : `DOKUMEN GURU · ${res.data?.pageCount || 14} HALAMAN`
            );
          } else {
            setActivePdfUrl(defaultPdfUrl);
            setIsCustomPdf(false);
            setPdfTitle(defaultPdfTitle);
            setPdfDescription(defaultDescription);
            setPageCountBadge(defaultBadge);
          }
        }
      } catch (err) {
        console.error("Failed to load custom PDF:", err);
      }
    };

    loadData();

    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.moduleId === moduleData.id) {
        loadData();
      }
    };
    window.addEventListener("sigma_material_updated", handleUpdate);

    return () => {
      active = false;
      window.removeEventListener("sigma_material_updated", handleUpdate);
    };
  }, [moduleData.id, defaultPdfUrl, defaultPdfTitle, defaultDescription, defaultBadge]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 sm:py-6 px-3 sm:px-0">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/app/modul/${moduleData.id}`}
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
            isDark ? "text-slate-300 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600"
          }`}
        >
          <ArrowLeft size={16} /> Kembali ke Info Modul
        </Link>

        {/* Quick Launch PDF Button */}
        <button
          type="button"
          onClick={() => setIsPdfModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Maximize2 size={14} className="stroke-[2.5]" />
          <span>Buka PDF Fullscreen</span>
        </button>
      </div>

      {/* Main Module Card */}
      <div
        className={`rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8 transition-all ${
          isDark
            ? "border-cyan-500/20 bg-[#0c1226]/95 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
            : "border-slate-200 bg-white text-slate-900 shadow-xl"
        }`}
      >
        {/* Module Header Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isCustomPdf
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                  : "bg-cyan-400/15 text-cyan-400 border-cyan-400/30"
              }`}
            >
              {isCustomPdf && <Sparkles size={11} className="inline mr-1 -mt-0.5" />}
              {pageCountBadge}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
              TARGET UTBK 2026
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight">
            {pdfTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 dark:text-slate-300 leading-relaxed max-w-2xl">
            {pdfDescription}
          </p>
        </div>

        {/* PDF Callout & Quick Launch Box */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
            isDark
              ? "bg-gradient-to-r from-[#091126] via-[#101b3d] to-[#091126] border-cyan-400/30 text-white"
              : "bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 border-cyan-300 text-slate-900"
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-lg">
              <FileText size={30} />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-display font-black text-lg sm:text-xl">
                {isCustomPdf ? "Dokumen Modul PDF Guru" : "Dokumen Modul PDF Resmi"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {pdfDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(0,240,255,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Maximize2 size={16} className="stroke-[2.5]" />
              <span>Buka Modul PDF (Fullscreen)</span>
            </button>

            <Link
              to={`/app/kuis/${moduleData.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#d8a436] hover:bg-[#c49226] text-[#10223e] font-black text-xs sm:text-sm border border-[#10223e] shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play size={15} fill="currentColor" />
              <span>Latihan Soal (Kuis TKA)</span>
            </Link>
          </div>
        </div>

        {/* Embedded Iframe Preview on the page */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
            <span>PRATINJAU DOKUMEN PDF ({pageCountBadge})</span>
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 size={12} /> Buka Layar Penuh
            </button>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden shadow-xl ${
              isDark ? "border-cyan-500/20 bg-[#090e1f]" : "border-slate-300 bg-slate-100"
            }`}
          >
            <iframe
              src={activePdfUrl}
              title={`Pratinjau Modul PDF ${pdfTitle}`}
              className="w-full h-[520px] sm:h-[640px] border-none"
            />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MODAL / OVERLAY FULLSCREEN BERISI <iframe> DENGAN TOMBOL CLOSE (X) */}
      {/* ================================================================== */}
      <PdfFullscreenModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={activePdfUrl}
        title={pdfTitle}
      />
    </div>
  );
}
