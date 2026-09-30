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
  setDemoProfile: (demoProfile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ambil baris profiles + email dari session, gabungin jadi satu object UserProfile
async function loadProfile(userId: string, email: string, userMetadata?: any): Promise<UserProfile> {
  try {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, full_name, role, class_name, avatar_url, xp, level")
      .eq("id", userId)
      .maybeSingle();

    if (profileRow) {
      const { data: badgeRows } = await supabase
        .from("user_badges")
        .select("badge")
        .eq("user_id", userId);

      return {
        ...profileRow,
        email,
        badges: (badgeRows || []).map((b) => b.badge),
      };
    }
  } catch (fetchErr) {
    console.warn("loadProfile network check:", fetchErr);
  }

  // Jika profileRow belum ada (misalnya dari Google OAuth atau trigger DB belum berjalan)
  // Ambil informasi dari userMetadata Google
  const fullName =
    userMetadata?.full_name ||
    userMetadata?.name ||
    email.split("@")[0];
  const role: "student" | "teacher" =
    userMetadata?.role === "teacher" ? "teacher" : "student";
  const className = userMetadata?.class_name || (role === "teacher" ? "Guru Pengampu" : "Kelas 11");
  const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture;

  try {
    const { data: createdRow, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
        role,
        class_name: className,
        avatar_url: avatarUrl,
        xp: 0,
        level: 1,
      })
      .select("id, full_name, role, class_name, avatar_url, xp, level")
      .maybeSingle();

    if (!insertError && createdRow) {
      return {
        ...createdRow,
        email,
        badges: [],
      };
    }
  } catch (err) {
    console.warn("Auto-insert profile fallback:", err);
  }

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
    const { email, badges, ...rest } = updates;
    const isDemoId = profile.id.startsWith("00000000-0000-0000-0000-") || profile.id.startsWith("demo-");
    if (!isDemoId) {
      try {
        const { error } = await supabase.from("profiles").update(rest).eq("id", profile.id);
        if (error) console.warn("Supabase update profile notice:", error.message);
      } catch (e) {
        console.warn("Offline profile update:", e);
      }
    }
    setProfile((prev) => {
      const updated = prev ? { ...prev, ...updates } : prev;
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
        setDemoProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function getUserDisplayName(profile: UserProfile | null | undefined, fallback = "tumbalion"): string {
  if (!profile) return fallback;
  return profile.full_name || profile.email?.split("@")[0] || fallback;
}
