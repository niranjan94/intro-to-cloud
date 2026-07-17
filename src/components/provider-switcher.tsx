"use client";

import { useProvider } from "@/components/provider-context";
import { ProviderLogo } from "@/components/provider-logo";
import { PROVIDER_LABELS, PROVIDERS } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The global lens switcher: a segmented control of provider chips, each showing
 * the real vendor wordmark. The active provider's logo is full-color and lifts
 * onto a white surface; inactive logos are desaturated. Switching is delegated
 * to the provider context (navigates in place on lesson routes, updates state
 * on home).
 */
export function ProviderSwitcher() {
  const { provider, setProvider } = useProvider();

  return (
    <fieldset
      aria-label="Choose a provider lens"
      className="flex items-center gap-[4px] rounded-[12px] border border-line bg-surface-muted p-[4px]"
    >
      {PROVIDERS.map((id) => {
        const active = id === provider;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setProvider(id)}
            aria-pressed={active}
            aria-label={`View through the ${PROVIDER_LABELS[id]} lens`}
            className={cn(
              "inline-flex items-center rounded-[9px] px-[13px] py-[8px] transition-all",
              active
                ? "bg-surface shadow-[0_1px_3px_oklch(0.4_0.03_230_/_0.14)]"
                : "bg-transparent hover:bg-surface/60",
            )}
          >
            <ProviderLogo
              provider={id}
              className={cn(
                "h-[16px] w-auto transition-all",
                active ? "opacity-100 grayscale-0" : "opacity-55 grayscale",
              )}
            />
          </button>
        );
      })}
    </fieldset>
  );
}
