"use client";

import { Cloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PROVIDER_LABELS, PROVIDERS, type Provider } from "@/content/types";
import { getStoredProvider, setStoredProvider } from "@/lib/provider";
import { cn } from "@/lib/utils";

/**
 * Landing chooser: pick a provider to start. The last-used provider (restored
 * from localStorage after mount) is marked so a reload lands the learner back
 * where they were. Muted/logo-led per ADR-0002.
 */
export function ProviderChooser() {
  const router = useRouter();
  const [stored, setStored] = useState<Provider | null>(null);
  useEffect(() => {
    setStored(getStoredProvider());
  }, []);

  function choose(provider: Provider) {
    setStoredProvider(provider);
    router.push(`/${provider}`);
  }

  return (
    <div className="flex flex-col gap-12 sm:flex-row">
      {PROVIDERS.map((provider) => {
        const isLast = stored === provider;
        return (
          <button
            key={provider}
            type="button"
            onClick={() => choose(provider)}
            className={cn(
              "flex flex-1 items-center gap-12 rounded-cards border p-24 text-left transition-colors",
              isLast
                ? "border-ink-black bg-accent"
                : "border-stone-border bg-paper-white hover:bg-bone",
            )}
          >
            <Cloud aria-hidden="true" className="size-24 text-slate-gray" />
            <span className="flex flex-col">
              <span className="text-subheading font-medium text-ink-black">
                {PROVIDER_LABELS[provider]}
              </span>
              <span className="text-caption text-slate-gray">
                {isLast
                  ? "Continue where you left off"
                  : "View concepts this way"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
