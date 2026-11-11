import { PageFrame } from './Journey';

type State = 'done' | 'now' | 'next';

const STEPS: { title: string; detail: string; output: string; state: State }[] = [
  {
    title: 'Research',
    detail: 'Whiteboard session on the business case and the people involved; a pass through Clutch’s public design and its sell flow on a tablet.',
    output: 'Style notes, sell-flow screenshots, open questions',
    state: 'done',
  },
  {
    title: 'Concept doc',
    detail: 'Why dealerships, who the four people are, the ideal end state, and the slice this prototype builds.',
    output: 'docs/01-concept.md',
    state: 'done',
  },
  {
    title: 'Prototypes in Storybook',
    detail: 'Foundations from Clutch’s look, then several genuinely different variants per screen, compared side by side before picking.',
    output: 'This Storybook · docs/02-prototypes.md',
    state: 'now',
  },
  {
    title: 'Build plan',
    detail: 'Data model, car statuses and the events each change writes, milestones in demo order.',
    output: 'docs/03-build-plan.md',
    state: 'next',
  },
  {
    title: 'Milestone builds',
    detail: 'One working slice at a time on the live backend: offer, pickup day, inspection and re-price, approval, ops board.',
    output: 'The app, deployed',
    state: 'next',
  },
  {
    title: 'Test report',
    detail: 'Walk the demo path as each person, note what broke or confused, fix, and record what changed.',
    output: 'docs/04-test-report.md',
    state: 'next',
  },
];

const badge: Record<State, string> = {
  done: 'border-line bg-white text-muted',
  now: 'border-ink bg-ink text-white',
  next: 'border-line bg-white text-subtle',
};

export function ProcessPage() {
  return (
    <PageFrame
      eyebrow="Behind the build"
      title="How this was made"
      intro="Research first, then a written concept, then designs explored as variants before anything is built for real."
    >
      <ol className="relative max-w-[760px]">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative grid grid-cols-[48px_1fr] gap-4 pb-6 last:pb-0">
            {i < STEPS.length - 1 && <span className="absolute top-10 bottom-0 left-[19px] w-px bg-line" aria-hidden />}
            <span
              className={`z-10 grid size-10 place-items-center rounded-full border text-sm font-bold ${
                s.state === 'now' ? 'border-ink bg-ink text-white' : s.state === 'done' ? 'border-line bg-white text-ink' : 'border-line bg-canvas text-subtle'
              }`}
            >
              {s.state === 'done' ? (
                <svg viewBox="0 0 12 12" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <div className={`rounded-card border bg-white p-5 ${s.state === 'now' ? 'border-ink' : 'border-line'}`}>
              <div className="flex items-center gap-3">
                <h3 className={`text-title font-bold ${s.state === 'next' ? 'text-muted' : 'text-ink'}`}>{s.title}</h3>
                <span className={`ml-auto rounded-pill border px-3 py-1 text-caption font-medium ${badge[s.state]}`}>
                  {s.state === 'now' ? 'Now' : s.state === 'done' ? 'Done' : 'Next'}
                </span>
              </div>
              <p className="mt-2 text-sm text-body">{s.detail}</p>
              <p className="mt-3 text-caption text-muted">{s.output}</p>
            </div>
          </li>
        ))}
      </ol>
    </PageFrame>
  );
}
