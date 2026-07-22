import { InfoIcon as Info } from "@phosphor-icons/react/dist/ssr";
import type { Aspect } from "@/components/investigation/types";
import { cn } from "@/lib/utils";

/**
 * The Justify phase: for every real signal in the alert, the learner picks the
 * reasoning that explains why it matters. Questions are shown for all signals,
 * not just the ones the learner flagged in Identify, so a missed signal is still
 * taught. Any decoy the learner wrongly flagged is surfaced first as a
 * corrective note. Answers are recorded on the flow and graded in the result.
 */
export function JustifyPhase({
  aspects,
  selected,
  answers,
  onAnswer,
}: {
  aspects: Aspect[];
  selected: ReadonlySet<string>;
  answers: Record<string, number>;
  onAnswer: (id: string, choice: number) => void;
}) {
  const signals = aspects.filter((a) => a.signal && a.reasoning);
  const pickedDecoys = aspects.filter((a) => !a.signal && selected.has(a.id));

  return (
    <div className="mt-[16px] flex flex-col gap-[14px]">
      {pickedDecoys.length > 0 ? (
        <div className="rounded-[14px] border border-line bg-surface-muted p-[16px]">
          <p className="flex items-center gap-[7px] font-mono text-[11.5px] uppercase tracking-[0.05em] text-ink-muted">
            <Info size={14} weight="bold" aria-hidden />
            Not signals
          </p>
          <ul className="mt-[8px] flex flex-col gap-[8px]">
            {pickedDecoys.map((decoy) => (
              <li
                key={decoy.id}
                className="text-[13px] leading-[1.6] text-body"
              >
                <span className="font-medium text-ink-strong">
                  {decoy.label}.
                </span>{" "}
                {decoy.note ??
                  "This is normal activity, not an indicator of compromise."}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {signals.map((aspect) => (
        <JustifyQuestion
          key={aspect.id}
          aspect={aspect}
          missed={!selected.has(aspect.id)}
          chosen={answers[aspect.id]}
          onAnswer={(choice) => onAnswer(aspect.id, choice)}
        />
      ))}
    </div>
  );
}

function JustifyQuestion({
  aspect,
  missed,
  chosen,
  onAnswer,
}: {
  aspect: Aspect;
  missed: boolean;
  chosen: number | undefined;
  onAnswer: (choice: number) => void;
}) {
  // `reasoning` is guaranteed present by the caller's filter.
  const reasoning = aspect.reasoning as NonNullable<Aspect["reasoning"]>;
  const done = chosen !== undefined;

  return (
    <div className="rounded-[16px] border border-line bg-surface p-[20px]">
      <div className="flex flex-wrap items-center gap-[8px]">
        <h4 className="text-[15px] font-semibold text-ink-strong">
          {aspect.label}
        </h4>
        {missed ? (
          <span className="rounded-[5px] border border-[oklch(0.8_0.1_85)] bg-[oklch(0.97_0.04_85)] px-[6px] py-[1px] font-mono text-[9.5px] uppercase tracking-[0.08em] text-[oklch(0.5_0.1_85)]">
            Missed in Identify
          </span>
        ) : null}
      </div>
      <p className="mt-[8px] text-[14px] leading-[1.6] text-body">
        {reasoning.prompt}
      </p>
      <div className="mt-[12px] flex flex-col gap-[8px]">
        {reasoning.options.map((opt, oi) => {
          const isAnswer = oi === reasoning.correct;
          const isChosen = oi === chosen;
          return (
            <button
              key={opt}
              type="button"
              disabled={done}
              onClick={() => onAnswer(oi)}
              className={cn(
                "rounded-[10px] border px-[14px] py-[11px] text-left text-[14px] transition-colors",
                !done && "border-line bg-surface hover:border-ink-muted",
                done &&
                  isAnswer &&
                  "border-[oklch(0.72_0.12_150)] bg-[oklch(0.96_0.04_150)] text-ink-strong",
                done &&
                  isChosen &&
                  !isAnswer &&
                  "border-[oklch(0.72_0.14_25)] bg-[oklch(0.96_0.04_25)] text-ink-strong",
                done && !isAnswer && !isChosen && "border-line opacity-70",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {done && aspect.note ? (
        <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
          {aspect.note}
        </p>
      ) : null}
    </div>
  );
}
