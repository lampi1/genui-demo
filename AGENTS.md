# genui

A single-page demo that explains generative UI by being generative UI: visitors chat,
the model renders curated components (tool-calling) or composes free layouts through a
declarative JSON renderer (A2UI-style).

Package manager: npm.

## Commands

- Setup: `npm install`
- Test: `npm run test` (Vitest)
- Lint: `npm run lint` (ESLint)
- Dev: `npm run dev`
- Build: `npm run build`

## Pointers

- Domain glossary: `CONTEXT.md` — use these exact names.
- Stack decision and constraints (cost ceiling 5 EUR/month): `docs/adr/0001-stack.md`.
- App code: `src/app/` (App Router), shared logic: `src/lib/`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
