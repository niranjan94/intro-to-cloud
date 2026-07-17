/**
 * Small animation helpers for the lifecycle trace. Everything degrades to an
 * instant jump under prefers-reduced-motion.
 */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Smooth acceleration then deceleration (cubic). */
export const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export interface Cancelable {
  cancel: () => void;
}

/**
 * Drive `onProgress(0..1)` over `duration` ms with eased timing, then call
 * `onDone`. Returns a handle whose `cancel()` stops the tween. Under reduced
 * motion it jumps straight to the end.
 */
export function tween(
  duration: number,
  onProgress: (p: number) => void,
  onDone?: () => void,
): Cancelable {
  if (prefersReducedMotion() || duration <= 0) {
    onProgress(1);
    onDone?.();
    return { cancel() {} };
  }
  let raf = 0;
  let startTs = 0;
  let cancelled = false;
  const step = (ts: number) => {
    if (cancelled) return;
    if (!startTs) startTs = ts;
    const t = Math.min(1, (ts - startTs) / duration);
    onProgress(easeInOut(t));
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };
  raf = requestAnimationFrame(step);
  return {
    cancel() {
      cancelled = true;
      cancelAnimationFrame(raf);
    },
  };
}
