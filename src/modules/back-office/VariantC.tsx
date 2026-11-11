import { useState } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import type { CarStatus } from '../../domain/statuses';
import { money } from '../../domain/format';
import type { BackOfficeCar } from './fixtures';
import { CarDetail, Drawer, ExpiryTag, PageHeader, Signed, ValueStrip } from './parts';
import { km } from './format';
import { useBackOffice } from './useBackOffice';

const COLUMNS: { title: string; statuses: CarStatus[]; empty: string }[] = [
  { title: 'Offer made', statuses: ['offered'], empty: 'No open offers' },
  { title: 'Awaiting pickup', statuses: ['awaiting_pickup', 'not_ready'], empty: 'Nothing booked' },
  { title: 'Re-price', statuses: ['reprice_pending'], empty: 'Nothing waiting on you' },
  { title: 'Picked up', statuses: ['confirmed', 'picked_up'], empty: 'Nothing on a truck' },
  { title: 'Paid', statuses: ['paid'], empty: 'No payments yet' },
];

function Card({ car, onOpen, onRefresh }: { car: BackOfficeCar; onOpen: () => void; onRefresh: () => void }) {
  const attention = car.status === 'reprice_pending' || (car.status === 'offered' && car.expiresSoon);
  return (
    <div className={`rounded-card border bg-white ${attention ? 'border-warning' : 'border-line'}`}>
      <button type="button" onClick={onOpen} className="block w-full px-3 pt-3 pb-3 text-left hover:bg-canvas">
        <span className="block text-sm leading-tight font-medium text-ink">{car.car}</span>
        <span className="mt-1 block text-caption text-muted">{km(car.km)}</span>
        {car.status === 'reprice_pending' && car.reprice ? (
          <span className="mt-2 block text-sm">
            <span className="text-muted line-through">{money(car.reprice.from)}</span>{' '}
            <span className="font-bold text-ink">{money(car.reprice.to)}</span>
          </span>
        ) : (
          <span className="mt-2 block text-sm font-bold text-ink">{money(car.offer)}</span>
        )}
        <span className="mt-2 flex flex-wrap items-center gap-2">
          {car.status === 'offered' ? (
            <ExpiryTag car={car} />
          ) : car.status === 'reprice_pending' ? (
            <span className="text-caption text-muted">{car.reprice?.waiting} · 2 differences</span>
          ) : car.status === 'not_ready' || car.status === 'confirmed' ? (
            <StatusChip status={car.status} />
          ) : (
            <span className="text-caption text-muted">{car.status === 'paid' ? `Pickup ${car.pickup}` : car.pickup}</span>
          )}
        </span>
      </button>
      {car.status === 'reprice_pending' && (
        <div className="border-t border-line px-3 py-2">
          <button type="button" onClick={onOpen} className="h-8 w-full rounded-pill bg-ink text-caption font-bold text-white hover:bg-body">
            Review re-price
          </button>
        </div>
      )}
      {car.status === 'offered' && car.expiresSoon && (
        <div className="border-t border-line px-3 py-2">
          <button type="button" onClick={onRefresh} className="h-8 w-full rounded-pill border border-ink bg-white text-caption font-bold text-ink hover:bg-canvas">
            Refresh offer
          </button>
        </div>
      )}
    </div>
  );
}

/** C · Pipeline board: one column per stage, a card per car; the re-price column is the one that asks for Dave. */
export function VariantC() {
  const office = useBackOffice();
  const [open, setOpen] = useState<string | null>(null);
  const openCar = office.cars.find((c) => c.vin === open);
  const stayed = office.cars.filter((c) => c.status === 'declined');

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <PageHeader right={<Signed />} />
        <div className="mt-6">
          <ValueStrip stats={office.stats} dense />
        </div>

        <div className="mt-8 grid grid-cols-5 gap-3">
          {COLUMNS.map((col) => {
            const cars = office.cars.filter((c) => col.statuses.includes(c.status));
            const isReprice = col.statuses.includes('reprice_pending');
            const hot = isReprice && cars.length > 0;
            return (
              <section key={col.title} aria-label={col.title} className={`min-w-0 rounded-panel border p-2 ${hot ? 'border-warning bg-nudge' : 'border-line bg-line-light/40'}`}>
                <header className="flex items-baseline justify-between gap-2 px-1 pt-1 pb-3">
                  <h2 className="truncate text-sm font-bold text-ink">
                    {col.title} <span className="font-medium text-muted">{cars.length}</span>
                  </h2>
                  {cars.length > 0 && <span className="hidden text-caption whitespace-nowrap text-muted xl:inline">{money(cars.reduce((s, c) => s + c.offer, 0))}</span>}
                </header>
                <div className="space-y-2">
                  {cars.map((c) => (
                    <Card key={c.vin} car={c} onOpen={() => setOpen(c.vin)} onRefresh={() => office.refreshOffer(c.vin)} />
                  ))}
                  {!cars.length && <p className="rounded-card border border-dashed border-line px-3 py-6 text-center text-caption text-muted">{col.empty}</p>}
                </div>
              </section>
            );
          })}
        </div>

        {stayed.length > 0 && (
          <section className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-line bg-white px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Stayed with you</h2>
            {stayed.map((c) => (
              <button key={c.vin} type="button" onClick={() => setOpen(c.vin)} className="text-sm text-body underline decoration-line underline-offset-4 hover:decoration-ink">
                {c.car}
              </button>
            ))}
            <span className="text-caption text-muted">Re-price declined; the car went back to your usual exit.</span>
          </section>
        )}
      </div>

      <Drawer open={!!openCar} onClose={() => setOpen(null)} label="Car detail">
        {openCar && <CarDetail car={openCar} office={office} />}
      </Drawer>
    </div>
  );
}
