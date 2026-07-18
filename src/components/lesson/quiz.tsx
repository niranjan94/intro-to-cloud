"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** A single multiple-choice question with a reveal-on-answer explanation. */
export interface QuizQ {
  /** The question prompt. */
  q: string;
  /** Answer options, in display order. */
  opts: string[];
  /** Index into `opts` of the correct answer. */
  answer: number;
  /** Shown after the learner answers, right or wrong. */
  explain: string;
}

function Question({
  index,
  question,
  onAnswer,
}: {
  index: number;
  question: QuizQ;
  onAnswer: (correct: boolean) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const done = chosen !== null;

  const pick = (oi: number) => {
    if (done) return;
    setChosen(oi);
    onAnswer(oi === question.answer);
  };

  return (
    <div className="rounded-[16px] border border-line bg-surface p-[20px]">
      <h4 className="text-[15.5px] font-semibold text-ink-strong">
        {index + 1}. {question.q}
      </h4>
      <div className="mt-[12px] flex flex-col gap-[8px]">
        {question.opts.map((opt, oi) => {
          const isAnswer = oi === question.answer;
          const isChosen = oi === chosen;
          return (
            <button
              key={opt}
              type="button"
              disabled={done}
              onClick={() => pick(oi)}
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
      {done ? (
        <p className="mt-[10px] text-[13.5px] leading-[1.6] text-body">
          {question.explain}
        </p>
      ) : null}
    </div>
  );
}

/** Chapter 5: five self-checking questions with reveal-on-answer and a score. */
export function Quiz({ questions }: { questions: QuizQ[] }) {
  const [results, setResults] = useState<Record<number, boolean>>({});
  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;
  const complete = answered === questions.length;

  const tail = complete
    ? correct === questions.length
      ? " · all correct. You've got the model."
      : " · revisit the chapters for the ones you missed."
    : "";

  return (
    <div>
      <div className="flex flex-col gap-[14px]">
        {questions.map((question, qi) => (
          <Question
            key={question.q}
            index={qi}
            question={question}
            onAnswer={(isCorrect) =>
              setResults((prev) =>
                qi in prev ? prev : { ...prev, [qi]: isCorrect },
              )
            }
          />
        ))}
      </div>
      <p className="mt-[16px] font-mono text-[13.5px] text-ink-muted">
        Score: {correct} / {questions.length}
        {tail}
      </p>
    </div>
  );
}
