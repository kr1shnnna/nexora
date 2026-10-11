
import { useEffect, useState } from "react";
import { ArrowRight, Gamepad2, RefreshCw } from "lucide-react";
import { fetchGames } from "../services/gameService";
import GameCard from "./GameCard";

function GameCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-xl bg-white/[0.06]" />
      <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.07]" />
      <div className="mt-3 h-3 w-1/2 rounded bg-white/[0.05]" />
    </div>
  );
}

export default function TrendingGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGames() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchGames({
          page: 1,
          pageSize: 8,
          ordering: "-rating",
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setGames(data.results ?? []);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load games right now.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => controller.abort();
  }, [retryKey]);

  return (
    <section
      id="discover"
      className="relative overflow-hidden border-t border-white/[0.07] bg-[#0d0e15] px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute -right-52 top-20 h-96 w-96 rounded-full bg-violet-600/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-[1440px]">
        {/* Section heading */}
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400 sm:text-xs">
              <Gamepad2 size={15} />
              THE GAME UNIVERSE
            </p>

            <h2 className="text-3xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Discover Games
              <span className="text-violet-400">.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
              From unforgettable adventures to worlds beyond
              imagination, find something worth playing.
            </p>
          </div>

          <p className="text-xs text-zinc-500">
            {loading
              ? "Exploring the universe..."
              : error
                ? "Catalog temporarily unavailable"
                : `${games.length} games discovered`}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {Array.from({ length: 8 }, (_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-white/10 bg-white/[0.025] px-6 py-12 text-center"
          >
            <p className="text-base font-semibold text-white">
              We couldn't load the game catalog.
            </p>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
              {error}. Check that your backend is running and
              try again.
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-400"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Game catalog */}
        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && games.length === 0 && (
          <div className="rounded-xl border border-white/10 py-16 text-center">
            <p className="font-semibold text-white">
              No games found.
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Let's try discovering more games later.
            </p>
          </div>
        )}

        {/* Footer link */}
        {!loading && !error && games.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="group inline-flex items-center gap-3 rounded-md border border-white/10 px-5 py-3.5 text-sm font-semibold text-zinc-300 transition-all duration-300 hover:border-violet-400/40 hover:text-white"
            >
              Explore the universe
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-6 text-zinc-600">
          Game information provided by RAWG.
          {" "}
          <a
            href="https://rawg.io"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-zinc-600 underline-offset-4 hover:text-zinc-400"
          >
            RAWG Video Games Database
          </a>
        </p>
      </div>
    </section>
  );
}

