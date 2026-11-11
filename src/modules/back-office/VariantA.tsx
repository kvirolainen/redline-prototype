import { useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { CarTable } from '../../components/ui/CarTable';
import type { CarRow } from '../../domain/sampleCars';
import type { CarStatus } from '../../domain/statuses';
import { money } from '../../domain/format';
import type { BackOfficeCar } from './fixtures';
import { CarDetail, DecidedNote, Drawer, PageHeader, ValueStrip } from './parts';
import { useBackOffice } from './useBackOffice';

const FILTERS: { id: string; label: string; statuses: CarStatus[] }[] = [
  { id: 'awaiting', label: 'Awaiting pickup', statuses: ['awaiting_pickup', 'not_ready', 'reprice_pending', 'confirmed'] },
  { id: 'offers', label: 'Open offers', statuses: ['offered'] },
  { id: 'done', label: 'Picked up & paid', statuses: ['picked_up', 'paid'] },
  { id: 'closed', label: 'Stayed with you', statuses: ['declined', 'expired', 'cancelled'] },
];

const toRow = (c: BackOfficeCar): CarRow => ({
  car: c.car,
  vin: c.vin,
  km: c.km,
  offer: c.offer,
  status: c.status,
  pickup: c.status === 'offered' ? `Offer holds until ${c.expires}` : c.status === 'not_ready' ? `${c.pickup} (rolled)` : c.pickup,
});

function Notice({ tone, children }: { tone: 'attention' | 'done'; children: ReactNode }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card border px-5 py-4 ${
        tone === 'attention' ? 'border-warning bg-nudge' : 'border-line bg-white'
      }`}
    >
      {children}
    </div>
  );
}

/** A · Table first: value strip, notices for what needs the dealer, then the cars table; a row opens the timeline. */
export function VariantA() {
  const office = useBackOffice();
  const [filter, setFilter] = useState('awaiting');
  const [open, setOpen] = useState<string | null>(null);
  const [decided, setDecided] = useState<string[]>([]);

  const reprice = office.cars.find((c) => c.status === 'reprice_pending');
  const expiring = office.cars.find((c) => c.status === 'offered' && c.expiresSoon);
  const active = FILTERS.find((f) => f.id === filter)!;
  const rows = office.cars.filter((c) => active.statuses.includes(c.status));
  const openCar = office.cars.find((c) => c.vin === open);

  const mark = (vin: string) => setDecided((d) => [...d, vin]);
  const shell = {
    ...office,
    acceptReprice: (vin: string) => (office.acceptReprice(vin), mark(vin)),
    declineReprice: (vin: string) => (office.declineReprice(vin), mark(vin)),
    refreshOffer: (vin: string) => (office.refreshOffer(vin), mark(vin)),
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <PageHeader subtitle="Every car you sold to Clutch, where it is, and what needs you." />

        <div className="mt-6">
          <ValueStrip stats={office.stats} />
        </div>

        <div className="mt-6 space-y-3">
          {reprice && (
            <Notice tone="attention">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">Re-price waiting on you · {reprice.car}</p>
                <p className="mt-0.5 text-sm text-body">
                  Sam found 2 differences from what was declared: {money(reprice.reprice!.from)} → {money(reprice.reprice!.to)}. The car stays on the lot until
                  you decide.
                </p>
              </div>
              <Button onClick={() => setOpen(reprice.vin)}>Review re-price</Button>
            </Notice>
          )}
          {expiring && (
            <Notice tone="attention">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">Offer expires tomorrow · {expiring.car}</p>
                <p className="mt-0.5 text-sm text-body">{money(expiring.offer)} holds until {expiring.expires}. Refresh keeps the price for another 7 days.</p>
              </div>
              <Button variant="outline" onClick={() => shell.refreshOffer(expiring.vin)}>
                Refresh offer
              </Button>
            </Notice>
          )}
          {decided.map((vin) => {
            const c = office.cars.find((x) => x.vin === vin)!;
            return (
              <Notice key={vin} tone="done">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-sm font-bold text-ink">{c.car}</p>
                  <DecidedNote car={c} />
                </div>
                <button type="button" className="text-sm font-medium text-ink underline" onClick={() => setOpen(vin)}>
                  View timeline
                </button>
              </Notice>
            );
          })}
        </div>

        <div className="mt-8 mb-4 flex flex-wrap items-center gap-2" role="tablist">
          {FILTERS.map((f) => {
            const n = office.cars.filter((c) => f.statuses.includes(c.status)).length;
            const on = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f.id)}
                className={`h-10 rounded-pill border px-4 text-sm font-medium transition-colors ${
                  on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-subtle'
                }`}
              >
                {f.label} <span className={on ? 'text-white/70' : 'text-muted'}>{n}</span>
              </button>
            );
          })}
        </div>

        {rows.length ? (
          <CarTable rows={rows.map(toRow)} selected={open ?? undefined} onSelect={setOpen} />
        ) : (
          <p className="rounded-panel border border-line bg-white px-6 py-10 text-center text-sm text-muted">No cars here right now.</p>
        )}
      </div>

      <Drawer open={!!openCar} onClose={() => setOpen(null)} label="Car detail">
        {openCar && <CarDetail car={openCar} office={shell} />}
      </Drawer>
    </div>
  );
}
