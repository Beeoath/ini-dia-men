import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./auth";
import { MODULES, SigmaModule } from "./sigmaData";

export interface StudentModuleProgress {
  moduleId: string;
  slideIdx: number;
  totalSlides: number;
  percent: number;
  lastStudiedAt: string;
  completed: boolean;
  quizScore?: number;
}

// "Modul terakhir dibuka" cuma preferensi UI, disimpan di browser aja (bukan data penting)
const LAST_MODULE_KEY = "sigma_last_active_module_v3";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isDemoUser = (userId?: string | null): boolean => {
  if (!userId) return true;
  if (userId.startsWith("demo-") || userId.startsWith("00000000-0000-0000-0000-")) return true;
  return !UUID_REGEX.test(userId);
};

function rowToProgress(row: any): StudentModuleProgress {
  return {
    moduleId: row.module_id,
    slideIdx: row.slide_idx,
    totalSlides: row.total_slides,
    percent: row.percent,
    lastStudiedAt: row.last_studied_at,
    completed: row.completed,
    quizScore: row.quiz_score ?? undefined,
  };
}

// Minimum quiz score required to pass a chapter and unlock the next chapter (Nilai 7 / 70%)
export const MIN_PASSING_SCORE = 70;

export interface ModuleLockStatus {
  isUnlocked: boolean;
  requiredModuleTitle?: string;
  requiredModuleId?: string;
  minScore: number;
  reason?: string;
}

export function getModuleUnlockStatus(
  moduleId: string,
  userProgress: Record<string, StudentModuleProgress>
): ModuleLockStatus {
  const targetModule = MODULES.find((m) => m.id === moduleId);
  // Bab 1 (District 1) selalu terbuka untuk semua siswa
  if (
    !targetModule ||
    targetModule.districtId === 1 ||
    moduleId === "mod-aljabar-1" ||
    moduleId === "mod-bilangan-1"
  ) {
    return { isUnlocked: true, minScore: MIN_PASSING_SCORE };
  }

  // Cek Bab 1 terlebih dahulu (Wajib selesai & nilai kuis minimal 70)
  const bab1Progress = userProgress["mod-aljabar-1"] || userProgress["mod-bilangan-1"];
  const bab1Score = bab1Progress?.quizScore ?? 0;
  const bab1Passed = Boolean(bab1Progress?.completed && bab1Score >= MIN_PASSING_SCORE);

  if (!bab1Passed) {
    return {
      isUnlocked: false,
      requiredModuleTitle: "BAB 1: BILANGAN",
      requiredModuleId: "mod-aljabar-1",
      minScore: MIN_PASSING_SCORE,
      reason:
        bab1Progress && bab1Score > 0
          ? `Nilai kuis Bab 1 kamu (${bab1Score}) belum mencapai batas KKM minimal 70 (nilai 7). Silakan ulangi kuis Bab 1 untuk membuka materi ini.`
          : "Kamu wajib mengerjakan Bab 1 (Bilangan) dan meraih nilai kuis minimal 70 (nilai 7) terlebih dahulu sebelum dapat membuka bab ini.",
    };
  }

  // Jika target bab > 2, cek juga bab sebelumnya secara sekuensial
  if (targetModule.districtId > 2) {
    const prevDistrictId = targetModule.districtId - 1;
    const prevModule = MODULES.find((m) => m.districtId === prevDistrictId);
    if (prevModule) {
      const prevProg = userProgress[prevModule.id];
      const prevScore = prevProg?.quizScore ?? 0;
      const prevPassed = Boolean(prevProg?.completed && prevScore >= MIN_PASSING_SCORE);
      if (!prevPassed) {
        return {
          isUnlocked: false,
          requiredModuleTitle: prevModule.title,
          requiredModuleId: prevModule.id,
          minScore: MIN_PASSING_SCORE,
          reason: `Selesaikan ${prevModule.title} dan raih nilai kuis minimal 70 terlebih dahulu untuk membuka bab ini.`,
        };
      }
    }
  }

  return { isUnlocked: true, minScore: MIN_PASSING_SCORE };
}

export async function getAllProgress(userId: string): Promise<Record<string, StudentModuleProgress>> {
  if (isDemoUser(userId)) {
    try {
      const stored = localStorage.getItem(`sigma_demo_progress_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    // Initial demo progress: Siswa mulai dari Bab 1, Bab 2 terkunci
    return {
      "mod-aljabar-1": {
        moduleId: "mod-aljabar-1",
        slideIdx: 0,
        totalSlides: 14,
        percent: 0,
        lastStudiedAt: new Date().toISOString(),
        completed: false,
      },
    };
  }

  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("[userProgress.getAllProgress] Supabase error saat mengambil user_progress:", error);
      return {};
    }

    const map: Record<string, StudentModuleProgress> = {};
    for (const row of data || []) {
      map[row.module_id] = rowToProgress(row);
    }
    return map;
  } catch (err) {
    console.error("[userProgress.getAllProgress] Exception saat mengambil user_progress:", err);
    return {};
  }
}

export async function saveModuleProgress(
  userId: string,
  moduleId: string,
  slideIdx: number,
  totalSlides: number
) {
  const percent = Math.min(100, Math.round(((slideIdx + 1) / totalSlides) * 100));

  if (isDemoUser(userId)) {
    try {
      const key = `sigma_demo_progress_${userId}`;
      const stored = localStorage.getItem(key);
      const map = stored ? JSON.parse(stored) : {};
      map[moduleId] = {
        moduleId,
        slideIdx,
        totalSlides,
        percent,
        completed: percent >= 100,
        lastStudiedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(map));
    } catch {
      // ignore
    }
    localStorage.setItem(LAST_MODULE_KEY, moduleId);
    window.dispatchEvent(new Event("sigma_progress_updated"));
    return;
  }

  try {
    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        module_id: moduleId,
        slide_idx: slideIdx,
        total_slides: totalSlides,
        percent,
        completed: percent >= 100,
        last_studied_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id" }
    );

    if (error) {
      console.error("[userProgress.saveModuleProgress] Supabase error saat menyimpan progress modul:", error);
    }
  } catch (e) {
    console.error("[userProgress.saveModuleProgress] Exception saat menyimpan progress modul:", e);
  }

  localStorage.setItem(LAST_MODULE_KEY, moduleId);
  window.dispatchEvent(new Event("sigma_progress_updated"));
}

export async function recordQuizCompletion(userId: string, moduleId: string, score: number) {
  if (isDemoUser(userId)) {
    try {
      const key = `sigma_demo_progress_${userId}`;
      const stored = localStorage.getItem(key);
      const map = stored ? JSON.parse(stored) : {};
      const existing = map[moduleId];
      map[moduleId] = {
        moduleId,
        slideIdx: existing?.slideIdx ?? 0,
        totalSlides: existing?.totalSlides ?? 1,
        percent: 100,
        quizScore: score,
        completed: score >= MIN_PASSING_SCORE || existing?.completed || false,
        lastStudiedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(map));
    } catch {
      // ignore
    }
    localStorage.setItem(LAST_MODULE_KEY, moduleId);
    window.dispatchEvent(new Event("sigma_progress_updated"));
    return;
  }

  try {
    // Ambil dulu row yang ada (kalau ada), biar slideIdx/totalSlides gak ketimpa jadi 0
    const { data: existing, error: selectError } = await supabase
      .from("user_progress")
      .select("slide_idx, total_slides, completed")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (selectError) {
      console.error("[userProgress.recordQuizCompletion] Supabase error saat mengecek progress sebelumnya:", selectError);
    }

    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        module_id: moduleId,
        slide_idx: existing?.slide_idx ?? 0,
        total_slides: existing?.total_slides ?? 1,
        percent: 100,
        quiz_score: score,
        completed: score >= MIN_PASSING_SCORE || existing?.completed || false,
        last_studied_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id" }
    );

    if (error) {
      console.error("[userProgress.recordQuizCompletion] Supabase error saat menyimpan hasil kuis:", error);
    }
  } catch (e) {
    console.error("[userProgress.recordQuizCompletion] Exception saat menyimpan hasil kuis:", e);
  }

  localStorage.setItem(LAST_MODULE_KEY, moduleId);
  window.dispatchEvent(new Event("sigma_progress_updated"));
}

export function getLastActiveModule(): SigmaModule {
  try {
    const lastId = localStorage.getItem(LAST_MODULE_KEY);
    if (lastId) {
      const found = MODULES.find((m) => m.id === lastId);
      if (found) return found;
    }
  } catch {
    // fallback
  }
  return MODULES[0];
}

export function setLastActiveModule(moduleId: string) {
  localStorage.setItem(LAST_MODULE_KEY, moduleId);
  window.dispatchEvent(new Event("sigma_progress_updated"));
}

// Hook: otomatis ambil progress user yang lagi login, dan refresh tiap ada perubahan
export function useStudentProgress() {
  const { profile } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, StudentModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  const refreshProgress = useCallback(async () => {
    if (!profile) {
      setProgressMap({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getAllProgress(profile.id);
    setProgressMap(data);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refreshProgress();
    window.addEventListener("sigma_progress_updated", refreshProgress);
    return () => window.removeEventListener("sigma_progress_updated", refreshProgress);
  }, [refreshProgress]);

  return { progressMap, userProgress: progressMap, loading, refreshProgress };
}
