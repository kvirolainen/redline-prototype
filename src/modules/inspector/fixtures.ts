// Sam's Thursday run: three dealers, six cars. The Civic is the mismatch, the CR-V is not ready,
// everything else matches what the dealer declared.

export const RUN = {
  day: 'Thursday',
  date: 'Today, Thu Nov 12',
  nextRun: 'Thu Nov 19',
  truck: 'Truck 3',
  inspector: 'Sam',
};

export interface Stop {
  id: string;
  dealer: string;
  address: string;
  contact: string;
  window: string;
}

export const STOPS: Stop[] = [
  { id: 'yorkdale', dealer: 'Yorkdale Honda', address: '3401 Dufferin St, Toronto', contact: 'Maria, Sales Manager', window: '10:15 – 11:45' },
  { id: 'downtown', dealer: 'Downtown Toyota', address: '677 Queen St E, Toronto', contact: 'Priya, Used Car Manager', window: '12:30 – 1:30' },
  { id: 'mississauga', dealer: 'Mississauga Mazda', address: '2400 Dundas St W, Mississauga', contact: 'Tom, Sales Manager', window: '2:15 – 3:00' },
];

export type AreaId = 'identity' | 'exterior' | 'interior' | 'mechanical' | 'tires';

export const AREAS: { id: AreaId; label: string }[] = [
  { id: 'identity', label: 'VIN & odometer' },
  { id: 'exterior', label: 'Exterior & glass' },
  { id: 'interior', label: 'Interior' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'tires', label: 'Tires & keys' },
];

export interface Finding {
  label: string;
  /** Price change suggested by Clutch pricing for this finding (negative = lower). */
  adjustment: number;
}

export interface CheckItem {
  id: string;
  area: AreaId;
  question: string;
  declared: string;
  /** What Sam can pick when it's different. */
  findings: Finding[];
}

export const CHECKS: CheckItem[] = [
  { id: 'vin', area: 'identity', question: 'VIN', declared: '', findings: [{ label: 'VIN does not match the offer', adjustment: 0 }] },
  {
    id: 'odometer', area: 'identity', question: 'Odometer', declared: '',
    findings: [
      { label: 'More than 1,000 km over declared', adjustment: -250 },
      { label: 'More than 5,000 km over declared', adjustment: -700 },
    ],
  },
  {
    id: 'body', area: 'exterior', question: 'Bodywork', declared: 'No exterior damage',
    findings: [
      { label: 'Repainted panel', adjustment: -350 },
      { label: 'Dent bigger than a golf ball', adjustment: -300 },
      { label: 'Scratches through the paint', adjustment: -200 },
    ],
  },
  {
    id: 'glass', area: 'exterior', question: 'Glass', declared: 'No chipped or cracked glass',
    findings: [
      { label: 'Cracked windshield', adjustment: -550 },
      { label: 'Chipped windshield', adjustment: -150 },
      { label: 'Cracked side or rear glass', adjustment: -300 },
    ],
  },
  {
    id: 'rust', area: 'exterior', question: 'Rust', declared: 'No rust',
    findings: [
      { label: 'Surface rust', adjustment: -200 },
      { label: 'Rust through a panel', adjustment: -900 },
    ],
  },
  {
    id: 'interior', area: 'interior', question: 'Seats, dash and headliner', declared: 'No stains, odours or tears',
    findings: [
      { label: 'Stains', adjustment: -150 },
      { label: 'Smoke or pet odour', adjustment: -400 },
      { label: 'Rips or tears', adjustment: -250 },
    ],
  },
  {
    id: 'lights', area: 'mechanical', question: 'Warning lights', declared: 'None on the dash',
    findings: [
      { label: 'Check engine light on', adjustment: -600 },
      { label: 'Other warning light on', adjustment: -300 },
    ],
  },
  {
    id: 'drive', area: 'mechanical', question: 'Starts and drives', declared: 'Driveable, no known issues',
    findings: [
      { label: 'Noise or vibration on the test drive', adjustment: -400 },
      { label: 'Does not start', adjustment: -1500 },
    ],
  },
  {
    id: 'keys', area: 'tires', question: 'Keys', declared: '',
    findings: [{ label: 'One key fewer than declared', adjustment: -250 }],
  },
  {
    id: 'tires', area: 'tires', question: 'Tires', declared: 'All-season, replaced in the last 12 months',
    findings: [
      { label: 'Tread under 4 mm', adjustment: -300 },
      { label: 'Mismatched tires', adjustment: -150 },
    ],
  },
];

export interface InspectionCar {
  id: string;
  stopId: string;
  car: string;
  trim: string;
  colour: string;
  vin: string;
  km: number;
  keys: number;
  offer: number;
  /** Where the car is parked on the lot. */
  spot: string;
  /** Prototype script: what Sam will find. Used only to pre-fill the note when he marks a difference. */
  script?: Record<string, { finding: number; note: string }>;
}

export const CARS: InspectionCar[] = [
  {
    id: 'civic', stopId: 'yorkdale', car: '2019 Honda Civic EX', trim: 'Sedan · CVT', colour: 'Lunar Silver',
    vin: '2HGFC2F69KH512345', km: 68400, keys: 2, offer: 17850, spot: 'Back row, spot 14',
    script: {
      glass: { finding: 0, note: 'Crack across the lower windshield, driver side, about 25 cm' },
      body: { finding: 0, note: 'Rear bumper repainted, colour mismatch and overspray on the trim' },
    },
  },
  {
    id: 'rav4', stopId: 'yorkdale', car: '2020 Toyota RAV4 LE', trim: 'AWD · Automatic', colour: 'Magnetic Grey',
    vin: '2T3B1RFV0LC067821', km: 54200, keys: 2, offer: 24300, spot: 'Back row, spot 15',
  },
  {
    id: 'crv', stopId: 'yorkdale', car: '2021 Honda CR-V EX-L', trim: 'AWD · CVT', colour: 'Modern Steel',
    vin: '2HKRW2H85MH601234', km: 41900, keys: 2, offer: 29400, spot: 'Service bay 3',
  },
  {
    id: 'elantra', stopId: 'downtown', car: '2018 Hyundai Elantra GL', trim: 'Sedan · Automatic', colour: 'Phantom Black',
    vin: 'KMHD84LF5JU512876', km: 92100, keys: 1, offer: 11200, spot: 'Side lot',
  },
  {
    id: 'soul', stopId: 'downtown', car: '2019 Kia Soul EX', trim: 'Hatchback · Automatic', colour: 'Snow White Pearl',
    vin: 'KNDJP3A57K7654321', km: 63500, keys: 2, offer: 14750, spot: 'Side lot',
  },
  {
    id: 'golf', stopId: 'mississauga', car: '2017 Volkswagen Golf Comfortline', trim: 'Hatchback · Automatic', colour: 'Pure White',
    vin: '3VW217AU4HM009812', km: 97800, keys: 2, offer: 12300, spot: 'Front lot',
  },
];

export const NOT_READY_REASONS = ['Keys missing', 'Out on a test drive', 'Not on the lot', 'Customer still has it'];

/** The declared answer for this car (some checks depend on the car's own numbers). */
export function declaredFor(item: CheckItem, car: InspectionCar): string {
  if (item.id === 'vin') return `Ends in ${car.vin.slice(-6)}`;
  if (item.id === 'odometer') return `${car.km.toLocaleString('en-CA')} km`;
  if (item.id === 'keys') return `${car.keys} ${car.keys === 1 ? 'key' : 'keys'}`;
  return item.declared;
}

export const stopOf = (car: InspectionCar) => STOPS.find((s) => s.id === car.stopId)!;
export const carsAt = (stopId: string) => CARS.filter((c) => c.stopId === stopId);
export const carById = (id: string) => CARS.find((c) => c.id === id)!;
