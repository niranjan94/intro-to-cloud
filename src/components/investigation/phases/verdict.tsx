import {
  ArrowUpRightIcon as ArrowUpRight,
  CheckCircleIcon as CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { ResultPanel } from "@/components/investigation/results";
import type {
  Disposition,
  Investigation,
} from "@/components/investigation/types";
import { cn } from "@/lib/utils";

/**
 * The Verdict phase: the learner makes the headline call, Escalate or Close.
 * Choosing is terminal for the attempt; the result (correct/wrong call plus the
 * quality breakdown and the explanation) is revealed inline below the choice.
 */
export function VerdictPhase({
  investigation,
  selected,
  justify,
  extract,
  disposition,
  onChoose,
}: {
  investigation: Investigation;
  selected: ReadonlySet<string>;
  justify: Record<string, number>;
  extract: Record<string, string>;
  disposition: Disposition | null;
  onChoose: (call: Disposition) => void;
}) {
  return (
    <div className="mt-[16px]">
      <p className="text-[13.5px] leading-[1.6] text-body">
        You have reviewed the evidence, flagged the signals, and pulled the
        indicators. Make the call: is this a true positive worth escalating, or
        do you close it as benign?
      </p>

      <div className="mt-[16px] grid grid-cols-1 gap-[12px] min-[520px]:grid-cols-2">
        <VerdictButton
          call="escalate"
          active={disposition === "escalate"}
          onChoose={onChoose}
          icon={<ArrowUpRight size={18} weight="bold" aria-hidden />}
          title="Escalate"
          caption="True positive. Hand it up the escalation path."
        />
        <VerdictButton
          call="close"
          active={disposition === "close"}
          onChoose={onChoose}
          icon={<CheckCircle size={18} weight="bold" aria-hidden />}
          title="Close"
          caption="Benign or a false positive. Note it and close."
        />
      </div>

      {disposition ? (
        <ResultPanel
          investigation={investigation}
          answers={{ selected, justify, extract, disposition }}
        />
      ) : null}
    </div>
  );
}

function VerdictButton({
  call,
  active,
  onChoose,
  icon,
  title,
  caption,
}: {
  call: Disposition;
  active: boolean;
  onChoose: (call: Disposition) => void;
  icon: React.ReactNode;
  title: string;
  caption: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChoose(call)}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-[6px] rounded-[14px] border p-[16px] text-left transition-colors",
        active
          ? "border-teal-ring bg-teal-tint"
          : "border-line bg-surface hover:border-ink-muted",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-[8px] text-[16px] font-semibold",
          active ? "text-teal-ink" : "text-ink-strong",
        )}
      >
        {icon}
        {title}
      </span>
      <span className="text-[13px] leading-[1.5] text-ink-muted">
        {caption}
      </span>
    </button>
  );
}
