import { CenteredPage, Connector, FlowNode } from './flow';

/** The system in three nodes: the app in each person's browser, Convex, and the pricing stub. `compact` fits a ~680px doc column. */
export function ArchitectureDiagram({ compact }: { compact?: boolean }) {
  const width = compact ? 'w-[132px] lg:w-[152px]' : 'w-[152px] lg:w-[184px]';
  return (
    <div className="mx-auto flex w-full max-w-[720px] items-start">
      <FlowNode shape="tile" icon="devices" label="The Redline app" sub="React, in each person’s browser" width={width} />
      <Connector arrow both label="saves · live updates" />
      <FlowNode shape="tile" icon="database" label="Convex" sub="Database and server functions" width={width} />
      <Connector arrow dashed label="asks for a price" quiet />
      <FlowNode shape="tile" tone="stub" icon="calculator" label="Pricing stub" sub="Where Clutch’s engine plugs in" width={width} />
    </div>
  );
}

/** Architecture as a standalone page. In the app it is embedded in the Architecture doc instead. */
export function Architecture() {
  return (
    <CenteredPage title="Architecture, simplified" intro="One app, one live backend. A change saved on one screen shows on every other screen.">
      <ArchitectureDiagram />
    </CenteredPage>
  );
}
