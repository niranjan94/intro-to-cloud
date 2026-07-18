"use client";

import { CheckIcon as Check, XIcon as X } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { CidrConfig } from "./data";

/* Pure CIDR math, ported from the source explainers (provider-neutral). */

type Parsed =
  | { ok: false; err: string }
  | {
      ok: true;
      p: number;
      size: number;
      net: number;
      first: number;
      last: number;
      aligned: boolean;
    };

function parseCidr(str: string): Parsed {
  const m = str
    .trim()
    .match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!m)
    return {
      ok: false,
      err: "That's not a valid CIDR. Use something like 10.0.1.0/24.",
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
  return {
    ok: true,
    p,
    size,
    net,
    first: net,
    last: (net + size - 1) >>> 0,
    aligned: ip === net,
  };
}

const intToIp = (n: number) =>
  [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

function isPrivate(net: number, last: number) {
  const inBlock = (a: number, b: number) => net >= a && last <= b;
  return (
    inBlock(0x0a000000, 0x0affffff) ||
    inBlock(0xac100000, 0xac1fffff) ||
    inBlock(0xc0a80000, 0xc0a8ffff)
  );
}

type Verdict = {
  kind: "pass" | "fail";
  title: string;
  body: string;
  ruler: {
    lo: string;
    hi: string;
    sub: { left: number; width: number } | null;
  } | null;
};

function evaluate(config: CidrConfig, vpcStr: string, subStr: string): Verdict {
  const v = parseCidr(vpcStr);
  const s = parseCidr(subStr);
  const name = config.netName;

  if (!v.ok)
    return {
      kind: "fail",
      title: `Fix the ${name} range first`,
      body: v.err,
      ruler: null,
    };

  const ruler = {
    lo: intToIp(v.first),
    hi: intToIp(v.last),
    sub: null as null | { left: number; width: number },
  };
  if (!s.ok)
    return { kind: "fail", title: "Not a valid subnet", body: s.err, ruler };

  if (s.first >= v.first && s.last <= v.last && v.size > 0) {
    ruler.sub = {
      left: ((s.first - v.first) / v.size) * 100,
      width: Math.max(1.2, (s.size / v.size) * 100),
    };
  }

  if (s.p < v.p)
    return {
      kind: "fail",
      title: `Bigger than the ${name}`,
      body: `A /${s.p} block holds ${s.size.toLocaleString()} addresses, more than the whole ${name}'s ${v.size.toLocaleString()}. A subnet is a slice, so its /prefix must be equal to or larger than the ${name}'s (a bigger number means a smaller block).`,
      ruler,
    };

  if (s.first < v.first || s.last > v.last)
    return {
      kind: "fail",
      title: `Outside the ${name}`,
      body: `${intToIp(s.first)}-${intToIp(s.last)} falls outside the ${name}'s ${intToIp(v.first)}-${intToIp(v.last)}. Rule #1: a subnet's range must sit entirely inside the ${name}'s range. You can't carve a slice from land you don't own.`,
      ruler,
    };

  if (!s.aligned)
    return {
      kind: "fail",
      title: "Misaligned block",
      body: `Close! ${subStr.trim()} isn't the start of a clean /${s.p} block. The network address would be ${intToIp(s.net)}/${s.p}. Use that instead.`,
      ruler,
    };

  if (config.maxPrefix && s.p > config.maxPrefix)
    return {
      kind: "fail",
      title: "Subnet too small",
      body: `${intToIp(s.first)}/${s.p} fits inside the ${name}, but the smallest allowed subnet is /${config.maxPrefix}. After the ${config.reserved} reserved addresses there'd be nothing usable here.`,
      ruler,
    };

  const inPrivate = isPrivate(s.first, s.last);
  const extra = inPrivate
    ? "It uses a normal private range: good."
    : "Heads up: this range isn't in the private blocks (10.x, 172.16-31.x, 192.168.x). It's allowed, but it doesn't grant internet access, and reusing real public addresses can break your routing to them.";

  const usableLine =
    config.reserved > 0
      ? `Of its ${s.size.toLocaleString()} addresses, ${config.reserved} are reserved, leaving ${Math.max(0, s.size - config.reserved).toLocaleString()} usable.`
      : `It holds ${s.size.toLocaleString()} addresses.`;

  return {
    kind: "pass",
    title: "Valid subnet",
    body: `${intToIp(s.first)}-${intToIp(s.last)} fits inside the ${name}. ${usableLine} ${extra}`,
    ruler,
  };
}

/** Chapter 2: type or load a subnet range and see whether it is a legal slice. */
export function CidrCarver({ config }: { config: CidrConfig }) {
  const [vpc, setVpc] = useState(config.presets[0].vpc);
  const [sub, setSub] = useState(config.presets[0].sub);

  const verdict = useMemo(() => evaluate(config, vpc, sub), [config, vpc, sub]);
  const pass = verdict.kind === "pass";

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[22px]">
        <div className="flex flex-wrap gap-[20px]">
          <label className="flex flex-col gap-[6px]">
            <span className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
              {config.spaceLabel}
            </span>
            <input
              value={vpc}
              onChange={(e) => setVpc(e.target.value)}
              className="w-[170px] rounded-[10px] border border-input bg-surface-muted px-[11px] py-[9px] font-mono text-[14.5px] text-ink-soft"
            />
          </label>
          <label className="flex flex-col gap-[6px]">
            <span className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
              Subnet you want to carve
            </span>
            <input
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              className="w-[170px] rounded-[10px] border border-input bg-surface-muted px-[11px] py-[9px] font-mono text-[14.5px] text-ink-soft"
            />
          </label>
        </div>

        <p className="mt-[16px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          Or load a real mistake
        </p>
        <div className="mt-[8px] flex flex-wrap gap-[7px]">
          {config.presets.map((preset) => {
            const active = preset.vpc === vpc && preset.sub === sub;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setVpc(preset.vpc);
                  setSub(preset.sub);
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

        <div className="mt-[20px]">
          <div className="relative h-[44px] overflow-hidden rounded-[10px] border border-line bg-[repeating-linear-gradient(90deg,transparent_0,transparent_9%,oklch(0.94_0.006_220)_9%,oklch(0.94_0.006_220)_calc(9%_+_1px))]">
            <div className="absolute inset-y-0 left-0 right-0 border-x-2 border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]" />
            {verdict.ruler?.sub ? (
              <div
                className="absolute inset-y-0 border-x-2 border-teal-ring bg-[oklch(0.9_0.05_195)]"
                style={{
                  left: `${verdict.ruler.sub.left}%`,
                  width: `${verdict.ruler.sub.width}%`,
                }}
              />
            ) : null}
          </div>
          <div className="mt-[4px] flex justify-between font-mono text-[11px] text-ink-muted">
            <span>{verdict.ruler?.lo ?? "-"}</span>
            <span>address space of the {config.netName}</span>
            <span>{verdict.ruler?.hi ?? "-"}</span>
          </div>
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
              <Check size={15} weight="bold" aria-hidden />
            ) : (
              <X size={15} weight="bold" aria-hidden />
            )}{" "}
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
