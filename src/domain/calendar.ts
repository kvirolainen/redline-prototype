// Demo calendar: dates are ISO days ("2026-11-12"), times are minutes after midnight, and an event's moment is
// "2026-11-12T10:42" in Toronto time. Shared by the screens and the backend, so both agree on what "today" is.

export type Weekday = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
const WEEKDAYS: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const asDate = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`);

export function addDays(iso: string, n: number) {
  const d = asDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const weekday = (iso: string): Weekday => WEEKDAYS[asDate(iso).getUTCDay()];

/** "Thu Nov 19" */
export const shortDate = (iso: string) =>
  asDate(iso).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).replace(',', '').replace('.', '');

/** "Thursday, Nov 19" */
export const longDate = (iso: string) => {
  const d = asDate(iso);
  const wd = d.toLocaleDateString('en-CA', { weekday: 'long', timeZone: 'UTC' });
  const md = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: 'UTC' }).replace('.', '');
  return `${wd}, ${md}`;
};

/** "today", "tomorrow", or "Thu Nov 19". */
export const dayLabel = (iso: string, today: string) => {
  if (iso === today) return 'today';
  if (iso === addDays(today, 1)) return 'tomorrow';
  return shortDate(iso);
};

/** First day on or after `iso` (or strictly after, with `after`) that falls on `wd`. */
export function nextWeekday(iso: string, wd: Weekday, after = false) {
  let d = after ? addDays(iso, 1) : iso;
  while (weekday(d) !== wd) d = addDays(d, 1);
  return d;
}

export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** 642 → "10:42" */
export const clock = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

/** 642 → "10:42 am" */
export const clockAmPm = (min: number) => {
  const h = Math.floor(min / 60);
  const m = String(min % 60).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
};

/** An event moment for display: "Today, 10:42" or "Mon Nov 9, 11:05". */
export function formatAt(at: string, today: string) {
  const [day, time] = at.split('T');
  const t = time ? clock(toMin(time)) : '';
  if (day === today) return t ? `Today, ${t}` : 'Today';
  return t ? `${shortDate(day)}, ${t}` : shortDate(day);
}

/** The demo clock: the moment the world was set to, moving forward in real time from then. */
export interface DemoMeta {
  today: string;
  startMin: number;
  setAt: number;
}

export const demoNowMin = (meta: DemoMeta, nowMs: number) => meta.startMin + Math.floor((nowMs - meta.setAt) / 60000);

export const demoMoment = (meta: DemoMeta, nowMs: number) => {
  const min = Math.min(demoNowMin(meta, nowMs), 23 * 60 + 59);
  return `${meta.today}T${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
};

// ---- pickup runs ---------------------------------------------------------------------------------------------

export interface RouteTemplate {
  weekday: Weekday;
  name: string;
  truck: string;
  inspector: string | null;
  start: string;
  /** Dealer keys, in driving order. */
  stops: string[];
}

/** Clutch's weekly runs. Every dealer has one pickup day a week. */
export const ROUTE_TEMPLATES: RouteTemplate[] = [
  { weekday: 'Tue', name: 'West', truck: 'Truck 5', inspector: 'priya', start: '8:30', stops: ['downtown', 'oakville'] },
  { weekday: 'Thu', name: 'North', truck: 'Truck 3', inspector: 'sam', start: '9:30', stops: ['yorkdale', 'vaughan'] },
  { weekday: 'Thu', name: 'West', truck: 'Truck 5', inspector: 'priya', start: '9:00', stops: ['mississauga'] },
  { weekday: 'Thu', name: 'East', truck: 'Truck 7', inspector: 'marcus', start: '13:00', stops: ['scarborough'] },
];

/** Runs still waiting for an inspector, by "date:name" (the demo's one dispatch gap). */
export const UNASSIGNED_RUNS = new Set(['2026-11-12:East']);

export const RUN_WEEKDAYS: Weekday[] = ['Tue', 'Thu'];

export interface RunDay {
  date: string;
  state: 'done' | 'today' | 'planned';
}

/** The ops window: the last run day before today, today if it's a run day, then the next run days, four in all. */
export function runWindow(today: string): RunDay[] {
  const isRun = (d: string) => RUN_WEEKDAYS.includes(weekday(d));
  let prev = addDays(today, -1);
  while (!isRun(prev)) prev = addDays(prev, -1);
  const days: RunDay[] = [{ date: prev, state: 'done' }];
  let d = today;
  while (days.length < 4) {
    if (isRun(d)) days.push({ date: d, state: d === today ? 'today' : 'planned' });
    d = addDays(d, 1);
  }
  return days;
}

/** A dealer's pickup a car joins when it's accepted today: the next run day after today. */
export const nextPickup = (today: string, runDay: Weekday) => nextWeekday(today, runDay, true);
