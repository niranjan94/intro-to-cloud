"use client";

import { useId, useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import type { PerfContent } from "./data";

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** A labeled slider with a two-tone track: free baseline plus provisioned. */
function Dial({
  label,
  unit,
  value,
  min,
  max,
  step,
  baseline,
  disabled,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  baseline: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const fillPct = clamp((value / max) * 100, 0, 100);
  const basePct = clamp((baseline / max) * 100, 0, 100);

  return (
    <div className="rounded-[14px] border border-line bg-surface p-[16px]">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted"
        >
          {label}
        </label>
        <span className="font-mono text-[15px] font-semibold text-ink-strong">
          {fmt(value)}
          <span className="ml-[4px] text-[11px] font-normal text-ink-muted">
            {unit}
          </span>
        </span>
      </div>

      <div className="relative mt-[12px] h-[8px]">
        <div className="absolute inset-0 overflow-hidden rounded-full bg-surface-muted" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-teal-ring motion-safe:transition-[width] motion-safe:duration-200"
          style={{ width: `${fillPct}%` }}
        />
        {baseline > min ? (
          <span
            aria-hidden
            className="absolute top-[-3px] h-[14px] w-[2px] bg-[oklch(0.55_0.015_230)]"
            style={{ left: `calc(${basePct}% - 1px)` }}
          />
        ) : null}
      </div>
      <div className="mt-[4px] flex justify-between font-mono text-[10px] text-ink-muted">
        <span>
          {fmt(min)} {unit}
        </span>
        {baseline > min ? (
          <span
            style={{ marginLeft: `${basePct}%` }}
            className="-translate-x-1/2"
          >
            free baseline
          </span>
        ) : null}
        <span>
          {fmt(max)} {unit}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-[8px] w-full accent-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-ring disabled:opacity-50"
      />
    </div>
  );
}

/** Chapter 3: provision size, IOPS, and throughput and see which limit binds. */
export function PerformanceProvisioner({ content }: { content: PerfContent }) {
  const [size, setSize] = useState(content.sizeDefault);
  const [iops, setIops] = useState(6000);
  const [throughput, setThroughput] = useState(250);

  const iopsCap = clamp(
    size * content.iopsPerSize,
    content.baselineIops,
    content.maxIops,
  );
  const throughputCap = clamp(
    Math.floor((iops * content.throughputPerIops) / content.throughputStep) *
      content.throughputStep,
    content.baselineThroughput,
    content.maxThroughput,
  );

  const setSizeAndCascade = (next: number) => {
    setSize(next);
    const nextIopsCap = clamp(
      next * content.iopsPerSize,
      content.baselineIops,
      content.maxIops,
    );
    if (iops > nextIopsCap) {
      setIops(nextIopsCap);
      const nextTpCap = clamp(
        Math.floor(
          (nextIopsCap * content.throughputPerIops) / content.throughputStep,
        ) * content.throughputStep,
        content.baselineThroughput,
        content.maxThroughput,
      );
      if (throughput > nextTpCap) setThroughput(nextTpCap);
    }
  };

  const setIopsAndCascade = (next: number) => {
    const clamped = clamp(next, content.baselineIops, iopsCap);
    setIops(clamped);
    const nextTpCap = clamp(
      Math.floor(
        (clamped * content.throughputPerIops) / content.throughputStep,
      ) * content.throughputStep,
      content.baselineThroughput,
      content.maxThroughput,
    );
    if (throughput > nextTpCap) setThroughput(nextTpCap);
  };

  const iopsBinding =
    iops >= iopsCap && iopsCap < content.maxIops
      ? `IOPS is capped at ${fmt(iopsCap)} by the ${fmt(size)} ${content.sizeUnit} size. Raise size to provision more: ${content.maxIops.toLocaleString("en-US")} ${content.iopsUnit} needs ${fmt(content.sizeForMaxIops)} ${content.sizeUnit}.`
      : iops >= content.maxIops
        ? `At the ${fmt(content.maxIops)} ${content.iopsUnit} ceiling for ${content.typeName}.`
        : null;

  const throughputBinding =
    throughput >= throughputCap && throughputCap < content.maxThroughput
      ? `Throughput is capped at ${fmt(throughputCap)} ${content.throughputUnit} by ${fmt(iops)} ${content.iopsUnit}. Raise IOPS to provision more: ${fmt(content.maxThroughput)} ${content.throughputUnit} needs ${fmt(content.iopsForMaxThroughput)} ${content.iopsUnit}.`
      : throughput >= content.maxThroughput
        ? `At the ${fmt(content.maxThroughput)} ${content.throughputUnit} ceiling for ${content.typeName}.`
        : null;

  const extraIops = iops - content.baselineIops;
  const extraThroughput = throughput - content.baselineThroughput;
  const anyProvisioned = extraIops > 0 || extraThroughput > 0;

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-teal-line bg-teal-tint px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-teal">
          {content.typeName}
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.intro}
        </p>
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[12px] min-[720px]:grid-cols-3">
        <Dial
          label={`Size (${content.sizeUnit})`}
          unit={content.sizeUnit}
          value={size}
          min={content.sizeMin}
          max={content.sizeMax}
          step={content.sizeStep}
          baseline={content.sizeMin}
          onChange={setSizeAndCascade}
        />
        <Dial
          label="Provisioned IOPS"
          unit={content.iopsUnit}
          value={iops}
          min={content.baselineIops}
          max={iopsCap}
          step={content.iopsStep}
          baseline={content.baselineIops}
          onChange={setIopsAndCascade}
        />
        <Dial
          label="Throughput"
          unit={content.throughputUnit}
          value={throughput}
          min={content.baselineThroughput}
          max={throughputCap}
          step={content.throughputStep}
          baseline={content.baselineThroughput}
          disabled={throughputCap <= content.baselineThroughput}
          onChange={(v) =>
            setThroughput(clamp(v, content.baselineThroughput, throughputCap))
          }
        />
      </div>

      {/* Chosen config + cost split */}
      <div className="mt-[16px] rounded-[16px] border border-line bg-surface p-[18px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted">
          Provisioned volume
        </p>
        <p className="mt-[6px] font-mono text-[15px] font-semibold text-ink-strong">
          {fmt(size)} {content.sizeUnit} · {fmt(iops)} {content.iopsUnit} ·{" "}
          {fmt(throughput)} {content.throughputUnit}
        </p>
        <p className="mt-[8px] text-[13px] leading-[1.6] text-body">
          The first {fmt(content.baselineIops)} {content.iopsUnit} and{" "}
          {fmt(content.baselineThroughput)} {content.throughputUnit} are the
          free baseline.{" "}
          {anyProvisioned ? (
            <>
              You are provisioning{" "}
              <span className="font-semibold text-ink-strong">
                {fmt(extraIops)} {content.iopsUnit}
              </span>{" "}
              and{" "}
              <span className="font-semibold text-ink-strong">
                {fmt(extraThroughput)} {content.throughputUnit}
              </span>{" "}
              above it, which adds to the cost.
            </>
          ) : (
            "You are on the free baseline with nothing extra provisioned."
          )}
        </p>

        {iopsBinding || throughputBinding ? (
          <div className="mt-[12px] flex flex-col gap-[8px]">
            {iopsBinding ? (
              <p className="rounded-[10px] border border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)] px-[12px] py-[9px] text-[12.5px] leading-[1.5] text-[oklch(0.45_0.09_70)]">
                {iopsBinding}
              </p>
            ) : null}
            {throughputBinding ? (
              <p className="rounded-[10px] border border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)] px-[12px] py-[9px] text-[12.5px] leading-[1.5] text-[oklch(0.45_0.09_70)]">
                {throughputBinding}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.coupledNote}
      </p>

      <p className="mt-[16px] font-mono text-[12px] uppercase tracking-[0.04em] text-ink-muted">
        Creating a volume with provisioned performance
      </p>
      <CliBlock command={content.cli} />
      <p className="mt-[8px] font-mono text-[11px] leading-[1.5] text-ink-muted">
        Real maximum size for {content.typeName} is {content.realMaxSizeLabel}.
        The slider stops at {fmt(content.sizeMax)} {content.sizeUnit} to keep
        the model readable.
      </p>
    </div>
  );
}
