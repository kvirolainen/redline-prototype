import { CenteredPage, Connector, FlowNode } from './flow';

const POINTS = [
  'Live hand-off: Sam re-prices on a phone and Dave’s table updates without a refresh, because Convex queries are live by default.',
  'Database, server functions and real-time sync in one service, so there’s no API layer or socket server to build.',
  'Pricing is one isolated module with a labelled placeholder; Clutch’s real valuation engine plugs in there.',
];

/** The simplified system diagram and the reasons for Convex. `compact` keeps it inside a ~680px doc column. */
export function ArchitectureDiagram({ compact }: { compact?: boolean }) {
  const width = compact ? 'w-[120px] lg:w-[136px]' : 'w-[136px] lg:w-[168px]';
  return (
    <>
      <div className="pb-2">
        <div className="mx-auto flex w-full max-w-[880px] items-start">
          <FlowNode shape="tile" icon="devices" label="Phone and laptop screens" sub="Four people, one screen each" width={width} />
          <Connector arrow />
          <FlowNode shape="tile" icon="cloud" label="React app on Vercel" sub="One app for everyone" width={width} />
          <Connector arrow label="live" />
          <FlowNode shape="tile" icon="database" label="Convex" sub="Live database and server functions" width={width} />
          <Connector arrow dashed />
          <FlowNode shape="tile" tone="stub" icon="calculator" label="Pricing stub" sub="Placeholder for Clutch’s engine" width={width} />
        </div>
      </div>

      <ul className={`mx-auto max-w-[600px] space-y-4 ${compact ? 'mt-10' : 'mt-16'}`}>
        {POINTS.map((p) => (
          <li key={p} className="flex gap-3 text-base text-body">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink" />
            {p}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Architecture as a standalone page. In the app it is embedded in the Architecture doc instead. */
export function Architecture() {
  return (
    <CenteredPage title="Architecture, simplified" intro="One app, one shared live backend. A change on one screen shows on every other screen.">
      <ArchitectureDiagram />
    </CenteredPage>
  );
}
