export type MilestoneState = 'done' | 'next' | 'later';

export interface Milestone {
  id: string;
  label: string;
  state: MilestoneState;
}

/** Build milestones, in order. Update a state here as work lands; the build plan's strip reads it. */
export const MILESTONES: Milestone[] = [
  { id: 'M1', label: 'Data model + car statuses', state: 'later' },
  { id: 'M2', label: 'Trade-in + Back office', state: 'later' },
  { id: 'M3', label: 'Inspector + re-price loop', state: 'later' },
  { id: 'M4', label: 'Ops board + journey', state: 'later' },
];
