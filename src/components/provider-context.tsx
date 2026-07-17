"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Provider } from "@/content/types";
import {
  buildProviderSwitchUrl,
  DEFAULT_PROVIDER,
  getStoredProvider,
  isProvider,
  setStoredProvider,
} from "@/lib/provider";

interface ProviderContextValue {
  /** The provider whose lens is currently active. */
  provider: Provider;
  /** Switch the active lens. Navigates in place on provider-scoped routes. */
  setProvider: (next: Provider) => void;
}

const ProviderContext = createContext<ProviderContextValue | null>(null);

/** The provider named in the leading path segment, if the route is scoped. */
function providerFromPath(pathname: string): Provider | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && isProvider(first) ? first : null;
}

/**
 * Holds the active provider lens. On provider-scoped routes the URL segment is
 * authoritative; elsewhere (the home page) the last-used preference from
 * localStorage drives it. Switching persists the choice and, when on a scoped
 * route, navigates to the sibling URL so the lesson swaps in place.
 */
export function ProviderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const urlProvider = providerFromPath(pathname);
  const [stored, setStored] = useState<Provider>(DEFAULT_PROVIDER);

  // Adopt the persisted preference after mount (SSR can't read localStorage).
  useEffect(() => {
    setStored(getStoredProvider());
  }, []);

  const provider = urlProvider ?? stored;

  const setProvider = useCallback(
    (next: Provider) => {
      setStoredProvider(next);
      setStored(next);
      if (urlProvider) {
        router.push(buildProviderSwitchUrl(pathname, next));
      }
    },
    [urlProvider, pathname, router],
  );

  const value = useMemo(
    () => ({ provider, setProvider }),
    [provider, setProvider],
  );

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
}

/** Read the active provider lens and a setter that respects the current route. */
export function useProvider(): ProviderContextValue {
  const ctx = useContext(ProviderContext);
  if (!ctx) {
    throw new Error("useProvider must be used within a ProviderProvider");
  }
  return ctx;
}
