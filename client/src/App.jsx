
import { useState } from "react";

import Navbar from "./components/Navbar";
import CinematicHero from "./components/CinematicHero";
import GenreExplorer from "./components/GenreExplorer";
import TrendingGames from "./components/TrendingGames";

export default function App() {
  const [selectedGenre, setSelectedGenre] = useState(null);

  return (
    <main className="min-h-screen bg-[#090a0f] text-white">
      <Navbar />

      <CinematicHero />

      <GenreExplorer
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
      />

      <TrendingGames
        selectedGenre={selectedGenre}
        onClearGenre={() => setSelectedGenre(null)}
      />

      <footer className="border-t border-white/[0.07] bg-[#090a0f] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-black tracking-[0.18em] text-white">
            NEXORA<span className="text-violet-400">.</span>
          </span>

          <p className="text-xs text-zinc-500">
            Discover new worlds. Find your next obsession.
          </p>

          <p className="text-xs text-zinc-600">
            Game discovery experience powered by RAWG.
          </p>
        </div>
      </footer>
    </main>
  );
}
