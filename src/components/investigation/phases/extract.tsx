import { CheckIcon as Check, XIcon as X } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { isExtractFieldCorrect } from "@/components/investigation/grading";
import type { IocField } from "@/components/investigation/types";
import { cn } from "@/lib/utils";

/**
 * The Extract phase: the learner records the indicators of compromise from the
 * alert into free-text fields. Matching is forgiving (see `normalizeIoc`), so
 * case, a leading scheme, or a trailing slash never fails a correct answer.
 * Checking is per-field and reveals an accepted value when wrong; the recorded
 * values are graded again in the result.
 */
export function ExtractPhase({
  fields,
  values,
  onChange,
}: {
  fields: IocField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  const [checked, setChecked] = useState(false);

  if (fields.length === 0) {
    return (
      <p className="mt-[16px] text-[13.5px] leading-[1.6] text-body">
        This alert has no discrete indicators to extract. Move on to the
        verdict.
      </p>
    );
  }

  return (
    <div className="mt-[16px]">
      <div className="flex flex-col gap-[14px] rounded-[16px] border border-line bg-surface p-[20px]">
        {fields.map((field) => {
          const value = values[field.id] ?? "";
          const correct = isExtractFieldCorrect(field, value);
          return (
            <label key={field.id} className="flex flex-col gap-[6px]">
              <span className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
                {field.label}
                {field.hint ? (
                  <span className="ml-[8px] normal-case tracking-normal text-faint">
                    {field.hint}
                  </span>
                ) : null}
              </span>
              <input
                value={value}
                onChange={(e) => onChange(field.id, e.target.value)}
                spellCheck={false}
                autoComplete="off"
                className={cn(
                  "w-full max-w-[420px] rounded-[10px] border bg-surface-muted px-[11px] py-[9px] font-mono text-[13.5px] text-ink-soft",
                  checked && correct && "border-[oklch(0.72_0.12_150)]",
                  checked && !correct && "border-[oklch(0.72_0.14_25)]",
                  !checked && "border-input",
                )}
              />
              {checked ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-[5px] font-mono text-[11.5px]",
                    correct
                      ? "text-[oklch(0.44_0.1_150)]"
                      : "text-[oklch(0.5_0.16_25)]",
                  )}
                >
                  {correct ? (
                    <>
                      <Check size={13} weight="bold" aria-hidden />
                      Match
                    </>
                  ) : (
                    <>
                      <X size={13} weight="bold" aria-hidden />
                      Expected: {field.accept[0]}
                    </>
                  )}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setChecked(true)}
        className="mt-[14px] inline-flex items-center gap-[6px] rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12.5px] text-ink-soft transition-colors hover:border-ink-muted"
      >
        Check indicators
      </button>
    </div>
  );
}
