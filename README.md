# Redline

Prototype of **Redline**: Clutch buys used cars from dealerships. A sales manager gets an instant
Clutch offer for a trade-in at the desk, the car joins the dealer's regular pickup day, a Clutch
inspector confirms or re-prices it at pickup, and the dealership is paid.

> Work in progress. Live link and demo path will be added here.

## Docs
- [Concept](docs/01-concept.md): business context, users, the end state, and the slice this prototype covers
- [Prototypes](docs/02-prototypes.md): design variants and the picks
- [Build plan](docs/03-build-plan.md): data model, car statuses, milestones
- [Test report](docs/04-test-report.md): what was tested and what changed
- [Decisions](docs/decisions.md): running log of decisions and why

## Run locally
Requires Node 22 (`.nvmrc`).

```bash
npm install
npx convex dev      # backend (Convex); writes VITE_CONVEX_URL to .env.local
npm run dev         # frontend (Vite)
```

## Stack
React + TypeScript + Vite, Tailwind CSS, Convex (database, server functions, live queries).
Styled after Clutch's public web design (colours, type, pill controls); Figtree stands in for Circular.
