# ADR-0001: Stack — Next.js + Vercel AI SDK, hybrid generative UI

Date: 2026-07-10 · Status: accepted

## Decision

- **Framework**: Next.js (App Router) + TypeScript + Tailwind CSS; shadcn/ui for curated components.
- **AI layer**: Vercel AI SDK (`ai`, `@ai-sdk/google`) with Zod-typed tools.
- **Model**: Gemini Flash on the free tier (~1,500 req/day) — hard cap doubles as abuse ceiling.
- **Hosting**: Vercel Hobby (free). Total running cost: 0 EUR/month; optional custom domain ~1 EUR/month. **Hard constraint: never exceed 5 EUR/month.**
- **Approach**: hybrid generative UI — tool-calling components for predictable questions, plus a custom A2UI-inspired JSON renderer for free composition.
- **Testing/lint**: Vitest + ESLint.

## Why

- Tool-calling is the de-facto industry standard (Vercel AI SDK, CopilotKit, assistant-ui): reliable, pixel-perfect, but bounded by a fixed component set.
- Fully model-written HTML (Google's "Generative UI: LLMs are Effective UI Generators", arXiv:2604.09577) maximizes wow but is slow (5–15 s), token-hungry, and can render broken in front of visitors.
- The hybrid keeps guaranteed visual quality where traffic concentrates and true generation elsewhere — and teaches both layers of the emerging stack (framework layer + declarative payload layer à la A2UI/MCP Apps).
- Next.js/React has by far the most generative-UI learning material; the owner's explicit goal is to learn the field.

## Rejected

- **SvelteKit**: lighter, but nearly all generative-UI examples and component kits are React.
- **Fully custom on Cloudflare Workers**: maximal low-level learning, but reinvents streaming/chat state the AI SDK provides.
- **Fully generated HTML**: kept as a possible later experiment behind a flag, not the default.

## Sources

- Paper: <https://arxiv.org/abs/2604.09577> · <https://arxiv.org/abs/2508.19227>
- Protocols: A2UI <https://developers.googleblog.com/a2ui-v0-9-generative-ui/> · AG-UI <https://docs.ag-ui.com/concepts/generative-ui-specs>
- Field map: <https://github.com/narrowin/awesome-generative-ui>
- Free-tier comparison: <https://klymentiev.com/blog/free-llm-api>
