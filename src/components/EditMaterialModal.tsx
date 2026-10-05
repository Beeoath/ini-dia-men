import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Check,
  Trash2,
  Eye,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { SigmaModule } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import {
  saveCustomMaterial,
  getCustomMaterial,
  resetModuleToDefault,
  CustomMaterialData,
} from "../lib/pdfStorage";

export function isAllowedIframeUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.startsWith("blob:")) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    const isSameOrigin = parsed.origin === window.location.origin;
    const isGoogleDocs = hostname === "docs.google.com";
    const isGoogleDrive = hostname === "drive.google.com";
    return isSameOrigin || isGoogleDocs || isGoogleDrive;
  } catch {
    return false;
  }
}

export function isValidPdfUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.startsWith("blob:") || (url.startsWith("/") && !url.startsWith("//"))) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: SigmaModule | null;
  onSaved: () => void;
}

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  isOpen,
  onClose,
  module,
  onSaved,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [pageCount, setPageCount] = useState(14);

  // PDF upload states
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [existingMeta, setExistingMeta] = useState<CustomMaterialData | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Load existing configuration on modal open
  useEffect(() => {
    if (!module || !isOpen) return;

    let active = true;
    setTitle(module.title);
    setDescription(module.description);
    setDurationMinutes(module.durationMinutes || 20);
    setPageCount(module.slides?.length || 14);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setExternalUrl("");
    setIsPreviewOpen(false);

    const loadData = async () => {
      try {
        const custom = await getCustomMaterial(module.id);
        if (active && custom) {
          setExistingMeta(custom);
          setIsCustomActive(custom.isCustomPdf);
          if (custom.title) setTitle(custom.title);
          if (custom.description) setDescription(custom.description);
          if (custom.durationMinutes) setDurationMinutes(custom.durationMinutes);
          if (custom.pageCount) setPageCount(custom.pageCount);
          if (custom.externalPdfUrl) {
            setExternalUrl(custom.externalPdfUrl);
            setUploadMethod("url");
            setFilePreviewUrl(custom.externalPdfUrl);
          } else if (custom.pdfBlob) {
            setUploadMethod("file");
            const blobUrl = URL.createObjectURL(custom.pdfBlob);
            setFilePreviewUrl(blobUrl);
          }
        } else if (active) {
          setExistingMeta(null);
          setIsCustomActive(false);
        }
      } catch (err) {
        console.error("Failed to load material:", err);
      }
    };

    loadData();

    return () => {
      active = false;
      if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [module, isOpen]);

  if (!isOpen || !module) return null;

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Format file harus berupa dokumen PDF (.pdf)!");
      return;
    }

    // Limit to 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar! Maksimal 50 MB.");
      return;
    }

    setSelectedFile(file);
    if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    const newBlobUrl = URL.createObjectURL(file);
    setFilePreviewUrl(newBlobUrl);
    toast.success(`File "${file.name}" siap diunggah!`);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    if (!title.trim()) {
      toast.error("Judul modul tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      let pdfBlob: Blob | undefined = undefined;
      let pdfFileName = existingMeta?.pdfFileName;
      let pdfFileSize = existingMeta?.pdfFileSize;

      if (uploadMethod === "file") {
        if (selectedFile) {
          pdfBlob = selectedFile;
          pdfFileName = selectedFile.name;
          pdfFileSize = selectedFile.size;
        } else if (existingMeta?.pdfBlob) {
          pdfBlob = existingMeta.pdfBlob;
        }
      }

      if (uploadMethod === "url" && externalUrl.trim()) {
        const trimmedUrl = externalUrl.trim();
        if (!trimmedUrl.startsWith("https://")) {
          toast.error("Tautan URL PDF harus diawali dengan https://");
          setIsSaving(false);
          return;
        }
      }

      const hasPdf = Boolean(pdfBlob || (uploadMethod === "url" && externalUrl.trim()));

      const dataToSave: CustomMaterialData = {
        moduleId: module.id,
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes) || 20,
        pageCount: Number(pageCount) || 14,
        pdfFileName: uploadMethod === "file" ? pdfFileName : undefined,
        pdfFileSize: uploadMethod === "file" ? pdfFileSize : undefined,
        externalPdfUrl: uploadMethod === "url" ? externalUrl.trim() : undefined,
        pdfBlob,
        updatedAt: Date.now(),
        isCustomPdf: hasPdf,
      };

      await saveCustomMaterial(dataToSave);

      toast.success(
        hasPdf
          ? `Materi "${title}" dengan dokumen PDF khusus berhasil disimpan dan dipublikasikan ke siswa!`
          : `Informasi modul "${title}" berhasil diperbarui!`
      );

      onSaved();
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan materi:", err);
      toast.error("Terjadi kesalahan saat menyimpan materi. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reset to Default
  const handleReset = async () => {
    if (!module) return;
    if (
      !confirm(
        `Kembalikan modul "${module.title}" ke dokumen PDF bawaan sistem SIGMA? Dokumen PDF yang diunggah akan dihapus.`
      )
    ) {
      return;
    }

    try {
      await resetModuleToDefault(module.id);
      toast.success("Modul berhasil dikembalikan ke dokumen bawaan sistem.");
      onSaved();
      onClose();
    } catch (err) {
      console.error("Gagal reset:", err);
      toast.error("Gagal mengembalikan modul.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl transition-all my-auto max-h-[92vh] flex flex-col ${
          isDark
            ? "bg-[#0b1226] border-white/15 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between p-5 sm:p-6 border-b shrink-0 ${
            isDark ? "border-white/10 bg-[#070b18]" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400 border border-cyan-400/30">
                {module.districtName}
              </span>
              {isCustomActive && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles size={10} /> PDF Guru Aktif
                </span>
              )}
            </div>
            <h2 className="font-display text-lg sm:text-xl font-black tracking-tight">
              Edit Materi &amp; Upload PDF Modul
            </h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Unggah materi kurikulum buatan Anda sendiri agar dapat dibaca langsung oleh siswa di portal belajar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-white/10"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Judul Modul Pembelajaran
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Bab 1 - Aljabar & Matriks Lanjutan"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                  isDark
                    ? "bg-white/5 border-white/15 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Ringkasan / Deskripsi Modul
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat materi yang dipelajari siswa..."
                className={`w-full px-3.5 py-2 rounded-xl border text-xs leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                  isDark
                    ? "bg-white/5 border-white/15 text-slate-200 placeholder-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Estimasi Waktu Belajar (Menit)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                    isDark
                      ? "bg-white/5 border-white/15 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Estimasi Halaman Modul
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                    isDark
                      ? "bg-white/5 border-white/15 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section: Upload PDF Guru */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isDark ? "border-cyan-500/25 bg-cyan-950/20" : "border-cyan-200 bg-cyan-50/50"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="text-cyan-400" size={18} />
                <span className="font-display text-sm font-bold">
                  Dokumen Modul PDF Siswa
                </span>
              </div>

              {/* Method Tabs */}
              <div className="flex items-center p-0.5 rounded-lg bg-black/20 text-xs self-start">
                <button
                  type="button"
                  onClick={() => setUploadMethod("file")}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    uploadMethod === "file"
                      ? "bg-cyan-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Unggah File PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    uploadMethod === "url"
                      ? "bg-cyan-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tautan Link PDF
                </button>
              </div>
            </div>

            {uploadMethod === "file" ? (
              <div className="space-y-3">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                    dragActive
                      ? "border-cyan-400 bg-cyan-400/10 scale-[1.01]"
                      : isDark
                      ? "border-white/20 hover:border-cyan-400/60 bg-white/5 hover:bg-white/10"
                      : "border-slate-300 hover:border-cyan-500 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      {selectedFile
                        ? "Klik untuk mengganti file PDF terpilih"
                        : "Klik untuk memilih file PDF atau tarik dokumen ke sini"}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Mendukung dokumen PDF (hingga 50 MB). Tersimpan aman di memori browser guru.
                    </p>
                  </div>
                </div>

                {/* Display Current / Uploaded File Status */}
                {(selectedFile || existingMeta?.pdfFileName) && (
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-emerald-300 bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck size={18} className="shrink-0 text-emerald-400" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate">
                          {selectedFile?.name || existingMeta?.pdfFileName}
                        </span>
                        <span className="text-[10px] opacity-80 font-mono">
                          {formatFileSize(selectedFile?.size || existingMeta?.pdfFileSize)}
                          {selectedFile && " • Siap disimpan"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {filePreviewUrl && (
                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Eye size={12} />
                          {isPreviewOpen ? "Tutup Preview" : "Pratinjau"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        title="Hapus seleksi file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Tautan Dokumen PDF Online (Google Drive, Canva, atau URL Langsung)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={externalUrl}
                      onChange={(e) => {
                        setExternalUrl(e.target.value);
                        setFilePreviewUrl(e.target.value);
                      }}
                      placeholder="https://drive.google.com/... atau https://domain.com/materi.pdf"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                        isDark
                          ? "bg-white/5 border-white/15 text-white placeholder-slate-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <LinkIcon
                      size={15}
                      className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                    />
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Tips: Jika menggunakan Google Drive, pastikan tautan disetel "Siapa saja yang memiliki link dapat melihat".
                  </p>
                </div>

                {externalUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      {isPreviewOpen ? "Tutup Preview URL" : "Cek Pratinjau Tautan"}
                    </button>
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/15 hover:bg-white/10 flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} /> Buka Tab Baru
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Live PDF Inline Preview */}
            {isPreviewOpen && filePreviewUrl && (
              <div className="space-y-2 pt-2 border-t border-white/10 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                  <span>PRATINJAU DOKUMEN PDF GURU</span>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Tutup (X)
                  </button>
                </div>
                {isAllowedIframeUrl(filePreviewUrl) ? (
                  <div className="rounded-xl border border-white/15 overflow-hidden bg-black/50 shadow-inner h-64 sm:h-80">
                    <iframe
                      src={filePreviewUrl}
                      title="Pratinjau PDF Guru"
                      className="w-full h-full border-none"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-6 text-center flex flex-col items-center justify-center gap-3">
                    <FileText size={32} className="text-cyan-400 opacity-80" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">
                        Dokumen PDF Berasal dari Domain Eksternal
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-md">
                        Untuk keamanan peramban (CSP), tautan di luar Google Docs / Drive tidak disematkan di dalam iframe. Silakan buka dokumen di tab baru.
                      </p>
                    </div>
                    {isValidPdfUrl(filePreviewUrl) && (
                      <a
                        href={filePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md transition-all cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>Buka di tab baru</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div
            className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            {isCustomActive ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw size={13} /> Kembalikan ke PDF Bawaan
              </button>
            ) : (
              <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Saat ini menggunakan slide resmi SIGMA UNPAM
              </span>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? "border-white/10 text-slate-300 hover:bg-white/5"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 shadow-lg shadow-cyan-400/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menyimpan Dokumen...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Simpan &amp; Publikasikan ke Siswa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
