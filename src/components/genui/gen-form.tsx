"use client";

import { useState } from "react";
import type { FormInput } from "@/lib/genui-tools";
import { useGenUIActions } from "@/components/genui-actions";

type FieldValue = Record<string, string>;

function fieldKind(field: FormInput["fields"][number]) {
  if (field.type) return field.type;
  return field.options && field.options.length > 0 ? "radio" : "text";
}

/**
 * A model-composed form. Submitted answers flow back into the chat as the
 * visitor's next message, so the model tailors its next generation to them.
 */
export function GenForm({ title, description, submitLabel, fields }: FormInput) {
  const actions = useGenUIActions();
  const [values, setValues] = useState<FieldValue>({});
  const [sent, setSent] = useState(false);

  const answered = fields.some((field) => (values[field.label] ?? "").trim() !== "");

  function setValue(label: string, value: string) {
    if (sent) return;
    setValues((previous) => ({ ...previous, [label]: value }));
  }

  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actions || !answered || sent) return;
    const answers = fields
      .map((field) => ({ label: field.label, value: (values[field.label] ?? "").trim() }))
      .filter((entry) => entry.value !== "")
      .map((entry) => `${entry.label}: ${entry.value}`)
      .join(" · ");
    setSent(true);
    // Hidden: the visitor sees only the filled form, then the tailored reply.
    actions.submit(`My answers to "${title}" — ${answers}`, { hidden: true });
  }

  const inputClass =
    "field-well w-full rounded-lg border border-ink/[0.1] bg-ink/[0.03] px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-muted/50 focus:border-acc-cyan/50 focus:bg-ink/[0.05] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] disabled:opacity-60";

  return (
    <form onSubmit={submit} className="glass enter relative overflow-hidden">
      {/* Sober header strip */}
      <div className="border-b border-ink/[0.07] px-6 py-4 sm:px-7">
        <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
        {description && (
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>

      <fieldset disabled={sent} className="space-y-6 px-6 py-5 sm:px-7">
        {fields.map((field, i) => {
          const kind = fieldKind(field);
          const value = values[field.label] ?? "";
          return (
            <div
              key={i}
              className="enter"
              style={{ "--stagger": i + 1 } as React.CSSProperties}
            >
              <label className="mb-2.5 flex items-baseline gap-2 text-sm font-medium">
                <span className="font-mono text-[11px] text-acc-cyan/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {field.label}
              </label>

              {kind === "radio" && (
                <div
                  className="grid gap-2 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label={field.label}
                >
                  {(field.options ?? []).map((option) => {
                    const active = value === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setValue(field.label, active ? "" : option)}
                        className={`choice-pill flex items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all ${
                          active
                            ? "border-acc-cyan/50 bg-acc-cyan/[0.08] text-foreground shadow-[0_0_0_3px_rgba(34,211,238,0.07)]"
                            : "border-ink/[0.09] bg-ink/[0.02] text-muted hover:border-ink/[0.2] hover:text-foreground"
                        }`}
                      >
                        {option}
                        <span
                          aria-hidden
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                            active
                              ? "border-acc-cyan bg-acc-cyan text-[var(--surface-solid)]"
                              : "border-ink/25"
                          }`}
                        >
                          {active && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {kind === "select" && (
                <div className="relative">
                  <select
                    value={value}
                    onChange={(event) => setValue(field.label, event.target.value)}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    <option value="" className="bg-[var(--surface-solid)]">
                      Choose…
                    </option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option} className="bg-[var(--surface-solid)]">
                        {option}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                  >
                    ⌄
                  </span>
                </div>
              )}

              {kind === "textarea" && (
                <textarea
                  value={value}
                  rows={3}
                  placeholder={field.placeholder}
                  onChange={(event) => setValue(field.label, event.target.value)}
                  className={`${inputClass} resize-none`}
                />
              )}

              {kind === "text" && (
                <input
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(event) => setValue(field.label, event.target.value)}
                  className={inputClass}
                />
              )}
            </div>
          );
        })}
      </fieldset>

      {/* Footer: quiet reassurance left, action right */}
      <div className="flex items-center justify-between gap-3 border-t border-ink/[0.07] px-6 py-4 sm:px-7">
        <span className="text-[11px] text-muted/70">
          {sent
            ? "Tailoring the next answer to you…"
            : "Used only to shape the next answer — never stored."}
        </span>
        <button
          type="submit"
          disabled={!answered || sent || !actions}
          className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-12px_rgba(103,232,249,0.7)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-35 disabled:shadow-none"
        >
          {sent ? "Sent ✓" : (submitLabel ?? "Send answers")}
        </button>
      </div>
    </form>
  );
}
