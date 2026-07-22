"use client";

import {
  CompassIcon as Compass,
  FileTextIcon as FileText,
  StackIcon as Stack,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SeverityDot } from "@/components/investigation/badges";
import { SOURCE_PLATFORM_LABELS } from "@/components/investigation/types";
import { investigationsByPlatform } from "@/content/investigations";
import { cn } from "@/lib/utils";

const groups = investigationsByPlatform();

/**
 * The grouped Investigation navigation shared by the desktop sidebar and the
 * mobile drawer: top-level links to Orientation, the Baseline reference, and the
 * queue landing, then every Investigation grouped by its source platform. Rows are single-line (a severity
 * dot plus the title) to stay dense as the catalog grows; full severity and
 * difficulty live in the queue and on each detail page. The entry matching the
 * current URL is highlighted by a teal rail. Unlike the concept nav this carries
 * no provider in its links (Investigations sit outside the provider lens,
 * ADR-0004). `onNavigate` lets the mobile drawer close itself when one is chosen.
 */
export function InvestigationNavList({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const orientationHref = "/investigations/orientation";
  const orientationActive = pathname === orientationHref;
  const baselineHref = "/investigations/baseline";
  const baselineActive = pathname === baselineHref;
  const queueHref = "/investigations";
  const queueActive = pathname === queueHref;

  return (
    <nav aria-label="Investigations">
      <Link
        href={orientationHref}
        onClick={onNavigate}
        aria-current={orientationActive ? "page" : undefined}
        className={cn(
          "relative mb-[22px] flex items-center gap-[9px] rounded-[10px] py-[9px] pl-[14px] pr-[10px] transition-colors",
          orientationActive
            ? "bg-teal-soft"
            : "hover:bg-[oklch(0.96_0.012_195)]",
        )}
      >
        {orientationActive ? (
          <span
            aria-hidden
            className="absolute bottom-[8px] left-[4px] top-[8px] w-[3px] rounded-[2px] bg-teal-ring"
          />
        ) : null}
        <Compass
          size={17}
          weight="bold"
          aria-hidden
          className="shrink-0 text-teal"
        />
        <span className="flex min-w-0 flex-col">
          <span className="text-[13.5px] font-medium text-ink-strong">
            Orientation
          </span>
          <span className="text-[11.5px] text-ink-muted">Start here</span>
        </span>
      </Link>
      <Link
        href={baselineHref}
        onClick={onNavigate}
        aria-current={baselineActive ? "page" : undefined}
        className={cn(
          "relative mb-[4px] flex items-center gap-[9px] rounded-[8px] py-[7px] pl-[14px] pr-[9px] transition-colors",
          baselineActive ? "bg-teal-soft" : "hover:bg-[oklch(0.96_0.012_195)]",
        )}
      >
        {baselineActive ? (
          <span
            aria-hidden
            className="absolute bottom-[6px] left-[4px] top-[6px] w-[3px] rounded-[2px] bg-teal-ring"
          />
        ) : null}
        <FileText
          size={16}
          weight="bold"
          aria-hidden
          className="shrink-0 text-teal"
        />
        <span className="text-[13px] font-medium text-ink-strong">
          Baseline
        </span>
      </Link>
      <Link
        href={queueHref}
        onClick={onNavigate}
        aria-current={queueActive ? "page" : undefined}
        className={cn(
          "relative flex items-center gap-[9px] rounded-[8px] py-[7px] pl-[14px] pr-[9px] transition-colors",
          queueActive ? "bg-teal-soft" : "hover:bg-[oklch(0.96_0.012_195)]",
        )}
      >
        {queueActive ? (
          <span
            aria-hidden
            className="absolute bottom-[6px] left-[4px] top-[6px] w-[3px] rounded-[2px] bg-teal-ring"
          />
        ) : null}
        <Stack
          size={16}
          weight="bold"
          aria-hidden
          className="shrink-0 text-teal"
        />
        <span className="text-[13px] font-medium text-ink-strong">
          Alert queue
        </span>
      </Link>
      {groups.map((group) => (
        <div key={group.platform} className="mt-[16px]">
          <div className="flex items-baseline gap-[7px] px-[10px] py-[4px]">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
              {SOURCE_PLATFORM_LABELS[group.platform]}
            </span>
            <span className="font-mono text-[10.5px] text-faint">
              {group.items.length}
            </span>
          </div>
          {group.items.map((investigation) => {
            const href = `/investigations/${investigation.id}`;
            const active = pathname === href;
            return (
              <Link
                key={investigation.id}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={investigation.title}
                className={cn(
                  "relative flex w-full items-center gap-[9px] rounded-[8px] py-[6px] pl-[14px] pr-[9px] transition-colors",
                  active ? "bg-teal-soft" : "hover:bg-[oklch(0.96_0.012_195)]",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute bottom-[6px] left-[4px] top-[6px] w-[3px] rounded-[2px] bg-teal-ring"
                  />
                ) : null}
                <SeverityDot severity={investigation.severity} />
                <span className="truncate text-[13px] font-medium text-ink-soft">
                  {investigation.title}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
