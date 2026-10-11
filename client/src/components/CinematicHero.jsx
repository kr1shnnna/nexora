
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    id: "eclipse",
    number: "01",
    label: "THE UNKNOWN",
    genre: "SCI-FI RPG",
    titleTop: "BEYOND",
    titleBottom: "THE ECLIPSE.",
    subtitle: "THE UNIVERSE IS NOT WHAT IT SEEMS.",
    description:
      "Travel beyond the edge of the known universe. Discover forgotten worlds and uncover the secrets hidden among the stars.",
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=85",
  },
  {
    id: "kingdom",
    number: "02",
    label: "A WORLD FORGED IN DARKNESS",
    genre: "DARK FANTASY",
    titleTop: "KINGDOM",
    titleBottom: "OF ASH.",
    subtitle: "EVERY LEGEND HAS A DARK SIDE.",
    description:
      "Enter a forgotten realm of ancient ruins, fallen kingdoms, and impossible choices. Your next adventure begins here.",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2400&q=85",
  },
  {
    id: "afterlight",
    number: "03",
    label: "NOTHING STAYS BURIED",
    genre: "SURVIVAL ADVENTURE",
    titleTop: "AFTER",
    titleBottom: "THE FALL.",
    subtitle: "THE WORLD ENDED. YOUR STORY DIDN'T.",
    description:
      "Step into the unknown. Explore mysterious landscapes, discover lost stories, and find a reason to keep moving forward.",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=85",
  },
];

function HeroScene({ chapter, index }) {
  return (
    <article
      data-hero-scene
      className={`absolute inset-0 overflow-hidden ${
        index === 0 ? "opacity-100" : "opacity-0"
      }`}
      style={{ zIndex: index + 1 }}
    >
      {/* Scene artwork */}
      <img
        data-hero-image
        src={chapter.image}
        alt=""
        aria-hidden="true"
        fetchPriority={index === 0 ? "high" : "auto"}
        className="absolute inset-0 h-full w-full scale-[1.1] object-cover object-center"
      />

      {/* Color grading */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/75 to-[#090a0f]/15" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-[#090a0f]/55" />

      {/* Ambient light */}
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/[0.12] blur-[150px]" />

      {/* Scene content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center px-6 pb-12 pt-24 sm:px-10 lg:px-20">
        <div data-hero-copy className="max-w-4xl">
          <div
            data-reveal
            className="mb-7 flex flex-wrap items-center gap-3"
          >
            <span className="flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-3.5 py-2 backdrop-blur-lg">
              <Sparkles size={13} className="text-violet-300" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200 sm:text-xs">
                CHAPTER {chapter.number}
              </span>
            </span>

            <span className="hidden h-px w-9 bg-white/30 sm:block" />

            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 sm:text-xs">
              {chapter.genre}
            </span>
          </div>

          <p
            data-reveal
            className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-300 sm:text-xs"
          >
            {chapter.label}
          </p>

          <h2
            data-reveal
            className="text-[clamp(3.25rem,8vw,8rem)] font-black leading-[0.84] tracking-[-0.075em] text-white"
          >
            {chapter.titleTop}
            <br />
            <span className="bg-gradient-to-r from-white via-white to-violet-300 bg-clip-text text-transparent">
              {chapter.titleBottom}
            </span>
          </h2>

          <h3
            data-reveal
            className="mt-6 text-[10px] font-bold leading-6 tracking-[0.13em] text-violet-200 sm:text-sm"
          >
            {chapter.subtitle}
          </h3>

          <p
            data-reveal
            className="mt-4 max-w-lg text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8"
          >
            {chapter.description}
          </p>

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

export default function CinematicHero() {
  const desktopRef = useRef(null);
  const mobileCopyRef = useRef(null);

  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileChapter = chapters[mobileIndex];

  /*
   * Desktop: scroll-controlled cinematic chapters.
   */
  useLayoutEffect(() => {
    const pin = desktopRef.current;

    if (!pin) return;

    const media = gsap.matchMedia();

    media.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const scenes = Array.from(
          pin.querySelectorAll("[data-hero-scene]"),
        );

        const markers = Array.from(
          pin.querySelectorAll("[data-chapter-marker]"),
        );

        if (!scenes.length) return;

        const getRevealItems = (scene) =>
          Array.from(scene.querySelectorAll("[data-reveal]"));

        const getImage = (scene) =>
          scene.querySelector("[data-hero-image]");

        // Establish the starting state before the browser paints.
        gsap.set(scenes, { autoAlpha: 0 });

        scenes.forEach((scene) => {
          gsap.set(getImage(scene), { scale: 1.1 });
          gsap.set(getRevealItems(scene), {
            autoAlpha: 0,
            y: 26,
          });
        });

        gsap.set(scenes[0], { autoAlpha: 1 });

        // Opening reveal: independent of scrolling.
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

        const updateMarkers = (index) => {
          if (index === activeChapter) return;

          activeChapter = index;

          markers.forEach((marker, markerIndex) => {
            const active = markerIndex === index;

            marker.classList.toggle("bg-violet-400", active);
            marker.classList.toggle("bg-white/25", !active);
            marker.classList.toggle("w-10", active);
            marker.classList.toggle("w-4", !active);
          });
        };

        markers.forEach((marker, index) => {
          marker.classList.toggle("bg-violet-400", index === 0);
          marker.classList.toggle("bg-white/25", index !== 0);
          marker.classList.toggle("w-10", index === 0);
          marker.classList.toggle("w-4", index !== 0);
        });

        // One timeline controls every scene transition.
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.8}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,

            onUpdate: (self) => {
              const progress = self.progress;

              const index =
                progress < 0.32 ? 0 : progress < 0.72 ? 1 : 2;

              updateMarkers(index);
            },
          },
        });

        for (let index = 0; index < scenes.length - 1; index++) {
          const current = scenes[index];
          const next = scenes[index + 1];
          const transitionStart = 0.7 + index * 1.4;

          // Current chapter exits.
          timeline.to(
            current.querySelector("[data-hero-copy]"),
            {
              autoAlpha: 0,
              y: -20,
              duration: 0.4,
              ease: "power2.in",
            },
            transitionStart,
          );

          timeline.to(
            current,
            {
              autoAlpha: 0,
              duration: 0.8,
              ease: "power1.inOut",
            },
            transitionStart + 0.15,
          );

          // Next chapter enters.
          timeline.fromTo(
            next,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.8,
              ease: "power1.inOut",
            },
            transitionStart + 0.15,
          );

          timeline.fromTo(
            getImage(next),
            { scale: 1.12 },
            {
              scale: 1,
              duration: 1.3,
              ease: "none",
            },
            transitionStart + 0.15,
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
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
            },
            transitionStart + 0.48,
          );
        }

        return () => {
          intro.kill();
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      },
    );

    // Respect visitors who prefer reduced motion.
    media.add(
      "(min-width: 768px) and (prefers-reduced-motion: reduce)",
      () => {
        const scenes = Array.from(
          pin.querySelectorAll("[data-hero-scene]"),
        );

        gsap.set(scenes, { autoAlpha: 0 });

        if (scenes[0]) {
          gsap.set(scenes[0], { autoAlpha: 1 });
          gsap.set(
            scenes[0].querySelectorAll("[data-reveal]"),
            { clearProps: "all" },
          );
          gsap.set(
            scenes[0].querySelector("[data-hero-image]"),
            { clearProps: "transform" },
          );
        }
      },
    );

    return () => media.revert();
  }, []);

  /*
   * Mobile: animate content changes without pinning the page.
   */
  useLayoutEffect(() => {
    const content = mobileCopyRef.current;

    if (!content) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isMobile = window.matchMedia(
      "(max-width: 767px)",
    ).matches;

    if (reducedMotion || !isMobile) return;

    const tween = gsap.fromTo(
      content,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      },
    );

    return () => tween.kill();
  }, [mobileIndex]);

  return (
    <section
      id="home"
      aria-label="NEXORA featured game showcase"
      className="relative isolate bg-[#090a0f]"
    >
      {/* Desktop cinematic showcase */}
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

        {/* Persistent chapter indicator */}
        <div className="pointer-events-none absolute inset-x-0 bottom-7 z-20 mx-auto flex max-w-[1600px] items-center justify-between px-8 lg:px-20">
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
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === 0
                    ? "w-10 bg-violet-400"
                    : "w-4 bg-white/25"
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            NEXORA / 001
          </span>
        </div>
      </div>

      {/* Mobile: natural scrolling, manually selected chapters */}
      <div className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-8 pt-28 md:hidden">
        <img
          key={mobileChapter.id}
          src={mobileChapter.image.replace("w=2400", "w=1100")}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#090a0f]/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f]/85 via-[#090a0f]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/50 to-[#090a0f]/45" />

        <div
          ref={mobileCopyRef}
          className="relative z-10 mx-auto w-full max-w-xl"
        >
          <p className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.23em] text-violet-300">
            <Sparkles size={13} />
            Chapter {mobileChapter.number} · {mobileChapter.genre}
          </p>

          <h1 className="text-[clamp(3.4rem,13vw,5.5rem)] font-black leading-[0.85] tracking-[-0.075em] text-white">
            {mobileChapter.titleTop}
            <br />
            <span className="bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
              {mobileChapter.titleBottom}
            </span>
          </h1>

          <h2 className="mt-6 text-[10px] font-bold leading-6 tracking-[0.12em] text-violet-200">
            {mobileChapter.subtitle}
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-300">
            {mobileChapter.description}
          </p>

          <a
            href="#discover"
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-md bg-violet-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-400"
          >
            Explore Games
            <ArrowUpRight size={18} />
          </a>

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
