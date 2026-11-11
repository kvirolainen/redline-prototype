// Trade-in fixtures: cars the VIN lookup knows, the dealer, and the dates the screens show.
// Today is Thu Nov 12 2026. Today's Yorkdale Honda run has left, so new offers join the next one, Thu Nov 19.

export interface DecodedCar {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body: string;
  transmission: string;
  colour: string;
  /** Odometer reading on the dealer's trade-in list. */
  listKm: number;
  /** Price stub inputs: firm offer for a clean car at listKm, and the auction net estimate. */
  baseFirm: number;
  auctionNet: number;
}

export const carName = (c: DecodedCar) => `${c.year} ${c.make} ${c.model} ${c.trim}`;
export const kmLabel = (km: number) => `${km.toLocaleString('en-CA')} km`;
export const reference = (car: DecodedCar) => `RL-${car.vin.slice(-6)}`;

export const CIVIC: DecodedCar = {
  vin: '2HGFC2F69KH512345', year: 2019, make: 'Honda', model: 'Civic', trim: 'EX', body: 'Sedan',
  transmission: 'Automatic (CVT)', colour: 'Lunar Silver', listKm: 68400, baseFirm: 17850, auctionNet: 16400,
};

export const ELANTRA: DecodedCar = {
  vin: 'KMHDH4AE6GU512908', year: 2016, make: 'Hyundai', model: 'Elantra', trim: 'GL', body: 'Sedan',
  transmission: 'Automatic', colour: 'Phantom Black', listKm: 121500, baseFirm: 9850, auctionNet: 8900,
};

// Over 200,000 km: the calculator can't firm this one instantly.
export const F150: DecodedCar = {
  vin: '1FTFW1EF4DFC10234', year: 2013, make: 'Ford', model: 'F-150', trim: 'XLT SuperCrew 4x4', body: 'Pickup truck',
  transmission: 'Automatic', colour: 'Oxford White', listKm: 214600, baseFirm: 13200, auctionNet: 11300,
};

export const KNOWN_CARS = [CIVIC, ELANTRA, F150];

/** Today's trade-ins on the dealer's list: what Maria would otherwise copy the VIN from. */
export const TRADE_IN_LIST = [
  { car: CIVIC, customer: 'Civic, new CR-V deal' },
  { car: ELANTRA, customer: 'Elantra, new Civic deal' },
  { car: F150, customer: 'F-150, new Ridgeline deal' },
];

export const decodeVin = (vin: string) =>
  KNOWN_CARS.find((c) => c.vin === vin.trim().toUpperCase()) ?? null;

export const DEALER = { name: 'Yorkdale Honda', city: 'Toronto' };
export const USER = { name: 'Maria', role: 'Sales Manager' };

export const DATES = {
  today: 'Thu Nov 12',
  pickup: 'Thu Nov 19',
  pickupLong: 'Thursday, Nov 19',
  validUntil: 'Thu Nov 19',
  firmBy: '3:00 pm today',
};

/** What it costs to send a car to auction instead, used for the "why sell to Clutch" line. */
export const AUCTION_COSTS = { fees: 650, transport: 400, weeksToCash: 3 };
