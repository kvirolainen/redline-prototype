# Redline

Prototype of **Redline**: Clutch buys used cars from dealerships. A sales manager gets an instant
Clutch offer for a trade-in at the desk, the car joins the dealer's regular pickup day, a Clutch
inspector confirms or re-prices it at pickup, and the dealership is paid.

> Work in progress. Live link and demo path will be added here.

## Docs
- [Concept](docs/01-concept.md): the problem, what we learned in the room, and what this prototype builds
- [Desk or online?](docs/02-desk-or-online.md): where the trade-in happens
- [The modules](docs/03-the-modules.md): who each module is for, what matters to them, and the design calls
- [Architecture](docs/04-architecture.md): the system, what's faked on purpose, how it was tested

More:
- [Demo](docs/demo.md): the path through all four modules, step by step
- [Process](docs/process.md): how it was made, from the whiteboard to a live app
- [Dealer research](docs/dealer-research.md): who to sign as the first dealer

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
