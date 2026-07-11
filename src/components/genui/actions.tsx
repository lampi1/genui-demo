"use client";

import { useGenUIActions } from "@/components/genui-actions";

type ActionsProps = {
  buttons: { label: string; message?: string }[];
};

/** Follow-up buttons inside generated UI: tapping continues the conversation. */
export function Actions({ buttons }: ActionsProps) {
  const actions = useGenUIActions();
  // A label-less button has nothing to tap — and zero valid buttons means
  // zero pixels, never an empty shell.
  const tappable = buttons.filter((button) => button.label?.trim());
  if (tappable.length === 0) return null;

  return (
    <div className="enter flex flex-wrap gap-2">
      {tappable.map((button, i) => (
        <button
          key={i}
          type="button"
          disabled={!actions}
          onClick={() => actions?.submit(button.message ?? button.label)}
          className="gen-action enter px-4 py-2 text-sm font-medium disabled:opacity-40"
          style={{ "--stagger": i } as React.CSSProperties}
        >
          {button.label} →
        </button>
      ))}
    </div>
  );
}
