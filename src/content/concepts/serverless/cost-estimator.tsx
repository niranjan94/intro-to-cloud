"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PricingContent } from "./data";
import { TONE } from "./tones";

const nf = new Intl.NumberFormat("en-US");
const usd = (n: number) =>
  n === 0 ? "$0.00" : n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;

/** Chapter 5: estimate a monthly bill from requests and GB-seconds. */
export function CostEstimator({ content }: { content: PricingContent }) {
  const [invocations, setInvocations] = useState(2_000_000);
  const [memoryMb, setMemoryMb] = useState(512);
  const [durationMs, setDurationMs] = useState(200);

  const gbSeconds = invocations * (memoryMb / 1024) * (durationMs / 1000);
  const billableReq = Math.max(0, invocations - content.freeReq);
  const billableGb = Math.max(0, gbSeconds - content.freeGbSec);
  const reqCost = (billableReq / 1_000_000) * content.reqPricePerM;
  const gbCost = billableGb * content.gbSecPrice;
  const total = reqCost + gbCost;
  const covered = billableReq === 0 && billableGb === 0;

  return (
    <div className="mt-[16px]">
      <div className="rounded-[14px] border border-line bg-surface-muted px-[16px] py-[12px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
          The model
        </p>
        <p className="mt-[5px] text-[13.5px] leading-[1.6] text-body">
          {content.model}
        </p>
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[18px]">
          <Slider
            id="cost-invocations"
            label={`${content.requestTerm}s per month`}
            value={invocations}
            display={nf.format(invocations)}
            min={0}
            max={20_000_000}
            step={100_000}
            onChange={setInvocations}
          />
          <Slider
            id="cost-memory"
            label="Memory allocated"
            value={memoryMb}
            display={`${nf.format(memoryMb)} MB`}
            min={128}
            max={4096}
            step={128}
            onChange={setMemoryMb}
          />
          <Slider
            id="cost-duration"
            label="Average run time"
            value={durationMs}
            display={`${nf.format(durationMs)} ms`}
            min={10}
            max={2000}
            step={10}
            onChange={setDurationMs}
          />
        </div>

        <div className="rounded-[18px] border-[1.5px] border-teal-line bg-teal-tint p-[18px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-teal">
            Estimated monthly cost
          </p>
          <p className="mt-[6px] font-mono text-[34px] font-extrabold tracking-[-0.02em] text-ink">
            {usd(total)}
          </p>

          <dl className="mt-[14px] flex flex-col gap-[8px] font-mono text-[12px]">
            <Row
              label={`GB-seconds used`}
              value={nf.format(Math.round(gbSeconds))}
            />
            <Row
              label={`Billable ${content.requestTerm}s`}
              value={nf.format(billableReq)}
            />
            <Row
              label="Billable GB-seconds"
              value={nf.format(Math.round(billableGb))}
            />
            <div className="my-[2px] border-t border-teal-line" />
            <Row label={`${content.requestTerm} charge`} value={usd(reqCost)} />
            <Row label="Compute charge" value={usd(gbCost)} />
          </dl>

          {covered ? (
            <div
              className={cn(
                "mt-[14px] rounded-[10px] border-[1.5px] px-[12px] py-[9px]",
                TONE.ok.frame,
              )}
            >
              <span
                className={cn(
                  "font-mono text-[12px] font-semibold",
                  TONE.ok.text,
                )}
              >
                Fully within the free grant
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-[14px] text-pretty font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        Free grant: {nf.format(content.freeReq)} {content.requestTerm}s and{" "}
        {nf.format(content.freeGbSec)} GB-seconds per month.{" "}
        {content.billingNote}
      </p>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-[16px] last:mb-0">
      <div className="flex items-baseline justify-between gap-[10px]">
        <label
          htmlFor={id}
          className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted"
        >
          {label}
        </label>
        <span className="font-mono text-[13px] font-semibold text-ink-strong">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-[8px] w-full accent-[oklch(0.55_0.09_195)]"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[10px]">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink-strong">{value}</dd>
    </div>
  );
}
