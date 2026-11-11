import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarTable } from '../../components/ui/CarTable';
import { SAMPLE_CARS } from '../../domain/sampleCars';
import { Group, Page } from './Specimen';

function Table() {
  const [sel, setSel] = useState<string>();
  return (
    <Page title="Table rows" intro="Back-office car table: 16px panel, hairline rows, clickable with a chevron.">
      <Group label="Cars">
        <CarTable rows={SAMPLE_CARS} selected={sel} onSelect={setSel} />
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Table rows', component: Table, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Table>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
