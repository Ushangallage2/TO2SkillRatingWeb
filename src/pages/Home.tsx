import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>🏆 Player Leaderboards</h1>
      <p>Select a leaderboard</p>

      <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 20 }}>
        <Link to="/skill">
          <button style={{ padding: "12px 24px", fontSize: 16 }}>
            Skill Leaderboard
          </button>
        </Link>

        <Link to="/stats">
          <button style={{ padding: "12px 24px", fontSize: 16 }}>
            Statistical Leaderboard
          </button>
        </Link>
      </div>
    </div>
  );
}
