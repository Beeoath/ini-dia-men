import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Plus,
  Edit,
  Clock,
  Timer,
  X,
  Check,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { MODULES, DISTRICTS, SigmaModule } from "../lib/sigmaData";
import { useTheme } from "../lib/theme";
import { EditMaterialModal } from "../components/EditMaterialModal";
import { getMaterialMetaSync } from "../lib/pdfStorage";
import { supabase } from "../lib/supabaseClient";

export default function TeacherContent() {
  const { isDark } = useTheme();
  const [modulesList] = useState<SigmaModule[]>(MODULES);
  const [selectedDistrict, setSelectedDistrict] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Teacher timer configuration modal state
  const [timerModalModule, setTimerModalModule] = useState<SigmaModule | null>(null);
  const [modalTimerEnabled, setModalTimerEnabled] = useState<boolean>(true);
  const [modalMinutes, setModalMinutes] = useState<number>(15);
  const [customInput, setCustomInput] = useState<string>("15");
  const [savingTimer, setSavingTimer] = useState<boolean>(false);

  // Quiz settings loaded from Supabase
  const [quizSettingsMap, setQuizSettingsMap] = useState<
    Record<string, { timer_enabled: boolean; time_limit: number }>
  >({});
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  // Teacher edit material & upload PDF modal state
  const [editModalModule, setEditModalModule] = useState<SigmaModule | null>(null);

  // Load quiz_settings from Supabase and migrate any leftover localStorage keys
  useEffect(() => {
    let active = true;

    const loadQuizSettings = async () => {
      setLoadingSettings(true);
      try {
        const { data, error } = await supabase
          .from("quiz_settings")
          .select("module_id, timer_enabled, time_limit");

        if (error) {
          console.error("[TeacherContent] Gagal memuat quiz_settings:", error);
          toast.error("Gagal memuat pengaturan timer kuis dari server.");
          if (active) setLoadingSettings(false);
          return;
        }

        if (!active) return;

        const map: Record<string, { timer_enabled: boolean; time_limit: number }> = {};
        if (data) {
          for (const row of data) {
            map[row.module_id] = {
              timer_enabled: Boolean(row.timer_enabled),
              time_limit: typeof row.time_limit === "number" ? row.time_limit : 15,
            };
          }
        }

        // Migrasi sekali jalan: jika ada di localStorage tapi belum ada di Supabase
        for (const mod of MODULES) {
          const localEnabled = localStorage.getItem(`quiz_timer_enabled_${mod.id}`);
          const localLimit = localStorage.getItem(`quiz_timelimit_${mod.id}`);

          if (map[mod.id] === undefined) {
            if (localEnabled !== null || localLimit !== null) {
              const isEnabled = localEnabled !== null ? localEnabled === "true" : true;
              const minutes = localLimit ? parseInt(localLimit, 10) : mod.quizTimeLimitMinutes || 15;

              try {
                const { error: upsertErr } = await supabase.from("quiz_settings").upsert({
                  module_id: mod.id,
                  timer_enabled: isEnabled,
                  time_limit: minutes,
                  updated_at: new Date().toISOString(),
                });
                if (upsertErr) {
                  console.error(`[TeacherContent] Gagal migrasi timer ${mod.id}:`, upsertErr);
                } else {
                  map[mod.id] = { timer_enabled: isEnabled, time_limit: minutes };
                }
              } catch (e) {
                console.error(`[TeacherContent] Exception migrasi timer ${mod.id}:`, e);
              }
              try {
                localStorage.removeItem(`quiz_timer_enabled_${mod.id}`);
                localStorage.removeItem(`quiz_timelimit_${mod.id}`);
              } catch {}
            } else {
              // Jika tidak ada di DB dan tidak ada di localStorage, default timer nonaktif
              map[mod.id] = {
                timer_enabled: false,
                time_limit: mod.quizTimeLimitMinutes || 15,
              };
            }
          } else {
            // Sudah ada di Supabase, hapus key lokalnya
            if (localEnabled !== null || localLimit !== null) {
              try {
                localStorage.removeItem(`quiz_timer_enabled_${mod.id}`);
                localStorage.removeItem(`quiz_timelimit_${mod.id}`);
              } catch {}
            }
          }
        }

        setQuizSettingsMap(map);
        setLoadingSettings(false);
      } catch (err) {
        console.error("[TeacherContent] Exception saat memuat quiz_settings:", err);
        toast.error("Terjadi kesalahan saat memuat pengaturan kuis.");
        if (active) setLoadingSettings(false);
      }
    };

    loadQuizSettings();

    return () => {
      active = false;
    };
  }, []);

  // Helper to get configured timer info for a module
  const getModuleTimerInfo = (mod: SigmaModule) => {
    const setting = quizSettingsMap[mod.id];
    if (setting) {
      return { isEnabled: setting.timer_enabled, minutes: setting.time_limit };
    }
    return { isEnabled: false, minutes: mod.quizTimeLimitMinutes || 15 };
  };

  const handleOpenTimerModal = (mod: SigmaModule) => {
    const info = getModuleTimerInfo(mod);
    setTimerModalModule(mod);
    setModalTimerEnabled(info.isEnabled);
    setModalMinutes(info.minutes);
    setCustomInput(String(info.minutes));
  };

  const handleSaveTimer = async () => {
    if (!timerModalModule) return;
    const validMinutes = Math.max(1, Math.min(180, modalMinutes));
    setSavingTimer(true);

    try {
      const { error } = await supabase.from("quiz_settings").upsert({
        module_id: timerModalModule.id,
        timer_enabled: modalTimerEnabled,
        time_limit: validMinutes,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[TeacherContent] Gagal menyimpan quiz_settings:", error);
        toast.error("Gagal menyimpan pengaturan batas waktu ke server.");
        setSavingTimer(false);
        return;
      }

      setQuizSettingsMap((prev) => ({
        ...prev,
        [timerModalModule.id]: {
          timer_enabled: modalTimerEnabled,
          time_limit: validMinutes,
        },
      }));

      try {
        localStorage.removeItem(`quiz_timer_enabled_${timerModalModule.id}`);
        localStorage.removeItem(`quiz_timelimit_${timerModalModule.id}`);
      } catch {}

      toast.success(
        modalTimerEnabled
          ? `Batas waktu kuis ${timerModalModule.title} diatur ke ${validMinutes} menit!`
          : `Timer kuis ${timerModalModule.title} dinonaktifkan (tanpa batas waktu).`
      );
      setTimerModalModule(null);
    } catch (err) {
      console.error("[TeacherContent] Exception saat menyimpan quiz_settings:", err);
      toast.error("Terjadi kesalahan saat menyimpan pengaturan batas waktu.");
    } finally {
      setSavingTimer(false);
    }
  };

  const filtered =
    selectedDistrict === 0
      ? modulesList
      : modulesList.filter((m) => m.districtId === selectedDistrict);

  return (
    <div className="w-full space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-500 uppercase tracking-widest">
              BANK MATERI &amp; KURIKULUM
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-400 font-medium">MA Darunnajah 9</span>
          </div>
          <h1
            className={`font-display text-2xl sm:text-3xl font-black mt-1 ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Kelola Modul Pembelajaran
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Atur silabus materi slide, batas waktu pengerjaan kuis, dan unggah dokumen PDF per distrik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (modulesList.length > 0) setEditModalModule(modulesList[0]);
          }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black shadow-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-400/20 hover:scale-105 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Upload PDF / Edit Materi
        </button>
      </div>

      {/* District Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => setSelectedDistrict(0)}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedDistrict === 0
              ? isDark
                ? "bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-400/20"
                : "bg-slate-900 text-white font-black shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-white hover:bg-white/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Semua Distrik ({modulesList.length})
        </button>
        {DISTRICTS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedDistrict(d.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedDistrict === d.id
                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40"
                : isDark
                ? "text-slate-400 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Distrik {d.id}
          </button>
        ))}
      </div>

      {/* Modules List */}
      {loadingSettings ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="font-mono text-xs text-slate-400">Memuat konfigurasi materi dan kuis...</span>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((mod) => {
            const timerInfo = getModuleTimerInfo(mod);
            const customMeta = getMaterialMetaSync(mod.id);
            const displayTitle = customMeta?.title || mod.title;
            const displayDesc = customMeta?.description || mod.description;
            const displayDuration = customMeta?.durationMinutes || mod.durationMinutes;
            const displayPages = customMeta?.pageCount || mod.slides.length;
            const isCustomPdf = customMeta?.isCustomPdf;

            return (
              <div
                key={`${mod.id}-${refreshKey}`}
                className={`rounded-3xl border p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
                  isDark
                    ? "border-white/10 bg-[#121629] hover:border-cyan-400/30"
                    : "border-slate-200 bg-white hover:border-cyan-500/50"
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                      {mod.districtName}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        timerInfo.isEnabled
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                          : "border-slate-400/30 bg-slate-400/10 text-slate-400"
                      }`}
                    >
                      <Timer size={10} />
                      {timerInfo.isEnabled ? `${timerInfo.minutes} Menit Kuis` : "Kuis Tanpa Timer"}
                    </span>
                    {isCustomPdf && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                        <FileText size={10} /> PDF Guru Aktif
                      </span>
                    )}
                  </div>

                  <h3 className={`font-display text-sm sm:text-base font-bold truncate ${isDark ? "text-white" : "text-slate-950"}`}>
                    {displayTitle}
                  </h3>

                  <p className={`text-xs line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {displayDesc}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                    <span>{displayDuration} Menit Belajar</span>
                    <span>•</span>
                    <span>{displayPages} Halaman Dokumen</span>
                    <span>•</span>
                    <span>{mod.quiz.length} Soal Evaluasi</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenTimerModal(mod)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isDark
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                        : "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                    }`}
                  >
                    <Timer size={13} /> Atur Waktu
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditModalModule(mod)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Edit size={13} /> Edit / Upload PDF
                  </button>

                  <Link
                    to={`/app/materi/${mod.id}`}
                    target="_blank"
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isDark
                        ? "border-white/10 text-slate-300 hover:text-white"
                        : "border-slate-200 text-slate-700 hover:text-slate-900"
                    }`}
                    title="Pratinjau Siswa"
                  >
                    <Eye size={13} /> Pratinjau ↗
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Timer Settings Modal */}
      {timerModalModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-5 transition-all ${
              isDark
                ? "bg-[#0b132b] border-white/15 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                  Pengaturan Evaluasi Guru
                </span>
                <h3 className="font-display text-lg font-bold mt-0.5">
                  Batas Waktu Kuis
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Modul: <strong className="text-white dark:text-cyan-300">{timerModalModule.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTimerModalModule(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Toggle Timer */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div>
                <div className="text-xs font-bold">Aktifkan Hitung Mundur</div>
                <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Siswa wajib menyelesaikan sebelum waktu habis
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalTimerEnabled}
                  onChange={(e) => setModalTimerEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Presets and Custom Input */}
            {modalTimerEnabled && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Pilih Durasi Waktu Kuis:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20, 30, 45, 60].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setModalMinutes(preset);
                        setCustomInput(String(preset));
                      }}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        modalMinutes === preset
                          ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                          : isDark
                          ? "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-400"
                      }`}
                    >
                      {preset} mnt
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customInput}
                      onChange={(e) => {
                        setCustomInput(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) setModalMinutes(val);
                      }}
                      placeholder="Kustom"
                      className={`w-full py-1.5 px-2 text-center rounded-xl border text-xs font-mono font-bold ${
                        isDark ? "bg-black/30 border-white/15 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
                <p className={`text-[11px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Durasi terpilih: <span className="text-cyan-400 font-bold">{modalMinutes} Menit</span> ({modalMinutes * 60} detik)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setTimerModalModule(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  isDark
                    ? "border-white/10 text-slate-300 hover:bg-white/5"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTimer}
                disabled={savingTimer}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={14} /> {savingTimer ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Edit Material & Upload PDF Modal */}
      <EditMaterialModal
        isOpen={Boolean(editModalModule)}
        onClose={() => setEditModalModule(null)}
        module={editModalModule}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
