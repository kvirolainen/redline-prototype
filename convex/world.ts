import { query, type MutationCtx, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { demoMoment, demoNowMin, type DemoMeta } from '../src/domain/calendar';
import { SEED_START_MIN, SEED_TODAY } from './seed';

/** Everything every screen reads, in one live query: the demo clock, dealers, cars and their events. */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const [meta, dealers, cars, events] = await Promise.all([
      ctx.db.query('meta').first(),
      ctx.db.query('dealers').collect(),
      ctx.db.query('cars').collect(),
      ctx.db.query('events').collect(),
    ]);
    return {
      meta: meta ? { today: meta.today, startMin: meta.startMin, setAt: meta.setAt } : null,
      dealers,
      cars,
      events: events.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a._creationTime - b._creationTime)),
    };
  },
});

export type World = {
  meta: DemoMeta | null;
  dealers: Doc<'dealers'>[];
  cars: Doc<'cars'>[];
  events: Doc<'events'>[];
};

// ---- helpers for mutations -------------------------------------------------------------------------------------

export async function getMeta(ctx: QueryCtx): Promise<DemoMeta> {
  const m = await ctx.db.query('meta').first();
  return m ? { today: m.today, startMin: m.startMin, setAt: m.setAt } : { today: SEED_TODAY, startMin: SEED_START_MIN, setAt: Date.now() };
}

export const nowMoment = async (ctx: QueryCtx) => demoMoment(await getMeta(ctx), Date.now());
export const nowMin = async (ctx: QueryCtx) => demoNowMin(await getMeta(ctx), Date.now());

export async function carByKey(ctx: QueryCtx, key: string) {
  const c = await ctx.db
    .query('cars')
    .withIndex('by_key', (q) => q.eq('key', key))
    .first();
  if (!c) throw new Error(`No car ${key}`);
  return c;
}

export async function dealerByKey(ctx: QueryCtx, key: string) {
  const d = await ctx.db
    .query('dealers')
    .withIndex('by_key', (q) => q.eq('key', key))
    .first();
  if (!d) throw new Error(`No dealer ${key}`);
  return d;
}

export async function log(
  ctx: MutationCtx,
  car: Doc<'cars'> | null,
  who: string,
  text: string,
  kind: Doc<'events'>['kind'],
  dealer?: string,
) {
  await ctx.db.insert('events', { car: car?.key, dealer: car?.dealer ?? dealer, at: await nowMoment(ctx), who, text, kind });
}
