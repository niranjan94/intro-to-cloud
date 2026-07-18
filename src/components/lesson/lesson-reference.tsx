"use client";

import { useState } from "react";
import { PROVIDER_LABELS, type Provider } from "@/content/types";
import { cn } from "@/lib/utils";

/** How responsibility splits between the learner and the cloud provider. */
export interface ResponsibilitySplit {
  /** What the user provisions, configures, secures, and pays attention to. */
  youManage: string[];
  /** What the provider builds, operates, and keeps running underneath. */
  providerManages: string[];
  /** Settings you can change on the live resource after it is created. */
  mutable: string[];
  /**
   * Settings fixed when the resource is created; changing them means replacing
   * the resource (recreate, or restore into a new one). Grounded in the
   * provider's own documentation.
   */
  immutable: string[];
}

/** One ready-to-paste prompt covering a distinct way to stand the service up. */
export interface AgentScenario {
  /** Short label naming the use case, e.g. "Public + private subnets". */
  label: string;
  /**
   * One or two sentences explaining what this prompt provisions and when a
   * learner would reach for it over the others.
   */
  blurb: string;
  /** The sample prompt a learner can hand to a coding agent. */
  prompt: string;
}

/** Ready-to-paste prompts for a coding agent to stand the service up via CLI. */
export interface AgentSetup {
  /** The CLI binary the agent is expected to drive, e.g. "aws" or "az". */
  cli: string;
  /** One or more scenarios, each a distinct use case the learner can pick from. */
  scenarios: AgentScenario[];
}

/**
 * Chapter metadata for the two reference tabs every lesson appends to its
 * chapter strip: the shared responsibility split, then the hands-on agent
 * setup. Shape matches each concept's `ChapterMeta`, so it concatenates onto
 * `content.chapters` directly. `REFERENCE_CHAPTERS[0]` is the responsibility
 * tab and `[1]` is the setup tab; chapters.tsx renders the matching panel.
 */
export const REFERENCE_CHAPTERS = [
  {
    navLabel: "ownership",
    kicker: "Shared responsibility",
    title: "Who owns what",
    intro:
      "Cloud runs on a shared responsibility model. The provider secures and operates the platform beneath the service; you own how you configure and use it. Here is where that line falls for this service on the active lens.",
  },
  {
    navLabel: "set it up",
    kicker: "Hands on",
    title: "Set it up with an agent",
    intro:
      "Standing this up yourself is a handful of CLI commands. Pick the use case that fits, hand its prompt to a coding agent to provision it from your terminal, and read what it proposes before you let it run anything.",
  },
] as const;

type ColumnTone = "you" | "provider" | "mutable" | "immutable";

const COLUMN_TONES: Record<
  ColumnTone,
  { box: string; label: string; dot: string; marker: string }
> = {
  you: {
    box: "border-teal-line bg-teal-tint",
    label: "text-teal",
    dot: "bg-teal-ring",
    marker: "",
  },
  provider: {
    box: "border-line bg-surface-muted",
    label: "text-ink-muted",
    dot: "bg-line",
    marker: "",
  },
  mutable: {
    box: "border-line bg-surface",
    label: "text-[oklch(0.5_0.12_155)]",
    dot: "bg-[oklch(0.6_0.13_155)]",
    marker: "↻",
  },
  immutable: {
    box: "border-line bg-surface",
    label: "text-[oklch(0.52_0.11_65)]",
    dot: "bg-[oklch(0.64_0.12_65)]",
    marker: "🔒",
  },
};

function Column({
  title,
  tone,
  items,
}: {
  title: string;
  tone: ColumnTone;
  items: string[];
}) {
  const t = COLUMN_TONES[tone];
  return (
    <div className={cn("rounded-[14px] border p-[16px]", t.box)}>
      <div
        className={cn(
          "flex items-center gap-[6px] font-mono text-[11px] uppercase tracking-[0.08em]",
          t.label,
        )}
      >
        {t.marker ? <span aria-hidden>{t.marker}</span> : null}
        {title}
      </div>
      <ul className="mt-[12px] flex flex-col gap-[10px]">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-[10px] text-pretty text-[14px] leading-[1.5] text-body"
          >
            <span
              aria-hidden
              className={cn(
                "mt-[7px] h-[6px] w-[6px] flex-none rounded-full",
                t.dot,
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The "Who owns what" chapter body: the concept split into what the learner
 * owns and configures versus what the provider builds and operates, with the
 * provider column labelled by the active lens.
 */
export function SharedResponsibilityPanel({
  provider,
  split,
}: {
  provider: Provider;
  split: ResponsibilitySplit;
}) {
  return (
    <div className="mt-[20px]">
      <div className="grid grid-cols-1 gap-[14px] min-[640px]:grid-cols-2">
        <Column title="You manage" tone="you" items={split.youManage} />
        <Column
          title={`${PROVIDER_LABELS[provider]} manages`}
          tone="provider"
          items={split.providerManages}
        />
      </div>

      <div className="mt-[24px] border-t border-line pt-[20px]">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          After you create it
        </div>
        <p className="mt-[6px] max-w-[64ch] text-pretty text-[13.5px] leading-[1.55] text-body-soft">
          Some settings you can change on the live resource; others are fixed at
          creation, so changing them means replacing it. Grounded in the{" "}
          {PROVIDER_LABELS[provider]} documentation.
        </p>
        <div className="mt-[14px] grid grid-cols-1 gap-[14px] min-[640px]:grid-cols-2">
          <Column
            title="Changeable in place"
            tone="mutable"
            items={split.mutable}
          />
          <Column
            title="Fixed at creation"
            tone="immutable"
            items={split.immutable}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The "Set it up with an agent" chapter body: a set of copy-ready prompts, each
 * a distinct use case, that a learner can hand to a coding agent to provision
 * the service with the provider's CLI. When more than one scenario is supplied,
 * a selector lets the learner switch between them.
 */
export function AgentPromptPanel({ cli, scenarios }: AgentSetup) {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const scenario = scenarios[selected] ?? scenarios[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(scenario.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the prompt stays selectable by hand.
    }
  };

  return (
    <>
      <p className="mt-[14px] max-w-[64ch] text-pretty text-[14px] leading-[1.6] text-body">
        Drive the{" "}
        <code className="rounded-[4px] bg-teal-tint px-[5px] py-[1px] font-mono text-[12.5px] text-teal-ink">
          {cli}
        </code>{" "}
        CLI. The agent should have your credentials configured first.
      </p>

      {scenarios.length > 1 ? (
        <div
          role="tablist"
          aria-label="Setup use cases"
          className="mt-[16px] flex flex-wrap gap-[8px]"
        >
          {scenarios.map((s, i) => (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={i === selected}
              onClick={() => {
                setSelected(i);
                setCopied(false);
              }}
              className={cn(
                "rounded-button border px-[12px] py-[6px] font-mono text-[12px] transition-colors",
                i === selected
                  ? "border-teal-line bg-teal-tint text-teal-ink"
                  : "border-line bg-surface text-ink-muted hover:border-ink-muted hover:text-body",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-[14px] max-w-[64ch] text-pretty text-[13.5px] leading-[1.55] text-body-soft">
        {scenario.blurb}
      </p>

      <div className="mt-[14px] overflow-hidden rounded-[14px] bg-panel-deep">
        <div className="flex items-center justify-between border-b border-white/10 px-[18px] py-[12px]">
          <div className="flex items-center gap-[8px] font-mono text-[12px] text-[oklch(0.7_0.03_195)]">
            <span
              aria-hidden
              className="h-[8px] w-[8px] rounded-full bg-[oklch(0.65_0.08_150)]"
            />
            Prompt for a coding agent
          </div>
          <button
            type="button"
            onClick={copy}
            className="rounded-button border border-white/15 px-[10px] py-[5px] font-mono text-[11.5px] text-[oklch(0.85_0.02_195)] transition-colors hover:border-white/35"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <p className="whitespace-pre-wrap px-[18px] py-[16px] font-mono text-[13px] leading-[1.7] text-[oklch(0.88_0.02_195)]">
          {scenario.prompt}
        </p>
      </div>
    </>
  );
}
