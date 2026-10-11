
import { useState } from "react";
import {
  Gamepad2,
  Search,
  ShoppingCart,
  UserRound,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { label: "Discover", href: "#discover" },
  { label: "Categories", href: "#genres" },
  { label: "New Releases", href: "#new-releases" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#090a0f]/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <a
          href="#home"
          aria-label="NEXORA home"
          className="group flex items-center gap-2.5"
        >
          <Gamepad2
            size={28}
            className="text-violet-400 transition-transform duration-300 group-hover:rotate-[-8deg]"
          />

          <span className="text-xl font-black tracking-[0.18em] text-white">
            NEXORA
            <span className="text-violet-400">.</span>
          </span>
        </a>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Search games"
            className="text-zinc-300 transition-colors hover:text-violet-400"
          >
            <Search size={19} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="Shopping cart"
            className="text-zinc-300 transition-colors hover:text-violet-400"
          >
            <ShoppingCart size={19} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="Account"
            className="hidden text-zinc-300 transition-colors hover:text-violet-400 sm:block"
          >
            <UserRound size={19} strokeWidth={1.8} />
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="text-zinc-200 md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-white/[0.06] bg-[#0d0e15]/95 px-6 py-5 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-zinc-300 transition-colors hover:text-violet-400"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

