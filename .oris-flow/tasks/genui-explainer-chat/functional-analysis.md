# Generative UI Explainer Chat — Functional Analysis

## Goal

A single-page demo for *seriously learning* what generative UI is — by being generative
UI. The visitor chats and every answer is an interface generated on the spot from a
declarative JSON spec, the state-of-the-art approach the demo also teaches. The page is
a self-demonstrating learning resource first, a technical calling card second; it never
promotes anyone. Sober, shareable, visually striking.

**Incisiveness requirement**: a first-time visitor must understand within seconds what
the page is and why it matters (the "friend test" — the previous version failed it).
The purpose is stated, not implied.

## Actors & permissions

- **Visitor** — anyone who opens the page. No login, no roles: everyone gets the same
  full experience. Reads, clicks suggested prompts, chats, inspects the spec behind any
  generated block.
- **Owner (Davide Baldassarre)** — appears only as a discreet credit line and, on
  request, as a generated contact card. Maintains the content behind the scenes.

## Behavior

Current: hybrid engine (curated tool-calling components + declarative JSON renderer),
mechanics hidden from the visitor, light ironic knowledge base, playful suggestion chips.

Desired:

1. The visitor opens the page and sees a minimal, visually striking screen whose copy
   *declares the purpose*: this page teaches generative UI by generating its own
   interface as you talk. Animated background, chat input, and suggested prompts
   ordered as a didactic progression (fundamentals → approaches → standards → depth),
   not as a random menu. No menu, no navigation, no call-to-action anywhere.
2. Every answer is composed by ONE engine: the declarative JSON spec (A2UI-aligned
   allow-list + validate/repair loop). Curated tool-calling components are retired; the
   single exception is the contact card, which stays hand-crafted and is disclosed as
   such when shown. The spec vocabulary is pushed to teaching depth: comparisons,
   timelines, charts, gauges, flip cards, flow diagrams, concept maps, node-and-edge
   diagrams.
3. Any generated block can reveal, on demand, the actual JSON spec that produced it —
   a discreet per-block action opening the highlighted payload with a one-line
   explanation. By default everything stays clean; the machinery appears only when
   asked for.
4. The knowledge behind the answers is a serious, in-depth curriculum on generative UI
   (concepts, the three approaches, the 2026 protocol stack — A2A / MCP / AG-UI / A2UI,
   validation and safety, how to build one), written as component fuel so every topic
   has a natural interface shape.
5. The conversation continues freely; each exchange keeps demonstrating the concept it
   explains. Language is adaptive: hook and suggested prompts are in English; the chat
   answers in whatever language the visitor writes.
6. If the visitor asks who made the page, the chat renders the contact card. Otherwise
   the owner exists only as the fixed credit line "Made by Davide Baldassarre".

## States & messages

- **Empty state** — background effect + purpose-declaring hook + input + didactically
  ordered suggested prompts (English).
- **Generating** — a visible, pleasant loading/streaming state while the UI composes;
  never a frozen page.
- **Spec panel** — the on-demand per-block reveal: highlighted JSON, one explanatory
  line, dismissible; never opens on its own.
- **Off-topic question** — a short, good-natured generated reply steering back to
  generative UI. The chat never gives opinions or engages on politics or other
  sensitive topics.
- **Credit** — "Made by Davide Baldassarre", fixed, discreet, always visible.

## Edge cases

- Off-topic or playful requests ("write me a poem") → graceful redirect (see above).
- Visitor writes in any language → answer follows that language, UI included.
- Who-made-this questions → contact card, factual and sober; no self-promotion beyond it.
- Spec reveal on a block whose spec was repaired → show the spec as rendered (the
  validated result), never the raw broken payload.

## Scope

- **Included**: single chat page; single declarative engine (JSON spec, A2UI-aligned);
  advanced teaching blocks (concept map, node-and-edge diagram, plus the existing
  vocabulary); per-block spec inspection on demand; in-depth curriculum knowledge;
  purpose-declaring hook; didactic suggestion progression; adaptive language; discreet
  credit + on-request contact card (the one curated exception); graceful off-topic
  handling; per-IP interaction budget with visible quota ring.
- **Excluded**: menus, navigation, any CTA; CV/portfolio content; user accounts;
  conversation persistence across visits; course/chapter navigation (free chat only);
  a live "three approaches side by side" lab (considered, not taken — single-engine
  focus won).
- **Retired by this change**: curated tool-calling components as an engine
  (show_concept, show_comparison, show_timeline, show_form); the hybrid approach as
  the page's architecture and story.

## Open points

- Depth and structure of the expanded curriculum (chapters, sources, how much 2026
  protocol detail) — settles while writing it.
- Exact wording of the purpose-declaring hook.
- Concept-map and diagram block ergonomics for small models (layout limits, max nodes).

## Estimate

**13 Story Points** (original build) **+ 8 Story Points** (this change: engine
consolidation, two advanced blocks, spec reveal, curriculum rewrite, onboarding copy).

## Change history

| Date | Source | Change | Reason |
|------|--------|--------|--------|
| 2026-07-10 | Stakeholder interview | First version | Initial discovery; concept pivoted during the interview from "interactive CV" to "generative UI explainer" |
| 2026-07-12 | Change interview (CH-001) | Repositioned as a serious learning demo: single declarative engine (curated tools retired, contact card excepted), per-block spec reveal on demand, in-depth curriculum, purpose-declaring hook, didactic suggestion progression, concept-map/diagram blocks | Real-visitor feedback ("I don't get what this is for") + owner's push for a state-of-the-art, single-approach demo; JSON spec confirmed as the 2026 state of the art (A2UI/Open-JSON-UI) |
