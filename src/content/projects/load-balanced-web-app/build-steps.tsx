"use client";

import {
  ArrowRightIcon as ArrowRight,
  CaretDownIcon as CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";
import { getConcept } from "@/content/registry";
import type { Provider } from "@/content/types";
import { cn } from "@/lib/utils";
import type { BuildStep } from "./data";

function StepRow({
  step,
  index,
  provider,
  open,
  onToggle,
}: {
  step: BuildStep;
  index: number;
  provider: Provider;
  open: boolean;
  onToggle: () => void;
}) {
  const concept = step.concept ? getConcept(step.concept) : undefined;

  return (
    <div className="rounded-[14px] border border-line bg-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-[12px] px-[16px] py-[13px] text-left"
      >
        <span
          className={cn(
            "flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-mono text-[12px] font-bold",
            open ? "bg-teal-ring text-white" : "bg-teal-tint text-teal-ink",
          )}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 text-[14.5px] font-semibold text-ink-strong">
          {step.label}
        </span>
        <CaretDown
          size={16}
          weight="bold"
          aria-hidden
          className={cn(
            "flex-none text-ink-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-line px-[16px] py-[14px] pl-[54px]">
          <p className="max-w-[64ch] text-pretty text-[13.5px] leading-[1.6] text-body">
            {step.detail}
          </p>
          {step.cli ? (
            <div className="mt-[10px] overflow-x-auto rounded-[8px] bg-panel-deep px-[12px] py-[8px] font-mono text-[12px] text-[oklch(0.88_0.02_195)]">
              {step.cli}
            </div>
          ) : null}
          {concept ? (
            <Link
              href={`/${provider}/${concept.id}`}
              className="mt-[12px] inline-flex items-center gap-[6px] font-mono text-[12px] text-teal-ink"
            >
              Uses the {concept.title} concept
              <ArrowRight size={13} weight="bold" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Chapter 2: the build as an ordered, dependency-first checklist. Each step
 * expands to its detail, an optional example command, and a link back to the
 * concept lesson it draws on, so the project reinforces the concepts rather
 * than restating them.
 */
export function BuildSteps({
  steps,
  provider,
}: {
  steps: BuildStep[];
  provider: Provider;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-[20px] flex flex-col gap-[10px]">
      {steps.map((step, i) => (
        <StepRow
          key={step.label}
          step={step}
          index={i}
          provider={provider}
          open={open === i}
          onToggle={() => setOpen((cur) => (cur === i ? null : i))}
        />
      ))}
    </div>
  );
}
