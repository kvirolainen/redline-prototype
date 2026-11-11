export type CheckResult = 'pass' | 'flag' | 'pending';

interface Props {
  question: string;
  declared?: string;
  finding?: string;
  result: CheckResult;
  adjustment?: number;
}

// Inspection checklist row, after Clutch's 210-point report rows, plus "declared" vs what Sam found.
export function ChecklistRow({ question, declared, finding, result, adjustment }: Props) {
  return (
    <div className={`flex items-start gap-4 border-b border-line px-4 py-3 last:border-b-0 ${result === 'flag' ? 'bg-nudge' : 'bg-white'}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{question}</p>
        {declared && <p className="mt-0.5 text-sm text-muted">Declared: {declared}</p>}
        {finding && <p className="mt-0.5 text-sm text-body">Found: {finding}</p>}
      </div>
      {adjustment !== undefined && <span className="text-sm font-bold text-ink">−${Math.abs(adjustment)}</span>}
      <ResultIcon result={result} />
    </div>
  );
}

function ResultIcon({ result }: { result: CheckResult }) {
  if (result === 'pending') return <span className="size-6 shrink-0 rounded-full border border-line" aria-label="Not checked" />;
  if (result === 'flag')
    return (
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-warning text-sm font-bold text-ink" aria-label="Difference">
        !
      </span>
    );
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success" aria-label="Matches">
      <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2.5 6.5l2.5 2.5 4.5-5" />
      </svg>
    </span>
  );
}
