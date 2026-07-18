"use client";

import {
  LockIcon as Lock,
  WarningIcon as Warning,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Switch } from "@/components/lesson/controls";
import { cn } from "@/lib/utils";
import type { RenewalContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 4: renewal, and how it breaks. A timeline runs from issue through the
 * renewal window to expiry; a switch decides whether the condition that keeps
 * automatic renewal working still holds. Kept, the certificate is renewed and
 * the line continues; broken, it lapses at expiry into a browser warning. The
 * lesson is that "auto-renewal" is conditional, and expiry is the usual outage.
 */
export function RenewalTimeline({ content }: { content: RenewalContent }) {
  const [kept, setKept] = useState(true);
  const outcome = kept ? TONE.secure : TONE.insecure;
  const Mark = kept ? Lock : Warning;

  return (
    <div className="mt-[16px]">
      <div className="rounded-[18px] border border-line bg-surface p-[18px]">
        <div className="flex gap-[5px]">
          <Segment
            grow={5}
            tone={TONE.secure}
            title="Valid and in use"
            caption={content.validityLabel}
          />
          <Segment
            grow={2}
            tone={TONE.pending}
            title="Renewal window"
            caption={content.renewWindowLabel}
          />
          <Segment
            grow={3}
            tone={outcome}
            title={kept ? "Renewed" : "Expired"}
            caption={
              kept
                ? "A fresh certificate, same binding"
                : "The certificate lapses"
            }
            icon={<Mark size={13} weight="fill" aria-hidden />}
          />
        </div>

        <div className="mt-[16px] border-t border-line pt-[14px]">
          <Switch
            checked={kept}
            onChange={setKept}
            label="Validation stays in place"
            hint={content.conditionLabel}
          />
        </div>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "mt-[14px] flex gap-[11px] rounded-[14px] border-[1.5px] p-[15px]",
          outcome.frame,
        )}
      >
        <span aria-hidden className={cn("mt-[1px] flex-none", outcome.text)}>
          <Mark size={18} weight="fill" />
        </span>
        <div>
          <p className={cn("text-[14px] font-semibold", outcome.text)}>
            {kept ? content.keepTitle : content.breakTitle}
          </p>
          <p className="mt-[4px] text-pretty text-[13.5px] leading-[1.6] text-body">
            {kept ? content.keepBody : content.breakBody}
          </p>
        </div>
      </div>
    </div>
  );
}

function Segment({
  grow,
  tone,
  title,
  caption,
  icon,
}: {
  grow: number;
  tone: (typeof TONE)[keyof typeof TONE];
  title: string;
  caption: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ flexGrow: grow, flexBasis: 0 }} className="min-w-0">
      <div
        className={cn(
          "h-[10px] rounded-full border-[1.5px] motion-safe:transition-colors",
          tone.frame,
        )}
      />
      <div className="mt-[8px] flex items-center gap-[5px]">
        {icon ? <span className={tone.text}>{icon}</span> : null}
        <span
          className={cn("font-mono text-[11.5px] font-semibold", tone.text)}
        >
          {title}
        </span>
      </div>
      <p className="mt-[3px] text-pretty text-[11.5px] leading-[1.45] text-ink-muted">
        {caption}
      </p>
    </div>
  );
}
