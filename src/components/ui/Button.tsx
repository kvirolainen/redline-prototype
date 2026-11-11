import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'marketing' | 'outline' | 'ghost' | 'dark-small';

const styles: Record<Variant, string> = {
  // In-product primary: black pill (Clutch's sell flow uses black, not red, inside the flow).
  primary: 'h-12 px-6 bg-ink text-white hover:bg-body disabled:bg-line-light disabled:text-subtle',
  // Marketing CTA only: red gradient.
  marketing: 'h-14 px-16 text-xl bg-cta text-white hover:bg-none hover:bg-brand active:scale-[1.01] disabled:bg-cta-disabled',
  outline: 'h-12 px-6 bg-white text-ink border border-line hover:border-ink',
  ghost: 'h-12 px-4 text-body hover:underline',
  'dark-small': 'h-8 px-3 text-caption font-medium bg-ink text-white hover:bg-body',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-bold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
