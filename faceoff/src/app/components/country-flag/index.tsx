import type React from 'react';

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code, e.g. "SE". */
  country: string;
  /** Accessible name and tooltip; defaults to the upper-cased country code. */
  label?: string;
  className?: string;
}

/**
 * Country flag from an ISO 3166-1 alpha-2 code, via flag-icons. Falls back to a
 * text badge for anything that isn't a two-letter code.
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({
  country,
  label,
  className,
}) => {
  const code = country.trim().toLowerCase();
  const name = label ?? country.toUpperCase();
  if (!/^[a-z]{2}$/.test(code)) {
    return (
      <span
        className="rounded bg-surface-3 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em] text-soft"
        title={name}
      >
        {country}
      </span>
    );
  }
  return (
    <span
      className={`fi fi-${code} rounded-[3px] ring-1 ring-line/60 ${className ?? ''}`}
      role="img"
      aria-label={name}
      title={name}
    />
  );
};
