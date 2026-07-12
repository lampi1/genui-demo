# genui

**A page with no interface. It generates one as we talk.**

🔗 **Live demo: [genui-demo-bice.vercel.app](https://genui-demo-bice.vercel.app/)**

A one-page, hands-on demo for *learning* generative UI by talking to one: instead of
a static article, you chat — and every answer arrives as an interface composed on the
spot. Cards that flip, charts that count up, concept maps you can explore leaf by
leaf, diagrams drawn from JSON, forms that interview you, even a pop quiz with one
truth and three traps. And under every generated block: **"view the spec"** — the
exact JSON it was rendered from.

## How it works

One engine, the state-of-the-art approach the page also teaches: the model emits a
**declarative JSON spec** (A2UI-style) restricted to an allow-list of blocks; a
client-side renderer validates it and draws it. The model proposes data — never code.

Between the model and the screen sits a **repair layer**: it salvages every malformed
shape a small model actually produces (misplaced keys, wrapper objects, husk nodes,
JSON narrated as prose…) and answers the rest with one teaching error the model
self-corrects from. The visitor only ever sees finished UI.

That loop — prompt → generate → validate → self-correct — is the same architecture
A2UI v0.9 standardized. The one hand-crafted exception is the contact card, and the
page says so.

## The details that make it feel alive

- 🗺️ **Interactive concept maps** — branches focus on tap, every leaf is a door to the next answer
- 📐 **Auto-layout diagrams** — nodes and labeled arrows, layered automatically from the model's JSON
- 🎨 **Two skins, one toggle** — light classic neumorphism (default) and dark aurora glass, entirely token-based: components never hardcode a theme
- 🎠 **Carousel compositions** — multi-block answers show one block at a time; follow-up actions always stay in reach
- 🧠 **Word-by-word streaming** with smooth pacing, memoized history, zero skeletons
- 🎯 **Interactive quiz block** — wrong answers shake, the right one glows
- 🔍 **Spec reveal** — any generated block shows the validated JSON behind it, on demand
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

Domain vocabulary in [CONTEXT.md](CONTEXT.md) · agent guidance in [AGENTS.md](AGENTS.md).

---

Made by **Davide Baldassarre** — built to learn generative UI by shipping one.
