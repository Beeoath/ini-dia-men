import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher";
  class_name?: string;
  avatar_url?: string;
  avatar?: string;
  xp?: number;
  level?: number;
  completed_modules?: string[];
  badges?: string[];
  created_at?: string;
}

export interface RegisterResult {
  user: UserProfile | null;
  sessionActive: boolean;
  teacherClaimFailed?: boolean;
}

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  pendingTeacherCode: string | null;
  setPendingTeacherCode: (code: string | null) => void;
  claimTeacher: (code: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginWithGoogle: (redirectPath?: string) => Promise<void>;
  register: (
    full_name: string,
    email: string,
    password: string,
    extra?: { class_name?: string; teacher_code?: string }
  ) => Promise<RegisterResult>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  refreshProfile: (userIdOverride?: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simpan kode guru sementara HANYA di memory state (tidak di localStorage)
let inMemoryPendingTeacherCode: string | null = null;

// Ambil baris profiles dari database dengan retry (2-3x, jeda 500ms) tanpa insert/upsert client
async function loadProfile(userId: string, email: string, userMetadata?: any): Promise<UserProfile> {
  const maxRetries = 3;
  let profileRow: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, class_name, avatar_url, xp, level, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error(`[loadProfile] Supabase error saat memuat profil (percobaan ${attempt}/${maxRetries}):`, error);
      } else if (data) {
        profileRow = data;
        break;
      }
    } catch (fetchErr) {
      console.error(`[loadProfile] Network exception saat memuat profil (percobaan ${attempt}/${maxRetries}):`, fetchErr);
    }

    if (attempt < maxRetries) {
      // Jeda 500ms menunggu trigger database selesai membuat profile
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (profileRow) {
    let badges: string[] = [];
    try {
      const { data: badgeRows, error: badgeErr } = await supabase
        .from("user_badges")
        .select("badge")
        .eq("user_id", userId);

      if (badgeErr) {
        console.error("[loadProfile] Supabase error saat memuat user_badges:", badgeErr);
      } else if (badgeRows) {
        badges = badgeRows.map((b: any) => b.badge);
      }
    } catch (badgeCatch) {
      console.error("[loadProfile] Exception saat memuat user_badges:", badgeCatch);
    }

    // Role HANYA ditentukan oleh kolom role dari tabel profiles di database
    const dbRole: "student" | "teacher" = profileRow.role === "teacher" ? "teacher" : "student";

    return {
      ...profileRow,
      role: dbRole,
      email,
      badges,
    };
  }

  // Fallback ke metadata sesi HANYA di memori klien jika baris belum ditemukan setelah retry
  // Trigger selalu membuat profil baru dengan role 'student'
  console.warn("[loadProfile] Profil belum ditemukan di database setelah 3x percobaan (menunggu trigger). Menggunakan role default 'student'.");
  const fullName =
    userMetadata?.full_name ||
    userMetadata?.name ||
    email.split("@")[0];
  const className = userMetadata?.class_name || "Kelas 11";
  const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture;

  return {
    id: userId,
    full_name: fullName,
    email,
    role: "student",
    class_name: className,
    avatar_url: avatarUrl,
    xp: 0,
    level: 1,
    badges: [],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingTeacherCode, setPendingTeacherCodeState] = useState<string | null>(inMemoryPendingTeacherCode);
  const isAuthenticatingRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  // Blok mode offline/mock HANYA aktif jika dalam mode DEV
  const isMockOfflineMode = !isSupabaseConfigured && Boolean(import.meta.env.DEV);

  const setPendingTeacherCode = (code: string | null) => {
    const cleaned = code && code.trim() ? code.trim() : null;
    inMemoryPendingTeacherCode = cleaned;
    setPendingTeacherCodeState(cleaned);
  };

  const refreshProfile = async (userIdOverride?: string): Promise<UserProfile | null> => {
    const targetId = userIdOverride || profile?.id;
    if (!targetId) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, class_name, avatar_url, xp, level, created_at")
        .eq("id", targetId)
        .maybeSingle();

      if (error) {
        console.error("[refreshProfile] Supabase error saat memuat profil terbaru:", error);
        return profile;
      } else if (data) {
        const dbRole: "student" | "teacher" = data.role === "teacher" ? "teacher" : "student";
        const email = profile?.email || "";
        const normalizedData: UserProfile = {
          ...data,
          role: dbRole,
          email,
          badges: profile?.badges || [],
        };
        let updatedProfile: UserProfile | null = null;
        setProfile((prev) => {
          updatedProfile = prev
            ? { ...prev, ...data, role: dbRole }
            : normalizedData;
          return updatedProfile;
        });
        return updatedProfile || normalizedData;
      }
    } catch (err) {
      console.error("[refreshProfile] Exception saat memuat ulang profil:", err);
    }
    return profile;
  };

  const claimTeacher = async (code: string, userIdOverride?: string): Promise<boolean> => {
    const trimmed = code.trim();
    if (!trimmed) return false;

    if (isMockOfflineMode) {
      if (profile) {
        const updated: UserProfile = { ...profile, role: "teacher", class_name: "Guru Pengampu" };
        try {
          localStorage.setItem("sigma_offline_profile", JSON.stringify(updated));
        } catch {}
        currentUserIdRef.current = updated.id;
        setProfile(updated);
        return true;
      }
      return true;
    }

    try {
      const { data, error } = await supabase.rpc("claim_teacher", { code: trimmed });
      if (error) {
        console.error("[claimTeacher] Supabase error saat memanggil RPC claim_teacher:", error);
        return false;
      }
      if (data === true) {
        await refreshProfile(userIdOverride);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[claimTeacher] Exception saat memanggil RPC claim_teacher:", err);
      return false;
    }
  };

  useEffect(() => {
    if (isMockOfflineMode) {
      try {
        const stored = localStorage.getItem("sigma_offline_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          currentUserIdRef.current = parsed.id;
          setProfile(parsed);
        }
      } catch (e) {
        console.warn("Failed to load local offline profile:", e);
      }
      setLoading(false);
      return;
    }

    // Cek session yang lagi aktif waktu app dibuka
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error("[Auth] Supabase error saat getSession:", error);
      }
      if (session?.user) {
        try {
          let userProf = await loadProfile(session.user.id, session.user.email!, session.user.user_metadata);
          if (inMemoryPendingTeacherCode && userProf.role === "student") {
            const codeToClaim = inMemoryPendingTeacherCode;
            setPendingTeacherCode(null);
            const claimed = await claimTeacher(codeToClaim, session.user.id);
            if (claimed) {
              userProf = await loadProfile(session.user.id, session.user.email!, session.user.user_metadata);
            } else {
              toast.error("Kode guru salah");
            }
          }
          currentUserIdRef.current = userProf.id;
          setProfile(userProf);
        } catch (e) {
          console.error("[Auth] Exception saat memuat profil sesi:", e);
        }
      }
      setLoading(false);
    }).catch((err) => {
      console.error("[Auth] Gagal menghubungi Supabase auth getSession:", err);
      setLoading(false);
    });

    // Dengerin perubahan login/logout (termasuk dari tab lain atau redirect OAuth)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // 1. Abaikan event TOKEN_REFRESHED
      if (event === "TOKEN_REFRESHED") {
        return;
      }

      if (isAuthenticatingRef.current) {
        // Biarkan fungsi login() / register() menyelesaikan alur pemuatan profil terlebih dahulu
        return;
      }

      // 2. Bungkus pekerjaan async dengan setTimeout(..., 0)
      setTimeout(async () => {
        if (session?.user) {
          const isSameUser = currentUserIdRef.current === session.user.id;
          // 3. Jangan setLoading(true) jika user.id tidak berubah agar form yang sedang diisi tidak hilang
          if (!isSameUser) {
            setLoading(true);
          }
          try {
            let userProf = await loadProfile(session.user.id, session.user.email!, session.user.user_metadata);
            if (inMemoryPendingTeacherCode && userProf.role === "student") {
              const codeToClaim = inMemoryPendingTeacherCode;
              setPendingTeacherCode(null);
              const claimed = await claimTeacher(codeToClaim, session.user.id);
              if (claimed) {
                userProf = await loadProfile(session.user.id, session.user.email!, session.user.user_metadata);
              } else {
                toast.error("Kode guru salah");
              }
            }
            currentUserIdRef.current = userProf.id;
            setProfile(userProf);
          } catch (e) {
            console.error("[Auth] Exception saat memuat profil pada onAuthStateChange:", e);
          } finally {
            if (!isSameUser) {
              setLoading(false);
            }
          }
        } else {
          currentUserIdRef.current = null;
          setProfile(null);
          setLoading(false);
        }
      }, 0);
    });

    return () => listener.subscription.unsubscribe();
  }, [isMockOfflineMode]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    if (!isSupabaseConfigured) {
      const isTeacher = Boolean(
        inMemoryPendingTeacherCode ||
        email.toLowerCase().includes("guru") ||
        email.toLowerCase().includes("teacher")
      );
      const localUser: UserProfile = {
        id: `00000000-0000-0000-0000-${Date.now().toString(16).padEnd(12, "0").slice(0, 12)}`,
        full_name: email.split("@")[0] || (isTeacher ? "Guru Pengampu" : "Siswa Sigma"),
        email,
        role: isTeacher ? "teacher" : "student",
        class_name: isTeacher ? "Guru Pengampu" : "Kelas 11",
        avatar_url: "/assets/cyber_hero_profile.png",
        xp: isTeacher ? 500 : 150,
        level: isTeacher ? 5 : 1,
        badges: ["Pioneering Student"],
      };
      try {
        localStorage.setItem("sigma_offline_profile", JSON.stringify(localUser));
      } catch {}
      setProfile(localUser);
      return localUser;
    }

    isAuthenticatingRef.current = true;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("[login] Supabase error saat signInWithPassword:", error);
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          throw new Error(
            "Email atau password salah / belum terdaftar. Jika baru pertama kali menggunakan portal ini, silakan klik tab 'Daftar' untuk membuat akun baru."
          );
        }
        if (msg.includes("invalid api key") || msg.includes("apikey")) {
          throw new Error(
            "Kunci API Supabase tidak valid (Invalid API key). Pastikan VITE_SUPABASE_ANON_KEY diisi dengan kunci 'anon / public' (berawalan eyJ...) dari Supabase tanpa tanda petik, lalu lakukan Redeploy di Vercel."
          );
        }
        if (msg.includes("failed to fetch")) {
          throw new Error(
            "Gagal terhubung ke database Supabase (Failed to fetch). Periksa koneksi internet Anda atau pastikan variabel lingkungan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY sudah disetel di Vercel lalu lakukan Redeploy."
          );
        }
        throw new Error(error.message);
      }

      let userProf = await loadProfile(data.user.id, data.user.email!, data.user.user_metadata);

      // Jika kode guru disimpan di memory state (misal dari signUp tertunda atau diisi di tab Guru),
      // panggil claim_teacher saat user login dan role masih 'student'
      if (inMemoryPendingTeacherCode && userProf.role === "student") {
        const codeToClaim = inMemoryPendingTeacherCode;
        setPendingTeacherCode(null);
        const claimed = await claimTeacher(codeToClaim, data.user.id);
        if (claimed) {
          const refreshed = await refreshProfile(data.user.id);
          if (refreshed) {
            userProf = { ...userProf, ...refreshed };
          }
        } else {
          toast.error("Kode guru salah");
        }
      }

      setProfile(userProf);
      return userProf;
    } finally {
      isAuthenticatingRef.current = false;
      setLoading(false);
    }
  };

  const loginWithGoogle = async (redirectPath?: string): Promise<void> => {
    if (!isMockOfflineMode && !isSupabaseConfigured) {
      throw new Error("Supabase belum dikonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY telah diatur.");
    }
    if (isMockOfflineMode) {
      const isTeacher = Boolean(inMemoryPendingTeacherCode);
      const localUser: UserProfile = {
        id: `00000000-0000-0000-0000-${Date.now().toString(16).padEnd(12, "0").slice(0, 12)}`,
        full_name: isTeacher ? "Guru Pengampu (Google)" : "Siswa Sigma (Google)",
        email: "google_user@madarunnajah9.sch.id",
        role: isTeacher ? "teacher" : "student",
        class_name: isTeacher ? "Guru Pengampu" : "Kelas 11",
        avatar_url: "/assets/cyber_hero_profile.png",
        xp: isTeacher ? 500 : 150,
        level: isTeacher ? 5 : 1,
        badges: ["Google Pioneer"],
      };
      try {
        localStorage.setItem("sigma_offline_profile", JSON.stringify(localUser));
      } catch {}
      setProfile(localUser);
      return;
    }
    const safeRedirect = redirectPath && /^\/(?![\/\\])/.test(redirectPath) ? redirectPath : undefined;
    const targetUrl = safeRedirect
      ? `${window.location.origin}/masuk?redirect=${encodeURIComponent(safeRedirect)}`
      : `${window.location.origin}/masuk`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: targetUrl,
      },
    });
    if (error) {
      console.error("[loginWithGoogle] Supabase error saat signInWithOAuth:", error);
      if (error.message.toLowerCase().includes("failed to fetch")) {
        throw new Error(
          "Gagal terhubung ke database Supabase (Failed to fetch). Periksa koneksi internet Anda atau pastikan konfigurasi Vercel sudah sesuai."
        );
      }
      throw new Error(error.message);
    }
  };

  const register = async (
    full_name: string,
    email: string,
    password: string,
    extra: { class_name?: string; teacher_code?: string } = {}
  ): Promise<RegisterResult> => {
    if (!isSupabaseConfigured) {
      const isTeacher = Boolean(
        extra?.teacher_code?.trim() ||
        extra?.class_name?.toLowerCase().includes("guru")
      );
      const localUser: UserProfile = {
        id: `00000000-0000-0000-0000-${Date.now().toString(16).padEnd(12, "0").slice(0, 12)}`,
        full_name,
        email,
        role: isTeacher ? "teacher" : "student",
        class_name: extra?.class_name || (isTeacher ? "Guru Pengampu" : "Kelas 11"),
        avatar_url: "/assets/cyber_hero_profile.png",
        xp: isTeacher ? 500 : 50,
        level: 1,
        badges: [],
      };
      try {
        localStorage.setItem("sigma_offline_profile", JSON.stringify(localUser));
      } catch {}
      setProfile(localUser);
      return { user: localUser, sessionActive: true };
    }

    isAuthenticatingRef.current = true;
    setLoading(true);
    try {
      // (1) signUp aman — HANYA mengirim full_name (dan class_name bila ada), TIDAK mengirim role
      const signUpData: { full_name: string; class_name?: string } = { full_name };
      if (extra?.class_name) {
        signUpData.class_name = extra.class_name;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: signUpData,
        },
      });
      if (error) {
        const msg = error.message.toLowerCase();

        // Jika email sudah terdaftar, coba login otomatis jika password cocok, atau arahkan ke Masuk
        if (msg.includes("already registered") || msg.includes("already been registered")) {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!signInErr && signInData?.user) {
            let existingProf = await loadProfile(
              signInData.user.id,
              signInData.user.email!,
              signInData.user.user_metadata
            );
            const trimmedCode = extra.teacher_code?.trim() || "";
            let teacherClaimFailed = false;
            if (trimmedCode && existingProf.role === "student") {
              const claimed = await claimTeacher(trimmedCode, signInData.user.id);
              if (claimed) {
                const refreshed = await refreshProfile(signInData.user.id);
                if (refreshed) existingProf = { ...existingProf, ...refreshed };
              } else {
                teacherClaimFailed = true;
              }
            }
            setProfile(existingProf);
            return { user: existingProf, sessionActive: true, teacherClaimFailed };
          }

          throw new Error(
            "Email ini sudah terdaftar. Silakan klik tab 'Masuk' untuk login dengan password akun kamu."
          );
        }

        if (
          msg.includes("password should contain") ||
          msg.includes("weak_password") ||
          msg.includes("characters")
        ) {
          throw new Error(
            "Password harus mengandung kombinasi huruf kecil (a-z), huruf besar (A-Z), dan angka (0-9). Contoh: Sigma123"
          );
        }

        console.error("[register] Supabase error saat signUp:", error.message);
        if (msg.includes("invalid api key") || msg.includes("apikey")) {
          throw new Error(
            "Kunci API Supabase tidak valid (Invalid API key). Pastikan VITE_SUPABASE_ANON_KEY diisi dengan kunci 'anon / public' (berawalan eyJ...) dari Supabase tanpa tanda petik, lalu lakukan Redeploy di Vercel."
          );
        }
        if (msg.includes("failed to fetch")) {
          throw new Error(
            "Gagal terhubung ke database Supabase (Failed to fetch). Pastikan koneksi internet aktif dan Environment Variables Vercel sudah disetel."
          );
        }
        throw new Error(error.message);
      }
      if (!data.user) throw new Error("Registrasi gagal, coba lagi.");

      const trimmedCode = extra.teacher_code?.trim() || "";

      // Jika signUp butuh konfirmasi email sehingga session belum aktif:
      // Simpan kode guru sementara di memory state (BUKAN di localStorage)
      if (!data.session) {
        if (trimmedCode) {
          setPendingTeacherCode(trimmedCode);
        }
        return { user: null, sessionActive: false };
      }

      // Session sudah aktif: muat profil awal dari tabel profiles (trigger membuat profil dengan role 'student')
      let userProf = await loadProfile(data.user.id, data.user.email!, data.user.user_metadata);

      let teacherClaimFailed = false;

      // (2) Jika user mengisi kode guru, panggil supabase.rpc('claim_teacher', { code })
      if (trimmedCode) {
        const { data: claimed, error: claimError } = await supabase.rpc("claim_teacher", {
          code: trimmedCode,
        });
        if (claimError) {
          console.error("[register] Supabase error saat memanggil RPC claim_teacher:", claimError);
          teacherClaimFailed = true;
        } else if (claimed === true) {
          // (3) Kalau hasilnya true, panggil refreshProfile() untuk membaca role terbaru dari tabel profiles
          const refreshed = await refreshProfile(data.user.id);
          if (refreshed) {
            userProf = { ...userProf, ...refreshed };
          }
        } else {
          // (4) Kalau false, kode salah dan akun tetap sebagai siswa
          teacherClaimFailed = true;
        }
      }

      setProfile(userProf);
      return { user: userProf, sessionActive: true, teacherClaimFailed };
    } finally {
      isAuthenticatingRef.current = false;
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("sigma_offline_profile");
    } catch {}
    if (isSupabaseConfigured) {
      supabase.auth.signOut().then(({ error }) => {
        if (error) console.error("[logout] Supabase error saat signOut:", error);
      }).catch((err) => {
        console.error("[logout] Exception saat signOut:", err);
      });
    }
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    // Sesuai aturan keamanan Supabase baru:
    // Client HANYA boleh UPDATE kolom: full_name, class_name, avatar_url.
    // Kolom role, xp, dan level tidak boleh diubah langsung dari client.
    const allowedFields: { full_name?: string; class_name?: string; avatar_url?: string } = {};
    if (updates.full_name !== undefined) allowedFields.full_name = updates.full_name;
    if (updates.class_name !== undefined) allowedFields.class_name = updates.class_name;
    if (updates.avatar_url !== undefined) {
      allowedFields.avatar_url = updates.avatar_url;
    } else if (updates.avatar !== undefined) {
      allowedFields.avatar_url = updates.avatar;
    }

    if (!isSupabaseConfigured) {
      setProfile((prev) => {
        if (!prev) return null;
        const n = { ...prev, ...allowedFields };
        try {
          localStorage.setItem("sigma_offline_profile", JSON.stringify(n));
        } catch {}
        return n;
      });
      return;
    }

    if (Object.keys(allowedFields).length > 0) {
      try {
        const { error } = await supabase.from("profiles").update(allowedFields).eq("id", profile.id);
        if (error) {
          console.error("[updateProfile] Supabase error saat update profil:", error);
          toast.error("Gagal memperbarui profil: perubahan ditolak oleh server.");
          return;
        }
      } catch (e) {
        console.error("[updateProfile] Exception saat update profil:", e);
        toast.error("Terjadi kesalahan saat menyimpan perubahan profil.");
        return;
      }
    }

    setProfile((prev) => (prev ? { ...prev, ...allowedFields } : prev));
  };

  const addXp = async (amount: number) => {
    if (!profile || amount <= 0) return;

    if (!isSupabaseConfigured) {
      setProfile((prev) => {
        if (!prev) return null;
        const xp = (prev.xp || 0) + amount;
        const level = Math.floor(xp / 100) + 1;
        const n = { ...prev, xp, level };
        try {
          localStorage.setItem("sigma_offline_profile", JSON.stringify(n));
        } catch {}
        return n;
      });
      return;
    }

    try {
      // Sesuai fungsi RPC database baru: add_xp(amount int) maksimal 100 per panggilan
      let remaining = Math.round(amount);
      while (remaining > 0) {
        const chunk = Math.min(remaining, 100);
        const { error } = await supabase.rpc("add_xp", { amount: chunk });
        if (error) {
          console.error(`[addXp] Supabase error saat memanggil RPC add_xp (amount=${chunk}):`, error);
          break;
        }
        remaining -= chunk;
      }

      await refreshProfile();
    } catch (e) {
      console.error("[addXp] Exception saat menambah XP via RPC add_xp:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        pendingTeacherCode,
        setPendingTeacherCode,
        claimTeacher,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        addXp,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Fungsi helper mandiri untuk memanggil RPC add_xp dari mana saja (maksimal 100 per panggilan)
export async function addXpRpc(amount: number): Promise<void> {
  if (amount <= 0) return;
  try {
    let remaining = Math.round(amount);
    while (remaining > 0) {
      const chunk = Math.min(remaining, 100);
      const { error } = await supabase.rpc("add_xp", { amount: chunk });
      if (error) {
        console.error(`[addXpRpc] Supabase error saat memanggil RPC add_xp (chunk=${chunk}):`, error);
        break;
      }
      remaining -= chunk;
    }
  } catch (err) {
    console.error("[addXpRpc] Exception saat memanggil RPC add_xp:", err);
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function getUserDisplayName(profile: UserProfile | null | undefined, fallback = "tumbalion"): string {
  if (!profile) return fallback;
  return profile.full_name || profile.email?.split("@")[0] || fallback;
}
