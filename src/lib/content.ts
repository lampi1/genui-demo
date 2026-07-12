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

## The landscape at a glance (conceptmap material)

Center: Generative UI. Branches and leaves:
- Approaches — tool-calling components; declarative UI spec; fully generated HTML.
- Standards — A2UI / Open-JSON-UI (payload); AG-UI (frontend streaming);
  MCP Apps (tools with surfaces); A2A (agent to agent).
- Frameworks — Vercel AI SDK; CopilotKit; assistant-ui.
- Safety — component allow-list; schema validation; repair loop; no executable code.
- Research — LLMs as UI generators (PAGEN); generative interfaces (arXiv:2508.19227).

## The story so far (timeline material)

- 2022 — Chatbots go mainstream, and every answer is a scroll of prose. The
  interface of the most advanced software on Earth: a text column.
- 2024 — Tool calling matures; Vercel AI SDK 3.0 popularizes streaming React
  components from model tool calls. The model stops describing interfaces
  and starts requesting them.
- 2025 — The protocol year: Google announces A2UI (declarative UI payloads),
  AG-UI standardizes agent-to-frontend streaming, MCP Apps let tools return
  interactive surfaces. The plumbing gets names.
- 2026 — The convergence year: A2UI v0.9 ships the prompt→generate→validate
  loop, A2UI payloads travel over MCP servers, research shows properly
  prompted models compose full custom interfaces reliably (the PAGEN dataset
  ships). The question moves from "can it?" to "which way, and how safely?".

## The three approaches (and their personalities)

1. **Tool-calling components** — developers hand-craft a kit; the model
   picks one and fills its typed props. The reliable employee: always on
   time, pixel-perfect, and never once does anything outside the job
   description. Still the de-facto production standard where questions are
   predictable (Vercel AI SDK, CopilotKit, assistant-ui). Its honest limit:
   the interface existed before your question — the model only chose it.
2. **Declarative UI spec** — the model emits a JSON description restricted
   to an allow-list of blocks; a client-side renderer validates and draws
   it. The jazz musician with a curfew: real improvisation, inside safe
   walls. This is where the standards converged (Google's A2UI /
   Open-JSON-UI, servable over MCP) — and it is THE approach this page runs
   on, for every answer.
3. **Fully generated UI** — the model writes raw HTML/CSS/JS in a sandbox.
   The brilliant intern: dazzling when it works, slow (5–15 seconds),
   token-hungry, and occasionally hands you a button that does nothing.
   Research territory; nobody's default engine.

## This page's engine (conceptmap and flow material — and its A2UI kinship)

As a map — center: One generated answer. Branches and leaves:
- Prompt — the block vocabulary; the curated knowledge; per-block affordances.
- Generate — the model composes a JSON tree; data only, never code.
- Validate — allow-list check; schema shapes; near-misses repaired, not failed.
- Render — design-system blocks; entrance animations; one block per swipe.
- Touch — flips, taps and forms; "view the spec" under every block.

As a sequence: question → the model reads the vocabulary of blocks it may
use → it writes a declarative JSON tree → a validator checks every node
against the allow-list and repairs the near-misses → the renderer turns the
tree into live components → a human touches the result. Six steps, about a
second, and zero pixels existed before the question.
That loop — prompt, generate, validate, self-correct — is exactly the
architecture A2UI v0.9 standardized: schema and examples live in the prompt,
the model composes freely, a validator catches errors before anything
reaches the client. This page arrived at the same design independently;
convergent evolution is what "state of the art" looks like from inside.
Every generated block here can prove it: tap "view the spec" under a block
and read the exact JSON it was rendered from.

## The 2026 protocol stack (diagram material)

Nodes: Agent, A2A, MCP, AG-UI, A2UI, Frontend. Edges:
- Agent → A2A → other agents ("delegates to").
- Agent → MCP → tools and data ("calls").
- Agent → AG-UI → Frontend ("streams activity to").
- Agent → A2UI → Frontend ("describes interfaces for").
They stack rather than compete: A2A converses, MCP connects, AG-UI
transports, A2UI describes. A2UI payloads can also travel over MCP itself —
tools that answer with interfaces instead of strings (MCP Apps).

## Flat list or tree? (the one structural fork — table material)

Two ways to shape a declarative UI payload:
- **Flat list + ID references** (A2UI's choice) — easy for models to stream
  incrementally (JSONL, component by component), easy to patch in place.
- **Nested tree, bounded depth** (this page's choice) — mirrors how layouts
  nest, validates in one pass, and a depth bound means a runaway model can
  never nest indefinitely.
Same philosophy either way: the model proposes data, never code; the client
owns the catalog and the final word.

## Safety, the honest version (why letting a model draw UI is fine)

The model NEVER ships code — it ships a description. Four walls make that
safe: an allow-list (a node type outside the catalog is dropped, never
rendered), schema validation (wrong shapes are repaired or rejected before
pixels), no executable vocabulary (no script, no iframe, no embed — ever),
and a link allow-list (only vetted domains render as links). The pattern to
remember: the model proposes, the client disposes.

## How to build one (flow material — the recipe this page followed)

Design the block kit → write its schema (types + bounds) → put the
vocabulary in the system prompt with per-block affordances → validate every
payload against an allow-list → repair near-misses instead of failing →
render from the design system → let visitors inspect the result. Seven
steps; the hard-won lesson is the repair step — small models emit
near-misses constantly, and a demo that dissolves on each one teaches nothing.

## Numbers worth counting (stats material — all real)

- 0 — pixels of any answer existing before the question is asked.
- 1 — engine composing every answer on this page (plus one disclosed
  hand-crafted exception: the contact card).
- 3 — approaches on the menu (tool-calling, declarative spec, fully generated).
- 4 — protocols in the 2026 stack: A2A, MCP, AG-UI, A2UI.
- 5–15 — seconds a fully generated HTML answer can take. Enough for a coffee.
- 2024 — the year tool-calling UI went mainstream (AI SDK 3.0).
- 2025 — the year the protocols got names (A2UI, AG-UI, MCP Apps).
- 2026 — the year they converged (A2UI v0.9 over MCP).

## Myths vs reality (quiz and flipcards material — myth on the front, reality on the back)

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

- **A2UI / Open-JSON-UI** (Google) — a declarative JSON format describing
  WHAT to render: a flat list of trusted components streamed incrementally,
  never executable code. Transport-agnostic; v0.9 standardized the
  prompt→generate→validate loop. The payload layer.
- **AG-UI** — an event protocol streaming agent activity to frontends over
  SSE. The transport layer.
- **MCP Apps** — an MCP extension letting tools return interactive UI
  resources: tools that answer with surfaces, not strings. A2UI payloads
  can ride on it.
- **A2A** — agents talking to agents; the delegation layer above all this.
- **Vercel AI SDK** — the leading TypeScript framework: typed tool calls
  mapped to React components with native streaming. The rendering layer.
They stack rather than compete: A2A converses, MCP connects, AG-UI
transports, A2UI describes, frameworks render.

## Approach scorecard (editorial ratings, 0-100 — chart, gauge and progress material)

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
- A2UI + MCP Apps, combined (Google Developers Blog) — https://developers.googleblog.com/a2ui-and-mcp-apps/
- AG-UI protocol docs — https://docs.ag-ui.com/concepts/generative-ui-specs
- Vercel AI SDK docs — https://ai-sdk.dev/docs/introduction
- Model Context Protocol — https://modelcontextprotocol.io

## Privacy (short version)

No accounts, no cookies, no analytics. Conversations are sent to the model
only to generate the reply, then forgotten. Form answers shape the next
reply and nothing else.

## This page (one line of meta — that's all it gets)

This page practices what it preaches: one declarative engine composes every
answer (the contact card is the lone hand-crafted exception, and says so),
and any block will show you its JSON on request. Every answer is the concept
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
    {
      label: "GitHub",
      url: "https://github.com/lampi1",
    },
  ],
  note: "Built this page to learn generative UI by shipping one.",
} as const;
