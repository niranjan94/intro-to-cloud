"use client";

import {
  ArrowClockwiseIcon as ArrowClockwise,
  CheckCircleIcon as CheckCircle,
  CircleNotchIcon as CircleNotch,
  SealCheckIcon as SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/lesson/anim";
import { cn } from "@/lib/utils";
import type { ValidationContent } from "./data";
import { TONE } from "./tones";

type Phase = "pending" | "checking" | "issued";

const STEPS = [
  { key: "request", label: "Request", actor: "You ask for a certificate" },
  {
    key: "publish",
    label: "Publish record",
    actor: "You prove domain control",
  },
  { key: "issued", label: "Issued", actor: "The CA signs the certificate" },
] as const;

/** Which step index is "active" for a given phase. */
const ACTIVE_STEP: Record<Phase, number> = {
  pending: 1,
  checking: 1,
  issued: 2,
};

/**
 * Chapter 2: proving domain control. The certificate sits in a pending state
 * until the learner publishes the validation record the authority asked for;
 * once published, the CA checks it and issues. The point is that publishing the
 * record is the whole gate, and that a permanent record is what later lets
 * renewal happen without a human.
 */
export function ValidationFlow({ content }: { content: ValidationContent }) {
  const [phase, setPhase] = useState<Phase>("pending");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const publish = () => {
    if (phase !== "pending") return;
    setPhase("checking");
    const delay = prefersReducedMotion() ? 0 : 1100;
    timer.current = window.setTimeout(() => setPhase("issued"), delay);
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setPhase("pending");
  };

  const activeStep = ACTIVE_STEP[phase];

  return (
    <div className="mt-[16px]">
      <ol className="flex items-stretch gap-[6px]">
        {STEPS.map((step, i) => {
          const done = i < activeStep || phase === "issued";
          const active = i === activeStep && phase !== "issued";
          return (
            <li key={step.key} className="flex-1">
              <div
                className={cn(
                  "h-full rounded-[12px] border-[1.5px] p-[12px] transition-colors",
                  done
                    ? cn(TONE.secure.frame)
                    : active
                      ? cn(TONE.pending.frame)
                      : "border-line bg-surface",
                )}
              >
                <div className="flex items-center gap-[7px]">
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full font-mono text-[10.5px] font-bold",
                      done
                        ? TONE.secure.chip
                        : active
                          ? TONE.pending.chip
                          : "bg-surface-muted text-ink-muted",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className="font-mono text-[12px] font-semibold text-ink-strong">
                    {step.label}
                  </span>
                </div>
                <p className="mt-[6px] text-[12px] leading-[1.45] text-body-soft">
                  {step.actor}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-[16px] rounded-[18px] border border-line bg-surface p-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <div className="font-mono text-[12px] text-ink-muted">
            Certificate for{" "}
            <span className="font-semibold text-ink-strong">
              {content.domain}
            </span>
          </div>
          <StatusBadge phase={phase} />
        </div>

        <p className="mt-[12px] font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          {content.method} · publish this record
        </p>
        <div className="mt-[8px] overflow-x-auto rounded-[12px] border border-line bg-panel-deep p-[14px]">
          <table className="w-full border-collapse font-mono text-[12.5px] text-[oklch(0.88_0.02_195)]">
            <tbody>
              <RecordRow label="Type" value={content.record.type} />
              <RecordRow label="Name" value={content.record.name} />
              <RecordRow label="Value" value={content.record.value} />
            </tbody>
          </table>
        </div>
        <p className="mt-[10px] text-[12.5px] leading-[1.55] text-body-soft">
          {content.methodNote}
        </p>

        <div className="mt-[14px] flex flex-wrap items-center gap-[10px]">
          <button
            type="button"
            onClick={publish}
            disabled={phase !== "pending"}
            className="inline-flex items-center gap-[7px] rounded-button bg-primary px-[15px] py-[8px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-45"
          >
            <SealCheck size={15} weight="bold" aria-hidden />
            Publish record to DNS
          </button>
          {phase !== "pending" ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-[6px] rounded-button border border-line bg-surface px-[13px] py-[8px] font-mono text-[12px] text-ink-soft transition-colors hover:border-ink-muted"
            >
              <ArrowClockwise size={13} weight="bold" aria-hidden />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {phase === "issued" ? (
        <div
          className={cn(
            "mt-[14px] flex gap-[11px] rounded-[14px] border-[1.5px] p-[15px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            TONE.secure.frame,
          )}
        >
          <span
            aria-hidden
            className={cn("mt-[1px] flex-none", TONE.secure.text)}
          >
            <ArrowClockwise size={18} weight="bold" />
          </span>
          <div>
            <p className={cn("text-[14px] font-semibold", TONE.secure.text)}>
              Issued, and it will renew itself
            </p>
            <p className="mt-[4px] text-pretty text-[13.5px] leading-[1.6] text-body">
              {content.renewalInsight}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-[14px] text-pretty text-[13px] leading-[1.6] text-body-soft">
          {content.altMethod}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ phase }: { phase: Phase }) {
  if (phase === "issued") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-[6px] rounded-full border-[1.5px] px-[11px] py-[4px] font-mono text-[11.5px] font-semibold",
          TONE.secure.frame,
          TONE.secure.text,
        )}
      >
        <CheckCircle size={13} weight="fill" aria-hidden />
        Issued
      </span>
    );
  }
  const checking = phase === "checking";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] rounded-full border-[1.5px] px-[11px] py-[4px] font-mono text-[11.5px] font-semibold",
        TONE.pending.frame,
        TONE.pending.text,
      )}
    >
      <CircleNotch
        size={13}
        weight="bold"
        aria-hidden
        className={checking ? "motion-safe:animate-spin" : undefined}
      />
      {checking ? "Checking DNS" : "Pending validation"}
    </span>
  );
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-[2px] pr-[14px] align-top text-[oklch(0.6_0.03_195)]">
        {label}
      </td>
      <td className="break-all py-[2px] align-top">{value}</td>
    </tr>
  );
}
