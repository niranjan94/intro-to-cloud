/**
 * Small animation helpers for the DNS resolution trace. Everything degrades to
 * an instant jump under prefers-reduced-motion, so the trace is still fully
 * usable with motion disabled. Mirrors the helpers the virtual-network lesson
 * uses.
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

interface Pt {
  x: number;
  y: number;
}

const n = (v: number) => Math.round(v * 10) / 10;

/**
 * Build an SVG path through `points` with rounded corners at every bend, so a
 * traced query path reads as a smooth wire rather than sharp zig-zags.
 */
export function roundedPathD(points: Pt[], radius = 16): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${n(points[0].x)} ${n(points[0].y)}`;

  const d: string[] = [`M ${n(points[0].x)} ${n(points[0].y)}`];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    if (len1 === 0 || len2 === 0) {
      d.push(`L ${n(curr.x)} ${n(curr.y)}`);
      continue;
    }
    const r = Math.min(radius, len1 / 2, len2 / 2);
    const ax = curr.x - (v1x / len1) * r;
    const ay = curr.y - (v1y / len1) * r;
    const bx = curr.x + (v2x / len2) * r;
    const by = curr.y + (v2y / len2) * r;
    d.push(`L ${n(ax)} ${n(ay)}`);
    d.push(`Q ${n(curr.x)} ${n(curr.y)} ${n(bx)} ${n(by)}`);
  }
  const last = points[points.length - 1];
  d.push(`L ${n(last.x)} ${n(last.y)}`);
  return d.join(" ");
}

/** A short WAAPI "pop" (scale + fade in) for the answer marker. */
export function pop(el: Element | null, opts?: { scaleFrom?: number }): void {
  if (!el) return;
  el.animate(
    [
      { transform: `scale(${opts?.scaleFrom ?? 0.4})`, opacity: 0 },
      { transform: "scale(1.12)", opacity: 1, offset: 0.7 },
      { transform: "scale(1)", opacity: 1 },
    ],
    prefersReducedMotion()
      ? { duration: 1, fill: "forwards" }
      : {
          duration: 420,
          easing: "cubic-bezier(.34,1.56,.64,1)",
          fill: "forwards",
        },
  );
}
