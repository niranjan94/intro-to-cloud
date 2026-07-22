"use client";

import {
  CheckCircleIcon as CheckCircle,
  WarningCircleIcon as WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DifficultyBadge,
  SeverityBadge,
} from "@/components/investigation/badges";
import type { InvestigationResult } from "@/components/investigation/types";
import type { InvestigationQueueItem } from "@/content/investigations";
import { getInvestigationResult } from "@/lib/investigations";

/**
 * One alert as a dense queue row: severity, title, a one-line summary that fills
 * the available width and truncates, the event-type rule name on wider screens,
 * difficulty, and a result slot. Rows are compact by design so a long queue stays
 * scannable. The completion result is read from localStorage after mount (SSR
 * cannot see it), so the row renders identically on the server and hydrates the
 * learner's best result in without a mismatch.
 */
export function InvestigationRow({
  investigation,
}: {
  investigation: InvestigationQueueItem;
}) {
  const [result, setResult] = useState<InvestigationResult | null>(null);

  useEffect(() => {
    setResult(getInvestigationResult(investigation.id) ?? null);
  }, [investigation.id]);

  return (
    <Link
      href={`/investigations/${investigation.id}`}
      className="flex items-center gap-[12px] border-b border-line px-[16px] py-[11px] transition-colors last:border-b-0 hover:bg-[oklch(0.96_0.012_195)] max-[560px]:flex-wrap max-[560px]:gap-y-[7px]"
    >
      <SeverityBadge severity={investigation.severity} />
      <span className="flex min-w-0 flex-1 items-baseline gap-[8px] max-[560px]:order-last max-[560px]:w-full max-[560px]:flex-none max-[560px]:basis-full">
        <span className="shrink-0 truncate text-[14px] font-medium text-ink-soft">
          {investigation.title}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-muted max-[560px]:hidden">
          {investigation.short}
        </span>
      </span>
      <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-faint min-[1024px]:block">
        {investigation.eventType}
      </span>
      <DifficultyBadge difficulty={investigation.difficulty} />
      <span className="flex w-[74px] shrink-0 justify-end">
        {result ? <RowStatus result={result} /> : null}
      </span>
    </Link>
  );
}

function RowStatus({ result }: { result: InvestigationResult }) {
  if (result.correctCall) {
    return (
      <span className="inline-flex items-center gap-[4px] font-mono text-[11px] text-[oklch(0.44_0.1_150)]">
        <CheckCircle size={13} weight="fill" aria-hidden />
        {result.quality}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[4px] font-mono text-[11px] text-[oklch(0.5_0.16_25)]">
      <WarningCircle size={13} weight="fill" aria-hidden />
      Retry
    </span>
  );
}
