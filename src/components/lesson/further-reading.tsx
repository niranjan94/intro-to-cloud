import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { SectionHeading } from "@/components/lesson/section-heading";

export interface DocLink {
  label: string;
  href: string;
  note?: string;
}

/**
 * A short list of links to the authoritative provider documentation for the
 * active lens, so a reader can go deeper on the real service. The links are
 * per-provider and swap with the lens. Renders nothing if empty.
 */
export function FurtherReading({ links }: { links: DocLink[] }) {
  if (links.length === 0) return null;

  return (
    <>
      <SectionHeading>Further reading</SectionHeading>
      <div className="mt-[16px] grid grid-cols-1 gap-[12px] min-[760px]:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group block rounded-[14px] border border-line bg-surface p-[16px] transition-colors hover:border-ink-muted"
          >
            <div className="flex items-center gap-[8px] font-mono text-[13px] font-semibold text-teal-ink">
              <span>{link.label}</span>
              <span
                aria-hidden="true"
                className="text-ink-muted transition-colors group-hover:text-teal-ink"
              >
                <ArrowUpRight size={14} weight="bold" />
              </span>
            </div>
            {link.note ? (
              <div className="mt-[6px] text-pretty text-[13.5px] leading-[1.5] text-body-soft">
                {link.note}
              </div>
            ) : null}
          </a>
        ))}
      </div>
    </>
  );
}
