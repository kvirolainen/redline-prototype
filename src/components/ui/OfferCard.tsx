import { money } from '../../domain/format';

interface Props {
  amount: number;
  car: string;
  vin: string;
  km: number;
  reference: string;
  auctionEstimate?: number;
  validUntil?: string;
}

// "Here's your firm offer" card, with the Redline addition: the gap to the auction estimate.
export function OfferCard({ amount, car, vin, km, reference, auctionEstimate, validUntil }: Props) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white">
      <div className="px-6 py-8 text-center">
        <p className="text-base text-ink">Total value of vehicle</p>
        <p className="mt-3 text-price font-bold text-ink">{money(amount)}</p>
        {auctionEstimate !== undefined && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-pill border border-line px-4 py-1.5 text-sm text-body">
            <span className="font-bold text-ink">Beats auction by {money(amount - auctionEstimate)}</span>
            <span className="text-muted">est. {money(auctionEstimate)} net</span>
          </p>
        )}
        {validUntil && <p className="mt-3 text-sm text-muted">Firm until {validUntil}</p>}
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-line px-6 py-6 text-base">
        {[
          ['Make/Model', car],
          ['VIN', vin],
          ['Mileage', `${km.toLocaleString('en-CA')} km`],
          ['Reference code', reference],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="font-medium text-ink">{k}</dt>
            <dd className="mt-1 text-muted">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
