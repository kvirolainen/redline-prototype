import type { PersonaId } from './personas';

export type JourneyStepId = 'offer' | 'accepted' | 'pickup' | 'inspection' | 'paid' | 'reprice' | 'director';

export interface JourneyStep {
  id: JourneyStepId;
  title: string;
  detail: string;
  owner: PersonaId;
}

// One car's path. The main row runs offer → paid; the only fork is at inspection, when the car
// doesn't match what was declared: the inspector re-prices and the director decides.
export const JOURNEY_MAIN: JourneyStep[] = [
  { id: 'offer', title: 'Instant offer', detail: 'Firm number at the desk', owner: 'maria' },
  { id: 'accepted', title: 'Accepted', detail: 'Joins the next pickup day', owner: 'maria' },
  { id: 'pickup', title: 'Pickup day', detail: 'One weekly run per dealer', owner: 'jordan' },
  { id: 'inspection', title: 'Inspection', detail: '15-minute check vs declared', owner: 'sam' },
  { id: 'paid', title: 'Paid', detail: 'Picked up, dealer paid', owner: 'sam' },
];

export const JOURNEY_FORK: JourneyStep[] = [
  { id: 'reprice', title: 'Re-price', detail: 'New price with a reason', owner: 'sam' },
  { id: 'director', title: 'Director decides', detail: 'Declines: car stays with the dealer', owner: 'dave' },
];
