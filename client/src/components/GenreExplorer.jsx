
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { fetchGames } from "../services/gameService";

export const gameGenres = [
  {
    name: "Action",
    slug: "action",
    artworkSearch: "007 First Light",
    match: ["007 first light", "james bond 007 first light"],
  },
  {
    name: "RPG",
    slug: "role-playing-games-rpg",
    artworkSearch: "The Witcher 3 Wild Hunt",
    match: ["the witcher 3 wild hunt"],
  },
  {
    name: "Adventure",
    slug: "adventure",
    artworkSearch: "Ghost of Tsushima",
    match: ["ghost of tsushima"],
  },
  {
    name: "Shooters",
    slug: "shooter",
    artworkSearch: "Call of Duty Black Ops 6",
    match: ["call of duty black ops 6"],
  },
  {
    name: "Strategy",
    slug: "strategy",
    artworkSearch: "Sid Meier's Civilization VII",
    match: [
      "sid meier s civilization vii",
      "civilization vii",
      "civilization 7",
    ],
  },
  {
    name: "Racing",
    slug: "racing",
    artworkSearch: "Forza Horizon 5",
    match: ["forza horizon 5"],
  },
  {
    name: "Indie",
    slug: "indie",
    artworkSearch: "Hollow Knight Silksong",
    match: ["hollow knight silksong"],
  },
  {
    name: "Puzzle",
    slug: "puzzle",
    artworkSearch: "Portal 2",
    match: ["portal 2"],
  },
];

function normalizeName(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findMatchingGame(results, matchTerms) {
  const terms = matchTerms.map(normalizeName);
  const games = results.filter((game) => game.backgroundImage);

  // First try an exact title match.
  const exact = games.find((game) =>
    terms.includes(normalizeName(game.name)),
  );

  if (exact) return exact;

  // Then accept common title variations and editions.
  return games.find((game) => {
    const name = normalizeName(game.name);

    return terms.some(
      (term) =>
        name.includes(term) ||
        term.startsWith(`${name} `),
    );
  });
}

async function fetchGenreResults(genre, signal, searchByTitle) {
  try {
    const data = await fetchGames({
      page: 1,
      pageSize: 40,
      ordering: "-rating",
      ...(searchByTitle
        ? { search: genre.artworkSearch }
        : { genres: genre.slug }),
      signal,
    });

    return data.results ?? [];
  } catch (error) {
    if (error.name === "AbortError" || signal.aborted) {
      return [];
    }

    console.warn(
      `Could not fetch ${genre.name} artwork:`,
      error.message,
    );

    return [];
  }
}

export default function GenreExplorer({
  selectedGenre,
  onSelectGenre,
}) {
  const [artwork, setArtwork] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadGenreArtwork() {
      // First pass: find the specifically chosen games.
      const titleResults = await Promise.all(
        gameGenres.map(async (genre) => ({
          genre,
          results: await fetchGenreResults(
            genre,
            controller.signal,
            true,
          ),
        })),
      );

      if (controller.signal.aborted) return;

      const nextArtwork = {};
      const usedGameIds = new Set();
      const usedImages = new Set();

      // Reserve distinct images for exact title matches first.
      for (const { genre, results } of titleResults) {
        const game = findMatchingGame(results, genre.match);

        if (
          game?.backgroundImage &&
          !usedGameIds.has(game.id) &&
          !usedImages.has(game.backgroundImage)
        ) {
          nextArtwork[genre.slug] = game.backgroundImage;
          usedGameIds.add(game.id);
          usedImages.add(game.backgroundImage);
        }
      }

      // Second pass: find category-specific artwork only
      // for genres whose preferred game could not be matched.
      const missingGenres = gameGenres.filter(
        (genre) => !nextArtwork[genre.slug],
      );

      const fallbackResults = await Promise.all(
        missingGenres.map(async (genre) => ({
          genre,
          results: await fetchGenreResults(
            genre,
            controller.signal,
            false,
          ),
        })),
      );

      if (controller.signal.aborted) return;

      // Select unique artwork from the actual genre results.
      for (const { genre, results } of fallbackResults) {
        const game = results.find(
          (candidate) =>
            candidate.backgroundImage &&
            !usedGameIds.has(candidate.id) &&
            !usedImages.has(candidate.backgroundImage),
        );

        if (game) {
          nextArtwork[genre.slug] = game.backgroundImage;
          usedGameIds.add(game.id);
          usedImages.add(game.backgroundImage);
        } else {
          console.warn(
            `No unique artwork available for ${genre.name}.`,
          );
        }
      }

      setArtwork(nextArtwork);
    }

    loadGenreArtwork();

    return () => controller.abort();
  }, []);

  function chooseGenre(genre) {
    onSelectGenre(genre);

    document.getElementById("discover")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section
      id="genres"
      className="relative overflow-hidden border-y border-white/[0.06] bg-[#0d0e15] px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-violet-600/[0.06] blur-[130px]" />

      <div className="relative mx-auto max-w-[1440px]">
        <div className="mb-9 sm:mb-12">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400 sm:text-xs">
            FIND YOUR NEXT OBSESSION
          </p>

          <h2 className="text-3xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Choose Your World
            <span className="text-violet-400">.</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            From breathtaking adventures to worlds full of
            danger, find the kind of game you love.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {gameGenres.map((genre) => {
            const active = selectedGenre?.slug === genre.slug;
            const image = artwork[genre.slug];

            return (
              <button
                key={genre.slug}
                type="button"
                aria-label={`Explore ${genre.name} games`}
                aria-pressed={active}
                onClick={() => chooseGenre(genre)}
                className={`group relative isolate aspect-[16/10] min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br from-[#272238] to-[#11121a] text-left transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 ${
                  active
                    ? "border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.18)]"
                    : "border-white/[0.08] hover:border-violet-400/60"
                }`}
              >
                {image && (
                  <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 -z-20 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}

                {/* Keep the genre name readable. */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/20 to-black/5" />

                <div className="pointer-events-none absolute inset-0 -z-10 bg-violet-950/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 sm:p-5">
                  <h3 className="text-base font-bold tracking-tight text-white drop-shadow-lg transition-transform duration-300 group-hover:translate-x-1 sm:text-xl lg:text-2xl">
                    {genre.name}
                  </h3>

                  <ArrowUpRight
                    size={18}
                    className="mb-0.5 shrink-0 text-white/80 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </div>

                {active && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-400" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => chooseGenre(null)}
            className={`rounded-md border px-5 py-3 text-sm font-semibold transition-colors duration-300 ${
              selectedGenre === null
                ? "border-violet-400/50 bg-violet-500/10 text-violet-200"
                : "border-white/10 text-zinc-300 hover:border-violet-400/50 hover:text-white"
            }`}
          >
            Explore All Games
          </button>
        </div>
      </div>
    </section>
  );
}
