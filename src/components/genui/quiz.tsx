"use client";

import { useState } from "react";

type QuizProps = {
  question: string;
  options: { label: string; correct?: boolean; reaction?: string }[];
  explanation?: string;
};

/**
 * A one-shot pop quiz: pick an option, get an instant verdict — the right
 * answer glows, a wrong pick shakes, and the model's witty reaction line
 * plus explanation land underneath. No score, no pressure: it's a toy that
 * happens to teach.
 */
export function Quiz({ question, options, explanation }: QuizProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const nailedIt = answered && options[picked]?.correct === true;
  const reaction = answered ? options[picked]?.reaction : undefined;

  return (
    <div className="glass enter p-5 sm:p-6">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-acc-cyan/80">
        Pop quiz
      </p>
      <h3 className="mb-4 text-base font-semibold tracking-tight sm:text-lg">
        {question}
      </h3>

      <div className="space-y-2" role="group" aria-label={question}>
        {options.map((option, i) => {
          const isPicked = picked === i;
          const revealCorrect = answered && option.correct;
          const revealWrong = isPicked && !option.correct;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`choice-pill flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all ${
                revealCorrect
                  ? "border-emerald-500/60 bg-emerald-400/10 font-medium text-foreground"
                  : revealWrong
                    ? "quiz-shake border-acc-rose/50 bg-acc-rose/10 text-foreground"
                    : answered
                      ? "border-ink/[0.06] bg-ink/[0.02] text-muted opacity-60"
                      : "border-ink/[0.09] bg-ink/[0.02] text-foreground/90 hover:border-ink/[0.2]"
              }`}
              style={{ "--stagger": i } as React.CSSProperties}
            >
              {option.label}
              {revealCorrect && <span aria-hidden>✓</span>}
              {revealWrong && <span aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="enter mt-4 space-y-1.5 text-sm" aria-live="polite">
          <p className="font-medium">
            {nailedIt ? "Nailed it." : "Not quite — the real one glows green."}
          </p>
          {reaction && <p className="leading-relaxed text-muted">{reaction}</p>}
          {explanation && (
            <p className="leading-relaxed text-muted">{explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
