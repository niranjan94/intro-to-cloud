import { SectionHeading } from "@/components/lesson/section-heading";

export interface GlossaryTerm {
  term: string;
  definition: string;
}

/** A two-column grid of key terms for a lesson. Renders nothing if empty. */
export function Glossary({ terms }: { terms: GlossaryTerm[] }) {
  if (terms.length === 0) return null;

  return (
    <>
      <SectionHeading>Key terms</SectionHeading>
      <div className="mt-[16px] grid grid-cols-1 gap-[12px] min-[760px]:grid-cols-2">
        {terms.map((entry) => (
          <div
            key={entry.term}
            className="rounded-[14px] border border-line bg-surface p-[16px]"
          >
            <div className="font-mono text-[13px] font-semibold text-teal-ink">
              {entry.term}
            </div>
            <div className="mt-[6px] text-pretty text-[13.5px] leading-[1.5] text-body-soft">
              {entry.definition}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
