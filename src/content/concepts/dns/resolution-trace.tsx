"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type Cancelable, pop, roundedPathD, tween } from "./anim";
import type { ResolutionContent, TracePeer } from "./data";
import { TONE, TONE_SVG } from "./tones";

type NodeId = "device" | "resolver" | TracePeer;
type NodeTone = "query" | "root" | "tld" | "auth" | "cache";

interface Geom {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Static node geometry. Coordinates never change, so they live at module
 * scope and the animation effect can read them without a closure dependency. */
const GEOM: Record<NodeId, Geom> = {
  device: { x: 12, y: 126, w: 98, h: 52 },
  resolver: { x: 150, y: 118, w: 132, h: 68 },
  root: { x: 330, y: 18, w: 128, h: 54 },
  tld: { x: 330, y: 123, w: 128, h: 54 },
  auth: { x: 330, y: 228, w: 128, h: 54 },
};

const center = (g: Geom) => ({ x: g.x + g.w / 2, y: g.y + g.h / 2 });

const GUIDE = "oklch(0.86 0.012 220)";
const WIRE = "oklch(0.58 0.08 195)";
const INK_MUTED = "oklch(0.55 0.015 230)";

/** Chapter 1: step a recursive resolver down the hierarchy and watch answers return. */
export function ResolutionTrace({ content }: { content: ResolutionContent }) {
  const presentation: {
    id: NodeId;
    title: string;
    sub: string;
    tone: NodeTone;
  }[] = [
    { id: "device", title: "Your device", sub: "stub resolver", tone: "cache" },
    {
      id: "resolver",
      title: "Recursive resolver",
      sub: "does the walk",
      tone: "query",
    },
    { id: "root", title: "Root servers", sub: "the . zone", tone: "root" },
    { id: "tld", title: ".com TLD", sub: "top-level domain", tone: "tld" },
    {
      id: "auth",
      title: content.authLabel,
      sub: content.authZone,
      tone: "auth",
    },
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = content.steps.length - 1;

  const trailRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const markRef = useRef<SVGGElement>(null);
  const animRef = useRef<Cancelable | null>(null);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run the token animation for the current step whenever `active` changes.
  useEffect(() => {
    const step = content.steps[active];
    const trail = trailRef.current;
    const token = tokenRef.current;
    const glow = glowRef.current;
    if (!step || !trail || !token || !glow) return;

    animRef.current?.cancel();
    // The opening ask travels device -> resolver; every other step travels from
    // the resolver out to the peer it is querying (the final answer lands back
    // on the device).
    const a = center(active === 0 ? GEOM.device : GEOM.resolver);
    const b = center(GEOM[step.peer]);
    trail.setAttribute("d", roundedPathD([a, b]));
    const len = trail.getTotalLength();

    markRef.current?.setAttribute("opacity", "0");
    for (const el of [token, glow]) {
      el.setAttribute("cx", String(a.x));
      el.setAttribute("cy", String(a.y));
      el.setAttribute("opacity", "1");
    }

    animRef.current = tween(
      760,
      (p) => {
        const pt = trail.getPointAtLength(p * len);
        for (const el of [token, glow]) {
          el.setAttribute("cx", String(pt.x));
          el.setAttribute("cy", String(pt.y));
        }
      },
      () => {
        for (const el of [token, glow]) el.setAttribute("opacity", "0");
        const mark = markRef.current;
        if (mark) {
          mark.setAttribute("transform", `translate(${b.x} ${b.y})`);
          pop(mark);
        }
      },
    );
    return () => animRef.current?.cancel();
  }, [active, content.steps]);

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing) return;
    if (active >= last) {
      setPlaying(false);
      return;
    }
    playTimer.current = setTimeout(() => setActive((s) => s + 1), 1500);
    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, [playing, active, last]);

  useEffect(
    () => () => {
      animRef.current?.cancel();
      if (playTimer.current) clearTimeout(playTimer.current);
    },
    [],
  );

  const step = content.steps[active];
  const activePeer = step.peer;
  const activeTone =
    presentation.find((n) => n.id === activePeer)?.tone ?? "query";

  const play = () => {
    if (active >= last) setActive(0);
    setPlaying(true);
  };
  const stop = () => setPlaying(false);
  const go = (i: number) => {
    setPlaying(false);
    setActive(Math.max(0, Math.min(last, i)));
  };

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[860px]:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[12px]">
        <svg
          viewBox="0 0 470 300"
          className="w-full"
          role="img"
          aria-label={`Resolution trace for ${content.hostname}: device to recursive resolver to root, top-level domain, and ${content.authLabel}`}
        >
          <defs>
            <filter id="dns-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Guide wires */}
          {(["device", "root", "tld", "auth"] as const).map((id) => {
            const a = center(id === "device" ? GEOM.device : GEOM.resolver);
            const b = center(GEOM[id]);
            const lit = activePeer === id;
            return (
              <line
                key={`wire-${id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={lit ? WIRE : GUIDE}
                strokeWidth={lit ? 2 : 1.5}
                strokeDasharray="5 7"
                strokeLinecap="round"
                opacity={lit ? 0.9 : 0.5}
                style={{ transition: "stroke .3s ease, opacity .3s ease" }}
              />
            );
          })}

          {/* Nodes */}
          {presentation.map((node) => {
            const g = GEOM[node.id];
            const c = TONE_SVG[node.tone];
            const cx = g.x + g.w / 2;
            const lit =
              node.id === activePeer ||
              (node.id === "resolver" && activePeer !== "device") ||
              (node.id === "device" && active === 0);
            return (
              <g
                key={node.id}
                opacity={lit ? 1 : 0.55}
                style={{ transition: "opacity .3s ease" }}
              >
                <rect
                  x={g.x}
                  y={g.y}
                  width={g.w}
                  height={g.h}
                  rx={12}
                  fill={c.fill}
                  stroke={c.stroke}
                  strokeWidth={lit ? 2 : 1.5}
                />
                <text
                  x={cx}
                  y={g.y + g.h / 2 - 3}
                  textAnchor="middle"
                  fontSize={11.5}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill={c.ink}
                >
                  {node.title}
                </text>
                <text
                  x={cx}
                  y={g.y + g.h / 2 + 13}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fill={INK_MUTED}
                >
                  {node.sub}
                </text>
              </g>
            );
          })}

          {/* Animated query token */}
          <path ref={trailRef} fill="none" stroke="none" />
          <circle
            ref={glowRef}
            r={10}
            fill={WIRE}
            opacity={0}
            filter="url(#dns-glow)"
          />
          <circle
            ref={tokenRef}
            r={6}
            fill="#fff"
            stroke={WIRE}
            strokeWidth={3}
            opacity={0}
          />
          <g
            ref={markRef}
            opacity={0}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle
              r={9}
              fill="#fff"
              stroke={TONE_SVG.ok.stroke}
              strokeWidth={3}
            />
            <path
              d="M -3.6 0 L -1 2.6 L 4 -3"
              fill="none"
              stroke={TONE_SVG.ok.stroke}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-[8px]">
          {playing ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted"
            >
              ❚❚ Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={play}
              className="rounded-button bg-primary px-[16px] py-[8px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90"
            >
              {active >= last ? "↺ Replay" : "▶ Play trace"}
            </button>
          )}
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            className="rounded-button border border-line bg-surface px-[12px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted disabled:opacity-40"
          >
            ◂
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === last}
            className="rounded-button border border-line bg-surface px-[12px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted disabled:opacity-40"
          >
            ▸
          </button>
          <span className="ml-auto font-mono text-[11.5px] text-ink-muted">
            hop {active + 1} / {content.steps.length}
          </span>
        </div>

        <div
          key={active}
          className={cn(
            "mt-[14px] rounded-[14px] border-[1.5px] p-[16px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            TONE[activeTone].frame,
          )}
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            Query out
          </div>
          <p className="mt-[4px] font-mono text-[13px] text-ink-strong">
            {step.question}
          </p>
          <div className="mt-[12px] font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            Answer back
          </div>
          <p className="mt-[4px] font-mono text-[13px] text-ink-strong">
            {step.answer}
          </p>
        </div>

        <p className="mt-[12px] text-pretty text-[13.5px] leading-[1.6] text-body">
          {step.caption}
        </p>
      </div>
    </div>
  );
}
