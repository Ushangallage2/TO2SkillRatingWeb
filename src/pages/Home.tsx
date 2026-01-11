import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    async function loadVideo() {
      try {
        const res = await fetch("/.netlify/functions/commentary-game-video");
        const json = await res.json();
  
        console.log("VIDEO API RESPONSE:", json);
  
        // ✅ handle both response shapes
        const row =
          Array.isArray(json)
            ? json[0]
            : json?.Rows?.[0];
  
        if (row?.video_id) {
          setVideoId(row.video_id);
        }
      } catch (err) {
        console.error("Failed to load video", err);
      }
    }
  
    loadVideo();
  }, []);
  
  // calculate desired height once
const VIDEO_WIDTH = 500;
const VIDEO_HEIGHT = VIDEO_WIDTH * 12 / 16; // 16:9 aspect ratio


  return (
    <div
      style={{
        marginTop: 80,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 48,
        flexWrap: "wrap",
        padding: "0 24px",
      }}
    >
      {/* LEFT SIDE */}
      <div style={{ textAlign: "center", minWidth: 320 }}>
        <h1>🏆 Player Leaderboards</h1>
        <p>Select a leaderboard</p>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <Link to="/skill">
            <button style={{ padding: "12px 24px", fontSize: 16 }}>
              Skill Rating Leaderboard
            </button>
          </Link>

          <Link to="/stats">
            <button style={{ padding: "12px 24px", fontSize: 16 }}>
              Statistical Leaderboard
            </button>
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE – VIDEO (FORCED VISIBLE) */}
      <div
  style={{
    width: VIDEO_WIDTH,
    flexShrink: 0,
    marginLeft: 150,
    minHeight: VIDEO_HEIGHT, // <-- same as iframe height
    background: "#111",
    borderRadius: 16,
    padding: 15,
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  }}
>
  {!videoId && (
    <div
      style={{
        height: VIDEO_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.5,
      }}
    >
      Loading video…
    </div>
  )}

  {videoId && !play && (
    <div
      onClick={() => setPlay(true)}
      className="yt-hover"
      style={{
        position: "relative",
        cursor: "pointer",
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
        height: VIDEO_HEIGHT, // <-- always same height
      }}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="Latest Match"
        style={{
          width: "100%",
          height: "100%", // <-- cover full container
          objectFit: "cover",
          display: "block",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          color: "#fff",
          textShadow: "0 6px 20px rgba(0,0,0,0.8)",
          pointerEvents: "none",
        }}
      >
        ▶
      </div>
    </div>
  )}

  {videoId && play && (
    <iframe
      width="100%"
      height={VIDEO_HEIGHT}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
      title="Latest Match Video"
      frameBorder="0"
      allow="autoplay; encrypted-media"
      allowFullScreen
      style={{ borderRadius: 12 }}
    />
  )}

  <div
    style={{
      marginTop: 10,
      fontSize: 13,
      opacity: 0.85,
      textAlign: "center",
    }}
  >
    🎬 MAYHAM official Video
  </div>
</div>

      {/* HOVER EFFECT */}
      <style>
        {`
          .yt-hover:hover {
            transform: scale(1.04);
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.3),
              0 0 32px rgba(0,150,255,0.7);
          }
        `}
      </style>
    </div>
  );
}
