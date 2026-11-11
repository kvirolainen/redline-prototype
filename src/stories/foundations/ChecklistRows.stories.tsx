import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChecklistRow } from '../../components/ui/ChecklistRow';
import { Group, Page } from './Specimen';

function Checklist() {
  return (
    <Page title="Inspection checklist rows" intro="After Clutch's inspection report rows, with what the dealer declared next to what the inspector found.">
      <Group label="Body">
        <div className="max-w-[720px] overflow-hidden rounded-card border border-line">
          <ChecklistRow question="All body gaps are appropriate" result="pass" />
          <ChecklistRow question="All doors open and close properly" result="pass" />
          <ChecklistRow
            question="Any scratches, dings, or dents on rear bumper cover or trunk area?"
            declared="No exterior damage"
            finding="Rear bumper scuff, larger than a golf ball"
            result="flag"
            adjustment={600}
          />
          <ChecklistRow question="Any damage to rims?" declared="None" result="pass" />
          <ChecklistRow question="Number of keys" declared="2" result="pending" />
        </div>
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Checklist rows', component: Checklist, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Checklist>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
