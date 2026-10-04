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

function getLocalProgressKey(userId: string): string {
  return `sigma_local_progress_${userId}`;
}

function readLocalProgressMap(userId: string): Record<string, StudentModuleProgress> {
  try {
    const stored = localStorage.getItem(getLocalProgressKey(userId));
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
}

function writeLocalProgressMap(userId: string, map: Record<string, StudentModuleProgress>) {
  try {
    localStorage.setItem(getLocalProgressKey(userId), JSON.stringify(map));
  } catch {
    // ignore
  }
}

function getBestSessionQuizScore(moduleId: string): number | undefined {
  try {
    const saved = sessionStorage.getItem(`quiz_result_${moduleId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed?.score === "number") return parsed.score;
    }
  } catch {
    // ignore
  }
  return undefined;
}

export const isLocalSessionUser = (userId?: string | null): boolean => {
  if (!userId) return true;
  if (userId.startsWith("00000000-0000-0000-0000-")) return true;
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
  const sessionBab1Score = getBestSessionQuizScore("mod-aljabar-1") ?? 0;
  const bab1Score = Math.max(bab1Progress?.quizScore ?? 0, sessionBab1Score);
  const bab1Passed = Boolean(bab1Score >= MIN_PASSING_SCORE);

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
      const sessionPrevScore = getBestSessionQuizScore(prevModule.id) ?? 0;
      const prevScore = Math.max(prevProg?.quizScore ?? 0, sessionPrevScore);
      const prevPassed = Boolean(prevScore >= MIN_PASSING_SCORE);
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
  const localMap = readLocalProgressMap(userId);

  if (isLocalSessionUser(userId)) {
    if (Object.keys(localMap).length > 0) return localMap;
    // Initial progress: Siswa mulai dari Bab 1, Bab 2 terkunci
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

  const mergedMap: Record<string, StudentModuleProgress> = { ...localMap };

  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("[userProgress.getAllProgress] Supabase error saat mengambil user_progress:", error);
    } else {
      for (const row of data || []) {
        const remoteProg = rowToProgress(row);
        const localProg = localMap[remoteProg.moduleId];
        const bestQuizScore =
          remoteProg.quizScore !== undefined && localProg?.quizScore !== undefined
            ? Math.max(remoteProg.quizScore, localProg.quizScore)
            : remoteProg.quizScore ?? localProg?.quizScore;
        const isCompleted = Boolean(
          remoteProg.completed ||
            localProg?.completed ||
            (bestQuizScore !== undefined && bestQuizScore >= MIN_PASSING_SCORE)
        );
        mergedMap[remoteProg.moduleId] = {
          ...remoteProg,
          percent: Math.max(remoteProg.percent || 0, localProg?.percent || 0),
          quizScore: bestQuizScore,
          completed: isCompleted,
        };
      }
      writeLocalProgressMap(userId, mergedMap);
    }
  } catch (err) {
    console.error("[userProgress.getAllProgress] Exception saat mengambil user_progress:", err);
  }

  // Sinkronkan juga skor kuis di sessionStorage jika baru saja selesai dikerjakan di sesi ini
  for (const mod of MODULES) {
    const sessionScore = getBestSessionQuizScore(mod.id);
    if (sessionScore !== undefined) {
      const existing = mergedMap[mod.id];
      const bestScore = Math.max(existing?.quizScore ?? 0, sessionScore);
      mergedMap[mod.id] = {
        moduleId: mod.id,
        slideIdx: existing?.slideIdx ?? 0,
        totalSlides: existing?.totalSlides ?? 14,
        percent: Math.max(existing?.percent ?? 0, 100),
        lastStudiedAt: existing?.lastStudiedAt || new Date().toISOString(),
        quizScore: bestScore,
        completed: Boolean(existing?.completed || bestScore >= MIN_PASSING_SCORE),
      };
    }
  }

  return mergedMap;
}

export async function saveModuleProgress(
  userId: string,
  moduleId: string,
  slideIdx: number,
  totalSlides: number
) {
  const percent = Math.min(100, Math.round(((slideIdx + 1) / totalSlides) * 100));
  const localMap = readLocalProgressMap(userId);
  const localExisting = localMap[moduleId];
  const sessionScore = getBestSessionQuizScore(moduleId);
  const preservedQuizScore =
    localExisting?.quizScore !== undefined && sessionScore !== undefined
      ? Math.max(localExisting.quizScore, sessionScore)
      : localExisting?.quizScore ?? sessionScore;
  const preservedCompleted = Boolean(
    percent >= 100 ||
      localExisting?.completed ||
      (preservedQuizScore !== undefined && preservedQuizScore >= MIN_PASSING_SCORE)
  );

  // Simpan di localStorage terlebih dahulu agar state instan dan menjaga quizScore tidak hilang
  localMap[moduleId] = {
    moduleId,
    slideIdx,
    totalSlides,
    percent: Math.max(percent, localExisting?.percent ?? 0),
    quizScore: preservedQuizScore,
    completed: preservedCompleted,
    lastStudiedAt: new Date().toISOString(),
  };
  writeLocalProgressMap(userId, localMap);

  if (isLocalSessionUser(userId)) {
    localStorage.setItem(LAST_MODULE_KEY, moduleId);
    window.dispatchEvent(new Event("sigma_progress_updated"));
    return;
  }

  try {
    // Ambil dulu row yang ada di database agar completed / quiz_score tidak ketimpa jadi false
    const { data: existingRow } = await supabase
      .from("user_progress")
      .select("completed, quiz_score, percent")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .maybeSingle();

    const dbQuizScore =
      existingRow?.quiz_score !== null && existingRow?.quiz_score !== undefined
        ? Math.max(existingRow.quiz_score, preservedQuizScore ?? 0)
        : preservedQuizScore;

    const finalCompleted = Boolean(
      preservedCompleted ||
        existingRow?.completed ||
        (dbQuizScore !== undefined && dbQuizScore >= MIN_PASSING_SCORE)
    );

    const payload: Record<string, any> = {
      user_id: userId,
      module_id: moduleId,
      slide_idx: slideIdx,
      total_slides: totalSlides,
      percent: Math.max(percent, existingRow?.percent ?? 0),
      completed: finalCompleted,
      last_studied_at: new Date().toISOString(),
    };
    if (dbQuizScore !== undefined) {
      payload.quiz_score = dbQuizScore;
    }

    const { error } = await supabase
      .from("user_progress")
      .upsert(payload, { onConflict: "user_id,module_id" });

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
  const localMap = readLocalProgressMap(userId);
  const localExisting = localMap[moduleId];
  const bestLocalScore =
    localExisting?.quizScore !== undefined ? Math.max(localExisting.quizScore, score) : score;
  const isCompleted = Boolean(bestLocalScore >= MIN_PASSING_SCORE || localExisting?.completed);

  // Simpan langsung ke localStorage agar Post-Test & bab berikutnya langsung terbuka tanpa race condition
  localMap[moduleId] = {
    moduleId,
    slideIdx: localExisting?.slideIdx ?? 0,
    totalSlides: localExisting?.totalSlides ?? 14,
    percent: 100,
    quizScore: bestLocalScore,
    completed: isCompleted,
    lastStudiedAt: new Date().toISOString(),
  };
  writeLocalProgressMap(userId, localMap);

  if (isLocalSessionUser(userId)) {
    localStorage.setItem(LAST_MODULE_KEY, moduleId);
    window.dispatchEvent(new Event("sigma_progress_updated"));
    return;
  }

  try {
    // Ambil dulu row yang ada (kalau ada), biar slideIdx/totalSlides/quiz_score terbaik gak ketimpa
    const { data: existing, error: selectError } = await supabase
      .from("user_progress")
      .select("slide_idx, total_slides, completed, quiz_score")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (selectError) {
      console.error("[userProgress.recordQuizCompletion] Supabase error saat mengecek progress sebelumnya:", selectError);
    }

    const finalScore =
      existing?.quiz_score !== null && existing?.quiz_score !== undefined
        ? Math.max(existing.quiz_score, bestLocalScore)
        : bestLocalScore;

    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        module_id: moduleId,
        slide_idx: existing?.slide_idx ?? localExisting?.slideIdx ?? 0,
        total_slides: existing?.total_slides ?? localExisting?.totalSlides ?? 14,
        percent: 100,
        quiz_score: finalScore,
        completed: finalScore >= MIN_PASSING_SCORE || existing?.completed || isCompleted,
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
