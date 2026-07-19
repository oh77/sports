import { LeagueTiles } from './components/league-tiles';
import { UpcomingAllLeagues } from './components/upcoming-all-leagues';

export default function Home() {
  return (
    <main className="min-h-screen bg-bg px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <LeagueTiles />

        <section className="mx-auto mt-12 max-w-2xl">
          <h2 className="display mb-3 text-center text-sm font-bold uppercase tracking-[0.1em] text-mute">
            Kommande matcher
          </h2>
          <UpcomingAllLeagues limit={10} />
        </section>
      </div>
    </main>
  );
}
