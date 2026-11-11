import type { CarStatus } from '../../domain/statuses';

// Ops board fixtures. The board is shown on a pickup day: Thursday Nov 12, 11:40, while the
// Thursday runs are out. Sam is at Yorkdale Honda and has just re-priced the Civic.

export type DayId = 'tue-10' | 'thu-12' | 'tue-17' | 'thu-19';

export interface Day {
  id: DayId;
  label: string; // "Thu Nov 12"
  weekday: string; // "Thu"
  date: string; // "Nov 12"
  state: 'done' | 'today' | 'planned';
}

export const DAYS: Day[] = [
  { id: 'tue-10', label: 'Tue Nov 10', weekday: 'Tue', date: 'Nov 10', state: 'done' },
  { id: 'thu-12', label: 'Thu Nov 12', weekday: 'Thu', date: 'Nov 12', state: 'today' },
  { id: 'tue-17', label: 'Tue Nov 17', weekday: 'Tue', date: 'Nov 17', state: 'planned' },
  { id: 'thu-19', label: 'Thu Nov 19', weekday: 'Thu', date: 'Nov 19', state: 'planned' },
];

export const NOW_LABEL = 'Thu Nov 12, 11:40';

/** The demo moment as data, for clocks and date checks. */
export const TODAY_DATE = '2026-11-12';
export const NOW_TIME = '11:40';

/** Calendar date of each run day, to compare with lot and expiry dates. */
export const DAY_DATE: Record<DayId, string> = {
  'tue-10': '2026-11-10',
  'thu-12': '2026-11-12',
  'tue-17': '2026-11-17',
  'thu-19': '2026-11-19',
};

export interface Dealer {
  id: string;
  name: string;
  area: string;
  runDay: 'Tue' | 'Thu';
  contact: string;
  director: string;
}

export const DEALERS: Dealer[] = [
  { id: 'yorkdale', name: 'Yorkdale Honda', area: 'North York', runDay: 'Thu', contact: 'Maria, Sales Manager', director: 'Dave' },
  { id: 'vaughan', name: 'Vaughan Ford', area: 'Vaughan', runDay: 'Thu', contact: 'Kevin, Used Car Manager', director: 'Lisa' },
  { id: 'mississauga', name: 'Mississauga Mazda', area: 'Mississauga', runDay: 'Thu', contact: 'Arjun, Sales Manager', director: 'Tom' },
  { id: 'scarborough', name: 'Scarborough Hyundai', area: 'Scarborough', runDay: 'Thu', contact: 'Grace, Sales Manager', director: 'Wei' },
  { id: 'downtown', name: 'Downtown Toyota', area: 'Downtown Toronto', runDay: 'Tue', contact: 'Daniel, Pre-owned Manager', director: 'Nadia' },
  { id: 'oakville', name: 'Oakville Kia', area: 'Oakville', runDay: 'Tue', contact: 'Sofia, Sales Manager', director: 'Mark' },
];

/** Track record per dealer, last 90 days. */
export interface DealerHealth {
  /** Share of inspected cars the inspector re-priced. */
  repriceRate: number;
  /** Share of offers the dealer accepted. */
  acceptRate: number;
  /** Average days from pickup to payment. */
  daysToCash: number;
  /** Cars inspected in the period, so the rates have a base. */
  inspected: number;
}

export const DEALER_HEALTH: Record<string, DealerHealth> = {
  yorkdale: { repriceRate: 11, acceptRate: 74, daysToCash: 2.4, inspected: 38 },
  vaughan: { repriceRate: 9, acceptRate: 68, daysToCash: 3.1, inspected: 22 },
  mississauga: { repriceRate: 8, acceptRate: 81, daysToCash: 1.9, inspected: 31 },
  scarborough: { repriceRate: 31, acceptRate: 57, daysToCash: 4.6, inspected: 16 },
  downtown: { repriceRate: 12, acceptRate: 63, daysToCash: 5.8, inspected: 27 },
  oakville: { repriceRate: 10, acceptRate: 70, daysToCash: 2.8, inspected: 19 },
};

export interface Inspector {
  id: string;
  name: string;
}

export const INSPECTORS: Inspector[] = [
  { id: 'sam', name: 'Sam' },
  { id: 'priya', name: 'Priya' },
  { id: 'marcus', name: 'Marcus' },
];

/** A car carrier takes six cars. */
export const TRUCK_CAPACITY = 6;

export interface Route {
  id: string;
  day: DayId;
  name: string; // "North"
  truck: string; // "Truck 3"
  inspectorId: string | null;
  start: string; // "8:30"
  stops: string[]; // dealer ids, in driving order
}

export const ROUTES: Route[] = [
  { id: 'tue-10-west', day: 'tue-10', name: 'West', truck: 'Truck 5', inspectorId: 'priya', start: '8:30', stops: ['downtown', 'oakville'] },
  { id: 'thu-12-north', day: 'thu-12', name: 'North', truck: 'Truck 3', inspectorId: 'sam', start: '9:30', stops: ['yorkdale', 'vaughan'] },
  { id: 'thu-12-west', day: 'thu-12', name: 'West', truck: 'Truck 5', inspectorId: 'priya', start: '9:00', stops: ['mississauga'] },
  { id: 'thu-12-east', day: 'thu-12', name: 'East', truck: 'Truck 7', inspectorId: null, start: '13:00', stops: ['scarborough'] },
  { id: 'tue-17-west', day: 'tue-17', name: 'West', truck: 'Truck 5', inspectorId: 'priya', start: '8:30', stops: ['downtown', 'oakville'] },
  { id: 'thu-19-north', day: 'thu-19', name: 'North', truck: 'Truck 3', inspectorId: 'sam', start: '9:30', stops: ['yorkdale', 'vaughan'] },
  { id: 'thu-19-west', day: 'thu-19', name: 'West', truck: 'Truck 5', inspectorId: 'priya', start: '9:00', stops: ['mississauga'] },
  { id: 'thu-19-east', day: 'thu-19', name: 'East', truck: 'Truck 7', inspectorId: 'marcus', start: '13:00', stops: ['scarborough'] },
];

export interface OpsCar {
  id: string;
  dealerId: string;
  day: DayId;
  car: string;
  vin: string;
  km: number;
  offer: number;
  status: CarStatus;
  /** Re-price: the inspector's new price and reason. */
  newPrice?: number;
  reason?: string;
  waiting?: string; // "since 10:42"
  /** Live re-price: when the decision went to the director, and when the inspector plans to leave the lot. */
  waitingSince?: string; // "10:42"
  inspectorLeaves?: string; // "12:30"
  /** Not ready: the run it rolled from and why. */
  rolledFrom?: DayId;
  note?: string;
  /** Offer made but not accepted yet. */
  expires?: string;
  expiresOn?: string; // ISO date the offer ends
  /** Accepted, but the customer keeps driving it until their new car is delivered. ISO date it reaches the lot. */
  onLotFrom?: string;
}

export const CARS: OpsCar[] = [
  // Tue Nov 10: done
  { id: 'c01', dealerId: 'downtown', day: 'tue-10', car: '2018 Toyota Corolla LE', vin: '2T1BURHE6JC041187', km: 91200, offer: 12400, status: 'picked_up' },
  { id: 'c02', dealerId: 'downtown', day: 'tue-10', car: '2017 Toyota Camry SE', vin: '4T1BF1FK5HU329904', km: 118500, offer: 11900, status: 'picked_up' },
  { id: 'c03', dealerId: 'oakville', day: 'tue-10', car: '2019 Kia Sportage LX', vin: 'KNDPMCAC4K7563210', km: 76300, offer: 15200, status: 'picked_up' },
  { id: 'c04', dealerId: 'oakville', day: 'tue-10', car: '2016 Kia Soul EX', vin: 'KNDJP3A50G7298741', km: 132000, offer: 7450, status: 'declined', note: 'Re-price declined, stays with the dealer' },

  // Thu Nov 12: today
  {
    id: 'civic', dealerId: 'yorkdale', day: 'thu-12', car: '2019 Honda Civic EX', vin: '2HGFC2F69KH512345', km: 68400, offer: 17850,
    status: 'reprice_pending', newPrice: 16950, waiting: 'since 10:42', waitingSince: '10:42', inspectorLeaves: '12:30',
    reason: 'Declared no accidents, clean. Found a cracked windshield and a repainted rear bumper.',
  },
  { id: 'crv', dealerId: 'yorkdale', day: 'thu-12', car: '2021 Honda CR-V LX', vin: '2HKRW2H26MH604412', km: 48900, offer: 26700, status: 'confirmed' },
  { id: 'rav4', dealerId: 'yorkdale', day: 'thu-12', car: '2020 Toyota RAV4 LE', vin: '2T3B1RFV0LC067821', km: 54200, offer: 24300, status: 'awaiting_pickup' },
  { id: 'c10', dealerId: 'vaughan', day: 'thu-12', car: '2018 Ford F-150 XLT', vin: '1FTEW1EP4JFB27719', km: 112400, offer: 24900, status: 'awaiting_pickup' },
  { id: 'c11', dealerId: 'vaughan', day: 'thu-12', car: '2020 Ford Escape SE', vin: '1FMCU9G60LUA80233', km: 61800, offer: 17300, status: 'awaiting_pickup' },
  { id: 'c12', dealerId: 'mississauga', day: 'thu-12', car: '2019 Mazda3 GS', vin: '3MZBPBCM1KM105522', km: 70100, offer: 14800, status: 'picked_up' },
  { id: 'c13', dealerId: 'mississauga', day: 'thu-12', car: '2017 Mazda CX-3 GS', vin: 'JM1DKFC74H0154306', km: 98600, offer: 11200, status: 'picked_up' },
  { id: 'c14', dealerId: 'mississauga', day: 'thu-12', car: '2020 Mazda CX-5 GX', vin: 'JM3KFBBM2L0812247', km: 58300, offer: 21600, status: 'confirmed' },
  { id: 'c15', dealerId: 'scarborough', day: 'thu-12', car: '2018 Hyundai Elantra GL', vin: 'KMHD84LF5JU611874', km: 104700, offer: 9800, status: 'awaiting_pickup' },
  { id: 'c16', dealerId: 'scarborough', day: 'thu-12', car: '2019 Hyundai Tucson Preferred', vin: 'KM8J3CA46KU952318', km: 82000, offer: 16900, status: 'awaiting_pickup' },

  // Tue Nov 17
  { id: 'c20', dealerId: 'downtown', day: 'tue-17', car: '2021 Toyota Corolla LE', vin: '5YFEPMAE1MP230981', km: 39800, offer: 19600, status: 'offered', expires: 'today, 6:00 pm', expiresOn: '2026-11-12' },
  { id: 'c21', dealerId: 'downtown', day: 'tue-17', car: '2019 Toyota Highlander XLE', vin: '5TDJZRFH6KS571203', km: 88100, offer: 27400, status: 'awaiting_pickup', onLotFrom: '2026-11-19' },
  { id: 'c22', dealerId: 'oakville', day: 'tue-17', car: '2020 Kia Forte EX', vin: '3KPF54AD9LE184530', km: 52600, offer: 15700, status: 'awaiting_pickup' },

  // Thu Nov 19
  {
    id: 'cx5', dealerId: 'yorkdale', day: 'thu-19', car: '2017 Mazda CX-5 GS', vin: 'JM3KFBCL1H0198765', km: 102300, offer: 13900,
    status: 'not_ready', rolledFrom: 'thu-12', note: 'Keys missing at pickup',
  },
  { id: 'rogue', dealerId: 'yorkdale', day: 'thu-19', car: '2021 Nissan Rogue SV', vin: '5N1AT3BB2MC718406', km: 57300, offer: 23100, status: 'offered', expires: 'Fri Nov 13', expiresOn: '2026-11-13', onLotFrom: '2026-11-18' },
  { id: 'c31', dealerId: 'yorkdale', day: 'thu-19', car: '2018 Honda Accord Sport', vin: '1HGCV1F34JA090417', km: 95400, offer: 16200, status: 'awaiting_pickup', onLotFrom: '2026-11-17' },
  { id: 'c32', dealerId: 'mississauga', day: 'thu-19', car: '2018 Mazda CX-9 GS', vin: 'JM3TCBCY3J0213398', km: 109000, offer: 18500, status: 'awaiting_pickup', onLotFrom: '2026-11-16' },
  { id: 'c33', dealerId: 'scarborough', day: 'thu-19', car: '2017 Hyundai Santa Fe Sport', vin: '5XYZU3LB8HG447102', km: 121000, offer: 10900, status: 'awaiting_pickup' },
];
