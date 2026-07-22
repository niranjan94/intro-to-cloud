import { CheckIcon as Check, XIcon as X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo } from "react";
import {
  gradeInvestigation,
  type InvestigationAnswers,
  toResult,
} from "@/components/investigation/grading";
import type { Investigation } from "@/components/investigation/types";
import { recordInvestigationResult } from "@/lib/investigations";
import { cn } from "@/lib/utils";

/**
 * The result of an attempt, shown inline once the learner makes the Verdict
 * call. The headline is the correct/wrong call (the Verdict is the graded
 * outcome); the quality score from Identify, Justify, and Extract is secondary.
 * The best result is persisted after mount so the queue can show a badge.
 */
export function ResultPanel({
  investigation,
  answers,
}: {
  investigation: Investigation;
  answers: InvestigationAnswers;
}) {
  const grade = useMemo(
    () => gradeInvestigation(investigation, answers),
    [investigation, answers],
  );

  useEffect(() => {
    recordInvestigationResult(investigation.id, toResult(grade));
  }, [investigation.id, grade]);

  const correct = grade.correctCall;

  return (
    <div
      aria-live="polite"
      className={cn(
        "mt-[20px] rounded-[16px] border-[1.5px] p-[18px]",
        correct
          ? "border-[oklch(0.72_0.12_150)] bg-[oklch(0.97_0.03_150)]"
          : "border-[oklch(0.72_0.14_25)] bg-[oklch(0.97_0.03_25)]",
      )}
    >
      <div className="flex items-center gap-[8px]">
        <span
          className={cn(
            "inline-flex items-center gap-[7px] text-[17px] font-bold",
            correct
              ? "text-[oklch(0.44_0.1_150)]"
              : "text-[oklch(0.5_0.16_25)]",
          )}
        >
          {correct ? (
            <Check size={18} weight="bold" aria-hidden />
          ) : (
            <X size={18} weight="bold" aria-hidden />
          )}
          {correct ? "Correct call" : "Wrong call"}
        </span>
      </div>

      <p className="mt-[10px] text-[14px] leading-[1.65] text-body">
        {investigation.verdict.why}
      </p>

      <div className="mt-[16px] border-t border-line/60 pt-[14px]">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-ink-muted">
          Triage quality: {grade.quality}%
        </p>
        <dl className="mt-[8px] flex flex-wrap gap-x-[24px] gap-y-[6px] font-mono text-[12px] text-body">
          <ScoreRow
            label="Identify"
            detail={`${grade.identify.hits}/${grade.identify.totalSignals} signals · ${grade.identify.falsePositives} false`}
          />
          {grade.justify.total > 0 ? (
            <ScoreRow
              label="Justify"
              detail={`${grade.justify.correct}/${grade.justify.total} reasoned`}
            />
          ) : null}
          {grade.extract.total > 0 ? (
            <ScoreRow
              label="Extract"
              detail={`${grade.extract.correct}/${grade.extract.total} indicators`}
            />
          ) : null}
        </dl>
      </div>
    </div>
  );
}

function ScoreRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-center gap-[7px]">
      <dt className="text-ink-strong">{label}</dt>
      <dd className="text-ink-muted">{detail}</dd>
    </div>
  );
}
