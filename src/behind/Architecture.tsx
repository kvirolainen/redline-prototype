import { CenteredPage, Connector, FlowNode } from './flow';

const POINTS = [
  'Live hand-off: Sam re-prices on a phone and Dave’s table updates without a refresh, because Convex queries are live by default.',
  'Database, server functions and real-time sync in one service, so there’s no API layer or socket server to build.',
  'Pricing is one isolated module with a labelled placeholder; Clutch’s real valuation engine plugs in there.',
];

export function ArchitecturePage() {
  return (
    <CenteredPage title="Architecture, simplified" intro="One app, one shared live backend. A change on one screen shows on every other screen.">
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-[880px] items-start">
          <FlowNode shape="tile" icon="devices" label="Phone and laptop screens" sub="Four people, one screen each" width="w-[168px]" />
          <Connector arrow />
          <FlowNode shape="tile" icon="cloud" label="React app on Vercel" sub="One app for everyone" width="w-[168px]" />
          <Connector arrow label="live" />
          <FlowNode shape="tile" icon="database" label="Convex" sub="Live database and server functions" width="w-[168px]" />
          <Connector arrow dashed />
          <FlowNode shape="tile" tone="stub" icon="calculator" label="Pricing stub" sub="Placeholder for Clutch’s engine" width="w-[168px]" />
        </div>
      </div>

      <ul className="mx-auto mt-16 max-w-[600px] space-y-4">
        {POINTS.map((p) => (
          <li key={p} className="flex gap-3 text-base text-body">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink" />
            {p}
          </li>
        ))}
      </ul>
    </CenteredPage>
  );
}
