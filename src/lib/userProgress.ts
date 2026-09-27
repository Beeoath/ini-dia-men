import { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "sigma_student_progress_v3";
const LAST_MODULE_KEY = "sigma_last_active_module_v3";

// Default initial progress starting at 0%
const DEFAULT_PROGRESS: Record<string, StudentModuleProgress> = {
  "mod-aljabar-1": {
    moduleId: "mod-aljabar-1",
    slideIdx: 0,
    totalSlides: 15,
    percent: 0,
    lastStudiedAt: new Date().toISOString(),
    completed: false,
  },
  "mod-aljabar-2": {
    moduleId: "mod-aljabar-2",
    slideIdx: 0,
    totalSlides: 16,
    percent: 0,
    lastStudiedAt: new Date().toISOString(),
    completed: false,
  },
  "mod-geometri-1": {
    moduleId: "mod-geometri-1",
    slideIdx: 0,
    totalSlides: 15,
    percent: 0,
    lastStudiedAt: new Date().toISOString(),
    completed: false,
  },
  "mod-trigo-1": {
    moduleId: "mod-trigo-1",
    slideIdx: 0,
    totalSlides: 13,
    percent: 0,
    lastStudiedAt: new Date().toISOString(),
    completed: false,
  },
};

export function getAllProgress(): Record<string, StudentModuleProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Clear legacy storage key if exists
      localStorage.removeItem("sigma_student_progress_v2");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROGRESS));
      return DEFAULT_PROGRESS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed reading progress from localStorage", err);
    return DEFAULT_PROGRESS;
  }
}

export function saveModuleProgress(moduleId: string, slideIdx: number, totalSlides: number) {
  try {
    const all = getAllProgress();
    const percent = Math.min(100, Math.round(((slideIdx + 1) / totalSlides) * 100));
    all[moduleId] = {
      moduleId,
      slideIdx,
      totalSlides,
      percent,
      lastStudiedAt: new Date().toISOString(),
      completed: percent >= 100,
      quizScore: all[moduleId]?.quizScore,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    localStorage.setItem(LAST_MODULE_KEY, moduleId);
    window.dispatchEvent(new Event("sigma_progress_updated"));
  } catch (err) {
    console.error("Failed saving module progress", err);
  }
}

export function recordQuizCompletion(moduleId: string, score: number) {
  try {
    const all = getAllProgress();
    const existing = all[moduleId] || {
      moduleId,
      slideIdx: 0,
      totalSlides: 1,
      percent: 100,
      lastStudiedAt: new Date().toISOString(),
      completed: score >= 75,
    };
    all[moduleId] = {
      ...existing,
      quizScore: score,
      completed: score >= 75 || existing.completed,
      lastStudiedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    localStorage.setItem(LAST_MODULE_KEY, moduleId);
    window.dispatchEvent(new Event("sigma_progress_updated"));
  } catch (err) {
    console.error("Failed saving quiz completion", err);
  }
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
  try {
    localStorage.setItem(LAST_MODULE_KEY, moduleId);
    window.dispatchEvent(new Event("sigma_progress_updated"));
  } catch {
    // fallback
  }
}

export function useStudentProgress() {
  const [progressMap, setProgressMap] = useState<Record<string, StudentModuleProgress>>(() => getAllProgress());

  const refreshProgress = useCallback(() => {
    setProgressMap(getAllProgress());
  }, []);

  useEffect(() => {
    refreshProgress();
    const handleUpdate = () => refreshProgress();
    window.addEventListener("sigma_progress_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("sigma_progress_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshProgress]);

  return { progressMap, refreshProgress };
}
