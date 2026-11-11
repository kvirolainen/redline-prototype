export type PersonaId = 'maria' | 'dave' | 'sam' | 'jordan';
export type ModuleId = 'trade-in' | 'back-office' | 'inspector' | 'ops-board';

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  org: string;
  side: 'Dealer' | 'Clutch';
  modules: ModuleId[];
  need: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'maria', name: 'Maria', role: 'Sales Manager', org: 'Yorkdale Honda', side: 'Dealer',
    modules: ['trade-in', 'back-office'],
    need: 'A firm number at the desk while the customer is still there',
  },
  {
    id: 'dave', name: 'Dave', role: 'Sales Director', org: 'Yorkdale Honda', side: 'Dealer',
    modules: ['back-office'],
    need: 'Confidence in the price, and a say when it changes',
  },
  {
    id: 'sam', name: 'Sam', role: 'Inspector', org: 'Clutch', side: 'Clutch',
    modules: ['inspector'],
    need: "Today's cars and a quick way to confirm or flag a difference",
  },
  {
    id: 'jordan', name: 'Jordan', role: 'Ops', org: 'Clutch', side: 'Clutch',
    modules: ['ops-board'],
    need: "Every dealer's pickup runs in one place, plus the exceptions",
  },
];

export const MODULES: Record<ModuleId, { label: string; summary: string; device: 'desktop' | 'phone' }> = {
  'trade-in': { label: 'Trade-in', summary: 'Car details → Clutch offer next to the auction estimate', device: 'desktop' },
  'back-office': { label: 'Back office', summary: "Dealer's cars, timelines, re-price approvals, value strip", device: 'desktop' },
  inspector: { label: 'Inspector', summary: "Today's run → cars → checklist vs declared → confirm or re-price", device: 'phone' },
  'ops-board': { label: 'Ops board', summary: 'Pickup runs by day × dealer, and exceptions', device: 'desktop' },
};

export const persona = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!;
