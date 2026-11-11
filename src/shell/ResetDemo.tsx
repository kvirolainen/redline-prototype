import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useHasBackend } from '../live/world';

/** Reset demo, at the top of the Demo doc: puts every car back to the starting story for everyone. Needs the live
 *  backend, so it renders nothing in Storybook. */
export function ResetDemo() {
  return useHasBackend() ? <ResetDemoButton /> : null;
}

function ResetDemoButton() {
  const data = useQuery(api.world.get);
  const reset = useMutation(api.demo.reset);
  const [state, setState] = useState<'idle' | 'confirm' | 'done'>('idle');
  if (data === undefined) return null;
  const pill = 'inline-flex h-10 items-center rounded-pill border px-5 text-sm font-medium';
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {state === 'confirm' ? (
        <>
          <span className="text-sm text-body">Start over for everyone?</span>
          <button
            type="button"
            className={`${pill} border-ink bg-ink text-white`}
            onClick={() => {
              void reset();
              setState('done');
            }}
          >
            Reset
          </button>
          <button type="button" className={`${pill} border-line text-ink hover:border-ink`} onClick={() => setState('idle')}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <button type="button" className={`${pill} border-line text-ink hover:border-ink`} onClick={() => setState('confirm')}>
            Reset demo
          </button>
          {state === 'done' && <span className="text-sm text-muted">✓ Back to the starting story</span>}
        </>
      )}
    </div>
  );
}

/** The same reset at the foot of the persona menu, so a presenter can start over from any screen. Two taps:
 *  the first asks, the second resets for everyone. */
export function ResetDemoMenuItem() {
  return useHasBackend() ? <ResetDemoMenuButton /> : null;
}

function ResetDemoMenuButton() {
  const reset = useMutation(api.demo.reset);
  const [state, setState] = useState<'idle' | 'confirm' | 'done'>('idle');
  return (
    <>
      <div className="mx-2 my-2 border-t border-line-light" />
      {state === 'confirm' ? (
        <div className="flex items-center gap-2 py-1.5 pr-2 pl-[52px]">
          <span className="flex-1 text-sm text-body">Start over for everyone?</span>
          <button type="button" role="menuitem" className="h-8 rounded-pill bg-ink px-3 text-caption font-medium text-white" onClick={() => {
            void reset();
            setState('done');
          }}>
            Reset
          </button>
          <button type="button" className="h-8 rounded-pill border border-line px-3 text-caption font-medium text-ink hover:border-ink" onClick={() => setState('idle')}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" role="menuitem" onClick={() => setState('confirm')} className="flex w-full items-center gap-3 rounded-card px-2 py-1.5 text-left text-sm font-medium text-muted hover:bg-canvas hover:text-ink">
          {/* Same 32px icon column and gap as the menu items above, so icon and text line up. */}
          <span className="grid size-8 shrink-0 place-items-center" aria-hidden>
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v3h3" />
            </svg>
          </span>
          {state === 'done' ? '✓ Back to the starting story' : 'Reset demo'}
        </button>
      )}
    </>
  );
}
