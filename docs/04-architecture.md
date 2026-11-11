# Architecture

Everyone opens the same app in a browser, and it talks straight to one live backend. A change saved on one screen shows on every other screen, with no refresh.

::diagram[architecture]

## Stack and why

Picked for speed, given the limited time.

| Part | Picked | Why |
|---|---|---|
| Screens | React + TypeScript | Same as Clutch |
| Styling | Tailwind CSS | Quick to match Clutch's look by hand |
| Backend | Convex | Database, server functions and live updates in one service: no API or socket server to build |
| Hosting | Vercel | One command to a live link |
| Design review | Storybook | Each screen's versions side by side before picking one |

## One hand-off, step by step

Sam finds a dented door at pickup and lowers the price:

1. Sam's phone calls one server function. It changes the car's price and status and records who changed it and why, all in one transaction.
2. Convex re-runs every live query that reads that car.
3. Dave's Back office and Jordan's Clutch ops screen update on their own. No polling code anywhere.

## Faked on purpose

| In the prototype | In production |
|---|---|
| Person switcher | Dealer accounts and sign-in; each dealer sees only its own cars |
| Pricing stub | Clutch's valuation engine, behind the same single function |
| "Paid" is a status | A real payment to the dealer, with its own record |
| No messages | Text or email when an offer is about to expire, a re-price waits, or a car isn't ready |
| A record per change | Kept as the audit trail: who changed a price, when and why |

On Clutch's stack the same tables move to Postgres, the server functions become Express endpoints, and the two screens that need live updates get them over a websocket.

## How it was tested

- **Type checks and lint** on every change.
- **A scripted click-through in a real browser** of the whole demo path, about 35 steps across all four modules, with a screenshot checked at each step and no console errors: a trade-in, an appraiser-priced car landing in Back office, Keep and Ready, a re-price sent from the phone and decided by the director, and a car marked not ready.
- **Screen fit** measured at 1280 × 800, 1440 × 900 and 1920 × 1080 for the desktop modules, and at 390 px for the phone.

## Deployment

- **App:** built with Vite, deployed to Vercel (`vercel --prod`) on one main link.
- **Backend:** `npx convex deploy` to a production Convex deployment, separate from the one used while building.
- **One setting joins them:** `VITE_CONVEX_URL`, set in Vercel.
- **Demo data:** a reset button reloads the starting cars, so every reviewer follows the same story.
