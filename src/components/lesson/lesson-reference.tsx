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
}

/** A ready-to-paste prompt for a coding agent to stand the service up via CLI. */
export interface AgentSetup {
  /** The CLI binary the agent is expected to drive, e.g. "aws" or "az". */
  cli: string;
  /** The sample prompt a learner can hand to a coding agent. */
  prompt: string;
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
      "Standing this up yourself is a handful of CLI commands. Hand the prompt below to a coding agent to provision it from your terminal, and read what it proposes before you let it run anything.",
  },
] as const;

function Column({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "you" | "provider";
  items: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border p-[16px]",
        tone === "you"
          ? "border-teal-line bg-teal-tint"
          : "border-line bg-surface-muted",
      )}
    >
      <div
        className={cn(
          "font-mono text-[11px] uppercase tracking-[0.08em]",
          tone === "you" ? "text-teal" : "text-ink-muted",
        )}
      >
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
                tone === "you" ? "bg-teal-ring" : "bg-line",
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
    <div className="mt-[20px] grid grid-cols-1 gap-[14px] min-[640px]:grid-cols-2">
      <Column title="You manage" tone="you" items={split.youManage} />
      <Column
        title={`${PROVIDER_LABELS[provider]} manages`}
        tone="provider"
        items={split.providerManages}
      />
    </div>
  );
}

/**
 * The "Set it up with an agent" chapter body: a copy-ready prompt a learner can
 * hand to a coding agent to provision the service with the provider's CLI.
 */
export function AgentPromptPanel({ cli, prompt }: AgentSetup) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
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
          {prompt}
        </p>
      </div>
    </>
  );
}
