import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Sun,
  Moon,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Compass,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { toast } from "sonner";

export default function Login() {
  const { login, loginWithGoogle, register, profile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isDaftarQuery = searchParams.get("mode") === "daftar";
  const roleQuery = searchParams.get("role") === "guru" ? "teacher" : "student";

  const [isRegisterMode, setIsRegisterMode] = useState(isDaftarQuery);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">(roleQuery);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("Kelas 11 A");
  const [teacherCode, setTeacherCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"ID" | "EN">("ID");

  const getDestination = (role: string) => {
    const redirectParam = searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/")) {
      return redirectParam;
    }
    return role === "teacher" ? "/teacher/dashboard" : "/app/dashboard";
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (profile) {
      navigate(getDestination(profile.role));
    }
  }, [profile, navigate, searchParams]);

  useEffect(() => {
    setIsRegisterMode(searchParams.get("mode") === "daftar");
    if (searchParams.get("role") === "guru") {
      setSelectedRole("teacher");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!fullName.trim()) {
          throw new Error("Nama lengkap wajib diisi.");
        }
        if (!email.trim() || !email.includes("@")) {
          throw new Error("Format email tidak valid.");
        }
        if (password.length < 6) {
          throw new Error("Password minimal 6 karakter.");
        }
        if (selectedRole === "teacher" && teacherCode.trim() !== "SIGMAGURU2026" && teacherCode.trim() !== "GURU-DN9") {
          throw new Error("Kode verifikasi guru salah! Gunakan: SIGMAGURU2026");
        }

        const user = await register(fullName, email, password, selectedRole, {
          class_name: selectedRole === "student" ? className : "Guru Pengampu",
          teacher_code: teacherCode,
        });

        toast.success(
          selectedRole === "teacher"
            ? "Akun Guru berhasil dibuat!"
            : "Akun Siswa berhasil dibuat!"
        );

        navigate(getDestination(user.role));
      } else {
        if (!email.trim()) {
          throw new Error("Masukkan alamat email.");
        }
        const user = await login(email, password);
        toast.success("Selamat datang kembali di Portal SIGMA!");
        navigate(getDestination(user.role));
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("invalid login credentials")) {
        setErrorMsg(
          "Email atau password salah / belum terdaftar. Jika Anda baru pertama kali menggunakan portal ini, silakan klik tab 'Daftar' di atas untuk membuat akun terlebih dahulu."
        );
      } else {
        setErrorMsg(msg || "Terjadi kesalahan saat otentikasi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login via Supabase
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await loginWithGoogle();
      // Browser will redirect to Google login screen
    } catch (err: any) {
      console.error("Google login error:", err);
      const msg = err?.message || "";
      if (
        msg.toLowerCase().includes("provider is not enabled") ||
        msg.toLowerCase().includes("unsupported provider")
      ) {
        setErrorMsg(
          "Provider Google OAuth belum diaktifkan di dashboard Supabase (Authentication > Providers > Google). Silakan gunakan tab 'Daftar' dengan Email & Password di atas untuk membuat akun."
        );
      } else {
        setErrorMsg(msg || "Gagal menghubungkan ke layanan Google OAuth.");
      }
      setLoading(false);
    }
  };

  // 1-Click Demo Access for quick evaluation
  const handleDemoAccess = async (role: "student" | "teacher") => {
    setErrorMsg("");
    setLoading(true);
    try {
      const demoEmail = role === "teacher" ? "guru.demo@darunnajah9.sch.id" : "siswa.demo@darunnajah9.sch.id";
      const demoPass = "Sigma2026!";
      let user: any;
      try {
        user = await login(demoEmail, demoPass);
      } catch {
        user = await register(
          role === "teacher" ? "Ust. Ahmad Fauzi, S.Pd. (Demo)" : "Ahmad Rizky Pratama (Demo)",
          demoEmail,
          demoPass,
          role,
          { class_name: role === "teacher" ? "Guru Pengampu" : "Kelas 11 A", teacher_code: "SIGMAGURU2026" }
        );
      }
      toast.success(`Berhasil masuk sebagai Akun Uji Coba ${role === "teacher" ? "Guru" : "Siswa"}!`);
      navigate(getDestination(user.role));
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal masuk mode uji coba.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = () => {
    toast.info(
      "Info: Siswa dapat menggunakan password default: siswa123 atau hubungi administrator sekolah.",
      { duration: 5000 }
    );
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 transition-colors duration-500 select-none ${
        isDark ? "bg-[#06070b] text-white" : "bg-[#f1f4f9] text-slate-900"
      }`}
    >
      {/* Outer Card Window matching the user reference design */}
      <div
        className={`w-full max-w-6xl rounded-[28px] sm:rounded-[36px] overflow-hidden border shadow-2xl transition-all duration-300 relative flex flex-col ${
          isDark
            ? "bg-[#0a0c14] border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)]"
            : "bg-white border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        }`}
      >
        {/* Top Navigation Bar inside the frame */}
        <header
          className={`w-full px-6 sm:px-10 py-5 flex items-center justify-between border-b transition-colors z-20 ${
            isDark ? "border-white/5" : "border-slate-100"
          }`}
        >
          {/* Left Navigation Links */}
          <nav className="flex items-center gap-6 sm:gap-8 font-lexend text-xs sm:text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors font-semibold ${
                isDark ? "text-white hover:text-cyan-400" : "text-slate-900 hover:text-cyan-600"
              }`}
            >
              {language === "ID" ? "Beranda" : "Home"}
            </Link>
            <Link
              to="/#fitur"
              className={`hidden sm:inline-block transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {language === "ID" ? "Tentang" : "About"}
            </Link>
            <Link
              to="/#kurikulum"
              className={`hidden sm:inline-block transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {language === "ID" ? "Materi" : "Curriculum"}
            </Link>
            <Link
              to="/#distrik"
              className={`hidden md:inline-block transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {language === "ID" ? "Distrik" : "Districts"}
            </Link>
            <Link
              to="/#faq"
              className={`hidden md:inline-block transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {language === "ID" ? "Kontak" : "Contact"}
            </Link>
          </nav>

          {/* Right Controls: Language, Theme Toggle, Sign In, Register */}
          <div className="flex items-center gap-3 sm:gap-5 font-lexend text-xs sm:text-sm">
            {/* Theme Toggle (Allows immediate switching between Dark & Light mockup) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? "text-slate-400 hover:text-amber-300 hover:bg-white/5"
                  : "text-slate-600 hover:text-amber-600 hover:bg-slate-100"
              }`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === "ID" ? "EN" : "ID")}
              className={`flex items-center gap-1 font-medium cursor-pointer transition-colors ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{language === "ID" ? "Indonesia" : "English"}</span>
              <ChevronDown size={14} className="opacity-70" />
            </button>

            {/* Sign In text link with active underline indicator */}
            <button
              type="button"
              onClick={() => setIsRegisterMode(false)}
              className={`font-semibold transition-colors cursor-pointer relative py-1 ${
                !isRegisterMode
                  ? isDark
                    ? "text-white"
                    : "text-slate-950"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {language === "ID" ? "Masuk" : "Sign In"}
              {!isRegisterMode && (
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${
                    isDark ? "bg-white" : "bg-slate-950"
                  }`}
                />
              )}
            </button>

            {/* Register pill button */}
            <button
              type="button"
              onClick={() => setIsRegisterMode(true)}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                isRegisterMode
                  ? isDark
                    ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                    : "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : isDark
                  ? "bg-white text-slate-950 hover:bg-slate-200"
                  : "bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              {language === "ID" ? "Daftar" : "Register"}
            </button>
          </div>
        </header>

        {/* Main Content: Split Grid matching reference design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px] lg:min-h-[620px] relative">
          {/* Left Column: Futuristic Cyber Hero Avatar & Iridescent Ambient */}
          <div
            className={`lg:col-span-6 relative flex items-center justify-center p-6 sm:p-10 overflow-hidden ${
              isDark ? "bg-[#060810]" : "bg-[#fcfdfd]"
            }`}
          >
            {/* Background Atmosphere */}
            {isDark ? (
              /* Dark mode fluid gloss reflections */
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 -left-1/4 w-[120%] h-[120%] bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.18)_0%,rgba(168,85,247,0.12)_35%,rgba(6,182,212,0.14)_60%,transparent_75%)] blur-2xl" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#060810] via-transparent to-transparent" />
              </div>
            ) : (
              /* Light mode soft chromatic pastel rainbow aura wave */
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-10 -left-20 w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_45%_50%,rgba(254,215,226,0.55)_0%,rgba(254,243,199,0.5)_25%,rgba(207,250,254,0.6)_50%,rgba(233,213,255,0.45)_75%,transparent_85%)] blur-3xl" />
                {/* Flowing chromatic ribbon curve */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-35"
                  preserveAspectRatio="none"
                  viewBox="0 0 500 500"
                >
                  <path
                    d="M-50,200 C150,100 250,380 550,220 L550,550 L-50,550 Z"
                    fill="url(#rainbow-wave)"
                  />
                  <defs>
                    <linearGradient id="rainbow-wave" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
                      <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.3" />
                      <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}

            {/* Character Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, x: -15 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] flex items-center justify-center"
            >
              <img
                src={isDark ? "/assets/cyber_hero_profile.jpg" : "/assets/cyber_hero_profile.png"}
                alt="Cyberpunk Hero SIGMA"
                className={`w-full h-auto object-contain select-none transition-all duration-500 drop-shadow-2xl ${
                  isDark
                    ? "rounded-3xl filter brightness-105 contrast-110 drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                    : "filter drop-shadow-[0_20px_35px_rgba(15,23,42,0.15)]"
                }`}
              />
            </motion.div>
          </div>

          {/* Right Column: Sleek Auth Form */}
          <div
            className={`lg:col-span-6 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8 sm:py-12 relative z-10 ${
              isDark ? "bg-[#0c0f1a]" : "bg-white"
            }`}
          >
            <div className="w-full max-w-[380px] mx-auto">
              {/* Header Greeting */}
              <div className="text-center mb-6">
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`font-lexend text-base sm:text-lg font-medium ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {language === "ID" ? "Halo !" : "Hello !"}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isRegisterMode
                    ? language === "ID"
                      ? "Mulai Petualangan"
                      : "Create Account"
                    : language === "ID"
                    ? "Selamat Datang"
                    : "Welcome Back"}
                </motion.h1>
                <p
                  className={`font-lexend text-xs mt-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Portal Pembelajaran Matematika MA Darunnajah 9
                </p>
              </div>

              {/* Notice for Peta Belajar redirect */}
              {(searchParams.get("notice") === "peta_belajar" || searchParams.get("redirect")?.includes("/app/hub")) && (
                <div className="mb-4 flex items-start gap-2.5 p-3 rounded-2xl bg-cyan-400/10 border border-cyan-400/25 text-cyan-300 text-xs">
                  <Compass size={18} className="shrink-0 text-cyan-400 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-semibold block text-cyan-200">Akses Peta Belajar Matematika</span>
                    <span className="text-[11px] text-cyan-300/80">
                      Silakan masuk atau daftar akun terlebih dahulu untuk membuka 5 Distrik Peta Belajar dan melacak progres belajarmu.
                    </span>
                  </div>
                </div>
              )}

              {/* Role selector if in Register Mode */}
              <AnimatePresence>
                {isRegisterMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 p-1 rounded-full mb-4 border transition-colors overflow-hidden"
                    style={{
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(226,232,240,1)",
                      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(241,245,249,1)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedRole("student")}
                      className={`py-1.5 rounded-full font-lexend text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedRole === "student"
                          ? isDark
                            ? "bg-white text-slate-950 font-bold shadow"
                            : "bg-slate-950 text-white font-bold shadow"
                          : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Sparkles size={13} />
                      <span>Siswa (TKA)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("teacher")}
                      className={`py-1.5 rounded-full font-lexend text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedRole === "teacher"
                          ? isDark
                            ? "bg-amber-400 text-slate-950 font-bold shadow"
                            : "bg-amber-500 text-white font-bold shadow"
                          : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <span>Guru Pengampu</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-lexend">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Extra fields for Register */}
                {isRegisterMode && (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder={language === "ID" ? "Nama Lengkap" : "Full Name"}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                          isDark
                            ? "bg-white/5 border-white/10 focus:border-white/40 text-white placeholder-slate-400"
                            : "bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                      <User
                        size={17}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                          isDark ? "text-slate-400" : "text-slate-400"
                        }`}
                      />
                    </div>

                    {selectedRole === "student" ? (
                      <div>
                        <select
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className={`w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 font-lexend text-xs sm:text-sm outline-none border transition-all cursor-pointer ${
                            isDark
                              ? "bg-[#0f121d] border-white/10 focus:border-white/40 text-white"
                              : "bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900"
                          }`}
                        >
                          <option value="Kelas 11 A">Kelas 11 A (Putra)</option>
                          <option value="Kelas 11 B">Kelas 11 B (Putri)</option>
                          <option value="Kelas 10 A">Kelas 10 A</option>
                          <option value="Kelas 12 A">Kelas 12 A</option>
                        </select>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Kode Guru: SIGMAGURU2026"
                          value={teacherCode}
                          onChange={(e) => setTeacherCode(e.target.value)}
                          className={`w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                            isDark
                              ? "bg-white/5 border-white/10 focus:border-amber-400 text-white placeholder-slate-400"
                              : "bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900 placeholder-slate-400"
                          }`}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Email Field with Right Icon */}
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={language === "ID" ? "Enter Email" : "Enter Email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                      isDark
                        ? "bg-white/5 border-white/10 focus:border-white/40 text-white placeholder-slate-400"
                        : "bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                  <Mail
                    size={17}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                  />
                </div>

                {/* Password Field with Eye Toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 pr-11 font-lexend text-xs sm:text-sm outline-none border transition-all ${
                      isDark
                        ? "bg-white/5 border-white/10 focus:border-white/40 text-white placeholder-slate-400"
                        : "bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                      isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Recover Password link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRecoverPassword}
                    className={`font-lexend text-[11px] sm:text-xs transition-colors cursor-pointer ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {language === "ID" ? "Lupa Password ?" : "Recover Password ?"}
                  </button>
                </div>

                {/* Primary Action Button (Sign In / Register) */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl sm:rounded-2xl font-lexend font-bold text-sm sm:text-base transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-white text-slate-950 hover:bg-slate-200 shadow-white/10"
                      : "bg-slate-950 text-white hover:bg-slate-800 shadow-slate-950/20"
                  }`}
                >
                  {loading
                    ? language === "ID"
                      ? "Memproses..."
                      : "Processing..."
                    : isRegisterMode
                    ? language === "ID"
                      ? "Daftar Akun"
                      : "Create Account"
                    : language === "ID"
                    ? "Sign In"
                    : "Sign In"}
                </motion.button>
              </form>

              {/* Or continue with Divider */}
              <div className="relative my-5 text-center">
                <div
                  className={`absolute inset-0 flex items-center ${
                    isDark ? "opacity-20" : "opacity-30"
                  }`}
                >
                  <div
                    className={`w-full border-t ${
                      isDark ? "border-white" : "border-slate-300"
                    }`}
                  />
                </div>
                <span
                  className={`relative px-3 font-lexend text-[11px] sm:text-xs ${
                    isDark ? "bg-[#0a0c14] text-slate-400" : "bg-white text-slate-500"
                  }`}
                >
                  {language === "ID" ? "Atau masuk cepat dengan" : "Or continue with"}
                </span>
              </div>

              {/* Masuk dengan Google (OAuth) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                title="Masuk dengan Akun Google (Google OAuth)"
                className={`w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-3 font-lexend font-semibold text-xs sm:text-sm transition-all cursor-pointer group shadow-sm disabled:opacity-50 active:scale-[0.99] ${
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-slate-100"
                    : "border-slate-200 bg-slate-50/90 hover:bg-slate-100 hover:border-slate-300 text-slate-800"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {language === "ID"
                    ? isRegisterMode
                      ? "Daftar dengan Akun Google"
                      : "Masuk dengan Akun Google"
                    : isRegisterMode
                    ? "Sign up with Google"
                    : "Continue with Google"}
                </span>
              </button>

              {/* Akses Uji Coba Cepat (Demo Mode) */}
              <div className="pt-2 text-center">
                <span className={`text-[10px] block mb-2 font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Akses instan untuk peninjauan fitur:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoAccess("student")}
                    disabled={loading}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      isDark
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                        : "border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                    }`}
                  >
                    Masuk Akun Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoAccess("teacher")}
                    disabled={loading}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      isDark
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    Masuk Akun Guru
                  </button>
                </div>
              </div>

              {/* Bottom Toggle: Don't have an account ? Create Account! */}
              <div className="mt-6 text-center font-lexend text-xs">
                {isRegisterMode ? (
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                    {language === "ID" ? "Sudah punya akun ?" : "Already have an account ?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className={`font-bold transition-colors cursor-pointer ${
                        isDark
                          ? "text-white hover:text-cyan-300 underline"
                          : "text-slate-900 hover:text-cyan-600 underline"
                      }`}
                    >
                      {language === "ID" ? "Masuk Sekarang!" : "Sign In!"}
                    </button>
                  </p>
                ) : (
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                    {language === "ID"
                      ? "Don't have an account ?"
                      : "Don't have an account ?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className={`font-bold transition-colors cursor-pointer ${
                        isDark
                          ? "text-white hover:text-cyan-300 underline"
                          : "text-slate-900 hover:text-cyan-600 underline"
                      }`}
                    >
                      {language === "ID" ? "Create Account!" : "Create Account!"}
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

