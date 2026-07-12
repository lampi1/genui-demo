# Generative UI Explainer Chat — Implementation Plan

## Approach

- **Rendering mechanism**: AI SDK v7 documented pattern — server route with `streamText`
  and Zod-typed tools; the client (`useChat`) maps typed message parts
  (`tool-<name>`, states `input-streaming` / `input-available` / `output-available` /
  `output-error`) to React components. No RSC/`streamUI` (legacy).
- **Free composition**: one `render_ui` tool whose *input schema is the UI spec* — a
  recursive JSON tree restricted to the allow-list (`src/lib/ui-spec.ts`). One channel
  for everything; the renderer stays a pure, unit-testable function of the spec.
- **Curated components** *(superseded by CH-001, see delta plan below)*: hand-crafted
  React components exposed as individual tools with typed props (hybrid approach per
  ADR-0001). After CH-001 the declarative spec is the ONLY engine (ADR-0002); the
  hand-crafted React components survive as renderers of spec nodes, and `show_contact`
  is the single remaining curated tool.
- **Model**: Gemini Flash (free tier) through `@ai-sdk/google` 4.0.11; API key in
  `GOOGLE_GENERATIVE_AI_API_KEY` (server-side only, never exposed to the client).
- **Background**: pure animated CSS (layered gradients/blur, `prefers-reduced-motion`
  respected) — zero bundle cost, no canvas/WebGL.
- **Existing patterns**: App Router (`src/app/`), shared logic in `src/lib/`,
  Tailwind 4 for styling, Vitest for units. Versions pinned by the lockfile:
  ai 7.0.19, @ai-sdk/google 4.0.11, next 16.2.10 — Next docs shipped in
  `node_modules/next/dist/docs/` are authoritative (see AGENTS.md warning).

## Implementation plan

### 1. Topic content + system prompt

- Files: `src/lib/content.ts` (curated generative-UI knowledge: definition, how it
  works, approaches, standards A2UI/AG-UI/MCP Apps, papers, examples; owner facts for
  the contact card), `src/lib/system-prompt.ts` (behavior rules: answer in the
  visitor's language, prefer UI over prose, off-topic → graceful redirect, no opinions
  or sensitive topics, contact card only when asked who made the page).
- Done when: both modules exist, content is factual (sources from the functional
  analysis research), prompt states every behavioral rule from the functional analysis.

### 2. UI spec schema + renderer

- Files: `src/lib/ui-spec.ts` (extend: recursive Zod schema — node types `stack`,
  `card`, `text`, `list`, plus `comparison` and `timeline` as spec-level nodes; bounded
  depth as Gemini-compat fallback), `src/components/spec-renderer.tsx` (pure mapping
  spec → design-system blocks; unknown node type → skipped, never rendered),
  `src/lib/ui-spec.test.ts` (extend: schema acceptance/rejection, depth bound,
  allow-list enforcement).
- Done when: `npm run test` green, including a test proving a non-allow-listed node is
  rejected.

### 3. Curated component kit

- Files: `src/components/genui/concept-card.tsx`, `comparison.tsx`, `timeline.tsx`,
  `contact-card.tsx` + shared design tokens in `src/app/globals.css` (Tailwind 4
  `@theme`).
- Done when: each component renders from typed props in isolation (Vitest smoke render
  or a temporary dev page), visual style consistent with the design tokens.

### 4. Chat API route

- Files: `src/app/api/chat/route.ts` — `streamText` with the Gemini model,
  `convertToModelMessages`, tools: `show_concept`, `show_comparison`, `show_timeline`,
  `show_contact`, `render_ui`; return the UI message stream response. `.env.local`
  (gitignored) holds `GOOGLE_GENERATIVE_AI_API_KEY`; `.env.example` documents it.
- Pin the exact Gemini model id here by checking Google's current free-tier list
  (open point below).
- Done when: a curl/manual request streams tool parts; lint and build pass.

### 5. Chat page

- Files: `src/app/page.tsx` (+ client components under `src/components/chat/`):
  `useChat`, empty state (English hook + 3–4 suggested prompt chips), message list
  mapping every `tool-<name>` part to its component with loading/streaming states,
  fixed discreet credit "Made by Davide Baldassarre", animated CSS background.
  Layout metadata (title, description, OG) in `src/app/layout.tsx`.
- Done when: full conversation works in `npm run dev` against the real API; empty
  state matches the functional analysis; no menu/CTA anywhere.

### 6. Polish pass

- Mobile layout, `prefers-reduced-motion`, keyboard focus, streaming/loading states
  everywhere, graceful `output-error` rendering.
- Done when: page is usable on a phone-sized viewport and with animations disabled.

### 7. Deploy

- Vercel Hobby project, `GOOGLE_GENERATIVE_AI_API_KEY` as environment variable,
  production build. Verify the live URL end-to-end.
- Done when: the public URL answers a real question with generated UI at cost 0 EUR.

## Implementation plan — CH-001 delta (single declarative engine, learning demo)

### 8. Retire the curated engine

- Files: `src/app/api/chat/route.ts` (remove `show_concept`, `show_comparison`,
  `show_timeline`, `show_form` tools; keep `show_contact` as the disclosed exception),
  `src/lib/genui-tools.ts`, `src/lib/system-prompt.ts` (curated-tools section shrinks
  to contact only; guided tour remapped to spec showcases), `src/lib/suggestions.ts`,
  client part rendering (`src/components/chat/part-renderer.tsx`).
- The React components (ConceptCard, Comparison, Timeline, GenForm) stay as renderers
  of spec nodes — nothing visual is lost; `concept` may become a spec node if the flip
  showcase needs a dedicated shape beyond `flipcards`.
- Done when: every tour prompt renders via `render_ui` (contact excepted), tests/lint/
  build green, live smoke test passes.

### 9. Advanced teaching blocks: conceptmap + diagram

- Files: `src/lib/ui-spec.ts` (+ repair + tests), `src/lib/genui-tools.ts`,
  `src/components/genui/concept-map.tsx` (radial mind map: center + branches, SVG,
  entrance animation), `src/components/genui/diagram.tsx` (nodes + labeled edges,
  simple layered layout — beyond the linear `flow`), `src/components/spec-renderer.tsx`,
  system prompt vocabulary with per-block affordances.
- Bounded for small models: conceptmap max ~8 branches, diagram max ~8 nodes/12 edges;
  repair salvages string nodes and alias keys like the existing blocks.
- Done when: both render from live model output first-shot on their tour prompts.

### 10. Per-block spec reveal

- Files: `src/components/generated-block.tsx` (or equivalent wrapper): discreet
  "view the spec" action per generated block; panel with highlighted JSON (the
  validated spec as rendered — repaired, not raw), one explanatory line, dismissible.
  The client already holds the spec (tool output) — no API change.
- Done when: every render_ui block can open/close its spec; default view unchanged.

### 11. Curriculum rewrite (knowledge as component fuel)

- Files: `src/lib/content.ts` — in-depth, factual curriculum: what generative UI is,
  the three approaches with honest trade-offs, the 2026 protocol stack (A2A / MCP /
  AG-UI / A2UI-Open-JSON-UI), A2UI v0.9's prompt→generate→validate→self-correct loop
  (and that this page implements it), flat-list-vs-tree spec shapes, validation and
  safety, how to build one. Every section shaped for a block kind (conceptmap material,
  diagram material, …). Sources verified 2026-07-12 (Google Developers Blog, CopilotKit).
- Done when: knowledge answers the didactic progression without inventing facts; link
  allow-list covers every cited source.

### 12. Purpose-declaring onboarding

- Files: `src/components/chat/chat.tsx` (hero copy states what the page is and teaches),
  `src/lib/suggestions.ts` (prompts reordered as fundamentals → approaches → standards
  → depth; wording states what each generates).
- Done when: the "friend test" passes — a cold visitor can say what the page is for
  after the hero and one answer.

### 13. Docs & glossary alignment

- Files: `docs/adr/0002-single-declarative-engine.md` (new, supersedes ADR-0001 on the
  approach point), `CONTEXT.md` (Hybrid approach / Tool-calling component entries),
  `AGENTS.md` blurb if stale.
- Done when: no project doc still describes the hybrid as current.

## Verification

- `npm run test` — spec schema + renderer units (steps 2–3).
- `npm run lint`, `npm run build` — every step.
- Manual dev run with a real key (steps 4–5): suggested prompt, free question,
  off-topic question, "who made this?" in Italian and English.
- Live check after deploy (step 7).

## Risks & open points

- **Exact Gemini model id** — pin at step 4 against Google's current free-tier docs;
  candidates in the gemini-flash family (`inferred`).
- **Recursive Zod schema vs Gemini structured output** — Gemini may reject deeply
  recursive JSON schemas; fallback already designed: bounded-depth spec (`inferred`).
- **Quota/abuse protection deferred** (functional analysis): no per-visitor cap in v1;
  free-tier hard limit is the only ceiling.
- Final hook/prompt wording and background aesthetics settle during steps 5–6.

## Free-tier facts observed live

- Per-minute: 15 req/min project-wide (gemini-3.1-flash-lite).
- Per-day: **500 req/day** (from Google's own 429: `generate_content_free_tier_requests, limit: 500`) — lower than the ~1,500 commonly cited; QuotaRing cap set accordingly.
- Mitigation shipped: RATE_LIMITED countdown (server forwards Google's retry delay) + optional Groq free-tier fallback chain (`GROQ_API_KEY`), combined ~45 req/min & +14.4k req/day at 0 EUR.

## General test pass (2026-07-10, evening)

Unit 19/19, lint clean, production build OK. Live end-to-end: concept / form /
freeform / contact each rendered first-shot with the right tool and zero retries;
Italian off-topic gracefully redirected in Italian with a demo nudge; homepage and
avatar 200; malformed API body 400.

## Security & privacy review (2026-07-10, pre-publication)

- **Secrets**: API key server-side only (`GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`, gitignored; `.env.example` explicitly un-ignored). No key material reaches the client bundle.
- **Injection/XSS**: no `dangerouslySetInnerHTML`/`eval` anywhere; every model-generated value renders as React-escaped text; spec renderer is allow-list-only, executable/embed node types (`script`, `iframe`, …) are dropped, never salvaged; external links use `rel="noreferrer"`.
- **API hardening**: `/api/chat` validates the body (400 on malformed, max 40 messages, 413 over 60k chars), `maxOutputTokens: 2500`, `maxDuration: 30`; masked errors except the deliberate spec-teaching message.
- **Headers**: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`.
- **Privacy**: no accounts/cookies/analytics; conversations not stored server-side; messages processed by Google's Gemini API to generate replies (disclosed in the page's own knowledge); localStorage holds only an anonymous daily usage estimate; form answers travel like any chat message.
- **Residual (accepted)**: no per-visitor rate limit (deferred; free-tier caps bound the damage), system prompt is extractable (contains only public content), no CSP (Next inline scripts; revisit post-launch).

## Sources

- AI SDK generative UI (v7 pattern, tool parts & states): <https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces> — settled the useChat/tool-parts mechanism and part state names.
- Google provider (`@ai-sdk/google`): <https://www.npmjs.com/package/@ai-sdk/google> and <https://ai-sdk.dev/providers/ai-sdk-providers/google> — settled provider instantiation and `GOOGLE_GENERATIVE_AI_API_KEY`.
- Free-tier landscape: <https://klymentiev.com/blog/free-llm-api> — settled that Gemini Flash free tier (~1,500 req/day) covers expected traffic at 0 EUR.
- Model pin: <https://ai.google.dev/gemini-api/docs/rate-limits> — default settled to `gemini-flash-lite-latest` after live testing: 3.5-flash free tier rejects with persistent "high demand", 2.5-flash is retired for new users. Overridable via `GENUI_MODEL`.

## Change history

| Date | Source | Change | Reason |
|------|--------|--------|--------|
| 2026-07-10 | Technical interview | First version | Plan created from confirmed functional analysis |
| 2026-07-10 | Implementation | Steps 1–6 executed (one shot) | Open point resolved during build; deploy (step 7) pending |
| 2026-07-10 | Live testing | Model default → `gemini-flash-lite-latest` (env-overridable); render_ui hardened: loose input schema + repair layer (type inference, enum sanitizing, shape fixes) validated in execute, unmasked teaching errors for model retries; step budget 3→5 | 3.5-flash free tier saturated, 2.5 retired; Gemini lite emitted near-miss specs (missing type, out-of-enum variants, title-for-content) |
| 2026-07-10 | Stakeholder request | Spec vocabulary extended with interactive blocks: accordion, tabs, stats (count-up), code (copy); origin badge on every generated block ("AI-generated" for render_ui, "Hand-crafted" for curated tools); glass hover lift; repair extended (collection aliases content→items, tabs title→label, numeric-string stats) | More/cooler components with epic interactions + visible AI-vs-crafted distinction. Note: lite free tier is 15 req/min project-wide — feeds the deferred quota-protection open point |
| 2026-07-10 | Stakeholder request | Persistent suggestion rail above the composer (8-question pool, rotates out asked ones); curated components upgraded to showcase level: ConceptCard (kicker, corner glow, shine sweep), Comparison (gradient bars, mono indexes), Timeline (self-drawing spine, glowing dots, label pills), ContactCard (orbiting conic ring, pill links) | Suggestions always within reach; hand-crafted blocks must visibly earn their badge |
| 2026-07-10 | Stakeholder request | Every curated component made interactive: pointer-tracking 3D tilt (ConceptCard, ContactCard), Timeline steps expand on tap, Comparison columns focus on tap; NEW form component (show_form tool + form spec node) whose answers round-trip into the chat as the visitor's next message; suggestion pool restructured as a guided tour — 10 prompts, each mapped 1:1 to a different showcase block (mapping enforced in system prompt) | Hand-crafted blocks must all be interactive with standout animations; forms requested; each suggestion demonstrates a different state-of-the-art capability |
| 2026-07-10 | Stakeholder request | Composer redesigned: icon-only gradient send button inside the input; QuotaRing next to the composer (Cursor-style circular meter of estimated daily free-tier usage, localStorage per-day, cyan→amber→rose); premium animation layer: cursor-following spotlight + rotating border beam on tilted cards, spring pop on timeline dots; "Who made this page?" promoted to first rail slot | UI polish round: icon send, visible quota progress, premium motion on hand-crafted blocks, owner card easy to reach |
| 2026-07-10 | QA report + stakeholder | Repair layer covers cardinality: header-only collection nodes downgrade to lead text, single-item accordion/tabs/timeline merge into text, oversized arrays trimmed to schema maxima; teaching error enumerates all collection shapes; GenForm redesigned sober/professional (header strip, numbered fields, radio cards with check, footer with reassurance + solid CTA); real LinkedIn URL in OWNER | "Deep-dive the emerging standards" dead-ended (accordion without items sank the spec); form had to look serious; owner provided the URL |
| 2026-07-10 | QA report + stakeholder | Stats count-up fixed (StrictMode double-effect left numbers at zero); suggestion order: form quiz first, contact second; form mapping demands every field kind in one quiz; ConceptCard → 3D flip card (front hook / back essentials); ContactCard: portrait slot (public/davide.jpg, initials fallback) + Copy link button; tabs wrap responsively on mobile; prompt: "you ARE the demo" — prefer touchable blocks, one-line nudge to next interaction | Numbers showed zero in dev; owner wants form and contact suggestions first, full-field demo form, interaction on every curated block, his face in the card, responsive tabs, stronger demo feel |
| 2026-07-10 | QA report | Form no longer repeats: show_form is a terminal stop condition server-side (`hasToolCall`) + client renders at most one form per message (last wins) | Clicking the form suggestion rendered the form 3 times — the model kept re-calling the tool across steps |
| 2026-07-11 | Stakeholder request | Vocabulary batch: 7 new spec blocks — actions (tappable follow-ups that send chat messages), chart (bar/donut/line, SVG, draw animations, palette validated with the dataviz method vs dark surface), progress, callout, chips, table, links (domain allow-list, HTTPS-only — GitHub excluded per owner; official resources listed in knowledge); drag-to-reorder: multi-block free compositions get a ⣿ grip per block, pointer-based sortable with live shift animations ("this layout is yours now"); system prompt rewritten to PE standards (identity → 8 numbered absolute rules → block vocabulary → tour mapping → flows), incl. rule 5: only promise interactions that exist; badges renamed Tool call / JSON composition / Freeform (3rd type = text-salvaged), tap explains mechanism, violet dot (rose read as error); stage-direction lines "[X rendered above]" stripped; flip back-face blur eliminated (no scale on flipped column, tilt transform dropped when disabled); LoadingStatus randomized order, 1.5s cadence, replaces ALL skeletons until first real content | Batch approved; model promised drag that didn't exist — now it does; prompts to PE standards; paper/resource links requested |
| 2026-07-11 | Stakeholder request | Skeleton loaders removed entirely: the rotating LoadingStatus pill is the ONLY waiting state and stays until the first real block or text is on screen (per-message visible-content check); pending parts render nothing | Loading must be the status pill alone, until the component actually appears |
| 2026-07-11 | Deep test pass + stakeholder | Structural test battery exposed and fixed: countdown regex missed Groq's "29m36s" (minutes now parsed, and the chain surfaces the SHORTEST provider wait); history capped to last 12 messages (token diet); OpenAI added as PRIMARY (gpt-5-nano, ~€0.001/msg, owner's €4 credit) with Gemini→Groq fallbacks; forced tool call on first step (prepareStep) — every answer opens with UI; nano's tics tamed: reasoningEffort low (not minimal), husk nodes (type-only) dropped by repair, middle-way loose-but-documented render_ui schema (strict broke Groq validation, empty-loose made nano emit husks), markdown narration stripped client-side when a component rendered, JSON envelope sentences unwrapped, show_form description forbids using it to present content; LoadingStatus (ChatGPT-style rotating phrases incl. free-tier humor); OriginBadge now tappable — explains tool-call vs free-composition mechanism; Groq free tier facts: llama-3.3 daily cap 100k tokens (exhausted by testing) | "Testa meglio, qualcosa non torna" + loading statuses + mechanism clarity requested; owner supplied OpenAI key |
| 2026-07-12 | Stakeholder request | Vocabulary batch: flipcards (tap-to-flip, front/back, FlipScene reuse), gauge (radial dials, count-up + sweep), text variant "display" (gradient headline); system prompt rule 5 rewritten as per-block affordances ("KNOW YOUR OWN COMPONENTS" — accordion EXPANDS, never flips); voice section bans assistant clichés; provider chain confirmed OpenAI-first live (nano misfire on show_concept fixed with negative tool-description boundaries + imperative tour showcases) | Cooler components; model announced blocks it didn't render (flip card vs accordion); texts sharpened; OpenAI key as primary confirmed |
| 2026-07-12 | Change CH-001 | Delta plan added (tasks 8–13): retire curated engine (contact card excepted), conceptmap + diagram blocks, per-block spec reveal, curriculum rewrite, purpose-declaring onboarding, ADR-0002 + glossary alignment | Spec change: from hybrid explainer to serious learning demo on a single declarative engine (see change-log.md CH-001) |
| 2026-07-11 | QA report | JSON-in-text salvage: models on the Groq fallback sometimes narrate the spec as a ```json fence instead of calling render_ui — splitSpecFences now parses/repairs it into real UI (pending block while streaming, code block when unsalvageable), prompt forbids JSON in text; gpt-oss reasoning routed to reasoning parts (only for gpt-oss — llama rejects the option); fallback default → llama-3.3-70b-versatile (gpt-oss free TPM is 8k, ~2 of our requests/min); Groq validates tool args server-side → render_ui children now z.looseObject (z.record rendered as no-additional-properties and got rejected); retry-delay regex covers Groq's "try again in Xs"; stats tiles with non-numeric values dropped; onError logs readable messages; performance: border beam runs on hover only (per-frame gradient repaint dragged the whole page); real Groq key moved out of .env.example (was about to be committed) | JSON shown instead of widgets; page slowness; secret misplacement — all found during owner testing with the fallback newly active |
| 2026-07-10 | Stakeholder request | RATE_LIMITED countdown: server forwards Google's own retry delay, amber card with live 0:41 timer, button lights up at zero; provider fallback chain (Gemini → Groq via `GROQ_API_KEY`, wrapper at LanguageModelV4 level with unit tests) — the same request silently retries on Groq when Gemini rate-limits; form answers now travel as hidden messages (metadata.hidden): the visitor sees only the filled form, then the reply restating their choices; QuotaRing daily cap corrected to 500 (observed live from Google's 429) | Timer visibility requested; more generous free tier requested (Groq: 30 req/min, 14.4k req/day); form auto-input had to disappear from screen; real daily cap discovered during testing |
| 2026-07-10 | QA report + stakeholder | Flip made truly seamless: the post-flip flatten (settle) and the pre-unflip restore are transition-free switches (they animated as a ghost second rotation); demo voice sharpened (concrete imperative nudges, "walls of text are over" identity in hero caption, knowledge and prompt); style signature: focus-frame corners drawing in on every generated block, blueprint dot grid in the background, sheen sweep on the hero title; portrait re-cropped taller with neck/collar; general test pass recorded above | Flip still glitched (phantom rotation on settle); more demonstrative tone, more original style, taller crop, full regression pass requested |
| 2026-07-10 | QA report + stakeholder | Error handling redesigned: RetryNotice glass card with one-tap Recompose/Try-again (useChat regenerate via actions context), human-facing wording (teaching text stays model-only); render_ui variety enforced in prompt + tool description (anti-accordion bias, mixed-block compositions); API hardened (body validation 400/413, 40-message & 60k-char caps, maxOutputTokens 2500); security headers; `.gitignore` un-ignores `.env.example`; privacy disclosed in page knowledge + honest form footer; flip made sharp (settled state drops 3D transforms post-turn, tilt disabled while flipped, solid faces without backdrop-filter); owner portrait cropped from original photo → public/davide.jpg | Prettier errors, block variety, publication-readiness review, blurry flip text, portrait requested |
| 2026-07-10 | QA report + stakeholder | Flip glitch fixed: dedicated flip-scene/flip-face CSS with explicit transforms in every state (glass hover was overriding the back face's rotateY) + webkit prefixes for iOS; Comparison columns are now flip cards too (big index front / points back, others dim); repair: generalized collection-alias donor lookup (accordion entries under 'children' was the recurring freeform killer — 4/4 first-shot after), unknown types salvaged (containers→stack, texty→text, executable types dropped); badges renamed "Composed live by AI" / "Designed by a human" with storytelling tooltips; word-by-word text reveal (keyed spans + mount animation, throttle 45ms); ChatGPT-style scroll (sent message rises to top, 55dvh runway) | Flip broke with hover+flip together (also mobile); freeform kept dissolving; clearer badge names requested; fluid streaming text and ChatGPT scroll requested |
