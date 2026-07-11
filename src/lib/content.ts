/**
 * Topic content — the curated knowledge the model grounds every answer in.
 * Facts only; sources are listed at the bottom of each section.
 * See CONTEXT.md ("Topic content").
 */

export const GENUI_KNOWLEDGE = `
## What generative UI is

Generative UI is the practice of letting an AI model produce the *interface* itself —
not just text. It replaces the wall of text with something you can touch: instead of
prose, the model composes cards, timelines, comparisons, diagrams, forms — generated
on the spot for the specific question.
Google Research ("Generative UI: LLMs are Effective UI Generators", arXiv:2604.09577)
showed that people overwhelmingly prefer generated interfaces over the standard
markdown chat output.

## The three approaches

1. **Tool-calling components** — developers hand-craft a kit of components; the model
   picks one and fills its typed props. Reliable, pixel-perfect, but bounded by the kit.
   This is the de-facto industry standard (Vercel AI SDK, CopilotKit, assistant-ui).
2. **Declarative UI spec** — the model emits a JSON tree restricted to an allow-list of
   building blocks; a client-side renderer turns it into UI. True composition, still
   safe. This is the idea behind Google's A2UI and MCP Apps.
3. **Fully generated UI** — the model writes raw HTML/CSS/JS in a sandbox. Maximum
   surprise, but slow (5–15 s), token-hungry and occasionally broken.

## The emerging standards (2025–2026)

- **A2UI** (Google) — a declarative JSON format describing *what* to render; transport-agnostic.
- **AG-UI** — an event protocol for streaming agent activity to frontends over SSE.
- **MCP Apps** — an MCP extension letting tools return interactive UI resources.
- **Vercel AI SDK** — the leading TypeScript framework: the model calls typed tools,
  the client maps them to React components with native streaming states.
They layer: AG-UI transports, A2UI describes the payload, frameworks render.

## Key research

- "Generative UI: LLMs are Effective UI Generators" (Google, arXiv:2604.09577) —
  properly prompted LLMs robustly produce high-quality custom UIs; releases the PAGEN dataset.
- "Generative Interfaces for Language Models" (arXiv:2508.19227) — LLMs proactively
  generate task-specific interfaces from user queries, refined iteratively.

## Official resources (the ONLY URLs you may ever link)

- "Generative UI: LLMs are Effective UI Generators" (Google Research) — https://arxiv.org/abs/2604.09577
- "Generative Interfaces for Language Models" — https://arxiv.org/abs/2508.19227
- A2UI announcement (Google Developers Blog) — https://developers.googleblog.com/a2ui-v0-9-generative-ui/
- AG-UI protocol docs — https://docs.ag-ui.com/concepts/generative-ui-specs
- Vercel AI SDK docs — https://ai-sdk.dev/docs/introduction
- Model Context Protocol — https://modelcontextprotocol.io

## Approach scorecard (editorial ratings, 0-100 — the only chartable numbers)

|                       | Reliability | Flexibility | Speed |
| Tool-calling          | 95          | 40          | 90    |
| Declarative UI spec   | 80          | 75          | 80    |
| Fully generated       | 50          | 100         | 20    |

These are this page's own editorial ratings, meant for charts and progress
meters. Present them as "how this demo scores the approaches", never as
external research.

## Privacy (how this page treats data)

- No accounts, no cookies, no analytics, no tracking.
- Conversations are NOT stored on any server. Each message is sent to Google's
  Gemini API only to generate the reply, then forgotten.
- The only thing kept in the browser is an anonymous local estimate of today's
  free-tier usage (the little ring next to the input).
- Form answers are used solely to shape the next reply, like any other message.

## How THIS page works (meta)

This very page is a hybrid generative UI: predictable questions get curated React
components (tool calls with typed props); open-ended ones get a declarative JSON spec
composed by the model and rendered client-side from an allow-list. Stack: Next.js +
Vercel AI SDK + Gemini Flash, hosted on a free tier — it runs at 0 EUR/month.
Every answer you see here is the concept demonstrating itself.
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
