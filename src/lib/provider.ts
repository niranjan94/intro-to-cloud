import { PROVIDERS, type Provider } from "@/content/types";

/** Default provider when the learner has no stored preference. */
export const DEFAULT_PROVIDER: Provider = "aws";

const STORAGE_KEY = "intro-to-cloud:last-provider";

/** Type guard: is an arbitrary string one of our supported providers? */
export function isProvider(value: string): value is Provider {
  return (PROVIDERS as readonly string[]).includes(value);
}

/** Read the last-used provider from localStorage (falls back to the default). */
export function getStoredProvider(): Provider {
  if (typeof window === "undefined") return DEFAULT_PROVIDER;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isProvider(stored) ? stored : DEFAULT_PROVIDER;
}

/** Mirror the chosen provider to localStorage. */
export function setStoredProvider(provider: Provider): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, provider);
}

/**
 * Build the sibling URL when switching provider: keep the rest of the path
 * (the concept), swap only the leading provider segment.
 *
 * Slice-1 assumption: the stub concept supports both providers, so there is no
 * unsupported-fallback path yet (a later concern once concepts diverge).
 */
export function buildProviderSwitchUrl(
  pathname: string,
  target: Provider,
): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isProvider(segments[0])) {
    segments[0] = target;
    return `/${segments.join("/")}`;
  }
  // Not on a provider-scoped path (e.g. home) — go to the provider overview.
  return `/${target}`;
}
