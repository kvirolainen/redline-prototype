import { useState } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { NEXT_PICKUP, TODAY, type BackOfficeCar } from './fixtures';
import { CarDetail, DecidedNote, Drawer, ExpiringOffer, ExpiryTag, PageHeader, RepriceDecision, ValueStrip } from './parts';
import { km } from './format';
import { useBackOffice } from './useBackOffice';

const GROUPS: { title: string; match: (c: BackOfficeCar) => boolean }[] = [
  { title: `Today’s pickup · ${TODAY}`, match: (c) => c.pickup === TODAY && c.status !== 'declined' },
  { title: `Next pickup · ${NEXT_PICKUP}`, match: (c) => c.pickup === NEXT_PICKUP },
  { title: 'Open offers', match: (c) => c.status === 'offered' },
  { title: 'Paid', match: (c) => c.status === 'paid' },
  { title: 'Stayed with you', match: (c) => c.status === 'declined' },
];

function CarLine({ car, onOpen }: { car: BackOfficeCar; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-4 border-b border-line-light px-4 py-3 text-left last:border-b-0 hover:bg-canvas">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{car.car}</span>
        <span className="block truncate text-caption text-muted">
          {car.vin.slice(-6)} · {km(car.km)}
          {car.note && car.status === 'not_ready' ? ` · ${car.note}` : ''}
        </span>
      </span>
      <span className="hidden w-20 text-right text-sm font-bold text-ink sm:block">{money(car.offer)}</span>
      <span className="flex w-40 justify-end">{car.status === 'offered' ? <ExpiryTag car={car} /> : <StatusChip status={car.status} />}</span>
      <span className="text-subtle" aria-hidden>
        ›
      </span>
    </button>
  );
}

/** B · Needs you inbox: decisions are made in place on the left; the full list sits on the right. */
export function VariantB() {
  const office = useBackOffice();
  const [open, setOpen] = useState<string | null>(null);
  // Cards stay in the inbox after a decision, showing what happened, until the page is left.
  const [inbox] = useState(() => office.needsYou.map((c) => c.vin));
  const openCar = office.cars.find((c) => c.vin === open);
  const pending = office.needsYou.length;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1240px] px-8 py-8">
        <PageHeader />
        <div className="mt-6">
          <ValueStrip stats={office.stats} dense />
        </div>

        <div className="mt-8 grid grid-cols-[360px_minmax(0,1fr)] items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section aria-label="Needs you">
            <h2 className="mb-3 flex items-center gap-2 text-title font-bold text-ink">
              Needs you
              {pending > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-pill bg-ink px-2 text-caption font-bold text-white">{pending}</span>}
            </h2>
            <div className="space-y-4">
              {inbox.map((vin) => {
                const car = office.cars.find((c) => c.vin === vin)!;
                const isReprice = !!car.reprice && car.status === 'reprice_pending';
                const isExpiring = car.status === 'offered' && car.expiresSoon;
                const done = !isReprice && !isExpiring;
                return (
                  <article key={vin} className={`rounded-card border bg-white p-5 ${done ? 'border-line' : 'border-warning'}`}>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-caption font-medium text-muted">
                          {done ? 'Done' : isReprice ? `Re-price · ${car.reprice!.waiting}` : 'Offer expires tomorrow'}
                        </p>
                        <h3 className="mt-0.5 truncate text-base font-bold text-ink">{car.car}</h3>
                      </div>
                      <button type="button" onClick={() => setOpen(vin)} className="shrink-0 text-sm font-medium text-ink underline">
                        Timeline
                      </button>
                    </div>
                    {isReprice && (
                      <RepriceDecision car={car} compact onAccept={() => office.acceptReprice(vin)} onDecline={() => office.declineReprice(vin)} />
                    )}
                    {isExpiring && <ExpiringOffer car={car} quiet={office.needsYou.some((c) => c.status === 'reprice_pending')} onRefresh={() => office.refreshOffer(vin)} />}
                    {done && <DecidedNote car={car} />}
                  </article>
                );
              })}
              {pending === 0 && (
                <div className="rounded-card border border-line bg-white px-5 py-6 text-center">
                  <p className="text-base font-bold text-ink">You’re all caught up</p>
                  <p className="mt-1 text-sm text-muted">New re-prices and expiring offers land here.</p>
                </div>
              )}
            </div>
          </section>

          <section aria-label="All cars" className="min-w-0">
            <h2 className="mb-3 text-title font-bold text-ink">All cars</h2>
            <div className="space-y-5">
              {GROUPS.map((g) => {
                const cars = office.cars.filter(g.match);
                if (!cars.length) return null;
                return (
                  <div key={g.title}>
                    <p className="mb-2 text-sm font-medium text-muted">
                      {g.title} <span className="text-subtle">· {cars.length}</span>
                    </p>
                    <div className="overflow-hidden rounded-card border border-line bg-white">
                      {cars.map((c) => (
                        <CarLine key={c.vin} car={c} onOpen={() => setOpen(c.vin)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <Drawer open={!!openCar} onClose={() => setOpen(null)} label="Car detail">
        {openCar && <CarDetail car={openCar} office={office} />}
      </Drawer>
    </div>
  );
}
