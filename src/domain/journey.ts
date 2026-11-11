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
  { id: 'offer', title: 'Instant offer', detail: 'Firm number at the desk', owner: 'maria' },
  { id: 'accepted', title: 'Accepted', detail: 'Joins the next pickup day', owner: 'maria' },
  { id: 'pickup', title: 'Pickup day', detail: 'One weekly run per dealer', owner: 'jordan' },
  { id: 'inspection', title: 'Inspection', detail: '15-minute check vs declared', owner: 'sam' },
  { id: 'paid', title: 'Paid', detail: 'Picked up, dealer paid', owner: 'sam' },
];

/** The one fork, drawn as an arc from inspection over to paid: the car doesn't match what was declared,
 *  the inspector re-prices and the director decides. */
export const JOURNEY_MISMATCH = {
  path: 'Doesn’t match → re-price → director accepts',
  exit: 'Declines: car stays with the dealer',
} as const;
