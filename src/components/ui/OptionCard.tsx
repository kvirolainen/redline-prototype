interface Props {
  title: string;
  helper?: string;
  selected?: boolean;
  multi?: boolean;
  onClick?: () => void;
}

// Full-width bordered answer card, as in Clutch's sell flow. Selected = black border + black control.
export function OptionCard({ title, helper, selected, multi, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-start justify-between gap-4 rounded-card border bg-white px-4 py-4 text-left transition-colors ${
        selected ? 'border-ink' : 'border-line hover:border-subtle'
      }`}
    >
      <span>
        <span className={`block text-base text-ink ${helper ? 'font-medium' : ''}`}>{title}</span>
        {helper && <span className="mt-1 block text-sm text-muted">{helper}</span>}
      </span>
      <span
        className={`mt-1 grid size-[18px] shrink-0 place-items-center border ${multi ? 'rounded-xs' : 'rounded-full'} ${
          selected ? 'border-ink bg-ink' : 'border-subtle bg-white'
        }`}
      >
        {selected &&
          (multi ? (
            <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2.5 6.5l2.5 2.5 4.5-5" />
            </svg>
          ) : (
            <span className="size-2 rounded-full bg-white" />
          ))}
      </span>
    </button>
  );
}
