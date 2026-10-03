import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

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

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<void>;
  register: (
    full_name: string,
    email: string,
    password: string,
    role?: "student" | "teacher",
    extra?: { class_name?: string; teacher_code?: string }
  ) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoProfile: (demoProfile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  console.warn("[loadProfile] Profil belum ditemukan di database setelah 3x percobaan (menunggu trigger). Menggunakan data sesi sementara.");
  const fullName =
    userMetadata?.full_name ||
    userMetadata?.name ||
    email.split("@")[0];
  const role: "student" | "teacher" =
    userMetadata?.role === "teacher" ? "teacher" : "student";
  const className = userMetadata?.class_name || (role === "teacher" ? "Guru Pengampu" : "Kelas 11");
  const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture;

  return {
    id: userId,
    full_name: fullName,
    email,
    role,
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
      const stored = sessionStorage.getItem("sigma_demo_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === "demo-siswa-id") parsed.id = "00000000-0000-0000-0000-000000000001";
        if (parsed.id === "demo-guru-id") parsed.id = "00000000-0000-0000-0000-000000000002";
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const setDemoProfile = (demo: UserProfile | null) => {
    setProfile(demo);
    if (demo) {
      try {
        sessionStorage.setItem("sigma_demo_user", JSON.stringify(demo));
      } catch {
        // ignore
      }
    } else {
      try {
        sessionStorage.removeItem("sigma_demo_user");
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    // Cek session yang lagi aktif waktu app dibuka
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.warn("Supabase session check notice:", error.message);
      }
      if (session?.user) {
        try {
          setProfile(await loadProfile(session.user.id, session.user.email!, session.user.user_metadata));
        } catch (e) {
          console.error("Gagal load profile session:", e);
        }
      }
      setLoading(false);
    }).catch((err) => {
      console.warn("Supabase auth unreachable:", err);
      setLoading(false);
    });

    // Dengerin perubahan login/logout (termasuk dari tab lain atau redirect OAuth)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          setProfile(await loadProfile(session.user.id, session.user.email!, session.user.user_metadata));
        } catch (e) {
          console.error("Gagal load profile auth change:", e);
        }
      } else {
        // Jangan hapus profile jika sedang pakai demoProfile
        if (!sessionStorage.getItem("sigma_demo_user")) {
          setProfile(null);
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
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
    const userProf = await loadProfile(data.user.id, data.user.email!, data.user.user_metadata);
    setProfile(userProf);
    try {
      sessionStorage.removeItem("sigma_demo_user");
    } catch {
      // ignore
    }
    return userProf;
  };

  const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });
    if (error) {
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
  ): Promise<UserProfile> => {
    const trimmedCode = extra.teacher_code?.trim();
    if (role === "teacher" && trimmedCode !== "SIGMAGURU2026" && trimmedCode !== "GURU-DN9") {
      throw new Error("Kode otorisasi guru tidak valid. Hubungi admin MA Darunnajah 9.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role, class_name: extra.class_name },
      },
    });
    if (error) {
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

    const userProf = await loadProfile(data.user.id, data.user.email!, data.user.user_metadata);
    setProfile(userProf);
    try {
      sessionStorage.removeItem("sigma_demo_user");
    } catch {
      // ignore
    }
    return userProf;
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    setProfile(null);
    try {
      sessionStorage.removeItem("sigma_demo_user");
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const isDemoId = profile.id.startsWith("00000000-0000-0000-0000-") || profile.id.startsWith("demo-");

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

    if (!isDemoId && Object.keys(allowedFields).length > 0) {
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
      if (updated && sessionStorage.getItem("sigma_demo_user")) {
        try {
          sessionStorage.setItem("sigma_demo_user", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const addXp = async (amount: number) => {
    if (!profile || amount <= 0) return;
    const isDemoId = profile.id.startsWith("00000000-0000-0000-0000-") || profile.id.startsWith("demo-");

    if (isDemoId) {
      setProfile((prev) => {
        if (!prev) return null;
        const newXp = (prev.xp || 0) + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        const updated = { ...prev, xp: newXp, level: newLevel };
        try {
          sessionStorage.setItem("sigma_demo_user", JSON.stringify(updated));
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

  const refreshProfile = async () => {
    if (!profile) return;
    const isDemoId = profile.id.startsWith("00000000-0000-0000-0000-") || profile.id.startsWith("demo-");
    if (isDemoId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, class_name, avatar_url, xp, level")
        .eq("id", profile.id)
        .maybeSingle();

      if (error) {
        console.error("[refreshProfile] Supabase error saat memuat profil terbaru:", error);
      } else if (data) {
        setProfile((prev) => (prev ? { ...prev, ...data } : null));
      }
    } catch (err) {
      console.error("[refreshProfile] Exception saat memuat ulang profil:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        addXp,
        refreshProfile,
        setDemoProfile,
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
