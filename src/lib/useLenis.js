import { useEffect } from "react";
import Lenis from "lenis";

let activeLenis = null;

export function getLenis() {
  return activeLenis;
}

export function scrollToTarget(target, options = {}) {
  if (typeof window === "undefined") return;

  const defaultOptions = {
    offset: -20,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    ...options,
  };

  if (activeLenis) {
    try {
      activeLenis.scrollTo(target, defaultOptions);
      return;
    } catch {
      // fallback if Lenis scrollTo errors
    }
  }

  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function useLenis() {
  useEffect(() => {
    let lenis;
    let animId;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      activeLenis = lenis;
      if (typeof window !== "undefined") {
        window.lenis = lenis;
      }

      function raf(time) {
        lenis?.raf(time);
        animId = requestAnimationFrame(raf);
      }

      animId = requestAnimationFrame(raf);
    } catch {
      // Graceful fallback if Lenis fails in iframe
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      lenis?.destroy();
      if (activeLenis === lenis) {
        activeLenis = null;
      }
    };
  }, []);
}

