import type { CarStatus } from '../../domain/statuses';

// Yorkdale Honda's cars sold to Clutch, as the back office sees them on pickup day,
// Thursday Nov 12, early afternoon. Sam has inspected this morning's run.

export const DEALER = 'Yorkdale Honda';
export const TODAY = 'Thu Nov 12';
export const NEXT_PICKUP = 'Thu Nov 19';

export type EventKind = 'offer' | 'accept' | 'pickup' | 'inspect' | 'reprice' | 'decision' | 'money' | 'alert';

export interface CarEvent {
  at: string;
  who: string;
  text: string;
  kind: EventKind;
}

export interface RepriceItem {
  label: string;
  declared: string;
  found: string;
  amount: number; // negative
}

export interface Reprice {
  from: number;
  to: number;
  by: string;
  at: string;
  waiting: string;
  items: RepriceItem[];
  photos: string[];
  /** Auction estimate for the car as found, not as declared. */
  auctionAsFound: number;
}

export interface BackOfficeCar {
  vin: string;
  car: string;
  km: number;
  offer: number;
  auction: number;
  status: CarStatus;
  pickup: string;
  /** Set while an offer is open: when it stops holding. */
  expires?: string;
  expiresSoon?: boolean;
  inspected: boolean;
  repriced: boolean;
  daysToCash?: number;
  note?: string;
  reprice?: Reprice;
  events: CarEvent[];
}

/** Offers Yorkdale Honda looked at and didn't take, last 90 days (feeds the acceptance rate). */
export const OFFERS_NOT_TAKEN = 3;
/** Typical days from offer to cash when a car goes to auction instead. */
export const AUCTION_DAYS_TO_CASH = 21;

export const CIVIC_VIN = '2HGFC2F69KH512345';
export const ROGUE_VIN = '5N1AT2MV7GC812044';

export const BACK_OFFICE_CARS: BackOfficeCar[] = [
  {
    vin: CIVIC_VIN,
    car: '2019 Honda Civic EX',
    km: 68400,
    offer: 17850,
    auction: 16400,
    status: 'reprice_pending',
    pickup: TODAY,
    inspected: true,
    repriced: true,
    reprice: {
      from: 17850,
      to: 16950,
      by: 'Sam, Clutch inspector',
      at: 'Today, 10:42',
      waiting: 'Waiting 2 h',
      auctionAsFound: 15600,
      items: [
        { label: 'Windshield', declared: 'No damage', found: 'Crack, about 20 cm, driver side', amount: -550 },
        { label: 'Accident history', declared: 'No accidents, clean', found: 'Rear bumper repainted, overspray on trim', amount: -350 },
      ],
      photos: ['Windshield, driver side', 'Rear bumper, left corner'],
    },
    events: [
      { at: 'Mon Nov 9, 11:05', who: 'Maria', text: 'Offer made: $17,850, beats auction by $1,450', kind: 'offer' },
      { at: 'Mon Nov 9, 11:07', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Nov 12', kind: 'accept' },
      { at: 'Today, 10:15', who: 'Sam', text: 'Arrived for pickup. Inspection started', kind: 'pickup' },
      { at: 'Today, 10:42', who: 'Sam', text: 'Two differences from what was declared. Re-priced to $16,950', kind: 'reprice' },
      { at: 'Today, 10:42', who: 'Redline', text: 'Sent to Dave for a decision. Car stays on the lot until then', kind: 'alert' },
    ],
  },
  {
    vin: ROGUE_VIN,
    car: '2016 Nissan Rogue SV',
    km: 121500,
    offer: 10400,
    auction: 9300,
    status: 'offered',
    pickup: 'Not booked',
    expires: 'Fri Nov 13',
    expiresSoon: true,
    inspected: false,
    repriced: false,
    events: [
      { at: 'Fri Nov 6, 15:20', who: 'Maria', text: 'Offer made: $10,400, beats auction by $1,100', kind: 'offer' },
      { at: 'Fri Nov 6, 15:20', who: 'Redline', text: 'Offer holds 7 days, until Fri Nov 13', kind: 'alert' },
    ],
  },
  {
    vin: '2T3B1RFV0LC067821',
    car: '2020 Toyota RAV4 LE',
    km: 54200,
    offer: 24300,
    auction: 22900,
    status: 'picked_up',
    pickup: TODAY,
    inspected: true,
    repriced: false,
    events: [
      { at: 'Tue Nov 10, 09:40', who: 'Maria', text: 'Offer made: $24,300, beats auction by $1,400', kind: 'offer' },
      { at: 'Tue Nov 10, 09:44', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Nov 12', kind: 'accept' },
      { at: 'Today, 09:58', who: 'Sam', text: 'Inspected. Matches what was declared', kind: 'inspect' },
      { at: 'Today, 10:10', who: 'Sam', text: 'Picked up. Payment of $24,300 goes out by Mon Nov 16', kind: 'pickup' },
    ],
  },
  {
    vin: '4S4BTANC5L3214470',
    car: '2020 Subaru Crosstrek Touring',
    km: 49900,
    offer: 22450,
    auction: 21100,
    status: 'picked_up',
    pickup: TODAY,
    inspected: true,
    repriced: false,
    events: [
      { at: 'Sat Nov 7, 14:12', who: 'Maria', text: 'Offer made: $22,450, beats auction by $1,350', kind: 'offer' },
      { at: 'Sat Nov 7, 14:15', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Nov 12', kind: 'accept' },
      { at: 'Today, 09:30', who: 'Sam', text: 'Inspected. Matches what was declared', kind: 'inspect' },
      { at: 'Today, 09:45', who: 'Sam', text: 'Picked up. Payment of $22,450 goes out by Mon Nov 16', kind: 'pickup' },
    ],
  },
  {
    vin: 'JM3KFBCL1H0198765',
    car: '2017 Mazda CX-5 GS',
    km: 102300,
    offer: 13900,
    auction: 12700,
    status: 'not_ready',
    pickup: NEXT_PICKUP,
    inspected: false,
    repriced: false,
    note: 'Second key missing',
    events: [
      { at: 'Tue Nov 10, 16:02', who: 'Maria', text: 'Offer made: $13,900, beats auction by $1,200', kind: 'offer' },
      { at: 'Tue Nov 10, 16:05', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Nov 12', kind: 'accept' },
      { at: 'Today, 10:50', who: 'Sam', text: 'Not ready: second key missing. Moved to the next pickup, Thu Nov 19', kind: 'alert' },
    ],
  },
  {
    vin: 'KMHLS4AG5MU125530',
    car: '2021 Hyundai Elantra Preferred',
    km: 41800,
    offer: 18200,
    auction: 16950,
    status: 'awaiting_pickup',
    pickup: NEXT_PICKUP,
    inspected: false,
    repriced: false,
    events: [
      { at: 'Today, 11:20', who: 'Maria', text: 'Offer made: $18,200, beats auction by $1,250', kind: 'offer' },
      { at: 'Today, 11:24', who: 'Maria', text: 'Accepted. Joined the next pickup, Thu Nov 19', kind: 'accept' },
    ],
  },
  {
    vin: '2GNAXSEV4J6301187',
    car: '2018 Chevrolet Equinox LT',
    km: 93200,
    offer: 14100,
    auction: 13050,
    status: 'awaiting_pickup',
    pickup: NEXT_PICKUP,
    inspected: false,
    repriced: false,
    events: [
      { at: 'Today, 12:05', who: 'Dave', text: 'Offer made: $14,100, beats auction by $1,050', kind: 'offer' },
      { at: 'Today, 12:06', who: 'Dave', text: 'Accepted. Joined the next pickup, Thu Nov 19', kind: 'accept' },
    ],
  },
  {
    vin: 'KNDPM3AC7K7562219',
    car: '2019 Kia Sportage LX',
    km: 77000,
    offer: 15700,
    auction: 14650,
    status: 'offered',
    pickup: 'Not booked',
    expires: 'Tue Nov 17',
    inspected: false,
    repriced: false,
    events: [{ at: 'Tue Nov 10, 13:30', who: 'Maria', text: 'Offer made: $15,700, beats auction by $1,050', kind: 'offer' }],
  },
  {
    vin: '1FMCU9GD4JUA44312',
    car: '2018 Ford Escape SE',
    km: 88900,
    offer: 12600,
    auction: 11500,
    status: 'paid',
    pickup: 'Thu Nov 5',
    inspected: true,
    repriced: false,
    daysToCash: 6,
    events: [
      { at: 'Mon Nov 2, 10:10', who: 'Maria', text: 'Offer made: $12,600, beats auction by $1,100', kind: 'offer' },
      { at: 'Mon Nov 2, 10:12', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Nov 5', kind: 'accept' },
      { at: 'Thu Nov 5, 10:30', who: 'Sam', text: 'Inspected. Matches what was declared. Picked up', kind: 'inspect' },
      { at: 'Mon Nov 9, 09:00', who: 'Clutch', text: 'Paid $12,600 to Yorkdale Honda', kind: 'money' },
    ],
  },
  {
    vin: '3VWD17AJ5FM233901',
    car: '2015 Volkswagen Jetta Comfortline',
    km: 138000,
    offer: 7900,
    auction: 7000,
    status: 'paid',
    pickup: 'Thu Oct 29',
    inspected: true,
    repriced: false,
    daysToCash: 5,
    events: [
      { at: 'Mon Oct 26, 15:40', who: 'Maria', text: 'Offer made: $7,900, beats auction by $900', kind: 'offer' },
      { at: 'Mon Oct 26, 15:41', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Oct 29', kind: 'accept' },
      { at: 'Thu Oct 29, 11:15', who: 'Sam', text: 'Inspected. Matches what was declared. Picked up', kind: 'inspect' },
      { at: 'Fri Oct 30, 09:00', who: 'Clutch', text: 'Paid $7,900 to Yorkdale Honda', kind: 'money' },
    ],
  },
  {
    vin: 'KM8J33A49KU914275',
    car: '2019 Hyundai Tucson Preferred',
    km: 72000,
    offer: 17300,
    auction: 16050,
    status: 'paid',
    pickup: 'Thu Oct 22',
    inspected: true,
    repriced: false,
    daysToCash: 7,
    events: [
      { at: 'Fri Oct 16, 12:00', who: 'Maria', text: 'Offer made: $17,300, beats auction by $1,250', kind: 'offer' },
      { at: 'Fri Oct 16, 12:02', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Oct 22', kind: 'accept' },
      { at: 'Thu Oct 22, 10:05', who: 'Sam', text: 'Inspected. Matches what was declared. Picked up', kind: 'inspect' },
      { at: 'Fri Oct 23, 09:00', who: 'Clutch', text: 'Paid $17,300 to Yorkdale Honda', kind: 'money' },
    ],
  },
  {
    vin: '1C4PJMCS3HW603318',
    car: '2017 Jeep Cherokee North',
    km: 110400,
    offer: 11800,
    auction: 10900,
    status: 'declined',
    pickup: 'Thu Oct 22',
    inspected: true,
    repriced: true,
    note: 'Re-price declined. Went to auction',
    events: [
      { at: 'Mon Oct 19, 14:25', who: 'Maria', text: 'Offer made: $11,800, beats auction by $900', kind: 'offer' },
      { at: 'Mon Oct 19, 14:30', who: 'Maria', text: 'Accepted. Joined Thursday’s pickup, Thu Oct 22', kind: 'accept' },
      { at: 'Thu Oct 22, 10:40', who: 'Sam', text: 'Transmission slipping, not declared. Re-priced to $10,300', kind: 'reprice' },
      { at: 'Thu Oct 22, 13:10', who: 'Dave', text: 'Declined the re-price. Car stays with Yorkdale Honda', kind: 'decision' },
    ],
  },
];
