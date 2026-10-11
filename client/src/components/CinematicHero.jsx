
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowUpRight,
  Gamepad2,
  RefreshCw,
  Star,
} from "lucide-react";
import { fetchGames } from "../services/gameService";

gsap.registerPlugin(ScrollTrigger);

/* =========================================
   FEATURED GAMES
========================================= */



const FEATURED_GAMES = [
{
  search: "Red Dead Redemption 2",
  titleTop: "RED DEAD",
  titleBottom: "REDEMPTION 2.",
  label: "A WILD FRONTIER",
  genre: "OPEN-WORLD ACTION ADVENTURE",
  subtitle: "OUTLAWS UNTIL THE END.",
  description:
    "Ride across a vast and unforgiving frontier in an unforgettable story of loyalty, survival, and the fading American Wild West.",
},

  {
    search: "Elden Ring",
    titleTop: "ELDEN",
    titleBottom: "RING.",
    label: "FROM THE LANDS BETWEEN",
    genre: "OPEN-WORLD ACTION RPG",
    subtitle: "RISE, TARNISHED.",
    description:
      "Explore the Lands Between, challenge formidable foes, and forge your own legend in a vast, mysterious fantasy world.",
  },
  {
    search: "Cyberpunk 2077",
    titleTop: "CYBERPUNK",
    titleBottom: "2077.",
    label: "WELCOME TO NIGHT CITY",
    genre: "SCI-FI ACTION RPG",
    subtitle: "BECOME A LEGEND.",
    description:
      "Step into Night City, a neon-soaked metropolis where technology, ambition, and danger collide.",
  },
];



/* =========================================
   GAME DATA HELPERS
========================================= */

function normalizeGameName(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findMatchingGame(results, expectedTitle) {
  const expected = normalizeGameName(expectedTitle);

  return (
    results.find(
      (game) => normalizeGameName(game.name) === expected,
    ) ??
    results.find(
      (game) =>
        normalizeGameName(game.name).startsWith(`${expected} `),
    ) ??
    results.find((game) =>
      normalizeGameName(game.name).includes(expected),
    )
  );
}

function createFeaturedChapter(game, featured, index) {
  return {
    id: game.id,
    slug: game.slug,
    number: String(index + 1).padStart(2, "0"),
    label: featured.label,
    genre:
      game.genres
        ?.slice(0, 2)
        .map((genre) => genre.name)
        .join(" / ") || featured.genre,
    titleTop: featured.titleTop,
    titleBottom: featured.titleBottom,
    subtitle: featured.subtitle,
    description: featured.description,
    image: game.backgroundImage,
    rating: game.rating,
    releaseDate: game.released,
  };
}

/* =========================================
   DESKTOP HERO SCENE
========================================= */

function HeroScene({ chapter, index }) {
  return (
    <article
      data-hero-scene
      className="absolute inset-0 overflow-hidden opacity-0"
      style={{ zIndex: index + 1 }}
      aria-label={`Featured game: ${chapter.titleTop} ${chapter.titleBottom}`}
    >
      {/* Background artwork */}
      <img
        data-hero-image
        src={chapter.image}
        alt=""
        aria-hidden="true"
        fetchPriority={index === 0 ? "high" : "auto"}
        className="absolute inset-0 h-full w-full scale-[1.1] object-cover object-center"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      {/* Cinematic overlays */}
      <div className="pointer-events-none absolute inset-0 bg-black/25" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/75 to-[#090a0f]/15" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-[#090a0f]/55" />

      {/* Subtle violet ambient light */}
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[140px]" />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center px-6 pb-14 pt-24 sm:px-10 lg:px-20">
        <div data-hero-copy className="w-full max-w-4xl">
          {/* Chapter badge: controller icon instead of glitter */}
          <div
            data-reveal
            className="mb-7 flex flex-wrap items-center gap-3"
          >
            <span className="flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-3.5 py-2 backdrop-blur-lg">
              <Gamepad2
                size={15}
                strokeWidth={1.8}
                className="text-violet-300"
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200 sm:text-xs">
                CHAPTER {chapter.number}
              </span>
            </span>

            <span className="hidden h-px w-9 bg-white/30 sm:block" />

            <span className="text-[10px] uppercase tracking-[0.18em] text-white/60 sm:text-xs">
              {chapter.genre}
            </span>

            {Number(chapter.rating) > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                <Star
                  size={13}
                  fill="currentColor"
                  className="text-violet-300"
                />
                {Number(chapter.rating).toFixed(1)}
              </span>
            )}
          </div>

          {/* Eyebrow */}
          <p
            data-reveal
            className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-300 sm:text-xs"
          >
            {chapter.label}
          </p>

          {/* Cinematic game title */}
          <h1 className="break-words text-[clamp(3rem,7.8vw,7.5rem)] font-black leading-[0.87] tracking-[-0.075em] text-white">
            <span data-reveal-line className="block">
              {chapter.titleTop}
            </span>

            <span
              data-reveal-line
              className="block bg-gradient-to-r from-white via-white to-violet-300 bg-clip-text text-transparent"
            >
              {chapter.titleBottom}
            </span>
          </h1>

          {/* Tagline */}
          <h2
            data-reveal
            className="mt-6 text-[10px] font-bold leading-6 tracking-[0.13em] text-violet-200 sm:text-sm"
          >
            {chapter.subtitle}
          </h2>

          {/* Description */}
          <p
            data-reveal
            className="mt-4 max-w-lg text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8"
          >
            {chapter.description}
          </p>

          {/* Actions */}
          <div data-reveal className="mt-8 flex flex-wrap gap-3 sm:mt-9">
            <a
              href="#discover"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-violet-500 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 sm:px-6"
            >
              Explore Games

              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>

            <a
              href="#genres"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-300 hover:border-white/40 hover:bg-white/[0.08] sm:px-6"
            >
              Browse Genres
              <ArrowDown size={16} className="text-violet-300" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================
   MAIN CINEMATIC HERO
========================================= */

export default function CinematicHero() {
  const desktopRef = useRef(null);
  const mobileCopyRef = useRef(null);

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  const mobileChapter = chapters[mobileIndex];

  /* ---------------------------------------
     Fetch our three chosen games from RAWG
  --------------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeaturedGames() {
      setLoading(true);
      setError("");

      try {
        const matches = await Promise.all(
          FEATURED_GAMES.map(async (featured) => {
            const data = await fetchGames({
              page: 1,
              pageSize: 40,
              search: featured.search,
              ordering: "-rating",
              signal: controller.signal,
            });

            const game = findMatchingGame(
              data.results ?? [],
              featured.search,
            );

            if (!game?.backgroundImage) {
              console.warn(
                `No RAWG artwork found for ${featured.search}`,
              );
              return null;
            }

            return { game, featured };
          }),
        );

        if (controller.signal.aborted) return;

        const loadedChapters = matches
          .filter(Boolean)
          .map(({ game, featured }, index) =>
            createFeaturedChapter(game, featured, index),
          );

        if (loadedChapters.length === 0) {
          throw new Error(
            "None of the selected games could be loaded from RAWG.",
          );
        }

        setChapters(loadedChapters);
        setMobileIndex(0);

        if (loadedChapters.length < FEATURED_GAMES.length) {
          console.warn(
            "Some featured games could not be loaded.",
            loadedChapters.map((chapter) => chapter.slug),
          );
        }
      } catch (err) {
        if (controller.signal.aborted || err.name === "AbortError") {
          return;
        }

        setError(
          err.message || "Unable to load featured games.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFeaturedGames();

    return () => controller.abort();
  }, [retryKey]);

  /* ---------------------------------------
     Desktop cinematic animation
  --------------------------------------- */

  useLayoutEffect(() => {
    const container = desktopRef.current;

    if (!container || chapters.length === 0) return;

    const media = gsap.matchMedia();

    media.add(
      {
        desktop: "(min-width: 768px)",
        reducedMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reducedMotion } = context.conditions;

        if (!desktop) return;

        const scenes = Array.from(
          container.querySelectorAll("[data-hero-scene]"),
        );

        const markers = Array.from(
          container.querySelectorAll("[data-chapter-marker]"),
        );

        if (scenes.length === 0) return;

        const getRevealItems = (scene) =>
          Array.from(
            scene.querySelectorAll(
              "[data-reveal], [data-reveal-line]",
            ),
          );

        const getImage = (scene) =>
          scene.querySelector("[data-hero-image]");

        // Set a stable starting state.
        gsap.set(scenes, { autoAlpha: 0 });

        scenes.forEach((scene) => {
          gsap.set(getImage(scene), { scale: 1.1 });

          gsap.set(getRevealItems(scene), {
            autoAlpha: 0,
            y: 26,
          });
        });

        gsap.set(scenes[0], { autoAlpha: 1 });

        // Keep the first chapter static for reduced-motion users.
        if (reducedMotion) {
          gsap.set(getRevealItems(scenes[0]), {
            clearProps: "all",
          });

          gsap.set(getImage(scenes[0]), {
            clearProps: "transform",
          });

          return;
        }

        // Opening reveal.
        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        intro.fromTo(
          getImage(scenes[0]),
          { scale: 1.12 },
          {
            scale: 1,
            duration: 2,
            ease: "power2.out",
          },
          0,
        );

        intro.to(
          getRevealItems(scenes[0]),
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
          },
          0.12,
        );

        // Chapter progress indicators.
        let activeChapter = 0;

        markers.forEach((marker, index) => {
          gsap.set(marker, {
            width: index === 0 ? 40 : 16,
            backgroundColor:
              index === 0 ? "#a78bfa" : "rgba(255,255,255,0.25)",
          });
        });

        const updateMarkers = (index) => {
          if (index === activeChapter) return;

          activeChapter = index;

          markers.forEach((marker, markerIndex) => {
            const active = markerIndex === index;

            gsap.to(marker, {
              width: active ? 40 : 16,
              backgroundColor: active
                ? "#a78bfa"
                : "rgba(255,255,255,0.25)",
              duration: 0.25,
              ease: "power2.out",
              overwrite: "auto",
            });
          });
        };

        // One scroll-driven timeline controls all three chapters.
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.8}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,

            onUpdate: (self) => {
              const index = Math.min(
                scenes.length - 1,
                Math.floor(self.progress * scenes.length),
              );

              updateMarkers(index);
            },
          },
        });

        for (let index = 0; index < scenes.length - 1; index++) {
          const current = scenes[index];
          const next = scenes[index + 1];
          const transitionStart = 0.9 + index * 1.4;

          // Current scene exits.
          timeline.to(
            current.querySelector("[data-hero-copy]"),
            {
              autoAlpha: 0,
              y: -22,
              duration: 0.45,
              ease: "power2.in",
            },
            transitionStart,
          );

          timeline.to(
            current,
            {
              autoAlpha: 0,
              duration: 0.75,
              ease: "power1.inOut",
            },
            transitionStart + 0.2,
          );

          // Next scene enters.
          timeline.fromTo(
            next,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.75,
              ease: "power1.inOut",
            },
            transitionStart + 0.2,
          );

          timeline.fromTo(
            getImage(next),
            { scale: 1.12 },
            {
              scale: 1,
              duration: 1.2,
              ease: "none",
            },
            transitionStart + 0.2,
          );

          timeline.fromTo(
            getRevealItems(next),
            {
              autoAlpha: 0,
              y: 26,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.075,
              ease: "power2.out",
            },
            transitionStart + 0.55,
          );
        }

        return () => {
          intro.kill();
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      },
    );

    return () => media.revert();
  }, [chapters]);

  /* ---------------------------------------
     Mobile chapter transitions
  --------------------------------------- */

  useLayoutEffect(() => {
    const content = mobileCopyRef.current;

    if (!content || !mobileChapter) return;

    const isMobile = window.matchMedia(
      "(max-width: 767px)",
    ).matches;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!isMobile || reducedMotion) return;

    const timeline = gsap.fromTo(
      content,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      },
    );

    return () => timeline.kill();
  }, [mobileIndex, chapters]);

  /* ---------------------------------------
     Loading and error states
  --------------------------------------- */

  if (chapters.length === 0) {
    return (
      <section
        id="home"
        className="flex min-h-[100svh] items-center justify-center bg-[#090a0f] px-6 pt-24"
      >
        <div className="max-w-md text-center">
          <Gamepad2
            size={34}
            className="mx-auto mb-5 text-violet-400"
          />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">
            {loading
              ? "DISCOVERING WORLDS..."
              : "THE UNIVERSE IS UNAVAILABLE"}
          </p>

          {loading && (
            <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-violet-400/25 border-t-violet-400" />
          )}

          {error && (
            <>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
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
            </>
          )}
        </div>
      </section>
    );
  }

  /* ---------------------------------------
     Render
  --------------------------------------- */

  return (
    <section
      id="home"
      aria-label="NEXORA featured games"
      className="relative isolate bg-[#090a0f]"
    >
      {/* Desktop: scroll-driven chapters */}
      <div
        ref={desktopRef}
        className="relative hidden h-[100svh] min-h-[620px] overflow-hidden bg-[#090a0f] md:block"
      >
        {chapters.map((chapter, index) => (
          <HeroScene
            key={chapter.id}
            chapter={chapter}
            index={index}
          />
        ))}

        {/* Persistent bottom indicators */}
        <div className="pointer-events-none absolute inset-x-0 bottom-7 z-30 mx-auto flex max-w-[1600px] items-center justify-between px-8 lg:px-20">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.23em] text-white/50">
            <ArrowDown size={14} className="text-violet-300" />
            Scroll to explore
          </div>

          <div className="flex items-center gap-3">
            <span className="mr-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
              Your next world
            </span>

            {chapters.map((chapter, index) => (
              <span
                key={chapter.id}
                data-chapter-marker
                aria-hidden="true"
                className="h-1 rounded-full bg-white/25"
                style={{ width: index === 0 ? 40 : 16 }}
              />
            ))}
          </div>

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            NEXORA / 001
          </span>
        </div>
      </div>

      {/* Mobile: natural scrolling and selectable chapters */}
      <div className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-8 pt-28 md:hidden">
        <img
          key={mobileChapter.id}
          src={mobileChapter.image}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-[#090a0f]/35" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#090a0f]/85 via-[#090a0f]/50 to-transparent" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/50 to-[#090a0f]/40" />

        <div
          ref={mobileCopyRef}
          className="relative z-10 mx-auto w-full max-w-xl"
        >
          <p className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
            <Gamepad2 size={15} strokeWidth={1.8} />
            CHAPTER {mobileChapter.number}
            <span className="text-white/50">/</span>
            {mobileChapter.genre}
          </p>

          <h1 className="break-words text-[clamp(3rem,12vw,5rem)] font-black leading-[0.86] tracking-[-0.075em] text-white">
            <span className="block">{mobileChapter.titleTop}</span>

            <span className="block bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
              {mobileChapter.titleBottom}
            </span>
          </h1>

          <h2 className="mt-6 text-[10px] font-bold leading-6 tracking-[0.12em] text-violet-200">
            {mobileChapter.subtitle}
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-300">
            {mobileChapter.description}
          </p>

          {Number(mobileChapter.rating) > 0 && (
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
              <Star
                size={15}
                fill="currentColor"
                className="text-violet-300"
              />
              {Number(mobileChapter.rating).toFixed(1)}
              <span className="text-xs text-zinc-500">
                RAWG rating
              </span>
            </p>
          )}

          <a
            href="#discover"
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-md bg-violet-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-400"
          >
            Explore Games
            <ArrowUpRight size={18} />
          </a>

          {/* Mobile chapter selector */}
          <div className="mt-9 border-t border-white/15 pt-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/50">
              Choose your next world
            </p>

            <div className="flex flex-wrap gap-2">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  type="button"
                  aria-pressed={mobileIndex === index}
                  onClick={() => setMobileIndex(index)}
                  className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors duration-300 ${
                    mobileIndex === index
                      ? "border-violet-400 bg-violet-500/20 text-white"
                      : "border-white/15 bg-black/20 text-zinc-400 hover:text-white"
                  }`}
                >
                  {chapter.number} / {chapter.genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

