import { mutation, type MutationCtx } from './_generated/server';
import { addDays, nextWeekday, shortDate, weekday, type Weekday } from '../src/domain/calendar';
import { CARS, DEALERS, SEED_START_MIN, SEED_TODAY, seedEvents } from './seed';
import { getMeta } from './world';

// Demo controls. Not part of the product: they let every reviewer start from the same story, and follow a car
// across a week in a few minutes.

const money = (n: number) => `$${n.toLocaleString('en-CA')}`;

async function wipe(ctx: MutationCtx) {
  for (const table of ['meta', 'dealers', 'cars', 'events'] as const) {
    for (const row of await ctx.db.query(table).collect()) await ctx.db.delete(row._id);
  }
}

/** Back to Thursday Nov 12, 10:40: Sam on the lot at Yorkdale Honda, the Civic next. */
export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    await wipe(ctx);
    await ctx.db.insert('meta', { today: SEED_TODAY, startMin: SEED_START_MIN, setAt: Date.now() });
    for (const d of DEALERS) await ctx.db.insert('dealers', d);
    for (const c of CARS) await ctx.db.insert('cars', c);
    const name = (key: string) => DEALERS.find((d) => d.key === key)!.name;
    for (const e of seedEvents(name)) await ctx.db.insert('events', e);
  },
});

/** Payment lands two business days after pickup. */
const paidOnFor = (runDate: string) => {
  let d = runDate;
  let n = 0;
  while (n < 2) {
    d = addDays(d, 1);
    if (!['Sat', 'Sun'].includes(weekday(d))) n++;
  }
  return d;
};

/**
 * Jump to the next Yorkdale pickup day (a week on), 10:05, just before the inspector arrives. On the way, the week
 * plays out the usual way: picked-up cars get paid, open offers past their date expire, cars on runs nobody touched
 * in the demo are treated as collected and paid, and cars that rolled are back on the lot.
 */
export const skipToPickup = mutation({
  args: {},
  handler: async (ctx) => {
    const meta = await getMeta(ctx);
    const today = nextWeekday(meta.today, 'Thu', true);
    const dealers = await ctx.db.query('dealers').collect();
    const names = new Map(dealers.map((d) => [d.key, d.name]));
    const runDay = new Map<string, Weekday>(dealers.map((d) => [d.key, d.runDay]));
    const event = (car: { key: string; dealer: string }, at: string, who: string, text: string, kind: 'money' | 'alert' | 'offer' | 'pickup') =>
      ctx.db.insert('events', { car: car.key, dealer: car.dealer, at, who, text, kind });

    for (const c of await ctx.db.query('cars').collect()) {
      const passed = c.runDate !== undefined && c.runDate < today;
      if (passed && c.status === 'awaiting_pickup' && c.onLotFrom && c.onLotFrom > c.runDate!) {
        // It wasn't on the lot on its run day: it rolled to the first run after it arrived.
        const next = nextWeekday(c.onLotFrom, runDay.get(c.dealer)!);
        await ctx.db.patch(c._id, { runDate: next, rolledFrom: c.runDate });
        await event(c, `${c.runDate}T11:00`, 'Redline', `Not on the lot yet. Moved to the pickup on ${shortDate(next)}`, 'alert');
      } else if (passed && c.status === 'reprice_pending') {
        await ctx.db.patch(c._id, { status: 'declined', note: 'No decision before the truck left. Stays with the dealer' });
        await event(c, `${c.runDate}T17:00`, 'Redline', `No decision on the re-price before the truck left. Car stays with ${names.get(c.dealer)}`, 'alert');
      } else if (passed && ['awaiting_pickup', 'confirmed', 'picked_up'].includes(c.status)) {
        const paidOn = paidOnFor(c.runDate!);
        if (c.status === 'awaiting_pickup')
          await event(c, `${c.runDate}T11:00`, 'Clutch', 'Inspected. Matches what was declared. Picked up', 'pickup');
        await ctx.db.patch(c._id, { status: 'paid', inspected: true, paidOn, daysToCash: 4 });
        await event(c, `${paidOn}T09:00`, 'Clutch', `Paid ${money(c.offer)} to ${names.get(c.dealer)}`, 'money');
      } else if (c.status === 'offered' && c.expiresOn && c.expiresOn < today) {
        await ctx.db.patch(c._id, { status: 'expired' });
        await event(c, `${addDays(c.expiresOn, 1)}T00:00`, 'Redline', 'Offer expired. One click refreshes it', 'alert');
      } else if (c.status === 'appraising') {
        const expiresOn = addDays(meta.today, 7) > today ? addDays(meta.today, 7) : addDays(today, 7);
        const offer = c.pendingOffer ?? Math.round((c.auction * 1.1) / 50) * 50;
        await ctx.db.patch(c._id, { status: 'offered', offer, expiresOn, pendingOffer: undefined });
        await event(c, `${meta.today}T14:30`, 'Clutch', `Offer ready. Holds until ${shortDate(expiresOn)}`, 'offer');
      } else if (c.status === 'not_ready' && c.runDate === today) {
        await ctx.db.patch(c._id, { status: 'awaiting_pickup', ready: true, readyChecks: undefined, note: undefined, rolledFrom: undefined });
        await event(c, `${addDays(today, -1)}T16:00`, names.get(c.dealer) === 'Yorkdale Honda' ? 'Maria' : 'Sales', 'Marked ready: on the lot, both keys, ownership papers', 'pickup');
      }
      if (c.status === 'awaiting_pickup' && c.runDate === today && c.onLotFrom && c.onLotFrom <= today && !c.ready) {
        await ctx.db.patch(c._id, { ready: true, readyChecks: undefined });
      }
    }

    const row = await ctx.db.query('meta').first();
    const next = { today, startMin: 10 * 60 + 5, setAt: Date.now() };
    if (row) await ctx.db.patch(row._id, next);
    else await ctx.db.insert('meta', next);
  },
});
