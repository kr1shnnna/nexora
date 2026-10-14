
import { useEffect, useRef, useState } from "react";
import {
  Gamepad2,
  Search,
  ShoppingCart,
  LibraryBig,
  Menu,
  X,
  UserRound,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";

const navLinks = [
  { label: "Discover", href: "/discover" },
  { label: "Categories", href: "/#genres" },
  { label: "New Releases", href: "/discover?ordering=-released" },
];

export default function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser());

  const profileRef = useRef(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  // Synchronize navbar with login/logout changes.
  useEffect(() => {
    function syncUser() {
      setUser(getCurrentUser());
    }

    window.addEventListener("nexora-auth-changed", syncUser);
    window.addEventListener("pageshow", syncUser);

    return () => {
      window.removeEventListener("nexora-auth-changed", syncUser);
      window.removeEventListener("pageshow", syncUser);
    };
  }, []);

  // Close profile dropdown when clicking outside.
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  function handleLogout() {
    logoutUser();

    setUser(null);
    setProfileOpen(false);
    closeMenu();

    navigate("/", { replace: true });
  }

  function handleNavigation() {
    closeMenu();
    setProfileOpen(false);
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8 lg:px-14">

        {/* NEXORA Brand */}
        <Link
          to="/"
          onClick={handleNavigation}
          aria-label="NEXORA home"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <Gamepad2 className="h-7 w-7 text-violet-400 transition-transform duration-300 ease-out group-hover:rotate-[-12deg] group-hover:scale-110" />

          <span className="text-xl font-black tracking-[0.18em] text-white sm:text-2xl">
            NEXORA
          </span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Navbar Actions */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* Search */}
          <Link
            to="/discover"
            onClick={handleNavigation}
            aria-label="Search games"
            title="Discover games"
            className="text-white/70 transition-colors duration-300 hover:text-violet-300"
          >
            <Search size={21} />
          </Link>

          {/* Shopping Cart */}
          <Link
            to="/cart"
            onClick={handleNavigation}
            aria-label="View shopping cart"
            title="Shopping cart"
            className="text-white/70 transition-colors duration-300 hover:text-violet-300"
          >
            <ShoppingCart size={21} />
          </Link>

          {/* My Library */}
          <Link
            to="/library"
            onClick={handleNavigation}
            aria-label="My Library"
            title="My Library"
            className="hidden text-white/70 transition-colors duration-300 hover:text-violet-300 sm:inline-flex"
          >
            <LibraryBig size={21} />
          </Link>

          {/* Logged-in Profile or Get Started */}
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-2.5 transition-colors duration-300 hover:border-violet-400/40 hover:bg-white/[0.07] sm:gap-2.5 sm:pr-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-violet-200">
                  <UserRound size={18} />
                </span>

                <span className="hidden max-w-28 truncate text-sm font-semibold text-white sm:inline">
                  {user.username}
                </span>

                <ChevronDown
                  size={15}
                  className={`hidden text-white/50 transition-transform duration-300 sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full z-[70] mt-3 w-64 rounded-2xl border border-white/10 bg-[#111016]/95 p-4 shadow-2xl backdrop-blur-xl">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    My Account
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-200">
                      <UserRound size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.username}
                      </p>

                      <p className="truncate text-xs text-white/45">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-white/10" />

                  <Link
                    to="/library"
                    onClick={handleNavigation}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-violet-300"
                  >
                    <LibraryBig size={17} />
                    My Library
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/register"
              onClick={handleNavigation}
              className="hidden rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-500 sm:inline-flex"
            >
              Get Started
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open);
              setProfileOpen(false);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="text-white transition-colors duration-300 hover:text-violet-300 lg:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="mx-4 rounded-2xl border border-white/10 bg-[#111016]/95 p-5 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="text-sm font-medium text-white/75 transition-colors duration-300 hover:text-violet-300"
              >
                {link.label}
              </a>
            ))}

            <Link
              to="/library"
              onClick={handleNavigation}
              className="flex items-center gap-2 text-sm font-medium text-white/75 transition-colors duration-300 hover:text-violet-300"
            >
              <LibraryBig size={17} />
              My Library
            </Link>

            <Link
              to="/cart"
              onClick={handleNavigation}
              className="flex items-center gap-2 text-sm font-medium text-white/75 transition-colors duration-300 hover:text-violet-300"
            >
              <ShoppingCart size={17} />
              Shopping Cart
            </Link>

            <div className="h-px bg-white/10" />

            {user ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user.username}
                  </p>

                  <p className="mt-1 break-all text-xs text-white/45">
                    {user.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-violet-300"
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={handleNavigation}
                  className="text-sm font-medium text-white/80 transition-colors hover:text-violet-300"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={handleNavigation}
                  className="rounded-full bg-violet-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-500"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

