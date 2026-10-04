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
  loginWithGoogle: () => Promise<void>;
  register: (
    full_name: string,
    email: string,
    password: string,
    role?: "student" | "teacher",
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
        .select("id, full_name, role, class_name, avatar_url, xp, level")
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

    return {
      ...profileRow,
      email,
      badges,
    };
  }

  // Fallback ke metadata sesi HANYA di memori klien (TIDAK melakukan insert/upsert ke profiles)
  // Trigger selalu membuat profil baru dengan role 'student'
  console.warn("[loadProfile] Profil belum ditemukan di database setelah 3x percobaan (menunggu trigger). Menggunakan data sesi sementara.");
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
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem("sigma_local_user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [pendingTeacherCode, setPendingTeacherCodeState] = useState<string | null>(inMemoryPendingTeacherCode);
  const isRegisteringRef = useRef(false);

  const setPendingTeacherCode = (code: string | null) => {
    const cleaned = code && code.trim() ? code.trim() : null;
    inMemoryPendingTeacherCode = cleaned;
    setPendingTeacherCodeState(cleaned);
  };

  const setLocalSessionProfile = (localUser: UserProfile | null) => {
    setProfile(localUser);
    if (localUser) {
      try {
        sessionStorage.setItem("sigma_local_user", JSON.stringify(localUser));
      } catch {
        // ignore
      }
    } else {
      try {
        sessionStorage.removeItem("sigma_local_user");
      } catch {
        // ignore
      }
    }
  };

  const refreshProfile = async (userIdOverride?: string): Promise<UserProfile | null> => {
    const targetId = userIdOverride || profile?.id;
    if (!targetId) return null;
    const isLocalId = targetId.startsWith("00000000-0000-0000-0000-");
    if (isLocalId) return profile;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, class_name, avatar_url, xp, level")
        .eq("id", targetId)
        .maybeSingle();

      if (error) {
        console.error("[refreshProfile] Supabase error saat memuat profil terbaru:", error);
        return profile;
      } else if (data) {
        let updatedProfile: UserProfile | null = null;
        setProfile((prev) => {
          updatedProfile = prev
            ? { ...prev, ...data }
            : {
                ...data,
                email: "",
                badges: [],
              };
          return updatedProfile;
        });
        return updatedProfile || (data as UserProfile);
      }
    } catch (err) {
      console.error("[refreshProfile] Exception saat memuat ulang profil:", err);
    }
    return profile;
  };

  const claimTeacher = async (code: string, userIdOverride?: string): Promise<boolean> => {
    const trimmed = code.trim();
    if (!trimmed) return false;

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
    if (!isSupabaseConfigured) {
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
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isRegisteringRef.current) {
        // Biarkan fungsi register() menyelesaikan alur signUp + claim_teacher terlebih dahulu
        return;
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
          setProfile(userProf);
        } catch (e) {
          console.error("[Auth] Exception saat memuat profil pada onAuthStateChange:", e);
        }
      } else {
        if (!sessionStorage.getItem("sigma_local_user")) {
          setProfile(null);
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    if (!isSupabaseConfigured) {
      const isTeacher = email.toLowerCase().includes("guru") || email.toLowerCase().includes("teacher");
      const fallbackUser: UserProfile = {
        id: isTeacher ? "00000000-0000-0000-0000-000000000002" : "00000000-0000-0000-0000-000000000001",
        full_name: email.split("@")[0] || (isTeacher ? "Guru Pengampu" : "Siswa SIGMA"),
        email,
        role: isTeacher ? "teacher" : "student",
        class_name: isTeacher ? "Guru Pengampu" : "Kelas 11",
        xp: 250,
        level: 2,
        badges: ["perintis-distrik"],
      };
      setLocalSessionProfile(fallbackUser);
      return fallbackUser;
    }

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

    // Jika sebelumnya signUp butuh konfirmasi email dan kode guru disimpan di memory state,
    // panggil claim_teacher saat user berhasil login pertama kali
    if (inMemoryPendingTeacherCode && userProf.role === "student") {
      const codeToClaim = inMemoryPendingTeacherCode;
      setPendingTeacherCode(null);
      const claimed = await claimTeacher(codeToClaim, data.user.id);
      if (claimed) {
        const refreshed = await refreshProfile(data.user.id);
        if (refreshed) {
          userProf = { ...userProf, ...refreshed, role: "teacher" };
        } else {
          userProf = { ...userProf, role: "teacher" };
        }
      } else {
        toast.error("Kode guru salah");
      }
    }

    setProfile(userProf);
    try {
      sessionStorage.removeItem("sigma_local_user");
    } catch {
      // ignore
    }
    return userProf;
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      throw new Error("failed to fetch");
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
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
    role: "student" | "teacher" = "student",
    extra: { class_name?: string; teacher_code?: string } = {}
  ): Promise<RegisterResult> => {
    if (!isSupabaseConfigured) {
      const fallbackUser: UserProfile = {
        id: "00000000-0000-0000-0000-000000000001",
        full_name,
        email,
        role: "student",
        class_name: extra.class_name || "Kelas 11",
        xp: 100,
        level: 1,
        badges: ["perintis-distrik"],
      };
      setLocalSessionProfile(fallbackUser);
      return { user: fallbackUser, sessionActive: true };
    }

    isRegisteringRef.current = true;
    try {
      // (1) signUp seperti biasa — TIDAK mengirim kolom role ke database/metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, class_name: extra.class_name },
        },
      });
      if (error) {
        console.error("[register] Supabase error saat signUp:", error);
        const msg = error.message.toLowerCase();
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
        if (role === "teacher" && trimmedCode) {
          setPendingTeacherCode(trimmedCode);
        }
        return { user: null, sessionActive: false };
      }

      // Session sudah aktif: muat profil awal (trigger membuat profil dengan role 'student')
      let userProf = await loadProfile(data.user.id, data.user.email!, data.user.user_metadata);
      setProfile(userProf);

      let teacherClaimFailed = false;

      // (2) Jika mendaftar sebagai guru, panggil supabase.rpc('claim_teacher', { code })
      if (role === "teacher") {
        if (!trimmedCode) {
          teacherClaimFailed = true;
        } else {
          const { data: claimed, error: claimError } = await supabase.rpc("claim_teacher", {
            code: trimmedCode,
          });
          if (claimError) {
            console.error("[register] Supabase error saat memanggil RPC claim_teacher:", claimError);
            teacherClaimFailed = true;
          } else if (claimed === true) {
            // (3) Kalau hasilnya true, panggil refreshProfile()
            const refreshed = await refreshProfile(data.user.id);
            userProf = refreshed
              ? { ...userProf, ...refreshed, role: "teacher" }
              : { ...userProf, role: "teacher" };
            setProfile(userProf);
          } else {
            // (4) Kalau false, akun tetap sebagai siswa
            teacherClaimFailed = true;
          }
        }
      }

      try {
        sessionStorage.removeItem("sigma_local_user");
      } catch {
        // ignore
      }
      return { user: userProf, sessionActive: true, teacherClaimFailed };
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const logout = () => {
    supabase.auth.signOut().then(({ error }) => {
      if (error) console.error("[logout] Supabase error saat signOut:", error);
    }).catch((err) => {
      console.error("[logout] Exception saat signOut:", err);
    });
    setProfile(null);
    try {
      sessionStorage.removeItem("sigma_local_user");
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const isLocalId = profile.id.startsWith("00000000-0000-0000-0000-");

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

    if (!isLocalId && Object.keys(allowedFields).length > 0) {
      try {
        const { error } = await supabase.from("profiles").update(allowedFields).eq("id", profile.id);
        if (error) {
          console.error("[updateProfile] Supabase error saat update profil:", error);
        }
      } catch (e) {
        console.error("[updateProfile] Exception saat update profil:", e);
      }
    }

    setProfile((prev) => {
      const updated = prev ? { ...prev, ...allowedFields } : prev;
      if (updated && sessionStorage.getItem("sigma_local_user")) {
        try {
          sessionStorage.setItem("sigma_local_user", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const addXp = async (amount: number) => {
    if (!profile || amount <= 0) return;
    const isLocalId = profile.id.startsWith("00000000-0000-0000-0000-");

    if (isLocalId) {
      setProfile((prev) => {
        if (!prev) return null;
        const newXp = (prev.xp || 0) + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        const updated = { ...prev, xp: newXp, level: newLevel };
        try {
          sessionStorage.setItem("sigma_local_user", JSON.stringify(updated));
        } catch {}
        return updated;
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
