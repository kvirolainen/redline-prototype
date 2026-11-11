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
