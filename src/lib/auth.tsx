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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ambil baris profiles + email dari session, gabungin jadi satu object UserProfile
async function loadProfile(userId: string, email: string, userMetadata?: any): Promise<UserProfile> {
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

  // Jika profileRow belum ada (misalnya dari Google OAuth atau trigger DB belum berjalan)
  // Ambil informasi dari userMetadata Google
  const fullName =
    userMetadata?.full_name ||
    userMetadata?.name ||
    email.split("@")[0];
  const role: "student" | "teacher" =
    userMetadata?.role === "teacher" ? "teacher" : "student";
  const className = userMetadata?.class_name || (role === "teacher" ? "Guru Pengampu" : "Kelas 11 A");
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek session yang lagi aktif waktu app dibuka
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          setProfile(await loadProfile(session.user.id, session.user.email!, session.user.user_metadata));
        } catch (e) {
          console.error("Gagal load profile session:", e);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    // Dengerin perubahan login/logout (termasuk dari tab lain atau redirect OAuth)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          setProfile(await loadProfile(session.user.id, session.user.email!, session.user.user_metadata));
        } catch (e) {
          console.error("Gagal load profile auth change:", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new Error(
          "Email atau password salah / belum terdaftar. Jika baru pertama kali menggunakan portal ini, silakan klik tab 'Daftar' untuk membuat akun baru."
        );
      }
      throw new Error(error.message);
    }
    return loadProfile(data.user.id, data.user.email!, data.user.user_metadata);
  };

  const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });
    if (error) throw new Error(error.message);
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

    // full_name/role/class_name dikirim lewat metadata, ditangkap trigger
    // handle_new_user() di database buat auto-isi tabel profiles.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role, class_name: extra.class_name },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Registrasi gagal, coba lagi.");

    return loadProfile(data.user.id, data.user.email!, data.user.user_metadata);
  };

  const logout = () => {
    supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const { email, badges, ...rest } = updates; // email & badges ditangani terpisah
    const { error } = await supabase.from("profiles").update(rest).eq("id", profile.id);
    if (error) throw new Error(error.message);
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
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
