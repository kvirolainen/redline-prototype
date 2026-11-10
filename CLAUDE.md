# Redline — prototype

Clutch buys used cars from dealerships ("Redline"). This repo is a working prototype of one car's
path: dealer trade-in → instant offer → recurring pickup day → inspection (confirm or re-price) →
director approval → payment, plus a dealer back office and a Clutch ops board.

## Read first
- `docs/01-concept.md` — what we're building and why
- `docs/03-build-plan.md` — data model, statuses, milestones (once written)
- `docs/decisions.md` — log every non-obvious product or technical decision here as you go

## Stack & commands
- Node 22 (`.nvmrc`). React 19 + TypeScript + Vite, Tailwind v4 (theme in `src/index.css`), React Router, Convex.
- `npm run dev` (frontend), `npx convex dev` (backend), `npm run build` (typecheck + bundle).

## Conventions
- Visual language follows Clutch's web design: brand red `#FF464C` with the CTA gradient (`bg-cta`),
  near-black ink text, `#FAFAFA` canvas, white cards with 1px `#DDDDDD` borders, 32px pill buttons and
  inputs, 8px cards, 16px panels, borders over shadows. Font: Figtree (substitute for Circular).
- Personas: Maria (Sales Manager, Yorkdale Honda), Dave (Sales Director, Yorkdale Honda),
  Sam (Clutch Inspector, phone layout), Jordan (Clutch Ops).
- Pricing is a labelled placeholder for Clutch's real valuation engine — keep it isolated in one module.
- Every car state change writes an event, so each car has a full timeline.
- Commit messages: imperative, say what changed and why.
