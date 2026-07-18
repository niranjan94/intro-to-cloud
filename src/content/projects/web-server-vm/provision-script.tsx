"use client";

import { PlayIcon as Play } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProvisionContent } from "./data";

/**
 * Chapter 3: the first-boot provisioning script, annotated line by line, beside
 * a mini browser that shows what nginx serves once the script has run. Tapping a
 * line reveals what it does; running the boot reveals the served page, making
 * the point that install and serve happen with no one logged in.
 */
export function ProvisionScript({
  provision,
}: {
  provision: ProvisionContent;
}) {
  const [selected, setSelected] = useState(0);
  const [booted, setBooted] = useState(false);
  const note = provision.lines[selected]?.note;

  return (
    <div className="mt-[20px] grid grid-cols-1 gap-[16px] min-[820px]:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="overflow-hidden rounded-[14px] bg-panel-deep">
          <div className="flex items-center justify-between border-b border-white/10 px-[16px] py-[10px]">
            <span className="font-mono text-[12px] text-[oklch(0.8_0.02_195)]">
              {provision.filename}
            </span>
            <span className="font-mono text-[11px] text-[oklch(0.62_0.02_195)]">
              {provision.mechanism}
            </span>
          </div>
          <div className="py-[10px]">
            {provision.lines.map((line, i) => (
              <button
                key={line.code}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                className={cn(
                  "flex w-full items-start gap-[12px] px-[16px] py-[4px] text-left font-mono text-[12.5px] leading-[1.6] transition-colors",
                  i === selected
                    ? "bg-white/[0.08] text-[oklch(0.95_0.01_195)]"
                    : "text-[oklch(0.82_0.02_195)] hover:bg-white/[0.04]",
                )}
              >
                <span className="select-none text-[oklch(0.5_0.02_195)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="whitespace-pre-wrap break-all">
                  {line.code}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-[12px] min-h-[64px] rounded-[12px] border-l-[4px] border-l-teal-ring bg-teal-tint px-[14px] py-[12px]">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-teal">
            Line {String(selected + 1).padStart(2, "0")}
          </div>
          <p className="mt-[5px] text-pretty text-[13px] leading-[1.6] text-body">
            {note ?? "Tap a line to see what it does."}
          </p>
        </div>
      </div>

      <div>
        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center gap-[8px] border-b border-line bg-surface-muted px-[12px] py-[9px]">
            <span className="flex gap-[5px]" aria-hidden>
              <span className="h-[9px] w-[9px] rounded-full bg-[oklch(0.8_0.09_25)]" />
              <span className="h-[9px] w-[9px] rounded-full bg-[oklch(0.85_0.09_85)]" />
              <span className="h-[9px] w-[9px] rounded-full bg-[oklch(0.8_0.09_150)]" />
            </span>
            <span className="truncate rounded-[6px] bg-surface px-[10px] py-[3px] font-mono text-[11.5px] text-ink-muted">
              http://&lt;public-ip&gt;
            </span>
          </div>
          <div className="flex min-h-[150px] items-center justify-center px-[18px] py-[26px] text-center">
            {booted ? (
              <div className="motion-safe:animate-[fadeUp_0.4s_ease_both]">
                <h3 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
                  {provision.page.heading}
                </h3>
                <p className="mt-[8px] font-mono text-[12.5px] text-ink-muted">
                  {provision.page.sub}
                </p>
              </div>
            ) : (
              <p className="max-w-[26ch] text-[13px] leading-[1.55] text-ink-muted">
                Nothing is serving yet. The box boots, the script runs, then
                nginx answers.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setBooted((b) => !b)}
          className="mt-[12px] inline-flex items-center gap-[7px] rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted"
        >
          <Play size={14} weight="bold" aria-hidden />
          {booted ? "Reset" : "Run first boot"}
        </button>
      </div>
    </div>
  );
}
