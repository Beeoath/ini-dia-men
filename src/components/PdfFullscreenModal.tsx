import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, FileText } from "lucide-react";

interface PdfFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  title?: string;
}

export const PdfFullscreenModal: React.FC<PdfFullscreenModalProps> = ({
  isOpen,
  onClose,
  pdfUrl = "/modul_trigonometri.html",
  title = "BAB 4: TRIGONOMETRI - Navigasi Sudut, Dimensi, dan Ruang Koordinat",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Listen to postMessage from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === "CLOSE_PDF_MODAL" || e.data?.type === "CLOSE_PDF_MODAL") {
        onClose();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      id="pdf-fullscreen-overlay"
      className="fixed inset-0 z-[99999] flex flex-col bg-slate-950 w-screen h-screen overflow-hidden select-none animate-in fade-in duration-150"
      style={{ margin: 0, padding: 0 }}
    >
      {/* 1. FLOATING HIGH-VISIBILITY CLOSE (X) BUTTON IN THE TOP-RIGHT CORNER */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-[100000] flex items-center gap-2">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/60 shadow-lg backdrop-blur-md transition-all"
        >
          <ExternalLink size={13} />
          <span>Buka Tab Baru</span>
        </a>

        {/* Super visible Red Close (X) button with glowing shadow and clear text */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Modal"
          className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs sm:text-sm border-2 border-white shadow-[0_0_25px_rgba(225,29,72,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <X size={20} className="stroke-[3]" />
          <span>TUTUP (X)</span>
        </button>
      </div>

      {/* 2. Top Status Bar */}
      <div className="h-14 sm:h-16 px-4 sm:px-6 bg-[#0a1020] border-b border-cyan-500/20 text-white flex items-center justify-between shrink-0 shadow-xl pr-36 sm:pr-48">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
              {title}
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold block truncate">
              Dokumen Resmi Modul Trigonometri · 13 Halaman Lengkap
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fullscreen Iframe */}
      <div className="flex-1 w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-[#1e222d] relative overflow-hidden">
        <iframe
          src={pdfUrl}
          title={title}
          className="w-full h-full border-none"
          allow="fullscreen"
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
