# The modules

One car, four people. Each module is built around one person's job. The design calls come from how often that person uses it, where they are when they do, and what goes wrong if they get it wrong.

| Who | Where, how often | So the module is |
|---|---|---|
| **Maria**, sales manager | At the sales desk, customer across from her, every week | **Trade-in**: one fixed screen she learns by heart |
| **Dave**, sales director, and **Maria** | Dave drops in between deals; Maria works the pickup list each week | **Back office**: a home for each. Dave's decisions and results, Maria's pickups |
| **Jordan**, Clutch operations | At a desk, all day | **Clutch ops**: dealers, with two clocks: minutes and days |
| **Sam**, Clutch inspector | On a dealer's lot, one hand free, the truck waiting | **Clutch inspector**: check by exception, on a phone |

The look and components follow Clutch's own product (colours, type, pill controls, black selected states, pale-yellow notes). They're collected in Storybook under [Foundations](https://redline-storybook.vercel.app/?path=/story/foundations-brand--colours). Each module below notes what it takes from Clutch's existing screens.

The three desk modules open the same way: the page title, a grey line under it with the dealer and next pickup, and tabs on the right when the module has more than one page. They share one content width, so switching people doesn't move the page. Anything that needs someone gets a yellow stripe down its left edge and a yellow label pill. The inspector keeps its own phone header.

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

## 2. Back office · Dave and Maria

_The dealership's page for cars sold to Clutch · Dave drops in between deals · Maria works the pickups each week_

**Dave's job:** make sure trade-ins don't cost him. Decide fast when something changes, and know Redline is worth it.

**Maria's job here:** get each sold car ready for its pickup, and close out the offers still open.

**What's hard today:** Dave approves every trade-in price. He's afraid of overpaying, of cars sitting unsold, and of slow, poor auction prices. He's measured on new-car sales and profit; trade-ins matter only because they close the deal. Maria chases keys, papers and cars a customer still drives, and a car that isn't ready wastes a truck.

**What matters to them:**
- Dave: "Does anything need me?" answered in seconds; a re-price with the old and new price, the reason and photos on one card; once a month, proof in money he can show the dealer principal.
- Maria: which cars go on the next truck, and exactly what's missing on the rest.

**The main call: one page, a home for each person.** Clutch's whiteboard named two needs: sales managers need a back office (where cars are, when Clutch picks up, issues), and sales directors need the value at a glance. The first sketch put both on one page, and Clutch's feedback was that the summary took too much room and the table should open on cars awaiting pickup. So the page has two tabs, and each person lands on their own:
- **Overview, Dave's home.** **Needs you** holds only his decisions: a re-price from the lot, and before each pickup which cars to keep for his own lot. Most days it says nothing needs him. Next to it, **Results**: cars sold, the total against the auction estimate, days to payment, how often inspection changed the price, by month. Stated as plain facts, not as a pitch: Dave should be able to trust the numbers, not feel sold to. A small Pickups card says whether the week is on track.
- **Pickups, Maria's home.** The cars by pickup, opening on the next one. Each car's readiness, the offers still open (refresh an expiring one, accept one an appraiser priced after the desk), and what was paid.

**Other calls:**
- **He doesn't approve Clutch's price; he decides where the car goes.** The offer is firm. What a director really decides is retail on his own lot or wholesale, so before each pickup he can **Keep** any car for his lot.
- **Ready is a checklist, not a toggle.** Mark ready opens three checks: on the lot, both keys, ownership papers. The car is ready only when all three are ticked, so a stray click can't put it on the truck, and a half-done check is saved and shown ("second key missing"). The same reasoning as the inspector's "never on one tap": a wrong Ready sends a truck for nothing.
- **Results doubles as the first-dealer scorecard,** the numbers Clutch and the dealer would agree to judge the pilot by.
- **Trucks and arrival times are Clutch's,** so they aren't here.

**From Clutch:** the director's role (decides retail or wholesale, signs the contract), the two needs and the dashboard feedback, all from the whiteboard session.

::screen[back-office/B2]

**Also tried:** [A · table first](https://redline-storybook.vercel.app/?path=/story/screens-back-office--a) (dense, closer to Maria's job than Dave's), [B · Needs you inbox](https://redline-storybook.vercel.app/?path=/story/screens-back-office--b) (the base for B2, both people on one page) and [C · pipeline board](https://redline-storybook.vercel.app/?path=/story/screens-back-office--c) (shows the flow, doesn't help him decide anything).

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
