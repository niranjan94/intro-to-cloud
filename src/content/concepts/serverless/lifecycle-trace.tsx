"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type Cancelable, tween } from "./anim";
import type { LifecycleContent, Phase } from "./data";
import { TONE } from "./tones";

/** SVG fills for the two phase tones used in the trace. */
const PHASE_SVG: Record<string, { fill: string; stroke: string; ink: string }> =
  {
    init: {
      fill: "oklch(0.95 0.05 80)",
      stroke: "oklch(0.72 0.1 75)",
      ink: "oklch(0.42 0.09 65)",
    },
    invoke: {
      fill: "oklch(0.94 0.06 150)",
      stroke: "oklch(0.62 0.12 150)",
      ink: "oklch(0.4 0.1 150)",
    },
  };

const svgFor = (tone: Phase["tone"]) => PHASE_SVG[tone] ?? PHASE_SVG.invoke;

const TRACK_X0 = 16;
const TRACK_W = 648;
const TRACK_Y = 52;
const BAR_H = 54;

/** Chapter 2: trace a cold and a warm invocation across the environment phases. */
export function LifecycleTrace({ content }: { content: LifecycleContent }) {
  const [pathId, setPathId] = useState(content.paths[0].id);
  const [progress, setProgress] = useState(1);
  const [done, setDone] = useState(true);
  const animRef = useRef<Cancelable | null>(null);

  useEffect(() => () => animRef.current?.cancel(), []);

  const path = content.paths.find((p) => p.id === pathId) ?? content.paths[0];
  const total = path.phases.reduce((sum, p) => sum + p.ms, 0);
  const warm = content.paths.find((p) => p.kind === "warm");
  const warmTotal = warm?.phases.reduce((sum, p) => sum + p.ms, 0) ?? 0;
  const initMs = path.phases
    .filter((p) => p.tone === "init")
    .reduce((sum, p) => sum + p.ms, 0);

  // Cumulative layout of phases along the track.
  let acc = 0;
  const segments = path.phases.map((phase) => {
    const startFrac = acc / total;
    acc += phase.ms;
    const endFrac = acc / total;
    return { phase, startFrac, endFrac };
  });

  const elapsedMs = Math.round(progress * total);
  const activeIndex = segments.findIndex(
    (s) => progress >= s.startFrac && progress < s.endFrac,
  );
  const playX = TRACK_X0 + progress * TRACK_W;

  const run = (id: string) => {
    animRef.current?.cancel();
    const next = content.paths.find((p) => p.id === id) ?? content.paths[0];
    const nextTotal = next.phases.reduce((sum, p) => sum + p.ms, 0);
    setPathId(id);
    setDone(false);
    setProgress(0);
    const duration = Math.min(1800, Math.max(520, nextTotal * 1.9));
    animRef.current = tween(
      duration,
      (p) => setProgress(p),
      () => setDone(true),
    );
  };

  return (
    <div className="mt-[16px]">
      <div className="flex flex-wrap gap-[8px]">
        {content.paths.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => run(p.id)}
            aria-pressed={pathId === p.id}
            className={cn(
              "rounded-button border px-[14px] py-[9px] font-mono text-[12.5px] transition-colors",
              pathId === p.id
                ? "border-teal-ring bg-teal-tint text-teal-ink"
                : "border-line bg-surface-muted text-body hover:border-ink-muted",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-[16px] rounded-[18px] border border-line bg-surface p-[14px]">
        <svg
          viewBox="0 0 680 132"
          className="w-full"
          role="img"
          aria-label={`Timeline of the ${path.kind} invocation phases`}
        >
          <title>{`${path.label}: ${elapsedMs} ms`}</title>
          {/* Track baseline */}
          <line
            x1={TRACK_X0}
            y1={TRACK_Y + BAR_H + 10}
            x2={TRACK_X0 + TRACK_W}
            y2={TRACK_Y + BAR_H + 10}
            stroke="oklch(0.9 0.01 220)"
            strokeWidth={1}
          />

          {segments.map(({ phase, startFrac, endFrac }, i) => {
            const x = TRACK_X0 + startFrac * TRACK_W;
            const w = (endFrac - startFrac) * TRACK_W;
            const c = svgFor(phase.tone);
            const reached = progress >= endFrac - 0.001;
            const isActive = i === activeIndex && !done;
            return (
              <g key={phase.id}>
                <rect
                  x={x + 2}
                  y={TRACK_Y}
                  width={Math.max(0, w - 4)}
                  height={BAR_H}
                  rx={9}
                  fill={c.fill}
                  stroke={c.stroke}
                  strokeWidth={isActive ? 2.4 : 1.4}
                  opacity={reached || isActive || progress === 0 ? 1 : 0.5}
                  style={{ transition: "opacity .2s ease" }}
                />
                <text
                  x={x + w / 2}
                  y={TRACK_Y + 22}
                  textAnchor="middle"
                  fontSize={w < 70 ? 9.5 : 11}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill={c.ink}
                >
                  {phase.label}
                </text>
                <text
                  x={x + w / 2}
                  y={TRACK_Y + 38}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fill="oklch(0.5 0.02 230)"
                >
                  {phase.ms} ms
                </text>
              </g>
            );
          })}

          {/* Playhead */}
          <line
            x1={playX}
            y1={TRACK_Y - 12}
            x2={playX}
            y2={TRACK_Y + BAR_H + 10}
            stroke="oklch(0.45 0.09 195)"
            strokeWidth={2}
          />
          <circle
            cx={playX}
            cy={TRACK_Y - 12}
            r={5}
            fill="#fff"
            stroke="oklch(0.45 0.09 195)"
            strokeWidth={2.5}
          />
          <text
            x={TRACK_X0}
            y={26}
            fontSize={11}
            fontWeight={700}
            fontFamily="var(--font-mono)"
            fill="oklch(0.4 0.02 230)"
          >
            elapsed {elapsedMs} ms
          </text>
        </svg>
      </div>

      <div
        key={`${pathId}-${done}`}
        className={cn(
          "mt-[16px] rounded-[14px] border-[1.5px] p-[16px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
          path.kind === "cold" ? TONE.init.frame : TONE.invoke.frame,
        )}
      >
        <div className="flex flex-wrap items-center gap-[10px]">
          <span
            className={cn(
              "rounded-full px-[11px] py-[4px] font-mono text-[11px] font-semibold",
              path.kind === "cold" ? TONE.init.chip : TONE.invoke.chip,
            )}
          >
            Total {total} ms
          </span>
          {path.kind === "cold" ? (
            <span className="font-mono text-[11.5px] text-ink-muted">
              Init phase is {initMs} ms of it · about{" "}
              {warmTotal > 0 ? Math.round(total / warmTotal) : 0}x the warm
              latency
            </span>
          ) : (
            <span className="font-mono text-[11.5px] text-ink-muted">
              no Init phase: the handler runs immediately
            </span>
          )}
        </div>
        <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
          {path.verdict}
        </p>
      </div>

      <div className="mt-[14px] rounded-[14px] border border-line bg-surface-muted px-[16px] py-[13px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          Between requests
        </p>
        <p className="mt-[6px] text-[13.5px] leading-[1.6] text-body">
          {content.freezeNote}
        </p>
      </div>

      <div
        className={cn(
          "mt-[14px] rounded-[14px] border-[1.5px] p-[16px]",
          TONE.invoke.frame,
        )}
      >
        <p
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.06em]",
            TONE.invoke.text,
          )}
        >
          {content.mitigation.name}
        </p>
        <p className="mt-[6px] text-[13.5px] leading-[1.6] text-body">
          {content.mitigation.body}
        </p>
      </div>
    </div>
  );
}
