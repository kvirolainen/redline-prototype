# The modules

One car, four people. Each module is built around one person's job. The design calls come from how often that person uses it, where they are when they do, and what goes wrong if they get it wrong.

| Who | Where, how often | So the module is |
|---|---|---|
| **Maria**, sales manager | At the sales desk, customer across from her, every week | **Trade-in**: one fixed screen she learns by heart |
| **Dave**, sales director, and **Maria** | Maria works the pickups each week; Dave drops in between deals | **Back office**: opens on where every car is; Dave's re-prices and results on a second tab |
| **Sam**, Clutch inspector | On a dealer's lot, one hand free, the truck waiting | **Clutch inspector**: check by exception, on a phone |
| **Jordan**, Clutch operations | At a desk, all day, across every dealer | **Clutch ops**: only what needs a person reaches Jordan |

The look and components follow Clutch's own product (colours, type, pill controls, black selected states, pale-yellow notes). They're collected in Storybook under [Foundations](https://redline-storybook.vercel.app/?path=/story/foundations-brand--colours).

The three desk modules open the same way: the page title, a grey line under it with the dealer and next pickup, and tabs on the right when the module has more than one page. They share one content width, so switching people doesn't move the page. Anything that needs someone gets a yellow stripe down its left edge and a yellow label pill. The inspector keeps its own phone header.

Inside the desk modules every white panel uses one 24px inner gutter, so text keeps the same left edge across panels, tabs and modules. A count of what needs someone is always the same small yellow badge, on a panel heading and on a tab. Car names and the grey line under them wrap rather than cut off, because the cut-off part was usually the part that mattered (the trim, or why a car went to auction). Prices sit in a fixed column so they line up down a list. The phone frame is never taller than the window, so the whole device stays in view on a laptop.

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

**The main call: one page that opens on where the cars are.** Clutch's whiteboard named two needs: sales managers need a back office (where cars are, when Clutch picks up, issues), and sales directors need the value at a glance. Clutch's feedback on the first sketch: the summary took too much room, and the table should open on cars awaiting pickup. So the page has two tabs:
- **Pickups, first and the default.** Two columns so the whole picture fits one screen: the pickups on the left (today's run on pickup day, then the next one with each car's readiness), the open offers and what's settled on the right (refresh an expiring offer, accept one an appraiser priced after the desk, what was paid). It answers "where are my cars?", the question both people arrive with.
- **Overview, Dave's.** **Needs you** across the top holds only re-prices from the lot; most days it says nothing needs him. Below it, **Results**: cars sold, the total against the auction estimate, days to payment, how often inspection changed the price, by month. Stated as plain facts, not as a pitch: Dave should be able to trust the numbers, not feel sold to. Next to it, this week's pickups at a glance and the latest re-prices.

**Other calls:**
- **Anything urgent is marked wherever it shows.** A re-price the truck is waiting on, an offer about to lapse, a car not ready a day or two before its check closes: a yellow edge on the row, its action in the row, and a count on the tab. Everything else is a plain to-do. If every open item were yellow, nothing would stand out.
- **He doesn't approve Clutch's price; he decides where the car goes, before the offer is accepted.** Dealers decide at appraisal which trade-ins they'll retail on their own lot, so Redline only sees the cars they've chosen to wholesale. Pulling a car back after accepting would make Clutch's runs unreliable, so the page has no "keep" step.
- **Ready is a checklist, not a toggle.** Mark ready opens three checks: on the lot, both keys, ownership papers. The car is ready only when all three are ticked, so a stray click can't put it on the truck, and a half-done check is saved and shown ("second key missing"). The same reasoning as the inspector's "never on one tap": a wrong Ready sends a truck for nothing.
- **Results doubles as the first-dealer scorecard,** the numbers Clutch and the dealer would agree to judge the pilot by.
- **The same look as Trade-in:** white panels with the heading inside, 16px text, outline pills for row actions; black only for the main decision on a card. Trucks and arrival times are Clutch's, so they aren't here.

::screen[back-office/B2]

**Also tried:** [A · table first](https://redline-storybook.vercel.app/?path=/story/screens-back-office--a) (dense, closer to Maria's job than Dave's), [B · Needs you inbox](https://redline-storybook.vercel.app/?path=/story/screens-back-office--b) (the base for B2, both people on one page) and [C · pipeline board](https://redline-storybook.vercel.app/?path=/story/screens-back-office--c) (shows the flow, doesn't help him decide anything).

## 3. Clutch inspector · Sam

_Phone, one hand, outdoors · about 15 minutes a car · the truck leaves at a set time_

**His job:** confirm each car is what the dealer declared, so Clutch doesn't overpay, without holding up the run.

**What's new with dealers:** several cars per stop, the dealer's declared answers to check against, a director deciding the re-price while Sam is still on the lot, and "not ready" moving a car to next week's run.

**The main call: check by exception, but never on one tap.** Each area of the car closes with one "All match", and only a difference opens for detail, its price effect and a photo. A clean car takes a few taps. To stop "All match" from becoming a rubber stamp, the VIN and odometer photos come first.

**Other calls:**
- **The wait on Dave.** Every first version ended at "Send re-price". The real pain comes after it: Sam moves on to the next car, the answer comes back to the phone, and he loads the car or leaves it. No answer by the time the truck leaves → leave it, the re-price is withdrawn, and the car joins next week's run. This is what ties Clutch ops' clock and Dave's re-price card together.
- **A phone, not a tablet.** Walking around a car, looking under the hood and taking photos are one-hand tasks. It's designed for 390px wide and checked so it doesn't break at tablet width.

::screen[inspector/C2]

**Also tried:** [A · run, car, checklist](https://redline-storybook.vercel.app/?path=/story/screens-clutch-inspector--a) (gave the list of stops), [B · one car at a time](https://redline-storybook.vercel.app/?path=/story/screens-clutch-inspector--b) (gave the big "Yorkdale Honda declared" card inside an opened area) and [C · exceptions only](https://redline-storybook.vercel.app/?path=/story/screens-clutch-inspector--c). C2 is C plus parts of A and B, plus the wait on Dave.

## 4. Clutch ops · Jordan

_Clutch coordinator for the dealer channel · desktop · all day_

This one sits outside the car's path. No step of the demo needs it; it shows how Clutch would run the channel once there are many dealers.

**Jordan's job:** keep each dealer happy to keep sending cars. That rests on two promises: "your car joins the next pickup" and "you get paid". A good week: every accepted car is picked up on its run, at the agreed price, with no second trip, and no dealer has a reason to call a competitor.

**What's new when the seller is a dealer** (Clutch already runs consumer pickups):
- **A second decider in the middle of the inspection.** At a consumer pickup the seller stands right there. At a dealer, Dave may be in a meeting while the truck waits.
- **Accepted doesn't mean on the lot.** The customer usually drives the trade-in until the new car is delivered. Offers hold 7 days and runs are weekly, so an offer can lapse before the car even arrives.
- **Full runs.** A truck goes to one dealer for many cars, so a car that isn't ready costs real money.
- **A relationship, not a transaction.** A dealer sends cars every week. A rising re-price rate means a sales manager is over-declaring; slow payments mean a dealer starts shopping around. Ops sees both first.

**The main call: the page only shows what needs a person.** Routine follow-ups with the dealer happen outside it, and a car that won't reach the lot in time goes on the next run by itself. **Needs you** holds alerts, not tasks: the call itself happens on the phone, so a card has no action buttons, only **Dismiss** (no confirmation; the card stays as one line with **Undo**).
- **A director who hasn't answered.** The re-price has waited 20 minutes, or the inspector is about to leave: call Dave.
- **A dealer's track record.** Re-prices well above the others, low acceptance, slow payments. One card per dealer.

**Other calls:**
- **Assume the dispatch tool exists; show only the dealer layer.** No trucks, ETAs or inspector rosters. A run without an inspector shows as "flagged to dispatch" and goes no further.
- **Read-only below Needs you.** **Today's pickups** shows where each stop stands (picked up, to inspect, waiting on a re-price). **All dealers** has one row per dealer: next pickup, cars on the way (including "not on the lot yet" and "not confirmed by the dealer"), re-price rate, acceptance and days to cash, and one line on what the system already handled; open the row for its cars.
- **Planning** is a second tab: dealers × pickup days, with no dispatch actions.

::screen[ops-board/D]

**Also tried:** [A · week grid](https://redline-storybook.vercel.app/?path=/story/screens-clutch-ops--week-grid) (the right unit, dealers, but half of it was dispatch; it became the Planning tab), [B · today's runs](https://redline-storybook.vercel.app/?path=/story/screens-clutch-ops--todays-runs) (essentially the dispatch tool Clutch already has) and [C · exceptions first](https://redline-storybook.vercel.app/?path=/story/screens-clutch-ops--exceptions-first) (the right instinct, but sorted by type, not urgency). D was built from A and C after that first round, then reworked so only what needs a person reaches Jordan.
