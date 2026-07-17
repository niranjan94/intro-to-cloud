"use client";

import { useEffect, useRef, useState } from "react";
import { type Cancelable, pop, prefersReducedMotion, tween } from "./anim";
import { Switch, Verdict, type VerdictState } from "./controls";
import type { FirewallModel, Gate } from "./data";
import { TONE_SVG } from "./tones";

const ACCENT = "oklch(0.55 0.11 195)";
const OK = "oklch(0.6 0.13 150)";
const DANGER = "oklch(0.62 0.17 25)";
const GUIDE = "oklch(0.82 0.015 220)";
const INK_MUTED = "oklch(0.55 0.015 230)";

const ORIGIN_X = 40;
const VM_X = 470;
const IN_Y = 160;
const OUT_Y = 174;

const IDLE: VerdictState = {
  kind: "idle",
  title: "Ready",
  body: "Flip the rules, then send a request and watch each firewall.",
};

/** Collect the toggles a gate contributes: its inbound rule and any reply rule. */
function gateToggles(
  gates: Gate[],
): { id: string; label: string; hint?: string; defaultOn: boolean }[] {
  const out: {
    id: string;
    label: string;
    hint?: string;
    defaultOn: boolean;
  }[] = [];
  for (const g of gates) {
    out.push({ id: g.toggleId, label: g.toggleLabel, defaultOn: g.defaultOn });
    if (g.replyToggle)
      out.push({
        id: g.replyToggle.id,
        label: g.replyToggle.label,
        hint: g.replyToggle.hint,
        defaultOn: g.replyToggle.defaultOn,
      });
  }
  return out;
}

/** Chapter 4: trace a request and its reply through each firewall in the path. */
export function FirewallTrace({ model }: { model: FirewallModel }) {
  const controls = gateToggles(model.gates);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(controls.map((c) => [c.id, c.defaultOn])),
  );
  const [verdict, setVerdict] = useState<VerdictState>(IDLE);
  const [running, setRunning] = useState(false);

  const packetRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const inTrailRef = useRef<SVGLineElement>(null);
  const outTrailRef = useRef<SVGLineElement>(null);
  const failRef = useRef<SVGGElement>(null);
  const animRef = useRef<Cancelable | null>(null);
  const cancelledRef = useRef(false);

  useEffect(
    () => () => {
      cancelledRef.current = true;
      animRef.current?.cancel();
    },
    [],
  );

  const moveTo = (
    fromX: number,
    toX: number,
    laneY: number,
    trail: SVGLineElement,
  ) =>
    new Promise<void>((resolve) => {
      const packet = packetRef.current;
      const glow = glowRef.current;
      const dur = Math.min(900, Math.max(260, Math.abs(toX - fromX) * 2.4));
      animRef.current = tween(
        dur,
        (p) => {
          const cx = fromX + (toX - fromX) * p;
          for (const el of [packet, glow]) {
            el?.setAttribute("cx", String(cx));
            el?.setAttribute("cy", String(laneY));
          }
          trail.setAttribute("x2", String(cx));
        },
        resolve,
      );
    });

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      animRef.current = tween(ms, () => {}, resolve);
    });

  const blockAt = (x: number, laneY: number, title: string, body: string) => {
    packetRef.current?.setAttribute("fill", DANGER);
    glowRef.current?.setAttribute("opacity", "0");
    const g = failRef.current;
    g?.setAttribute("transform", `translate(${x} ${laneY})`);
    pop(g);
    setVerdict({ kind: "fail", title, body });
    setRunning(false);
  };

  const runTrace = async () => {
    animRef.current?.cancel();
    cancelledRef.current = false;
    setRunning(true);

    const packet = packetRef.current;
    const glow = glowRef.current;
    const inTrail = inTrailRef.current;
    const outTrail = outTrailRef.current;
    if (!packet || !glow || !inTrail || !outTrail) return;

    // Reset both lanes and place the packet at the start of the inbound lane.
    for (const t of [inTrail, outTrail]) {
      t.setAttribute("stroke", ACCENT);
    }
    inTrail.setAttribute("x1", String(ORIGIN_X));
    inTrail.setAttribute("x2", String(ORIGIN_X));
    outTrail.setAttribute("x1", String(VM_X));
    outTrail.setAttribute("x2", String(VM_X));
    failRef.current?.setAttribute("opacity", "0");
    packet.setAttribute("fill", "#fff");
    packet.setAttribute("stroke", ACCENT);
    glow.setAttribute("fill", ACCENT);
    for (const el of [packet, glow]) {
      el.setAttribute("cy", String(IN_Y));
      el.setAttribute("cx", String(ORIGIN_X));
      el.setAttribute("opacity", "1");
    }
    glow.setAttribute("opacity", "0.85");
    setVerdict({
      kind: "pending",
      title: "tracing the request",
      body: "A request is heading in on port 80.",
    });

    const guard = () => cancelledRef.current;

    // Inbound: subnet gate first, then NIC gate.
    let x = ORIGIN_X;
    for (const gate of model.gates) {
      await moveTo(x, gate.x, IN_Y, inTrail);
      if (guard()) return;
      x = gate.x;
      if (!toggles[gate.toggleId]) {
        inTrail.setAttribute("stroke", DANGER);
        blockAt(gate.x, IN_Y, gate.failInTitle, gate.failInBody);
        return;
      }
    }
    await moveTo(x, VM_X, IN_Y, inTrail);
    if (guard()) return;
    inTrail.setAttribute("stroke", OK);

    setVerdict({
      kind: "pending",
      title: "request arrived, now the reply",
      body: "The instance answers; the reply heads back out on the lower lane.",
    });
    await delay(prefersReducedMotion() ? 0 : 420);
    if (guard()) return;

    // Reply: back out through the gates in reverse.
    for (const el of [packet, glow]) {
      el.setAttribute("cy", String(OUT_Y));
      el.setAttribute("cx", String(VM_X));
    }
    glow.setAttribute("opacity", "0.85");
    let ox = VM_X;
    for (const gate of [...model.gates].reverse()) {
      await moveTo(ox, gate.x, OUT_Y, outTrail);
      if (guard()) return;
      ox = gate.x;
      if (!gate.stateful && gate.replyToggle && !toggles[gate.replyToggle.id]) {
        outTrail.setAttribute("stroke", DANGER);
        blockAt(
          gate.x,
          OUT_Y,
          gate.replyToggle.failTitle,
          gate.replyToggle.failBody,
        );
        return;
      }
    }
    await moveTo(ox, ORIGIN_X, OUT_Y, outTrail);
    if (guard()) return;
    outTrail.setAttribute("stroke", OK);
    for (const el of [packet, glow]) el.setAttribute("opacity", "0");
    setVerdict({ kind: "pass", title: model.passTitle, body: model.passBody });
    setRunning(false);
  };

  const subnetGate = model.gates.find((g) => g.level === "subnet");
  const nicGate = model.gates.find((g) => g.level === "nic");

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[12px]">
        <svg
          viewBox="0 0 640 300"
          className="w-full"
          role="img"
          aria-label="A packet crossing the subnet firewall then the instance's network card"
        >
          <defs>
            <filter id="fw-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <text
            x={40}
            y={36}
            fontSize={10.5}
            fontFamily="var(--font-mono)"
            fill={INK_MUTED}
          >
            from internet
          </text>

          {/* Subnet-level firewall boundary */}
          <rect
            x={150}
            y={20}
            width={470}
            height={260}
            rx={12}
            fill={TONE_SVG.private.fill}
            stroke={TONE_SVG.firewall.stroke}
            strokeWidth={2}
            strokeDasharray="7 6"
          />
          {subnetGate ? (
            <>
              <rect
                x={150}
                y={20}
                width={188}
                height={22}
                rx={4}
                fill={TONE_SVG.firewall.stroke}
              />
              <text
                x={160}
                y={35}
                fontSize={10.5}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill="#fff"
              >
                {subnetGate.diagLabel}
              </text>
              <text
                x={160}
                y={58}
                fontSize={9.5}
                fontFamily="var(--font-mono)"
                fill={TONE_SVG.firewall.ink}
              >
                {subnetGate.sublabel}
              </text>
            </>
          ) : null}

          {/* The VM with its NIC and NIC-level firewall */}
          <rect
            x={360}
            y={90}
            width={220}
            height={150}
            rx={10}
            fill="#fff"
            stroke={TONE_SVG.resource.stroke}
            strokeWidth={1.5}
          />
          <text
            x={470}
            y={116}
            textAnchor="middle"
            fontSize={12.5}
            fontWeight={700}
            fontFamily="var(--font-mono)"
            fill={TONE_SVG.resource.ink}
          >
            {model.vmLabel}
          </text>
          <rect
            x={380}
            y={132}
            width={180}
            height={34}
            rx={6}
            fill={TONE_SVG.private.fill}
            stroke={TONE_SVG.private.stroke}
            strokeWidth={1.5}
          />
          <text
            x={470}
            y={153}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fontFamily="var(--font-mono)"
            fill={TONE_SVG.private.ink}
          >
            NIC (network card)
          </text>
          {nicGate ? (
            <>
              <rect
                x={380}
                y={178}
                width={180}
                height={44}
                rx={6}
                fill={TONE_SVG.firewall.fill}
                stroke={TONE_SVG.firewall.stroke}
                strokeWidth={2}
              />
              <text
                x={470}
                y={197}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={TONE_SVG.firewall.ink}
              >
                {nicGate.diagLabel}
              </text>
              <text
                x={470}
                y={211}
                textAnchor="middle"
                fontSize={8.5}
                fontFamily="var(--font-mono)"
                fill={TONE_SVG.firewall.ink}
              >
                {nicGate.sublabel}
              </text>
            </>
          ) : null}

          {/* Lane guides + labels */}
          <line
            x1={ORIGIN_X}
            y1={IN_Y}
            x2={VM_X}
            y2={IN_Y}
            stroke={GUIDE}
            strokeWidth={2}
            strokeDasharray="5 8"
            className="animate-net-dash"
          />
          <line
            x1={ORIGIN_X}
            y1={OUT_Y}
            x2={VM_X}
            y2={OUT_Y}
            stroke={GUIDE}
            strokeWidth={2}
            strokeDasharray="5 8"
            className="animate-net-dash"
          />
          <text
            x={ORIGIN_X}
            y={IN_Y - 9}
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill={INK_MUTED}
          >
            request in →
          </text>
          <text
            x={ORIGIN_X}
            y={OUT_Y + 16}
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill={INK_MUTED}
          >
            ← reply out
          </text>

          {/* Trails (drawn as the packet advances) */}
          <line
            ref={inTrailRef}
            x1={ORIGIN_X}
            y1={IN_Y}
            x2={ORIGIN_X}
            y2={IN_Y}
            stroke={ACCENT}
            strokeWidth={3.5}
            strokeLinecap="round"
            filter="url(#fw-glow)"
          />
          <line
            ref={outTrailRef}
            x1={VM_X}
            y1={OUT_Y}
            x2={VM_X}
            y2={OUT_Y}
            stroke={ACCENT}
            strokeWidth={3.5}
            strokeLinecap="round"
            filter="url(#fw-glow)"
          />

          {/* Gate lines */}
          {model.gates.map((gate) => (
            <line
              key={gate.toggleId}
              x1={gate.x}
              y1={gate.level === "subnet" ? 90 : 128}
              x2={gate.x}
              y2={gate.level === "subnet" ? 240 : 232}
              stroke={TONE_SVG.firewall.stroke}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}

          <circle
            ref={glowRef}
            r={11}
            fill={ACCENT}
            opacity={0}
            filter="url(#fw-glow)"
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
            <circle r={14} fill="#fff" stroke={DANGER} strokeWidth={3} />
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
        </svg>
      </div>

      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Rules right now
        </p>
        <div className="mt-[10px] flex flex-col gap-[12px]">
          {controls.map((c) => (
            <Switch
              key={c.id}
              checked={toggles[c.id]}
              onChange={(v) => setToggles((prev) => ({ ...prev, [c.id]: v }))}
              label={c.label}
              hint={c.hint}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={runTrace}
          disabled={running}
          className="mt-[16px] w-full rounded-[10px] bg-primary px-[14px] py-[11px] font-mono text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Send request + reply
        </button>

        <Verdict state={verdict} />
      </div>
    </div>
  );
}
