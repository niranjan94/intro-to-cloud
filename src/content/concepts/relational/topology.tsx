"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AvailabilityContent, TopoMode, TopoNode } from "./data";
import { TONE } from "./tones";

const ROLE_LABEL: Record<TopoNode["role"], string> = {
  primary: "primary",
  standby: "standby",
  read: "read replica",
  offline: "offline",
};

const SYNC_LABEL: Record<TopoMode["sync"], string> = {
  sync: "synchronous replication",
  async: "asynchronous replication",
  none: "no replication",
};

/** A single node box in the topology, colored by the role it plays. */
function NodeCard({ node }: { node: TopoNode }) {
  const t = TONE[node.role];
  return (
    <div
      className={cn(
        "min-w-[150px] flex-1 rounded-[12px] border-[1.5px] p-[14px]",
        t.frame,
      )}
    >
      <div className="flex items-center gap-[7px]">
        <span className={cn("h-[9px] w-[9px] rounded-full", t.dot)} />
        <span className={cn("font-mono text-[10.5px] uppercase", t.text)}>
          {ROLE_LABEL[node.role]}
        </span>
      </div>
      <div className="mt-[8px] text-[13.5px] font-semibold text-ink-strong">
        {node.label}
      </div>
      <div className="mt-[3px] font-mono text-[11px] text-ink-muted">
        {node.sub}
      </div>
      <div className="mt-[10px] inline-flex rounded-[6px] bg-surface px-[7px] py-[3px] font-mono text-[10.5px] text-body-soft">
        {node.zone}
      </div>
    </div>
  );
}

/** Chapter 2: switch between availability topologies and read what each shape buys. */
export function Topology({ content }: { content: AvailabilityContent }) {
  const [currentId, setCurrentId] = useState(content.modes[0].id);
  const mode =
    content.modes.find((m) => m.id === currentId) ?? content.modes[0];

  return (
    <div className="mt-[16px]">
      <div
        role="tablist"
        aria-label="Availability topologies"
        className="flex flex-wrap gap-[8px]"
      >
        {content.modes.map((m) => {
          const active = m.id === currentId;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCurrentId(m.id)}
              className={cn(
                "rounded-full border px-[14px] py-[7px] font-mono text-[12.5px] transition-colors",
                active
                  ? "border-teal-ring bg-teal-tint text-teal-ink"
                  : "border-line bg-surface text-ink-muted hover:border-ink-muted",
              )}
            >
              {m.navLabel}
            </button>
          );
        })}
      </div>

      <div
        key={mode.id}
        className="mt-[18px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
      >
        <div className="rounded-[18px] border border-line bg-surface p-[20px]">
          <div className="rounded-[14px] border-[1.5px] border-dashed border-[oklch(0.8_0.03_235)] p-[16px]">
            <div className="flex items-center justify-between gap-[10px]">
              <span className="font-mono text-[11px] text-[oklch(0.55_0.04_235)]">
                {mode.title}
              </span>
              <span className="font-mono text-[10.5px] text-ink-muted">
                {SYNC_LABEL[mode.sync]}
              </span>
            </div>
            <div className="mt-[12px] flex flex-wrap items-stretch gap-[12px]">
              {mode.nodes.map((node, i) => (
                <NodeCard key={`${node.label}-${node.zone}-${i}`} node={node} />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-[14px] max-w-[64ch] text-pretty text-[14px] leading-[1.65] text-body">
          {mode.intro}
        </p>
      </div>
    </div>
  );
}
