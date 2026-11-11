# Process

How the prototype was made, from the whiteboard to a live app. The first versions of each screen, and the foundations they share, are in [Storybook](https://redline-storybook.vercel.app).

## 1. The whiteboard

The in-person session with Clutch: the problem, who decides at a dealership, and which parts Clutch already has.

## 2. Clutch's look and feel

Clutch's public site, its sell flow, its firm-offer card and its inspection report. Colours, type, pill controls, black selected states and the pale-yellow honesty notes became the shared foundation every screen uses ([Storybook → Foundations](https://redline-storybook.vercel.app/?path=/story/foundations-brand--colours)).

## 3. First concept, split into modules

The whiteboard became the [Concept](01-concept.md): one car's whole path, split into four modules, one per person who touches the car.

## 4. Desk or online?

The first open question: does the trade-in happen at the sales desk or online? It got its own page, [Desk or online?](02-desk-or-online.md), instead of being settled quietly inside a screen.

## 5. A closer look at the people

For each module: who uses it, how often, what's hard and what matters to them. That set the main design call for every screen, written up in [The modules](03-the-modules.md).

## 6. Prototypes: versions, then iterations

Each module was first built as three deliberately different versions, clickable on sample data and side by side in Storybook. Three versions bring the trade-offs into view; one version only invites polish. Trade-in, for example:

::screens[trade-in]

The best version of each then went through rounds of review: Trade-in took six. Clutch ops and Clutch inspector ended up as a new version that combines the best parts of the first round.

## 7. Architecture

One live backend, one data model for the car and its status, one query feeding every module, and every change as a single transaction that records who did what and why. Details in [Architecture](04-architecture.md).

## 8. Wiring it up

The picked screens were connected to the live backend. Wiring changes the data, not the screens, so later refinements stayed Storybook edits.

## 9. QA and fixes

A code review of the whole build, then a scripted browser click-through of the full path and screen-fit checks at common laptop sizes and on a phone. Everything found was fixed before the demo.

## 10. The demo path

One car, start to finish, person by person: [Demo](demo.md).

## Extra: dealer research

Alongside the build: who should be the first Redline dealer, and how much public data can tell. In [Dealer research](dealer-research.md).

## Tools

Built with Claude Code as a pair. The first versions of the four modules were built in parallel by four agents, each in its own git worktree and folder so they couldn't collide, in about ten minutes per module. The calls on each screen came from reviewing it as the person who'd use it; the agents did the building, the screenshots and the checks.
