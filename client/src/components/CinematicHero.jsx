
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";

export default function CinematicHero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] overflow-hidden bg-nexora-bg"
    >
      {/* Background artwork */}
      <div className="absolute inset-0 -z-20">
        <img
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=85"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="h-full w-full scale-[1.03] object-cover object-[58%_center]"
        />
      </div>

      {/* Cinematic color grading */}
      <div className="absolute inset-0 -z-10 bg-[#090a0f]/35" />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/85 to-[#090a0f]/20" />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#090a0f] via-transparent to-[#090a0f]/65" />

      {/* Ambient violet glow */}
      <div className="pointer-events-none absolute -right-40 top-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[130px]" />

      {/* Main content */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-center px-5 pb-24 pt-32 sm:px-8 sm:pb-28 sm:pt-36 lg:px-16">
        <div className="w-full max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-3.5 py-2 backdrop-blur-md">
              <Sparkles size={13} className="text-violet-300" />

              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200 sm:text-xs">
                The gaming universe
              </span>
            </span>

            <span className="hidden h-px w-10 bg-white/25 sm:block" />

            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
              Discover · Explore · Play
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-5xl text-[clamp(3.5rem,8.5vw,8.5rem)] font-black leading-[0.84] tracking-[-0.075em] text-white">
            WORLDS
            <br />

            <span className="bg-gradient-to-r from-white via-white to-violet-300 bg-clip-text text-transparent">
              BEYOND
            </span>

            <br />

            <span className="text-violet-400">ORDINARY.</span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-lg text-sm leading-7 text-zinc-300 sm:mt-9 sm:text-base sm:leading-8">
            From distant galaxies to forgotten kingdoms, discover
            extraordinary games and find your next obsession.
            Your next adventure starts here.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <a
              href="#discover"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-violet-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_35px_rgba(139,92,246,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-400 hover:shadow-[0_0_45px_rgba(139,92,246,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 sm:px-6"
            >
              Explore Games

              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>

            <a
              href="#genres"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/35 hover:bg-white/[0.07] sm:px-6"
            >
              Discover Genres

              <ArrowDown
                size={16}
                className="text-zinc-400 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-white"
              />
            </a>
          </div>

          {/* Small supporting line */}
          <div className="mt-10 flex items-center gap-3 sm:mt-14">
            <div className="flex -space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              <span className="h-2 w-2 rounded-full bg-violet-400/55" />
              <span className="h-2 w-2 rounded-full bg-violet-400/25" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 sm:text-xs">
              One universe. Endless adventures.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom edge details */}
      <div className="pointer-events-none absolute bottom-6 left-5 right-5 flex items-center justify-between sm:bottom-8 sm:left-8 sm:right-8 lg:left-16 lg:right-16">
        <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-white/40 sm:text-[10px]">
          NEXORA / 001
        </span>

        <span className="hidden text-[10px] uppercase tracking-[0.25em] text-white/40 sm:block">
          A new world awaits
        </span>

        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/50 sm:text-[10px]">
          <span className="h-px w-6 bg-violet-400/60" />
          Scroll to explore
        </div>
      </div>
    </section>
  );
}

