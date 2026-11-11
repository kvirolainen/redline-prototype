# The modules

One car, four people. Each module is built around one person's job. The design calls come from how often that person uses it, where they are when they do, and what goes wrong if they get it wrong.

| Who | Where, how often | So the module is |
|---|---|---|
| **Maria**, sales manager | At the sales desk, customer across from her, every week | **Trade-in**: one fixed screen she learns by heart |
| **Dave**, sales director | Drops in between deals, a few minutes a day | **Back office**: an inbox of his decisions, then the cars |
| **Jordan**, Clutch operations | At a desk, all day | **Clutch ops**: dealers, with two clocks: minutes and days |
| **Sam**, Clutch inspector | On a dealer's lot, one hand free, the truck waiting | **Clutch inspector**: check by exception, on a phone |

The look and components follow Clutch's own product (colours, type, pill controls, black selected states, pale-yellow notes). They're collected in Storybook under [Foundations](https://redline-storybook.vercel.app/?path=/story/foundations-brand--colours). Each module below notes what it takes from Clutch's existing screens.

## 1. Trade-in · Maria

_Sales manager · laptop at the sales desk · the customer looks at the same screen_

**Her job:** price the trade-in while the new-car deal is still warm, with no haggling and no walk to the director's office.

**What's hard today:** she haggles at the desk, then asks the director to sign off. A wrong number costs the dealer money, and the customer is watching the whole time.

**What matters to her:**
- Speed that grows with practice.
- A number the customer believes.
- Not being caught out at pickup for something she declared.

**The main call: a control panel, not a guided flow.** The usual pattern for a long form is progressive disclosure: one step at a time, so a newcomer is never overwhelmed. Clutch's consumer sell flow does exactly that, and it's right for someone who sells a car once every few years. Maria does this every week. For her, four steps are four screens of waiting. So Trade-in is one screen where every question always sits in the same place and can be answered in any order, even before the VIN. She learns where everything is, like a cockpit, and gets faster each time.

**Other calls:**
- **The price appears once.** Until every answer is in, the screen shows progress, not a number, so the customer never watches it drop answer by answer.
- **Every word is fine for the customer to read.** The auction comparison is the dealer's business, so it lives in Back office.
- **A car Clutch can't price instantly** (over 200,000 km, a branded title) says why and promises the offer by 3:00 pm the same day. It lands in Back office to accept.
- **Questions sit two to a line only when they belong together** (mechanical and driveable, rims and tire sets). The offer box lists what's still unanswered, and each name jumps to its question.

**From Clutch:**
- The 15 questions of its sell flow that apply to a dealer. Ownership, sell-or-trade and "when do you plan to sell" are dropped: the dealership is the seller, and it sells now.
- The pale-yellow honesty notes ("Only 1 in 10 cars from 2019 has no exterior damage"). They matter more here: what Maria declares is what Sam checks on pickup day.
- The firm-offer card on the confirmation.
- The "we need a little more time" fallback, tightened to a same-day promise, so the deal can still close today.

::screen[trade-in/B2]

**Also tried:** [A · step by step](https://redline-storybook.vercel.app/?path=/story/screens-trade-in--step-by-step) (Clutch's own flow, four screens before a number), [B · one page, live offer](https://redline-storybook.vercel.app/?path=/story/screens-trade-in--one-page-live-offer) (the base for B2) and [C · quick quote first](https://redline-storybook.vercel.app/?path=/story/screens-trade-in--quick-quote-first) (the fastest number, but the most re-prices at pickup).

## 2. Back office · Dave, and Maria

_Sales director · drops in between deals, often on his phone · Maria uses the same page_

**His job:** make sure trade-ins don't cost him. Decide fast when something changes, and know Redline is worth it.

**What's hard today:** he approves every trade-in price. He's afraid of overpaying, of cars sitting unsold, and of slow, poor auction prices. He's measured on new-car sales and profit; trade-ins matter only because they close the deal.

**What matters to him:**
- "Does anything need me?" answered in seconds.
- When a re-price lands mid-deal: the old and new price, the reason and photos, and what saying no means, on one card.
- Once a month, proof in money he can show the dealer principal.

**The main call: an inbox of decisions, not a dashboard.** Dave doesn't work in this screen. He comes for three things: a quick morning check, a re-price pushed to him on pickup day, and a monthly "is this worth it?". So the page opens on **Needs you** (the re-price, an offer about to expire), with the cars next to it. Value is one line at the top, and **Results** is its own tab. That also follows Clutch's feedback on the first sketch: the summary took too much room, and the table should open on cars awaiting pickup.

**Other calls:**
- **He doesn't approve Clutch's price; he decides where the car goes.** The offer is firm. What a director really decides is retail on his own lot or wholesale, so before each pickup he can **Keep** any car for his lot.
- **Maria shares the page.** She ticks each car **Ready** for the next pickup (on the lot, both keys, ownership papers) and accepts offers an appraiser priced after the desk. Trucks and arrival times are Clutch's, so they aren't here.
- **Results is also the first-dealer scorecard:** dollars above auction, days to get paid, staff time saved, and how often inspection changed the price, by month. Staff time assumes 1.5 hours of auction work per car, to confirm with the first dealer.

**From Clutch:** the director's role (decides retail or wholesale, signs the contract) and the dashboard feedback, both from the whiteboard session.

::screen[back-office/B2]

**Also tried:** [A · table first](https://redline-storybook.vercel.app/?path=/story/screens-back-office--a) (dense, closer to Maria's job than Dave's), [B · Needs you inbox](https://redline-storybook.vercel.app/?path=/story/screens-back-office--b) (the base for B2) and [C · pipeline board](https://redline-storybook.vercel.app/?path=/story/screens-back-office--c) (shows the flow, doesn't help him decide anything).

## 3. Clutch ops · Jordan

_Clutch coordinator for the dealer channel · desktop · all day_

**Jordan's job:** keep the two promises the dealer buys: "your car joins the next pickup" and "you get paid". A good week: every accepted car is picked up on its run, at the agreed price, with no second trip.

**What's new when the seller is a dealer** (Clutch already runs consumer pickups):
- **A second decider in the middle of the inspection.** At a consumer pickup the seller stands right there. At a dealer, Dave may be in a meeting while the truck waits.
- **Accepted doesn't mean on the lot.** The customer usually drives the trade-in until the new car is delivered. Offers hold 7 days and runs are weekly, so an offer can lapse before the car even arrives.
- **Full runs.** A truck goes to one dealer for many cars, so a car that isn't ready costs real money.
- **Health per dealer.** A rising re-price rate means a sales manager is over-declaring. Ops sees it first.

**The main call: assume the dispatch tool exists; show only the dealer layer.** No trucks, ETAs or inspector rosters. The page is about **dealers** and **two clocks**:
- **Minutes:** "On the lot now", a re-price waiting on a director, with how long it's waited and when the inspector has to leave.
- **Days:** one row per dealer, with readiness (including "not on the lot yet"), re-price rate, acceptance and days to cash. Each problem names who's blocking it and what it costs.

**Planning** is a second tab: dealers × run days, with no dispatch actions.

::screen[ops-board/D]

**Also tried:** [A · week grid](https://redline-storybook.vercel.app/?path=/story/screens-clutch-ops--week-grid) (the right unit, dealers, but half of it was dispatch; it became the Planning tab), [B · today's runs](https://redline-storybook.vercel.app/?path=/story/screens-clutch-ops--todays-runs) (essentially the dispatch tool Clutch already has) and [C · exceptions first](https://redline-storybook.vercel.app/?path=/story/screens-clutch-ops--exceptions-first) (the right instinct, but sorted by type, not urgency). D was built from A and C after that first round.

## 4. Clutch inspector · Sam

_Phone, one hand, outdoors · about 15 minutes a car · the truck leaves at a set time_

**His job:** confirm each car is what the dealer declared, so Clutch doesn't overpay, without holding up the run.

**What's new with dealers:** several cars per stop, the dealer's declared answers to check against, a director deciding the re-price while Sam is still on the lot, and "not ready" moving a car to next week's run.

**The main call: check by exception, but never on one tap.** Each area of the car closes with one "All match", and only a difference opens for detail, its price effect and a photo. A clean car takes a few taps. To stop "All match" from becoming a rubber stamp, the VIN and odometer photos come first.

**Other calls:**
- **The wait on Dave.** Every first version ended at "Send re-price". The real pain comes after it: Sam moves on to the next car, the answer comes back to the phone, and he loads the car or leaves it. No answer by the time the truck leaves → leave it, the re-price is withdrawn, and the car joins next week's run. This is what ties Clutch ops' clock and Dave's re-price card together.
- **A phone, not a tablet.** Walking around a car, looking under the hood and taking photos are one-hand tasks. It's designed for 390px wide and checked so it doesn't break at tablet width.

**From Clutch:** the 210-point inspection report's rows (a tick, or a yellow "!" with a short note) became the checklist, with the dealer's declared answer beside each one. The 15-minute check itself is the same one Clutch runs for consumers.

::screen[inspector/C2]

**Also tried:** [A · run, car, checklist](https://redline-storybook.vercel.app/?path=/story/screens-clutch-inspector--a) (gave the list of stops), [B · one car at a time](https://redline-storybook.vercel.app/?path=/story/screens-clutch-inspector--b) (gave the big "Yorkdale Honda declared" card inside an opened area) and [C · exceptions only](https://redline-storybook.vercel.app/?path=/story/screens-clutch-inspector--c). C2 is C plus parts of A and B, plus the wait on Dave.
