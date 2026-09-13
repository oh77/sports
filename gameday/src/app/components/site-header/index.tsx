import Link from 'next/link';

type Section = 'games' | 'favorites' | 'teams';

const LINKS: { section: Section; href: string; label: string }[] = [
  { section: 'games', href: '/', label: 'Matcher' },
  { section: 'favorites', href: '/favorites', label: 'Favoriter' },
  { section: 'teams', href: '/teams', label: 'Lag' },
];

export function SiteHeader({ current }: { current: Section }) {
  return (
    <header className="border-b border-line-strong">
      <div className="mx-auto flex h-[60px] max-w-4xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="display text-xl font-bold uppercase tracking-[0.12em]"
        >
          Gameday
        </Link>
        <nav aria-label="Huvudmeny">
          <ul className="flex gap-5 text-sm">
            {LINKS.map(({ section, href, label }) => (
              <li key={section}>
                <Link
                  href={href}
                  aria-current={section === current ? 'page' : undefined}
                  className={
                    section === current
                      ? 'font-semibold text-ink'
                      : 'text-dim transition-colors hover:text-ink'
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
