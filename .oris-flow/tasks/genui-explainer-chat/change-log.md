# Generative UI Explainer Chat — Change Log

## CH-001 From hybrid explainer to single-engine learning demo

Date: 2026-07-12 | Requested by: Owner (Davide Baldassarre) | Reason: real-visitor
feedback — a first-time visitor "didn't get what the page is for"; owner wants a
serious, state-of-the-art demo for *learning* generative UI, not a calling-card toy.

Delta: hybrid engine (curated tool-calling components + JSON renderer), hidden
mechanics, light knowledge → single declarative JSON engine (A2UI-aligned; curated
tools retired, contact card the one disclosed exception), per-block spec reveal on
demand, in-depth curriculum knowledge, purpose-declaring hero, suggestions as a
didactic progression, advanced teaching blocks (concept map, node-and-edge diagram).
The "three approaches side by side" lab was considered and not taken — single-engine
focus won. JSON spec confirmed as the 2026 state of the art during the interview
(A2UI v0.9 / Open-JSON-UI; its prompt→generate→validate→self-correct loop matches the
render_ui + repair architecture already in production).

Impacted: functional-analysis §Goal, §Behavior, §States, §Scope, §Open points,
§Estimate (+8 SP); acceptance-criteria: none exist; implementation-plan §Approach
(curated bullet superseded) + new delta tasks 8–13; code (report only): route.ts
tools, genui-tools.ts, system-prompt.ts, content.ts, suggestions.ts, part-renderer,
spec-renderer, chat.tsx hero; stale docs: ADR-0001 approach point → ADR-0002,
CONTEXT.md glossary entries.

Follow-up: implement delta (tasks 8–13)
