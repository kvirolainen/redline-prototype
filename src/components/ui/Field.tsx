import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  error?: string;
  nudge?: string;
  shape?: 'flow' | 'pill';
}

// Flow inputs are 56px with an 8px radius and a light outline that darkens on hover.
// Pill inputs are used on marketing forms (plate / postal code row).
export function Field({ label, suffix, error, nudge, shape = 'flow', className = '', ...props }: Props) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-2 block text-base text-body">{label}</span>}
      <span
        className={`flex h-14 items-center border bg-white px-4 transition-colors ${
          shape === 'pill' ? 'rounded-pill px-6' : 'rounded-card'
        } ${error ? 'border-error' : 'border-line-light hover:border-body focus-within:border-ink'}`}
      >
        <input className="h-full w-full bg-transparent text-base text-ink outline-none placeholder:text-subtle" {...props} />
        {suffix && <span className="ml-2 text-base text-subtle">{suffix}</span>}
      </span>
      {error && <span className="mt-1 block text-caption font-medium text-error">{error}</span>}
      {nudge && <span className="mt-2 block rounded-card bg-nudge px-4 py-3 text-sm text-body">{nudge}</span>}
    </label>
  );
}
