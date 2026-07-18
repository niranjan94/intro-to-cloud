"use client";

import {
  ArrowRightIcon as ArrowRight,
  CheckIcon as Check,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CacheKeyContent, KeyPart } from "./data";

/** Build the visible key string from the parts currently switched into it. */
function keyOf(parts: KeyPart[], on: Record<string, boolean>, side: "a" | "b") {
  return parts
    .filter((p) => p.locked || on[p.id])
    .map((p) => (side === "a" ? p.aValue : p.bValue))
    .join("  ·  ");
}

/** Chapter 3: switch request components into the cache key and watch for a collision. */
export function CacheKeyExplorer({ content }: { content: CacheKeyContent }) {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      content.parts.map((p) => [p.id, Boolean(p.locked || p.defaultOn)]),
    ),
  );

  const keyA = keyOf(content.parts, on, "a");
  const keyB = keyOf(content.parts, on, "b");
  const collide = keyA === keyB;

  return (
    <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[860px]:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[18px] border border-line bg-surface p-[16px]">
        <p className="px-[2px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          In the cache key
        </p>
        <p className="mt-[4px] px-[2px] font-mono text-[11px] leading-[1.5] text-ink-muted">
          Shaped by the {content.configName}.
        </p>
        <div className="mt-[12px] flex flex-col gap-[8px]">
          {content.parts.map((part) => {
            const checked = Boolean(part.locked || on[part.id]);
            return (
              <div
                key={part.id}
                className={cn(
                  "rounded-[12px] border px-[13px] py-[11px]",
                  checked
                    ? "border-teal-line bg-teal-tint"
                    : "border-line bg-surface",
                )}
              >
                <label
                  className={cn(
                    "flex select-none items-center gap-[10px]",
                    part.locked ? "cursor-default" : "cursor-pointer",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={part.locked}
                    onChange={(e) =>
                      setOn((prev) => ({
                        ...prev,
                        [part.id]: e.target.checked,
                      }))
                    }
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "relative h-[22px] w-[38px] shrink-0 rounded-full border-[1.5px] transition-colors",
                      "after:absolute after:left-[2px] after:top-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:transition-transform",
                      checked
                        ? "border-teal-ring bg-teal-soft after:translate-x-[16px] after:bg-teal-ring"
                        : "border-line bg-surface-muted after:bg-ink-muted",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-teal-ring",
                      part.locked && "opacity-70",
                    )}
                  />
                  <span className="font-mono text-[12.5px] text-body">
                    {part.label}
                    {part.locked ? (
                      <span className="text-ink-muted"> (always on)</span>
                    ) : null}
                  </span>
                </label>
                <p className="mt-[7px] pl-[48px] text-[12px] leading-[1.5] text-ink-muted">
                  {part.hint}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-[12px]">
        <RequestCard
          title="Request A"
          badge="already cached"
          path={content.requestPath}
          keyText={keyA}
        />
        <RequestCard
          title="Request B"
          badge="arrives next"
          path={content.requestPath}
          keyText={keyB}
        />

        <div
          className={cn(
            "rounded-[14px] border-[1.5px] p-[16px]",
            collide
              ? "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)]"
              : "border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.035_80)]",
          )}
        >
          <div className="flex items-center gap-[8px]">
            <span
              className={cn(
                "h-[11px] w-[11px] rounded-full",
                collide
                  ? "bg-[oklch(0.58_0.12_150)]"
                  : "bg-[oklch(0.66_0.12_70)]",
              )}
            />
            <span
              className={cn(
                "inline-flex items-center gap-[6px] text-[15px] font-semibold",
                collide
                  ? "text-[oklch(0.44_0.1_150)]"
                  : "text-[oklch(0.5_0.1_70)]",
              )}
            >
              {collide ? (
                <Check size={16} weight="bold" aria-hidden />
              ) : (
                <ArrowRight size={16} weight="bold" aria-hidden />
              )}
              {collide ? "Same key · cache hit" : "Different key · cache miss"}
            </span>
          </div>
          <p className="mt-[7px] text-[13px] leading-[1.6] text-body">
            {collide
              ? "Both requests build the identical key, so request B is served from request A's cached copy. One object serves both."
              : "The requests build different keys, so request B is a separate object. The edge must fetch and store it too, and your hit ratio drops."}
          </p>
        </div>

        <p className="text-pretty text-[12.5px] leading-[1.6] text-ink-muted">
          {content.note}
        </p>
      </div>
    </div>
  );
}

function RequestCard({
  title,
  badge,
  path,
  keyText,
}: {
  title: string;
  badge: string;
  path: string;
  keyText: string;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-[14px]">
      <div className="flex items-center justify-between gap-[8px]">
        <span className="text-[13px] font-semibold text-ink-strong">
          {title}
        </span>
        <span className="rounded-full bg-surface-muted px-[10px] py-[3px] font-mono text-[10.5px] text-ink-muted">
          {badge}
        </span>
      </div>
      <div className="mt-[8px] font-mono text-[11.5px] text-ink-muted">
        GET {path}
      </div>
      <div className="mt-[8px] rounded-[10px] bg-panel-deep px-[12px] py-[10px]">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[oklch(0.7_0.03_195)]">
          cache key
        </div>
        <div className="mt-[3px] break-all font-mono text-[12px] leading-[1.6] text-[oklch(0.88_0.02_195)]">
          {keyText}
        </div>
      </div>
    </div>
  );
}
