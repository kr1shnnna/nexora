
import { useState } from "react";
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

const WALLPAPER =
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85";

export default function Auth() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

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

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setNotice("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (isRegister && form.password !== form.confirmPassword) {
      setNotice("Your passwords do not match. Please try again.");
      return;
    }

    if (isRegister && form.password.length < 8) {
      setNotice("Your password must contain at least 8 characters.");
      return;
    }

    setNotice(
      "The design is ready. We'll connect your account securely in the next step.",
    );
  }

  return (
    <main className="min-h-screen bg-[#090a0f] text-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* =====================================
          CINEMATIC LEFT PANEL
      ====================================== */}

      <section className="relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden px-6 py-6 sm:min-h-[370px] sm:px-10 sm:py-9 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16">
        {/* Background image */}
        <img
          src={WALLPAPER}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
        />

        {/* Layered cinematic grading */}
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[#090a0f]/35" />

        <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-[#090a0f]/85 via-[#090a0f]/45 to-[#090a0f]/35" />

        <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-t from-[#090a0f] via-transparent to-[#090a0f]/35" />

        {/* Violet ambient light */}
        <div className="pointer-events-none absolute -left-36 top-1/3 -z-10 h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />

        {/* Branding */}
        <Link
          to="/"
          className="group relative z-10 inline-flex w-fit items-center gap-2.5"
        >
          <Gamepad2
            size={29}
            strokeWidth={1.8}
            className="text-violet-300 transition-transform duration-300 group-hover:-rotate-6"
          />

          <span className="text-xl font-black tracking-[0.19em] text-white">
            NEXORA<span className="text-violet-400">.</span>
          </span>
        </Link>

        {/* Hero message */}
        <div className="relative z-10 mx-auto my-12 w-full max-w-2xl lg:my-auto lg:py-20">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-9 bg-violet-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-200 sm:text-xs">
              YOUR NEXT CHAPTER
            </span>
          </div>

          <h1 className="max-w-2xl text-4xl font-black leading-[0.91] tracking-[-0.065em] sm:text-6xl lg:text-7xl xl:text-[88px]">
            YOUR WORLD.
            <br />

            <span className="bg-gradient-to-r from-white via-white to-violet-300 bg-clip-text text-transparent">
              YOUR RULES.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
            Revisit legendary adventures, discover new worlds, and
            find the next game you won't want to put down.
          </p>

          {/* Minimal decorative details */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["DISCOVER", "COLLECT", "EXPLORE"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/15 bg-black/15 px-3 py-2 text-[9px] font-semibold tracking-[0.2em] text-zinc-200 backdrop-blur-md sm:text-[10px]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom caption */}
        <div className="relative z-10 hidden items-center justify-between gap-4 lg:flex">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
            NEXORA / PLAYER ACCESS
          </p>

          <p className="text-xs text-zinc-400">
            A universe of possibilities.
          </p>
        </div>
      </section>

      {/* =====================================
          AUTHENTICATION FORM PANEL
      ====================================== */}

      <section className="relative flex min-h-[650px] items-center justify-center overflow-hidden border-t border-white/[0.06] bg-[#0c0d14] px-5 py-14 sm:px-10 lg:min-h-screen lg:border-l lg:border-t-0 lg:px-12 lg:py-20 xl:px-20">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-violet-600/[0.08] blur-[110px]" />

        <div className="relative w-full max-w-[430px]">
          {/* Return to store */}
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} />
            Back to the universe
          </Link>

          {/* Heading */}
          <div className="mb-9">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-400">
              {isRegister ? "JOIN THE UNIVERSE" : "PLAYER ACCESS"}
            </p>

            <h2 className="text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl">
              {isRegister ? "Create your account." : "Welcome back."}
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {isRegister
                ? "Your next adventure starts with a new account."
                : "Sign in and pick up where your next adventure begins."}
            </p>
          </div>

          {/* Login / registration switch */}
          <div className="mb-8 grid grid-cols-2 rounded-lg border border-white/[0.08] bg-[#11121a] p-1">
            <Link
              to="/login"
              className={`rounded-md px-3 py-3 text-center text-sm font-semibold transition-all duration-300 ${
                !isRegister
                  ? "bg-[#252433] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className={`rounded-md px-3 py-3 text-center text-sm font-semibold transition-all duration-300 ${
                isRegister
                  ? "bg-[#252433] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              Create account
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-xs font-medium text-zinc-300"
                >
                  Username
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    minLength={3}
                    maxLength={30}
                    required
                    value={form.username}
                    onChange={updateField}
                    placeholder="Choose a username"
                    className="h-12 w-full rounded-lg border border-white/[0.09] bg-[#11121a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-zinc-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={updateField}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-lg border border-white/[0.09] bg-[#11121a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-zinc-300"
                >
                  Password
                </label>

                {!isRegister && (
                  <button
                    type="button"
                    onClick={() =>
                      setNotice(
                        "Password recovery will be available when authentication is connected.",
                      )
                    }
                    className="text-xs text-violet-300 transition-colors hover:text-violet-200"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  minLength={isRegister ? 8 : undefined}
                  required
                  value={form.password}
                  onChange={updateField}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-lg border border-white/[0.09] bg-[#11121a] pl-11 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/10"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {isRegister && (
                <p className="mt-2 text-[11px] text-zinc-500">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            {isRegister && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-medium text-zinc-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Re-enter your password"
                    className="h-12 w-full rounded-lg border border-white/[0.09] bg-[#11121a] pl-11 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
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

            {!isRegister && (
              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={updateField}
                  className="h-4 w-4 rounded border-white/20 accent-violet-500"
                />
                Keep me signed in
              </label>
            )}

            {/* Honest UI-preview feedback */}
            {notice && (
              <p
                role="status"
                className="rounded-lg border border-violet-400/20 bg-violet-400/[0.07] px-4 py-3 text-xs leading-6 text-violet-200"
              >
                {notice}
              </p>
            )}

            <button
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-bold text-white shadow-[0_0_35px_rgba(139,92,246,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-400 hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
            >
              {isRegister ? "Create your account" : "Sign in to NEXORA"}

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </form>

          {/* Account switch */}
          <p className="mt-7 text-center text-xs leading-6 text-zinc-500">
            {isRegister
              ? "Already part of NEXORA?"
              : "New to NEXORA?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-semibold text-violet-300 transition-colors hover:text-violet-200"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>

          <div className="mt-9 border-t border-white/[0.07] pt-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Your games. Your worlds. Your universe.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
