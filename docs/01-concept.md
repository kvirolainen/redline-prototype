# Concept: Redline

Clutch buys used cars from dealerships. This doc sets out the end state we're aiming at, the business case behind it, and the slice this prototype builds.

## 1. Why Redline

**Clutch's goal: more gross profit.** Gross profit = profit per car × cars sold. Cars sold is capped by supply: Clutch can sell more than it can buy today, and surplus can always go out through wholesale. So Redline is a **supply** play: a second channel for buying cars, next to buying from individuals.

**Why dealerships.** A dealer's business is selling new cars and service. Used cars come in as trade-ins, an incentive to close the new-car sale. Each trade-in brings three problems:

1. **Pricing it.** The sales manager negotiates with the customer at the desk, then goes to the sales director for sign-off. Overpay and the dealer loses money; it also pulls both of them away from selling.
2. **Moving it.** Cars the dealer won't retail go to dealer-only wholesale auctions: transport, listing, waiting.
3. **What it fetches.** Wholesale prices are often poor.

Redline has to beat that exit clearly: **a better price than auction, faster cash, no logistics.**

**Why Clutch can win.** Clutch already prices cars instantly for individuals, already inspects at pickup, and already runs a dealer & wholesale team that sells cars to dealers. Redline closes the loop: Clutch also buys from them. The Tesla trade-in partnership is the closest working example.

## 2. The people

| Who | Side | What they need from Redline |
|---|---|---|
| **Maria**, Sales Manager | Dealer | A firm number at the desk while the customer is still there, without the back-and-forth |
| **Dave**, Sales Director | Dealer | Confidence the price is right; a say when it changes; proof Redline is worth it. Signs the contract |
| **Sam**, Inspector | Clutch | Today's cars, what the dealer declared, a quick way to confirm or flag a difference |
| **Jordan**, Ops | Clutch | Every dealer's pickup runs in one place, and the exceptions that need a person |

## 3. The ideal end state

One car, start to finish:

1. **Offer.** Maria enters the VIN, km and condition, in the same flow individuals use. She gets Clutch's offer next to an estimate of what the car would net at auction: *"beats auction by $1,850"*. The offer holds for 7 days.
2. **Accepted.** The car joins the dealer's **recurring pickup day** (say, every Thursday). No per-car booking.
3. **Pickup day.** Sam runs the same 15-minute check Clutch runs for individuals, against what the dealer declared.
4. **Match:** confirmed → picked up → **paid**. The dealer carries the car until pickup; payment follows the inspection.
5. **Mismatch:** Sam re-prices with a reason ("rear bumper damage not declared, −$600"). Dave sees it right away and accepts or declines. Declined → the car stays with the dealer, who takes it to auction as before.

Around that path:

- **Dealer back office.** A table of the dealer's cars, defaulting to *awaiting pickup*. Each car has a timeline. Re-prices wait for Dave's call. A slim value strip on top: cars sold, dollars above auction, days to cash, acceptance rate, re-price rate.
- **Clutch ops board.** Runs by day × dealer, cars per run, and exceptions: re-price pending, car not ready, offer expiring.
- **Edge cases.** Car not ready on the day → rolls to the next run. Offer expires → badge, one-click refresh. Dealer cancels before pickup.

**Later, not in this slice:** real pricing, contracts and dealer onboarding, payments, notifications, and a customer-direct path where the dealer passes Clutch's offer straight to the customer (how the Tesla partnership works).

## 4. The open product question: no instant answer

For individuals, Clutch's offer sometimes falls back to manual review ("we need a little more time"). At a dealer desk that breaks the moment: the customer is sitting there, and the reason Maria opened Clutch was to skip the negotiation.

**Choice for this slice:** when the calculator isn't confident, Maria still gets a **guaranteed floor on the spot** and a firm offer the same business day. The floor lets her close the new-car deal now; the follow-up lands in the back office. In the prototype this is a labelled state on the offer screen; the pricing itself is a stub.

## 5. What this prototype builds

A working app on a live shared backend, so a change on one screen shows on the others in real time (Sam re-prices on a phone; Dave's table updates).

| View | Who | What it shows |
|---|---|---|
| Landing | All | Persona picker + the demo car's journey; each step opens that person's screen on that car |
| Trade-in | Maria | Car details → offer vs auction estimate. One screen |
| Back office | Maria, Dave | Cars table, car timeline, re-price approvals, value strip |
| Ops board | Jordan | Runs by day × dealer, exceptions |
| Inspector | Sam (phone) | Today's run → cars → checklist vs declared → confirm / re-price / not ready |

**Faked on purpose:** pricing (an isolated stub where Clutch's calculator would plug in), sign-in (a persona switcher), payments, notifications (shown as log lines on the timeline).

## 6. How we'd know it works

The value strip doubles as the scorecard for a first-dealer experiment:

- **Acceptance rate:** share of offers the dealer takes. Is the price good enough?
- **Dollars above auction:** per car and in total. Is it meaningfully better than the exit they have?
- **Re-price rate:** how often the inspection changes the price. Do the at-desk inputs hold up?
- **Days to cash:** offer to payment.

A starting hypothesis to agree before the first deal: *one dealer sends at least half its non-retail trade-ins through Redline for a month, with a re-price rate under 15%.*

## 7. Next steps outside the build

- Show the flow to a real dealership before building further.
- Size the channel with Tesla trade-in volume and open wholesale data.
- Shortlist Toronto/Mississauga dealers with high wholesale volume or weak prices as first targets.
