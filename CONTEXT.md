# Domain Glossary

One line per concept. Agents and humans use these exact names.

- **Generative UI** — the model produces the interface itself (not just text) in response to a visitor's message.
- **Tool-calling component** — a curated, hand-crafted React component the model invokes as a tool with typed props (Zod schema). Since CH-001 only the contact card uses this path; the term survives mainly as one of the three approaches the page teaches.
- **UI spec** — the declarative JSON payload (A2UI-inspired) the model emits for free composition; the renderer turns it into UI.
- **Renderer** — the client-side engine that validates a UI spec against the allow-list and renders it from design-system building blocks.
- **Allow-list** — the closed set of component types a UI spec may reference; anything outside it is rejected, never rendered.
- **Visitor** — anyone chatting with the page; no accounts, everyone gets the same experience.
- **Topic content** — the curated knowledge about generative UI (concepts, examples, standards) the model grounds every answer in; it never invents facts.
- **Contact card** — the generated card about the owner, rendered only when a visitor asks who made the page.
- **Suggested prompts** — the 3–4 clickable starter questions shown in the empty state.
- **Carousel** — the presentation of multi-block compositions: one block per view, swipe or arrows/dots to move; actions always stay visible below it.
- **Single declarative engine** — every answer is composed via the UI spec (ADR-0002); the contact card is the one disclosed hand-crafted exception. Replaced the earlier "hybrid approach".
- **Spec reveal** — the per-block, on-demand panel showing the validated JSON spec that produced a generated block; hidden by default.
- **Theme** — the page's skin, chosen with the top-right toggle: "neu" (light, classic neumorphism, default) or "glass" (dark aurora translucency). Components use tokens (`ink`, `acc-*`), never a hardcoded skin.
