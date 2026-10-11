
import { Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Navbar from "./components/Navbar";

function ComingSoon() {
  return (
    <main className="min-h-screen bg-[#090a0f] text-white">
      <Navbar />

      <section className="flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="max-w-lg text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
            NEXT CHAPTER
          </p>

          <h1 className="mt-5 text-4xl font-black sm:text-6xl">
            Game details<span className="text-violet-400">.</span>
          </h1>

          <p className="mt-5 text-sm leading-7 text-zinc-400">
            We're building the individual game experience next.
            Browse the collection while we prepare it.
          </p>

          <Link
            to="/discover"
            className="mt-8 inline-flex rounded-md bg-violet-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-400"
          >
            Back to Discover
          </Link>
        </div>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#090a0f] px-6 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
        404 · LOST IN SPACE
      </p>

      <h1 className="mt-5 text-5xl font-black">Wrong universe.</h1>

      <Link
        to="/"
        className="mt-8 rounded-md bg-violet-500 px-5 py-3 text-sm font-bold hover:bg-violet-400"
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
      <Route path="/games/:id" element={<ComingSoon />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
