import type { PersonaId } from './personas';

export type JourneyStepId = 'offer' | 'accepted' | 'pickup' | 'inspection' | 'paid';

export interface JourneyStep {
  id: JourneyStepId;
  title: string;
  detail: string;
  owner: PersonaId;
}

// One car's path, offer → paid. The only fork is at inspection (JOURNEY_MISMATCH).
export const JOURNEY_MAIN: JourneyStep[] = [
  { id: 'offer', title: 'Instant offer', detail: 'Firm price at the desk', owner: 'maria' },
  { id: 'accepted', title: 'Accepted', detail: 'Joins next pickup', owner: 'maria' },
  { id: 'pickup', title: 'Pickup day', detail: 'Weekly run per dealer', owner: 'jordan' },
  { id: 'inspection', title: 'Inspection', detail: 'Checked vs declared', owner: 'sam' },
  { id: 'paid', title: 'Paid', detail: 'Dealer gets paid', owner: 'sam' },
];

/** The one fork, drawn as a detour arc from inspection over to paid: the car doesn't match what was declared, the
 *  inspector re-prices and the director decides. Accepts → paid; declines → the car stays with the dealer. */
export const JOURNEY_MISMATCH = {
  up: 'Doesn’t match',
  step: 'Re-price, director decides',
  down: 'Accepts',
  exit: 'Declines: stays with the dealer',
} as const;
