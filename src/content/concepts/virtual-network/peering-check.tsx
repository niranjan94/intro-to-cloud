"use client";

import { CheckIcon as Check, XIcon as X } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { PeeringConfig } from "./data";

/* Pure CIDR math, provider-neutral. Mirrors cidr-carver's parser so the two
 * chapters stay independent; the peering rule only needs range endpoints. */

type Parsed =
  | { ok: false; err: string }
  | { ok: true; p: number; net: number; first: number; last: number };

function parseCidr(str: string): Parsed {
  const m = str
    .trim()
    .match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!m)
    return {
      ok: false,
      err: "That's not a valid CIDR. Use something like 10.0.0.0/16.",
    };
  const o = [+m[1], +m[2], +m[3], +m[4]];
  const p = +m[5];
  if (o.some((x) => x > 255))
    return { ok: false, err: "Each number between the dots must be 0-255." };
  if (p > 32) return { ok: false, err: "The /prefix must be 0-32." };
  const ip = (((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3]) >>> 0;
  const size = 2 ** (32 - p);
  const mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
  const net = (ip & mask) >>> 0;
  return { ok: true, p, net, first: net, last: (net + size - 1) >>> 0 };
}

const intToIp = (n: number) =>
  [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

type Verdict = {
  kind: "pass" | "fail";
  title: string;
  body: string;
  /** Positions on a shared 0-100 scale, or null when a range is invalid. */
  bars: {
    a: { left: number; width: number };
    b: { left: number; width: number };
    overlap: { left: number; width: number } | null;
  } | null;
};

function evaluate(config: PeeringConfig, aStr: string, bStr: string): Verdict {
  const a = parseCidr(aStr);
  const b = parseCidr(bStr);

  if (!a.ok)
    return {
      kind: "fail",
      title: `Fix ${config.aLabel} first`,
      body: a.err,
      bars: null,
    };
  if (!b.ok)
    return {
      kind: "fail",
      title: `Fix ${config.bLabel} first`,
      body: b.err,
      bars: null,
    };

  const lo = Math.min(a.first, b.first);
  const hi = Math.max(a.last, b.last);
  const span = Math.max(1, hi - lo);
  const place = (r: { first: number; last: number }) => ({
    left: ((r.first - lo) / span) * 100,
    width: Math.max(1.2, ((r.last - r.first + 1) / span) * 100),
  });

  const overlaps = a.first <= b.last && b.first <= a.last;
  const oStart = Math.max(a.first, b.first);
  const oEnd = Math.min(a.last, b.last);

  const bars = {
    a: place(a),
    b: place(b),
    overlap: overlaps
      ? {
          left: ((oStart - lo) / span) * 100,
          width: Math.max(1.2, ((oEnd - oStart + 1) / span) * 100),
        }
      : null,
  };

  if (!overlaps)
    return {
      kind: "pass",
      title: "No overlap · peering allowed",
      body: `${config.aLabel} (${intToIp(a.first)}-${intToIp(a.last)}) and ${config.bLabel} (${intToIp(b.first)}-${intToIp(b.last)}) share no addresses, so every destination is unambiguous. A ${config.linkLabel} between them can be created, and once you add the routes each side can reach the other by private IP.`,
      bars,
    };

  const identical = a.first === b.first && a.last === b.last;
  const contained =
    (a.first >= b.first && a.last <= b.last) ||
    (b.first >= a.first && b.last <= a.last);
  const why = identical
    ? "The two ranges are identical"
    : contained
      ? "One range sits entirely inside the other"
      : `The two ranges overlap across ${intToIp(oStart)}-${intToIp(oEnd)}`;

  return {
    kind: "fail",
    title: "Ranges overlap · peering rejected",
    body: `${why}. An address like ${intToIp(oStart)} would then exist on both sides, so routing could not tell which network a packet is destined for. ${config.netName}s with overlapping ranges cannot be peered: the provider refuses the connection. Give one side a different, non-overlapping range.`,
    bars,
  };
}

/**
 * The peering chapter's interactive: pick a range for each of two networks and
 * see whether a peering connection between them is allowed. The single rule it
 * enforces is that the two ranges must not overlap; the shared ruler highlights
 * the clashing addresses in red when they do.
 */
export function PeeringCheck({ config }: { config: PeeringConfig }) {
  const [a, setA] = useState(config.presets[0].a);
  const [b, setB] = useState(config.presets[0].b);

  const verdict = useMemo(() => evaluate(config, a, b), [config, a, b]);
  const pass = verdict.kind === "pass";

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[22px]">
        <div className="flex flex-wrap gap-[20px]">
          <label className="flex flex-col gap-[6px]">
            <span className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
              {config.aLabel} range
            </span>
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="w-[170px] rounded-[10px] border border-input bg-surface-muted px-[11px] py-[9px] font-mono text-[14.5px] text-ink-soft"
            />
          </label>
          <label className="flex flex-col gap-[6px]">
            <span className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
              {config.bLabel} range
            </span>
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="w-[170px] rounded-[10px] border border-input bg-surface-muted px-[11px] py-[9px] font-mono text-[14.5px] text-ink-soft"
            />
          </label>
        </div>

        <p className="mt-[16px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Or load a case
        </p>
        <div className="mt-[8px] flex flex-wrap gap-[7px]">
          {config.presets.map((preset) => {
            const active = preset.a === a && preset.b === b;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setA(preset.a);
                  setB(preset.b);
                }}
                aria-pressed={active}
                className={cn(
                  "rounded-pill border px-[12px] py-[6px] font-mono text-[12.5px] transition-colors",
                  active
                    ? "border-teal-ring bg-teal-tint text-teal-ink"
                    : "border-line bg-surface-muted text-ink-muted hover:border-ink-muted",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="mt-[20px] flex flex-col gap-[12px]">
          {verdict.bars ? (
            <>
              <Track
                label={config.aLabel}
                tone="a"
                bar={verdict.bars.a}
                overlap={verdict.bars.overlap}
              />
              <Track
                label={config.bLabel}
                tone="b"
                bar={verdict.bars.b}
                overlap={verdict.bars.overlap}
              />
              <p className="text-center font-mono text-[11px] text-ink-muted">
                the two ranges drawn on one shared address line
                {verdict.bars.overlap ? " · red is the clash" : ""}
              </p>
            </>
          ) : (
            <div className="rounded-[10px] border border-dashed border-line px-[14px] py-[18px] text-center font-mono text-[12px] text-ink-muted">
              enter two valid ranges to compare them
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "rounded-[18px] border p-[18px]",
          pass
            ? "border-[oklch(0.72_0.12_150)] bg-[oklch(0.97_0.03_150)]"
            : "border-[oklch(0.72_0.14_25)] bg-[oklch(0.97_0.03_25)]",
        )}
      >
        <div className="flex items-center gap-[8px]">
          <span
            className={cn(
              "h-[11px] w-[11px] rounded-full",
              pass ? "bg-[oklch(0.58_0.12_150)]" : "bg-[oklch(0.62_0.17_25)]",
            )}
          />
          <span
            className={cn(
              "inline-flex items-center gap-[6px] text-[15px] font-semibold",
              pass ? "text-[oklch(0.44_0.1_150)]" : "text-[oklch(0.5_0.16_25)]",
            )}
          >
            {pass ? (
              <Check size={16} weight="bold" aria-hidden />
            ) : (
              <X size={16} weight="bold" aria-hidden />
            )}
            {verdict.title}
          </span>
        </div>
        <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
          {verdict.body}
        </p>
      </div>
    </div>
  );
}

/** One network's range drawn on the shared scale, with the clash tinted red. */
function Track({
  label,
  tone,
  bar,
  overlap,
}: {
  label: string;
  tone: "a" | "b";
  bar: { left: number; width: number };
  overlap: { left: number; width: number } | null;
}) {
  const fill =
    tone === "a"
      ? "border-[oklch(0.6_0.09_255)] bg-[oklch(0.9_0.05_255)]"
      : "border-[oklch(0.62_0.11_300)] bg-[oklch(0.9_0.05_300)]";
  return (
    <div>
      <div className="mb-[3px] font-mono text-[11px] text-ink-muted">
        {label}
      </div>
      <div className="relative h-[26px] overflow-hidden rounded-[8px] border border-line bg-surface-muted">
        <div
          className={cn("absolute inset-y-0 rounded-[6px] border-2", fill)}
          style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
        />
        {overlap ? (
          <div
            className="absolute inset-y-0 border-x-2 border-[oklch(0.62_0.17_25)] bg-[oklch(0.75_0.14_25)]/60"
            style={{ left: `${overlap.left}%`, width: `${overlap.width}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}
