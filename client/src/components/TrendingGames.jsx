
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  RefreshCw,
  X,
} from "lucide-react";

import { fetchGames } from "../services/gameService";
import GameCard from "./GameCard";

/*
 * Normalize titles so different editions of the same game
 * are treated as one game in the discovery grid.
 */


function getCanonicalTitle(title = "") {
  const normalized = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  /*
   * Collapse The Witcher 3 variants and expansions
   * into one canonical game title.
   */
  if (/\bwitcher 3\b/.test(normalized)) {
    return "the witcher 3 wild hunt";
  }

  /*
   * Collapse common editions and DLC labels for other games.
   */
  return normalized
    .replace(
      /\b(complete edition|definitive edition|game of the year edition|game of the year|goty edition|goty|deluxe edition|ultimate edition|gold edition|enhanced edition|collector s edition|special edition|standard edition|anniversary edition|director s cut|remastered|remaster|redux|expansion pass|season pass|soundtrack|bundle|dlc|expansion|edition)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}



/*
 * Keep the first occurrence of each canonical title.
 */
function getUniqueGames(games) {
  const seen = new Set();

  return games.filter((game) => {
    const titleKey = getCanonicalTitle(game.name);

    // Skip missing titles and repeated entries.
    if (!titleKey || seen.has(titleKey)) {
      return false;
    }

    seen.add(titleKey);
    return true;
  });
}

function GameCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/10] rounded-xl bg-white/[0.06]" />
      <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.07]" />
      <div className="mt-3 h-3 w-1/2 rounded bg-white/[0.05]" />
    </div>
  );
}

export default function TrendingGames({
  selectedGenre = null,
  onClearGenre,
}) {
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

          // Fetch more candidates so editions can be removed
          // before selecting the eight games to display.
          pageSize: 40,

          ordering: "-rating",
          genres: selectedGenre?.slug ?? "",
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const uniqueGames = getUniqueGames(data.results ?? []);

        setGames(uniqueGames.slice(0, 8));
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(
            err.message || "Unable to load games right now.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => controller.abort();
  }, [retryKey, selectedGenre]);

  const heading = selectedGenre
    ? `${selectedGenre.name} Games`
    : "Discover Games";

  return (
    <section
      id="discover"
      className="relative scroll-mt-6 overflow-hidden border-t border-white/[0.07] bg-[#0d0e15] px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="pointer-events-none absolute -right-52 top-20 h-96 w-96 rounded-full bg-violet-600/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400 sm:text-xs">
              <Gamepad2 size={15} />
              THE GAME UNIVERSE
            </p>

            <h2 className="text-3xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              {heading}
              <span className="text-violet-400">.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
              {selectedGenre
                ? `Explore ${selectedGenre.name.toLowerCase()} games and find your next adventure.`
                : "From unforgettable adventures to hidden gems, find something worth playing."}
            </p>
          </div>

          {selectedGenre && (
            <button
              type="button"
              onClick={onClearGenre}
              className="inline-flex items-center gap-2 self-start text-sm text-zinc-400 transition-colors hover:text-white sm:self-auto"
            >
              <X size={15} />
              Clear filter
            </button>
          )}
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
              {error}
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

        {/* Distinct games */}
        {!loading && !error && games.length > 0 && (
          <>
            <p className="mb-5 text-xs text-zinc-500">
              Showing {games.length} unique games
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && games.length === 0 && (
          <div className="rounded-xl border border-white/10 py-16 text-center">
            <p className="font-semibold text-white">
              No games found for this category.
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Try another genre or explore the full catalog.
            </p>

            <button
              type="button"
              onClick={onClearGenre}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-violet-400/40 hover:text-white"
            >
              <ArrowRight size={15} />
              Explore all games
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

