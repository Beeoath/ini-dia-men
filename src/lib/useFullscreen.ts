import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sigma_fullscreen_mode";

export function useFullscreen(defaultFull = true) {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? saved === "true" : defaultFull;
    } catch {
      return defaultFull;
    }
  });

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }

      try {
        if (next && !document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else if (!next && document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      } catch {
        // ignore iframe fullscreen restrictions
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        // user pressed ESC
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullScreen]);

  return { isFullScreen, setIsFullScreen, toggleFullScreen };
}
