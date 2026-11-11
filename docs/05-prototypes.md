# Prototypes

Each screen was explored as **three deliberately different versions**, built as clickable prototypes with local data, before one was chosen. Three versions force real trade-offs into view; one version only invites polish.

All twelve share the same demo moment: **Thu Nov 12**, pickup day, when Sam's inspection re-prices the 2019 Civic from **$17,850 to $16,950**. Click through each one below.

## 1. Trade-in · Maria, laptop at the sales desk

**Job:** a firm offer in under two minutes, on a screen Maria and the customer look at together.

- **A · Step by step.** Clutch's own sell flow (Basic info › Features › Condition › Offer). Familiar and thorough, but four screens before a number.
- **B · One page, live offer.** Every question on one scroll; the offer narrows from a range to a firm number as she answers. Fastest for a regular user, denser for a first-timer.
- **C · Quick quote first.** VIN and km give a range in seconds; five price-moving questions firm it up and the rest is assumed. Quickest to a number, more re-price risk on pickup day.

::screens[trade-in]

**Picked: B, refined into B2 · One screen.**

::screen[trade-in/B2]

Why B: Maria prices trade-ins every week. For someone who repeats a task, one screen where every answer sits in the same place beats a guided flow: she works from memory, in any order. What changed from B:

- **Clutch's full question list.** The 15 questions from Clutch's sell flow that apply to a dealer (disclosures, accidents, exterior, rust, interior, mechanical, driveable, overall condition, loan or lease, keys, features, factory rims, tire sets, tire type, when the all-seasons were replaced). Dropped: ownership, sell or trade, and when you plan to sell, because the dealership is the seller and it sells now. Transmission and colour come from the VIN.
- **One screen, two bands.** Across the top: the car and its price (VIN, odometer, the decoded car, then the offer and the one action), where both people look first. Below, the questions at full width in two columns, short ones two to a line, so answers never wrap. Fits 1440 × 900 and 1280 × 800 with no scrolling; nothing stretches to fill the screen.
- **Answer in any order**, even before the VIN.
- **The price appears once.** Until every answer is in, the panel shows progress, not a number, so the customer never watches it move.
- **Every word is fine for the customer to read.** The auction comparison is the dealer's business and moved to Back office. Clutch's honesty notes stay, worded for both people ("It's checked at pickup").
- **No "guaranteed floor".** A car Clutch can't price instantly says why (over 200,000 km, a branded title) and when the offer comes (by 3:00 pm today); it lands in Back office to accept.
- **No "today's trade-ins" list.** Nothing in this MVP knows the dealer's trade-ins before Maria types the VIN; pulling them from the dealer's sales system is a later integration. A full VIN looks the car up on its own.
- **The confirmation follows Clutch's own firm-offer card**, then what happens next (pickup, inspection, payment) and two ways on: another trade-in, or Back office.

## 2. Clutch ops · Jordan, Clutch ops, desktop

**Job:** every dealer's pickup runs in one place, and the exceptions that need a person.

- **A · Week grid.** Dealers × run days, a dot per car. Best for planning the next two weeks; today's progress is only a count.
- **B · Today's runs.** One card per truck, stops in order with ETAs and live progress. Best for watching the day; planning needs another screen.
- **C · Exceptions first.** A queue of what needs ops now (re-price waiting, run with no inspector, offer expiring), one action each, with a small calendar beside it. Fastest to unblock; the runs are only a summary.

::screens[ops-board]

**Picked:** _pending_

## 3. Clutch inspector · Sam, phone, in a parking lot

**Job:** check each car against what the dealer declared, in about 15 minutes with one hand, then confirm, re-price or mark not ready.

- **A · Run, car, checklist.** A run list, then one checklist per car with Match / Different on every row. Easy to scan; every check takes a tap.
- **B · One car at a time.** One question per screen, the declared answer shown big, a running price that drops with each difference. Hardest to get wrong; slow for a clean car.
- **C · Exceptions only.** Five areas, each closed with one "All match" tap; only a difference opens for detail and a photo. A clean car in 5 taps; relies on Sam really walking each area.

Every version needs a photo per difference before a re-price can go to Dave.

::screens[inspector]

**Picked:** _pending_

## 4. Back office · Dave, sales director

**Job:** decide re-prices fast, keep offers from expiring, and see what Redline is worth.

- **A · Table first.** Value strip, a notice per thing that needs Dave, then the cars table. Familiar and dense; the decision is one click away.
- **B · Needs you inbox.** The re-price and the expiring offer decided in place, next to every car grouped by pickup day. Fastest to act on; a narrower list.
- **C · Pipeline board.** A column per stage, offer made to paid. Shows the flow at a glance; tight on an iPad.

::screens[back-office]

**Picked: B, refined into B2 · Decide and track.**

::screen[back-office/B2]

Why B: the sales director doesn't work in the back office, he drops in between deals. He comes for three things: a quick morning check ("does anything need me?"), a decision pushed to him on pickup day (the re-price), and once a month, "is this worth it?". An inbox of decisions serves the first two in seconds. What changed from B:

- **Two people, one page.** Dave decides on the left. Maria, the sales manager, works the car list on the right: a **Ready** tick per car on the next pickup (on the lot, both keys, ownership papers), and accepting an offer that a Clutch appraiser priced after the desk. Trucks and arrival times stay with Clutch ops.
- **Keep any for your lot?** The director decides where each trade-in goes: retail on his own lot, or wholesale. Before each pickup he can pull any car off it. Clutch's offer is firm, so he doesn't approve the price; he decides whether the car goes.
- **Value is one line here; Results is its own tab.** Clutch's own feedback on the first dashboard: the summary took too much room. Results answers "is Redline worth it?" in money: dollars above auction, days to get paid, staff time saved, and how often inspection changed the price (the trust number), by month. These are also the numbers he takes to the dealer principal, and the scorecard for the first-dealer experiment.
- **Staff time saved** uses an assumed 1.5 hours of auction work per car, to confirm with the first dealer.
