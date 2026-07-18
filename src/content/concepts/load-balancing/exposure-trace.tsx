"use client";

import {
  CheckIcon as Check,
  ProhibitIcon as Prohibit,
} from "@phosphor-icons/react/dist/ssr";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, roundedPathD, tween } from "./anim";
import type { ExposureContent, ExposureFlow } from "./data";
import { TONE, TONE_SVG } from "./tones";

interface Pt {
  x: number;
  y: number;
}

/** Fixed, provider-agnostic diagram geometry; content fills in the labels. */
const GEO: Record<ExposureFlow["kind"], { points: Pt[]; end: Pt }> = {
  "via-lb": {
    points: [
      { x: 112, y: 130 },
      { x: 176, y: 130 },
      { x: 286, y: 130 },
      { x: 466, y: 88 },
    ],
    end: { x: 466, y: 88 },
  },
  direct: {
    points: [
      { x: 112, y: 130 },
      { x: 112, y: 224 },
      { x: 356, y: 224 },
    ],
    end: { x: 356, y: 224 },
  },
};

/**
 * Chapter 4: the exposure pattern. The balancer takes the public address in the
 * public zone; the servers keep private addresses in the private zone. Trace a
 * request through the balancer and it reaches the app; try to reach a server
 * directly from the internet and it is blocked at the private boundary.
 */
export function ExposureTrace({ content }: { content: ExposureContent }) {
  const [flowId, setFlowId] = useState<string | null>(null);
  const [dot, setDot] = useState<Pt | null>(null);
  const [done, setDone] = useState(false);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const anim = useRef<{ cancel: () => void } | null>(null);

  const flow = content.flows.find((f) => f.id === flowId) ?? null;

  const run = useCallback((f: ExposureFlow) => {
    anim.current?.cancel();
    setFlowId(f.id);
    setDone(false);
    const pathEl = pathRefs.current[f.kind];
    if (!pathEl) return;
    const len = pathEl.getTotalLength();
    setDot(pathEl.getPointAtLength(0));
    if (prefersReducedMotion()) {
      setDot(pathEl.getPointAtLength(len));
      setDone(true);
      return;
    }
    anim.current = tween(
      f.kind === "direct" ? 620 : 900,
      (p) => setDot(pathEl.getPointAtLength(len * p)),
      () => setDone(true),
    );
  }, []);

  useEffect(() => () => anim.current?.cancel(), []);

  const endTone = flow
    ? flow.allowed
      ? TONE_SVG.healthy
      : TONE_SVG.down
    : null;

  return (
    <div className="mt-[16px]">
      <div className="rounded-[18px] border border-line bg-surface p-[18px]">
        <svg
          viewBox="0 0 636 256"
          className="w-full"
          role="img"
          aria-label="A load balancer in a public zone forwarding to servers in a private zone, with a direct attempt from the internet blocked at the private boundary."
        >
          <title>Public balancer, private servers</title>

          {/* Zones */}
          <Zone
            x={156}
            y={56}
            w={150}
            h={126}
            label={content.publicZoneLabel}
            sub={content.publicZoneSub}
            tone="public"
          />
          <Zone
            x={356}
            y={24}
            w={256}
            h={212}
            label={content.privateZoneLabel}
            sub={content.privateZoneSub}
            tone="private"
          />

          {/* Static wires */}
          {content.flows.map((f) => {
            const active = f.id === flowId;
            return (
              <path
                key={f.id}
                ref={(el) => {
                  pathRefs.current[f.kind] = el;
                }}
                d={roundedPathD(GEO[f.kind].points, 16)}
                fill="none"
                stroke={
                  active
                    ? f.allowed
                      ? TONE_SVG.healthy.stroke
                      : TONE_SVG.down.stroke
                    : "oklch(0.85 0.02 230)"
                }
                strokeWidth={active ? 2.5 : 1.5}
                strokeDasharray={f.kind === "direct" ? "6 5" : undefined}
                className="motion-safe:transition-all"
              />
            );
          })}

          {/* Internet node */}
          <Node
            x={16}
            y={104}
            w={96}
            h={52}
            title="Internet"
            sub="a user"
            tone="client"
          />

          {/* Load balancer node */}
          <Node
            x={176}
            y={104}
            w={110}
            h={52}
            title={content.lbLabel}
            sub={content.lbSub}
            tone="lb"
          />

          {/* Instances */}
          {content.instances.map((inst, i) => (
            <Node
              key={inst.id}
              x={466}
              y={64 + i * 84}
              w={146}
              h={48}
              title={inst.name}
              sub={inst.sub}
              tone="private"
            />
          ))}

          {/* Moving dot */}
          {dot && flow ? (
            <circle
              cx={dot.x}
              cy={dot.y}
              r={6}
              fill={flow.allowed ? TONE_SVG.lb.stroke : TONE_SVG.down.stroke}
              stroke="#fff"
              strokeWidth={2}
            />
          ) : null}

          {/* End marker */}
          {done && flow && endTone ? (
            <g
              transform={`translate(${GEO[flow.kind].end.x}, ${GEO[flow.kind].end.y})`}
            >
              <circle
                r={12}
                fill={endTone.fill}
                stroke={endTone.stroke}
                strokeWidth={1.5}
              />
            </g>
          ) : null}
        </svg>

        {done && flow ? (
          <div className="mt-[6px] flex justify-center">
            <span
              className={cn(
                "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[14px] py-[5px] font-mono text-[12.5px] font-semibold",
                flow.allowed
                  ? cn(TONE.healthy.frame, TONE.healthy.text)
                  : cn(TONE.down.frame, TONE.down.text),
              )}
            >
              {flow.allowed ? (
                <Check size={14} weight="bold" aria-hidden />
              ) : (
                <Prohibit size={14} weight="bold" aria-hidden />
              )}
              {flow.verdictTitle}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-[14px] flex flex-wrap gap-[10px]">
        {content.flows.map((f) => {
          const active = f.id === flowId;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => run(f)}
              className={cn(
                "rounded-button border px-[14px] py-[9px] font-mono text-[12.5px] transition-colors",
                active
                  ? "border-teal-ring bg-teal-tint text-teal-ink"
                  : "border-line bg-surface text-ink-soft hover:border-ink-muted",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className={cn(
          "mt-[14px] min-h-[84px] rounded-[14px] border-[1.5px] p-[15px]",
          flow
            ? flow.allowed
              ? TONE.healthy.frame
              : TONE.down.frame
            : "border-dashed border-line bg-surface",
        )}
      >
        {flow ? (
          <>
            <p
              className={cn(
                "text-[14px] font-semibold",
                flow.allowed ? TONE.healthy.text : TONE.down.text,
              )}
            >
              {flow.verdictTitle}
            </p>
            <p className="mt-[5px] text-pretty text-[13.5px] leading-[1.6] text-body">
              {flow.why}
            </p>
          </>
        ) : (
          <p className="text-[13.5px] leading-[1.6] text-ink-muted">
            Pick a path above to trace it through the network.
          </p>
        )}
      </div>

      <p className="mt-[12px] font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.subnetNote}
      </p>
    </div>
  );
}

function Zone({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  tone: "public" | "private";
}) {
  const t = TONE_SVG[tone];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={t.fill}
        stroke={t.stroke}
        strokeWidth={1.5}
        strokeDasharray="5 4"
        opacity={0.9}
      />
      <text
        x={x + 12}
        y={y + 18}
        fill={t.ink}
        fontSize={11}
        fontFamily="monospace"
        fontWeight={600}
      >
        {label}
      </text>
      <text
        x={x + 12}
        y={y + 32}
        fill={t.ink}
        fontSize={9.5}
        fontFamily="monospace"
        opacity={0.85}
      >
        {sub}
      </text>
    </g>
  );
}

function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  tone: "client" | "lb" | "private";
}) {
  const t = TONE_SVG[tone];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill="#fff"
        stroke={t.stroke}
        strokeWidth={1.5}
      />
      <text
        x={x + 12}
        y={y + 22}
        fill={t.ink}
        fontSize={12}
        fontFamily="ui-sans-serif, system-ui"
        fontWeight={600}
      >
        {title}
      </text>
      <text
        x={x + 12}
        y={y + 38}
        fill="oklch(0.5 0.02 230)"
        fontSize={9.5}
        fontFamily="monospace"
      >
        {sub}
      </text>
    </g>
  );
}
