// Simple line icons for the diagrams. 24px grid, 1.5px stroke, drawn here so they match each other.
const PATHS = {
  tag: 'M3 12.2V4h8.2l9 9-8.2 8.2-9-9zM7.5 8.5h.01',
  thumbsUp: 'M7 11v9H4v-9h3zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9h5a2 2 0 012 2.3l-1.2 6.5A2 2 0 0117.3 20H7',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3',
  clipboard: 'M8 4h8v3H8zM6 5.5H5v15h14v-15h-1M9 12l2 2 4-4M9 17h6',
  paid: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6.5v11',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4',
  person: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c1-4 4-6 8-6s7 2 8 6',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM16 16l4.5 4.5',
  doc: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  map: 'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  devices: 'M3 5h13v10H3zM1 18h17M18 9h4v11h-4z',
  cloud: 'M7 18a4 4 0 010-8 5.5 5.5 0 0110.6-1.5A4.5 4.5 0 0117.5 18z',
  database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  calculator: 'M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'size-6' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
