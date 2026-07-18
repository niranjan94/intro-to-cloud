"use client";

import {
  CheckIcon as Check,
  LockSimpleIcon as Lock,
  XIcon as X,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { RouteEntry, RouteTableConfig } from "./data";
import { TONE } from "./tones";

/* Pure IPv4 math, provider-neutral. Mirrors the cidr-carver parser so the
 * routing chapter stays independent; here we only need to test whether a bare
 * destination address falls inside a route's CIDR, and how specific that CIDR
 * is (its prefix length) for longest-prefix-match. */

function ipToInt(str: string): number | null {
  const m = str.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const o = [+m[1], +m[2], +m[3], +m[4]];
  if (o.some((x) => x > 255)) return null;
  return (((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3]) >>> 0;
}

const prefixOf = (dest: string): number => +dest.split("/")[1];

function cidrContains(dest: string, ip: number): boolean {
  const [addr, pStr] = dest.split("/");
  const p = +pStr;
  const o = addr.split(".").map(Number);
  const base = (((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3]) >>> 0;
  const mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
  return (ip & mask) >>> 0 === (base & mask) >>> 0;
}

type Lookup =
  | { kind: "invalid" }
  | {
      kind: "match";
      winner: RouteEntry;
      others: RouteEntry[];
      why: string;
    }
  | { kind: "drop"; winner: RouteEntry; why: string }
  | { kind: "blackhole"; wouldMatch: RouteEntry | null };

function resolve(
  routes: RouteEntry[],
  enabled: Record<string, boolean>,
  ipStr: string,
): Lookup {
  const ip = ipToInt(ipStr);
  if (ip === null) return { kind: "invalid" };

  const rank = (a: RouteEntry, b: RouteEntry) =>
    prefixOf(b.destination) - prefixOf(a.destination) ||
    b.priority - a.priority;

  const matches = routes
    .filter((r) => enabled[r.id] && cidrContains(r.destination, ip))
    .sort(rank);
  const winner = matches[0];

  if (!winner) {
    const wouldMatch =
      routes.filter((r) => cidrContains(r.destination, ip)).sort(rank)[0] ??
      null;
    return { kind: "blackhole", wouldMatch };
  }

  const runnerUp = matches[1];
  let why: string;
  if (!runnerUp) {
    why = "It's the only route whose destination covers this address.";
  } else if (prefixOf(winner.destination) > prefixOf(runnerUp.destination)) {
    why = `Both ${winner.destination} and ${runnerUp.destination} match, but longest prefix wins: /${prefixOf(winner.destination)} is more specific than /${prefixOf(runnerUp.destination)}.`;
  } else {
    why = `${winner.destination} and ${runnerUp.destination} share the same prefix, so priority decides: a ${winner.managed}-managed route outranks a ${runnerUp.managed} one.`;
  }

  if (winner.drop) return { kind: "drop", winner, why };
  return { kind: "match", winner, others: matches.slice(1), why };
}

/**
 * Chapter 4: the route table. Pick (or type) a destination address and watch
 * the table pick a next hop by longest-prefix match, then priority on a tie.
 * Toggle the routes you're allowed to change and see a subnet stop reaching the
 * internet: the same "take it away and watch it break" idea as the packet
 * simulator, but at the level of the table that actually decides where traffic
 * goes.
 */
export function RouteLab({ config }: { config: RouteTableConfig }) {
  const [ip, setIp] = useState(config.probes[0].ip);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(config.routes.map((r) => [r.id, r.on])),
  );

  const lookup = useMemo(
    () => resolve(config.routes, enabled, ip),
    [config.routes, enabled, ip],
  );

  const winnerId =
    lookup.kind === "match" || lookup.kind === "drop" ? lookup.winner.id : null;
  const matchingIds = useMemo(() => {
    const parsed = ipToInt(ip);
    if (parsed === null) return new Set<string>();
    return new Set(
      config.routes
        .filter((r) => enabled[r.id] && cidrContains(r.destination, parsed))
        .map((r) => r.id),
    );
  }, [config.routes, enabled, ip]);

  const pass = lookup.kind === "match";
  const bad = lookup.kind === "drop" || lookup.kind === "blackhole";

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[22px]">
        <label className="flex flex-col gap-[6px]">
          <span className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            Destination the packet is headed to
          </span>
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            inputMode="numeric"
            aria-label="Destination IP address"
            className="w-[190px] rounded-[10px] border border-input bg-surface-muted px-[11px] py-[9px] font-mono text-[14.5px] text-ink-soft"
          />
        </label>

        <p className="mt-[16px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Or send it somewhere
        </p>
        <div className="mt-[8px] flex flex-wrap gap-[7px]">
          {config.probes.map((probe) => {
            const active = probe.ip === ip;
            return (
              <button
                key={probe.label}
                type="button"
                onClick={() => setIp(probe.ip)}
                aria-pressed={active}
                className={cn(
                  "rounded-pill border px-[12px] py-[6px] font-mono text-[12.5px] transition-colors",
                  active
                    ? "border-teal-ring bg-teal-tint text-teal-ink"
                    : "border-line bg-surface-muted text-ink-muted hover:border-ink-muted",
                )}
              >
                {probe.label}
              </button>
            );
          })}
        </div>

        <div className="mt-[20px]">
          <h3 className="text-[14px] font-bold text-ink-strong">
            {config.tableTitle}
          </h3>
          <p className="mt-[3px] text-[12.5px] leading-[1.5] text-body-soft">
            {config.tableLede}
          </p>
        </div>

        <div className="mt-[12px] overflow-hidden rounded-[12px] border border-line">
          <div className="grid grid-cols-[1fr_1.1fr_auto] items-center gap-[10px] border-b border-line bg-surface-muted px-[13px] py-[8px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
            <span>Destination</span>
            <span>{config.targetHeader}</span>
            <span className="text-right">In table</span>
          </div>
          <ul>
            {config.routes.map((route) => (
              <RouteRow
                key={route.id}
                route={route}
                on={enabled[route.id]}
                isWinner={route.id === winnerId}
                alsoMatches={matchingIds.has(route.id) && route.id !== winnerId}
                onToggle={() =>
                  setEnabled((s) => ({ ...s, [route.id]: !s[route.id] }))
                }
              />
            ))}
          </ul>
        </div>
        <p className="mt-[10px] font-mono text-[11px] leading-[1.5] text-ink-muted">
          {config.tableNote}
        </p>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "self-start rounded-[18px] border p-[18px]",
          pass
            ? "border-[oklch(0.72_0.12_150)] bg-[oklch(0.97_0.03_150)]"
            : bad
              ? "border-[oklch(0.72_0.14_25)] bg-[oklch(0.97_0.03_25)]"
              : "border-dashed border-line bg-surface",
        )}
      >
        {lookup.kind === "invalid" ? (
          <p className="font-mono text-[12.5px] text-ink-muted">
            Enter a valid IPv4 address, like 10.0.2.31.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-[8px]">
              <span
                className={cn(
                  "h-[11px] w-[11px] rounded-full",
                  pass
                    ? "bg-[oklch(0.58_0.12_150)]"
                    : "bg-[oklch(0.62_0.17_25)]",
                )}
              />
              <span
                className={cn(
                  "inline-flex items-center gap-[6px] text-[15px] font-semibold",
                  pass
                    ? "text-[oklch(0.44_0.1_150)]"
                    : "text-[oklch(0.5_0.16_25)]",
                )}
              >
                {pass ? (
                  <Check size={16} weight="bold" aria-hidden />
                ) : (
                  <X size={16} weight="bold" aria-hidden />
                )}
                {verdictTitle(lookup, ip)}
              </span>
            </div>
            <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
              {verdictBody(lookup, ip, config)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function verdictTitle(lookup: Lookup, ip: string): string {
  if (lookup.kind === "match") return `${ip.trim()} → ${lookup.winner.target}`;
  return `${ip.trim()} → dropped`;
}

function verdictBody(
  lookup: Lookup,
  ip: string,
  config: RouteTableConfig,
): string {
  const addr = ip.trim();
  if (lookup.kind === "invalid") return "";
  if (lookup.kind === "match") return `${lookup.why} ${lookup.winner.note}`;
  if (lookup.kind === "drop")
    return `${lookup.why} A next hop of "None" is a deliberate black hole: ${addr} is discarded rather than forwarded. ${lookup.winner.note}`;
  // blackhole: no active route matched.
  if (lookup.wouldMatch)
    return `Nothing in the table now matches ${addr}. The route that would carry it, ${lookup.wouldMatch.destination} → ${lookup.wouldMatch.target}, is turned off, and there's no other route to fall back to. ${config.droppedNote}`;
  return `No route matches ${addr}, so the ${config.netName} has nowhere to send it and the packet is dropped. ${config.droppedNote}`;
}

/** One route in the table: destination, next hop, and (unless locked) a toggle. */
function RouteRow({
  route,
  on,
  isWinner,
  alsoMatches,
  onToggle,
}: {
  route: RouteEntry;
  on: boolean;
  isWinner: boolean;
  alsoMatches: boolean;
  onToggle: () => void;
}) {
  const tone = TONE[route.tone];
  return (
    <li
      className={cn(
        "grid grid-cols-[1fr_1.1fr_auto] items-center gap-[10px] border-b border-line px-[13px] py-[10px] transition-colors last:border-b-0",
        isWinner && route.drop && "bg-[oklch(0.97_0.03_25)]",
        isWinner && !route.drop && "bg-[oklch(0.97_0.03_150)]",
        !on && "opacity-45",
      )}
    >
      <span
        className={cn(
          "font-mono text-[12.5px] text-ink-strong",
          !on && "line-through",
        )}
      >
        {route.destination}
      </span>
      <span className="flex items-center gap-[7px]">
        <span
          className={cn(
            "inline-block max-w-full truncate rounded-[6px] px-[8px] py-[3px] font-mono text-[11.5px]",
            tone.chip,
          )}
        >
          {route.target}
        </span>
        {isWinner ? (
          <span
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-[0.06em]",
              route.drop
                ? "text-[oklch(0.5_0.16_25)]"
                : "text-[oklch(0.44_0.1_150)]",
            )}
          >
            {route.drop ? "drops" : "chosen"}
          </span>
        ) : alsoMatches ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted">
            also matches
          </span>
        ) : null}
      </span>
      {route.locked ? (
        <span
          className="flex items-center justify-end gap-[4px] font-mono text-[10.5px] text-ink-muted"
          title={route.lockNote}
        >
          <Lock size={12} weight="bold" aria-hidden />
          {route.managed === "system" ? "system" : "always"}
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={onToggle}
          className={cn(
            "relative h-[22px] w-[38px] shrink-0 justify-self-end rounded-full border-[1.5px] transition-colors",
            "after:absolute after:top-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:transition-transform",
            on
              ? "border-[oklch(0.72_0.12_150)] bg-[oklch(0.95_0.04_150)] after:left-[2px] after:translate-x-[16px] after:bg-[oklch(0.58_0.12_150)]"
              : "border-line bg-surface-muted after:left-[2px] after:bg-ink-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ring",
          )}
        >
          <span className="sr-only">
            {on ? "Remove this route" : "Add this route"}
          </span>
        </button>
      )}
    </li>
  );
}
