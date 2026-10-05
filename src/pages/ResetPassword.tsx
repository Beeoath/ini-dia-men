import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../lib/theme";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Cek session aktif saat tiba dari link pemulihan email
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("[ResetPassword] Error saat memeriksa sesi pemulihan:", error);
      }
      if (mounted) {
        if (session) {
          setIsRecoveryReady(true);
        }
        setCheckingSession(false);
      }
    });

    // 2. Tangkap event PASSWORD_RECOVERY dari Supabase auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        if (mounted) {
          setIsRecoveryReady(true);
          setCheckingSession(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password baru minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("[ResetPassword] Supabase error saat updateUser:", error);
        setErrorMsg(error.message || "Gagal memperbarui password. Silakan coba minta link reset baru.");
        return;
      }

      if (data?.user) {
        toast.success("Password baru berhasil disimpan! Silakan masuk dengan password baru.");
        navigate("/masuk", { replace: true });
      }
    } catch (err: any) {
      console.error("[ResetPassword] Exception saat update password:", err);
      setErrorMsg(err?.message || "Terjadi kesalahan saat memperbarui password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? "bg-[#06070b] text-white" : "bg-[#f1f4f9] text-slate-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md rounded-[28px] p-6 sm:p-8 border shadow-2xl transition-all ${
          isDark
            ? "bg-[#0a0c14] border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
            : "bg-white border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <Link
            to="/masuk"
            className={`inline-flex items-center gap-1.5 font-lexend text-xs transition-colors ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
          <span className="font-mono text-[10px] font-bold text-cyan-400">SIGMA SECURITY</span>
        </div>

        <div className="text-center mb-6">
          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-200"
            }`}
          >
            <KeyRound size={22} />
          </div>
          <h1
            className={`font-outfit text-xl sm:text-2xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Atur Ulang Password
          </h1>
          <p
            className={`font-lexend text-xs mt-1 max-w-xs mx-auto ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Masukkan password baru (minimal 8 karakter) untuk akun Anda.
          </p>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-lexend">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {checkingSession ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span className="font-mono text-xs text-slate-400">Memeriksa link pemulihan...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Baru */}
            <div className="space-y-1">
              <label className="block font-lexend text-xs font-semibold text-slate-400">
                Password Baru (Minimal 8 Karakter)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 focus:border-cyan-600 text-slate-900 placeholder-slate-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                    isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="space-y-1">
              <label className="block font-lexend text-xs font-semibold text-slate-400">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 focus:border-cyan-600 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 mt-2 rounded-xl sm:rounded-2xl font-lexend font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/20"
                  : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20"
              }`}
            >
              {submitting ? "Menyimpan Password Baru..." : "Simpan Password Baru"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
