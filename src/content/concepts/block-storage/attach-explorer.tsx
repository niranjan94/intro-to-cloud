"use client";

import { useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import { cn } from "@/lib/utils";
import type { AttachContent, AttachDisk } from "./data";
import { TONE, type Tone } from "./tones";

type Fate = "attached" | "preserved" | "deleted";

const FATE: Record<Fate, { tone: Tone; label: string }> = {
  attached: { tone: "disk", label: "Attached" },
  preserved: { tone: "persist", label: "Preserved" },
  deleted: { tone: "ephemeral", label: "Deleted" },
};

function diskFate(
  disk: AttachDisk,
  terminated: boolean,
  deleteData: boolean,
): Fate {
  if (!terminated) return "attached";
  const deletes = disk.isRoot ? disk.deletesWithMachineDefault : deleteData;
  return deletes ? "deleted" : "preserved";
}

/** Chapter 1: attach volumes to a machine and watch them survive its lifecycle. */
export function AttachExplorer({ content }: { content: AttachContent }) {
  const [stateIndex, setStateIndex] = useState(0);
  const [deleteData, setDeleteData] = useState(
    content.disks.find((d) => d.toggleable)?.deletesWithMachineDefault ?? false,
  );
  const state = content.states[stateIndex];
  const terminated = state.id === "terminated";
  const running = state.id === "running";

  const dataDisk = content.disks.find((d) => d.toggleable);
  const explain = terminated
    ? deleteData
      ? content.deleteExplain
      : content.persistExplain
    : state.machineNote;

  return (
    <div className="mt-[16px]">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-[14px]">
        <fieldset className="flex gap-[2px] rounded-[12px] border border-line bg-surface p-[3px]">
          <legend className="sr-only">Machine lifecycle</legend>
          {content.states.map((s, i) => {
            const active = i === stateIndex;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => setStateIndex(i)}
                className={cn(
                  "rounded-[9px] px-[13px] py-[7px] font-mono text-[12px] transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-ink-muted hover:text-body",
                )}
              >
                {s.id === "terminated" ? content.terminateVerb : s.label}
              </button>
            );
          })}
        </fieldset>

        {dataDisk ? (
          <button
            type="button"
            aria-pressed={deleteData}
            onClick={() => setDeleteData((v) => !v)}
            className={cn(
              "inline-flex items-center gap-[9px] rounded-[10px] border px-[13px] py-[8px] font-mono text-[12px] transition-colors",
              deleteData
                ? cn(TONE.ephemeral.frame, TONE.ephemeral.text)
                : "border-line bg-surface text-ink-muted hover:border-ink-muted",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "inline-flex h-[16px] w-[26px] items-center rounded-full p-[2px] transition-colors",
                deleteData ? TONE.ephemeral.dot : "bg-line",
              )}
            >
              <span
                className={cn(
                  "h-[12px] w-[12px] rounded-full bg-white transition-transform",
                  deleteData && "translate-x-[10px]",
                )}
              />
            </span>
            {content.deleteToggleLabel}
          </button>
        ) : null}
      </div>

      {/* The boundary + machine + disks */}
      <div className="mt-[16px] rounded-[18px] border-[1.5px] border-dashed border-[oklch(0.8_0.05_235)] bg-[oklch(0.98_0.012_235)] p-[16px]">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[oklch(0.5_0.05_235)]">
          {content.boundaryLabel}
        </div>
        <p className="mt-[3px] text-[12px] leading-[1.5] text-ink-muted">
          {content.boundaryNote}
        </p>

        <div className="mt-[14px] grid grid-cols-1 gap-[12px] min-[620px]:grid-cols-[auto_1fr] min-[620px]:items-stretch">
          {/* Machine */}
          <div
            className={cn(
              "flex min-w-[160px] flex-col justify-center rounded-[14px] border-[1.5px] p-[16px] transition-opacity",
              terminated
                ? cn(TONE.baseline.frame, "opacity-60")
                : running
                  ? TONE.machine.frame
                  : cn(TONE.machine.frame, "opacity-75"),
            )}
          >
            <div className="flex items-center gap-[8px]">
              <span
                className={cn(
                  "h-[9px] w-[9px] rounded-full",
                  terminated ? TONE.baseline.dot : TONE.machine.dot,
                )}
              />
              <span
                className={cn(
                  "font-mono text-[12px] uppercase tracking-[0.04em]",
                  terminated ? TONE.baseline.text : TONE.machine.text,
                )}
              >
                {content.machineTerm}
              </span>
            </div>
            <div
              className={cn(
                "mt-[6px] font-mono text-[15px] font-semibold",
                terminated ? "text-ink-muted line-through" : "text-ink-strong",
              )}
            >
              {content.machineName}
            </div>
            <div className="mt-[4px] font-mono text-[11px] text-ink-muted">
              {terminated ? "removed" : state.label.toLowerCase()}
            </div>
          </div>

          {/* Disks */}
          <div className="flex flex-col gap-[8px]">
            {content.disks.map((disk) => {
              const fate = diskFate(disk, terminated, deleteData);
              const f = FATE[fate];
              const ft = TONE[f.tone];
              return (
                <div
                  key={disk.id}
                  className={cn(
                    "flex items-center justify-between gap-[10px] rounded-[12px] border-[1.5px] px-[14px] py-[11px] transition-colors",
                    ft.frame,
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <span
                        className={cn("h-[8px] w-[8px] rounded-full", ft.dot)}
                      />
                      <span className="font-mono text-[12.5px] font-semibold text-ink-strong">
                        {disk.role}
                      </span>
                      {disk.isRoot ? (
                        <span className="rounded-full border border-line px-[7px] py-[1px] font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-muted">
                          default delete
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-[3px] truncate font-mono text-[11px] text-ink-muted">
                      {disk.name} · {disk.sub}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-[10px] py-[3px] font-mono text-[10.5px] uppercase tracking-[0.04em]",
                      ft.chip,
                    )}
                  >
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-[14px] rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          {terminated ? "The data disk" : "What is happening"}
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {explain}
        </p>
      </div>

      <p className="mt-[14px] text-[13px] leading-[1.6] text-ink-muted">
        {content.hint}
      </p>

      <p className="mt-[16px] font-mono text-[12px] uppercase tracking-[0.04em] text-ink-muted">
        Attaching a volume
      </p>
      <CliBlock command={content.cli} />
    </div>
  );
}
