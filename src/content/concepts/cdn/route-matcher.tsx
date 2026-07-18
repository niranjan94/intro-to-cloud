"use client";

import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RouteContent, RouteRule } from "./data";

function matches(pattern: string, path: string): boolean {
  if (pattern === "*" || pattern === "/*") return true;
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  return path === pattern;
}

function rank(pattern: string): { exact: boolean; len: number } {
  const exact = !pattern.includes("*");
  const prefix = exact ? pattern : pattern.replace(/\/?\*$/, "");
  return { exact, len: prefix.length };
}

/** Resolve a path to the winning rule under the provider's matching algorithm. */
function resolve(
  rules: RouteRule[],
  path: string,
  order: RouteContent["matchOrder"],
): RouteRule | null {
  const matched = rules.filter((r) => matches(r.pattern, path));
  if (matched.length === 0) return null;
  if (order === "first") return matched[0];
  return [...matched].sort((a, b) => {
    const ra = rank(a.pattern);
    const rb = rank(b.pattern);
    if (ra.exact !== rb.exact) return ra.exact ? -1 : 1;
    return rb.len - ra.len;
  })[0];
}

/** Chapter 4: pick a path and see which rule claims it, and why. */
export function RouteMatcher({ content }: { content: RouteContent }) {
  const [path, setPath] = useState(content.samplePaths[0]);
  const winner = resolve(content.rules, path, content.matchOrder);

  return (
    <div className="mt-[16px]">
      <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
        Request path
      </p>
      <div className="mt-[10px] flex flex-wrap gap-[8px]">
        {content.samplePaths.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={p === path}
            onClick={() => setPath(p)}
            className={cn(
              "rounded-full border px-[13px] py-[7px] font-mono text-[12px] transition-colors",
              p === path
                ? "border-teal-ring bg-teal-tint text-teal-ink"
                : "border-line bg-surface text-ink-soft hover:border-ink-muted",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[16px]">
          <p className="px-[2px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
            {content.ruleTerm}s, in the order defined
          </p>
          <div className="mt-[10px] flex flex-col gap-[8px]">
            {content.rules.map((rule, i) => {
              const isWinner = winner?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  className={cn(
                    "rounded-[12px] border px-[13px] py-[11px] transition-colors",
                    isWinner
                      ? "border-[1.5px] border-teal-ring bg-teal-tint"
                      : "border-line bg-surface",
                  )}
                >
                  <div className="flex items-center justify-between gap-[10px]">
                    <span className="flex items-center gap-[8px]">
                      <span className="font-mono text-[10.5px] text-line">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[13px] font-semibold",
                          isWinner ? "text-teal-ink" : "text-ink-strong",
                        )}
                      >
                        {rule.pattern}
                      </span>
                    </span>
                    {isWinner ? (
                      <span className="rounded-full bg-[oklch(0.46_0.08_195)] px-[9px] py-[2px] font-mono text-[10px] text-white">
                        match
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-[6px] pl-[26px] font-mono text-[11.5px] text-ink-muted">
                    {rule.origin} · {rule.note}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-surface-muted p-[18px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            Result for {path}
          </p>
          {winner ? (
            <>
              <h3 className="mt-[8px] inline-flex items-center gap-[6px] text-[16px] font-semibold text-teal-ink">
                <ArrowRight size={16} weight="bold" aria-hidden />
                {winner.origin}
              </h3>
              <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
                The <span className="font-mono">{winner.pattern}</span>{" "}
                {content.ruleTerm} claims this request.
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-[8px] text-[16px] font-semibold text-[oklch(0.5_0.16_25)]">
                404 · no origin
              </h3>
              <p className="mt-[8px] text-[13.5px] leading-[1.6] text-body">
                {content.noMatch}
              </p>
            </>
          )}
          <div className="mt-[14px] rounded-[12px] border border-line bg-surface p-[12px]">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
              How the winner is chosen
            </p>
            <p className="mt-[5px] text-[13px] leading-[1.6] text-body">
              {content.algorithm}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>
    </div>
  );
}
