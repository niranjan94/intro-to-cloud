"use client";

import { Cloud } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PROVIDER_LABELS, PROVIDERS, type Provider } from "@/content/types";
import {
  buildProviderSwitchUrl,
  getStoredProvider,
  isProvider,
  setStoredProvider,
} from "@/lib/provider";
import { cn } from "@/lib/utils";

/** Provider from the leading URL segment, if any. */
function providerFromPath(pathname: string): Provider | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && isProvider(first) ? first : null;
}

/**
 * AWS/Azure toggle. Muted and logo/label-led per ADR-0002 (no saturated brand
 * colors); the active provider is marked with a subtle pale-sage accent. Writes
 * the choice to localStorage and navigates while preserving the concept.
 */
export function ProviderSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const pathProvider = providerFromPath(pathname);

  // On provider-scoped routes the path is authoritative; elsewhere (e.g. home)
  // fall back to the stored preference, resolved after mount to avoid a
  // hydration mismatch.
  const [active, setActive] = useState<Provider | null>(pathProvider);
  useEffect(() => {
    setActive(pathProvider ?? getStoredProvider());
  }, [pathProvider]);

  function choose(provider: Provider) {
    setStoredProvider(provider);
    setActive(provider);
    router.push(buildProviderSwitchUrl(pathname, provider));
  }

  return (
    <fieldset
      aria-label="Choose cloud provider"
      className="inline-flex items-center gap-4 rounded-pills border border-border p-4"
    >
      {PROVIDERS.map((provider) => {
        const isActive = active === provider;
        return (
          <button
            key={provider}
            type="button"
            aria-pressed={isActive}
            onClick={() => choose(provider)}
            className={cn(
              "inline-flex items-center gap-6 rounded-pills px-12 py-6 text-caption font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-slate-gray hover:text-ink-black",
            )}
          >
            <Cloud aria-hidden="true" className="size-16" />
            {PROVIDER_LABELS[provider]}
          </button>
        );
      })}
    </fieldset>
  );
}
