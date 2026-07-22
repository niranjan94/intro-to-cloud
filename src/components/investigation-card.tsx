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
 * A single alert in the queue: rule name, title, and one-line summary with its
 * severity and difficulty badges. The completion badge is read from localStorage
 * after mount (SSR cannot see it), so the card renders identically on the server
 * and hydrates the learner's best result in without a mismatch.
 */
export function InvestigationCard({
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
      className="flex flex-col rounded-[16px] border border-line bg-surface p-[20px] shadow-[0_1px_2px_oklch(0.4_0.02_230_/_0.03)] transition-all hover:-translate-y-[2px] hover:border-[oklch(0.78_0.06_195)] hover:shadow-[0_10px_26px_-16px_oklch(0.4_0.06_195_/_0.5)]"
    >
      <span className="flex flex-wrap items-center gap-[7px]">
        <SeverityBadge severity={investigation.severity} />
        <DifficultyBadge difficulty={investigation.difficulty} />
        {result ? <ResultBadge result={result} /> : null}
      </span>
      <span className="mt-[12px] font-mono text-[11px] uppercase tracking-[0.05em] text-teal">
        {investigation.eventType}
      </span>
      <span className="mt-[4px] text-[16px] font-semibold tracking-[-0.01em] text-ink-soft">
        {investigation.title}
      </span>
      <span className="mt-[8px] text-pretty text-[13px] leading-[1.5] text-ink-muted">
        {investigation.short}
      </span>
    </Link>
  );
}

function ResultBadge({ result }: { result: InvestigationResult }) {
  if (result.correctCall) {
    return (
      <span className="ml-auto inline-flex items-center gap-[5px] font-mono text-[11px] text-[oklch(0.44_0.1_150)]">
        <CheckCircle size={14} weight="fill" aria-hidden />
        Solved · {result.quality}%
      </span>
    );
  }
  return (
    <span className="ml-auto inline-flex items-center gap-[5px] font-mono text-[11px] text-[oklch(0.5_0.16_25)]">
      <WarningCircle size={14} weight="fill" aria-hidden />
      Retry
    </span>
  );
}
