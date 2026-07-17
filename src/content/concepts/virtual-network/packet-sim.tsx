"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type Cancelable, pop, roundedPathD, tween } from "./anim";
import { Switch, Verdict, type VerdictState } from "./controls";
import type { PacketScene, SceneRect } from "./data";
import { TONE_SVG } from "./tones";

const ACCENT = "oklch(0.55 0.11 195)";
const OK = "oklch(0.6 0.13 150)";
const DANGER = "oklch(0.62 0.17 25)";
const GUIDE = "oklch(0.82 0.015 220)";
const INK_MUTED = "oklch(0.55 0.015 230)";

const IDLE: VerdictState = {
  kind: "idle",
  title: "Ready",
  body: "Pick a packet above to trace its path.",
};

/** A single box in the scene, dimmed when its backing resource is toggled off. */
function RectView({ rect, dimmed }: { rect: SceneRect; dimmed: boolean }) {
  const c = TONE_SVG[rect.tone];
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const isNet = rect.tone === "net";
  const centered = Boolean(rect.sub) || rect.w < 200;
  // Narrow boxes (the gateway / public-IP nodes) wrap a two-word label so it
  // never spills outside the box.
  const words = rect.label?.split(" ") ?? [];
  const wrap = centered && !rect.sub && rect.w < 130 && words.length === 2;
  return (
    <g opacity={dimmed ? 0.16 : 1} style={{ transition: "opacity .3s ease" }}>
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        rx={rect.radius ?? 12}
        fill={isNet ? "none" : c.fill}
        stroke={c.stroke}
        strokeWidth={isNet ? 2 : 1.5}
        strokeDasharray={rect.dashed ? "6 5" : undefined}
      />
      {rect.label ? (
        wrap ? (
          <text
            x={cx}
            textAnchor="middle"
            fontSize={10.5}
            fontWeight={700}
            fontFamily="var(--font-mono)"
            fill={c.ink}
          >
            <tspan x={cx} y={cy - 3}>
              {words[0]}
            </tspan>
            <tspan x={cx} y={cy + 11}>
              {words[1]}
            </tspan>
          </text>
        ) : centered ? (
          <text
            x={cx}
            y={rect.sub ? cy - 3 : cy + 4}
            textAnchor="middle"
            fontSize={rect.sub ? 12 : 10.5}
            fontWeight={700}
            fontFamily="var(--font-mono)"
            fill={c.ink}
          >
            {rect.label}
          </text>
        ) : (
          <text
            x={rect.x + 12}
            y={rect.y + 18}
            fontSize={10.5}
            fontWeight={700}
            fontFamily="var(--font-mono)"
            fill={c.ink}
          >
            {rect.label}
          </text>
        )
      ) : null}
      {rect.sub ? (
        <text
          x={cx}
          y={rect.y + rect.h / 2 + 13}
          textAnchor="middle"
          fontSize={9}
          fontFamily="var(--font-mono)"
          fill={INK_MUTED}
        >
          {rect.sub}
        </text>
      ) : null}
    </g>
  );
}

/** Chapter 3: toggle infrastructure on/off, send a packet, watch it route. */
export function PacketSim({ scene }: { scene: PacketScene }) {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(scene.toggles.map((t) => [t.id, t.defaultOn])),
  );
  const [verdict, setVerdict] = useState<VerdictState>(IDLE);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  const guideRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const packetRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const failRef = useRef<SVGGElement>(null);
  const okRef = useRef<SVGCircleElement>(null);
  const animRef = useRef<Cancelable | null>(null);

  useEffect(() => () => animRef.current?.cancel(), []);

  const runFlow = (flowId: string) => {
    animRef.current?.cancel();
    const flow = scene.flows.find((f) => f.id === flowId);
    const guide = guideRef.current;
    const halo = haloRef.current;
    const trail = trailRef.current;
    const packet = packetRef.current;
    const glow = glowRef.current;
    if (!flow || !guide || !halo || !trail || !packet || !glow) return;

    const result = flow.run(toggles);
    const points = result.path
      .map((name) => scene.waypoints[name])
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    if (points.length < 2) return;

    setActiveFlow(flowId);
    const d = roundedPathD(points);
    for (const el of [guide, halo, trail]) el.setAttribute("d", d);
    const len = trail.getTotalLength();

    guide.setAttribute("opacity", "1");
    for (const el of [halo, trail]) {
      el.setAttribute("stroke", ACCENT);
      el.setAttribute("stroke-dasharray", String(len));
      el.setAttribute("stroke-dashoffset", String(len));
    }
    halo.setAttribute("opacity", "0.4");
    trail.setAttribute("opacity", "1");
    failRef.current?.setAttribute("opacity", "0");
    okRef.current?.setAttribute("opacity", "0");

    const start = points[0];
    for (const el of [packet, glow]) {
      el.setAttribute("cx", String(start.x));
      el.setAttribute("cy", String(start.y));
      el.setAttribute("opacity", "1");
    }

    setVerdict({
      kind: "pending",
      title: "tracing the packet",
      body: "Following the route the packet is allowed to take.",
    });

    const duration = Math.min(2200, Math.max(650, len * 3.1));
    animRef.current = tween(
      duration,
      (p) => {
        const pt = trail.getPointAtLength(p * len);
        for (const el of [packet, glow]) {
          el.setAttribute("cx", String(pt.x));
          el.setAttribute("cy", String(pt.y));
        }
        const offset = String(len * (1 - p));
        halo.setAttribute("stroke-dashoffset", offset);
        trail.setAttribute("stroke-dashoffset", offset);
      },
      () => {
        const color = result.ok ? OK : DANGER;
        halo.setAttribute("stroke", color);
        trail.setAttribute("stroke", color);
        packet.setAttribute("opacity", "0");
        glow.setAttribute("opacity", "0");
        const end = points[points.length - 1];
        const marker = result.ok ? okRef.current : failRef.current;
        marker?.setAttribute("transform", `translate(${end.x} ${end.y})`);
        pop(marker);
        setVerdict({
          kind: result.ok ? "pass" : "fail",
          title: result.title,
          body: result.body,
        });
      },
    );
  };

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[12px]">
        <svg
          viewBox={scene.viewBox}
          className="w-full"
          role="img"
          aria-label="Network scene showing a packet routing between subnets and the internet"
        >
          <defs>
            <filter id="pk-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {scene.rects.map((rect) => (
            <RectView
              key={`${rect.label ?? "r"}-${rect.x}-${rect.y}`}
              rect={rect}
              dimmed={Boolean(rect.toggle && !toggles[rect.toggle])}
            />
          ))}

          <path
            ref={guideRef}
            className="animate-net-dash"
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
            stroke={ACCENT}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
            filter="url(#pk-glow)"
          />
          <path
            ref={trailRef}
            fill="none"
            stroke={ACCENT}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
          />
          <circle
            ref={glowRef}
            r={11}
            fill={ACCENT}
            opacity={0}
            filter="url(#pk-glow)"
          />
          <circle
            ref={packetRef}
            r={6.5}
            fill="#fff"
            stroke={ACCENT}
            strokeWidth={3}
            opacity={0}
          />
          <g
            ref={failRef}
            opacity={0}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle r={15} fill="#fff" stroke={DANGER} strokeWidth={3} />
            <line
              x1={-7}
              y1={-7}
              x2={7}
              y2={7}
              stroke={DANGER}
              strokeWidth={3}
            />
            <line
              x1={-7}
              y1={7}
              x2={7}
              y2={-7}
              stroke={DANGER}
              strokeWidth={3}
            />
          </g>
          <circle
            ref={okRef}
            r={15}
            fill="none"
            stroke={OK}
            strokeWidth={3.5}
            opacity={0}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        </svg>
      </div>

      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Infrastructure present
        </p>
        <div className="mt-[10px] flex flex-col gap-[12px]">
          {scene.toggles.map((t) => (
            <Switch
              key={t.id}
              checked={toggles[t.id]}
              onChange={(v) => setToggles((prev) => ({ ...prev, [t.id]: v }))}
              label={t.label}
            />
          ))}
        </div>

        <p className="mt-[18px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Send a packet
        </p>
        <div className="mt-[10px] flex flex-col gap-[8px]">
          {scene.flows.map((flow) => (
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

        <Verdict state={verdict} />
      </div>
    </div>
  );
}
