"use client";

import { CursorClickIcon as CursorClick } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { TONE } from "@/components/lesson/tones";
import { cn } from "@/lib/utils";
import type { ArchNode, Hotspot } from "./data";

/** A rule chip clipped to a node header (security group / NSG / public IP). */
function AttachedChip({
  node,
  selected,
  onSelect,
}: {
  node: ArchNode;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  const t = TONE[node.tone];
  return (
    <button
      type="button"
      onClick={() => onSelect(node.key)}
      aria-pressed={selected}
      className={cn(
        "rounded-full px-[9px] py-[3px] font-mono text-[10.5px] transition-shadow",
        t.chip,
        selected && "ring-2 ring-offset-1 ring-teal-ring",
      )}
    >
      {node.label}
    </button>
  );
}

function Node({
  node,
  selected,
  onSelect,
}: {
  node: ArchNode;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const t = TONE[node.tone];
  const isSelected = selected === node.key;
  const isContainer = node.kind === "container";

  return (
    <div
      className={cn(
        "rounded-[12px] border p-[10px]",
        isContainer ? "border-dashed" : "border-solid",
        t.frame,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <button
          type="button"
          onClick={() => onSelect(node.key)}
          aria-pressed={isSelected}
          className={cn(
            "flex flex-col items-start rounded-[8px] px-[8px] py-[4px] text-left transition-shadow",
            isSelected && "ring-2 ring-teal-ring",
          )}
        >
          <span className={cn("text-[13px] font-semibold", t.text)}>
            {node.label}
          </span>
          {node.sub ? (
            <span className="font-mono text-[10.5px] text-ink-muted">
              {node.sub}
            </span>
          ) : null}
        </button>
        {node.attached && node.attached.length > 0 ? (
          <div className="flex flex-wrap items-center gap-[6px]">
            {node.attached.map((a) => (
              <AttachedChip
                key={a.key}
                node={a}
                selected={selected === a.key}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : null}
      </div>

      {node.children && node.children.length > 0 ? (
        <div className="mt-[10px] flex flex-col gap-[10px] pl-[10px]">
          {node.children.map((child) => (
            <Node
              key={child.key}
              node={child}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Chapter 0: the architecture as nested boxes with attached rule chips. Tapping
 * any piece reveals what it is and how it relates to its neighbours, sourced
 * from `hotspots`. Boxes contain; firewalls and public front doors attach.
 */
export function ArchitectureMap({
  nodes,
  hotspots,
  hint,
}: {
  nodes: ArchNode[];
  hotspots: Record<string, Hotspot>;
  hint: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = selected ? hotspots[selected] : null;

  return (
    <div className="mt-[20px] grid grid-cols-1 gap-[16px] min-[820px]:grid-cols-[1.15fr_0.85fr]">
      <div className="flex flex-col gap-[10px] rounded-[16px] border border-line bg-surface-muted p-[14px]">
        {nodes.map((node) => (
          <Node
            key={node.key}
            node={node}
            selected={selected}
            onSelect={setSelected}
          />
        ))}
      </div>

      <div>
        <div className="min-h-[150px] rounded-[16px] border border-line bg-surface p-[18px]">
          {detail ? (
            <>
              <div className="text-[15px] font-semibold text-ink-strong">
                {detail.title}
              </div>
              <div className="mt-[4px] font-mono text-[11.5px] text-teal">
                {detail.rel}
              </div>
              <p className="mt-[10px] text-pretty text-[13.5px] leading-[1.6] text-body">
                {detail.body}
              </p>
            </>
          ) : (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center text-ink-muted">
              <CursorClick size={22} weight="duotone" aria-hidden />
              <p className="mt-[8px] max-w-[24ch] text-[13px] leading-[1.5]">
                Tap any piece to read what it is and how it connects.
              </p>
            </div>
          )}
        </div>

        <div className="mt-[12px] rounded-[12px] border-l-[4px] border-l-teal-ring bg-teal-tint px-[14px] py-[12px]">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-teal">
            Read it this way
          </div>
          <p className="mt-[6px] text-pretty text-[13px] leading-[1.6] text-body">
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}
