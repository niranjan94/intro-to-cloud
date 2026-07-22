import type { Aspect, Difficulty } from "@/components/investigation/types";
import { Switch } from "@/components/lesson/controls";

/**
 * The Identify phase: the learner selects which aspects of the alert look
 * suspicious from a checklist that mixes real signals with plausible decoys.
 * This is a pure selection step; nothing is graded or revealed here (the "why"
 * is taught in Justify, the score in the result). Scaffolding is difficulty
 * gated: Guided reveals how many real signals the list contains, Standard and
 * Challenge do not.
 */
export function IdentifyPhase({
  aspects,
  difficulty,
  selected,
  onToggle,
}: {
  aspects: Aspect[];
  difficulty: Difficulty;
  selected: ReadonlySet<string>;
  onToggle: (id: string, value: boolean) => void;
}) {
  const signalCount = aspects.filter((a) => a.signal).length;

  return (
    <div className="mt-[16px]">
      {difficulty === "guided" ? (
        <p className="mb-[14px] inline-flex rounded-[10px] border border-teal-line bg-teal-tint px-[12px] py-[7px] font-mono text-[12px] text-teal-ink">
          Guided hint: {signalCount} of these {aspects.length} are genuine
          signals.
        </p>
      ) : (
        <p className="mb-[14px] text-[13.5px] leading-[1.6] text-body">
          Some of these are real signals worth acting on; others are normal
          noise included to mislead. Select the ones you would flag.
        </p>
      )}

      <div className="flex flex-col gap-[12px] rounded-[16px] border border-line bg-surface p-[18px]">
        {aspects.map((aspect) => (
          <Switch
            key={aspect.id}
            checked={selected.has(aspect.id)}
            onChange={(value) => onToggle(aspect.id, value)}
            label={aspect.label}
          />
        ))}
      </div>

      <p className="mt-[12px] font-mono text-[12px] text-ink-muted">
        {selected.size} selected
      </p>
    </div>
  );
}
