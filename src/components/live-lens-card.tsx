"use client";

import { useProvider } from "@/components/provider-context";
import { getConcept } from "@/content/registry";
import {
  PROVIDER_BRAND,
  PROVIDER_LABELS,
  PROVIDERS,
  type Provider,
} from "@/content/types";
import { cn } from "@/lib/utils";

/** What each provider names the object-storage container (home demo only). */
const OBJECT_STORAGE_UNIT: Record<Provider, string> = {
  aws: "bucket",
  azure: "container",
};

const objectStorage = getConcept("object-storage");

/**
 * The home page's live proof of the thesis: one fixed concept (Object Storage)
 * with the current and other provider's service names shown side by side. The
 * in-card flip control switches the active lens and the whole card re-labels,
 * while the concept itself stays put.
 */
export function LiveLensCard() {
  const { provider, setProvider } = useProvider();
  const other: Provider = provider === "aws" ? "azure" : "aws";

  const service = objectStorage?.services[provider] ?? "";
  const otherService = objectStorage?.services[other] ?? "";
  const unit = OBJECT_STORAGE_UNIT[provider];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -top-[18px] right-0 h-[120px] w-[120px] rounded-full bg-[oklch(0.62_0.1_195_/_0.1)] blur-[6px] motion-safe:animate-[lensPulse_6s_ease-in-out_infinite]"
      />
      <div className="relative rounded-[22px] border border-[oklch(0.9_0.01_220)] bg-surface p-[28px] shadow-[0_24px_60px_-30px_oklch(0.4_0.05_195_/_0.4)] motion-safe:animate-[fadeUp_0.6s_0.1s_ease_both]">
        <div className="flex items-center justify-between gap-[12px]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
              Concept
            </div>
            <div className="mt-[2px] text-[20px] font-bold tracking-[-0.02em] text-ink-soft">
              Object Storage
            </div>
          </div>
          <span className="rounded-[8px] bg-teal-tint px-[9px] py-[5px] font-mono text-[11px] text-teal">
            stays fixed
          </span>
        </div>

        <div className="my-[22px] mb-[6px] flex items-stretch gap-[14px]">
          {/* Active lens */}
          <div className="flex-1 rounded-[16px] border border-teal-line bg-teal-tint p-[20px_12px] text-center">
            <div className="mx-auto mb-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[oklch(0.94_0.03_195)]">
              <span className="h-[16px] w-[16px] rounded-full bg-[oklch(0.56_0.075_195)]" />
            </div>
            <div className="font-mono text-[11px] text-muted">
              {PROVIDER_LABELS[provider]} calls it
            </div>
            <div className="mt-[4px] font-mono text-[16px] font-semibold text-ink-soft">
              {service}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-[oklch(0.6_0.08_195)]">
            <span className="text-[22px]">⇄</span>
          </div>

          {/* Other lens */}
          <div className="flex-1 rounded-[16px] border border-dashed border-line bg-[oklch(0.975_0.006_220)] p-[20px_12px] text-center opacity-75">
            <div className="mx-auto mb-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[oklch(0.95_0.006_220)]">
              <span className="h-[16px] w-[16px] rounded-full bg-[oklch(0.7_0.015_230)]" />
            </div>
            <div className="font-mono text-[11px] text-faint">
              {PROVIDER_LABELS[other]} calls it
            </div>
            <div className="mt-[4px] font-mono text-[16px] font-semibold text-muted">
              {otherService}
            </div>
          </div>
        </div>

        <p className="my-[16px] mb-[18px] text-center text-[13.5px] leading-[1.5] text-muted">
          Files live in a{" "}
          <strong className="font-semibold text-ink-strong">{unit}</strong> —
          same concept, different label.
        </p>

        <div className="flex gap-[8px] rounded-[12px] bg-surface-muted p-[6px]">
          {PROVIDERS.map((id) => {
            const active = id === provider;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setProvider(id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex flex-1 items-center justify-center rounded-[9px] p-[11px] text-[14px] font-semibold transition-colors",
                  active
                    ? "bg-surface text-ink-soft shadow-[0_1px_3px_oklch(0.4_0.03_230_/_0.16)]"
                    : "bg-transparent text-muted hover:text-ink-soft",
                )}
              >
                <span
                  aria-hidden
                  className="mr-[7px] inline-block h-[8px] w-[8px] rounded-full"
                  style={{
                    background: active
                      ? PROVIDER_BRAND[id]
                      : "oklch(0.8 0.01 230)",
                  }}
                />
                {PROVIDER_LABELS[id]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
