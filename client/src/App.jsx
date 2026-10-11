
import Navbar from "./components/Navbar";
import CinematicHero from "./components/CinematicHero";

export default function App() {
  return (
    <main className="min-h-screen bg-[#090a0f] text-white">
      <Navbar />

      <CinematicHero />

      {/* Temporary landing section for testing the hero transition */}
      <section
        id="discover"
        className="relative overflow-hidden border-t border-white/[0.07] bg-[#0d0e15] px-5 py-28 sm:px-10 sm:py-36 lg:px-20"
      >
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
            THE JOURNEY CONTINUES
          </p>

          <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            FIND YOUR NEXT
            <br />
            <span className="text-violet-400">OBSESSION.</span>
          </h2>

          <p className="mt-6 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
            A universe of games is waiting to be explored. This
            section will become our live game discovery experience.
          </p>
        </div>
      </section>

      <section
        id="genres"
        className="border-t border-white/[0.07] bg-[#090a0f] px-5 py-24 sm:px-10 lg:px-20"
      >
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
            FIND YOUR WORLD
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
            Every genre. Every mood.
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Our genre discovery section comes next.
          </p>
        </div>
      </section>
    </main>
  );
}
