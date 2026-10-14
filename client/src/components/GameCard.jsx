import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  LoaderCircle,
  ShoppingCart,
  Star,
} from "lucide-react";

import { addCartItem } from "../services/accountService";
import { getAuthToken } from "../services/authService";
import { formatPrice, getDemoPrice } from "../utils/gamePricing";

export default function GameCard({ game }) {
  const navigate = useNavigate();

  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartStatus, setCartStatus] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  const detailsPath = `/games/${game.id}`;
  const genres = game.genres ?? [];
  const price = getDemoPrice(game.id);

  const releaseDate = game.released
    ? new Date(`${game.released}T12:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Release date unavailable";

  async function handleAddToCart() {
    if (addingToCart) return;

    setCartMessage("");
    setCartStatus("");

    if (!getAuthToken()) {
      navigate("/login", {
        state: {
          authMessage: "Please log in to add games to your cart.",
        },
      });
      return;
    }

    setAddingToCart(true);

    try {
      const result = await addCartItem({
        gameId: String(game.id),
        slug: game.slug || "",
        name: game.name,
        backgroundImage: game.backgroundImage || "",
        price,
      });

      const alreadyInCart = /already in your cart/i.test(
        result.message || ""
      );

      setCartStatus(alreadyInCart ? "existing" : "added");
      setCartMessage(
        alreadyInCart ? "Already in your cart." : "Added to cart."
      );

      window.dispatchEvent(new Event("nexora-cart-updated"));
    } catch (error) {
      if (/already own/i.test(error.message || "")) {
        setCartStatus("owned");
        setCartMessage("You already own this game.");
      } else {
        setCartStatus("error");
        setCartMessage(
          error.message || "Unable to add this game to your cart."
        );
      }
    } finally {
      setAddingToCart(false);
    }
  }

  function toggleWishlist() {
    setWishlisted((value) => !value);
  }

  return (
    <article className="group min-w-0">
      {/* Artwork and wishlist control */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#171824]">
        <Link
          to={detailsPath}
          aria-label={`View details for ${game.name}`}
          className="relative block aspect-[16/10] overflow-hidden"
        >
          {game.backgroundImage ? (
            <img
              src={game.backgroundImage}
              alt={`${game.name} artwork`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#272238] to-[#11121a]">
              <span className="px-4 text-center text-sm font-semibold text-zinc-400">
                {game.name}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

          {/* Rating */}
          {Number(game.rating) > 0 && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <Star
                size={13}
                fill="currentColor"
                className="text-violet-300"
              />
              {Number(game.rating).toFixed(1)}
            </span>
          )}

          {/* Genre labels */}
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
            {genres.slice(0, 2).map((genre) => (
              <span
                key={genre.id ?? genre.slug ?? genre.name}
                className="rounded-sm border border-white/10 bg-black/50 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-zinc-200 backdrop-blur-md"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Hover indicator */}
          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${game.name} from wishlist`
              : `Add ${game.name} to wishlist`
          }
          aria-pressed={wishlisted}
          onClick={toggleWishlist}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/60 p-2 text-white backdrop-blur-md transition-colors hover:bg-violet-500"
        >
          <Heart
            size={16}
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-violet-300" : ""}
          />
        </button>
      </div>

      {/* Game information */}
      <div className="pt-3">
        <Link
          to={detailsPath}
          className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
        >
          <h3 className="line-clamp-2 min-h-11 text-sm font-semibold leading-5 text-zinc-100 transition-colors duration-300 group-hover:text-violet-300 sm:text-base">
            {game.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <span>{releaseDate}</span>
        </div>

        {/* Cart action */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white">
            {formatPrice(price)}
          </span>

          {cartStatus === "owned" ? (
            <Link
              to="/library"
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-2 text-[11px] font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/[0.12] sm:px-3 sm:text-xs"
            >
              In Library
              <ArrowRight size={13} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart || cartStatus === "added" || cartStatus === "existing"}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-violet-600 px-2.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-75 sm:px-3 sm:text-xs"
            >
              {addingToCart ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : cartStatus === "added" || cartStatus === "existing" ? (
                <Check size={14} />
              ) : (
                <ShoppingCart size={14} />
              )}

              {addingToCart
                ? "Adding..."
                : cartStatus === "added"
                  ? "Added"
                  : cartStatus === "existing"
                    ? "In Cart"
                    : "Add to Cart"}
            </button>
          )}
        </div>

        {cartMessage && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-2 text-[11px] leading-4 ${
              cartStatus === "error"
                ? "text-red-300"
                : cartStatus === "owned"
                  ? "text-emerald-200"
                  : "text-violet-200"
            }`}
          >
            {cartMessage}
          </p>
        )}

        {(cartStatus === "added" || cartStatus === "existing") && (
          <Link
            to="/cart"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-300 transition-colors hover:text-violet-200"
          >
            View cart
            <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </article>
  );
}

