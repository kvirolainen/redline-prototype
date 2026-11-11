import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, mutation } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { addDays, clock, nextPickup, shortDate } from '../src/domain/calendar';
import { repriceItem } from './schema';
import { carByKey, dealerByKey, getMeta, log, nowMin } from './world';

// Every change to a car goes through one of these functions: it updates the car and records who did what, in one
// transaction. Screens never write to the database directly.

const money = (n: number) => `$${n.toLocaleString('en-CA')}`;
const CLOSED: Doc<'cars'>['status'][] = ['paid', 'declined', 'expired', 'cancelled', 'kept'];
/** Seconds the demo appraiser takes to price a car sent from the desk. */
const APPRAISER_SECONDS = 45;

// ---- Trade-in (sales manager at the desk) ------------------------------------------------------------------------

export const submitTradeIn = mutation({
  args: {
    dealer: v.string(),
    who: v.string(),
    vin: v.string(),
    car: v.string(),
    trim: v.string(),
    colour: v.string(),
    km: v.number(),
    keys: v.number(),
    offer: v.number(),
    auction: v.number(),
    declared: v.record(v.string(), v.string()),
    /** Set when the car can't be priced instantly: why, for the appraiser. */
    review: v.optional(v.array(v.string())),
  },
  handler: async (ctx, a) => {
    const open = (await ctx.db
      .query('cars')
      .withIndex('by_vin', (q) => q.eq('vin', a.vin))
      .collect()).find((c) => !CLOSED.includes(c.status));
    if (open) throw new ConvexError('This car is already with Clutch. Find it in Back office.');

    const dealer = await dealerByKey(ctx, a.dealer);
    const meta = await getMeta(ctx);
    const key = `${a.vin}-${Date.now().toString(36)}`;
    const base = {
      key, dealer: a.dealer, vin: a.vin, car: a.car, trim: a.trim, colour: a.colour, km: a.km, keys: a.keys,
      auction: a.auction, declared: a.declared, inspected: false, repriced: false,
    };

    if (a.review) {
      const id = await ctx.db.insert('cars', { ...base, offer: 0, pendingOffer: a.offer, status: 'appraising', fromReview: true, reviewReasons: a.review });
      const car = (await ctx.db.get(id))!;
      await log(ctx, car, a.who, `Sent to Clutch: ${a.review.join(', ').toLowerCase()}. An appraiser prices it`, 'alert');
      await ctx.scheduler.runAfter(APPRAISER_SECONDS * 1000, internal.cars.appraise, { key, offer: a.offer });
      return key;
    }

    const runDate = nextPickup(meta.today, dealer.runDay);
    const id = await ctx.db.insert('cars', { ...base, offer: a.offer, status: 'awaiting_pickup', runDate, ready: false });
    const car = (await ctx.db.get(id))!;
    await log(ctx, car, a.who, `Offer made: ${money(a.offer)}, beats auction by ${money(a.offer - a.auction)}`, 'offer');
    await log(ctx, car, a.who, `Accepted. Joined the next pickup, ${shortDate(runDate)}`, 'accept');
    return key;
  },
});

/** The appraiser's firm offer on a car sent from the desk. In production: Clutch's own appraisal queue. */
export const appraise = internalMutation({
  args: { key: v.string(), offer: v.number() },
  handler: async (ctx, { key, offer }) => {
    const car = await ctx.db.query('cars').withIndex('by_key', (q) => q.eq('key', key)).first();
    if (!car || car.status !== 'appraising') return;
    const meta = await getMeta(ctx);
    const expiresOn = addDays(meta.today, 7);
    await ctx.db.patch(car._id, { status: 'offered', offer, expiresOn, pendingOffer: undefined });
    await log(ctx, car, 'Clutch', `Offer ready: ${money(offer)}, beats auction by ${money(offer - car.auction)}. Holds until ${shortDate(expiresOn)}`, 'offer');
  },
});

// ---- Back office (sales manager + director) ------------------------------------------------------------------------

export const acceptOffer = mutation({
  args: { key: v.string(), who: v.string() },
  handler: async (ctx, { key, who }) => {
    const car = await carByKey(ctx, key);
    if (car.status !== 'offered') return;
    const dealer = await dealerByKey(ctx, car.dealer);
    const runDate = nextPickup((await getMeta(ctx)).today, dealer.runDay);
    await ctx.db.patch(car._id, { status: 'awaiting_pickup', runDate, expiresOn: undefined, ready: false });
    await log(ctx, car, who, `Accepted. Joined the next pickup, ${shortDate(runDate)}`, 'accept');
  },
});

export const refreshOffer = mutation({
  args: { key: v.string(), who: v.string() },
  handler: async (ctx, { key, who }) => {
    const car = await carByKey(ctx, key);
    const expiresOn = addDays((await getMeta(ctx)).today, 7);
    await ctx.db.patch(car._id, { status: 'offered', expiresOn });
    await log(ctx, car, who, `Offer refreshed: ${money(car.offer)} holds until ${shortDate(expiresOn)}`, 'offer');
  },
});

export const keep = mutation({
  args: { key: v.string(), who: v.string() },
  handler: async (ctx, { key, who }) => {
    const car = await carByKey(ctx, key);
    await ctx.db.patch(car._id, { status: 'kept', note: 'Kept for your lot' });
    await log(ctx, car, who, `Kept for the lot. Off the ${car.runDate ? shortDate(car.runDate) : 'next'} pickup`, 'decision');
  },
});

export const undoKeep = mutation({
  args: { key: v.string(), who: v.string() },
  handler: async (ctx, { key, who }) => {
    const car = await carByKey(ctx, key);
    const notReady = car.ready === false && !!car.rolledFrom;
    await ctx.db.patch(car._id, { status: notReady ? 'not_ready' : 'awaiting_pickup', note: undefined });
    await log(ctx, car, who, `Back on the ${car.runDate ? shortDate(car.runDate) : 'next'} pickup`, 'decision');
  },
});

export const setReady = mutation({
  args: { key: v.string(), ready: v.boolean(), who: v.string() },
  handler: async (ctx, { key, ready, who }) => {
    const car = await carByKey(ctx, key);
    await ctx.db.patch(car._id, {
      ready,
      status: ready && car.status === 'not_ready' ? 'awaiting_pickup' : car.status,
      note: ready ? undefined : car.note,
    });
    await log(ctx, car, who, ready ? 'Marked ready: on the lot, both keys, ownership papers' : 'Marked not ready yet', 'pickup');
  },
});

export const acceptReprice = mutation({
  args: { key: v.string(), who: v.string() },
  handler: async (ctx, { key, who }) => {
    const car = await carByKey(ctx, key);
    if (car.status !== 'reprice_pending' || !car.reprice) return;
    await ctx.db.patch(car._id, { status: 'confirmed', offer: car.reprice.to, auction: car.reprice.auctionAsFound });
    await log(ctx, car, who, `Accepted the re-price: ${money(car.reprice.to)}`, 'decision');
    await log(ctx, car, 'Redline', `Confirmed. ${car.reprice.by.split(',')[0]} loads it on today’s truck; payment within 2 business days`, 'pickup');
  },
});

export const declineReprice = mutation({
  args: { key: v.string(), who: v.string() },
  handler: async (ctx, { key, who }) => {
    const car = await carByKey(ctx, key);
    if (car.status !== 'reprice_pending') return;
    const dealer = await dealerByKey(ctx, car.dealer);
    await ctx.db.patch(car._id, { status: 'declined', note: 'Re-price declined. Stays with the dealer' });
    await log(ctx, car, who, `Declined the re-price. Car stays with ${dealer.name}`, 'decision');
  },
});

// ---- Clutch inspector (on the lot, phone) ----------------------------------------------------------------------------

export const confirmMatch = mutation({
  args: { key: v.string(), who: v.string(), load: v.boolean() },
  handler: async (ctx, { key, who, load }) => {
    const car = await carByKey(ctx, key);
    // Only a car still waiting for the inspector, or already confirmed, can be confirmed or loaded: a stale screen
    // must not skip the director's decision on a re-price.
    if (car.status !== 'awaiting_pickup' && car.status !== 'confirmed') return;
    if (!car.inspected) {
      await ctx.db.patch(car._id, { inspected: true, status: 'confirmed' });
      await log(ctx, car, who, 'Inspected. Matches what was declared', 'inspect');
    }
    if (load) {
      await ctx.db.patch(car._id, { status: 'picked_up' });
      await log(ctx, car, who, `Picked up. Payment of ${money(car.offer)} goes out within 2 business days`, 'pickup');
    }
  },
});

export const sendReprice = mutation({
  args: { key: v.string(), who: v.string(), to: v.number(), items: v.array(repriceItem), photos: v.array(v.string()) },
  handler: async (ctx, { key, who, to, items, photos }) => {
    const car = await carByKey(ctx, key);
    const dealer = await dealerByKey(ctx, car.dealer);
    const min = Math.min(await nowMin(ctx), 23 * 60 + 59);
    const meta = await getMeta(ctx);
    const at = `${meta.today}T${clock(min).padStart(5, '0')}`;
    const drop = car.offer - to;
    await ctx.db.patch(car._id, {
      status: 'reprice_pending',
      inspected: true,
      repriced: true,
      reprice: {
        from: car.offer, to, by: `${who}, Clutch inspector`, at, items, photos,
        auctionAsFound: Math.max(car.auction - Math.round((drop * 0.9) / 50) * 50, 0),
        inspectorLeaves: Math.min(min + 50, 23 * 60 + 59),
        auctionFrom: car.auction,
      },
    });
    const n = items.length;
    await log(ctx, car, who, `${n === 1 ? 'One difference' : `${n} differences`} from what was declared. Re-priced to ${money(to)}`, 'reprice');
    await log(ctx, car, 'Redline', `Sent to ${dealer.director} for a decision. Car stays on the lot until then`, 'alert');
  },
});

export const markNotReady = mutation({
  args: { key: v.string(), who: v.string(), reason: v.string() },
  handler: async (ctx, { key, who, reason }) => {
    const car = await carByKey(ctx, key);
    const dealer = await dealerByKey(ctx, car.dealer);
    const today = (await getMeta(ctx)).today;
    const next = nextPickup(today, dealer.runDay);
    await ctx.db.patch(car._id, { status: 'not_ready', ready: false, rolledFrom: car.runDate ?? today, runDate: next, note: reason });
    await log(ctx, car, who, `Not ready: ${reason.toLowerCase()}. Moved to the next pickup, ${shortDate(next)}`, 'alert');
  },
});

/** Demo undo: put a car back as it was before the inspector touched it today, so a reviewer can try again. */
export const reopenInspection = mutation({
  args: { key: v.string(), who: v.string() },
  handler: async (ctx, { key, who }) => {
    const car = await carByKey(ctx, key);
    // An accepted re-price lowered the offer and the auction estimate: put both back.
    const accepted = car.reprice && (car.status === 'confirmed' || car.status === 'picked_up');
    const rolledToday = car.status === 'not_ready' && car.rolledFrom;
    await ctx.db.patch(car._id, {
      status: 'awaiting_pickup',
      inspected: false,
      repriced: false,
      reprice: undefined,
      offer: accepted ? car.reprice!.from : car.offer,
      auction: accepted && car.reprice!.auctionFrom !== undefined ? car.reprice!.auctionFrom : car.auction,
      runDate: rolledToday ? car.rolledFrom : car.runDate,
      rolledFrom: rolledToday ? undefined : car.rolledFrom,
      note: undefined,
    });
    await log(ctx, car, who, 'Reopened the inspection', 'inspect');
  },
});

// ---- Clutch ops ----------------------------------------------------------------------------------------------------

/** A reminder or call note from ops. Messages aren't sent in the prototype; the log line stands in. */
export const opsNote = mutation({
  args: { dealer: v.string(), car: v.optional(v.string()), text: v.string() },
  handler: async (ctx, { dealer, car, text }) => {
    const c = car ? await carByKey(ctx, car) : null;
    await log(ctx, c, 'Jordan', text, 'alert', dealer);
  },
});
