# ADR-0002: Single declarative engine (JSON UI spec)

Date: 2026-07-12 · Status: accepted · Supersedes the "hybrid" approach point of ADR-0001

## Decision

- **One engine**: every answer is composed through `render_ui` — the declarative,
  allow-listed JSON UI spec validated and repaired server-side. Curated tool-calling
  components are retired as an engine; `show_contact` remains the single hand-crafted
  exception, disclosed as such.
- **Positioning**: the page is a serious learning demo for generative UI; the engine it
  runs on is the approach it teaches as the state of the art.
- **Transparency**: any generated block can reveal its validated spec on demand
  (per-block, default hidden).

## Why

- The declarative JSON spec is the 2026 state of the art: Google A2UI / Open-JSON-UI is
  the payload layer of the settled protocol stack (A2A · MCP · AG-UI · A2UI), and A2UI
  v0.9's prompt→generate→validate→self-correct loop is architecturally what this
  project's `render_ui` + repair layer already implement.
- Real-visitor feedback showed the hybrid diluted the story: with two engines the demo
  demonstrates neither clearly. One engine, inspectable, makes the lesson the product.
- Tool-calling remains the production default industry-wide for predictable traffic —
  the *curriculum* still teaches all three approaches honestly; the page just runs on one.

## Rejected

- **Keep the hybrid** — visual quality was never the problem; clarity was.
- **Three-approaches live lab** (same question answered by all three engines side by
  side, including sandboxed raw HTML) — strongest didactic wow, but splits the budget
  and the story; parked as a possible future exhibit.
- **Raw HTML as engine** — 5–15 s latency and fragility in front of visitors; stays a
  topic, not a motor.

## Constraints carried over

ADR-0001 stack, cost ceiling (≤ 5 EUR/month) and provider chain stay unchanged.

## Sources (verified 2026-07-12)

- A2UI + MCP Apps: <https://developers.googleblog.com/a2ui-and-mcp-apps/>
- A2UI v0.9 (prompt-generate-validate): <https://www.copilotkit.ai/blog/a2ui-whats-new-in-google-generative-ui-spec>
- 2026 agent protocol stack: <https://medium.com/@visrow/a2a-mcp-ag-ui-a2ui-the-essential-2026-ai-agent-protocol-stack-ee0e65a672ef>
- Cross-protocol examples: <https://github.com/CopilotKit/generative-ui>
