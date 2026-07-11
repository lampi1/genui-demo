/**
 * Suggested prompts — the single source of truth for the guided tour.
 *
 * Each entry pairs the exact chip text the visitor taps with the showcase
 * the model must deliver for it. The chat UI renders `prompt`; the system
 * prompt compiles `prompt → showcase` into its guided-tour section. One
 * list, so the chips and the model's script can never drift apart.
 *
 * Wording rule: every prompt names (or unmistakably implies) the interface
 * it produces — a form, a chart, a timeline — because the suggestions ARE
 * the demo's menu of generative-UI capabilities.
 */

export type Suggestion = {
  /** Exact text shown on the chip and sent as the chat message. */
  prompt: string;
  /** What the model must generate for it (compiled into the system prompt). */
  showcase: string;
};

export const SUGGESTIONS: readonly Suggestion[] = [
  {
    prompt: "What is generative UI?",
    showcase: "show_concept — the polished opening card.",
  },
  {
    prompt: "Build a form that interviews me",
    showcase:
      "show_form with EVERY field kind: radio (project type), select (priority), text (project name), textarea (context).",
  },
  {
    prompt: "Quiz me — three traps, one truth",
    showcase:
      "render_ui quiz about generative UI: witty but plausible wrong options, EXACTLY ONE correct, a sharp reaction line each, a teaching explanation.",
  },
  {
    prompt: "Surprise me with a layout you've never drawn",
    showcase:
      "render_ui mixing 3+ block kinds this conversation has NOT seen yet — your freest composition.",
  },
  {
    prompt: "Let the three approaches fight it out in numbers",
    showcase:
      "render_ui stats row (count-up) + chart + progress meters, all from the 'Approach scorecard' in the knowledge — the same three contenders told three ways, never invented data.",
  },
  {
    prompt: "Put the three approaches face to face",
    showcase: "show_comparison.",
  },
  {
    prompt: "How does this page build itself, step by step?",
    showcase: "show_timeline with rich expandable descriptions.",
  },
  {
    prompt: "Draw me the flow of one generated answer",
    showcase:
      "render_ui flow from 'How one generated answer happens' in the knowledge — six boxes, arrows between them (+ a stats row if numbers fit).",
  },
  {
    prompt: "Nerd out on the emerging standards",
    showcase:
      "render_ui accordion + chips of the ecosystem names + a links block of official resources.",
  },
  {
    prompt: "Serve me the trade-offs in tabs",
    showcase:
      "render_ui tabs (+ a compact table when the trade-offs want rows and columns).",
  },
  {
    prompt: "Pop the hood — show me the code",
    showcase: "render_ui code — a realistic snippet of this exact stack.",
  },
  {
    prompt: "Who made this page?",
    showcase: "show_contact.",
  },
] as const;

/** The page's only credit: pinned as the last suggestion until asked. */
export const CONTACT_PROMPT = "Who made this page?";

/** The 3–4 starter chips in the empty state (see CONTEXT.md). */
export const HERO_SUGGESTIONS = SUGGESTIONS.slice(0, 4).map(
  (suggestion) => suggestion.prompt,
);

/** The full rotation for the rail above the composer. */
export const SUGGESTION_PROMPTS = SUGGESTIONS.map(
  (suggestion) => suggestion.prompt,
);

/** The `"prompt" → showcase` lines the system prompt embeds as the tour. */
export function guidedTourLines(): string {
  return SUGGESTIONS.map(
    (suggestion) => `- "${suggestion.prompt}" → ${suggestion.showcase}`,
  ).join("\n");
}
