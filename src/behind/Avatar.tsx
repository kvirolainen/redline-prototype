import { persona, type PersonaId } from '../domain/personas';

export function Avatar({ id, size = 'md', active }: { id: PersonaId; size?: 'sm' | 'md' | 'lg'; active?: boolean }) {
  const p = persona(id);
  const dims = { sm: 'size-6 text-caption', md: 'size-8 text-sm', lg: 'size-12 text-title' }[size];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold ${dims} ${
        active ? 'bg-ink text-white' : p.side === 'Clutch' ? 'bg-brand-tint text-brand-dark' : 'bg-line-light text-ink'
      }`}
      aria-hidden
    >
      {p.name[0]}
    </span>
  );
}
