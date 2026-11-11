export type BehindPageId = 'journey' | 'process' | 'architecture' | 'docs';

export const BEHIND_PAGES: { id: BehindPageId; label: string; hint: string }[] = [
  { id: 'journey', label: 'Car journey', hint: 'One car, who owns each step' },
  { id: 'process', label: 'Process', hint: 'How this was made' },
  { id: 'architecture', label: 'Architecture', hint: 'React + Convex, simplified' },
  { id: 'docs', label: 'Docs', hint: 'Concept, plan, decisions' },
];
