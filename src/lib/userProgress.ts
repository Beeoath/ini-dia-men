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

export async function getAllProgress(userId: string): Promise<Record<string, StudentModuleProgress>> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Gagal ambil progress", error);
    return {};
  }

  const map: Record<string, StudentModuleProgress> = {};
  for (const row of data || []) {
    map[row.module_id] = rowToProgress(row);
  }
  return map;
}

export async function saveModuleProgress(
  userId: string,
  moduleId: string,
  slideIdx: number,
  totalSlides: number
) {
  const percent = Math.min(100, Math.round(((slideIdx + 1) / totalSlides) * 100));

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

  if (error) console.error("Gagal simpan progress", error);
  localStorage.setItem(LAST_MODULE_KEY, moduleId);
  window.dispatchEvent(new Event("sigma_progress_updated"));
}

export async function recordQuizCompletion(userId: string, moduleId: string, score: number) {
  // Ambil dulu row yang ada (kalau ada), biar slideIdx/totalSlides gak ketimpa jadi 0
  const { data: existing } = await supabase
    .from("user_progress")
    .select("slide_idx, total_slides, completed")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      module_id: moduleId,
      slide_idx: existing?.slide_idx ?? 0,
      total_slides: existing?.total_slides ?? 1,
      percent: 100,
      quiz_score: score,
      completed: score >= 75 || existing?.completed || false,
      last_studied_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id" }
  );

  if (error) console.error("Gagal simpan hasil quiz", error);
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
    setProgressMap(await getAllProgress(profile.id));
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refreshProgress();
    window.addEventListener("sigma_progress_updated", refreshProgress);
    return () => window.removeEventListener("sigma_progress_updated", refreshProgress);
  }, [refreshProgress]);

  return { progressMap, loading, refreshProgress };
}
