# Demo

One car through all four modules in about ten minutes, plus the side paths worth taking if there's time or a question.

## Before you start

- Press **Reset demo** in the header. Every run then starts at the same moment: **Thu Nov 12, 10:40**, pickup day at Yorkdale Honda. On Sam's run, the RAV4 and CR-V are already loaded; the **Civic** and **CX-5** are next.
- The demo needs two screens open to show the hand-off live: the app in one window and the Clutch inspector in a second, narrower one. One window works too; switch modules from the top-right switcher.
- Each module has its own address (`/trade-in`, `/back-office`, `/ops-board`, `/inspector`), so you can open one directly.

## The main path

| # | Module | Click | Ends at |
|---|---|---|---|
| 1 | Car journey | Open the app. Point at the switcher, top right | The four modules |
| 2 | Trade-in | **Demo cars → 2020 Honda HR-V**. Answer every question, jumping between columns. **Accept offer** | HR-V joins the Thu Nov 19 pickup |
| 3 | Back office | **Needs you**: the Rogue's offer expires tomorrow. **Keep** a car in "Keep any for your lot?", then **Undo**. Tick **Ready** on a car. Open **Results** | The HR-V listed under the next pickup |
| 4 | Clutch ops | Expand **Scarborough** (31% re-priced). Expand **Downtown Toyota** (Highlander rolls a week). Open **Planning**, back to **Dealers** | "On the lot now" is quiet |
| 5 | Clutch inspector | **Civic** → take the **VIN** and **odometer** photos → open one area → **Different** → pick a finding, add the photo → **Send re-price to Dave** → **Next car: CX-5** → **Not ready** → **Second key missing** | Civic waiting on Dave; CX-5 on Nov 19 |
| 6 | Clutch ops | Look at the top band | Civic waiting, with the clock and Sam's leave time |
| 7 | Back office | The re-price leads **Needs you** → **Accept** | Accepted |
| 8 | Clutch inspector | Open the **Civic**: "Load the Civic on Truck 3" → **Loaded on the truck** | Civic on the truck |
| 9 | Header | **Skip to next pickup day** | Civic paid; HR-V on Sam's Nov 19 run; Results moved |

## Side paths

Take one when there's time, or when a question points there.

- **A car Clutch can't price instantly.** Trade-in → **Demo cars → 2013 F-150** (over 200,000 km) → **Send to Clutch**. Back office shows "Offer by 3:00 pm"; the offer lands about **45 seconds** later. Fill the wait with step 3.
- **An appraiser-priced offer.** Back office → the **2012 Camry** under open offers → **Accept**. It joins the next pickup.
- **Dave says no.** At step 7, **Decline** instead. The inspector's phone says leave the car; it stays with the dealer.
- **Dave doesn't answer.** This one plays in [Storybook's C2 story](https://redline-storybook.vercel.app/?path=/story/screens-clutch-inspector--c-2), which has "play what happens next" links under the run: send the re-price, then **No answer by leave time** → **Leave without it**. The re-price is withdrawn and the car joins next week's run.
- **A clean car.** Inspector → Vaughan Ford's **F-150** → photos → **All match** on each area → confirm. A few taps.
- **An expired offer.** After **Skip to next pickup day**, Back office shows offers that ran out; **Refresh** one.
- **Earlier versions of a screen.** Storybook → Screens → the module. Each module's "Also tried" line in The modules links straight to them.

## Steering

- **Short on time:** steps 2, 5, 7 and 8 carry the story (offer, re-price, decision, load). Skip 3, 4 and 6.
- **Time runs out mid-path:** jump to step 9; skipping the week shows where everything ends up.
- **Questions about the dealer side:** stay in Back office and open **Results**.
- **Questions about Clutch's side:** Clutch ops, then **Planning**.
- **Questions about the build:** Behind the build → The thinking → Architecture.
- **Something looks wrong:** **Reset demo** and pick up from the step you were on. Every step works from a fresh reset.
- **Before handing over the link:** press **Reset demo**, so the next person starts from the same moment.
