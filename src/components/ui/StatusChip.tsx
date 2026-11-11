import { STATUS, type CarStatus, type StatusTone } from '../../domain/statuses';

const dot: Record<StatusTone, string> = {
  neutral: 'bg-subtle',
  active: 'bg-ink',
  attention: 'bg-warning',
  done: 'bg-success',
  closed: 'bg-line',
};

export function StatusChip({ status }: { status: CarStatus }) {
  const s = STATUS[status];
  const closed = s.tone === 'closed';
  return (
    <span
      className={`inline-flex h-7 items-center gap-2 rounded-pill border px-3 text-caption font-medium whitespace-nowrap ${
        s.tone === 'attention' ? 'border-warning bg-nudge text-ink' : 'border-line bg-white'
      } ${closed ? 'text-muted' : 'text-ink'}`}
    >
      <span className={`size-2 rounded-full ${dot[s.tone]}`} />
      {s.label}
    </span>
  );
}
