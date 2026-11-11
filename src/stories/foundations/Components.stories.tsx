import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { CarTable } from '../../components/ui/CarTable';
import { ChecklistRow } from '../../components/ui/ChecklistRow';
import { Field } from '../../components/ui/Field';
import { OfferCard as FirmOfferCard } from '../../components/ui/OfferCard';
import { OptionCard } from '../../components/ui/OptionCard';
import { StatusChip } from '../../components/ui/StatusChip';
import { SegmentedProgress, Stepper as FlowStepper } from '../../components/ui/Stepper';
import { SAMPLE_CARS } from '../../domain/sampleCars';
import { STATUS, STATUS_ORDER } from '../../domain/statuses';
import { Group, Page } from './Specimen';

// Foundations / Components: the shared UI pieces from src/components/ui, one story each.

function ButtonsSpecimen() {
  return (
    <Page
      title="Buttons"
      intro="All buttons are 32px pills. Inside the product the primary action is black; the red gradient is kept for marketing CTAs, as on clutch.ca."
    >
      <Group label="In product" note="Black primary, outline secondary, a text “Back” link.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Continue</Button>
          <Button>Get offer</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="ghost">← Back</Button>
          <Button disabled>Continue</Button>
        </div>
      </Group>
      <Group label="Small dark pill" note="Card headers and table actions.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="dark-small">Approve</Button>
          <Button variant="dark-small">Open car</Button>
        </div>
      </Group>
      <Group label="Marketing CTA" note="Red gradient. Landing pages only — never inside a flow.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="marketing">Get instant offer</Button>
          <Button variant="marketing" disabled>
            Get instant offer
          </Button>
        </div>
      </Group>
      <Group label="Segmented control">
        <div className="inline-flex rounded-pill bg-line-light p-1 text-sm font-medium">
          <span className="rounded-pill bg-white px-4 py-2 text-ink">VIN</span>
          <span className="px-4 py-2 text-muted">Licence plate</span>
        </div>
      </Group>
    </Page>
  );
}

function InputsSpecimen() {
  return (
    <Page title="Inputs" intro="56px fields. Light #EEEEEE outline at rest, dark on hover. Errors in red under the field; soft nudges in a pale-yellow panel.">
      <div className="grid gap-10 md:grid-cols-2">
        <Group label="Flow fields">
          <div className="space-y-6">
            <Field label="What's the approximate mileage on the car?" suffix="km" placeholder="68,400" />
            <Field label="VIN" defaultValue="2HGFC2F69KH512345" />
            <Field label="Mileage" suffix="km" error="Required" />
            <Field
              label="Mileage"
              suffix="km"
              defaultValue="600,000"
              nudge="Hmmm, that looks high for the car's age. Make sure it's right so the offer holds at pickup."
            />
          </div>
        </Group>
        <Group label="Pill row (landing forms)">
          <div className="flex flex-wrap items-center gap-3 rounded-[32px] border border-line bg-white p-4">
            <Field shape="pill" placeholder="VIN or licence plate" className="min-w-[240px] flex-1" />
            <Button variant="marketing" className="!h-14 !px-8 !text-base">
              Get offer
            </Button>
          </div>
        </Group>
      </div>
    </Page>
  );
}

const DAMAGE: { id: string; title: string; helper?: string }[] = [
  { id: 'minor', title: 'Minor cosmetic damage', helper: 'Smaller than a golf ball' },
  { id: 'moderate', title: 'Moderate damage', helper: 'Larger than a golf ball' },
  { id: 'glass', title: 'Chipped or cracked glass' },
  { id: 'none', title: 'No exterior damage' },
];

function OptionCardsSpecimen() {
  const [damage, setDamage] = useState('minor');
  const [features, setFeatures] = useState<string[]>(['rims']);
  const toggle = (f: string) => setFeatures((xs) => (xs.includes(f) ? xs.filter((x) => x !== f) : [...xs, f]));
  return (
    <Page title="Option cards" intro="Every answer is a full-width bordered card. Selected is a black border with a black control — not red.">
      <div className="grid gap-10 md:grid-cols-2">
        <Group label="Single choice" note="Does the vehicle have any exterior damage?">
          <div className="space-y-3">
            {DAMAGE.map((d) => (
              <OptionCard key={d.id} title={d.title} helper={d.helper} selected={damage === d.id} onClick={() => setDamage(d.id)} />
            ))}
          </div>
        </Group>
        <Group label="Multiple choice" note="Select any additional features the car has">
          <div className="space-y-3">
            {[
              ['rims', 'Aftermarket rims'],
              ['wrap', 'Coloured wrap'],
              ['exhaust', 'Exhaust'],
              ['stereo', 'Stereo'],
            ].map(([id, t]) => (
              <OptionCard key={id} multi title={t} selected={features.includes(id)} onClick={() => toggle(id)} />
            ))}
          </div>
        </Group>
      </div>
    </Page>
  );
}

const STEPS = ['Basic Info', 'Features', 'Condition', 'Offer'];

function StepperSpecimen() {
  const [i, setI] = useState(1);
  return (
    <Page title="Stepper" intro="Header breadcrumb with a thin black progress line, as in the sell flow. The dialog variant is a segmented bar.">
      <Group label="Flow header">
        <div className="overflow-hidden rounded-card border border-line">
          <FlowStepper steps={STEPS} current={i} />
          <div className="flex items-center justify-between bg-canvas px-6 py-6">
            <Button variant="ghost" onClick={() => setI(Math.max(0, i - 1))}>
              ← Back
            </Button>
            <Button onClick={() => setI(Math.min(STEPS.length - 1, i + 1))}>Continue</Button>
          </div>
        </div>
      </Group>
      <Group label="Segmented progress (dialogs)">
        <div className="max-w-[440px] rounded-panel border border-line bg-white p-6">
          <SegmentedProgress total={4} done={i + 1} />
          <p className="mt-4 text-title font-bold text-ink">{STEPS[i]}</p>
        </div>
      </Group>
    </Page>
  );
}

function StatusChipsSpecimen() {
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

function OfferCardSpecimen() {
  return (
    <Page title="Offer card" intro="Clutch's “Here's your firm offer” card, plus what a dealer needs: the gap to the auction estimate and how long it holds.">
      <div className="grid gap-10 md:grid-cols-2">
        <Group label="Firm offer">
          <h3 className="mb-6 text-center text-h4 font-bold text-ink">Here's your firm offer</h3>
          <FirmOfferCard
            amount={17850}
            auctionEstimate={16000}
            validUntil="Wed Nov 18"
            car="2019 Honda Civic EX"
            vin="2HGFC2F69KH512345"
            km={68400}
            reference="R-YH-0412"
          />
        </Group>
        <Group label="Guaranteed floor" note="When the calculator isn't confident: a floor now, the firm offer the same business day.">
          <h3 className="mb-6 text-center text-h4 font-bold text-ink">Your guaranteed floor</h3>
          <div className="rounded-card border border-line bg-white px-6 py-8 text-center">
            <p className="text-base text-ink">Guaranteed at least</p>
            <p className="mt-3 text-price font-bold text-ink">$15,500</p>
            <p className="mx-auto mt-3 max-w-[360px] text-sm text-muted">
              Close the deal now. Your firm offer lands in the back office by 5 pm today and won't go below this number.
            </p>
          </div>
        </Group>
      </div>
    </Page>
  );
}

function ChecklistRowsSpecimen() {
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

function TableRowSpecimen() {
  const [sel, setSel] = useState<string>();
  return (
    <Page title="Table rows" intro="Back-office car table: 16px panel, hairline rows, clickable with a chevron.">
      <Group label="Cars">
        <CarTable rows={SAMPLE_CARS} selected={sel} onSelect={setSel} />
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Components', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = { render: () => <ButtonsSpecimen /> };
export const Inputs: Story = { render: () => <InputsSpecimen /> };
export const OptionCards: Story = { name: 'Option cards', render: () => <OptionCardsSpecimen /> };
export const Stepper: Story = { render: () => <StepperSpecimen /> };
export const StatusChips: Story = { name: 'Status chips', render: () => <StatusChipsSpecimen /> };
export const OfferCard: Story = { name: 'Offer card', render: () => <OfferCardSpecimen /> };
export const ChecklistRows: Story = { name: 'Checklist rows', render: () => <ChecklistRowsSpecimen /> };
export const TableRow: Story = { name: 'Table row', render: () => <TableRowSpecimen /> };
