"use client";

import {
  LockIcon as Lock,
  WarningIcon as Warning,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AnatomyContent, CertField } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 1: the anatomy of a certificate. The cert's fields are laid out like
 * an inspector; a row of states (valid, expired, wrong domain, untrusted CA)
 * changes the browser's verdict and highlights the field it objects to, so the
 * reader sees that a padlock depends on name, validity, and issuer all holding.
 */
export function CertAnatomy({ content }: { content: AnatomyContent }) {
  const [stateId, setStateId] = useState(content.states[0].id);
  const state =
    content.states.find((s) => s.id === stateId) ?? content.states[0];
  const tone = TONE[state.verdict];
  const Mark = state.verdict === "secure" ? Lock : Warning;

  return (
    <div className="mt-[16px]">
      <div
        role="tablist"
        aria-label="Certificate state"
        className="flex flex-wrap gap-[8px]"
      >
        {content.states.map((s) => {
          const active = s.id === stateId;
          const st = TONE[s.verdict];
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStateId(s.id)}
              className={cn(
                "rounded-[10px] border-[1.5px] px-[13px] py-[8px] font-mono text-[12.5px] font-semibold transition-colors",
                active
                  ? cn(st.frame, st.text)
                  : "border-line bg-surface text-ink-soft hover:border-ink-muted",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-[16px] overflow-hidden rounded-[18px] border border-line bg-surface">
        <div
          className={cn(
            "flex items-center gap-[10px] border-b px-[16px] py-[11px] transition-colors",
            tone.border,
            tone.frame,
          )}
        >
          <span className={cn("flex-none", tone.text)}>
            <Mark size={16} weight="fill" aria-hidden />
          </span>
          <span className="break-all font-mono text-[12.5px] text-ink-strong">
            {content.visiting}
          </span>
        </div>

        <dl className="divide-y divide-line">
          {content.fields.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              flagged={state.culprit === field.id}
            />
          ))}
        </dl>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "mt-[14px] flex gap-[11px] rounded-[14px] border-[1.5px] p-[15px]",
          tone.frame,
        )}
      >
        <span aria-hidden className={cn("mt-[1px] flex-none", tone.text)}>
          <Mark size={18} weight="fill" />
        </span>
        <div>
          <p className={cn("text-[14px] font-semibold", tone.text)}>
            {state.verdictTitle}
          </p>
          <p className="mt-[4px] text-pretty text-[13.5px] leading-[1.6] text-body">
            {state.verdictBody}
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ field, flagged }: { field: CertField; flagged: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-[2px] px-[16px] py-[11px] transition-colors min-[560px]:flex-row min-[560px]:items-baseline min-[560px]:gap-[16px]",
        flagged && TONE.insecure.frame,
      )}
    >
      <dt className="w-[210px] flex-none font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
        {field.label}
      </dt>
      <dd
        className={cn(
          "break-all font-mono text-[13px]",
          flagged ? cn(TONE.insecure.text, "font-semibold") : "text-ink-strong",
        )}
      >
        {field.value}
        {flagged ? (
          <span
            className={cn(
              "ml-[8px] font-sans text-[11.5px]",
              TONE.insecure.text,
            )}
          >
            ← the browser rejects this
          </span>
        ) : null}
      </dd>
    </div>
  );
}
