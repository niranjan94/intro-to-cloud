import { ArrowsLeftRightIcon as ArrowsLeftRight } from "@phosphor-icons/react/dist/ssr";

import {
  PROVIDER_BRAND,
  PROVIDER_LABELS,
  type Provider,
} from "@/content/types";
import { cn } from "@/lib/utils";

interface LensFacts {
  service: string;
  /** The provider's resource/namespace identifier (e.g. "s3"). Optional. */
  code?: string;
}

function LensBox({
  provider,
  facts,
  active,
}: {
  provider: Provider;
  facts: LensFacts;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border p-[16px]",
        active
          ? "border-[oklch(0.85_0.04_195)] bg-surface opacity-100 shadow-[0_6px_20px_-12px_oklch(0.4_0.05_195_/_0.4)]"
          : "border-line bg-[oklch(0.975_0.006_220)] opacity-[0.72]",
      )}
    >
      <div className="flex items-center gap-[8px]">
        <span
          aria-hidden
          className="h-[9px] w-[9px] rounded-full"
          style={{ background: PROVIDER_BRAND[provider] }}
        />
        <span className="text-[12px] font-semibold text-body">
          {PROVIDER_LABELS[provider]}
        </span>
      </div>
      <div className="mt-[8px] font-mono text-[17px] font-semibold text-ink-soft">
        {facts.service}
      </div>
      {facts.code ? (
        <div className="mt-[4px] font-mono text-[11.5px] text-ink-muted">
          {facts.code}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The heart of every lesson: the same concept shown through both provider
 * lenses side by side, with the active one lifted and the other dimmed. An
 * optional "same idea" elevator line names the shared concept in plain words.
 */
export function EquivalencePanel({
  provider,
  aws,
  azure,
  elevator,
}: {
  provider: Provider;
  aws: LensFacts;
  azure: LensFacts;
  elevator?: string;
}) {
  return (
    <section className="mt-[34px] rounded-[20px] border border-teal-line bg-[linear-gradient(180deg,oklch(0.975_0.014_195),#fff)] p-[24px]">
      <div className="text-center font-mono text-[11px] uppercase tracking-[0.08em] text-teal">
        The same concept, two lenses
      </div>
      <div className="mt-[16px] grid grid-cols-1 items-center gap-[16px] min-[560px]:grid-cols-[1fr_auto_1fr]">
        <LensBox provider="aws" facts={aws} active={provider === "aws"} />
        <div className="flex flex-col items-center text-[oklch(0.55_0.08_195)]">
          <ArrowsLeftRight size={24} weight="bold" aria-hidden />
        </div>
        <LensBox provider="azure" facts={azure} active={provider === "azure"} />
      </div>
      {elevator ? (
        <p className="mt-[16px] text-center text-[13.5px] text-ink-muted">
          Same idea:{" "}
          <strong className="font-semibold text-ink-strong">{elevator}</strong>
        </p>
      ) : null}
    </section>
  );
}
