
import { useState } from "react";
import {
  Gamepad2,
  Search,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Discover", href: "/discover" },
  { label: "Categories", href: "/#genres" },
  { label: "New Releases", href: "/discover?ordering=-released" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8 lg:px-14">

        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5"
        >
          <Gamepad2 className="h-7 w-7 text-violet-400" />

          <span className="text-xl font-black tracking-[0.18em] text-white sm:text-2xl">
            NEXORA
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/65 transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* Search */}
          <Link
            to="/discover"
            onClick={closeMenu}
            aria-label="Search games"
            className="text-white/70 transition-colors hover:text-violet-300"
          >
            <Search size={21} />
          </Link>

          {/* Shopping cart */}
          <button
            type="button"
            aria-label="Shopping cart"
            title="Shopping cart"
            className="text-white/70 transition-colors hover:text-violet-300"
          >
            <ShoppingCart size={21} />
          </button>

          {/* Get Started — desktop */}
          <Link
            to="/register"
            onClick={closeMenu}
           className="hidden rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-500 sm:inline-flex"
          >
            Get Started
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="text-white sm:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="mx-4 rounded-2xl border border-white/10 bg-[#111016]/95 p-5 shadow-2xl backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="text-sm font-medium text-white/75 transition-colors hover:text-violet-300"
              >
                {link.label}
              </a>
            ))}

            <div className="h-px bg-white/10" />

            <Link
              to="/login"
              onClick={closeMenu}
              className="text-sm font-medium text-white/80 transition-colors hover:text-violet-300"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={closeMenu}
              className="rounded-full bg-violet-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
