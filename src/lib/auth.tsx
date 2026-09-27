import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher";
  class_name?: string;
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
  login: (email: string, password?: string) => Promise<UserProfile>;
  register: (
    full_name: string,
    email: string,
    password?: string,
    role?: "student" | "teacher",
    extra?: { class_name?: string; teacher_code?: string }
  ) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "sigma_auth_user_session";
const USERS_DB_KEY = "sigma_registered_users_db";

const DEFAULT_USERS: Record<string, UserProfile & { password?: string }> = {
  "guru@darunnajah9.sch.id": {
    id: "usr-teacher-1",
    full_name: "Ust. Ahmad Fauzi, S.Pd.",
    email: "guru@darunnajah9.sch.id",
    role: "teacher",
    class_name: "Pengampu Matematika",
    xp: 9999,
    level: 50,
    completed_modules: [],
    badges: ["Grand Architect", "Master Moderator"],
    password: "password123",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from storage or seed defaults
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed.class_name && (parsed.class_name.includes("IPA") || parsed.class_name.includes("IPS"))) {
          parsed.class_name = parsed.class_name.includes("2") ? "Kelas 11 B" : "Kelas 11 A";
        }
        if (parsed.role === "student") {
          // Ensure student session is clean and reset from the beginning
          if (!localStorage.getItem("sigma_reset_v2_done")) {
            parsed.completed_modules = [];
            parsed.xp = 0;
            localStorage.setItem("sigma_reset_v2_done", "true");
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        setProfile(parsed);
      }

      // Ensure users DB has defaults
      const existingDb = localStorage.getItem(USERS_DB_KEY);
      if (!existingDb) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, _password = ""): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check known users or dynamically allow login
    let db: Record<string, any> = DEFAULT_USERS;
    try {
      const saved = localStorage.getItem(USERS_DB_KEY);
      if (saved) db = { ...DEFAULT_USERS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }

    let user = db[cleanEmail];

    if (!user) {
      // Auto register for seamless access if user types any email
      const isTeacher = cleanEmail.includes("guru") || cleanEmail.includes("teacher");
      user = {
        id: `usr-${Date.now()}`,
        full_name: cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        role: isTeacher ? "teacher" : "student",
        class_name: isTeacher ? "Pengampu Matematika" : "Kelas 11 A",
        xp: isTeacher ? 9999 : 0,
        level: isTeacher ? 50 : 1,
        completed_modules: [],
        badges: isTeacher ? ["Instruktur Resmi"] : ["Siswa Baru"],
      };
      db[cleanEmail] = user;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }

    setProfile(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  };

  const register = async (
    full_name: string,
    email: string,
    password = "",
    role: "student" | "teacher" = "student",
    extra: { class_name?: string; teacher_code?: string } = {}
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();

    if (role === "teacher" && extra.teacher_code?.trim() !== "SIGMAGURU2026") {
      throw new Error("Kode otorisasi guru tidak valid. Hubungi admin MA Darunnajah 9.");
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: full_name.trim(),
      email: cleanEmail,
      role,
      class_name: role === "teacher" ? "Pengampu Matematika" : extra.class_name || "Kelas 11 A",
      xp: role === "teacher" ? 9999 : 0,
      level: role === "teacher" ? 50 : 1,
      completed_modules: [],
      badges: [role === "teacher" ? "Instruktur Resmi" : "Siswa Baru"],
      created_at: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem(USERS_DB_KEY);
      const db = saved ? JSON.parse(saved) : { ...DEFAULT_USERS };
      db[cleanEmail] = { ...newUser, password };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    } catch {
      // ignore
    }

    setProfile(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        login,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function getUserDisplayName(profile: UserProfile | null | undefined, fallback = "tumbalion"): string {
  if (!profile) return fallback;
  return profile.full_name || profile.email?.split("@")[0] || fallback;
}
