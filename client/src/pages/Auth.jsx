
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Gamepad2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import gsap from "gsap";
import { fetchGames } from "../services/gameService";

const GAME_SCENES = [
  {
    search: "Cyberpunk 2077",
    expectedTitle: "Cyberpunk 2077",
    kicker: "WELCOME TO NIGHT CITY",
    tagline: "No rules. No limits. Your story.",
    description:
      "In a city that never sleeps, your next adventure is waiting.",
  },
  {
    search: "Assassin's Creed Unity",
    expectedTitle: "Assassin's Creed Unity",
    kicker: "PARIS. 1789.",
    tagline: "Become the shadow of a revolution.",
    description:
      "Move through a city on the edge of chaos. Every rooftop hides a new story.",
  },
  {
    search: "The Last of Us",
    expectedTitle: "The Last of Us",
    kicker: "SURVIVAL IS EVERYTHING",
    tagline: "Some journeys change everything.",
    description:
      "Step into a haunting world where survival is only the beginning.",
  },
];

const FALLBACK_SCENE = {
  id: "nexora-world",
  name: "The NEXORA Universe",
  kicker: "YOUR NEXT ADVENTURE STARTS HERE",
  tagline: "Every world has a story.",
  description:
    "Discover unforgettable worlds. Find your next obsession. Play your way.",
  image:
    "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2000&q=90",
};

function normalizeTitle(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}


function findMatchingGame(games, expectedTitle) {
  const expected = normalizeTitle(expectedTitle);

  if (expected === "the last of us") {
    // Prefer the original game or its Part I remake.
    return (
      games.find(
        (game) => normalizeTitle(game.name) === "the last of us"
      ) ||
      games.find(
        (game) => normalizeTitle(game.name) === "the last of us remastered"
      ) ||
      games.find((game) =>
        /^the last of us part i\b/.test(normalizeTitle(game.name))
      ) ||
      null
    );
  }

  return (
    games.find((game) => normalizeTitle(game.name) === expected) ||
    games.find((game) =>
      normalizeTitle(game.name).startsWith(expected + " ")
    ) ||
    null
  );
}


export default function Auth() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  const [scenes, setScenes] = useState([FALLBACK_SCENE]);
  const [activeScene, setActiveScene] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: true,
  });

  const sceneLayers = useRef([]);
  const sceneCopy = useRef(null);
  const activeSceneRef = useRef(0);

  const currentScene = scenes[activeScene] || scenes[0];

  // Load the selected game artwork from the existing backend.
  useEffect(() => {
    const controller = new AbortController();

    async function loadScenes() {
      const results = await Promise.all(
        GAME_SCENES.map(async (scene) => {
          try {
            const response = await fetchGames({
              page: 1,
              pageSize: 12,
              search: scene.search,
              signal: controller.signal,
            });

            const games = Array.isArray(response?.results)
              ? response.results
              : [];

            const game = findMatchingGame(
              games,
              scene.expectedTitle
            );

            const image =
              game?.backgroundImage || game?.background_image;

            if (!game || !image) return null;

            return {
              ...scene,
              id: game.id,
              name: game.name,
              image,
            };
          } catch (error) {
            if (error.name !== "AbortError") {
              console.error(
                `Unable to load artwork for ${scene.expectedTitle}:`,
                error
              );
            }

            return null;
          }
        })
      );

      if (controller.signal.aborted) return;

      const loadedScenes = results.filter(Boolean);

      if (loadedScenes.length > 0) {
        setScenes(loadedScenes);
        setActiveScene(0);
      }
    }

    loadScenes();

    return () => controller.abort();
  }, []);

  // Keep the active scene index available to animation handlers.
  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  // Automatically transition to the next game.
  useEffect(() => {
    if (scenes.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveScene(
        (current) => (current + 1) % scenes.length
      );
    }, 8000);

    return () => window.clearInterval(interval);
  }, [scenes.length]);

  // Cinematic crossfades, slow camera zoom and animated text.
  useEffect(() => {
    sceneLayers.current.forEach((layer, index) => {
      if (!layer) return;

      gsap.killTweensOf(layer);

      if (index === activeScene) {
        gsap.fromTo(
          layer,
          {
            autoAlpha: 0,
            scale: 1.13,
            x: 0,
            y: 0,
          },
          {
            autoAlpha: 1,
            scale: 1.035,
            duration: 1.7,
            ease: "power3.out",
          }
        );
      } else {
        gsap.set(layer, {
          autoAlpha: 0,
          scale: 1.08,
        });
      }
    });

    if (sceneCopy.current) {
      gsap.fromTo(
        sceneCopy.current,
        {
          autoAlpha: 0,
          y: 24,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    }

    return () => {
      sceneLayers.current.forEach((layer) => {
        if (layer) gsap.killTweensOf(layer);
      });

      if (sceneCopy.current) {
        gsap.killTweensOf(sceneCopy.current);
      }
    };
  }, [activeScene, scenes]);

  // Subtle mouse-responsive movement on desktop.
  function handlePointerMove(event) {
    if (event.pointerType === "touch") return;

    const layer = sceneLayers.current[activeSceneRef.current];

    if (!layer) return;

    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    gsap.to(layer, {
      x: x * -14,
      y: y * -10,
      duration: 1,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handlePointerLeave() {
    const layer = sceneLayers.current[activeSceneRef.current];

    if (!layer) return;

    gsap.to(layer, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  function changeScene(direction) {
    setActiveScene(
      (current) =>
        (current + direction + scenes.length) % scenes.length
    );
  }

  function handleInputChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (isRegister && form.password !== form.confirmPassword) {
      setNotice("Your passwords do not match.");
      return;
    }

    setNotice(
      isRegister
        ? "The registration UI is ready. Account creation still needs backend integration."
        : "The login UI is ready. Authentication still needs backend integration."
    );
  }

  return (
    <main
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-screen overflow-hidden bg-[#08080d] text-white"
    >
      {/* FULL-SCREEN ANIMATED GAME ARTWORK */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            ref={(element) => {
              sceneLayers.current[index] = element;
            }}
            className="absolute inset-0"
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            <img
              src={scene.image}
              alt=""
              className="h-full w-full object-cover object-center"
              draggable="false"
            />
          </div>
        ))}

        {/* Cinematic colour grading */}
        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#08080d]/45 via-[#08080d]/50 to-[#08080d]/90" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-transparent to-[#08080d]/35" />
      </div>

      {/* NO NAVBAR — ONLY A SMALL RETURN LINK */}
      <div className="absolute left-5 top-5 z-20 sm:left-9 sm:top-8">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to NEXORA
        </Link>
      </div>

      {/* PAGE CONTENT */}
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 items-center gap-10 px-5 pb-10 pt-24 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_450px] lg:gap-12 lg:px-16 lg:pt-16">

        {/* CINEMATIC GAME INTRO — DESKTOP */}
        <section className="hidden min-h-[540px] flex-col justify-end pb-8 lg:flex">
          <div ref={sceneCopy} className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-violet-400" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
                {currentScene.kicker}
              </span>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
              THE NEXORA EXPERIENCE
            </p>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-tight xl:text-7xl">
              {currentScene.tagline}
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/65 xl:text-lg">
              {currentScene.description}
            </p>

            {/* PREVIOUS / NEXT SCENE */}
            {scenes.length > 1 && (
              <div className="mt-9 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => changeScene(-1)}
                  aria-label="Previous game"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-violet-300 hover:text-violet-200"
                >
                  <ArrowLeft size={17} />
                </button>

                <div className="flex items-center gap-2">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      type="button"
                      aria-label={`Show ${scene.name}`}
                      aria-pressed={activeScene === index}
                      onClick={() => setActiveScene(index)}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        activeScene === index
                          ? "w-10 bg-violet-400"
                          : "w-5 bg-white/35 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => changeScene(1)}
                  aria-label="Next game"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-violet-300 hover:text-violet-200"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            )}

            <div className="mt-7 flex items-center gap-3 text-sm text-white/50">
              <Gamepad2 size={18} className="text-violet-300" />

              <span>
                Now featuring{" "}
                <span className="text-white/80">
                  {currentScene.name}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* LOGIN / REGISTER CARD */}
        <section
          className="w-full max-w-[450px] justify-self-center rounded-[28px] border border-white/15 bg-[#101016]/80 p-6 backdrop-blur-2xl sm:p-9 lg:justify-self-end"
          style={{ perspective: "1000px" }}
        >
          {/* FORM BRAND */}
          <Link to="/" className="group mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600/15">
              <Gamepad2
                size={25}
                className="text-violet-300 transition-transform duration-300 group-hover:rotate-[-12deg] group-hover:scale-110"
              />
            </div>

            <div>
              <p className="text-lg font-black tracking-[0.15em]">
                NEXORA
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Enter another world
              </p>
            </div>
          </Link>

          {/* LOGIN / REGISTER SWITCH */}
          <div className="mb-8 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
            <Link
              to="/login"
              className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors duration-300 ${
                !isRegister
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white"
              }`}
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors duration-300 ${
                isRegister
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white"
              }`}
            >
              Register
            </Link>
          </div>

          {/* HEADING */}
          <div className="mb-7">
            <h2 className="text-3xl font-bold tracking-tight">
              {isRegister ? "Create account" : "Welcome back"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              {isRegister
                ? "Your next adventure starts with you."
                : "Your next adventure is waiting for you."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* USERNAME */}
            {isRegister && (
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-xs font-medium text-white/70"
                >
                  Username
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                  />

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleInputChange}
                    required
                    minLength={3}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-violet-400/70"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-white/70"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-violet-400/70"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium text-white/70"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-violet-400/70"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/80"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            {isRegister && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-medium text-white/70"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-violet-400/70"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/80"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* REMEMBER ME / FORGOT PASSWORD */}
            {!isRegister && (
              <div className="flex items-center justify-between gap-3 text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-white/55">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleInputChange}
                    className="accent-violet-500"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setNotice(
                      "Password recovery will be available when authentication is connected."
                    )
                  }
                  className="text-violet-300 transition-colors hover:text-violet-200"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* STATUS MESSAGE */}
            {notice && (
              <p
                role="status"
                className="rounded-xl border border-violet-400/20 bg-violet-400/[0.07] p-3 text-sm leading-5 text-violet-200"
              >
                {notice}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-500 active:bg-violet-700"
            >
              {isRegister ? "Create account" : "Sign in"}

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </form>

          {/* FORM FOOTER */}
          <p className="mt-7 text-center text-sm text-white/45">
            {isRegister
              ? "Already have an account?"
              : "New to NEXORA?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-semibold text-violet-300 transition-colors hover:text-violet-200"
            >
              {isRegister ? "Login" : "Get started"}
            </Link>
          </p>

          <div className="mt-7 border-t border-white/[0.08] pt-5">
            <p className="text-center text-[10px] uppercase tracking-[0.18em] text-white/25">
              Your next world is waiting
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
