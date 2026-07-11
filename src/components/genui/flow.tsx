import { Fragment } from "react";

type FlowProps = {
  title?: string;
  steps: { label: string; detail?: string }[];
};

/**
 * A left-to-right flow diagram: each step is a raised box, arrows join
 * them, and the whole chain wraps gracefully on narrow screens. Steps and
 * arrows enter in sequence — the process draws itself in reading order.
 */
export function Flow({ title, steps }: FlowProps) {
  return (
    <div className="glass enter p-5 sm:p-6">
      {title && (
        <h3 className="mb-4 text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap items-center gap-y-3">
        {steps.map((step, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span
                aria-hidden
                className="enter px-2.5 text-lg leading-none text-acc-cyan/70"
                style={{ "--stagger": i * 2 - 1 } as React.CSSProperties}
              >
                →
              </span>
            )}
            <div
              className="flow-node enter rounded-xl border border-ink/[0.09] bg-ink/[0.03] px-3.5 py-2.5"
              style={{ "--stagger": i * 2 } as React.CSSProperties}
            >
              <span className="block text-sm font-medium">{step.label}</span>
              {step.detail && (
                <span className="mt-0.5 block max-w-[16rem] text-xs leading-relaxed text-muted">
                  {step.detail}
                </span>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
