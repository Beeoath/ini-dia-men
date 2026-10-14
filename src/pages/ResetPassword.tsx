import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../lib/theme";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Multi-step state: 1 (Forgot), 2 (Verify OTP), 3 (New Password)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<number>(1);

  // Step 1: Email
  const [email, setEmail] = useState<string>("");

  // Step 2: 6-digit OTP
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Step 3: New Password
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // General state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Auto-populate email from query param if available
  useEffect(() => {
    const queryEmail = searchParams.get("email");
    if (queryEmail) {
      setEmail(queryEmail.trim());
    }
  }, [searchParams]);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  // Check active session when step 3 is reached
  useEffect(() => {
    if (step === 3) {
      let active = true;
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        if (!session) {
          setErrorMsg("Sesi habis, silakan minta kode baru.");
          setDirection(-1);
          setStep(1);
        }
      });
      return () => {
        active = false;
      };
    }
  }, [step]);

  // Navigation handlers
  const handleBack = () => {
    setErrorMsg("");
    if (step === 1) {
      navigate("/masuk");
    } else if (step === 2) {
      setDirection(-1);
      setStep(1);
    } else if (step === 3) {
      setDirection(-1);
      setStep(2);
    }
  };

  // STEP 1: Kirim Kode
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Format email tidak valid. Masukkan alamat email yang benar.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      // Panggil resetPasswordForEmail TANPA redirectTo
      await supabase.auth.resetPasswordForEmail(cleanEmail);
    } catch (err) {
      console.error("[ResetPassword] Error saat resetPasswordForEmail:", err);
    } finally {
      setSubmitting(false);
      // Apapun hasilnya, lanjutkan ke langkah 2 dan jangan bocorkan status email
      toast.info("Kalau email terdaftar, kode sudah dikirim", {
        duration: 5000,
      });
      setCountdown(60);
      setCanResend(false);
      setDirection(1);
      setStep(2);

      // Auto focus OTP box 1 after transition
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 250);
    }
  };

  // STEP 2: Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    const char = cleaned.slice(-1); // Take last entered digit

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMsg("");

    // Auto-focus next box
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous box if current is already empty
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    setErrorMsg("");

    const targetFocusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[targetFocusIndex]?.focus();
  };

  const handleResendCode = async () => {
    if (!canResend || submitting) return;

    setErrorMsg("");
    setSubmitting(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
    } catch (err) {
      console.error("[ResetPassword] Resend error:", err);
    } finally {
      setSubmitting(false);
      setCountdown(60);
      setCanResend(false);
      toast.info("Kalau email terdaftar, kode sudah dikirim", {
        duration: 5000,
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("").trim();
    if (token.length < 6) {
      setErrorMsg("Harap lengkapi 6 digit kode verifikasi.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "recovery",
      });

      if (error || !data?.session) {
        setErrorMsg("Kode salah atau sudah kedaluwarsa.");
        // Kosongkan kotak dan fokus ke pertama
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
        return;
      }

      // Berhasil diverifikasi, lanjut ke langkah 3
      setDirection(1);
      setStep(3);
    } catch (err: any) {
      console.error("[ResetPassword] verifyOtp exception:", err);
      setErrorMsg("Kode salah atau sudah kedaluwarsa.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 3: Password validation criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatching = password.length > 0 && password === confirmPassword;
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && isMatching;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg("Pastikan seluruh kriteria password terpenuhi.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("[ResetPassword] updateUser error:", error);
        setErrorMsg(error.message || "Gagal memperbarui password.");
        return;
      }

      toast.success("Password baru berhasil disimpan! Silakan masuk kembali.");
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("[ResetPassword] signOut after reset error:", err);
      }
      navigate("/masuk", { replace: true });
    } catch (err: any) {
      console.error("[ResetPassword] exception:", err);
      setErrorMsg(err?.message || "Terjadi kesalahan saat memperbarui password.");
    } finally {
      setSubmitting(false);
    }
  };

  // Slide & Fade animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 35 : -35,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -35 : 35,
      opacity: 0,
    }),
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? "bg-[#06070b] text-white" : "bg-[#f1f4f9] text-slate-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`w-full max-w-[430px] rounded-[28px] p-6 sm:p-8 border shadow-2xl transition-all ${
          isDark
            ? "bg-[#0a0c14] border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
            : "bg-white border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        }`}
      >
        {/* Card Header: Back Arrow Button & SIGMA SECURITY label */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
          <button
            type="button"
            onClick={handleBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isDark
                ? "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
            title={step === 1 ? "Kembali ke Halaman Masuk" : "Langkah Sebelumnya"}
          >
            <ArrowLeft size={16} />
          </button>

          <span
            className={`font-mono text-[10px] font-bold tracking-wider ${
              isDark ? "text-cyan-400" : "text-cyan-600"
            }`}
          >
            SIGMA SECURITY
          </span>
        </div>

        {/* Step Indicator (3 dots / bars) */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s
                  ? isDark
                    ? "w-8 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                    : "w-8 bg-cyan-600"
                  : step > s
                  ? isDark
                    ? "w-3 bg-cyan-400/40"
                    : "w-3 bg-cyan-600/40"
                  : isDark
                  ? "w-3 bg-white/10"
                  : "w-3 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Inline Error Message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-lexend leading-relaxed">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multi-step Content with Slide & Fade */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="text-left mb-6">
                <h1
                  className={`font-outfit text-xl sm:text-2xl font-extrabold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Lupa Password
                </h1>
                <p
                  className={`font-lexend text-xs mt-1.5 leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Masukkan email akunmu, kami kirim kode verifikasi.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    className={`block font-lexend text-xs font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={`w-full rounded-xl py-3 px-4 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                        isDark
                          ? "bg-white/5 border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-white placeholder-slate-500"
                          : "bg-slate-50 border-slate-200 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <Mail
                      size={18}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-slate-400" : "text-slate-400"
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className={`w-full py-3.5 rounded-full font-lexend font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-cyan-400/25 hover:opacity-95"
                      : "bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-cyan-600/25 hover:opacity-95"
                  }`}
                >
                  {submitting ? "Mengirim Kode..." : "Kirim Kode"}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="text-left mb-6">
                <h1
                  className={`font-outfit text-xl sm:text-2xl font-extrabold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Verifikasi Akun
                </h1>
                <p
                  className={`font-lexend text-xs mt-1.5 leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Masukkan 6 digit kode yang dikirim ke emailmu.
                </p>
                {email && (
                  <span
                    className={`font-lexend text-[11px] font-medium block mt-1 truncate ${
                      isDark ? "text-cyan-400/90" : "text-cyan-600"
                    }`}
                  >
                    {email}
                  </span>
                )}
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 6 OTP Input Boxes */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl text-center font-mono text-lg sm:text-xl font-bold outline-none border transition-all ${
                        isDark
                          ? "bg-white/5 border-white/15 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 shadow-inner"
                      } ${digit ? (isDark ? "border-cyan-400/60" : "border-cyan-600/60") : ""}`}
                    />
                  ))}
                </div>

                {/* Submit Verification Button */}
                <button
                  type="submit"
                  disabled={submitting || otp.join("").length < 6}
                  className={`w-full py-3.5 rounded-full font-lexend font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-cyan-400/25 hover:opacity-95"
                      : "bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-cyan-600/25 hover:opacity-95"
                  }`}
                >
                  {submitting ? "Memverifikasi..." : "Verifikasi"}
                </button>

                {/* Resend Code with 60s cooldown */}
                <div className="text-center pt-1">
                  <p
                    className={`font-lexend text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Belum menerima kode?{" "}
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={submitting}
                        className={`font-bold transition-colors cursor-pointer underline underline-offset-2 ${
                          isDark
                            ? "text-cyan-400 hover:text-cyan-300"
                            : "text-cyan-600 hover:text-cyan-700"
                        }`}
                      >
                        Kirim ulang
                      </button>
                    ) : (
                      <span
                        className={`font-medium ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Kirim ulang ({countdown}s)
                      </span>
                    )}
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="text-left mb-6">
                <h1
                  className={`font-outfit text-xl sm:text-2xl font-extrabold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Buat Password Baru
                </h1>
                <p
                  className={`font-lexend text-xs mt-1.5 leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Buat password yang kuat untuk mengamankan akunmu.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Input Password */}
                <div className="space-y-1.5">
                  <label
                    className={`block font-lexend text-xs font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-slate-400" : "text-slate-400"
                      }`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      className={`w-full rounded-xl py-3 pl-10 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                        isDark
                          ? "bg-white/5 border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-white placeholder-slate-500"
                          : "bg-slate-50 border-slate-200 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                        isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Input Konfirmasi Password */}
                <div className="space-y-1.5">
                  <label
                    className={`block font-lexend text-xs font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-slate-400" : "text-slate-400"
                      }`}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password baru"
                      className={`w-full rounded-xl py-3 pl-10 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                        isDark
                          ? "bg-white/5 border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-white placeholder-slate-500"
                          : "bg-slate-50 border-slate-200 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                        isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                <div
                  className={`p-3 sm:p-3.5 rounded-xl border space-y-1.5 transition-colors ${
                    isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p
                    className={`font-lexend text-[11px] font-semibold mb-2 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Ketentuan Keamanan Password:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-lexend">
                    <div
                      className={`flex items-center gap-1.5 transition-colors ${
                        hasMinLength
                          ? "text-emerald-400 font-medium"
                          : isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {hasMinLength ? (
                        <Check size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0">
                          •
                        </span>
                      )}
                      <span>Minimal 8 karakter</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 transition-colors ${
                        hasUppercase
                          ? "text-emerald-400 font-medium"
                          : isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {hasUppercase ? (
                        <Check size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0">
                          •
                        </span>
                      )}
                      <span>Huruf besar (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 transition-colors ${
                        hasLowercase
                          ? "text-emerald-400 font-medium"
                          : isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {hasLowercase ? (
                        <Check size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0">
                          •
                        </span>
                      )}
                      <span>Huruf kecil (a-z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 transition-colors ${
                        hasNumber
                          ? "text-emerald-400 font-medium"
                          : isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {hasNumber ? (
                        <Check size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0">
                          •
                        </span>
                      )}
                      <span>Angka (0-9)</span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 pt-1 border-t text-[11px] font-lexend transition-colors ${
                      isDark ? "border-white/5" : "border-slate-200"
                    } ${
                      isMatching
                        ? "text-emerald-400 font-medium"
                        : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    {isMatching ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0">
                        •
                      </span>
                    )}
                    <span>Kedua kolom password cocok</span>
                  </div>
                </div>

                {/* Reset Password Button */}
                <button
                  type="submit"
                  disabled={submitting || !isPasswordValid}
                  className={`w-full py-3.5 mt-2 rounded-full font-lexend font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-cyan-400/25 hover:opacity-95"
                      : "bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-cyan-600/25 hover:opacity-95"
                  }`}
                >
                  {submitting ? "Memperbarui Password..." : "Reset Password"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
