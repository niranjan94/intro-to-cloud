"use client";

import { LinkSimpleIcon as LinkSimple } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import { cn } from "@/lib/utils";
import type { AnatomyContent, AnatomyPart } from "./data";
import { TONE } from "./tones";

/** A clickable machine part chip. */
function PartChip({
  part,
  selected,
  onSelect,
}: {
  part: AnatomyPart;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const t = TONE[part.tone];
  const active = selected === part.key;
  return (
    <button
      type="button"
      onClick={() => onSelect(part.key)}
      aria-pressed={active}
      className={cn(
        "rounded-[10px] border-[1.5px] px-[12px] py-[9px] text-left transition-shadow",
        t.frame,
        active && "ring-2 ring-teal-ring ring-offset-1 ring-offset-surface",
      )}
    >
      <span
        className={cn("block font-mono text-[12.5px] font-semibold", t.text)}
      >
        {part.label}
      </span>
      <span className="mt-[2px] block font-mono text-[11px] text-ink-muted">
        {part.sub}
      </span>
    </button>
  );
}

/**
 * A part and the chips that ride on it. The network interface owns the public IP
 * and the security group, so they render clipped onto it (not as its peers): the
 * interface is what attaches to the instance and sits in the subnet.
 */
function PartCluster({
  part,
  selected,
  onSelect,
}: {
  part: AnatomyPart;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  if (!part.attached?.length)
    return <PartChip part={part} selected={selected} onSelect={onSelect} />;
  return (
    <div className="rounded-[12px] border-[1.5px] border-line bg-surface-muted p-[8px]">
      <PartChip part={part} selected={selected} onSelect={onSelect} />
      <span className="mt-[8px] flex items-center gap-[5px] font-mono text-[10.5px] font-semibold text-teal-ink">
        <LinkSimple size={12} weight="bold" aria-hidden />
        clip onto it
      </span>
      <div className="mt-[6px] flex flex-wrap gap-[8px]">
        {part.attached.map((sub) => (
          <PartChip
            key={sub.key}
            part={sub}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

const LEGEND: { label: string; tone: keyof typeof TONE }[] = [
  { label: "compute", tone: "compute" },
  { label: "storage", tone: "storage" },
  { label: "network", tone: "network" },
  { label: "firewall", tone: "security" },
  { label: "access", tone: "identity" },
];

/** Chapter 1: an interactive anatomy map of a rented machine, with a detail panel. */
export function Anatomy({ content }: { content: AnatomyContent }) {
  const [selected, setSelected] = useState<string | null>(null);
  const info = selected ? content.hotspots[selected] : null;

  return (
    <>
      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[20px]">
          <div className="rounded-[14px] border-[1.5px] border-dashed border-[oklch(0.8_0.03_235)] p-[14px]">
            <div className="font-mono text-[11px] text-[oklch(0.55_0.04_235)]">
              {content.region}
            </div>
            <div className="mt-[10px] rounded-[12px] border-[1.5px] border-dashed border-[oklch(0.82_0.03_155)] p-[14px]">
              <div className="font-mono text-[11px] text-[oklch(0.5_0.05_155)]">
                {content.subnet}
              </div>

              <button
                type="button"
                onClick={() => setSelected("vm")}
                aria-pressed={selected === "vm"}
                className={cn(
                  "mt-[12px] block w-full rounded-[12px] border-[1.5px] border-teal-line bg-teal-tint px-[14px] py-[12px] text-left transition-shadow",
                  selected === "vm" &&
                    "ring-2 ring-teal-ring ring-offset-1 ring-offset-surface",
                )}
              >
                <span className="block text-[13.5px] font-semibold text-ink-strong">
                  {content.vm.label}
                </span>
                <span className="mt-[3px] block font-mono text-[11.5px] text-teal">
                  {content.vm.sub}
                </span>
              </button>

              <div className="mt-[14px] flex flex-col gap-[12px]">
                {content.groups.map((group) => (
                  <div key={group.label}>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
                      {group.label}
                    </div>
                    <div className="mt-[6px] flex flex-wrap items-start gap-[8px]">
                      {group.parts.map((part) => (
                        <PartCluster
                          key={part.key}
                          part={part}
                          selected={selected}
                          onSelect={setSelected}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-[16px] flex flex-wrap gap-x-[14px] gap-y-[6px] font-mono text-[11.5px] text-ink-muted">
            {LEGEND.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-[6px]"
              >
                <span
                  className={cn(
                    "h-[12px] w-[12px] rounded-[3px] border-[1.5px]",
                    TONE[item.tone].frame,
                  )}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-surface-muted p-[20px]">
          {info ? (
            <>
              <h3 className="text-[17px] font-semibold text-ink-strong">
                {info.title}
              </h3>
              <p className="mt-[6px] font-mono text-[12px] text-teal-ink">
                {info.rel}
              </p>
              <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
                {info.body}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[17px] font-semibold text-ink-strong">
                Start by tapping a piece
              </h3>
              <p className="mt-[6px] font-mono text-[12px] text-teal-ink">
                Everything on the left is clickable.
              </p>
              <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
                {content.hint}
              </p>
            </>
          )}
        </div>
      </div>

      <p className="mt-[22px] font-mono text-[12px] uppercase tracking-[0.04em] text-ink-muted">
        The one command that creates all of this
      </p>
      <CliBlock command={content.cli} />
    </>
  );
}
