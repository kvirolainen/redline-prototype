import { Suspense, type CSSProperties, type ReactNode } from 'react';
import { useMutation } from 'convex/react';
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
      {/* As tall as a phone, but never taller than the window, so the whole device stays in view on a laptop.
          --phone-h tells the screen inside how tall "full height" is (the window in Storybook, this frame here), and
          the transform makes the frame the box that bottom sheets anchor to, so they open inside the phone. */}
      <div
        className="relative h-[calc(var(--phone-h)+2px)] overflow-hidden rounded-[32px] border border-line-light bg-canvas [transform:translateZ(0)]"
        style={{ '--phone-h': 'max(558px, min(778px, calc(100vh - 186px)))' } as CSSProperties}
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
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

export { WorldProvider };
