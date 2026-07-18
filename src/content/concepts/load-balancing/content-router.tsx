"use client";

import {
  ArrowRightIcon as ArrowRight,
  CheckCircleIcon as CheckCircle,
  CircleIcon as Circle,
  MinusCircleIcon as MinusCircle,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RouteRule, RouterContent, RouterRequest } from "./data";
import { TONE } from "./tones";

/** True when a request satisfies a rule's host-equals or path-prefix condition. */
function matches(request: RouterRequest, rule: RouteRule): boolean {
  if (rule.kind === "host") return request.host === rule.pattern;
  return (
    request.path === rule.pattern || request.path.startsWith(`${rule.pattern}/`)
  );
}

/**
 * Chapter 3: routing by content. Pick a request and watch a Layer 7 balancer
 * evaluate its rules top to bottom, first match wins, to choose a pool. Flip to
 * Layer 4 and the rules disappear: every request goes to one pool by port.
 */
export function ContentRouter({ content }: { content: RouterContent }) {
  const [mode, setMode] = useState<"l7" | "l4">("l7");
  const [requestId, setRequestId] = useState(content.requests[0].id);
  const request =
    content.requests.find((r) => r.id === requestId) ?? content.requests[0];

  const matchIndex = content.rules.findIndex((rule) => matches(request, rule));
  const target =
    mode === "l4"
      ? content.defaultTarget
      : matchIndex >= 0
        ? content.rules[matchIndex].target
        : content.defaultTarget;
  const tone = mode === "l4" ? TONE.l4 : TONE.l7;

  return (
    <div className="mt-[16px]">
      <div
        role="tablist"
        aria-label="Balancer layer"
        className="flex gap-[8px]"
      >
        {(
          [
            { id: "l7", label: "Layer 7 · reads the request" },
            { id: "l4", label: "Layer 4 · port only" },
          ] as const
        ).map((tab) => {
          const active = mode === tab.id;
          const tt = TONE[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(tab.id)}
              className={cn(
                "flex-1 rounded-[12px] border-[1.5px] px-[13px] py-[10px] text-left font-mono text-[12.5px] font-semibold transition-colors",
                active
                  ? cn(tt.frame, tt.text)
                  : "border-line bg-surface text-ink-soft hover:border-ink-muted",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-[8px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            Incoming request
          </p>
          {content.requests.map((r) => {
            const active = r.id === requestId;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={active}
                onClick={() => setRequestId(r.id)}
                className={cn(
                  "rounded-[12px] border px-[13px] py-[10px] text-left transition-colors",
                  active
                    ? "border-teal-ring bg-surface"
                    : "border-line bg-surface hover:border-ink-muted",
                )}
              >
                <span className="text-[13.5px] font-semibold text-ink-strong">
                  {r.label}
                </span>
                <span className="mt-[3px] block break-all font-mono text-[11.5px] text-ink-muted">
                  {r.host}
                  {r.path}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={`${mode}-${requestId}`}
          className="rounded-[18px] border border-line bg-surface p-[18px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            {mode === "l4"
              ? "No rules · routes by listener port"
              : content.rulesLabel}
          </p>

          {mode === "l7" ? (
            <div className="mt-[12px] flex flex-col gap-[7px]">
              {content.rules.map((rule, i) => {
                const state =
                  matchIndex < 0
                    ? "nomatch"
                    : i < matchIndex
                      ? "nomatch"
                      : i === matchIndex
                        ? "match"
                        : "unreached";
                return <RuleRow key={rule.id} rule={rule} state={state} />;
              })}
              <div
                className={cn(
                  "flex items-center justify-between gap-[10px] rounded-[10px] border border-dashed px-[12px] py-[9px]",
                  matchIndex < 0
                    ? cn(TONE.l7.border, "bg-surface-muted")
                    : "border-line",
                )}
              >
                <span className="font-mono text-[12px] text-ink-muted">
                  Default · matches nothing else
                </span>
                <span className="font-mono text-[12px] font-semibold text-ink-strong">
                  {content.defaultTarget}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-[12px] text-pretty text-[13.5px] leading-[1.6] text-body">
              {content.l4Fallback}
            </p>
          )}

          <div className="mt-[16px] flex flex-wrap items-center gap-[10px]">
            <span className="font-mono text-[12px] text-ink-muted">
              {request.path}
            </span>
            <span aria-hidden className="text-ink-muted">
              <ArrowRight size={16} weight="bold" />
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-[8px] rounded-full border-[1.5px] px-[14px] py-[6px] font-mono text-[13px] font-semibold",
                tone.frame,
                tone.text,
              )}
            >
              <span className={cn("h-[9px] w-[9px] rounded-full", tone.dot)} />
              {target}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RuleRow({
  rule,
  state,
}: {
  rule: RouteRule;
  state: "match" | "nomatch" | "unreached";
}) {
  const tone = state === "match" ? TONE.l7 : TONE.neutral;
  const Icon =
    state === "match"
      ? CheckCircle
      : state === "unreached"
        ? MinusCircle
        : Circle;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-[10px] rounded-[10px] border px-[12px] py-[9px] transition-colors",
        state === "match"
          ? cn(tone.frame, "border-[1.5px]")
          : "border-line bg-surface",
        state === "unreached" && "opacity-55",
      )}
    >
      <span className="flex items-center gap-[8px]">
        <Icon
          size={15}
          weight={state === "match" ? "fill" : "regular"}
          aria-hidden
          className={
            state === "match" ? "text-[oklch(0.5_0.11_215)]" : "text-ink-muted"
          }
        />
        <span className="font-mono text-[12px] text-ink-strong">
          {rule.label}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 font-mono text-[12px] font-semibold",
          state === "match" ? tone.text : "text-ink-muted",
        )}
      >
        {rule.target}
      </span>
    </div>
  );
}
