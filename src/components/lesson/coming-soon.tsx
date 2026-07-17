import { EquivalencePanel } from "@/components/lesson/equivalence-panel";
import { LessonLayout } from "@/components/lesson/lesson-layout";
import type { Concept, Provider } from "@/content/types";

/**
 * Placeholder lesson for a concept that is in the catalog but whose lesson
 * hasn't been authored yet. It still shows the cross-provider equivalence from
 * the concept's metadata, so the page is useful rather than a dead end.
 */
export function ComingSoonLesson({
  concept,
  provider,
}: {
  concept: Concept;
  provider: Provider;
}) {
  return (
    <LessonLayout concept={concept} provider={provider} blurb={concept.short}>
      <EquivalencePanel
        provider={provider}
        aws={{ service: concept.services.aws ?? "—" }}
        azure={{ service: concept.services.azure ?? "—" }}
      />
      <div className="mt-[34px] rounded-[18px] border border-dashed border-line bg-surface p-[26px] text-center">
        <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-faint">
          Lesson in progress
        </div>
        <p className="mx-auto mt-[10px] max-w-[44ch] text-[14px] leading-[1.55] text-body-soft">
          {`The full ${concept.title} lesson is being written. The cross-provider equivalence above is the shape of what’s coming.`}
        </p>
      </div>
    </LessonLayout>
  );
}
