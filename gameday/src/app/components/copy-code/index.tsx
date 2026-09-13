'use client';

import { useEffect, useRef, useState } from 'react';

/** How long the "copied" confirmation stays visible. */
const FEEDBACK_MS = 1500;

type Props = {
  code: string;
  /** Show a trailing copy icon (swapped for a check mark once copied). */
  icon?: boolean;
};

/** A code that copies itself to the clipboard on click. */
export function CopyCode({ code, icon = false }: Props) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard API unavailable (e.g. a non-HTTPS origin): select the code
      // so it can be copied by hand.
      if (codeRef.current) {
        window.getSelection()?.selectAllChildren(codeRef.current);
      }
    }
  }

  const check = (
    <span aria-hidden="true" className="text-accent">
      ✓
    </span>
  );

  return (
    <>
      <button
        type="button"
        onClick={copy}
        title="Kopiera"
        className={`flex shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 font-sans text-xs font-normal normal-case tracking-normal text-ink transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
          copied ? 'bg-accent/25' : 'bg-surface-3 hover:bg-line-strong'
        }`}
      >
        {!icon && copied && check}
        <code ref={codeRef}>{code}</code>
        {icon && (copied ? check : <CopyIcon />)}
        <span className="sr-only">, kopiera</span>
      </button>
      <span role="status" className="sr-only">
        {copied ? `Kopierat ${code}` : ''}
      </span>
    </>
  );
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-dim"
    >
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h.5" />
    </svg>
  );
}
