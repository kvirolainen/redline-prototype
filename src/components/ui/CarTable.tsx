import type { CarRow } from '../../domain/sampleCars';
import { StatusChip } from './StatusChip';
import { money } from '../../domain/format';


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
