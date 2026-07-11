# genui

**A page with no interface. It generates one as we talk.**

This is a one-page demo that explains *generative UI* by **being** generative UI:
instead of a static article, you chat — and every answer arrives as an interface
composed on the spot. Cards that flip, charts that count up, timelines that unfold,
forms that interview you, even a pop quiz with one truth and three traps.

## How it works

Two generation modes, one design system — the **hybrid approach**:

|                        |                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- |
| 🧩 **Tool-calling**     | Curated React components the model invokes with typed props — reliable, pixel-perfect |
| ✨ **Declarative spec**  | An A2UI-inspired JSON tree, validated against an allow-list and rendered client-side — true free composition |

Between the model and the screen sits a **repair layer**: it salvages every malformed
shape a small model actually produces (misplaced keys, wrapper objects, husk nodes,
JSON narrated as prose…) and answers the rest with one teaching error the model
self-corrects from. The visitor only ever sees finished UI.

## The details that make it feel alive

- 🎨 **Two skins, one toggle** — light classic neumorphism (default) and dark aurora glass, entirely token-based: components never hardcode a theme
- 🎠 **Carousel compositions** — multi-block answers show one block at a time; follow-up actions always stay in reach
- 🧠 **Word-by-word streaming** with smooth pacing, memoized history, zero skeletons
- 🎯 **Interactive quiz block** — wrong answers shake, the right one glows
- ⏱️ **Honest budget** — 15 interactions per 15 minutes per visitor, enforced server-side and drawn live as a ring around the send button
- 🔒 **Nothing stored** — no accounts, no cookies, no analytics; conversations exist only long enough to be answered

Runs for **0 EUR/month**: Vercel Hobby + free-tier models with a silent multi-provider
fallback chain.

## Quickstart

```bash
cp .env.example .env.local   # add your (free) API key
npm install
npm run dev                  # http://localhost:3000
```

`npm run test` (Vitest) · `npm run lint` (ESLint) · `npm run build`

## Project map

| Where                    | What                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `src/lib/system-prompt.ts` | The director's script the model performs                  |
| `src/lib/ui-spec.ts`       | Allow-list schema + the repair layer                       |
| `src/lib/suggestions.ts`   | The guided tour — one source for chips AND prompt          |
| `src/components/genui/`    | The building blocks every answer is made of                |
| `docs/adr/`                | Why the stack looks like this                              |

Domain vocabulary in [CONTEXT.md](CONTEXT.md) · agent guidance in [AGENTS.md](AGENTS.md).

---

Made by **Davide Baldassarre** — built to learn generative UI by shipping one.
