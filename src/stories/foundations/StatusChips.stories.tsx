import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusChip } from '../../components/ui/StatusChip';
import { STATUS, STATUS_ORDER } from '../../domain/statuses';
import { Group, Page } from './Specimen';

function StatusChips() {
  return (
    <Page
      title="Status chips"
      intro="One chip per car status. Neutral pills with a dot; yellow only where a person has to act; green only for paid."
    >
      <Group label="All statuses">
        <div className="divide-y divide-line-light rounded-panel border border-line bg-white">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="grid grid-cols-[200px_1fr_auto] items-center gap-6 px-6 py-3">
              <StatusChip status={s} />
              <span className="text-sm text-muted">{STATUS[s].hint}</span>
              <code className="text-caption text-subtle">{s}</code>
            </div>
          ))}
        </div>
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Status chips', component: StatusChips, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof StatusChips>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
