
import Navbar from "./components/Navbar";
import CinematicHero from "./components/CinematicHero";
import TrendingGames from "./components/TrendingGames";

export default function App() {
  return (
    <main className="min-h-screen bg-[#090a0f] text-white">
      <Navbar />
      <CinematicHero />
      <TrendingGames />

      {/* Keep your existing genres section here */}
    </main>
  );
}
