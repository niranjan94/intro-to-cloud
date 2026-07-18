import { ArrowsLeftRightIcon as ArrowsLeftRight } from "@phosphor-icons/react/dist/ssr";
import {
  PROVIDER_BRAND,
  PROVIDER_LABELS,
  type Provider,
} from "@/content/types";
import { cn } from "@/lib/utils";

function StackBox({
  provider,
  services,
  active,
}: {
  provider: Provider;
  services: string[];
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
      <ul className="mt-[10px] flex flex-col gap-[8px]">
        {services.map((service, i) => (
          <li key={service} className="flex items-center gap-[9px]">
            <span className="font-mono text-[11px] text-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[14px] font-semibold text-ink-soft">
              {service}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The project counterpart to the concept EquivalencePanel: the same build shown
 * as each provider's concrete stack, side by side, with the active lens lifted
 * and the other dimmed. An optional "same idea" line names the shared shape.
 */
export function StackPanel({
  provider,
  aws,
  azure,
  elevator,
}: {
  provider: Provider;
  aws: string[];
  azure: string[];
  elevator?: string;
}) {
  return (
    <section className="mt-[34px] rounded-[20px] border border-teal-line bg-[linear-gradient(180deg,oklch(0.975_0.014_195),#fff)] p-[24px]">
      <div className="text-center font-mono text-[11px] uppercase tracking-[0.08em] text-teal">
        The same build, two stacks
      </div>
      <div className="mt-[16px] grid grid-cols-1 items-center gap-[16px] min-[560px]:grid-cols-[1fr_auto_1fr]">
        <StackBox provider="aws" services={aws} active={provider === "aws"} />
        <div className="flex flex-col items-center text-[oklch(0.55_0.08_195)]">
          <ArrowsLeftRight size={24} weight="bold" aria-hidden />
        </div>
        <StackBox
          provider="azure"
          services={azure}
          active={provider === "azure"}
        />
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
