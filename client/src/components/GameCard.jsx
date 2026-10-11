
import { ArrowUpRight, CalendarDays, Star } from "lucide-react";

export default function GameCard({ game }) {
  const genres = game.genres ?? [];

  const releaseDate = game.released
    ? new Date(`${game.released}T12:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      )
    : "Release date unavailable";

  return (
    <article className="group min-w-0">
      {/* Artwork */}
      
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br from-[#242035] to-[#11121a]">
        {game.backgroundImage && (
          <img
            src={game.backgroundImage}
            alt={`${game.name} game artwork`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        {/* Artwork overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/20 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Rating */}
        {Number(game.rating) > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md border border-white/10 bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Star
              size={13}
              fill="#c4b5fd"
              className="text-violet-300"
            />
            {Number(game.rating).toFixed(1)}
          </div>
        )}

        {/* Metacritic score, when available */}
        {Number.isFinite(Number(game.metacritic)) &&
          game.metacritic !== null && (
            <span className="absolute right-3 top-3 rounded-md border border-emerald-300/20 bg-black/55 px-2.5 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-md">
              {game.metacritic}
            </span>
          )}

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={19} />
        </div>

        {/* Genre labels */}
        <div className="absolute bottom-4 left-3 right-14 flex flex-wrap gap-1.5">
          {genres.slice(0, 2).map((genre) => (
            <span
              key={genre.id ?? genre.slug}
              className="rounded-sm border border-white/10 bg-black/45 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-zinc-200 backdrop-blur-md"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>

      {/* Game details */}
      <div className="pt-3.5">
        <h3 className="line-clamp-2 min-h-11 text-sm font-semibold leading-5 text-zinc-100 transition-colors duration-300 group-hover:text-violet-300 sm:text-base">
          {game.name}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <CalendarDays size={13} className="shrink-0" />
          <span>{releaseDate}</span>
        </div>
      </div>
    </article>
  );
}

