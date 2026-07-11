/**
 * Topic content — the curated knowledge the model grounds every answer in.
 * Written as COMPONENT FUEL: each section is shaped for a block kind
 * (timeline material, stats material, quiz material, flow material…) so the
 * model always has something concrete to compose with. Facts only; the tone
 * is conceptual and quietly ironic, never technical for its own sake.
 * See CONTEXT.md ("Topic content").
 */

export const GENUI_KNOWLEDGE = `
## What generative UI is (the one-liner and the point)

Generative UI is the idea that an AI model should produce the *interface*
itself, not a wall of text about it. For thirty years software shipped
frozen: someone guessed every screen you might need, months before you
needed it. Generative UI un-freezes that — the interface is composed at the
moment of the question, shaped like the question. Ask about a trend, get a
chart. Ask "which fits me?", get a form that interviews you. Ask for the
story, get a timeline. The wall of text was never a design choice; it was a
limitation wearing a costume.
Google Research ("Generative UI: LLMs are Effective UI Generators",
arXiv:2604.09577) showed that people overwhelmingly prefer generated
interfaces over standard markdown chat output — turns out humans like
interfaces; who knew.

## The story so far (timeline material)

- 2022 — Chatbots go mainstream, and every answer is a scroll of prose. The
  interface of the most advanced software on Earth: a text column.
- 2024 — Tool calling matures; Vercel AI SDK 3.0 popularizes streaming React
  components from model tool calls. The model stops describing interfaces
  and starts requesting them.
- 2025 — The protocol year: Google announces A2UI (declarative UI payloads),
  AG-UI standardizes agent-to-frontend streaming, MCP Apps let tools return
  interactive surfaces. The plumbing gets names.
- 2026 — Research shows properly prompted models compose full custom
  interfaces reliably (the PAGEN dataset ships). The question moves from
  "can it?" to "which of the three ways should I use?".

## The three approaches (and their personalities)

1. **Tool-calling components** — developers hand-craft a kit; the model
   picks one and fills its typed props. The reliable employee: always on
   time, pixel-perfect, and never once does anything outside the job
   description. De-facto industry standard (Vercel AI SDK, CopilotKit,
   assistant-ui).
2. **Declarative UI spec** — the model emits a JSON tree restricted to an
   allow-list of blocks; a client-side renderer draws it. The jazz musician
   with a curfew: real improvisation, inside safe walls. The idea behind
   Google's A2UI and MCP Apps.
3. **Fully generated UI** — the model writes raw HTML/CSS/JS in a sandbox.
   The brilliant intern: dazzling when it works, slow (5–15 seconds),
   token-hungry, and occasionally hands you a button that does nothing.

Most real products are hybrids: curated components where the traffic
concentrates, free composition where the questions get weird.

## How one generated answer happens (flow material)

Question → the model reads the vocabulary of blocks it may use → it composes
(picks a curated tool, or writes a declarative JSON tree) → a validator
checks every node against the allow-list and repairs the near-misses → the
renderer turns the tree into live components → a human touches the result.
Six steps, about a second, and zero pixels existed before the question.

## Numbers worth counting (stats material — all real)

- 0 — pixels of any answer existing before the question is asked.
- 3 — approaches on the menu (tool-calling, declarative spec, fully generated).
- 4 — names in the standards alphabet soup: A2UI, AG-UI, MCP Apps, AI SDK.
- 5–15 — seconds a fully generated HTML answer can take. Enough for a coffee.
- 2024 — the year tool-calling UI went mainstream (AI SDK 3.0).
- 2025 — the year the protocols got names (A2UI, AG-UI, MCP Apps).

## Myths vs reality (quiz material)

- Myth: "generative UI means the model writes HTML." Reality: mostly it
  fills typed props or emits a declarative spec — raw HTML is the rare,
  slow third way.
- Myth: "it's a styling gimmick." Reality: the win is FIT — the interface
  matches the question's shape instead of a designer's guess from last
  quarter.
- Myth: "letting a model draw UI is unsafe." Reality: allow-lists and
  validation mean the model proposes and the client disposes; nothing
  outside the vocabulary ever renders.
- Myth: "it replaces designers." Reality: someone still designs every block
  the model is allowed to use. The kit IS the design system; the model is
  just extremely fast at arranging it.

## The emerging standards (2025–2026, the ecosystem)

- **A2UI** (Google) — a declarative JSON format describing WHAT to render;
  transport-agnostic. The payload layer.
- **AG-UI** — an event protocol streaming agent activity to frontends over
  SSE. The transport layer.
- **MCP Apps** — an MCP extension letting tools return interactive UI
  resources: tools that answer with surfaces, not strings.
- **Vercel AI SDK** — the leading TypeScript framework: typed tool calls
  mapped to React components with native streaming. The rendering layer.
They stack rather than compete: AG-UI transports, A2UI describes,
frameworks render.

## Approach scorecard (editorial ratings, 0-100 — chartable)

|                       | Reliability | Flexibility | Speed |
| Tool-calling          | 95          | 40          | 90    |
| Declarative UI spec   | 80          | 75          | 80    |
| Fully generated       | 50          | 100         | 20    |

These are this page's own editorial ratings, meant for charts, stats rows
and progress meters. Present them as "how this demo scores the approaches",
never as external research.

## Key research (the receipts)

- "Generative UI: LLMs are Effective UI Generators" (Google, arXiv:2604.09577)
  — properly prompted LLMs robustly produce high-quality custom UIs;
  releases the PAGEN dataset.
- "Generative Interfaces for Language Models" (arXiv:2508.19227) — LLMs
  proactively generate task-specific interfaces from user queries, refined
  iteratively.

## Official resources (the ONLY URLs you may ever link)

- "Generative UI: LLMs are Effective UI Generators" (Google Research) — https://arxiv.org/abs/2604.09577
- "Generative Interfaces for Language Models" — https://arxiv.org/abs/2508.19227
- A2UI announcement (Google Developers Blog) — https://developers.googleblog.com/a2ui-v0-9-generative-ui/
- AG-UI protocol docs — https://docs.ag-ui.com/concepts/generative-ui-specs
- Vercel AI SDK docs — https://ai-sdk.dev/docs/introduction
- Model Context Protocol — https://modelcontextprotocol.io

## Privacy (short version)

No accounts, no cookies, no analytics. Conversations are sent to the model
only to generate the reply, then forgotten. Form answers shape the next
reply and nothing else.

## This page (one line of meta — that's all it gets)

This page practices what it preaches: curated components for the classics,
free composition for everything else. Every answer is the concept
demonstrating itself.
`.trim();

/**
 * Owner facts for the contact card — rendered only when a visitor asks who
 * made the page. TODO(owner): replace role and links with the real ones.
 */
export const OWNER = {
  name: "Davide Baldassarre",
  role: "Software developer", // TODO(owner): exact title
  links: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/davide-baldassarre-1a4386173/",
    },
  ],
  note: "Built this page to learn generative UI by shipping one.",
} as const;
