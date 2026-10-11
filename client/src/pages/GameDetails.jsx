
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gamepad2,
  Heart,
  Monitor,
  Play,
  RefreshCw,
  ShoppingCart,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import GameCard from "../components/GameCard";
import {
  fetchGameDetails,
  fetchGameScreenshots,
  fetchGameMovies,
} from "../services/gameDetailsService";
import { fetchGames } from "../services/gameService";

/* =========================================
   HELPERS
========================================= */

const DEMO_CART_KEY = "nexora-cart";
const DEMO_WISHLIST_KEY = "nexora-wishlist";

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function normalizeTitle(title = "") {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getUniqueGames(games) {
  const seen = new Set();

  return games.filter((game) => {
    const title = normalizeTitle(game.name);

    if (!title || seen.has(title)) return false;

    seen.add(title);
    return true;
  });
}

function formatDate(date) {
  if (!date) return "Not available";

  const value = new Date(`${date}T12:00:00`);

  if (Number.isNaN(value.getTime())) return "Not available";

  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function stripMarkup(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


function parseSystemRequirements(raw = "") {
  let text = stripMarkup(raw)
    .replace(/^(minimum|required|recommended)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return { rows: [], notes: "" };
  }

  /*
   * RAWG sometimes concatenates labels like:
   * "Windows 10Processor: Intel...Memory: 8 GB RAMGraphics: ..."
   *
   * Insert boundaries before known requirement labels.
   */
  text = text.replace(
    /(?=(?:Operating System|Processor|Memory|Graphics|Video Card|DirectX|Storage|Disk Space|Sound Card|Additional Notes|CPU|RAM|GPU)\s*:)/gi,
    " ",
  );

  const pattern =
    /\b(Operating System|OS|Processor|CPU|Memory|RAM|Graphics|Video Card|GPU|DirectX|Storage|Disk Space|Sound Card|Additional Notes)\s*:/gi;

  const matches = [...text.matchAll(pattern)];

  if (matches.length === 0) {
    return {
      rows: [{ label: "Requirements", value: text }],
      notes: "",
    };
  }

  const labelMap = {
    "operating system": "Operating system",
    os: "Operating system",
    processor: "Processor",
    cpu: "Processor",
    memory: "Memory",
    ram: "Memory",
    graphics: "Graphics",
    "video card": "Graphics",
    gpu: "Graphics",
    directx: "DirectX",
    storage: "Storage",
    "disk space": "Storage",
    "sound card": "Sound card",
  };

  const values = new Map();
  let notes = "";

  matches.forEach((match, index) => {
    const nextMatch = matches[index + 1];

    const valueStart = match.index + match[0].length;
    const valueEnd = nextMatch
      ? nextMatch.index
      : text.length;

    const value = text
      .slice(valueStart, valueEnd)
      .replace(/\s+/g, " ")
      .trim();

    const sourceLabel = match[1].toLowerCase();

    if (sourceLabel === "additional notes") {
      notes = value;
      return;
    }

    const label = labelMap[sourceLabel];

    if (label && value) {
      // Merge duplicate aliases, such as CPU and Processor.
      values.set(
        label,
        values.has(label)
          ? `${values.get(label)} / ${value}`
          : value,
      );
    }
  });

  return {
    rows: [...values.entries()].map(([label, value]) => ({
      label,
      value,
    })),
    notes,
  };
}



/*
 * Fictional showcase prices only.
 * These are not official store prices.
 */
function getDemoPrice(id) {
  const tiers = [499, 799, 999, 1299, 1499, 1999];
  const numericId = Number(id);

  const index = Number.isFinite(numericId)
    ? Math.abs(numericId) % tiers.length
    : 0;

  return tiers[index];
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function GameDetailsSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-[#090a0f] pt-24">
      <div className="h-[55vh] min-h-[380px] bg-white/[0.04]" />

      <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-12 sm:px-8 lg:px-12">
        <div className="h-9 w-2/3 rounded bg-white/[0.06]" />
        <div className="h-4 w-1/3 rounded bg-white/[0.05]" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="aspect-[16/10] rounded-xl bg-white/[0.05]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="mb-7">
      {eyebrow && (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-400">
          {eyebrow}
        </p>
      )}

      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
        <span className="text-violet-400">.</span>
      </h2>

      {children && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          {children}
        </p>
      )}
    </div>
  );
}

/* =========================================
   GAME DETAILS PAGE
========================================= */

export default function GameDetails() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [movies, setMovies] = useState([]);
  const [relatedGames, setRelatedGames] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const [wishlistIds, setWishlistIds] = useState(() =>
    readStoredArray(DEMO_WISHLIST_KEY).map(String),
  );

  const [cartAdded, setCartAdded] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [expandedDescription, setExpandedDescription] = useState(false);

  /* ---------------------------------------
     Fetch game details and supporting media
  --------------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    async function loadGame() {
      setLoading(true);
      setError("");
      setGame(null);
      setScreenshots([]);
      setMovies([]);
      setRelatedGames([]);
      setSelectedScreenshot(null);
      setSelectedMovieIndex(0);
      setExpandedDescription(false);

      try {
        const details = await fetchGameDetails(id, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setGame(details);

        // Media and related games are optional.
        // A missing trailer shouldn't break the details page.
        const [shotResults, movieResults, relatedResults] =
          await Promise.all([
            fetchGameScreenshots(id, {
              pageSize: 12,
              signal: controller.signal,
            }).catch(() => []),

            fetchGameMovies(id, {
              signal: controller.signal,
            }).catch(() => []),

            fetchGames({
              page: 1,
              pageSize: 20,
              genres: details.genres?.[0]?.slug ?? "",
              ordering: "-rating",
              signal: controller.signal,
            }).catch(() => ({ results: [] })),
          ]);

        if (controller.signal.aborted) return;

        setScreenshots(shotResults);
        setMovies(movieResults);

        const recommendations = getUniqueGames(
          relatedResults.results ?? [],
        )
          .filter(
            (item) =>
              String(item.id) !== String(details.id) &&
              item.backgroundImage,
          )
          .slice(0, 4);

        setRelatedGames(recommendations);
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(
            err.message || "Unable to load this game right now.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) loadGame();

    return () => controller.abort();
  }, [id, retryKey]);

  /* ---------------------------------------
     Wishlist
  --------------------------------------- */

  const isWishlisted = game
    ? wishlistIds.includes(String(game.id))
    : false;

  function toggleWishlist() {
    if (!game) return;

    const gameId = String(game.id);

    const next = isWishlisted
      ? wishlistIds.filter((item) => item !== gameId)
      : [...wishlistIds, gameId];

    setWishlistIds(next);

    try {
      localStorage.setItem(DEMO_WISHLIST_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("nexora-wishlist-updated"));
    } catch {
      setError("Your browser couldn't save the wishlist.");
    }
  }

  /* ---------------------------------------
     Demo cart
  --------------------------------------- */

  function addToCart() {
    if (!game) return;

    const price = getDemoPrice(game.id);

    try {
      const cart = readStoredArray(DEMO_CART_KEY);

      const existingIndex = cart.findIndex(
        (item) => String(item.id) === String(game.id),
      );

      let nextCart;

      if (existingIndex !== -1) {
        nextCart = cart.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: (Number(item.quantity) || 1) + 1,
              }
            : item,
        );
      } else {
        nextCart = [
          ...cart,
          {
            id: game.id,
            name: game.name,
            image: game.backgroundImage,
            price,
            quantity: 1,
          },
        ];
      }

      localStorage.setItem(DEMO_CART_KEY, JSON.stringify(nextCart));

      window.dispatchEvent(
        new CustomEvent("nexora-cart-updated", {
          detail: { cart: nextCart },
        }),
      );

      setCartAdded(true);
    } catch {
      setError("Your browser couldn't save the demo cart.");
    }
  }

  /* ---------------------------------------
     Loading and error screens
  --------------------------------------- */

  if (loading && !game) {
    return (
      <>
        <Navbar />
        <GameDetailsSkeleton />
      </>
    );
  }

  if (error && !game) {
    return (
      <main className="min-h-screen bg-[#090a0f] text-white">
        <Navbar />

        <section className="flex min-h-screen items-center justify-center px-5 pt-24">
          <div className="max-w-md text-center">
            <Gamepad2
              size={38}
              className="mx-auto mb-5 text-violet-400"
            />

            <h1 className="text-3xl font-bold">
              We lost this world.
            </h1>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              {error}
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setRetryKey((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-md bg-violet-500 px-5 py-3 text-sm font-bold hover:bg-violet-400"
              >
                <RefreshCw size={15} />
                Try again
              </button>

              <Link
                to="/discover"
                className="rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-300 hover:text-white"
              >
                Back to Discover
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!game) return null;

  const demoPrice = getDemoPrice(game.id);

  const description = stripMarkup(game.description);

  const selectedMovie = movies[selectedMovieIndex];

  const trailerUrl = selectedMovie?.video;

  const pcPlatform =
    game.platforms?.find(
      (platform) =>
        platform.slug === "pc" &&
        (platform.requirements?.minimum ||
          platform.requirements?.recommended),
    ) ??
    game.platforms?.find(
      (platform) =>
        platform.requirements?.minimum ||
        platform.requirements?.recommended,
    );

  const requirements = pcPlatform?.requirements;

 
  
const systemRequirements = [
  {
    label: "Minimum requirements",
    data: parseSystemRequirements(requirements?.minimum ?? ""),
  },
  {
    label: "Recommended requirements",
    data: parseSystemRequirements(requirements?.recommended ?? ""),
  },
].filter(
  (item) =>
    item.data.rows.length > 0 || item.data.notes,
);



  const platforms = (game.platforms ?? []).map(
    (platform) => platform.name,
  );

  const metadata = [
    {
      label: "Release date",
      value: formatDate(game.released),
      icon: CalendarDays,
    },
    {
      label: "Developer",
      value:
        game.developers?.map((item) => item.name).join(", ") ||
        "Not available",
      icon: Users,
    },
    {
      label: "Publisher",
      value:
        game.publishers?.map((item) => item.name).join(", ") ||
        "Not available",
      icon: Tag,
    },
    {
      label: "Platforms",
      value: platforms.length
        ? platforms.join(", ")
        : "Not available",
      icon: Monitor,
    },
  ];

  const galleryImages = [
    ...(game.backgroundImageAdditional
      ? [
          {
            id: "additional-cover",
            image: game.backgroundImageAdditional,
          },
        ]
      : []),
    ...screenshots,
  ].filter(
    (item, index, array) =>
      item.image &&
      array.findIndex((other) => other.image === item.image) === index,
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-[#090a0f] text-white">
      <Navbar />

      {/* =====================================
          CINEMATIC GAME BANNER
      ====================================== */}

      <section className="relative isolate flex min-h-[76svh] flex-col justify-end overflow-hidden bg-[#090a0f] pb-12 pt-32 sm:min-h-[82svh] sm:pb-16">
        {game.backgroundImage && (
          <img
            src={game.backgroundImage}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
          />
        )}

        <div className="pointer-events-none absolute inset-0 -z-20 bg-black/30" />

        <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-[#090a0f]/95 via-[#090a0f]/70 to-[#090a0f]/15" />

        <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/25 to-[#090a0f]/50" />

        <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <Link
            to="/discover"
            className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} />
            Back to Discover
          </Link>

          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {game.genres?.slice(0, 4).map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-200 backdrop-blur-md"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <h1 className="break-words text-4xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-8xl">
              {game.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-zinc-300">
              {Number(game.rating) > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Star
                    size={16}
                    fill="currentColor"
                    className="text-violet-300"
                  />
                  <strong className="text-white">
                    {Number(game.rating).toFixed(1)}
                  </strong>
                  <span className="text-zinc-400">User score</span>
                </span>
              )}

              {game.metacritic != null && (
                <span className="rounded border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1.5 text-xs font-bold text-emerald-300">
                  Metascore {game.metacritic}
                </span>
              )}

              {game.released && (
                <span className="text-zinc-300">
                  {new Date(`${game.released}T12:00:00`).getFullYear()}
                </span>
              )}

              {game.esrbRating && (
                <span className="rounded border border-white/20 px-2 py-1 text-xs text-zinc-300">
                  {game.esrbRating}
                </span>
              )}
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base sm:leading-8">
              {description
                ? description.slice(0, 240) +
                  (description.length > 240 ? "..." : "")
                : "Discover this game, explore its world, and view the available game information below."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#game-purchase"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-violet-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_35px_rgba(139,92,246,0.18)] transition-all hover:-translate-y-0.5 hover:bg-violet-400"
              >
                Explore Purchase Options
                <ArrowUpRight size={17} />
              </a>

              <button
                type="button"
                onClick={toggleWishlist}
                aria-pressed={isWishlisted}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold backdrop-blur-md transition-all ${
                  isWishlisted
                    ? "border-violet-400/60 bg-violet-500/15 text-violet-200"
                    : "border-white/20 bg-white/[0.04] text-white hover:border-violet-400/50"
                }`}
              >
                <Heart
                  size={17}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          MAIN CONTENT AND PURCHASE PANEL
      ====================================== */}

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-14 lg:px-12">
        <div className="min-w-0 space-y-14 sm:space-y-16">
          {/* Description */}
          <section id="overview">
            <SectionHeading
              eyebrow="THE STORY"
              title="About This Game"
            >
              Discover the world, the characters, and the experience
              that make this game worth exploring.
            </SectionHeading>

            {description ? (
              <div>
                <p
                  className={`whitespace-pre-line text-sm leading-8 text-zinc-300 sm:text-base ${
                    !expandedDescription && description.length > 1000
                      ? "line-clamp-[12]"
                      : ""
                  }`}
                >
                  {description}
                </p>

                {description.length > 1000 && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDescription((value) => !value)
                    }
                    className="mt-4 text-sm font-semibold text-violet-300 hover:text-violet-200"
                  >
                    {expandedDescription ? "Read less" : "Read full description"}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm leading-7 text-zinc-500">
                A full description is not available for this title.
              </p>
            )}

            {game.website && (
              <a
                href={game.website}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200"
              >
                Visit official website
                <ExternalLink size={15} />
              </a>
            )}
          </section>

          {/* Screenshots */}
          {galleryImages.length > 0 && (
            <section id="screenshots">
              <SectionHeading
                eyebrow="TAKE A CLOSER LOOK"
                title="Screenshots"
              >
                Explore the environments and moments captured from the game.
              </SectionHeading>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {galleryImages.slice(0, 9).map((screenshot, index) => (
                  <button
                    key={screenshot.id ?? screenshot.image}
                    type="button"
                    onClick={() => setSelectedScreenshot(screenshot)}
                    aria-label={`View screenshot ${index + 1}`}
                    className="group relative aspect-video overflow-hidden rounded-lg border border-white/[0.08] bg-[#171824] focus-visible:outline-2 focus-visible:outline-violet-400"
                  >
                    <img
                      src={screenshot.image}
                      alt={`${game.name} screenshot ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trailers */}
          <section id="trailers">
            <SectionHeading
              eyebrow="IN MOTION"
              title="Trailers & Videos"
            >
              Watch available trailers and video previews.
            </SectionHeading>

            {movies.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#14151e]">
                <div className="aspect-video bg-black">
                  {trailerUrl ? (
                    <video
                      key={trailerUrl}
                      controls
                      playsInline
                      preload="metadata"
                      poster={selectedMovie.preview ?? game.backgroundImage ?? undefined}
                      className="h-full w-full"
                    >
                      <source src={trailerUrl} />
                      Your browser does not support video playback.
                    </video>
                  ) : selectedMovie?.preview ? (
                    <a
                      href={selectedMovie.preview}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full flex-col items-center justify-center gap-3 text-zinc-300 hover:text-white"
                    >
                      <Play size={36} />
                      Open video preview
                      <ExternalLink size={15} />
                    </a>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                      No playable video is available.
                    </div>
                  )}
                </div>
                    
{movies.length > 1 && (
  <div className="flex flex-wrap gap-2 border-t border-white/10 p-3 sm:p-4">
    {movies.map((movie, index) => (
      <button
        key={movie.id}
        type="button"
        onClick={() => setSelectedMovieIndex(index)}
        className={`min-w-0 max-w-full whitespace-normal break-words rounded-md border px-3 py-2.5 text-left text-xs leading-5 transition-colors duration-200 ${
          index === selectedMovieIndex
            ? "border-violet-400/60 bg-violet-500/15 text-white"
            : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
        }`}
      >
        {movie.name || `Video ${index + 1}`}
      </button>
    ))}
  </div>
)}

              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-white/10 bg-[#11121a] px-5 text-center">
                <Play size={30} className="text-violet-300" />
                <p className="mt-4 font-semibold text-white">
                  No trailer available
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  There are no video previews available for this game right now.
                </p>
              </div>
            )}
          </section>

          {/* Metadata */}
          <section id="information">
            <SectionHeading
              eyebrow="KNOW YOUR GAME"
              title="Game Information"
            />

            <div className="divide-y divide-white/[0.07] rounded-xl border border-white/[0.08] bg-[#11121a] px-4 sm:px-6">
              {metadata.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="grid grid-cols-[28px_minmax(100px,0.7fr)_minmax(0,1.5fr)] gap-3 py-4 sm:gap-4"
                  >
                    <Icon
                      size={17}
                      className="mt-0.5 text-violet-300"
                    />

                    <span className="text-xs text-zinc-500 sm:text-sm">
                      {item.label}
                    </span>

                    <span className="break-words text-right text-xs leading-6 text-zinc-200 sm:text-sm">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* System requirements */}
        
        
<section id="system-requirements">
  <SectionHeading
    eyebrow="CHECK YOUR SETUP"
    title="System Requirements"
  >
    Check the hardware specifications before you dive in.
  </SectionHeading>

  {systemRequirements.length > 0 ? (
    <div className="grid gap-4 xl:grid-cols-2">
      {systemRequirements.map((requirement) => (
        <div
          key={requirement.label}
          className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#11121a]"
        >
          {/* Card heading */}
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
              <Monitor size={18} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">
                {requirement.label}
              </h3>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                PC specifications
              </p>
            </div>
          </div>

          {/* Requirement rows */}
          <dl className="divide-y divide-white/[0.06] px-4 sm:px-5">
            {requirement.data.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[125px_minmax(0,1fr)] sm:gap-5"
              >
                <dt className="text-xs font-medium text-zinc-500">
                  {row.label}
                </dt>

                <dd className="break-words text-xs leading-6 text-zinc-200 sm:text-sm">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Long notes don't dominate the section */}
          {requirement.data.notes && (
            <details className="border-t border-white/[0.06] px-4 py-4 sm:px-5">
              <summary className="cursor-pointer text-xs font-medium text-violet-300 transition-colors hover:text-violet-200">
                Additional notes
              </summary>

              <p className="mt-3 whitespace-pre-line break-words text-xs leading-6 text-zinc-400">
                {requirement.data.notes}
              </p>
            </details>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-white/[0.08] bg-[#11121a] p-6">
      <Monitor size={24} className="mb-4 text-violet-300" />

      <p className="font-semibold text-white">
        Requirements unavailable
      </p>

      <p className="mt-2 text-sm leading-7 text-zinc-400">
        System specifications are not available for this game.
        Check the publisher's website for verified requirements.
      </p>
    </div>
  )}
</section>



          {/* Recommendations */}
          {relatedGames.length > 0 && (
            <section id="similar-games">
              <SectionHeading
                eyebrow="KEEP EXPLORING"
                title="You May Also Like"
              >
                More games to add to your next adventure.
              </SectionHeading>

              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-2">
                {relatedGames.map((relatedGame) => (
                  <GameCard
                    key={relatedGame.id}
                    game={relatedGame}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky demo purchase panel */}
        <aside
          id="game-purchase"
          className="h-fit lg:sticky lg:top-24"
        >
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12131c]">
            {game.backgroundImage && (
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={game.backgroundImage}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12131c] to-transparent" />
              </div>
            )}

            <div className="p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">
                YOUR NEXT ADVENTURE
              </p>

              <h2 className="mt-3 text-xl font-bold leading-snug text-white">
                {game.name}
              </h2>

              <div className="mt-6 border-y border-white/[0.08] py-5">
                <p className="text-xs text-zinc-500">
                  Demo showcase price
                </p>

                <p className="mt-2 text-3xl font-black tracking-tight text-white">
                  {formatPrice(demoPrice)}
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Fictional portfolio price. No actual license or
                  game download is included.
                </p>
              </div>

              <button
                type="button"
                onClick={addToCart}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-violet-500 px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-400"
              >
                {cartAdded ? <Check size={17} /> : <ShoppingCart size={17} />}
                {cartAdded ? "Added to Demo Cart" : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={toggleWishlist}
                aria-pressed={isWishlisted}
                className={`mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                  isWishlisted
                    ? "border-violet-400/40 bg-violet-500/10 text-violet-200"
                    : "border-white/10 text-zinc-300 hover:border-violet-400/40 hover:text-white"
                }`}
              >
                <Heart
                  size={17}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>

              <div className="mt-5 space-y-3 border-t border-white/[0.08] pt-5">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Check size={14} className="text-violet-300" />
                  Persistent demo cart
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Check size={14} className="text-violet-300" />
                  Browser-saved wishlist
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Check size={14} className="text-violet-300" />
                  No real payment collected
                </div>
              </div>

              {cartAdded && (
                <Link
                  to="/cart"
                  className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
                >
                  Continue to cart
                  <ArrowRight size={15} />
                </Link>
              )}

              {game.website && (
                <a
                  href={game.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 border-t border-white/[0.08] pt-5 text-xs text-zinc-500 transition-colors hover:text-white"
                >
                  Publisher's website
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Screenshot lightbox */}
      {selectedScreenshot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Game screenshot preview"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedScreenshot(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedScreenshot(null)}
            aria-label="Close screenshot preview"
            className="absolute right-5 top-5 rounded-full border border-white/15 bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>

          <img
            src={selectedScreenshot.image}
            alt={`${game.name} screenshot`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}

