"use client";

import {
  EyeIcon as Eye,
  EyeSlashIcon as EyeSlash,
  LockKeyIcon as LockKey,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InspectorContent } from "./data";
import { TONE } from "./tones";

/**
 * Chapter 2: what each layer can read. Toggle between Layer 4 and Layer 7 and
 * watch the HTTP request open or seal shut. A Layer 4 balancer sees only the
 * transport envelope; a Layer 7 balancer reads the request inside it. What it
 * can see is exactly what it can route on.
 */
export function LayerInspector({ content }: { content: InspectorContent }) {
  const [layer, setLayer] = useState<"l4" | "l7">("l4");
  const facet =
    content.facets.find((f) => f.layer === layer) ?? content.facets[0];
  const tone = TONE[layer];
  const open = layer === "l7";
  const { transport, application } = content.request;

  return (
    <div className="mt-[16px]">
      <div
        role="tablist"
        aria-label="Load balancer layer"
        className="flex gap-[8px]"
      >
        {content.facets.map((f) => {
          const active = f.layer === layer;
          const ft = TONE[f.layer];
          return (
            <button
              key={f.layer}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setLayer(f.layer)}
              className={cn(
                "flex-1 rounded-[12px] border-[1.5px] px-[14px] py-[11px] text-left transition-colors",
                active
                  ? ft.frame
                  : "border-line bg-surface hover:border-ink-muted",
              )}
            >
              <span className="flex items-center gap-[8px]">
                <span
                  className={cn("h-[10px] w-[10px] rounded-full", ft.dot)}
                />
                <span
                  className={cn(
                    "font-mono text-[13px] font-semibold",
                    active ? ft.text : "text-ink-soft",
                  )}
                >
                  {f.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[18px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            One request arriving
          </p>

          <div className="mt-[12px] rounded-[14px] border-[1.5px] border-line bg-surface-muted p-[14px]">
            <div className="flex items-center gap-[7px] font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
              <Eye size={13} aria-hidden />
              Transport header · always visible
            </div>
            <dl className="mt-[10px] grid grid-cols-2 gap-[8px] font-mono text-[12px]">
              <Field
                label="Source"
                value={`${transport.srcIp}:${transport.srcPort}`}
              />
              <Field
                label="Destination"
                value={`${transport.dstIp}:${transport.dstPort}`}
              />
              <Field label="Protocol" value={transport.protocol} />
            </dl>

            <div
              className={cn(
                "relative mt-[12px] rounded-[12px] border-[1.5px] p-[14px] transition-colors",
                open ? TONE.l7.frame : "border-dashed border-line bg-surface",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-[7px] font-mono text-[10.5px] uppercase tracking-[0.05em]",
                  open ? TONE.l7.text : "text-ink-muted",
                )}
              >
                {open ? (
                  <Eye size={13} aria-hidden />
                ) : (
                  <LockKey size={13} aria-hidden />
                )}
                HTTP request{" "}
                {open ? "· read by Layer 7" : "· sealed to Layer 4"}
              </div>

              <div
                className={cn("mt-[10px]", !open && "select-none blur-[3px]")}
                aria-hidden={!open}
              >
                <div className="font-mono text-[12.5px] text-ink-strong">
                  {application.method} {application.path}
                </div>
                <div className="mt-[6px] font-mono text-[12px] text-body">
                  Host: {application.host}
                </div>
                {application.headers.map((h) => (
                  <div
                    key={h.name}
                    className="mt-[3px] font-mono text-[11.5px] text-ink-muted"
                  >
                    {h.name}: {h.value}
                  </div>
                ))}
              </div>

              {!open ? (
                <div className="mt-[8px] flex items-center gap-[7px] font-mono text-[11.5px] text-ink-muted">
                  <LockKey size={14} weight="fill" aria-hidden />A Layer 4
                  balancer never opens this.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          key={layer}
          className={cn(
            "rounded-[18px] border-[1.5px] p-[18px] motion-safe:animate-[fadeUp_0.3s_ease_both]",
            tone.frame,
          )}
        >
          <span
            className={cn(
              "inline-flex items-center gap-[7px] rounded-full px-[11px] py-[4px] font-mono text-[12px] font-semibold text-white",
              tone.chip,
            )}
          >
            {facet.service}
          </span>

          <p className="mt-[14px] flex items-center gap-[7px] font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted">
            <Eye size={13} aria-hidden /> Reads
          </p>
          <ul className="mt-[8px] flex flex-col gap-[6px]">
            {facet.sees.map((item) => (
              <li
                key={item}
                className="flex gap-[9px] text-[13.5px] leading-[1.5] text-body"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-[7px] h-[6px] w-[6px] flex-none rounded-full",
                    tone.dot,
                  )}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {facet.blind.length > 0 ? (
            <>
              <p className="mt-[14px] flex items-center gap-[7px] font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted">
                <EyeSlash size={13} aria-hidden /> Blind to
              </p>
              <ul className="mt-[8px] flex flex-col gap-[6px]">
                {facet.blind.map((item) => (
                  <li
                    key={item}
                    className="flex gap-[9px] text-[13.5px] leading-[1.5] text-body"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-[7px] h-[6px] w-[6px] flex-none rounded-full",
                        TONE.down.dot,
                      )}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <div
            className={cn(
              "mt-[16px] rounded-[12px] border p-[13px]",
              tone.border,
              "bg-surface",
            )}
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
              Routes on
            </p>
            <p className="mt-[5px] text-[13px] leading-[1.6] text-body">
              {facet.routesOn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.04em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-[2px] text-ink-strong">{value}</dd>
    </div>
  );
}
