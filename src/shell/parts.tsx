import { Suspense, useState, type ReactNode } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '../components/ui/Button';
import { clockAmPm, shortDate } from '../domain/calendar';
import { MODULES, persona, type ModuleId, type PersonaId } from '../domain/personas';
import { BackOfficeLive } from '../live/BackOfficeLive';
import { InspectorLive } from '../live/InspectorLive';
import { OpsLive } from '../live/OpsLive';
import { TradeInLive } from '../live/TradeInLive';
import { useDemoNow, useHasBackend, WorldProvider } from '../live/world';
import { VariantB2 as BackOfficeB2 } from '../modules/back-office/VariantB2';
import { InspectorVariantC2 } from '../modules/inspector/VariantC2';
import { VariantD as OpsD } from '../modules/ops-board/VariantD';
import { TradeInVariantB2 } from '../modules/trade-in/VariantB2';
import type { BackOfficeTab } from './views';

/** Back office's tab, owned by the shell so each tab has its own URL and switcher entry. */
interface OfficeProps {
  tab: BackOfficeTab;
  onChange: (t: BackOfficeTab) => void;
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[414px] rounded-[44px] border border-line bg-white p-3">
      <div className="mx-auto mb-3 h-1.5 w-20 rounded-pill bg-line-light" />
      <div className="h-[780px] overflow-y-auto rounded-[32px] border border-line-light bg-canvas">{children}</div>
    </div>
  );
}

/** The picked version of each module. The explored ones stay in Storybook. */
function PickedScreen({ module, onSwitch, office }: { module: ModuleId; onSwitch: (id: PersonaId, office?: BackOfficeTab) => void; office?: OfficeProps }) {
  switch (module) {
    case 'trade-in':
      // An offer an appraiser prices after the desk is Maria's to accept, on her Pickups page.
      return <TradeInVariantB2 onOpenBackOffice={() => onSwitch('dave', 'pickups')} />;
    case 'back-office':
      return <BackOfficeB2 tab={office?.tab} onTabChange={office?.onChange} />;
    case 'ops-board':
      return <OpsD />;
    case 'inspector':
      return <InspectorVariantC2 />;
  }
}

/** Wraps a module in its live adapter, so it reads and writes the shared backend instead of its fixtures. */
function Live({ module, children }: { module: ModuleId; children: ReactNode }) {
  if (module === 'trade-in') return <TradeInLive>{children}</TradeInLive>;
  if (module === 'back-office') return <BackOfficeLive>{children}</BackOfficeLive>;
  if (module === 'ops-board') return <OpsLive>{children}</OpsLive>;
  return <InspectorLive>{children}</InspectorLive>;
}

/** One person's module: live in the app, on fixtures in Storybook. */
export function DemoModule({ personaId, onSwitch, office }: { personaId: PersonaId; onSwitch: (id: PersonaId, office?: BackOfficeTab) => void; office?: OfficeProps }) {
  const hasBackend = useHasBackend();
  const module = persona(personaId).module;
  const screen = <PickedScreen module={module} onSwitch={onSwitch} office={office} />;
  const body = hasBackend ? <Live module={module}>{screen}</Live> : screen;
  return (
    <Suspense fallback={null}>
      {MODULES[module].device === 'phone' ? (
        <div className="py-8">
          <PhoneFrame>{body}</PhoneFrame>
        </div>
      ) : (
        body
      )}
    </Suspense>
  );
}

// ---- Demo controls -------------------------------------------------------------------------------------------------

/** Shown when the backend has no data yet: one button loads the starting story. */
export function EmptyWorld() {
  const reset = useMutation(api.demo.reset);
  return (
    <div className="grid flex-1 place-items-center p-10 text-center">
      <div>
        <p className="text-title font-bold text-ink">No demo data yet</p>
        <p className="mt-1 text-sm text-muted">Load the starting story: Thursday pickup day at Yorkdale Honda.</p>
        <Button className="mt-4 px-8" onClick={() => void reset()}>
          Load demo data
        </Button>
      </div>
    </div>
  );
}

/** In the header, next to the switcher: the demo clock, and the two controls that make a week fit in a few minutes. */
export function DemoBar() {
  // Its own subscription (Convex shares it with the module's), so it can sit in the header outside WorldProvider.
  const data = useQuery(api.world.get);
  const world = data?.meta ? { meta: data.meta } : null;
  const reset = useMutation(api.demo.reset);
  const skip = useMutation(api.demo.skipToPickup);
  if (!world) return null;
  return <DemoBarInner key={world.meta.setAt} today={world.meta.today} meta={world.meta} onReset={() => void reset()} onSkip={() => void skip()} />;
}

function DemoBarInner({ today, meta, onReset, onSkip }: { today: string; meta: Parameters<typeof useDemoNow>[0]; onReset: () => void; onSkip: () => void }) {
  const now = useDemoNow(meta);
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex items-center gap-4 text-caption whitespace-nowrap text-muted">
      <span>
        Demo time <span className="font-medium text-ink">{shortDate(today)}, {clockAmPm(now)}</span>
      </span>
      <button type="button" onClick={onSkip} className="font-medium text-ink underline hover:text-brand">
        Skip to next pickup day
      </button>
      {confirming ? (
        <span>
          Start over for everyone?{' '}
          <button
            type="button"
            onClick={() => {
              onReset();
              setConfirming(false);
            }}
            className="font-medium text-brand underline"
          >
            Reset
          </button>{' '}
          <button type="button" onClick={() => setConfirming(false)} className="underline hover:text-ink">
            Cancel
          </button>
        </span>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="underline hover:text-ink">
          Reset demo
        </button>
      )}
    </div>
  );
}

export { WorldProvider };
