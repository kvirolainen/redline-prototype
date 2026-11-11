import type { Doc } from './_generated/dataModel';
import { addDays, clock, shortDate, toMin } from '../src/domain/calendar';

// The demo world at the start: Thursday Nov 12 2026, 10:40. Sam is on the lot at Yorkdale Honda; the RAV4 and
// CR-V are already on his truck, the Civic and the CX-5 are next. Every reviewer starts from here after a reset.

export const SEED_TODAY = '2026-11-12';
export const SEED_START_MIN = 10 * 60 + 40;

type DealerSeed = Omit<Doc<'dealers'>, '_id' | '_creationTime'>;
type CarSeed = Omit<Doc<'cars'>, '_id' | '_creationTime'>;
type EventSeed = Omit<Doc<'events'>, '_id' | '_creationTime'>;

export const DEALERS: DealerSeed[] = [
  { key: 'yorkdale', name: 'Yorkdale Honda', area: 'North York', address: '3401 Dufferin St, Toronto', runDay: 'Thu', window: '10:15 – 11:45', contact: 'Maria, Sales Manager', director: 'Dave', repriceRate: 11, acceptRate: 74, daysToCash: 2.4, inspected: 38 },
  { key: 'vaughan', name: 'Vaughan Ford', area: 'Vaughan', address: '8111 Jane St, Vaughan', runDay: 'Thu', window: '12:15 – 1:00', contact: 'Kevin, Used Car Manager', director: 'Lisa', repriceRate: 9, acceptRate: 68, daysToCash: 3.1, inspected: 22 },
  { key: 'mississauga', name: 'Mississauga Mazda', area: 'Mississauga', address: '2400 Dundas St W, Mississauga', runDay: 'Thu', window: '9:30 – 10:30', contact: 'Arjun, Sales Manager', director: 'Tom', repriceRate: 8, acceptRate: 81, daysToCash: 1.9, inspected: 31 },
  { key: 'scarborough', name: 'Scarborough Hyundai', area: 'Scarborough', address: '1588 Kingston Rd, Toronto', runDay: 'Thu', window: '1:30 – 2:30', contact: 'Grace, Sales Manager', director: 'Wei', repriceRate: 31, acceptRate: 57, daysToCash: 4.6, inspected: 16 },
  { key: 'downtown', name: 'Downtown Toyota', area: 'Downtown Toronto', address: '677 Queen St E, Toronto', runDay: 'Tue', window: '9:00 – 10:00', contact: 'Daniel, Pre-owned Manager', director: 'Nadia', repriceRate: 12, acceptRate: 63, daysToCash: 5.8, inspected: 27 },
  { key: 'oakville', name: 'Oakville Kia', area: 'Oakville', address: '2501 Speers Rd, Oakville', runDay: 'Tue', window: '10:45 – 11:30', contact: 'Sofia, Sales Manager', director: 'Mark', repriceRate: 10, acceptRate: 70, daysToCash: 2.8, inspected: 19 },
];

const TODAY = SEED_TODAY;
const NEXT = addDays(TODAY, 7); // Thu Nov 19
const TUE10 = addDays(TODAY, -2);
const TUE17 = addDays(TODAY, 5);
const auctionFor = (offer: number) => Math.round((offer * 0.925) / 50) * 50;

type Partial = Pick<CarSeed, 'key' | 'dealer' | 'vin' | 'car' | 'km' | 'offer' | 'status'> & Omit<globalThis.Partial<CarSeed>, 'key'>;

function car(c: Partial): CarSeed {
  return {
    trim: '',
    colour: '',
    keys: 2,
    auction: auctionFor(c.offer),
    inspected: ['confirmed', 'picked_up', 'paid', 'reprice_pending', 'declined'].includes(c.status),
    repriced: false,
    ...c,
  };
}

export const CARS: CarSeed[] = [
  // ---- Yorkdale Honda: today's pickup (Sam is on the lot) ---------------------------------------------------
  car({ key: 'civic', dealer: 'yorkdale', vin: '2HGFC2F69KH512345', car: '2019 Honda Civic EX', trim: 'Sedan · CVT', colour: 'Lunar Silver', km: 68400, offer: 17850, auction: 16400, status: 'awaiting_pickup', runDate: TODAY, ready: true, spot: 'Back row, spot 14' }),
  car({ key: 'cx5', dealer: 'yorkdale', vin: 'JM3KFBCL1H0198765', car: '2017 Mazda CX-5 GS', trim: 'AWD · Automatic', colour: 'Soul Red', km: 102300, offer: 13900, auction: 12700, status: 'awaiting_pickup', runDate: TODAY, ready: false, spot: 'Service bay 2' }),
  car({ key: 'rav4', dealer: 'yorkdale', vin: '2T3B1RFV0LC067821', car: '2020 Toyota RAV4 LE', trim: 'AWD · Automatic', colour: 'Magnetic Grey', km: 54200, offer: 24300, auction: 22900, status: 'picked_up', runDate: TODAY, ready: true, spot: 'Back row, spot 15' }),
  car({ key: 'crv', dealer: 'yorkdale', vin: '2HKRW2H26MH604412', car: '2021 Honda CR-V LX', trim: 'AWD · CVT', colour: 'Modern Steel', km: 48900, offer: 26700, auction: 25000, status: 'picked_up', runDate: TODAY, ready: true, spot: 'Back row, spot 16' }),
  // Yorkdale: next pickup, Thu Nov 19
  car({ key: 'accord', dealer: 'yorkdale', vin: '1HGCV1F34JA090417', car: '2018 Honda Accord Sport', trim: 'Sedan · CVT', colour: 'Crystal Black', km: 95400, offer: 16200, status: 'awaiting_pickup', runDate: NEXT, onLotFrom: addDays(TODAY, 5), ready: false }),
  car({ key: 'elantra21', dealer: 'yorkdale', vin: 'KMHLS4AG5MU125530', car: '2021 Hyundai Elantra Preferred', trim: 'Sedan · Automatic', colour: 'Intense Blue', km: 41800, offer: 18200, auction: 16950, status: 'awaiting_pickup', runDate: NEXT, ready: true }),
  car({ key: 'equinox', dealer: 'yorkdale', vin: '2GNAXSEV4J6301187', car: '2018 Chevrolet Equinox LT', trim: 'AWD · Automatic', colour: 'Silver Ice', km: 93200, offer: 14100, auction: 13050, status: 'awaiting_pickup', runDate: NEXT, ready: false }),
  // Yorkdale: open offers
  car({ key: 'rogue', dealer: 'yorkdale', vin: '5N1AT3BB2MC718406', car: '2021 Nissan Rogue SV', trim: 'AWD · CVT', colour: 'Gun Metallic', km: 57300, offer: 23100, auction: 21500, status: 'offered', expiresOn: addDays(TODAY, 1), onLotFrom: addDays(TODAY, 6) }),
  car({ key: 'camry12', dealer: 'yorkdale', vin: '4T1BF1FK5CU153367', car: '2012 Toyota Camry LE', trim: 'Sedan · Automatic', colour: 'Classic Silver', km: 214000, offer: 5600, auction: 4900, status: 'offered', expiresOn: addDays(TODAY, 6), fromReview: true, reviewReasons: ['Over 200,000 km'] }),
  car({ key: 'sportage', dealer: 'yorkdale', vin: 'KNDPM3AC7K7562219', car: '2019 Kia Sportage LX', trim: 'AWD · Automatic', colour: 'Clear White', km: 77000, offer: 15700, auction: 14650, status: 'offered', expiresOn: addDays(TODAY, 5) }),
  // Yorkdale: history
  car({ key: 'escape', dealer: 'yorkdale', vin: '1FMCU9GD4JUA44312', car: '2018 Ford Escape SE', km: 88900, offer: 12600, auction: 11500, status: 'paid', runDate: addDays(TODAY, -7), paidOn: addDays(TODAY, -3), daysToCash: 6 }),
  car({ key: 'jetta', dealer: 'yorkdale', vin: '3VWD17AJ5FM233901', car: '2015 Volkswagen Jetta Comfortline', km: 138000, offer: 7900, auction: 7000, status: 'paid', runDate: addDays(TODAY, -14), paidOn: addDays(TODAY, -13), daysToCash: 5 }),
  car({ key: 'tucson19', dealer: 'yorkdale', vin: 'KM8J33A49KU914275', car: '2019 Hyundai Tucson Preferred', km: 72000, offer: 17300, auction: 16050, status: 'paid', runDate: addDays(TODAY, -21), paidOn: addDays(TODAY, -20), daysToCash: 7 }),
  car({ key: 'cherokee', dealer: 'yorkdale', vin: '1C4PJMCS3HW603318', car: '2017 Jeep Cherokee North', km: 110400, offer: 11800, auction: 10900, status: 'declined', runDate: addDays(TODAY, -21), repriced: true, note: 'Re-price declined. Went to auction' }),

  // ---- Vaughan Ford: today, after Yorkdale ---------------------------------------------------------------------
  car({ key: 'f150', dealer: 'vaughan', vin: '1FTEW1EP4JFB27719', car: '2018 Ford F-150 XLT', trim: 'SuperCrew 4x4', colour: 'Oxford White', km: 112400, offer: 24900, status: 'awaiting_pickup', runDate: TODAY, ready: true, spot: 'Truck row' }),
  car({ key: 'escape20', dealer: 'vaughan', vin: '1FMCU9G60LUA80233', car: '2020 Ford Escape SE', trim: 'AWD · Automatic', colour: 'Rapid Red', km: 61800, offer: 17300, status: 'awaiting_pickup', runDate: TODAY, ready: true, spot: 'Front lot' }),
  // ---- Mississauga Mazda: today, Priya's run, done -------------------------------------------------------------
  car({ key: 'mazda3', dealer: 'mississauga', vin: '3MZBPBCM1KM105522', car: '2019 Mazda3 GS', km: 70100, offer: 14800, status: 'picked_up', runDate: TODAY }),
  car({ key: 'cx3', dealer: 'mississauga', vin: 'JM1DKFC74H0154306', car: '2017 Mazda CX-3 GS', km: 98600, offer: 11200, status: 'picked_up', runDate: TODAY }),
  car({ key: 'cx5gx', dealer: 'mississauga', vin: 'JM3KFBBM2L0812247', car: '2020 Mazda CX-5 GX', km: 58300, offer: 21600, status: 'confirmed', runDate: TODAY }),
  car({ key: 'cx9', dealer: 'mississauga', vin: 'JM3TCBCY3J0213398', car: '2018 Mazda CX-9 GS', km: 109000, offer: 18500, status: 'awaiting_pickup', runDate: NEXT, onLotFrom: addDays(TODAY, 4) }),
  // ---- Scarborough Hyundai: today, no inspector yet --------------------------------------------------------------
  car({ key: 'elantra18', dealer: 'scarborough', vin: 'KMHD84LF5JU611874', car: '2018 Hyundai Elantra GL', km: 104700, offer: 9800, status: 'awaiting_pickup', runDate: TODAY, ready: true }),
  car({ key: 'tucsonS', dealer: 'scarborough', vin: 'KM8J3CA46KU952318', car: '2019 Hyundai Tucson Preferred', km: 82000, offer: 16900, status: 'awaiting_pickup', runDate: TODAY, ready: true }),
  car({ key: 'santafe', dealer: 'scarborough', vin: '5XYZU3LB8HG447102', car: '2017 Hyundai Santa Fe Sport', km: 121000, offer: 10900, status: 'awaiting_pickup', runDate: NEXT }),
  // ---- Downtown Toyota + Oakville Kia: Tuesday runs ---------------------------------------------------------------
  car({ key: 'corolla18', dealer: 'downtown', vin: '2T1BURHE6JC041187', car: '2018 Toyota Corolla LE', km: 91200, offer: 12400, status: 'picked_up', runDate: TUE10 }),
  car({ key: 'camry17', dealer: 'downtown', vin: '4T1BF1FK5HU329904', car: '2017 Toyota Camry SE', km: 118500, offer: 11900, status: 'picked_up', runDate: TUE10 }),
  car({ key: 'corolla21', dealer: 'downtown', vin: '5YFEPMAE1MP230981', car: '2021 Toyota Corolla LE', km: 39800, offer: 19600, status: 'offered', expiresOn: TODAY }),
  car({ key: 'highlander', dealer: 'downtown', vin: '5TDJZRFH6KS571203', car: '2019 Toyota Highlander XLE', km: 88100, offer: 27400, status: 'awaiting_pickup', runDate: TUE17, onLotFrom: NEXT }),
  car({ key: 'sportageO', dealer: 'oakville', vin: 'KNDPMCAC4K7563210', car: '2019 Kia Sportage LX', km: 76300, offer: 15200, status: 'picked_up', runDate: TUE10 }),
  car({ key: 'soul', dealer: 'oakville', vin: 'KNDJP3A50G7298741', car: '2016 Kia Soul EX', km: 132000, offer: 7450, status: 'declined', runDate: TUE10, repriced: true, note: 'Re-price declined, stays with the dealer' }),
  car({ key: 'forte', dealer: 'oakville', vin: '3KPF54AD9LE184530', car: '2020 Kia Forte EX', km: 52600, offer: 15700, status: 'awaiting_pickup', runDate: TUE17 }),
];

const money = (n: number) => `$${n.toLocaleString('en-CA')}`;
const beats = (c: CarSeed) => `Offer made: ${money(c.offer)}, beats auction by ${money(c.offer - c.auction)}`;
const at = (day: string, t: string) => `${day}T${t.padStart(5, '0')}`;

/** The story so far for every seeded car: offer, accept, and whatever happened on its pickup day. */
export function seedEvents(dealerName: (key: string) => string): EventSeed[] {
  const out: EventSeed[] = [];
  const add = (c: CarSeed, e: Omit<EventSeed, 'car' | 'dealer'>) => out.push({ car: c.key, dealer: c.dealer, ...e });
  const who = (c: CarSeed) => (c.dealer === 'yorkdale' ? (c.key === 'equinox' ? 'Dave' : 'Maria') : c.dealer === 'vaughan' ? 'Kevin' : 'Sales');

  for (const c of CARS) {
    // Offers on accepted cars were made 2-5 days before their pickup; open offers 7 days before they expire.
    const offerDay = c.runDate ? addDays(c.runDate, -3 - (c.km % 3)) : c.expiresOn ? addDays(c.expiresOn, -7) : addDays(TODAY, -2);
    const t = clock((9 + (c.km % 7)) * 60 + 10 + (c.offer % 45));
    if (c.fromReview) {
      add(c, { at: at(offerDay, '10:30'), who: who(c), text: 'Sent to Clutch: over 200,000 km, priced by an appraiser', kind: 'alert' });
      add(c, { at: at(offerDay, '13:40'), who: 'Clutch', text: `Offer ready: ${money(c.offer)}, beats auction by ${money(c.offer - c.auction)}. Holds 7 days`, kind: 'offer' });
      continue;
    }
    add(c, { at: at(offerDay, t), who: who(c), text: beats(c), kind: 'offer' });
    if (c.status === 'offered') continue;
    if (c.runDate) add(c, { at: at(offerDay, clock(toMin(t) + 4)), who: who(c), text: `Accepted. Joined the pickup on ${shortDate(c.runDate)}`, kind: 'accept' });
    if (!c.runDate || c.runDate > TODAY) continue;
    const day = c.runDate;
    if (c.status === 'picked_up' || c.status === 'confirmed' || c.status === 'paid') {
      const inspector = ['downtown', 'oakville', 'mississauga'].includes(c.dealer) ? 'Priya' : 'Sam';
      const time = c.key === 'rav4' ? '10:18' : c.key === 'crv' ? '10:31' : '10:05';
      add(c, { at: at(day, time), who: inspector, text: 'Inspected. Matches what was declared', kind: 'inspect' });
      if (c.status !== 'confirmed') add(c, { at: at(day, clock(toMin(time) + 8)), who: inspector, text: 'Picked up', kind: 'pickup' });
      if (c.status === 'paid' && c.paidOn) add(c, { at: at(c.paidOn, '9:00'), who: 'Clutch', text: `Paid ${money(c.offer)} to ${dealerName(c.dealer)}`, kind: 'money' });
    }
    if (c.status === 'declined') {
      const to = Math.round((c.offer * 0.87) / 50) * 50;
      add(c, { at: at(day, '10:40'), who: c.dealer === 'yorkdale' ? 'Sam' : 'Priya', text: `Found a difference from what was declared. Re-priced to ${money(to)}`, kind: 'reprice' });
      add(c, { at: at(day, '13:10'), who: c.dealer === 'yorkdale' ? 'Dave' : 'Director', text: `Declined the re-price. Car stays with ${dealerName(c.dealer)}`, kind: 'decision' });
    }
  }
  return out;
}
