
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <main className="min-h-screen bg-nexora-bg text-white">
      <Navbar />

      <section
        id="home"
        className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24 sm:px-10 lg:px-20"
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(139,92,246,0.15),transparent_45%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1440px]">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
            <span className="h-px w-8 bg-violet-400" />
            A new world of gaming
          </p>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-7xl lg:text-[100px]">
            DISCOVER
            <br />
            <span className="text-violet-400">NEW WORLDS.</span>
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
            Find your next obsession. Explore unforgettable stories,
            distant galaxies, and worlds beyond imagination.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#discover"
              className="rounded-md bg-violet-500 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-violet-400"
            >
              Explore Games ↗
            </a>

            <a
              href="#genres"
              className="rounded-md border border-white/15 px-6 py-3.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-violet-400/60 hover:text-white"
            >
              Browse Genres
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
