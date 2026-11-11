export type PersonaId = 'maria' | 'jordan' | 'sam' | 'dave';
export type ModuleId = 'trade-in' | 'ops-board' | 'inspector' | 'back-office';

// One person, one module: each persona sees exactly one screen.
export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  org: string;
  side: 'Dealer' | 'Clutch';
  module: ModuleId;
  need: string;
}

// Dealership-facing modules first, then Clutch's: Trade-in → Back office → Clutch ops → Clutch inspector. Every list uses this order.
export const PERSONAS: Persona[] = [
  {
    id: 'maria', name: 'Maria', role: 'Sales Manager', org: 'Yorkdale Honda', side: 'Dealer',
    module: 'trade-in',
    need: 'A firm number at the desk while the customer is still there',
  },
  {
    id: 'dave', name: 'Dave', role: 'Sales Director', org: 'Yorkdale Honda', side: 'Dealer',
    module: 'back-office',
    need: 'Confidence in the price, and a say when it changes',
  },
  {
    id: 'jordan', name: 'Jordan', role: 'Operations', org: 'Clutch', side: 'Clutch',
    module: 'ops-board',
    need: "Every dealer's pickup runs in one place, plus the exceptions",
  },
  {
    id: 'sam', name: 'Sam', role: 'Inspector', org: 'Clutch', side: 'Clutch',
    module: 'inspector',
    need: "Today's cars and a quick way to confirm or flag a difference",
  },
];

export const MODULES: Record<ModuleId, { label: string; summary: string; device: 'desktop' | 'phone' }> = {
  'trade-in': { label: 'Trade-in', summary: 'Car details → Clutch offer next to the auction estimate', device: 'desktop' },
  'ops-board': { label: 'Clutch ops', summary: 'Pickup runs by day × dealer, and exceptions', device: 'desktop' },
  inspector: { label: 'Clutch inspector', summary: "Today's run → cars → checklist vs declared → confirm or re-price", device: 'phone' },
  'back-office': { label: 'Back office', summary: "Dave's decisions and results; Maria's pickups and readiness", device: 'desktop' },
};

export const persona = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!;

/** "Maria, Sales manager" / "Jordan, Operations": the second line under a module name. The Clutch modules already
 *  say "Clutch", so it isn't repeated here. */
export const personaLine = (p: Persona) => `${p.name}, ${p.role[0] + p.role.slice(1).toLowerCase()}`;
