import type { InvestigationResult } from "@/components/investigation/types";

/**
 * Client-side persistence for Investigation results. Attempts are graded in the
 * browser (the app has no backend), and the outcome is kept per Investigation id
 * in localStorage so the queue can show a done/score badge across visits. All
 * reads guard `typeof window` so they are safe during SSR/prerender, mirroring
 * `src/lib/provider.ts`.
 */

const STORAGE_KEY = "intro-to-cloud:investigations";

type ResultMap = Record<string, InvestigationResult>;

function readMap(): ResultMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as ResultMap) : {};
  } catch {
    // Corrupt or unavailable storage: treat as no history rather than throwing.
    return {};
  }
}

function writeMap(map: ResultMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or blocked: results are best-effort, so drop silently.
  }
}

/** All stored Investigation results, keyed by id. */
export function getInvestigationResults(): ResultMap {
  return readMap();
}

/** The stored result for one Investigation, if the learner has attempted it. */
export function getInvestigationResult(
  id: string,
): InvestigationResult | undefined {
  return readMap()[id];
}

/**
 * Record an attempt, keeping the best outcome: a correct call always beats a
 * wrong one, and among same-call attempts the higher quality score wins. This
 * means retrying can only improve the stored badge, never degrade it.
 */
export function recordInvestigationResult(
  id: string,
  result: InvestigationResult,
): void {
  const map = readMap();
  const prev = map[id];
  const next = prev ? bestOf(prev, result) : result;
  map[id] = next;
  writeMap(map);
}

function bestOf(
  a: InvestigationResult,
  b: InvestigationResult,
): InvestigationResult {
  if (a.correctCall !== b.correctCall) return a.correctCall ? a : b;
  return b.quality > a.quality ? b : a;
}
