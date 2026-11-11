import { Suspense, useState, type ReactNode } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '../components/ui/Button';
import { MODULES, persona, type ModuleId, type PersonaId } from '../domain/personas';
import { BackOfficeLive } from '../live/BackOfficeLive';
import { InspectorLive } from '../live/InspectorLive';
import { OpsLive } from '../live/OpsLive';
import { TradeInLive } from '../live/TradeInLive';
import { useHasBackend, WorldProvider } from '../live/world';
import { VariantB2 as BackOfficeB2 } from '../modules/back-office/VariantB2';
import { InspectorVariantC2 } from '../modules/inspector/VariantC2';
import { VariantD as OpsD } from '../modules/ops-board/VariantD';
import { TradeInVariantB2 } from '../modules/trade-in/VariantB2';
import type { BackOfficeTab } from './views';

/** Back office's tab, owned by the shell so each tab has its own URL and switcher entry. */
interface OfficeProps {
  tab: BackOfficeTab;
  onChange: (t: BackOfficeTab) => void;
  hrefOf: (t: BackOfficeTab) => string;
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[414px] rounded-[44px] border border-line bg-white p-3">
      <div className="mx-auto mb-3 h-1.5 w-20 rounded-pill bg-line-light" />
      {/* As tall as a phone, but never taller than the window, so the whole device stays in view on a laptop. */}
      <div className="h-[min(780px,calc(100vh-184px))] min-h-[560px] overflow-y-auto rounded-[32px] border border-line-light bg-canvas">{children}</div>
    </div>
  );
}

/** The picked version of each module. The explored ones stay in Storybook. */
function PickedScreen({ module, onSwitch, office }: { module: ModuleId; onSwitch: (id: PersonaId, office?: BackOfficeTab) => void; office?: OfficeProps }) {
  switch (module) {
    case 'trade-in':
      // Opens Back office on Pickups, where the car just traded in now waits for its pickup.
      return <TradeInVariantB2 onOpenBackOffice={() => onSwitch('dave', 'pickups')} />;
    case 'back-office':
      return <BackOfficeB2 tab={office?.tab} onTabChange={office?.onChange} tabHref={office?.hrefOf} />;
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

/** In the header, next to the switcher: Reset demo, so every reviewer starts from the same story. */
export function DemoBar() {
  // Its own subscription (Convex shares it with the module's), so it can sit in the header outside WorldProvider.
  const data = useQuery(api.world.get);
  const reset = useMutation(api.demo.reset);
  const [confirming, setConfirming] = useState(false);
  if (!data?.meta) return null;
  return (
    <div className="flex items-center gap-4 text-caption whitespace-nowrap text-muted">
      {confirming ? (
        <span>
          Start over for everyone?{' '}
          <button
            type="button"
            onClick={() => {
              void reset();
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
