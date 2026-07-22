import {
  ArrowLeftIcon as ArrowLeft,
  WarningIcon as Warning,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  DifficultyBadge,
  SeverityBadge,
  SourcePlatformBadge,
} from "@/components/investigation/badges";
import { InvestigationFlow } from "@/components/investigation/investigation-flow";
import type { Investigation } from "@/components/investigation/types";

/**
 * The chrome every Investigation sits in: a breadcrumb back to the queue, the
 * title with its source-platform, severity, and difficulty badges (no provider
 * lens badge, since triage is not a lens), the anchored event metadata, the
 * training-simulation disclaimer (ADR-0005), and then the phase engine.
 */
export function InvestigationShell({
  investigation,
}: {
  investigation: Investigation;
}) {
  const meta = [
    investigation.eventType,
    investigation.detectionSource,
    investigation.mitre,
  ].filter(Boolean);

  return (
    <article className="max-w-[1200px] px-[44px] pt-[40px] motion-safe:animate-[fadeUp_0.4s_ease_both] max-[760px]:px-[20px] max-[760px]:pt-[28px]">
      <div className="flex items-center gap-[8px] font-mono text-[12.5px] text-ink-muted">
        <Link href="/investigations" className="text-teal-ink">
          Investigations
        </Link>
        <span>/</span>
        <span className="text-body">{investigation.title}</span>
      </div>

      <div className="mt-[14px] flex flex-wrap items-center gap-[7px]">
        <SourcePlatformBadge platform={investigation.sourcePlatform} />
        <SeverityBadge severity={investigation.severity} />
        <DifficultyBadge difficulty={investigation.difficulty} />
      </div>

      <h1 className="mt-[12px] text-[38px] font-extrabold tracking-[-0.03em] text-ink max-[520px]:text-[28px]">
        {investigation.title}
      </h1>

      <p className="mt-[10px] font-mono text-[12.5px] text-ink-muted">
        {meta.join("  ·  ")}
      </p>

      <p className="mt-[16px] max-w-[72ch] text-pretty text-[17px] leading-[1.6] text-body">
        {investigation.short}
      </p>

      <div className="mt-[20px] flex items-start gap-[9px] rounded-[12px] border border-line bg-surface-muted px-[14px] py-[10px] text-[12.5px] leading-[1.5] text-ink-muted">
        <Warning
          size={16}
          weight="bold"
          aria-hidden
          className="mt-[1px] shrink-0 text-faint"
        />
        <span>
          Training simulation. All organizations, names, addresses, and
          indicators in this exercise are fictional.
        </span>
      </div>

      <InvestigationFlow investigation={investigation} />

      <div className="mt-[44px] flex gap-[12px] border-t border-line pt-[24px]">
        <Link
          href="/investigations"
          className="inline-flex items-center gap-[6px] text-[14px] text-teal-ink"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden />
          All investigations
        </Link>
      </div>
    </article>
  );
}
