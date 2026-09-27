import { useState } from "react";
import { Layers, Plus, Edit, Clock, Zap, Timer, X, Check } from "lucide-react";
import { toast } from "sonner";
import { MODULES, DISTRICTS, SigmaModule } from "../lib/sigmaData";
import { Badge } from "../components/Primitives";
import { useTheme } from "../lib/theme";

export default function TeacherContent() {
  const { isDark } = useTheme();
  const [modulesList] = useState<SigmaModule[]>(MODULES);
  const [selectedDistrict, setSelectedDistrict] = useState<number>(0);

  // Teacher timer configuration modal state
  const [timerModalModule, setTimerModalModule] = useState<SigmaModule | null>(null);
  const [modalTimerEnabled, setModalTimerEnabled] = useState<boolean>(true);
  const [modalMinutes, setModalMinutes] = useState<number>(15);
  const [customInput, setCustomInput] = useState<string>("15");

  // Helper to get configured timer info for a module
  const getModuleTimerInfo = (mod: SigmaModule) => {
    const savedEnabled = localStorage.getItem(`quiz_timer_enabled_${mod.id}`);
    const isEnabled = savedEnabled !== null ? savedEnabled === "true" : true;
    const savedLimit = localStorage.getItem(`quiz_timelimit_${mod.id}`);
    const minutes = savedLimit ? parseInt(savedLimit, 10) : mod.quizTimeLimitMinutes || 15;
    return { isEnabled, minutes };
  };

  const handleOpenTimerModal = (mod: SigmaModule) => {
    const info = getModuleTimerInfo(mod);
    setTimerModalModule(mod);
    setModalTimerEnabled(info.isEnabled);
    setModalMinutes(info.minutes);
    setCustomInput(String(info.minutes));
  };

  const handleSaveTimer = () => {
    if (!timerModalModule) return;
    const validMinutes = Math.max(1, Math.min(180, modalMinutes));
    localStorage.setItem(`quiz_timer_enabled_${timerModalModule.id}`, String(modalTimerEnabled));
    localStorage.setItem(`quiz_timelimit_${timerModalModule.id}`, String(validMinutes));

    toast.success(
      modalTimerEnabled
        ? `Batas waktu kuis ${timerModalModule.title} diatur ke ${validMinutes} menit!`
        : `Timer kuis ${timerModalModule.title} dinonaktifkan (tanpa batas waktu).`
    );
    setTimerModalModule(null);
  };

  const filtered =
    selectedDistrict === 0
      ? modulesList
      : modulesList.filter((m) => m.districtId === selectedDistrict);

  return (
    <div className="space-y-6 w-full py-2 sm:py-4 px-1 sm:px-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="yellow">
            <Layers size={12} /> BANK MATERI &amp; KURIKULUM
          </Badge>
          <h1
            className={`mt-2 font-display text-2xl sm:text-3xl font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Kelola Modul Pembelajaran SIGMA
          </h1>
          <p
            className={`mt-0.5 text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Atur materi slide teori, bank soal kuis, dan kurikulum untuk siswa Kelas 11 MA Darunnajah 9.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            toast.info("Fitur penambahan modul dibuka pada semester ganjil mendatang.")
          }
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black shadow-lg bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/20 hover:scale-105 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Buat Modul Baru
        </button>
      </div>

      {/* District Filter Tabs */}
      <div
        className={`flex flex-wrap items-center gap-2 border-b pb-3 ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}
      >
        <button
          type="button"
          onClick={() => setSelectedDistrict(0)}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedDistrict === 0
              ? isDark
                ? "bg-white/15 text-white"
                : "bg-slate-900 text-white"
              : isDark
              ? "text-slate-400 hover:text-white"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Semua Distrik ({modulesList.length})
        </button>
        {DISTRICTS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedDistrict(d.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedDistrict === d.id
                ? "bg-cyan-400/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/40"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {d.name.split("&")[0]}
          </button>
        ))}
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {filtered.map((mod) => {
          const timerInfo = getModuleTimerInfo(mod);

          return (
            <div
              key={mod.id}
              className={`rounded-2xl border p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isDark
                  ? "border-white/10 bg-[#0d1430]/80 text-slate-100"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block">
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
                    {timerInfo.isEnabled ? `Waktu Kuis: ${timerInfo.minutes} Menit` : "Kuis: Bebas (Tanpa Timer)"}
                  </span>
                </div>
                <h3
                  className={`font-display text-base sm:text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-950"
                  }`}
                >
                  {mod.title}
                </h3>
                <p
                  className={`text-xs max-w-xl ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {mod.description}
                </p>
                <div
                  className={`flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Materi: {mod.durationMinutes} Menit
                  </span>
                  <span>•</span>
                  <span>{mod.slides.length} Slide</span>
                  <span>•</span>
                  <span>{mod.quiz.length} Soal Kuis</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenTimerModal(mod)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    isDark
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                      : "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                  }`}
                >
                  <Timer size={13} /> Atur Waktu Kuis
                </button>

                <button
                  type="button"
                  onClick={() => toast.success("Materi siap dipublikasikan ke siswa.")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    isDark
                      ? "border-white/10 text-slate-200 hover:text-white hover:bg-white/5"
                      : "border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Edit size={14} /> Edit Materi
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
                <span className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest font-bold">
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
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 transition-all cursor-pointer"
              >
                <Check size={14} /> Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
