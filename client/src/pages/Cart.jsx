
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gamepad2,
  LoaderCircle,
  LockKeyhole,
  Minus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import {
  checkoutCart,
  fetchCart,
  removeCartItem,
} from "../services/accountService";
import { getAuthToken } from "../services/authService";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [checkoutResult, setCheckoutResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      if (!getAuthToken()) {
        setError("Please log in to view your shopping cart.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCart();

        if (cancelled) return;

        setCart(Array.isArray(data.cart) ? data.cart : []);
        setTotal(Number(data.total) || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your cart.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(gameId) {
    setError("");
    setRemovingId(gameId);

    try {
      const data = await removeCartItem(gameId);

      setCart(Array.isArray(data.cart) ? data.cart : []);
      setTotal(Number(data.total) || 0);
      setCheckoutResult(null);
    } catch (err) {
      setError(err.message || "Unable to remove this game.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleCheckout() {
    if (!cart.length || checkingOut) return;

    setError("");
    setCheckingOut(true);

    try {
      const result = await checkoutCart();

      setCart([]);
      setTotal(0);
      setCheckoutResult(result);
    } catch (err) {
      setError(err.message || "Checkout could not be completed.");
    } finally {
      setCheckingOut(false);
    }
  }

  const needsLogin =
    error.toLowerCase().includes("log in") ||
    error.toLowerCase().includes("session has expired");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#09090d] text-white">
      <Navbar />

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-40 top-0 h-[450px] w-[450px] rounded-full bg-violet-700/[0.07] blur-[140px]" />
        <div className="absolute -left-40 top-[450px] h-[350px] w-[350px] rounded-full bg-indigo-600/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 pb-20 pt-32 sm:px-8 lg:px-12">

        {/* Page heading */}
        <div className="mb-10">
          <Link
            to="/discover"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Continue exploring
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                YOUR NEXT ADVENTURE
              </p>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Shopping <span className="text-white/40">Cart</span>
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/45 sm:text-base">
                Your next favourite world is just one step away.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/65">
              <ShoppingCart size={16} className="text-violet-300" />
              {cart.length} {cart.length === 1 ? "game" : "games"}
            </div>
          </div>
        </div>

        {/* Checkout success */}
        {checkoutResult && (
          <section
            role="status"
            className="mb-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <CheckCircle2
                  size={30}
                  className="mt-1 shrink-0 text-emerald-300"
                />

                <div>
                  <h2 className="text-xl font-bold">
                    {checkoutResult.itemCount > 0
                      ? "You're ready to play."
                      : "Your library is up to date."}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {checkoutResult.itemCount > 0
                      ? `${checkoutResult.itemCount} ${checkoutResult.itemCount === 1 ? "game has" : "games have"} been added to your NEXORA library. This was a simulated purchase, not a real payment.`
                      : checkoutResult.message}
                  </p>

                  {checkoutResult.itemCount > 0 && (
                    <p className="mt-3 text-sm font-semibold text-emerald-200">
                      Demo total: {formatPrice(checkoutResult.total)}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/library"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition-colors hover:bg-violet-500"
              >
                View My Library
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200"
          >
            <XCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>

            {needsLogin && (
              <Link
                to="/login"
                className="shrink-0 font-semibold underline underline-offset-4"
              >
                Login
              </Link>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
            <LoaderCircle
              size={34}
              className="animate-spin text-violet-300"
            />
            <p className="text-sm text-white/45">
              Loading your cart...
            </p>
          </div>
        ) : cart.length === 0 ? (
          /* Empty cart */
          <section className="flex min-h-[390px] flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-14 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035]">
              <ShoppingBag
                size={34}
                strokeWidth={1.3}
                className="text-violet-300"
              />
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              {needsLogin ? "Your cart awaits" : "Nothing here. Yet."}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
              {needsLogin
                ? "Sign in to see your games and continue where you left off."
                : "Every great gaming collection starts somewhere. Find a world worth exploring."}
            </p>

            <Link
              to={needsLogin ? "/login" : "/discover"}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-violet-500"
            >
              {needsLogin ? "Sign in" : "Discover Games"}
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

            {/* Cart items */}
            <section className="min-w-0">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Your selection</h2>
                <span className="text-xs text-white/40">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="space-y-4">
                {cart.map((game) => (
                  <article
                    key={game.gameId}
                    className="group flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-colors duration-300 hover:border-white/[0.15] sm:flex-row sm:items-center sm:p-5"
                  >
                    {/* Game artwork */}
                    <Link
                      to={`/games/${game.gameId}`}
                      className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 to-[#111016] sm:aspect-[4/3] sm:w-40"
                    >
                      {game.backgroundImage && (
                        <img
                          src={game.backgroundImage}
                          alt={game.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </Link>

                    {/* Game info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">
                        DIGITAL GAME
                      </p>

                      <Link
                        to={`/games/${game.gameId}`}
                        className="text-lg font-bold leading-snug transition-colors hover:text-violet-200 sm:text-xl"
                      >
                        {game.name}
                      </Link>

                      <p className="mt-2 text-xs text-white/40">
                        Permanent demo-library ownership
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRemove(game.gameId)}
                        disabled={
                          removingId === game.gameId || checkingOut
                        }
                        className="mt-4 inline-flex w-fit items-center gap-2 text-xs text-white/40 transition-colors hover:text-red-300 disabled:opacity-40"
                      >
                        {removingId === game.gameId ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {removingId === game.gameId
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between border-t border-white/[0.07] pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                      <span className="text-xs text-white/40 sm:hidden">
                        Demo price
                      </span>

                      <span className="text-lg font-bold tabular-nums">
                        {formatPrice(game.price)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                to="/discover"
                className="mt-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                <ArrowLeft size={15} />
                Add more games
              </Link>
            </section>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-8">
              <div className="rounded-2xl border border-white/10 bg-[#101016]/90 p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  YOUR ORDER
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  Order summary
                </h2>

                <div className="mt-7 space-y-4 text-sm">
                  <div className="flex items-center justify-between text-white/55">
                    <span>Games</span>
                    <span>{cart.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-white/55">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-white/55">
                    <span>Taxes</span>
                    <span>₹0</span>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="flex items-end justify-between gap-3">
                    <span className="font-semibold">Total</span>

                    <span className="text-3xl font-black tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkingOut || cart.length === 0}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 text-sm font-bold transition-colors duration-300 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkingOut ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Demo Purchase
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                  <LockKeyhole
                    size={17}
                    className="mt-0.5 shrink-0 text-violet-300"
                  />

                  <p className="text-[11px] leading-5 text-white/45">
                    Demo checkout only. No payment details or real money
                    are involved. Games appear in your library after the
                    simulated purchase; downloads are not included.
                  </p>
                </div>

                <p className="mt-5 text-center text-[10px] uppercase tracking-[0.18em] text-white/25">
                  Made for gamers · Built for discovery
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

