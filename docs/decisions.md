# Decisions

Running log. Newest last. Each entry: the decision, the options considered, and why.

| # | Date | Decision | Options considered | Why |
|---|------|----------|--------------------|-----|
| 1 | 2026-11-10 | Build one car's full path (trade-in → pickup → inspection → payment) across the people who own each step, instead of a single screen | Trade-in form only · director dashboard only · full path | The product lives in the hand-offs between people: re-pricing at inspection, cars not ready on pickup day, the director's approval. A single screen can't show those. |
| 2 | 2026-11-10 | Working app with a real backend, not click-through mockups | Static prototype · real backend | A shared, live backend is what lets the inspector's re-price show up on the director's screen in real time; that hand-off is the core of the demo. |
| 3 | 2026-11-10 | Persona switcher instead of real sign-in | Real auth · fake login with personas | The demo follows one car through four people; switching persona in one click keeps that story intact. Auth adds nothing to what's being tested. |
