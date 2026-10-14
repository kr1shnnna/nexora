
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  LibraryBig,
  LoaderCircle,
  ShoppingBag,
  Sparkles,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { fetchLibrary } from "../services/accountService";
import { getAuthToken } from "../services/authService";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

export default function Library() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLibrary() {
      if (!getAuthToken()) {
        setError("Please log in to view your game library.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchLibrary();

        if (cancelled) return;

        setGames(Array.isArray(data.library) ? data.library : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your library.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLibrary();

    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticationError =
    error.toLowerCase().includes("log in") ||
    error.toLowerCase().includes("session has expired") ||
    error.toLowerCase().includes("authentication");

  const totalSpent = games.reduce(
    (sum, game) => sum + (Number(game.price) || 0),
    0
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090d] text-white">
      <Navbar />

      {/* Cinematic background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/[0.08] blur-[150px]" />

        <div className="absolute -left-40 top-[450px] h-[400px] w-[400px] rounded-full bg-indigo-600/[0.05] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 pb-24 pt-32 sm:px-8 lg:px-12">

        {/* Page heading */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
            <Gamepad2 size={17} />
            YOUR PERSONAL COLLECTION
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
                My <span className="text-white/40">Library</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
                Every adventure you've claimed, all in one place.
                Your collection grows with every discovery.
              </p>
            </div>

            {!loading && !error && games.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="text-xs text-white/40">
                    Games owned
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {games.length.toString().padStart(2, "0")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="text-xs text-white/40">
                    Demo collection value
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatPrice(totalSpent)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">
            <LoaderCircle
              size={34}
              className="animate-spin text-violet-300"
            />

            <p className="text-sm text-white/45">
              Loading your collection...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <section
            role="alert"
            className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] px-5 py-12 text-center"
          >
            <AlertCircle
              size={32}
              className="mb-5 text-violet-300"
            />

            <h2 className="text-2xl font-bold">
              {isAuthenticationError
                ? "Your adventure awaits"
                : "We couldn't load your library"}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
              {error}
            </p>

            <Link
              to={isAuthenticationError ? "/login" : "/"}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-violet-500"
            >
              {isAuthenticationError ? "Sign in" : "Back to NEXORA"}
              <ArrowRight size={16} />
            </Link>
          </section>
        )}

        {/* Empty library */}
        {!loading && !error && games.length === 0 && (
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.02] px-5 py-16 text-center sm:px-10 sm:py-24">
            {/* Decorative artwork panels */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-violet-700/[0.08] blur-[100px]" />

              <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-indigo-600/[0.06] blur-[100px]" />

              <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
            </div>

            <div className="relative mx-auto max-w-xl">
              <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-violet-400/20 bg-violet-500/[0.07]">
                <LibraryBig
                  size={42}
                  strokeWidth={1.3}
                  className="text-violet-300"
                />

                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#15121f]">
                  <Sparkles size={15} className="text-violet-300" />
                </div>
              </div>

              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                A BLANK CANVAS
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Your story starts here.
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/45 sm:text-base">
                Your library is waiting for its first legend.
                Discover worlds, complete a demo purchase, and
                watch your personal collection come to life.
              </p>

              <Link
                to="/discover"
                className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-violet-600 px-7 py-4 text-sm font-bold text-white transition-colors duration-300 hover:bg-violet-500"
              >
                <ShoppingBag size={18} />
                Discover Games

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-white/25">
                Your first game is only the beginning
              </p>
            </div>
          </section>
        )}

        {/* Owned games */}
        {!loading && !error && games.length > 0 && (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Your collection
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  All your owned games, ready to explore.
                </p>
              </div>

              <Link
                to="/discover"
                className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-violet-300"
              >
                Discover more
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {games.map((game) => (
                <article
                  key={game.gameId}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] transition-colors duration-300 hover:border-violet-400/25"
                >
                  {/* Artwork */}
                  <Link
                    to={`/games/${game.gameId}`}
                    className="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-violet-950 to-[#111016]"
                  >
                    {game.backgroundImage && (
                      <img
                        src={game.backgroundImage}
                        alt={game.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200 backdrop-blur-md">
                        Owned
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                      <Gamepad2 size={15} />
                      NEXORA LIBRARY
                    </div>
                  </Link>

                  {/* Game details */}
                  <div className="p-5">
                    <h3 className="truncate text-lg font-bold">
                      {game.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-white/40">
                        {game.purchasedAt
                          ? `Added ${new Date(
                              game.purchasedAt
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}`
                          : "In your collection"}
                      </span>

                      <span className="text-sm font-semibold text-white/70">
                        {formatPrice(game.price)}
                      </span>
                    </div>

                    <Link
                      to={`/games/${game.gameId}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
                    >
                      View Game Details
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Demo disclaimer */}
        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.16em] text-white/25 sm:flex-row sm:gap-3">
          <CalendarDays size={14} />
          <span>Saved to your personal demo collection</span>
          <span className="hidden sm:inline">·</span>
          <span>No downloads or real purchases</span>
        </div>
      </div>
    </main>
  );
}

