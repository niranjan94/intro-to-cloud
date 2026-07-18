"use client";

import { LinkSimpleIcon as LinkSimple } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Hotspot, MapNode } from "./data";
import { TONE } from "./tones";

interface PieceProps {
  node: MapNode;
  selected: string | null;
  onSelect: (key: string) => void;
}

/**
 * A connector tag naming the sibling resource this node plugs into. It reads as
 * attachment, not containment: the ENI sits in the subnet and attaches to the
 * instance rather than living inside it.
 */
function AttachTag({ target }: { target: string }) {
  return (
    <span className="mb-[8px] inline-flex items-center gap-[5px] rounded-[6px] border border-teal-line bg-teal-tint px-[8px] py-[3px] font-mono text-[10.5px] font-semibold text-teal-ink">
      <LinkSimple size={12} weight="bold" aria-hidden />
      attaches to {target}
    </span>
  );
}

/** A clickable box for a leaf piece (a resource or an attached rule). */
function Leaf({ node, selected, onSelect }: PieceProps) {
  const t = TONE[node.tone];
  const active = selected === node.key;
  const rule = node.kind === "rule";
  const button = (
    <button
      type="button"
      onClick={() => onSelect(node.key)}
      aria-pressed={active}
      className={cn(
        "rounded-[10px] border-[1.5px] px-[12px] py-[9px] text-left transition-shadow",
        rule
          ? cn("border-dashed", t.border, "bg-[oklch(0.98_0.02_25)]")
          : t.frame,
        active && "ring-2 ring-teal-ring ring-offset-1 ring-offset-surface",
      )}
    >
      <span
        className={cn("block font-mono text-[12.5px] font-semibold", t.text)}
      >
        {node.label}
      </span>
      {node.sub ? (
        <span className="mt-[2px] block font-mono text-[11px] text-ink-muted">
          {node.sub}
        </span>
      ) : null}
    </button>
  );
  if (!node.attachTo) return button;
  return (
    <div className="flex flex-col items-start">
      <AttachTag target={node.attachTo} />
      {button}
    </div>
  );
}

/** A container piece: a clickable header, its attached rules, then children. */
function Piece({ node, selected, onSelect }: PieceProps) {
  const t = TONE[node.tone];
  const hasNest = Boolean(node.children?.length || node.attached?.length);
  if (!hasNest)
    return <Leaf node={node} selected={selected} onSelect={onSelect} />;

  const active = selected === node.key;
  return (
    <div className={cn("rounded-[14px] border-[1.5px] p-[12px]", t.frame)}>
      {node.attachTo ? (
        <div>
          <AttachTag target={node.attachTo} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-[8px]">
        <button
          type="button"
          onClick={() => onSelect(node.key)}
          aria-pressed={active}
          className={cn(
            "rounded-[8px] px-[8px] py-[4px] text-left transition-shadow",
            active && "ring-2 ring-teal-ring ring-offset-1 ring-offset-surface",
          )}
        >
          <span className={cn("font-mono text-[12.5px] font-semibold", t.text)}>
            {node.label}
          </span>
          {node.sub ? (
            <span className="ml-[8px] font-mono text-[11px] text-ink-muted">
              {node.sub}
            </span>
          ) : null}
        </button>
        {node.attached?.map((rule) => (
          <Leaf
            key={rule.key}
            node={rule}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
      {node.children?.length ? (
        <div className="mt-[10px] flex flex-col gap-[10px]">
          {node.children.map((child) => (
            <Piece
              key={`${child.key}-${child.sub ?? ""}`}
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

const LEGEND: { label: string; tone: keyof typeof TONE }[] = [
  { label: "public zone", tone: "public" },
  { label: "private zone", tone: "private" },
  { label: "firewall (rules)", tone: "firewall" },
  { label: "a real resource", tone: "resource" },
];

/** Chapter 0: an interactive orientation map with a detail panel. */
export function NetworkMap({
  map,
  hotspots,
  hint,
}: {
  map: MapNode[];
  hotspots: Record<string, Hotspot>;
  hint: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const info = selected ? hotspots[selected] : null;

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[20px]">
        <div className="flex flex-col gap-[12px]">
          {map.map((node) => (
            <Piece
              key={node.key}
              node={node}
              selected={selected}
              onSelect={setSelected}
            />
          ))}
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
              {hint}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
