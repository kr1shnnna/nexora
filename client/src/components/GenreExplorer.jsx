
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { fetchGames } from "../services/gameService";

export const gameGenres = [
  {
    name: "Action",
    slug: "action",
    artworkSearch: "007 First Light",
    match: ["007 first light"],
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
    artworkSearch: "Civilization VII",
    match: ["sid meier s civilization vii", "civilization vii"],
  },
  {
    name: "Racing",
    slug: "racing",
    artworkSearch: "Forza Horizon 6",
    match: ["forza horizon 6"],
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
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findMatchingGame(results, matchTerms) {
  const terms = matchTerms.map(normalizeName);

  // Prefer the exact game title.
  const exact = results.find((game) =>
    terms.includes(normalizeName(game.name)),
  );

  if (exact) return exact;

  // Allow editions of the intended game, but not unrelated titles.
  return results.find((game) => {
    const name = normalizeName(game.name);

    return terms.some(
      (term) => name.startsWith(`${term} `),
    );
  });
}

export default function GenreExplorer({
  selectedGenre,
  onSelectGenre,
}) {
  const [artwork, setArtwork] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadGenreArtwork() {
      const results = await Promise.all(
        gameGenres.map(async (genre) => {
          try {
            const data = await fetchGames({
              page: 1,
              pageSize: 10,
              search: genre.artworkSearch,
              ordering: "-rating",
              signal: controller.signal,
            });

            if (controller.signal.aborted) return null;

            const game = findMatchingGame(
              data.results ?? [],
              genre.match,
            );

            if (!game?.backgroundImage) {
              console.warn(
                `No matching artwork found for ${genre.name}: ${genre.artworkSearch}`,
              );

              return null;
            }

            return [genre.slug, game.backgroundImage];
          } catch (error) {
            if (
              error.name !== "AbortError" &&
              !controller.signal.aborted
            ) {
              console.error(
                `Unable to load ${genre.name} artwork:`,
                error.message,
              );
            }

            return null;
          }
        }),
      );

      if (controller.signal.aborted) return;

      const nextArtwork = {};

      results.filter(Boolean).forEach(([slug, image]) => {
        nextArtwork[slug] = image;
      });

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
                className={`group relative isolate aspect-[16/10] min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br from-[#272238] to-[#11121a] text-left transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:aspect-[16/10] ${
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

                {/* Darken the lower portion for legible text. */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/20 to-black/5" />

                <div className="pointer-events-none absolute inset-0 -z-10 bg-violet-950/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Genre name only — no icons or numbering. */}
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

        <p className="mt-8 text-center text-xs text-zinc-600">
          Game data and artwork provided by{" "}
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
    </section>
  );
}
