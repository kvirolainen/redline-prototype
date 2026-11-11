import type { CarStatus } from './statuses';

export interface CarRow {
  car: string;
  vin: string;
  km: number;
  offer: number;
  status: CarStatus;
  pickup: string;
}

// Demo rows for stories until the back office reads from the backend.
export const SAMPLE_CARS: CarRow[] = [
  { car: '2019 Honda Civic EX', vin: '2HGFC2F69KH512345', km: 68400, offer: 17850, status: 'reprice_pending', pickup: 'Thu Nov 12' },
  { car: '2020 Toyota RAV4 LE', vin: '2T3B1RFV0LC067821', km: 54200, offer: 24300, status: 'awaiting_pickup', pickup: 'Thu Nov 12' },
  { car: '2017 Mazda CX-5 GS', vin: 'JM3KFBCL1H0198765', km: 102300, offer: 13900, status: 'not_ready', pickup: 'Thu Nov 19' },
  { car: '2018 Ford Escape SE', vin: '1FMCU9GD4JUA44312', km: 88900, offer: 12600, status: 'paid', pickup: 'Thu Nov 5' },
];
