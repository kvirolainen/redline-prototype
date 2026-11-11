import { STATUS, type CarStatus } from '../../domain/statuses';
import { Tag } from './Tag';

/** A car's status in the shared language: plain text, a green check once it's done, and the yellow pill only when
 *  someone needs to act. Black stays for actions and selected states. */
export function StatusChip({ status }: { status: CarStatus }) {
  const s = STATUS[status];
  if (s.tone === 'attention') return <Tag>{s.label}</Tag>;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm whitespace-nowrap ${s.tone === 'closed' ? 'text-muted' : 'text-body'}`}>
      {s.tone === 'done' && (
        <span aria-hidden className="font-bold text-success">
          ✓
        </span>
      )}
      {s.label}
    </span>
  );
}
