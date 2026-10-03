import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles, Clock, AlertCircle } from "lucide-react";
import { MODULES } from "../lib/sigmaData";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { FormattedMathText } from "../components/MathView";
import { MIN_PASSING_SCORE } from "../lib/userProgress";

export default function QuizResult() {
  const { id, attemptId } = useParams();
  const currentId = attemptId || id;
  const { isDark } = useTheme();
  const moduleData = MODULES.find((m) => m.id === currentId) || MODULES[0];

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Status "selesai" udah dicatat ke tabel user_progress lewat
    // recordQuizCompletion() di Quiz.tsx, jadi di sini tinggal baca hasilnya aja.
    try {
      const saved = sessionStorage.getItem(`quiz_result_${moduleData.id}`);
      if (saved) setResult(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, [moduleData.id]);

  const score = result?.score ?? 100;
  const isPassed = score >= MIN_PASSING_SCORE;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 sm:py-6 px-3 sm:px-0">
      <div
        className={`rounded-3xl border p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-5 transition-all ${
          isDark
            ? "border-white/15 bg-[#0d1430]/90 text-slate-100"
            : "border-slate-200 bg-white text-slate-900 shadow-xl"
        }`}
      >
        <div
          className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl border shadow-lg ${
            isDark
              ? "bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border-cyan-400/40 text-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
              : "bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-300 text-cyan-600 shadow-cyan-200/50"
          }`}
        >
          <Award size={40} />
        </div>

        <div>
          <span
            className={`font-mono text-xs uppercase font-bold ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Hasil Uji Pemahaman
          </span>
          <h1
            className={`mt-1 font-display text-3xl sm:text-4xl font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            {isPassed ? "Distrik Berhasil Dikuasai! (Lulus KKM ≥ 70)" : "Perlu Belajar Lagi (Belum Lulus)"}
          </h1>
        </div>

        <div className="py-2">
          <div
            className={`font-display text-5xl sm:text-6xl font-black ${
              isDark
                ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400"
                : "text-slate-900"
            }`}
          >
            {score}
          </div>
          <p
            className={`font-mono text-xs mt-2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Nilai Akhir • {isPassed ? "LULUS KKM (Tuntas • Nilai ≥ 70)" : "Belum Mencapai KKM (Minimal Nilai 70 / 7)"}
          </p>
        </div>

        {result?.isTimeout && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-mono text-xs font-semibold text-amber-400">
            <Clock size={15} /> Waktu pengerjaan telah habis ({result.timeLimitMinutes || 15} menit). Jawaban yang sudah dipilih otomatis dikumpulkan.
          </div>
        )}

        {isPassed ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 font-mono text-xs font-bold text-emerald-400 shadow-sm">
            <Sparkles size={14} /> Nilai ≥ 70 Tercapai! Bab Berikutnya Telah Terbuka!
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-400/10 px-4 py-1.5 font-mono text-xs font-bold text-rose-400 shadow-sm">
            <AlertCircle size={14} /> Nilai belum mencapai 70 (nilai 7). Bab selanjutnya belum terbuka, silakan coba lagi.
          </div>
        )}

        {isPassed && (moduleData.id === "mod-aljabar-1" || moduleData.districtId === 1) && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-left space-y-2.5 transition-all ${
              isDark
                ? "border-purple-500/40 bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-cyan-500/10 text-slate-100"
                : "border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-cyan-50 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                <Sparkles size={15} />
                Tahap Evaluasi Akhir Terbuka: Post-Test Bab 1
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-purple-400/40 bg-purple-500/20 text-purple-300 font-bold">
                Lolos Kuis ≥ 70
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 dark:text-slate-300">
              Selamat! Kamu telah menguasai kuis Bab 1 dengan nilai <strong>{score}</strong>. Sekarang ikuti <strong>Post-Test Akhir</strong> untuk memverifikasi retensi pemahaman dan menghitung peningkatan kompetensi (N-Gain) kamu.
            </p>
            <div className="pt-1">
              <Link
                to="/app/posttest/mod-aljabar-1"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 text-white hover:opacity-95 shadow-purple-500/30"
              >
                <span>Kerjakan Post-Test Bab 1</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/app/kuis/${moduleData.id}`}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? "border-white/15 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10"
                : "border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 shadow-sm"
            }`}
          >
            <RotateCcw size={15} /> Coba Lagi
          </Link>

          {isPassed && (moduleData.id === "mod-aljabar-1" || moduleData.districtId === 1) && (
            <Link
              to="/app/materi/mod-aljabar-2"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:opacity-95 shadow-emerald-500/20"
            >
              Lanjut ke Bab 2: Aljabar <ArrowRight size={15} />
            </Link>
          )}

          <Link
            to="/app/dashboard"
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer ${
              isDark
                ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-400/20"
                : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-600/20"
            }`}
          >
            Kembali ke Dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Question Explanations */}
      <div className="space-y-4">
        <h3
          className={`font-display text-base font-bold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Pembahasan Soal Kuis
        </h3>
        {moduleData.quiz.map((q, idx) => {
          const userAns = result?.selectedAnswers?.[idx];
          const isCorrect = userAns === q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                isDark
                  ? "border-white/10 bg-[#0a0f24]/70 text-slate-200"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`font-mono text-xs font-bold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Soal #{idx + 1}
                </span>
                {isCorrect ? (
                  <span className="flex items-center gap-1 font-mono text-xs text-emerald-500 font-bold">
                    <CheckCircle2 size={14} /> Benar
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-mono text-xs text-rose-500 font-bold">
                    <XCircle size={14} /> Salah
                  </span>
                )}
              </div>
              <div className="text-sm font-medium">
                <FormattedMathText text={q.question} />
              </div>

              {/* Answers comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div
                  className={`p-2.5 rounded-lg border ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  <span className="opacity-70 block text-[10px] uppercase font-bold">Jawaban Anda:</span>
                  <div className="font-semibold mt-0.5">
                    {userAns !== undefined ? (
                      <FormattedMathText text={`${["A", "B", "C", "D", "E"][userAns]}. ${q.options[userAns]}`} />
                    ) : (
                      "Tidak dijawab"
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                  <span className="opacity-70 block text-[10px] uppercase font-bold">Kunci Jawaban:</span>
                  <div className="font-semibold mt-0.5">
                    <FormattedMathText text={`${["A", "B", "C", "D", "E"][q.correctAnswer]}. ${q.options[q.correctAnswer]}`} />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl border p-3.5 text-xs space-y-1 ${
                  isDark
                    ? "border-cyan-400/20 bg-cyan-400/5 text-slate-300"
                    : "border-cyan-200 bg-cyan-50/50 text-slate-700"
                }`}
              >
                <strong className="text-cyan-600 dark:text-cyan-400 block font-mono">
                  Pembahasan:
                </strong>
                <div className="leading-relaxed">
                  <FormattedMathText text={q.explanation || ""} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
