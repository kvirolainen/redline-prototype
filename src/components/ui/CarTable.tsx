import type { CarStatus } from '../../domain/statuses';
import { StatusChip } from './StatusChip';
import { money } from './OfferCard';

export interface CarRow {
  car: string;
  vin: string;
  km: number;
  offer: number;
  status: CarStatus;
  pickup: string;
}

export function CarTable({ rows, selected, onSelect }: { rows: CarRow[]; selected?: string; onSelect?: (vin: string) => void }) {
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-caption font-medium text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Car</th>
            <th className="px-4 py-3 font-medium">Offer</th>
            <th className="px-4 py-3 font-medium">Pickup</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.vin}
              onClick={() => onSelect?.(r.vin)}
              className={`cursor-pointer border-b border-line-light last:border-b-0 hover:bg-canvas ${selected === r.vin ? 'bg-canvas' : ''}`}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{r.car}</div>
                <div className="text-caption text-muted">
                  {r.vin.slice(-6)} · {r.km.toLocaleString('en-CA')} km
                </div>
              </td>
              <td className="px-4 py-3 font-bold text-ink">{money(r.offer)}</td>
              <td className="px-4 py-3 text-body">{r.pickup}</td>
              <td className="px-4 py-3">
                <StatusChip status={r.status} />
              </td>
              <td className="pr-4 text-subtle">›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const SAMPLE_CARS: CarRow[] = [
  { car: '2019 Honda Civic EX', vin: '2HGFC2F69KH512345', km: 68400, offer: 17850, status: 'reprice_pending', pickup: 'Thu Nov 12' },
  { car: '2020 Toyota RAV4 LE', vin: '2T3B1RFV0LC067821', km: 54200, offer: 24300, status: 'awaiting_pickup', pickup: 'Thu Nov 12' },
  { car: '2017 Mazda CX-5 GS', vin: 'JM3KFBCL1H0198765', km: 102300, offer: 13900, status: 'not_ready', pickup: 'Thu Nov 19' },
  { car: '2018 Ford Escape SE', vin: '1FMCU9GD4JUA44312', km: 88900, offer: 12600, status: 'paid', pickup: 'Thu Nov 5' },
];
