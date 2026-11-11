import type { PersonaId } from './personas';

export interface JourneyStep {
  id: string;
  title: string;
  detail: string;
  owner: PersonaId;
  branch?: 'match' | 'mismatch';
  outcome?: 'good' | 'stop';
}

// One car's path, with the inspection fork.
export const JOURNEY_MAIN: JourneyStep[] = [
  { id: 'offer', title: 'Offer', detail: 'VIN, km, condition → firm offer vs auction estimate', owner: 'maria' },
  { id: 'accepted', title: 'Accepted', detail: "Joins the dealer's recurring pickup day", owner: 'maria' },
  { id: 'pickup', title: 'Pickup day', detail: 'Runs grouped by day × dealer', owner: 'jordan' },
  { id: 'inspection', title: 'Inspection', detail: '15-minute check against what was declared', owner: 'sam' },
];

export const JOURNEY_MATCH: JourneyStep[] = [
  { id: 'paid', title: 'Paid', detail: 'Confirmed → picked up → paid', owner: 'sam', branch: 'match', outcome: 'good' },
];

export const JOURNEY_MISMATCH: JourneyStep[] = [
  { id: 'reprice', title: 'Re-price', detail: 'New price with a reason, e.g. −$600 bumper', owner: 'sam', branch: 'mismatch' },
  { id: 'director', title: 'Director decides', detail: 'Accept → picked up and paid', owner: 'dave', branch: 'mismatch', outcome: 'good' },
  { id: 'declined', title: 'Declined', detail: 'Car stays with the dealer', owner: 'dave', branch: 'mismatch', outcome: 'stop' },
];
