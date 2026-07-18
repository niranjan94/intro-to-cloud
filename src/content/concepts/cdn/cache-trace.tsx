"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  ArrowRightIcon as ArrowRight,
  CheckIcon as Check,
  XIcon as X,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type Cancelable, pop, roundedPathD, tween } from "./anim";
import type { TraceContent, TraceNode, TraceOutcome } from "./data";
import { TONE_SVG } from "./tones";

const GUIDE = "oklch(0.85 0.015 220)";
const TRACE = "oklch(0.55 0.11 195)";
const OUTCOME: Record<TraceOutcome, { color: string; mark: Icon }> = {
  hit: { color: "oklch(0.58 0.12 150)", mark: Check },
  miss: { color: "oklch(0.66 0.12 70)", mark: ArrowRight },
  dynamic: { color: "oklch(0.62 0.17 25)", mark: X },
};

const INK_MUTED = "oklch(0.55 0.015 230)";

const center = (n: TraceNode) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

interface Verdict {
  outcome: TraceOutcome | null;
  title: string;
  body: string;
}

const IDLE: Verdict = {
  outcome: null,
  title: "Ready",
  body: "Send a request above to trace its path through the cache.",
};

function NodeView({ node }: { node: TraceNode }) {
  const c = TONE_SVG[node.tone];
  const cx = node.x + node.w / 2;
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={12}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={node.y + node.h / 2 - 3}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fontFamily="var(--font-mono)"
        fill={c.ink}
      >
        {node.label}
      </text>
      {node.sub ? (
        <text
          x={cx}
          y={node.y + node.h / 2 + 13}
          textAnchor="middle"
          fontSize={9.5}
          fontFamily="var(--font-mono)"
          fill={INK_MUTED}
        >
          {node.sub}
        </text>
      ) : null}
    </g>
  );
}

/** Chapter 2: send a request and watch it hit the edge or fall through to the origin. */
export function CacheTrace({ content }: { content: TraceContent }) {
  const [verdict, setVerdict] = useState<Verdict>(IDLE);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  const guideRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const markRef = useRef<SVGGElement>(null);
  const markCircleRef = useRef<SVGCircleElement>(null);
  const animRef = useRef<Cancelable | null>(null);

  useEffect(() => () => animRef.current?.cancel(), []);

  const nodeById = (id: string) => content.nodes.find((n) => n.id === id);

  const runFlow = (flowId: string) => {
    animRef.current?.cancel();
    const flow = content.flows.find((f) => f.id === flowId);
    const guide = guideRef.current;
    const halo = haloRef.current;
    const trail = trailRef.current;
    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!flow || !guide || !halo || !trail || !dot || !glow) return;

    const points = flow.path
      .map(nodeById)
      .filter((n): n is TraceNode => Boolean(n))
      .map(center);
    if (points.length < 2) return;

    setActiveFlow(flowId);
    const d = roundedPathD(points);
    for (const el of [guide, halo, trail]) el.setAttribute("d", d);
    const len = trail.getTotalLength();

    guide.setAttribute("opacity", "1");
    for (const el of [halo, trail]) {
      el.setAttribute("stroke", TRACE);
      el.setAttribute("stroke-dasharray", String(len));
      el.setAttribute("stroke-dashoffset", String(len));
    }
    halo.setAttribute("opacity", "0.35");
    trail.setAttribute("opacity", "1");
    markRef.current?.setAttribute("opacity", "0");

    const start = points[0];
    for (const el of [dot, glow]) {
      el.setAttribute("cx", String(start.x));
      el.setAttribute("cy", String(start.y));
      el.setAttribute("opacity", "1");
    }

    setVerdict({
      outcome: null,
      title: "tracing the request",
      body: "Following the request from the viewer.",
    });

    const duration = Math.min(2200, Math.max(650, len * 3.4));
    animRef.current = tween(
      duration,
      (p) => {
        const pt = trail.getPointAtLength(p * len);
        for (const el of [dot, glow]) {
          el.setAttribute("cx", String(pt.x));
          el.setAttribute("cy", String(pt.y));
        }
        const offset = String(len * (1 - p));
        halo.setAttribute("stroke-dashoffset", offset);
        trail.setAttribute("stroke-dashoffset", offset);
      },
      () => {
        const style = OUTCOME[flow.outcome];
        halo.setAttribute("stroke", style.color);
        trail.setAttribute("stroke", style.color);
        dot.setAttribute("opacity", "0");
        glow.setAttribute("opacity", "0");
        const terminal = nodeById(flow.terminal);
        if (terminal) {
          const c = center(terminal);
          markRef.current?.setAttribute(
            "transform",
            `translate(${c.x} ${c.y})`,
          );
          markCircleRef.current?.setAttribute("stroke", style.color);
          pop(markRef.current);
        }
        setVerdict({
          outcome: flow.outcome,
          title: flow.title,
          body: flow.body,
        });
      },
    );
  };

  const v = verdict.outcome ? OUTCOME[verdict.outcome] : null;
  const VerdictMark = v?.mark;
  const svgMarkStyle = v ?? OUTCOME.hit;
  const SvgMark = svgMarkStyle.mark;

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[12px]">
        <svg
          viewBox={content.viewBox}
          className="w-full"
          role="img"
          aria-label="Content delivery path from a viewer through an edge cache to the origin"
        >
          <defs>
            <filter id="ct-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Static connectors between adjacent nodes, left to right. */}
          {content.nodes.slice(0, -1).map((node, i) => {
            const a = center(node);
            const b = center(content.nodes[i + 1]);
            return (
              <line
                key={`link-${node.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={GUIDE}
                strokeWidth={2}
                strokeDasharray="4 6"
              />
            );
          })}

          {content.nodes.map((node) => (
            <NodeView key={node.id} node={node} />
          ))}

          <path
            ref={guideRef}
            fill="none"
            stroke={GUIDE}
            strokeWidth={2.5}
            strokeDasharray="5 8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
          />
          <path
            ref={haloRef}
            fill="none"
            stroke={TRACE}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
            filter="url(#ct-glow)"
          />
          <path
            ref={trailRef}
            fill="none"
            stroke={TRACE}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
          />
          <circle
            ref={glowRef}
            r={11}
            fill={TRACE}
            opacity={0}
            filter="url(#ct-glow)"
          />
          <circle
            ref={dotRef}
            r={6.5}
            fill="#fff"
            stroke={TRACE}
            strokeWidth={3}
            opacity={0}
          />
          <g
            ref={markRef}
            opacity={0}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle
              ref={markCircleRef}
              r={15}
              fill="#fff"
              stroke={OUTCOME.hit.color}
              strokeWidth={3}
            />
            <SvgMark
              x={-9}
              y={-9}
              size={18}
              weight="bold"
              color={svgMarkStyle.color}
              aria-hidden
            />
          </g>
        </svg>
      </div>

      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Send a request
        </p>
        <div className="mt-[10px] flex flex-col gap-[8px]">
          {content.flows.map((flow) => (
            <button
              key={flow.id}
              type="button"
              onClick={() => runFlow(flow.id)}
              className={cn(
                "rounded-[10px] border px-[13px] py-[10px] text-left font-mono text-[12.5px] transition-colors",
                activeFlow === flow.id
                  ? "border-teal-ring bg-teal-tint text-teal-ink"
                  : "border-line bg-surface-muted text-body hover:border-ink-muted",
              )}
            >
              {flow.label}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "mt-[16px] min-h-[104px] rounded-[12px] border-[1.5px] p-[14px]",
            v ? "" : "border-dashed border-line bg-surface",
          )}
          style={
            v
              ? {
                  borderColor: v.color,
                  background: `color-mix(in oklab, ${v.color} 8%, #fff)`,
                }
              : undefined
          }
        >
          <div className="flex items-center gap-[8px]">
            <span
              className="h-[11px] w-[11px] rounded-full"
              style={{ background: v ? v.color : "oklch(0.55 0.015 230)" }}
            />
            <span
              className="inline-flex items-center gap-[6px] text-[15px] font-semibold"
              style={{ color: v ? v.color : "var(--color-ink-strong)" }}
            >
              {VerdictMark ? (
                <VerdictMark size={16} weight="bold" aria-hidden />
              ) : null}
              {verdict.title}
            </span>
          </div>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-body">
            {verdict.body}
          </p>
        </div>

        <p className="mt-[14px] text-pretty text-[12.5px] leading-[1.6] text-ink-muted">
          {content.note}
        </p>
      </div>
    </div>
  );
}
