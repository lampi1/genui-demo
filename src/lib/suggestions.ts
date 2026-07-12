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

/**
 * Didactic progression (CH-001): fundamentals → approaches → standards →
 * depth. The first four are the hero chips — together they answer "what is
 * this page for" by demonstration.
 */
export const SUGGESTIONS: readonly Suggestion[] = [
  // — Fundamentals —
  {
    prompt: "What is generative UI?",
    showcase:
      "render_ui with EXACTLY one concept block — {type:'concept', title:'Generative UI', tagline: one striking line, points: 3-5 short strings, accent:'violet'} — then one actions block. NEVER answer this with a plain text node: the concept block IS the flip card.",
  },
  {
    prompt: "Map the whole generative UI landscape",
    showcase:
      "render_ui conceptmap — center 'Generative UI', branches from the knowledge's landscape map (approaches, standards, frameworks, safety, research) with 2-4 leaves each.",
  },
  {
    prompt: "How does this page generate an answer?",
    showcase:
      "render_ui with EXACTLY one conceptmap — center 'One generated answer', branches Prompt / Generate / Validate / Render / Touch from 'This page's engine' in the knowledge, 2-3 leaves each of 2-4 WORDS (labels, never sentences). NEVER a flow or text for this one: the map is the answer.",
  },
  // — Approaches —
  {
    prompt: "Put the three approaches face to face",
    showcase:
      "render_ui comparison with 3 columns (tool-calling / declarative spec / fully generated), honest points from the knowledge.",
  },
  {
    prompt: "Let the three approaches fight it out in numbers",
    showcase:
      "render_ui with EXACTLY three data blocks, each a DIFFERENT kind: one stats row (count-up), ONE chart, one gauge (3 dials) — all from the 'Approach scorecard' in the knowledge, never invented data. Not three charts.",
  },
  {
    prompt: "Which approach fits my project? Interview me",
    showcase:
      "render_ui with EXACTLY one form block — {type:'form', title, fields:[{label:'Project type', type:'radio', options:[…]}, {label:'Priority', type:'select', options:[…]}, {label:'Project name', type:'text'}, {label:'Context', type:'textarea'}]}. NEVER describe the interview with flow/steps/text: render the form itself. Their answers arrive as their next message.",
  },
  // — Standards —
  {
    prompt: "Draw the 2026 protocol stack as a diagram",
    showcase:
      "render_ui diagram — nodes A2A, MCP, AG-UI, A2UI (+ Agent, Frontend) with labeled edges from 'The 2026 protocol stack' in the knowledge.",
  },
  {
    prompt: "Nerd out on the emerging standards",
    showcase:
      "render_ui accordion + chips of the ecosystem names + a links block of official resources.",
  },
  // — Depth —
  {
    prompt: "Bust the myths — deal the flip cards",
    showcase:
      "render_ui flipcards from 'Myths vs reality' in the knowledge — the myth on the front, the reality on the back.",
  },
  {
    prompt: "Quiz me — three traps, one truth",
    showcase:
      "render_ui quiz about generative UI: witty but plausible wrong options, EXACTLY ONE correct, a sharp reaction line each, a teaching explanation.",
  },
  {
    prompt: "Pop the hood — show me the code",
    showcase: "render_ui code — a realistic snippet of this exact stack.",
  },
  {
    prompt: "Surprise me with a layout you've never drawn",
    showcase:
      "render_ui mixing 3+ block kinds this conversation has NOT seen yet — your freest composition.",
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
