export type PersonaId = 'maria' | 'dave' | 'sam' | 'jordan';
export type ModuleId = 'trade-in' | 'back-office' | 'inspector' | 'ops-board';

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
    id: 'sam', name: 'Sam', role: 'Inspector', org: 'Clutch', side: 'Clutch',
    module: 'inspector',
    need: "Today's cars and a quick way to confirm or flag a difference",
  },
  {
    id: 'jordan', name: 'Jordan', role: 'Ops', org: 'Clutch', side: 'Clutch',
    module: 'ops-board',
    need: "Every dealer's pickup runs in one place, plus the exceptions",
  },
];

export const MODULES: Record<ModuleId, { label: string; summary: string; device: 'desktop' | 'phone' }> = {
  'trade-in': { label: 'Trade-in', summary: 'Car details → Clutch offer next to the auction estimate', device: 'desktop' },
  'back-office': { label: 'Back office', summary: "The dealer's cars, re-price approvals and a value strip", device: 'desktop' },
  inspector: { label: 'Inspector', summary: "Today's run → cars → checklist vs declared → confirm or re-price", device: 'phone' },
  'ops-board': { label: 'Ops board', summary: 'Pickup runs by day × dealer, and exceptions', device: 'desktop' },
};

export const persona = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!;

/** "Maria, Sales manager" / "Sam, Clutch inspector": the second line under a module name. */
export const personaLine = (p: Persona) =>
  `${p.name}, ${p.side === 'Clutch' ? `Clutch ${p.role.toLowerCase()}` : p.role[0] + p.role.slice(1).toLowerCase()}`;
