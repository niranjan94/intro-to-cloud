"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import type { NestingContent, NestNode } from "./data";
import { TONE } from "./tones";

function NestBox({ node }: { node: NestNode }) {
  const t = TONE[node.tone];
  return (
    <div
      className={cn(
        "rounded-[12px] border-[1.5px] p-[12px]",
        node.dashed ? cn("border-dashed", t.border) : t.frame,
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-[8px] gap-y-[2px]">
        <span className={cn("font-mono text-[13px] font-semibold", t.text)}>
          {node.label}
        </span>
        {node.note ? (
          <span className="text-[12px] text-ink-muted">{node.note}</span>
        ) : null}
      </div>

      {node.attach?.length ? (
        <div className="mt-[10px] flex flex-wrap items-center gap-[8px]">
          <span className="font-mono text-[12px] font-semibold text-[oklch(0.53_0.16_25)]">
            clips on →
          </span>
          {node.attach.map((a) => (
            <span
              key={a.label}
              className="rounded-[8px] border-[1.5px] border-[oklch(0.72_0.14_25)] bg-[oklch(0.96_0.04_25)] px-[10px] py-[6px] font-mono text-[12px] text-[oklch(0.53_0.16_25)]"
            >
              {a.label}
              {a.note ? (
                <span className="text-ink-muted"> · {a.note}</span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      {node.children?.length ? (
        <div className="mt-[10px] flex flex-col gap-[10px]">
          {node.children.map((child) => (
            <NestBox key={child.label} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Chapter 1: flip between the imagined nesting and the real one. */
export function NestingFlip({ content }: { content: NestingContent }) {
  const [showWrong, setShowWrong] = useState(false);
  const model = showWrong ? content.wrong : content.right;

  return (
    <>
      <div className="mt-[16px]">
        <button
          type="button"
          onClick={() => setShowWrong((v) => !v)}
          aria-pressed={showWrong}
          className="rounded-button border border-line bg-surface px-[15px] py-[9px] font-mono text-[13px] text-ink-soft transition-colors hover:border-ink-muted"
        >
          {showWrong
            ? "◂ Show: how it actually nests"
            : "Show: how it's often imagined ▸"}
        </button>
      </div>

      <div className="mt-[14px] rounded-[18px] border border-line bg-surface p-[20px]">
        <p
          className={cn(
            "font-mono text-[12px] font-semibold",
            model.correct
              ? "text-[oklch(0.48_0.1_150)]"
              : "text-[oklch(0.53_0.16_25)]",
          )}
        >
          {model.correct ? "✓" : "✕"} {model.caption}
        </p>
        <div className="mt-[12px]">
          <NestBox node={model.root} />
        </div>
        {model.footnote ? (
          <p className="mt-[12px] text-[13px] leading-[1.6] text-[oklch(0.53_0.16_25)]">
            {model.footnote}
          </p>
        ) : null}
      </div>

      {content.callouts.map((c) => (
        <Callout key={c.tag} {...c} />
      ))}
    </>
  );
}
