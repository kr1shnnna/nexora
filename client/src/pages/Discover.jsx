
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Gamepad2,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
} from "lucide-react";

import { fetchGames } from "../services/gameService";
import GameCard from "../components/GameCard";
import Navbar from "../components/Navbar";

const GENRES = [
  { name: "Action", slug: "action" },
  { name: "Adventure", slug: "adventure" },
  { name: "RPG", slug: "role-playing-games-rpg" },
  { name: "Shooters", slug: "shooter" },
  { name: "Strategy", slug: "strategy" },
  { name: "Racing", slug: "racing" },
  { name: "Indie", slug: "indie" },
  { name: "Puzzle", slug: "puzzle" },
];

const SORT_OPTIONS = [
  { label: "Highest rated", value: "-rating" },
  { label: "Recently released", value: "-released" },
  { label: "Oldest releases", value: "released" },
  { label: "Name: A to Z", value: "name" },
  { label: "Name: Z to A", value: "-name" },
  { label: "Recently added", value: "-added" },
];

function canonicalTitle(title = "") {
  const normalized = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Keep known Witcher 3 editions and expansions together.
  if (/\bwitcher 3\b/.test(normalized)) {
    return "the witcher 3 wild hunt";
  }

  return normalized
    .replace(
      /\b(game of the year|goty|complete edition|definitive edition|deluxe edition|ultimate edition|gold edition|enhanced edition|collector s edition|special edition|standard edition|anniversary edition|director s cut|remastered|remaster|redux|season pass|soundtrack|bundle|dlc|expansion|edition)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueGames(games) {
  const seen = new Set();

  return games.filter((game) => {
    const key = canonicalTitle(game.name);

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function GameSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/10] rounded-xl bg-white/[0.06]" />
      <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.07]" />
      <div className="mt-3 h-3 w-1/2 rounded bg-white/[0.05]" />
    </div>
  );
}

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedGenre = searchParams.get("genre") ?? "";
  const genre = GENRES.some((item) => item.slug === requestedGenre)
    ? requestedGenre
    : "";

  const requestedSort = searchParams.get("ordering") ?? "-rating";
  const ordering = SORT_OPTIONS.some(
    (item) => item.value === requestedSort,
  )
    ? requestedSort
    : "-rating";

  const selectedGenre = GENRES.find(
    (item) => item.slug === genre,
  );

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [games, setGames] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Debounce search so every keystroke doesn't make an API request.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Reset to the first page when filters or search change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre, ordering]);

  // Fetch games through our Express backend.
  useEffect(() => {
    const controller = new AbortController();

    async function loadGames() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchGames({
          page,
          pageSize: 40,
          search: debouncedSearch,
          genres: genre,
          ordering,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const results = uniqueGames(data.results ?? []);

        setGames(results.slice(0, 24));
        setTotalGames(data.count ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(
            err.message || "Unable to load the game catalog.",
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
  }, [page, debouncedSearch, genre, ordering, retryKey]);

  function updateParams(changes) {
    const next = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    setSearchParams(next);
  }

  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
    setSearchParams({});
  }

  const hasFilters = Boolean(debouncedSearch || genre);

  return (
    <main className="min-h-screen bg-[#090a0f] text-white">
      <Navbar />

      <div className="mx-auto max-w-[1600px] px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-12">
        {/* Page heading */}
        <header className="mb-10 sm:mb-14">
          <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400 sm:text-xs">
            <Gamepad2 size={15} />
            THE NEXORA GAME UNIVERSE
          </p>

          <h1 className="text-4xl font-black tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Discover Games
            <span className="text-violet-400">.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Find your next obsession. Explore legendary adventures,
            indie gems, competitive shooters, and entire worlds
            waiting to be discovered.
          </p>
        </header>

        {/* Search bar */}
        <div className="mb-6">
          <label htmlFor="game-search" className="sr-only">
            Search games
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#14151e] px-4 transition-colors focus-within:border-violet-400/60 sm:px-5">
            <Search size={20} className="shrink-0 text-violet-300" />

            <input
              id="game-search"
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search games, worlds, adventures..."
              maxLength={100}
              className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-zinc-600 sm:py-5 sm:text-base"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                <X size={18} />
              </button>
            )}

            <span className="hidden rounded border border-white/10 px-2 py-1 text-[10px] text-zinc-600 sm:block">
              RAWG
            </span>
          </div>
        </div>

        {/* Filters and sorting */}
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-2 text-xs text-zinc-500">
              <SlidersHorizontal size={15} />
              Genres
            </span>

            <button
              type="button"
              onClick={() => updateParams({ genre: "" })}
              aria-pressed={!genre}
              className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                !genre
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                  : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              All Games
            </button>

            {GENRES.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => updateParams({ genre: item.slug })}
                aria-pressed={genre === item.slug}
                className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                  genre === item.slug
                    ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <label className="flex shrink-0 items-center gap-3 text-xs text-zinc-400">
            Sort by
            <select
              aria-label="Sort games"
              value={ordering}
              onChange={(event) =>
                updateParams({ ordering: event.target.value })
              }
              className="max-w-full rounded-lg border border-white/10 bg-[#14151e] px-3 py-3 text-sm text-zinc-200 outline-none transition-colors focus:border-violet-400/60"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Results heading */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.07] pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {debouncedSearch
                ? `Results for "${debouncedSearch}"`
                : selectedGenre
                  ? `${selectedGenre.name} Games`
                  : "Explore the Collection"}
            </h2>

            <p className="mt-2 text-xs text-zinc-500">
              {loading
                ? "Searching the game universe..."
                : error
                  ? "The catalog is temporarily unavailable"
                  : `${totalGames.toLocaleString("en-IN")} games in the API results`}
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-violet-300"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {Array.from({ length: 12 }, (_, index) => (
              <GameSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-white/10 bg-white/[0.025] px-6 py-14 text-center"
          >
            <p className="text-lg font-semibold">
              We couldn't load these games.
            </p>

            <p className="mt-3 text-sm text-zinc-400">{error}</p>

            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-violet-500 px-5 py-3 text-sm font-semibold transition-colors hover:bg-violet-400"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && games.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => {
                  setPage((value) => Math.max(1, value - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-violet-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages.toLocaleString("en-IN")}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => {
                  setPage((value) => Math.min(totalPages, value + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-violet-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && games.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <Gamepad2
              size={32}
              className="mx-auto mb-4 text-violet-400"
            />

            <h2 className="text-lg font-semibold text-white">
              No games found
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Try a different title or remove some filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-md bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-400"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Attribution */}
        <p className="mt-12 text-center text-xs leading-6 text-zinc-600">
          Game information provided by{" "}
          <a
            href="https://rawg.io"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-zinc-400"
          >
            RAWG Video Games Database
          </a>
        </p>
      </div>
    </main>
  );
}
