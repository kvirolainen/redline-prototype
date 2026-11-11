import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const carStatus = v.union(
  v.literal('appraising'),
  v.literal('offered'),
  v.literal('awaiting_pickup'),
  v.literal('not_ready'),
  v.literal('reprice_pending'),
  v.literal('confirmed'),
  v.literal('picked_up'),
  v.literal('paid'),
  v.literal('declined'),
  v.literal('expired'),
  v.literal('cancelled'),
  v.literal('kept'),
);

export const eventKind = v.union(
  v.literal('offer'),
  v.literal('accept'),
  v.literal('pickup'),
  v.literal('inspect'),
  v.literal('reprice'),
  v.literal('decision'),
  v.literal('money'),
  v.literal('alert'),
);

export const repriceItem = v.object({ label: v.string(), declared: v.string(), found: v.string(), amount: v.number() });

export const reprice = v.object({
  from: v.number(),
  to: v.number(),
  by: v.string(),
  /** Event moment, "2026-11-12T10:42". */
  at: v.string(),
  items: v.array(repriceItem),
  photos: v.array(v.string()),
  /** Auction estimate for the car as found, not as declared. */
  auctionAsFound: v.number(),
  /** When the inspector plans to leave the lot, minutes after midnight. */
  inspectorLeaves: v.number(),
  /** Auction estimate before the re-price, so an undo can restore it. */
  auctionFrom: v.optional(v.number()),
});

export default defineSchema({
  /** One row: the demo clock. */
  meta: defineTable({ today: v.string(), startMin: v.number(), setAt: v.number() }),

  dealers: defineTable({
    key: v.string(),
    name: v.string(),
    area: v.string(),
    address: v.string(),
    runDay: v.union(v.literal('Tue'), v.literal('Thu')),
    /** Pickup window on run day, e.g. "10:15 – 11:45". */
    window: v.string(),
    contact: v.string(),
    director: v.string(),
    // Track record, last 90 days (demo history).
    repriceRate: v.number(),
    acceptRate: v.number(),
    daysToCash: v.number(),
    inspected: v.number(),
  }).index('by_key', ['key']),

  cars: defineTable({
    key: v.string(),
    dealer: v.string(),
    vin: v.string(),
    car: v.string(),
    trim: v.string(),
    colour: v.string(),
    km: v.number(),
    keys: v.number(),
    /** Firm offer; 0 while an appraiser is still pricing it. */
    offer: v.number(),
    /** Estimated auction net for the same car. */
    auction: v.number(),
    status: carStatus,
    /** Pickup day the car is on. */
    runDate: v.optional(v.string()),
    /** Last day an open offer holds. */
    expiresOn: v.optional(v.string()),
    /** Accepted, but the customer drives it until their new car arrives: the day it reaches the lot. */
    onLotFrom: v.optional(v.string()),
    /** Sales manager's pickup check: on the lot, both keys, ownership papers. */
    ready: v.optional(v.boolean()),
    /** Priced by a Clutch appraiser after the desk, not instantly. */
    fromReview: v.optional(v.boolean()),
    reviewReasons: v.optional(v.array(v.string())),
    /** The desk's quote while an appraiser prices the car; becomes the offer. */
    pendingOffer: v.optional(v.number()),
    inspected: v.boolean(),
    repriced: v.boolean(),
    rolledFrom: v.optional(v.string()),
    note: v.optional(v.string()),
    /** Where it's parked on the lot. */
    spot: v.optional(v.string()),
    /** What the dealer declared at the desk, by inspection check id. Missing = the clean default. */
    declared: v.optional(v.record(v.string(), v.string())),
    reprice: v.optional(reprice),
    paidOn: v.optional(v.string()),
    daysToCash: v.optional(v.number()),
  })
    .index('by_key', ['key'])
    .index('by_vin', ['vin']),

  events: defineTable({
    car: v.optional(v.string()),
    dealer: v.optional(v.string()),
    at: v.string(),
    who: v.string(),
    text: v.string(),
    kind: eventKind,
  }).index('by_car', ['car']),
});
