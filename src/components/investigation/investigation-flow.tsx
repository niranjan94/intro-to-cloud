"use client";

import {
  CaretLeftIcon as CaretLeft,
  CaretRightIcon as CaretRight,
  CheckIcon as Check,
} from "@phosphor-icons/react/dist/ssr";
import { type ReactNode, useState } from "react";
import { EvidencePhase } from "@/components/investigation/phases/evidence";
import { ExtractPhase } from "@/components/investigation/phases/extract";
import { IdentifyPhase } from "@/components/investigation/phases/identify";
import { JustifyPhase } from "@/components/investigation/phases/justify";
import { VerdictPhase } from "@/components/investigation/phases/verdict";
import type {
  Disposition,
  Investigation,
} from "@/components/investigation/types";
import { cn } from "@/lib/utils";

type PhaseKind = "evidence" | "identify" | "justify" | "extract" | "verdict";

interface PhaseFraming {
  kind: PhaseKind;
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/**
 * The five phases every Investigation runs, in fixed order. The framing is
 * uniform across alerts (the flow is the same; only the data differs), so it
 * lives here rather than in each data module.
 */
const PHASES: readonly PhaseFraming[] = [
  {
    kind: "evidence",
    navLabel: "Evidence",
    kicker: "Phase 1",
    title: "Read the alert",
    intro:
      "Work through the raw signal exactly as it landed in the queue. Note what stands out before you commit to anything.",
  },
  {
    kind: "identify",
    navLabel: "Identify",
    kicker: "Phase 2",
    title: "Flag the suspicious aspects",
    intro:
      "Pick out what actually looks like a signal. The list mixes genuine indicators with normal activity meant to distract.",
  },
  {
    kind: "justify",
    navLabel: "Justify",
    kicker: "Phase 3",
    title: "Say why it matters",
    intro:
      "For each real signal, choose the reasoning that explains the risk. Getting the why right is what separates triage from guessing.",
  },
  {
    kind: "extract",
    navLabel: "Extract",
    kicker: "Phase 4",
    title: "Pull the indicators",
    intro:
      "Record the indicators of compromise a responder would pivot on. Formatting is forgiving; the value is what counts.",
  },
  {
    kind: "verdict",
    navLabel: "Verdict",
    kicker: "Phase 5",
    title: "Make the call",
    intro:
      "Escalate, route for remediation, or close. This is the decision the whole triage exists to support.",
  },
];

/**
 * The Investigation engine: a tabbed five-phase flow (Evidence, Identify,
 * Justify, Extract, Verdict) that renders and grades any Investigation from its
 * data. It mirrors the project chapter shell (numbered tab strip, faded body,
 * Back/Next footer) but holds the cross-phase answer state that grading needs,
 * dispatching each phase body by its stable `kind`, never by index. This is the
 * client boundary; it receives a fully serializable Investigation as a prop.
 */
export function InvestigationFlow({
  investigation,
}: {
  investigation: Investigation;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [justify, setJustify] = useState<Record<string, number>>({});
  const [extract, setExtract] = useState<Record<string, string>>({});
  const [disposition, setDisposition] = useState<Disposition | null>(null);

  const phase = PHASES[current];
  const last = PHASES.length - 1;

  const toggleAspect = (id: string, value: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });

  const body = (): ReactNode => {
    switch (phase.kind) {
      case "evidence":
        return <EvidencePhase evidence={investigation.evidence} />;
      case "identify":
        return (
          <IdentifyPhase
            aspects={investigation.aspects}
            difficulty={investigation.difficulty}
            selected={selected}
            onToggle={toggleAspect}
          />
        );
      case "justify":
        return (
          <JustifyPhase
            aspects={investigation.aspects}
            selected={selected}
            answers={justify}
            onAnswer={(id, choice) =>
              setJustify((prev) => ({ ...prev, [id]: choice }))
            }
          />
        );
      case "extract":
        return (
          <ExtractPhase
            fields={investigation.extract}
            values={extract}
            onChange={(id, value) =>
              setExtract((prev) => ({ ...prev, [id]: value }))
            }
          />
        );
      case "verdict":
        return (
          <VerdictPhase
            investigation={investigation}
            selected={selected}
            justify={justify}
            extract={extract}
            disposition={disposition}
            onChoose={setDisposition}
          />
        );
    }
  };

  return (
    <section className="mt-[30px]">
      <nav
        aria-label="Investigation phases"
        className="flex gap-[2px] overflow-x-auto border-y border-line"
      >
        {PHASES.map((c, i) => (
          <button
            key={c.kind}
            type="button"
            onClick={() => setCurrent(i)}
            aria-current={i === current}
            className={cn(
              "flex-none whitespace-nowrap border-b-2 px-[13px] py-[11px] font-mono text-[12.5px] transition-colors",
              i === current
                ? "border-teal-ring text-ink-strong"
                : "border-transparent text-ink-muted hover:text-body",
            )}
          >
            <span
              className={cn(
                "mr-[7px] font-bold",
                i === current ? "text-teal" : "text-line",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {c.navLabel}
          </button>
        ))}
      </nav>

      <div
        key={current}
        className="mt-[26px] motion-safe:animate-[fadeUp_0.35s_ease_both]"
      >
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-teal">
          {phase.kicker}
        </p>
        <h2 className="mt-[6px] text-[26px] font-extrabold tracking-[-0.02em] text-ink max-[520px]:text-[22px]">
          {phase.title}
        </h2>
        <p className="mt-[10px] max-w-[62ch] text-pretty text-[15px] leading-[1.6] text-body">
          {phase.intro}
        </p>
        {body()}
      </div>

      <div className="mt-[34px] flex items-center justify-between border-t border-line pt-[20px]">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          className={cn(
            "inline-flex items-center gap-[6px] rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted",
            current === 0 && "invisible",
          )}
        >
          <CaretLeft size={14} weight="bold" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.min(last, c + 1))}
          disabled={current === last}
          className="inline-flex items-center gap-[6px] rounded-button bg-primary px-[16px] py-[8px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {current === last ? (
            <>
              Done
              <Check size={14} weight="bold" aria-hidden />
            </>
          ) : (
            <>
              Next
              <CaretRight size={14} weight="bold" aria-hidden />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
