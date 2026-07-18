"use client";

import { PaperPlaneRightIcon as PaperPlaneRight } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { type Cancelable, tween } from "@/components/lesson/anim";
import {
  Switch,
  Verdict,
  type VerdictState,
} from "@/components/lesson/controls";
import { TONE_SVG } from "@/components/lesson/tones";
import { cn } from "@/lib/utils";
import type { FlowContent } from "./data";

const W = 640;
const H = 150;
const RW = 128;
const RH = 62;
const CY = 74;
const REQ_COLOR = "oklch(0.5 0.085 195)";
const RES_COLOR = "oklch(0.58 0.12 150)";
const OK_COLOR = "oklch(0.58 0.12 150)";
const FAIL_COLOR = "oklch(0.62 0.17 25)";

/**
 * Chapter 1: the request-path simulator. A request token travels from the
 * browser toward nginx and stops at the first closed gate. Two toggles model
 * the two things that must be true for the page to load: the server has a
 * public front door, and the firewall allows port 80 inbound.
 *
 * The token is animated imperatively through a ref (setAttribute in the tween
 * loop), the same pattern the network packet simulator uses. Its JSX props are
 * constant so React never re-applies them after mount, which keeps the
 * animation smooth under the React Compiler rather than coalescing per-frame
 * state updates into a single jump.
 */
export function RequestFlow({ flow }: { flow: FlowContent }) {
  const n = flow.stages.length;
  const step = W / n;
  const centers = flow.stages.map((_, i) => step * i + step / 2);

  const [reachOn, setReachOn] = useState(flow.reach.defaultOn);
  const [fwOn, setFwOn] = useState(flow.firewall.defaultOn);
  const [marks, setMarks] = useState<Record<number, "pass" | "fail">>({});
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState<VerdictState>({
    kind: "idle",
    title: "Ready when you are",
    body: "Set the two gates below, then send a request and watch where it gets to.",
  });

  const tokenRef = useRef<SVGCircleElement>(null);
  const trailRef = useRef<SVGLineElement>(null);
  const animRef = useRef<Cancelable | null>(null);
  // Cancel any in-flight animation on unmount. tween.cancel() prevents a
  // cancelled tween from ever calling its onDone, so no extra "is mounted"
  // guard is needed (and one would misfire under React Strict Mode).
  useEffect(() => () => animRef.current?.cancel(), []);

  const placeToken = (x: number, opacity: number, kind: "req" | "res") => {
    const el = tokenRef.current;
    if (!el) return;
    el.setAttribute("cx", String(x));
    el.setAttribute("opacity", String(opacity));
    el.setAttribute("fill", kind === "req" ? REQ_COLOR : RES_COLOR);
  };

  const setTrail = (x2: number, color?: string, opacity?: number) => {
    const el = trailRef.current;
    if (!el) return;
    el.setAttribute("x2", String(x2));
    if (color) el.setAttribute("stroke", color);
    if (opacity !== undefined) el.setAttribute("opacity", String(opacity));
  };

  const travel = (
    from: number,
    to: number,
    kind: "req" | "res",
    growTrail: boolean,
    done: () => void,
  ) => {
    const dur = 240 + Math.abs(to - from) * 1.1;
    animRef.current = tween(
      dur,
      (p) => {
        const x = from + (to - from) * p;
        placeToken(x, 1, kind);
        if (growTrail) setTrail(x);
      },
      done,
    );
  };

  const send = () => {
    animRef.current?.cancel();
    setMarks({});
    setRunning(true);
    placeToken(centers[0], 1, "req");
    setTrail(centers[0], REQ_COLOR, 1);
    setVerdict({
      kind: "pending",
      title: "Request in flight",
      body: "Following the request from the browser toward nginx.",
    });

    const blocked = !reachOn ? flow.reach : !fwOn ? flow.firewall : null;
    const target = blocked ? blocked.stage : flow.serverStage;

    travel(centers[0], centers[target], "req", true, () => {
      if (blocked) {
        placeToken(centers[target], 0, "req");
        setTrail(centers[target], FAIL_COLOR);
        setMarks({ [target]: "fail" });
        setVerdict({
          kind: "fail",
          title: blocked.failTitle,
          body: blocked.failBody,
        });
        setRunning(false);
        return;
      }
      setTrail(centers[flow.serverStage], OK_COLOR);
      setMarks({ [flow.serverStage]: "pass" });
      travel(centers[flow.serverStage], centers[0], "res", false, () => {
        placeToken(centers[0], 0, "res");
        setVerdict({
          kind: "pass",
          title: flow.passTitle,
          body: flow.passBody,
        });
        setRunning(false);
      });
    });
  };

  const stageClosed = (i: number) =>
    (i === flow.reach.stage && !reachOn) ||
    (i === flow.firewall.stage && !fwOn);

  return (
    <div className="mt-[20px]">
      <div className="rounded-[16px] border border-line bg-surface-muted p-[14px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="A request travelling from a browser through the gateway and firewall to nginx"
        >
          <line
            x1={centers[0]}
            y1={CY}
            x2={centers[n - 1]}
            y2={CY}
            stroke="oklch(0.85 0.01 230)"
            strokeWidth={2}
          />
          <line
            ref={trailRef}
            x1={centers[0]}
            y1={CY}
            x2={centers[0]}
            y2={CY}
            stroke={REQ_COLOR}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0}
          />
          {flow.stages.map((stage, i) => {
            const tone = TONE_SVG[stage.tone];
            const closed = stageClosed(i);
            const x = centers[i] - RW / 2;
            const y = CY - RH / 2;
            const mark = marks[i];
            return (
              <g key={stage.id}>
                <rect
                  x={x}
                  y={y}
                  width={RW}
                  height={RH}
                  rx={12}
                  fill={closed ? "oklch(0.97 0.02 25)" : tone.fill}
                  stroke={closed ? "oklch(0.62 0.16 25)" : tone.stroke}
                  strokeWidth={1.6}
                  strokeDasharray={closed ? "5 4" : undefined}
                  opacity={closed ? 0.85 : 1}
                />
                <text
                  x={centers[i]}
                  y={CY - 8}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill={closed ? "oklch(0.53 0.16 25)" : tone.ink}
                >
                  {stage.label}
                </text>
                {stage.sub ? (
                  <text
                    x={centers[i]}
                    y={CY + 10}
                    textAnchor="middle"
                    fontSize={9.5}
                    fill={
                      closed ? "oklch(0.53 0.16 25)" : "oklch(0.5 0.02 240)"
                    }
                  >
                    {closed ? "closed" : stage.sub}
                  </text>
                ) : null}
                {mark ? (
                  <g
                    className="motion-safe:animate-[fadeUp_0.3s_ease_both]"
                    transform={`translate(${centers[i] + RW / 2 - 12}, ${y - 2})`}
                  >
                    <circle
                      r={10}
                      fill={
                        mark === "pass"
                          ? "oklch(0.58 0.12 150)"
                          : "oklch(0.62 0.17 25)"
                      }
                    />
                    <text
                      textAnchor="middle"
                      y={4}
                      fontSize={12}
                      fontWeight={700}
                      fill="#fff"
                    >
                      {mark === "pass" ? "✓" : "✕"}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          <circle
            ref={tokenRef}
            cx={centers[0]}
            cy={CY}
            r={9}
            fill={REQ_COLOR}
            stroke="#fff"
            strokeWidth={2}
            opacity={0}
          />
        </svg>
      </div>

      <div className="mt-[16px] flex flex-wrap items-center gap-x-[22px] gap-y-[12px]">
        <Switch
          checked={reachOn}
          onChange={setReachOn}
          label={flow.reach.label}
        />
        <Switch checked={fwOn} onChange={setFwOn} label={flow.firewall.label} />
        <button
          type="button"
          onClick={send}
          disabled={running}
          className={cn(
            "inline-flex items-center gap-[7px] rounded-button bg-primary px-[16px] py-[8px] font-mono text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90",
            running && "opacity-50",
          )}
        >
          <PaperPlaneRight size={14} weight="bold" aria-hidden />
          Send request
        </button>
      </div>

      <Verdict state={verdict} />
    </div>
  );
}
