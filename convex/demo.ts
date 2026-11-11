import { mutation, type MutationCtx } from './_generated/server';
import { CARS, DEALERS, SEED_START_MIN, SEED_TODAY, seedEvents } from './seed';

// Demo control. Not part of the product: it lets every reviewer start from the same story.

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
