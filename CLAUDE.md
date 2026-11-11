# Redline — prototype

Clutch buys used cars from dealerships ("Redline"). This repo is a working prototype of one car's
path: dealer trade-in → instant offer → recurring pickup day → inspection (confirm or re-price) →
director approval → payment, plus the dealer's Back office and Clutch ops.

## Read first
- `docs/01-concept.md` — what we're building and why
- Docs can embed live screens and diagrams with block directives on their own line: `::screen[trade-in/B]`,
  `::screens[inspector]`, `::diagram[architecture]`; images go in `docs/img/` as `![alt](img/file.png)`.
- `docs/03-the-modules.md` — who each module is for and why it's designed the way it is; record a new design
  call in its module's section, with the reason

## Stack & commands
- Node 22 (`.nvmrc`). React 19 + TypeScript + Vite, Tailwind v4 (theme in `src/index.css`), React Router, Convex.
- `npm run dev` (frontend), `npx convex dev` (backend), `npm run build` (typecheck + bundle).

## Conventions
- Visual language follows Clutch's web design: brand red `#FF464C`, near-black ink text, `#FAFAFA` canvas,
  white cards with 1px `#DDDDDD` borders, 32px pill buttons, 8px cards, 16px panels, borders over shadows.
  Font: Figtree (substitute for Circular). Inside product flows the primary button is a black pill and
  selected states are black; the red CTA gradient (`bg-cta`) is for marketing CTAs only. Flow inputs are
  56px with an 8px radius and a `#EEEEEE` outline. Reuse `src/components/ui/` and the Foundations stories.
- Modules and personas, dealer-facing first: Trade-in (Maria, Sales Manager, Yorkdale Honda) → Back office
  (Dave, Sales Director, Yorkdale Honda) → Clutch ops (Jordan, Operations) → Clutch inspector (Sam, Inspector,
  phone layout).
- Pricing is a labelled placeholder for Clutch's real valuation engine — keep it isolated in one module.
- Every car state change writes an event, so each car has a full timeline.
- Commit messages: imperative, say what changed and why.
