"use client";

import {
  ArrowRightIcon as ArrowRight,
  CertificateIcon as Certificate,
  DesktopIcon as Desktop,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MapContent, Terminator } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 3: where the certificate lives and terminates TLS. The store header
 * frames the provider's model (one ACM store per Region, or Azure's several
 * sources), then a picker walks each terminator and names the certificate source
 * that feeds it. This is the chapter the two providers diverge on hardest, so
 * everything provider-specific comes from MapContent.
 */
export function CertMap({ content }: { content: MapContent }) {
  const [id, setId] = useState(content.terminators[0].id);
  const terminator =
    content.terminators.find((t) => t.id === id) ?? content.terminators[0];

  return (
    <div className="mt-[16px]">
      <div
        className={cn(
          "flex items-start gap-[11px] rounded-[14px] border-[1.5px] p-[15px]",
          TONE.store.frame,
        )}
      >
        <span aria-hidden className={cn("mt-[1px] flex-none", TONE.store.text)}>
          <Certificate size={18} weight="fill" />
        </span>
        <div>
          <p className={cn("text-[13.5px] font-semibold", TONE.store.text)}>
            {content.storeLabel}
          </p>
          <p className="mt-[4px] text-pretty text-[13px] leading-[1.6] text-body">
            {content.storeNote}
          </p>
        </div>
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-[8px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            Terminator · where TLS ends
          </p>
          {content.terminators.map((t) => {
            const active = t.id === id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setId(t.id)}
                className={cn(
                  "rounded-[12px] border px-[13px] py-[11px] text-left transition-colors",
                  active
                    ? "border-teal-ring bg-surface"
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span className="block text-[13.5px] font-semibold text-ink-strong">
                  {t.name}
                </span>
                <span className="mt-[2px] block font-mono text-[11.5px] text-ink-muted">
                  {t.role}
                </span>
              </button>
            );
          })}
        </div>

        <TerminatorDetail terminator={terminator} />
      </div>

      <div className="mt-[16px] flex items-start gap-[11px] rounded-[14px] border border-dashed border-line bg-surface-muted p-[15px]">
        <span aria-hidden className="mt-[1px] flex-none text-ink-muted">
          <Desktop size={18} weight="regular" />
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-ink-strong">
            {content.rawServerTitle}
          </p>
          <p className="mt-[4px] text-pretty text-[13px] leading-[1.6] text-body">
            {content.rawServerNote}
          </p>
        </div>
      </div>
    </div>
  );
}

function TerminatorDetail({ terminator }: { terminator: Terminator }) {
  return (
    <div
      key={terminator.id}
      className="rounded-[18px] border border-line bg-surface p-[18px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
    >
      <div className="flex flex-wrap items-center gap-[10px]">
        <span className="text-[15px] font-semibold text-ink-strong">
          {terminator.name}
        </span>
        <span aria-hidden className="text-ink-muted">
          <ArrowRight size={15} weight="bold" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[12px] py-[5px] font-mono text-[12px] font-semibold",
            TONE.store.frame,
            TONE.store.text,
          )}
        >
          <span
            className={cn("h-[8px] w-[8px] rounded-full", TONE.store.dot)}
          />
          {terminator.certSource}
        </span>
      </div>

      <dl className="mt-[14px] flex flex-col gap-[10px]">
        <DetailRow label="How it gets the cert" value={terminator.issuance} />
        <DetailRow label="Auto-renewal" value={terminator.autoRenew} />
      </dl>

      <p className="mt-[14px] border-t border-line pt-[12px] text-pretty text-[13px] leading-[1.6] text-body">
        {terminator.note}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[1px] min-[440px]:flex-row min-[440px]:items-baseline min-[440px]:gap-[14px]">
      <dt className="w-[170px] flex-none font-mono text-[11px] uppercase tracking-[0.04em] text-ink-muted">
        {label}
      </dt>
      <dd className="text-[13.5px] text-ink-strong">{value}</dd>
    </div>
  );
}
