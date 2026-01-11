import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import SkillPage from "./pages/SkillPage";
import StatsPage from "./pages/StatsPage";
import { useEffect, useState } from "react";
import "./App.css";
import BackgroundSlideshow from "./components/BackgroundSlideshow";

export default function App() {

  const wallpapers = [
    "/images/backgrounds/bg1.jpg",
    "/images/backgrounds/bg2.jpg",
    "/images/backgrounds/bg3.jpg",
    "/images/backgrounds/bg4.jpg",
  ];


  const [dark, setDark] = useState(true); // dark mode default

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);


  return (
    <>
{/* Background slideshow */}
<BackgroundSlideshow images={wallpapers} interval={20000} />



      {/* Fixed Nav */}
      <header className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">
            🏆 Leaderboards
          </Link>
        </div>
        <nav className="navbar-right">
          <Link to="/skill" className="nav-link">
            Skill Rating Leaderboard
          </Link>
          <Link to="/stats" className="nav-link">
            Stats Leaderboard
          </Link>
          <button className="theme-toggle" onClick={() => setDark(d => !d)}>
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skill" element={<SkillPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </>
  );
}
