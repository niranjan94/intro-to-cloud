"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { conceptsByCategory } from "@/content/registry";
import { CATEGORY_META, type Provider } from "@/content/types";
import { cn } from "@/lib/utils";

const groups = conceptsByCategory();

/**
 * The concept sidebar: every concept grouped by category, each row showing its
 * title and the active provider's service name. The row for the concept in the
 * current URL is highlighted with a teal rail. Links stay within the active
 * provider so navigating concepts keeps the lens.
 */
export function Sidebar({ provider }: { provider: Provider }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-[var(--topbar-height)] hidden h-[calc(100vh-var(--topbar-height))] w-[264px] shrink-0 self-start overflow-auto border-r border-line px-[16px] pb-[40px] pt-[26px] min-[760px]:block max-[1000px]:w-[208px]">
      <div className="px-[10px] pb-[4px] font-mono text-[11px] tracking-[0.1em] text-faint">
        CONCEPTS
      </div>
      {groups.map((group) => (
        <div key={group.category} className="mt-[20px]">
          <div className="flex items-center gap-[8px] px-[10px] py-[4px]">
            <span
              aria-hidden
              className="inline-block h-[9px] w-[9px] shrink-0 rounded-[3px]"
              style={{ background: CATEGORY_META[group.category].accent }}
            />
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-muted">
              {group.category}
            </span>
          </div>
          {group.concepts.map((concept) => {
            const href = `/${provider}/${concept.id}`;
            const active = pathname === href;
            return (
              <Link
                key={concept.id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex w-full items-center gap-[10px] rounded-[10px] py-[9px] pl-[14px] pr-[10px] transition-colors",
                  active ? "bg-teal-soft" : "hover:bg-[oklch(0.96_0.012_195)]",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute bottom-[8px] left-[4px] top-[8px] w-[3px] rounded-[2px] bg-teal-ring"
                  />
                ) : null}
                <span className="flex min-w-0 flex-col items-start gap-[1px]">
                  <span className="text-[13.5px] font-medium text-ink-strong">
                    {concept.title}
                  </span>
                  <span className="max-w-[180px] truncate font-mono text-[11px] text-teal">
                    {concept.services[provider]}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
