import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MODULES, type ModuleId } from '../domain/personas';
import { ArchitectureDiagram } from './Architecture';
import { Icon } from './icons';
import { MILESTONES, type MilestoneState } from './milestones';
import { DEVICE, isModule, isVariant, screen, screenCaption, type Device, type VariantKey } from './screens';

// Block embeds for the docs. A directive sits on its own line in the markdown:
//   ::screen[trade-in/B]   one live screen variant in a device frame
//   ::screens[inspector]   all three variants of a module, side by side
//   ::diagram[architecture]
//   ::milestones

/** Width of the element, kept up to date as the layout changes. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

const FRAME_PAD: Record<Device['kind'], number> = { phone: 10, desktop: 0 };
const FRAME_RADIUS: Record<Device['kind'], number> = { phone: 36, desktop: 8 };
const BEZEL_RADIUS: Record<Device['kind'], number> = { phone: 46, desktop: 10 };
/** Height of the fake browser bar on desktop frames. */
const BAR = 24;

/**
 * A screen at its design size, scaled down to fit `maxWidth` × `maxHeight`, inside a simple device
 * frame. The transform also makes the frame the containing block for the screen's fixed overlays,
 * so drawers and sheets open inside the device rather than over the page.
 */
function DeviceFrame({ module, variant, maxWidth, maxHeight }: { module: ModuleId; variant: VariantKey; maxWidth: number; maxHeight: number }) {
  const d = DEVICE[module];
  const pad = FRAME_PAD[d.kind];
  const bar = d.kind === 'desktop' ? BAR : 0;
  const scale = Math.min(1, (maxWidth - 2 * pad) / d.width, (maxHeight - 2 * pad - bar) / d.height);
  if (!(scale > 0)) return null;
  const { Component } = screen(module, variant);
  const w = d.width * scale;
  const h = d.height * scale;
  return (
    <div
      className="mx-auto border border-line bg-white"
      style={{ width: w + 2 * pad, padding: pad, borderRadius: BEZEL_RADIUS[d.kind] * Math.max(scale, 0.4) }}
    >
      {bar > 0 && (
        <div className="flex items-center gap-1 px-2" style={{ height: bar }} aria-hidden>
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
        </div>
      )}
      <div className="relative overflow-hidden border border-line-light bg-canvas" style={{ width: w, height: h, borderRadius: FRAME_RADIUS[d.kind] * Math.max(scale, 0.4) }}>
        <div
          className="absolute top-0 left-0 overflow-x-hidden overflow-y-auto"
          style={{ width: d.width, height: d.height, transform: `scale(${scale})`, transformOrigin: '0 0' }}
        >
          <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">Loading screen…</div>}>
            <Component />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function OpenButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${label} full size`}
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-pill border border-line bg-white px-3 text-caption font-medium whitespace-nowrap text-ink hover:border-ink"
    >
      <Icon name="arrowUpRight" className="size-3.5" />
      Open full size
    </button>
  );
}

/** Full-screen view of one screen at its design size (scaled down only if the window is smaller). */
function FullSize({ module, variant, onClose }: { module: ModuleId; variant: VariantKey; onClose: () => void }) {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  const caption = screenCaption(module, variant);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={caption} className="fixed inset-0 z-50 flex flex-col bg-ink/80">
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 text-white">
        <p className="truncate text-sm font-bold">{caption}</p>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-white/15">
          <Icon name="close" className="size-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-start justify-center px-4 pb-4">
        <DeviceFrame module={module} variant={variant} maxWidth={size.w - 32} maxHeight={size.h - 56 - 16} />
      </div>
    </div>,
    document.body,
  );
}

/** One screen preview: caption bar + framed live screen + "Open full size". */
function ScreenCard({ module, variant, maxHeight, small }: { module: ModuleId; variant: VariantKey; maxHeight: number; small?: boolean }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const caption = screenCaption(module, variant);
  return (
    <figure className="min-w-0">
      <div className={`flex items-center justify-between gap-3 ${small ? 'flex-col items-start' : ''}`}>
        <figcaption className="min-w-0 text-sm font-bold text-ink">
          {small ? (
            <>
              <span className="block text-caption font-medium text-muted">{MODULES[module].label} · {variant}</span>
              {screen(module, variant).name}
            </>
          ) : (
            caption
          )}
        </figcaption>
        <OpenButton onClick={() => setOpen(true)} label={caption} />
      </div>
      <div ref={ref} className="mt-3">
        {width > 0 && <DeviceFrame module={module} variant={variant} maxWidth={width} maxHeight={maxHeight} />}
      </div>
      {open && <FullSize module={module} variant={variant} onClose={() => setOpen(false)} />}
    </figure>
  );
}

const Block = ({ children }: { children: ReactNode }) => <div className="mt-8 rounded-panel border border-line bg-canvas p-4 lg:p-6">{children}</div>;

function Missing({ what }: { what: string }) {
  return <p className="mt-4 font-mono text-caption text-subtle">Missing embed: {what}</p>;
}

const STATE_STYLE: Record<MilestoneState, { dot: string; text: string; label: string }> = {
  done: { dot: 'border-ink bg-ink text-white', text: 'text-ink', label: 'Done' },
  next: { dot: 'border-2 border-ink bg-white text-ink', text: 'text-ink', label: 'Next' },
  later: { dot: 'border border-dashed border-subtle bg-white text-subtle', text: 'text-muted', label: 'Later' },
};

/** The build milestones in one row, each with its state. */
export function Milestones() {
  return (
    <ol className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 rounded-panel border border-line p-4 sm:grid-cols-4 lg:p-6">
      {MILESTONES.map((m, i) => {
        const s = STATE_STYLE[m.state];
        return (
          <li key={m.id} className="relative min-w-0">
            {i < MILESTONES.length - 1 && <span className="absolute top-4 left-10 right-0 hidden border-t border-line sm:block" aria-hidden />}
            <span className={`relative grid size-8 place-items-center rounded-full text-caption font-bold ${s.dot}`}>
              {m.state === 'done' ? <Icon name="check" className="size-4" /> : m.id}
            </span>
            <p className={`mt-3 text-sm font-bold ${s.text}`}>{m.label}</p>
            <p className="mt-0.5 text-caption text-muted">{s.label}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Renders one directive line. Unknown names or arguments render a muted "Missing embed" note. */
export function Embed({ name, arg, raw }: { name: string; arg: string; raw: string }) {
  if (name === 'screen') {
    const [m, v] = arg.split('/');
    if (!m || !v || !isModule(m) || !isVariant(m, v)) return <Missing what={raw} />;
    return (
      <Block>
        <ScreenCard module={m} variant={v} maxHeight={DEVICE[m].kind === 'phone' ? 600 : 560} />
      </Block>
    );
  }
  if (name === 'screens') {
    if (!isModule(arg)) return <Missing what={raw} />;
    return (
      <Block>
        <p className="text-caption font-bold tracking-wide text-muted uppercase">{MODULES[arg].label} · three variants</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {(['A', 'B', 'C'] as const).map((v) => (
            <ScreenCard key={v} module={arg} variant={v} maxHeight={DEVICE[arg].kind === 'phone' ? 400 : 240} small />
          ))}
        </div>
      </Block>
    );
  }
  if (name === 'diagram' && arg === 'architecture')
    return (
      <div className="mt-8 rounded-panel border border-line px-3 py-8 lg:px-6">
        <ArchitectureDiagram compact />
      </div>
    );
  if (name === 'milestones' && !arg) return <Milestones />;
  return <Missing what={raw} />;
}
