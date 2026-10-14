import { Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import GameDetails from "./pages/GameDetails";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Library from "./pages/Library";

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#090a0f] px-6 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
        404 · LOST IN SPACE
      </p>

      <h1 className="mt-5 text-4xl font-black sm:text-6xl">Wrong universe.</h1>

      <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
        This destination doesn't exist yet. Return home and discover another
        game.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-md bg-violet-500 px-5 py-3 text-sm font-bold transition-colors hover:bg-violet-400"
      >
        Return Home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/games/:id" element={<GameDetails />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/library" element= {<Library />} />
    </Routes>
  );
}
